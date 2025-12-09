"""
General API views
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.db import connection
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
# Tenant and User models are imported locally in methods to avoid UnboundLocalError
# from tenants.models import Tenant, User  # Commented out to prevent shadowing issues
from api.utils import add_cors_headers
import logging

logger = logging.getLogger(__name__)


class DashboardView(APIView):
    """Dashboard view with basic statistics"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get dashboard statistics"""
        try:
            # Handle OPTIONS request for CORS preflight
            if request.method == 'OPTIONS':
                response = Response()
                add_cors_headers(response, request)
                return response
            
            user = request.user

            # Base stats with all required fields
            stats = {
                'total_tenants': 0,
                'active_tenants': 0,
                'trial_tenants': 0,
                'total_users': 0,
                'monthly_revenue': 0,
            }

            if user.is_super_admin():
                # Super admin sees all stats (exclude soft-deleted tenants)
                try:
                    from tenants.models import Tenant as TenantModel, User as UserModel
                    now = timezone.now()
                    trial_tenants = TenantModel.objects.filter(status='trial', deleted_at__isnull=True)
                    
                    stats.update({
                        'total_tenants': TenantModel.objects.filter(deleted_at__isnull=True).count(),
                        'active_tenants': TenantModel.objects.filter(status='active', deleted_at__isnull=True).count(),
                        'trial_tenants': trial_tenants.count(),
                        'total_users': UserModel.objects.count(),
                    })
                    
                    # Count trials expiring soon (within 7 days) with details
                    try:
                        from billing.models import Subscription
                        from datetime import timedelta
                        expiring_trials = Subscription.objects.filter(
                            status='trial',
                            trial_end__lte=now + timedelta(days=7),
                            trial_end__gt=now
                        ).select_related('tenant', 'plan')
                        stats['trials_expiring_soon'] = expiring_trials.count()
                        
                        # Add list of trials expiring soon with details
                        trials_expiring_soon_list = []
                        for sub in expiring_trials[:10]:  # Limit to 10
                            days_remaining = (sub.trial_end - now).days
                            trials_expiring_soon_list.append({
                                'tenant_id': sub.tenant.id,
                                'tenant_name': sub.tenant.name,
                                'plan_name': sub.plan.name,
                                'trial_end': sub.trial_end.isoformat(),
                                'days_remaining': days_remaining,
                            })
                        stats['trials_expiring_soon_list'] = trials_expiring_soon_list
                    except ImportError:
                        # Count from tenant trial_ends_at if billing not available
                        from datetime import timedelta
                        expiring_tenants = trial_tenants.filter(
                            trial_ends_at__lte=now + timedelta(days=7),
                            trial_ends_at__gt=now
                        )
                        stats['trials_expiring_soon'] = expiring_tenants.count()
                        
                        # Add list from tenants
                        trials_expiring_soon_list = []
                        for tenant in expiring_tenants[:10]:
                            days_remaining = (tenant.trial_ends_at - now).days
                            trials_expiring_soon_list.append({
                                'tenant_id': tenant.id,
                                'tenant_name': tenant.name,
                                'plan_name': tenant.plan,
                                'trial_end': tenant.trial_ends_at.isoformat(),
                                'days_remaining': days_remaining,
                            })
                        stats['trials_expiring_soon_list'] = trials_expiring_soon_list
                    except Exception as e:
                        logger.warning(f"Error counting expiring trials: {e}")
                        stats['trials_expiring_soon'] = 0
                        stats['trials_expiring_soon_list'] = []
                    
                    # Calculate monthly revenue if billing is available
                    try:
                        from billing.models import Invoice
                        from django.db.models import Sum
                        monthly_revenue = Invoice.objects.filter(
                            status='paid',
                            created_at__month=timezone.now().month,
                            created_at__year=timezone.now().year
                        ).aggregate(total=Sum('total'))['total'] or 0
                        stats['monthly_revenue'] = float(monthly_revenue)
                    except ImportError:
                        stats['monthly_revenue'] = 0
                    except Exception as e:
                        logger.warning(f"Error calculating monthly revenue: {e}")
                        stats['monthly_revenue'] = 0
                except Exception as e:
                    logger.error(f"Error fetching super admin stats: {e}", exc_info=True)

            elif hasattr(user, 'tenant') and user.tenant:
                # Tenant admin sees tenant-specific stats
                tenant = user.tenant

                # Count related objects for this tenant
                try:
                    # Switch to tenant context for counting
                    from django_tenants.utils import tenant_context
                    from pages.models import Page
                    from services.models import Service
                    from bookings.models import Booking
                    
                    with tenant_context(tenant):
                        stats.update({
                            'total_pages': Page.objects.count(),
                            'total_services': Service.objects.count(),
                            'total_bookings': Booking.objects.count(),
                        })
                except Exception as e:
                    logger.error(f"Error fetching tenant stats: {e}", exc_info=True)

            # Retourner les stats dans un objet 'stats' pour cohérence avec le frontend
            response = Response({'stats': stats})
            add_cors_headers(response, request)
            return response
        except Exception as e:
            logger.error(f"Error in DashboardView: {e}", exc_info=True)
            error_response = Response({
                'error': 'An error occurred while fetching dashboard statistics'
            }, status=500)
            add_cors_headers(error_response, request)
            return error_response


class DetailedStatsView(APIView):
    """Detailed statistics view for super admin"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get detailed statistics"""
        try:
            # Handle OPTIONS request for CORS preflight
            if request.method == 'OPTIONS':
                response = Response()
                add_cors_headers(response, request)
                return response
            
            user = request.user
            
            if not user.is_super_admin():
                error_response = Response({
                    'error': 'Only super admin can access detailed statistics'
                }, status=403)
                add_cors_headers(error_response, request)
                return error_response
            
            # Import models with aliases to avoid any potential shadowing issues
            # Use explicit imports to prevent UnboundLocalError
            from tenants.models import Tenant as TenantModel, User as UserModel
            # Ensure we never use the global Tenant/User directly, only TenantModel/UserModel
            
            # Get detailed stats - structure correspondant à ce que le frontend attend
            stats = {
                'overview': {
                    'total_tenants': TenantModel.objects.filter(deleted_at__isnull=True).count(),
                    'active_tenants': TenantModel.objects.filter(status='active', deleted_at__isnull=True).count(),
                    'suspended_tenants': TenantModel.objects.filter(status='suspended', deleted_at__isnull=True).count(),
                    'trial_tenants': TenantModel.objects.filter(status='trial', deleted_at__isnull=True).count(),
                    'cancelled_tenants': TenantModel.objects.filter(status='cancelled', deleted_at__isnull=True).count(),
                    'total_users': UserModel.objects.count(),
                    'active_users': UserModel.objects.filter(status='active').count(),
                    'suspended_users': UserModel.objects.filter(status='suspended').count(),
                    'inactive_users': UserModel.objects.filter(status='inactive').count(),
                },
                'activity': {
                    'tenants_today': TenantModel.objects.filter(
                        created_at__date=timezone.now().date(),
                        deleted_at__isnull=True
                    ).count(),
                    'users_today': UserModel.objects.filter(
                        created_at__date=timezone.now().date()
                    ).count(),
                    'tenants_this_week': TenantModel.objects.filter(
                        created_at__gte=timezone.now() - timedelta(days=7),
                        deleted_at__isnull=True
                    ).count(),
                    'users_this_week': UserModel.objects.filter(
                        created_at__gte=timezone.now() - timedelta(days=7)
                    ).count(),
                    'tenants_this_month': TenantModel.objects.filter(
                        created_at__gte=timezone.now() - timedelta(days=30),
                        deleted_at__isnull=True
                    ).count(),
                    'users_this_month': UserModel.objects.filter(
                        created_at__gte=timezone.now() - timedelta(days=30)
                    ).count(),
                    'recently_suspended_users': UserModel.objects.filter(
                        status='suspended',
                        updated_at__gte=timezone.now() - timedelta(days=7)
                    ).count(),
                    'password_resets_last_week': 0,  # TODO: Implémenter si nécessaire
                },
                'registrations': {
                    'pending_invitations': 0,  # TODO: Implémenter si nécessaire
                    'expired_invitations': 0,  # TODO: Implémenter si nécessaire
                    'users_by_day': [],  # TODO: Implémenter si nécessaire
                    'tenants_by_day': [],  # TODO: Implémenter si nécessaire
                },
                'recent_tenants': [],
                'recent_users': [],
                'users_by_role': [],
                'users_by_status': [],
                'tenants_by_plan': [],
                'tenants_by_status': [],
                'tenants_by_month': [],
                'users_by_month': [],
                'alerts': [],
                'blocks_usage': [],
                'templates_usage': [],
                'pages_stats': {},
                'services_stats': {},
                'bookings_stats': {},
            }
            
            # Try to get revenue stats if billing is available
            try:
                from billing.models import Subscription, Invoice
                from django.db.models import Sum
                
                active_subscriptions = Subscription.objects.filter(status='active')
                trial_subscriptions = Subscription.objects.filter(status='trial')
                
                stats['overview']['active_subscriptions'] = active_subscriptions.count()
                stats['overview']['trial_subscriptions'] = trial_subscriptions.count()
                stats['overview']['past_due_subscriptions'] = Subscription.objects.filter(status='past_due').count()
                stats['overview']['cancelled_subscriptions'] = Subscription.objects.filter(status='cancelled').count()
                stats['overview']['expiring_soon_subscriptions'] = Subscription.objects.filter(
                    status='active',
                    current_period_end__lte=timezone.now() + timedelta(days=7),
                    current_period_end__gt=timezone.now()
                ).count()
                
                # Add trial expiration info
                now = timezone.now()
                expiring_trials = trial_subscriptions.filter(
                    trial_end__lte=now + timedelta(days=7),
                    trial_end__gt=now
                )
                stats['overview']['trials_expiring_soon'] = expiring_trials.count()
                
                # Add list of trials expiring soon with details
                trials_expiring_soon_list = []
                for sub in expiring_trials.select_related('tenant', 'plan')[:10]:  # Limit to 10
                    days_remaining = (sub.trial_end - now).days
                    trials_expiring_soon_list.append({
                        'tenant_id': sub.tenant.id,
                        'tenant_name': sub.tenant.name,
                        'plan_name': sub.plan.name,
                        'trial_end': sub.trial_end.isoformat(),
                        'days_remaining': days_remaining,
                    })
                stats['trials_expiring_soon_list'] = trials_expiring_soon_list
                
                stats['revenue'] = {
                    'monthly': float(Invoice.objects.filter(
                        status='paid',
                        created_at__month=timezone.now().month,
                        created_at__year=timezone.now().year
                    ).aggregate(total=Sum('total'))['total'] or 0),
                    'total': float(Invoice.objects.filter(
                        status='paid'
                    ).aggregate(total=Sum('total'))['total'] or 0),
                    'by_month': [],  # TODO: Implémenter si nécessaire
                }
            except ImportError:
                stats['overview']['active_subscriptions'] = 0
                stats['overview']['trial_subscriptions'] = 0
                stats['overview']['past_due_subscriptions'] = 0
                stats['overview']['cancelled_subscriptions'] = 0
                stats['overview']['expiring_soon_subscriptions'] = 0
                stats['revenue'] = {
                    'monthly': 0,
                    'total': 0,
                    'by_month': [],
                }
            
            # Add blocks usage statistics - aggregate across all tenant schemas
            try:
                from pages.models import Page
                from collections import Counter
                from django_tenants.utils import tenant_context
                from django_tenants.utils import get_public_schema_name
                import json
                
                block_counter = Counter()
                
                # Vérifier qu'on n'est pas dans le schéma public (où les tables n'existent pas)
                current_schema = connection.schema_name if hasattr(connection, 'schema_name') else None
                public_schema = get_public_schema_name()
                
                # Iterate through all active tenants and aggregate block usage
                active_tenants = TenantModel.objects.filter(deleted_at__isnull=True)
                for tenant in active_tenants:
                    try:
                        with tenant_context(tenant):
                            all_pages = Page.objects.all()
                            for page in all_pages:
                                if page.blocks and isinstance(page.blocks, list):
                                    for block in page.blocks:
                                        if isinstance(block, dict) and 'type' in block:
                                            block_type = block.get('type', 'unknown')
                                            block_counter[block_type] += 1
                    except Exception as e:
                        # Ne logger que si ce n'est pas une erreur "relation does not exist" (normale dans public schema)
                        error_msg = str(e).lower()
                        # Vérifier si c'est une erreur "relation does not exist" (normale dans public schema)
                        if 'relation' in error_msg and 'does not exist' in error_msg:
                            # Ne pas logger, c'est normal dans le contexte multi-tenant
                            continue
                        logger.warning(f"Error calculating blocks usage for tenant {tenant.id}: {e}")
                        continue
                
                # Get top 10 most used blocks
                stats['blocks_usage'] = [
                    {'block_type': block_type, 'count': count}
                    for block_type, count in block_counter.most_common(10)
                ]
            except Exception as e:
                # Ne logger que si ce n'est pas une erreur "relation does not exist" (normale dans public schema)
                error_msg = str(e).lower()
                # Vérifier si c'est une erreur "relation does not exist" (normale dans public schema)
                if 'relation' in error_msg and 'does not exist' in error_msg:
                    # Ne pas logger, c'est normal dans le contexte multi-tenant
                    pass
                else:
                    logger.warning(f"Error calculating blocks usage: {e}")
                stats['blocks_usage'] = []
            
            # Add templates usage statistics
            try:
                from media.models import Template
                from django_tenants.utils import tenant_context
                
                # Get templates from the public website tenant (vtcbuilder-public-website)
                templates_usage = []
                # Use TenantModel (imported at the start of get() method)
                # Use the public website tenant for templates
                reference_tenant = TenantModel.objects.filter(
                    slug='vtcbuilder-public-website',
                    deleted_at__isnull=True
                ).first()
                if not reference_tenant:
                    # Fallback to first active tenant (exclude public schema)
                    reference_tenant = TenantModel.objects.filter(
                        deleted_at__isnull=True,
                        status='active'
                    ).exclude(schema_name='public').first()
                if reference_tenant:
                    try:
                        with tenant_context(reference_tenant):
                            templates = Template.objects.filter(is_active=True).order_by('-usage_count')[:10]
                            templates_usage = [
                                {
                                    'id': t.id,
                                    'name': t.name,
                                    'slug': t.slug,
                                    'category': t.category,
                                    'usage_count': t.usage_count,
                                }
                                for t in templates
                            ]
                    except Exception as e:
                        # Silently ignore "relation does not exist" errors (normal for public schema)
                        error_msg = str(e).lower()
                        if 'relation' not in error_msg or 'does not exist' not in error_msg:
                            logger.warning(f"Error calculating templates usage for tenant {reference_tenant.id}: {e}")
                stats['templates_usage'] = templates_usage
            except Exception as e:
                # Silently ignore "relation does not exist" errors (normal for public schema)
                error_msg = str(e).lower()
                if 'relation' not in error_msg or 'does not exist' not in error_msg:
                    logger.warning(f"Error calculating templates usage: {e}")
                stats['templates_usage'] = []
            
            # Add pages statistics - aggregate across all tenant schemas
            try:
                from pages.models import Page
                from django_tenants.utils import tenant_context
                
                pages_stats = {
                    'total': 0,
                    'published': 0,
                    'draft': 0,
                    'scheduled': 0,
                    'homepages': 0,
                    'created_today': 0,
                    'created_this_week': 0,
                    'created_this_month': 0,
                }
                
                # Iterate through all active tenants and aggregate stats (exclude public schema)
                active_tenants = TenantModel.objects.filter(deleted_at__isnull=True).exclude(schema_name='public')
                for tenant in active_tenants:
                    try:
                        with tenant_context(tenant):
                            pages_stats['total'] += Page.objects.count()
                            pages_stats['published'] += Page.objects.filter(status='published').count()
                            pages_stats['draft'] += Page.objects.filter(status='draft').count()
                            pages_stats['scheduled'] += Page.objects.filter(status='scheduled').count()
                            pages_stats['homepages'] += Page.objects.filter(is_homepage=True).count()
                            pages_stats['created_today'] += Page.objects.filter(created_at__date=timezone.now().date()).count()
                            pages_stats['created_this_week'] += Page.objects.filter(created_at__gte=timezone.now() - timedelta(days=7)).count()
                            pages_stats['created_this_month'] += Page.objects.filter(created_at__gte=timezone.now() - timedelta(days=30)).count()
                    except Exception as e:
                        # Silently ignore "relation does not exist" errors (shouldn't happen if we exclude public, but just in case)
                        error_msg = str(e).lower()
                        if 'relation' not in error_msg or 'does not exist' not in error_msg:
                            logger.warning(f"Error calculating pages stats for tenant {tenant.id}: {e}")
                        continue
                
                stats['pages_stats'] = pages_stats
            except Exception as e:
                # Ne logger que si ce n'est pas une erreur "relation does not exist" (normale dans public schema)
                error_msg = str(e).lower()
                # Vérifier si c'est une erreur "relation does not exist" (normale dans public schema)
                if 'relation' in error_msg and 'does not exist' in error_msg:
                    # Ne pas logger, c'est normal dans le contexte multi-tenant
                    pass
                else:
                    logger.warning(f"Error calculating pages stats: {e}")
                stats['pages_stats'] = {}
            
            # Add services statistics - aggregate across all tenant schemas
            try:
                from services.models import Service
                from django_tenants.utils import tenant_context
                
                services_stats = {
                    'total': 0,
                    'active': 0,
                    'created_today': 0,
                    'created_this_week': 0,
                    'created_this_month': 0,
                }
                
                # Iterate through all active tenants and aggregate stats (exclude public schema)
                active_tenants = TenantModel.objects.filter(deleted_at__isnull=True).exclude(schema_name='public')
                for tenant in active_tenants:
                    try:
                        with tenant_context(tenant):
                            services_stats['total'] += Service.objects.count()
                            services_stats['active'] += Service.objects.filter(is_active=True).count()
                            services_stats['created_today'] += Service.objects.filter(created_at__date=timezone.now().date()).count()
                            services_stats['created_this_week'] += Service.objects.filter(created_at__gte=timezone.now() - timedelta(days=7)).count()
                            services_stats['created_this_month'] += Service.objects.filter(created_at__gte=timezone.now() - timedelta(days=30)).count()
                    except Exception as e:
                        # Silently ignore "relation does not exist" errors (shouldn't happen if we exclude public, but just in case)
                        error_msg = str(e).lower()
                        if 'relation' not in error_msg or 'does not exist' not in error_msg:
                            logger.warning(f"Error calculating services stats for tenant {tenant.id}: {e}")
                        continue
                
                stats['services_stats'] = services_stats
            except Exception as e:
                # Ne logger que si ce n'est pas une erreur "relation does not exist" (normale dans public schema)
                error_msg = str(e).lower()
                # Vérifier si c'est une erreur "relation does not exist" (normale dans public schema)
                if 'relation' in error_msg and 'does not exist' in error_msg:
                    # Ne pas logger, c'est normal dans le contexte multi-tenant
                    pass
                else:
                    logger.warning(f"Error calculating services stats: {e}")
                stats['services_stats'] = {}
            
            # Add bookings statistics - aggregate across all tenant schemas
            try:
                from bookings.models import Booking
                from django_tenants.utils import tenant_context
                
                bookings_stats = {
                    'total': 0,
                    'pending': 0,
                    'confirmed': 0,
                    'completed': 0,
                    'cancelled': 0,
                    'today': 0,
                    'this_week': 0,
                    'this_month': 0,
                }
                
                # Iterate through all active tenants and aggregate stats (exclude public schema)
                active_tenants = TenantModel.objects.filter(deleted_at__isnull=True).exclude(schema_name='public')
                for tenant in active_tenants:
                    try:
                        with tenant_context(tenant):
                            bookings_stats['total'] += Booking.objects.count()
                            bookings_stats['pending'] += Booking.objects.filter(status='pending').count()
                            bookings_stats['confirmed'] += Booking.objects.filter(status='confirmed').count()
                            bookings_stats['completed'] += Booking.objects.filter(status='completed').count()
                            bookings_stats['cancelled'] += Booking.objects.filter(status='cancelled').count()
                            bookings_stats['today'] += Booking.objects.filter(pickup_datetime__date=timezone.now().date()).count()
                            bookings_stats['this_week'] += Booking.objects.filter(pickup_datetime__gte=timezone.now() - timedelta(days=7)).count()
                            bookings_stats['this_month'] += Booking.objects.filter(pickup_datetime__gte=timezone.now() - timedelta(days=30)).count()
                    except Exception as e:
                        # Silently ignore "relation does not exist" errors (shouldn't happen if we exclude public, but just in case)
                        error_msg = str(e).lower()
                        if 'relation' not in error_msg or 'does not exist' not in error_msg:
                            logger.warning(f"Error calculating bookings stats for tenant {tenant.id}: {e}")
                        continue
                
                stats['bookings_stats'] = bookings_stats
            except Exception as e:
                # Ne logger que si ce n'est pas une erreur "relation does not exist" (normale dans public schema)
                error_msg = str(e).lower()
                # Vérifier si c'est une erreur "relation does not exist" (normale dans public schema)
                if 'relation' in error_msg and 'does not exist' in error_msg:
                    # Ne pas logger, c'est normal dans le contexte multi-tenant
                    pass
                else:
                    logger.warning(f"Error calculating bookings stats: {e}")
                stats['bookings_stats'] = {}
            
            # Add users by role
            try:
                users_by_role = UserModel.objects.values('role').annotate(count=Count('id')).order_by('-count')
                stats['users_by_role'] = [
                    {'role': item['role'] or 'unknown', 'count': item['count']}
                    for item in users_by_role
                ]
            except Exception as e:
                logger.warning(f"Error calculating users by role: {e}")
                stats['users_by_role'] = []
            
            # Add users by status
            try:
                users_by_status = UserModel.objects.values('status').annotate(count=Count('id')).order_by('-count')
                stats['users_by_status'] = [
                    {'status': item['status'] or 'unknown', 'count': item['count']}
                    for item in users_by_status
                ]
            except Exception as e:
                logger.warning(f"Error calculating users by status: {e}")
                stats['users_by_status'] = []
            
            # Add tenants by plan
            try:
                from billing.models import Subscription
                tenants_by_plan = Subscription.objects.values('plan__name').annotate(count=Count('id')).order_by('-count')
                stats['tenants_by_plan'] = [
                    {'plan': item['plan__name'] or 'no_plan', 'count': item['count']}
                    for item in tenants_by_plan
                ]
            except Exception as e:
                logger.warning(f"Error calculating tenants by plan: {e}")
                stats['tenants_by_plan'] = []
            
            # Add tenants by status
            try:
                tenants_by_status = TenantModel.objects.filter(deleted_at__isnull=True).values('status').annotate(count=Count('id')).order_by('-count')
                stats['tenants_by_status'] = [
                    {'status': item['status'] or 'unknown', 'count': item['count']}
                    for item in tenants_by_status
                ]
            except Exception as e:
                logger.warning(f"Error calculating tenants by status: {e}")
                stats['tenants_by_status'] = []
            
            # Add recent tenants
            try:
                recent_tenants = TenantModel.objects.filter(deleted_at__isnull=True).order_by('-created_at')[:10]
                stats['recent_tenants'] = []
                for t in recent_tenants:
                    try:
                        plan_name = 'no_plan'
                        # Safely get plan name
                        if hasattr(t, 'subscription') and t.subscription:
                            if hasattr(t.subscription, 'plan') and t.subscription.plan:
                                plan_name = t.subscription.plan.name
                        stats['recent_tenants'].append({
                            'id': t.id,
                            'name': t.name,
                            'email': t.email,
                            'status': t.status,
                            'plan': plan_name,
                            'created_at': t.created_at.isoformat(),
                        })
                    except Exception as e:
                        logger.warning(f"Error processing tenant {t.id}: {e}")
                        # Add tenant without plan info
                        stats['recent_tenants'].append({
                            'id': t.id,
                            'name': t.name,
                            'email': t.email,
                            'status': t.status,
                            'plan': 'no_plan',
                            'created_at': t.created_at.isoformat(),
                        })
            except Exception as e:
                logger.warning(f"Error getting recent tenants: {e}")
                stats['recent_tenants'] = []
            
            # Add recent users
            try:
                recent_users = UserModel.objects.select_related('tenant').order_by('-created_at')[:10]
                stats['recent_users'] = [
                    {
                        'id': u.id,
                        'name': f"{u.first_name} {u.last_name}".strip() or u.username,
                        'email': u.email,
                        'role': u.role,
                        'status': u.status,
                        'tenant_name': u.tenant.name if u.tenant else None,
                        'created_at': u.created_at.isoformat(),
                    }
                    for u in recent_users
                ]
            except Exception as e:
                logger.warning(f"Error getting recent users: {e}")
                stats['recent_users'] = []
            
            response = Response(stats)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            logger.error(f"Error in DetailedStatsView: {e}", exc_info=True)
            error_response = Response({
                'error': 'An error occurred while fetching detailed statistics'
            }, status=500)
            add_cors_headers(error_response, request)
            return error_response


@api_view(['POST', 'OPTIONS'])
@permission_classes([AllowAny])  # Allow tracking even without auth for analytics
def block_usage_tracking_view(request):
    """
    Endpoint to track block usage for analytics
    Accepts a list of block usage events
    """
    try:
        # Handle OPTIONS request for CORS preflight
        if request.method == 'OPTIONS':
            response = Response()
            add_cors_headers(response, request)
            return response
        
        usages = request.data.get('usages', [])
        
        if not isinstance(usages, list):
            error_response = Response({
                'error': 'usages must be a list'
            }, status=400)
            add_cors_headers(error_response, request)
            return error_response
        
        # For now, just log the usage (can be extended to store in DB later)
        logger.info(f"Block usage tracked: {len(usages)} events")
        
        # Optional: Store in database if needed
        # from analytics.models import BlockUsage
        # for usage in usages:
        #     BlockUsage.objects.create(**usage)
        
        response = Response({
            'success': True,
            'tracked': len(usages)
        })
        add_cors_headers(response, request)
        return response
    except Exception as e:
        logger.error(f"Error tracking block usage: {e}", exc_info=True)
        error_response = Response({
            'error': 'An error occurred while tracking block usage'
        }, status=500)
        add_cors_headers(error_response, request)
        return error_response
