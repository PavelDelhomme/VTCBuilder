"""
Analytics views for tracking and retrieving user actions
"""
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from api.utils import add_cors_headers
from django.db.models import Count, Q, Sum
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
        if hasattr(user, 'tenant'):
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
            if not request.data.get('tenant') and hasattr(request.user, 'tenant'):
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
        elif hasattr(user, 'tenant'):
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
        
        if hasattr(user, 'tenant'):
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
        elif hasattr(request.user, 'tenant'):
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
        
        response = Response({
            'most_used_actions': list(most_used_actions),
            'actions_by_resource': list(actions_by_resource),
            'feature_usage_stats': list(feature_usage_stats),
            'actions_timeline': actions_timeline,
            'most_clicked_ctas': list(most_clicked_ctas),
            'buttons_by_user': list(buttons_by_user),
            'most_viewed_pages': list(most_viewed_pages),
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

