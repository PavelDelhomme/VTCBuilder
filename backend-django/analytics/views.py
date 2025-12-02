"""
Analytics views for tracking and retrieving user actions
"""
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from api.utils import add_cors_headers
from django.db.models import Count, Q, Sum, Max
from django.utils import timezone
from datetime import timedelta
from .models import UserAction, FeatureUsage
from .serializers import UserActionSerializer, FeatureUsageSerializer
import logging

logger = logging.getLogger(__name__)


class UserActionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for tracking and retrieving user actions
    """
    queryset = UserAction.objects.all()
    serializer_class = UserActionSerializer
    permission_classes = [AllowAny]  # Permettre le tracking même pour les visiteurs anonymes
    
    def get_queryset(self):
        """Filter actions based on user role"""
        user = self.request.user
        
        # Si non authentifié, retourner vide (seuls les admins peuvent voir)
        if not user.is_authenticated:
            return UserAction.objects.none()
        
        queryset = UserAction.objects.all()
        
        # Super admin can see all actions
        if user.is_super_admin():
            return queryset
        
        # Tenant admin can see actions from their tenant
        if hasattr(user, 'tenant') and user.tenant is not None:
            queryset = queryset.filter(tenant=user.tenant)
        else:
            queryset = queryset.filter(user=user)
        
        return queryset.order_by('-created_at')
    
    def create(self, request, *args, **kwargs):
        """Create a new user action - accessible without authentication for public tracking"""
        # Auto-fill user if authenticated
        if request.user.is_authenticated:
            if not request.data.get('user'):
                request.data['user'] = request.user.id
            # Vérifier que tenant existe et n'est pas None avant d'accéder à .id
            if not request.data.get('tenant'):
                if hasattr(request.user, 'tenant') and request.user.tenant is not None:
                    request.data['tenant'] = request.user.tenant.id
        
        # Détecter le tenant depuis le domaine si non fourni
        if not request.data.get('tenant'):
            tenant = self.detect_tenant_from_domain(request)
            if tenant:
                request.data['tenant'] = tenant.id
        
        # Auto-fill IP and user agent
        if not request.data.get('ip_address'):
            request.data['ip_address'] = self.get_client_ip(request)
        if not request.data.get('user_agent'):
            request.data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
        
        response = super().create(request, *args, **kwargs)
        add_cors_headers(response, request)
        return response
    
    def detect_tenant_from_domain(self, request):
        """Détecter le tenant depuis le domaine de la requête"""
        try:
            host = request.META.get('HTTP_HOST', '')
            if not host:
                return None
            
            # Extraire le sous-domaine (ex: demo-vtc.localhost -> demo-vtc)
            parts = host.split('.')
            if len(parts) >= 2:
                subdomain = parts[0]
                if subdomain and subdomain != 'www' and subdomain != 'localhost' and subdomain != '127':
                    from tenants.models import Tenant, Domain
                    try:
                        # Chercher par slug
                        tenant = Tenant.objects.filter(slug=subdomain, deleted_at__isnull=True).first()
                        if tenant:
                            return tenant
                        # Chercher par domaine personnalisé
                        domain = Domain.objects.filter(domain=host, tenant__deleted_at__isnull=True).first()
                        if domain:
                            return domain.tenant
                    except Exception:
                        pass
        except Exception:
            pass
        return None
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get usage statistics"""
        user = request.user
        
        # Filter based on user role
        if user.is_super_admin():
            queryset = UserAction.objects.all()
        elif hasattr(user, 'tenant') and user.tenant is not None:
            queryset = UserAction.objects.filter(tenant=user.tenant)
        else:
            queryset = UserAction.objects.filter(user=user)
        
        now = timezone.now()
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        this_week = today - timedelta(days=today.weekday())
        this_month = today.replace(day=1)
        
        # Actions by type
        actions_by_type = queryset.values('action_type').annotate(
            count=Count('id')
        ).order_by('-count')[:20]
        
        # Most used features
        most_used_features = queryset.filter(
            action_type__in=['feature_use', 'block_add', 'page_create', 'service_create']
        ).values('action_name').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # Actions over time
        actions_today = queryset.filter(created_at__gte=today).count()
        actions_this_week = queryset.filter(created_at__gte=this_week).count()
        actions_this_month = queryset.filter(created_at__gte=this_month).count()
        
        # Most active users (if super admin)
        most_active_users = []
        if user.is_super_admin():
            most_active_users = queryset.values('user__email', 'user__first_name', 'user__last_name').annotate(
                count=Count('id')
            ).order_by('-count')[:10]
        
        # Most active tenants (if super admin)
        most_active_tenants = []
        if user.is_super_admin():
            most_active_tenants = queryset.values('tenant__name').annotate(
                count=Count('id')
            ).order_by('-count')[:10]
        
        response = Response({
            'actions_by_type': list(actions_by_type),
            'most_used_features': list(most_used_features),
            'actions_today': actions_today,
            'actions_this_week': actions_this_week,
            'actions_this_month': actions_this_month,
            'most_active_users': list(most_active_users),
            'most_active_tenants': list(most_active_tenants),
        })
        add_cors_headers(response, request)
        return response


class FeatureUsageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for tracking feature usage
    """
    queryset = FeatureUsage.objects.all()
    serializer_class = FeatureUsageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter feature usage based on user role"""
        user = self.request.user
        
        if user.is_super_admin():
            return FeatureUsage.objects.all()
        
        if hasattr(user, 'tenant') and user.tenant is not None:
            return FeatureUsage.objects.filter(tenant=user.tenant)
        
        return FeatureUsage.objects.none()
    
    @action(detail=False, methods=['post'])
    def track(self, request):
        """Track a feature usage"""
        feature_name = request.data.get('feature_name')
        tenant_id = request.data.get('tenant_id')
        
        if not feature_name:
            return Response({'error': 'feature_name is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get tenant
        if tenant_id:
            from tenants.models import Tenant
            try:
                tenant = Tenant.objects.get(id=tenant_id)
            except Tenant.DoesNotExist:
                return Response({'error': 'Tenant not found'}, status=status.HTTP_404_NOT_FOUND)
        elif hasattr(request.user, 'tenant') and request.user.tenant is not None:
            tenant = request.user.tenant
        else:
            return Response({'error': 'Tenant is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update or create feature usage
        feature_usage, created = FeatureUsage.objects.get_or_create(
            tenant=tenant,
            feature_name=feature_name,
            defaults={'usage_count': 1, 'last_used_at': timezone.now()}
        )
        
        if not created:
            feature_usage.usage_count += 1
            feature_usage.last_used_at = timezone.now()
            feature_usage.save()
        
        response = Response({
            'feature_name': feature_name,
            'usage_count': feature_usage.usage_count,
            'last_used_at': feature_usage.last_used_at,
        })
        add_cors_headers(response, request)
        return response


@api_view(['GET', 'OPTIONS'])
@permission_classes([AllowAny])  # Allow OPTIONS for CORS preflight, check auth in function
def usage_stats(request):
    """Get comprehensive usage statistics"""
    # Handle OPTIONS request for CORS
    if request.method == 'OPTIONS':
        response = Response()
        add_cors_headers(response, request)
        return response
    
    try:
        user = request.user
        
        if not user.is_super_admin():
            return Response(
                {'error': 'Only super admin can view usage stats'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        now = timezone.now()
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        this_week = today - timedelta(days=today.weekday())
        this_month = today.replace(day=1)
        last_30_days = today - timedelta(days=30)
        
        # Get all actions
        all_actions = UserAction.objects.all()
        
        # Most used actions
        most_used_actions = all_actions.values('action_type', 'action_name').annotate(
            count=Count('id')
        ).order_by('-count')[:20]
        
        # Actions by resource type
        actions_by_resource = all_actions.exclude(resource_type='').values('resource_type').annotate(
            count=Count('id')
        ).order_by('-count')[:15]
        
        # Feature usage statistics
        feature_usage_stats = FeatureUsage.objects.values('feature_name').annotate(
            total_usage=Sum('usage_count'),
            tenant_count=Count('tenant', distinct=True)
        ).order_by('-total_usage')[:20]
        
        # Actions timeline (last 30 days)
        actions_timeline = []
        for i in range(29, -1, -1):
            day = today - timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            count = all_actions.filter(
                created_at__gte=day_start,
                created_at__lte=day_end
            ).count()
            
            actions_timeline.append({
                'date': day_start.strftime('%Y-%m-%d'),
                'label': day_start.strftime('%d/%m'),
                'count': count,
            })
        
        # Most clicked buttons/CTAs with user details
        most_clicked_ctas = all_actions.filter(
            action_type__in=['button_click', 'cta_click', 'link_click']
        ).values('action_name', 'resource_type', 'user__email', 'user__id', 'tenant__name').annotate(
            count=Count('id')
        ).order_by('-count')[:20]
        
        # Buttons clicked by user
        buttons_by_user = all_actions.filter(
            action_type__in=['button_click', 'cta_click', 'link_click']
        ).exclude(user__isnull=True).values(
            'user__email', 'user__id', 'user__first_name', 'user__last_name',
            'action_name', 'resource_type'
        ).annotate(
            count=Count('id')
        ).order_by('-count')[:50]
        
        # Most viewed pages
        most_viewed_pages = all_actions.filter(
            action_type='page_view'
        ).values('resource_id', 'metadata').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # Actions by user (detailed)
        actions_by_user = all_actions.exclude(user__isnull=True).values(
            'user__id', 'user__email', 'user__first_name', 'user__last_name'
        ).annotate(
            total_actions=Count('id'),
            page_views=Count('id', filter=Q(action_type='page_view')),
            button_clicks=Count('id', filter=Q(action_type__in=['button_click', 'cta_click'])),
            link_clicks=Count('id', filter=Q(action_type='link_click')),
            page_creates=Count('id', filter=Q(action_type='page_create')),
            block_actions=Count('id', filter=Q(action_type__in=['block_add', 'block_edit', 'block_delete'])),
            last_action=Max('created_at')
        ).order_by('-total_actions')[:50]
        
        # Add tenant info separately to avoid NoneType errors
        for user_action in actions_by_user:
            user_id = user_action['user__id']
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                user = User.objects.get(id=user_id)
                if hasattr(user, 'tenant') and user.tenant is not None:
                    user_action['tenant__name'] = user.tenant.name
                    user_action['tenant__id'] = user.tenant.id
                else:
                    user_action['tenant__name'] = None
                    user_action['tenant__id'] = None
            except Exception:
                user_action['tenant__name'] = None
                user_action['tenant__id'] = None
        
        # Actions by tenant (detailed)
        actions_by_tenant = all_actions.exclude(tenant__isnull=True).values(
            'tenant__id', 'tenant__name', 'tenant__email'
        ).annotate(
            total_actions=Count('id'),
            unique_users=Count('user', distinct=True),
            page_views=Count('id', filter=Q(action_type='page_view')),
            button_clicks=Count('id', filter=Q(action_type__in=['button_click', 'cta_click'])),
            link_clicks=Count('id', filter=Q(action_type='link_click')),
            page_creates=Count('id', filter=Q(action_type='page_create')),
            block_actions=Count('id', filter=Q(action_type__in=['block_add', 'block_edit', 'block_delete'])),
            last_action=Max('created_at')
        ).order_by('-total_actions')[:30]
        
        # Actions by category (grouped)
        actions_by_category = {
            'navigation': all_actions.filter(action_type__in=['page_view', 'link_click']).count(),
            'content_creation': all_actions.filter(action_type__in=['page_create', 'page_edit', 'block_add', 'block_edit']).count(),
            'content_deletion': all_actions.filter(action_type__in=['page_delete', 'block_delete']).count(),
            'interactions': all_actions.filter(action_type__in=['button_click', 'cta_click', 'form_submit']).count(),
            'authentication': all_actions.filter(action_type__in=['login', 'logout', 'register']).count(),
            'business': all_actions.filter(action_type__in=['service_create', 'service_edit', 'booking_create', 'booking_edit']).count(),
            'billing': all_actions.filter(action_type__in=['subscription_create', 'subscription_update', 'payment_success', 'payment_failed']).count(),
        }
        
        # Documentation pages tracking
        docs_actions = all_actions.filter(
            Q(action_type='page_view') & (
                Q(metadata__path__icontains='/docs') |
                Q(metadata__path__icontains='/documentation') |
                Q(resource_type='docs_page')
            )
        )
        docs_stats = {
            'total_views': docs_actions.count(),
            'unique_users': docs_actions.values('user').distinct().count(),
            'most_viewed_docs': docs_actions.values('resource_id', 'metadata').annotate(
                count=Count('id')
            ).order_by('-count')[:10],
            'views_by_day': []
        }
        # Docs views by day (last 30 days)
        for i in range(29, -1, -1):
            day = today - timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day.replace(hour=23, minute=59, second=59, microsecond=999999)
            count = docs_actions.filter(created_at__gte=day_start, created_at__lte=day_end).count()
            docs_stats['views_by_day'].append({
                'date': day_start.strftime('%Y-%m-%d'),
                'label': day_start.strftime('%d/%m'),
                'count': count,
            })
        
        # Public site actions (main site, not tenant sites)
        public_site_actions = all_actions.filter(tenant__isnull=True)
        public_site_stats = {
            'total_actions': public_site_actions.count(),
            'page_views': public_site_actions.filter(action_type='page_view').count(),
            'button_clicks': public_site_actions.filter(action_type__in=['button_click', 'cta_click']).count(),
            'link_clicks': public_site_actions.filter(action_type='link_click').count(),
            'most_visited_pages': public_site_actions.filter(action_type='page_view').values(
                'resource_id', 'metadata'
            ).annotate(count=Count('id')).order_by('-count')[:10],
        }
        
        # Tenant site actions
        tenant_site_actions = all_actions.exclude(tenant__isnull=True)
        tenant_site_stats = {
            'total_actions': tenant_site_actions.count(),
            'unique_tenants': tenant_site_actions.values('tenant').distinct().count(),
            'page_views': tenant_site_actions.filter(action_type='page_view').count(),
            'button_clicks': tenant_site_actions.filter(action_type__in=['button_click', 'cta_click']).count(),
            'link_clicks': tenant_site_actions.filter(action_type='link_click').count(),
        }
        
        # Actions by hour of day (for pattern analysis)
        actions_by_hour = []
        for hour in range(24):
            count = all_actions.filter(created_at__hour=hour).count()
            actions_by_hour.append({
                'hour': hour,
                'label': f'{hour:02d}h',
                'count': count,
            })
        
        # Actions by day of week (for pattern analysis)
        actions_by_day_of_week = []
        days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
        for day_num in range(7):
            count = all_actions.filter(created_at__week_day=day_num + 2).count()  # Django uses 1=Sunday, so +2
            actions_by_day_of_week.append({
                'day': day_num,
                'label': days[day_num],
                'count': count,
            })
        
        # Top links clicked (with URLs from metadata)
        top_links = all_actions.filter(
            action_type='link_click'
        ).exclude(metadata__url__isnull=True).values('metadata__url', 'action_name').annotate(
            count=Count('id')
        ).order_by('-count')[:20]
        
        # Anonymous vs authenticated users
        user_type_stats = {
            'anonymous': all_actions.filter(user__isnull=True).count(),
            'authenticated': all_actions.exclude(user__isnull=True).count(),
        }
        
        response = Response({
            'most_used_actions': list(most_used_actions),
            'actions_by_resource': list(actions_by_resource),
            'feature_usage_stats': list(feature_usage_stats),
            'actions_timeline': actions_timeline,
            'most_clicked_ctas': list(most_clicked_ctas),
            'buttons_by_user': list(buttons_by_user),
            'most_viewed_pages': list(most_viewed_pages),
            'actions_by_user': list(actions_by_user),
            'actions_by_tenant': list(actions_by_tenant),
            'actions_by_category': actions_by_category,
            'docs_stats': docs_stats,
            'public_site_stats': public_site_stats,
            'tenant_site_stats': tenant_site_stats,
            'actions_by_hour': actions_by_hour,
            'actions_by_day_of_week': actions_by_day_of_week,
            'top_links': list(top_links),
            'user_type_stats': user_type_stats,
            'summary': {
                'total_actions': all_actions.count(),
                'actions_today': all_actions.filter(created_at__gte=today).count(),
                'actions_this_week': all_actions.filter(created_at__gte=this_week).count(),
                'actions_this_month': all_actions.filter(created_at__gte=this_month).count(),
                'actions_last_30_days': all_actions.filter(created_at__gte=last_30_days).count(),
            }
        })
        add_cors_headers(response, request)
        return response
    except Exception as e:
        logger.error(f"Error in usage_stats: {e}", exc_info=True)
        error_response = Response({
            'error': 'An error occurred while fetching usage statistics',
            'message': str(e) if hasattr(request, 'DEBUG') and request.DEBUG else 'Unable to load usage statistics',
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        add_cors_headers(error_response, request)
        return error_response

