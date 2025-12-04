"""
Views for billing models
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import logging
from django.conf import settings
from .models import PricingPlan, Subscription, Invoice, Payment, PaymentMethod, InvoiceTemplate
from .serializers import (
    PricingPlanSerializer, SubscriptionSerializer,
    InvoiceSerializer, PaymentSerializer, PaymentMethodSerializer, InvoiceTemplateSerializer
)
from tenants.models import Tenant

logger = logging.getLogger(__name__)


def add_cors_headers(response, request):
    """Helper function to add CORS headers to a response"""
    try:
        origin = request.META.get('HTTP_ORIGIN')
        if origin:
            if settings.DEBUG:
                # En développement, autoriser tous les localhost, 127.0.0.1 et 192.168.1.134
                if (origin.startswith('http://localhost') or 
                    origin.startswith('http://127.0.0.1') or
                    origin.startswith('http://192.168.1.134') or
                    origin.startswith('https://localhost') or
                    origin.startswith('https://127.0.0.1') or
                    origin.startswith('https://192.168.1.134')):
                    response['Access-Control-Allow-Origin'] = origin
                    response['Access-Control-Allow-Credentials'] = 'true'
                    response['Access-Control-Allow-Methods'] = ', '.join(settings.CORS_ALLOW_METHODS)
                    response['Access-Control-Allow-Headers'] = ', '.join(settings.CORS_ALLOW_HEADERS)
            else:
                if hasattr(settings, 'CORS_ALLOWED_ORIGINS') and origin in settings.CORS_ALLOWED_ORIGINS:
                    response['Access-Control-Allow-Origin'] = origin
                    response['Access-Control-Allow-Credentials'] = 'true'
    except Exception as e:
        logger.warning(f"Error adding CORS headers: {e}")


class PricingPlanViewSet(viewsets.ModelViewSet):
    """ViewSet for managing pricing plans"""
    queryset = PricingPlan.objects.all()
    serializer_class = PricingPlanSerializer
    # Allow public access to list pricing plans (for public pricing page)
    permission_classes = []  # No authentication required for listing
    
    def get_permissions(self):
        """
        Allow public access to list, but require authentication for create/update/delete
        """
        if self.action == 'list':
            return []  # No authentication required
        return [IsAuthenticated()]  # Authentication required for other actions

    def get_queryset(self):
        """Filter plans based on user role"""
        try:
            # Allow unauthenticated users to see active plans
            queryset = PricingPlan.objects.filter(is_active=True)
            
            # If user is authenticated, check if super admin
            if hasattr(self.request, 'user') and self.request.user and self.request.user.is_authenticated:
                user = self.request.user
                try:
                    if user.is_super_admin():
                        queryset = PricingPlan.objects.all()
                except Exception as e:
                    logger.error(f"Error checking super admin in PricingPlanViewSet: {e}", exc_info=True)
            
            return queryset.order_by('order', 'price_monthly')
        except Exception as e:
            logger.error(f"Error in PricingPlanViewSet.get_queryset: {e}", exc_info=True)
            return PricingPlan.objects.none()
    
    def list(self, request, *args, **kwargs):
        """List pricing plans with error handling - public access allowed"""
        try:
            response = super().list(request, *args, **kwargs)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            logger.error(f"Error in PricingPlanViewSet.list: {e}", exc_info=True)
            error_response = Response({
                'error': 'An error occurred while fetching pricing plans',
                'message': str(e) if settings.DEBUG else 'Unable to load pricing plans'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            add_cors_headers(error_response, request)
            return error_response

    def create(self, request, *args, **kwargs):
        """Only super admin can create pricing plans"""
        if not request.user.is_super_admin():
            return Response(
                {'error': 'Only super admin can create pricing plans'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Only super admin can update pricing plans"""
        if not request.user.is_super_admin():
            return Response(
                {'error': 'Only super admin can update pricing plans'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Only super admin can delete pricing plans"""
        if not request.user.is_super_admin():
            return Response(
                {'error': 'Only super admin can delete pricing plans'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def move_up(self, request, pk=None):
        """Move plan up in order"""
        if not request.user.is_super_admin():
            return Response(
                {'error': 'Only super admin can reorder plans'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        plan = self.get_object()
        previous_plan = PricingPlan.objects.filter(order__lt=plan.order).order_by('-order').first()
        
        if previous_plan:
            temp_order = plan.order
            plan.order = previous_plan.order
            previous_plan.order = temp_order
            plan.save(update_fields=['order'])
            previous_plan.save(update_fields=['order'])
        
        return Response({
            'status': 'Plan moved up',
            'plan': PricingPlanSerializer(plan).data
        })

    @action(detail=True, methods=['post'])
    def move_down(self, request, pk=None):
        """Move plan down in order"""
        if not request.user.is_super_admin():
            return Response(
                {'error': 'Only super admin can reorder plans'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        plan = self.get_object()
        next_plan = PricingPlan.objects.filter(order__gt=plan.order).order_by('order').first()
        
        if next_plan:
            temp_order = plan.order
            plan.order = next_plan.order
            next_plan.order = temp_order
            plan.save(update_fields=['order'])
            next_plan.save(update_fields=['order'])
        
        return Response({
            'status': 'Plan moved down',
            'plan': PricingPlanSerializer(plan).data
        })


class SubscriptionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing subscriptions"""
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter subscriptions based on user role and query parameters"""
        try:
            user = self.request.user
            queryset = None
            
            try:
                if user.is_super_admin():
                    queryset = Subscription.objects.all()
                elif hasattr(user, 'is_tenant_admin') and user.is_tenant_admin() and hasattr(user, 'tenant') and user.tenant:
                    queryset = Subscription.objects.filter(tenant=user.tenant)
                else:
                    return Subscription.objects.none()
            except Exception as e:
                logger.error(f"Error checking user permissions in SubscriptionViewSet: {e}", exc_info=True)
                return Subscription.objects.none()
            
            if queryset is None:
                return Subscription.objects.none()
            
            # Apply filters from query parameters
            tenant_id = self.request.query_params.get('tenant_id')
            if tenant_id:
                try:
                    queryset = queryset.filter(tenant_id=int(tenant_id))
                except (ValueError, TypeError):
                    pass
            
            status = self.request.query_params.get('status')
            if status:
                queryset = queryset.filter(status=status)
            
            plan_id = self.request.query_params.get('plan_id')
            if plan_id:
                try:
                    queryset = queryset.filter(plan_id=int(plan_id))
                except (ValueError, TypeError):
                    pass
            
            billing_cycle = self.request.query_params.get('billing_cycle')
            if billing_cycle:
                queryset = queryset.filter(billing_cycle=billing_cycle)
            
            # Apply sorting
            order_by = self.request.query_params.get('order_by', '-created_at')
            ordering = self.request.query_params.get('ordering', 'desc')
            
            # Validate order_by field
            allowed_order_fields = ['created_at', 'current_period_start', 'current_period_end', 'status', 'billing_cycle']
            if order_by.lstrip('-') not in allowed_order_fields:
                order_by = '-created_at'
            
            # Apply ordering direction
            if ordering == 'asc':
                if order_by.startswith('-'):
                    order_by = order_by.lstrip('-')
            elif ordering == 'desc':
                if not order_by.startswith('-'):
                    order_by = f'-{order_by}'
            
            queryset = queryset.order_by(order_by, '-id')
            
            return queryset
        except Exception as e:
            logger.error(f"Error in SubscriptionViewSet.get_queryset: {e}", exc_info=True)
            return Subscription.objects.none()
    
    @action(detail=False, methods=['get'])
    def tenants_without_subscription(self, request):
        """Get list of tenants that don't have a subscription yet"""
        try:
            if not request.user.is_super_admin():
                error_response = Response(
                    {'error': 'Only super admin can access this endpoint'},
                    status=status.HTTP_403_FORBIDDEN
                )
                add_cors_headers(error_response, request)
                return error_response
            
            # Get all tenants that don't have a subscription
            tenants_with_subscription = Subscription.objects.values_list('tenant_id', flat=True)
            tenants_without = Tenant.objects.filter(
                deleted_at__isnull=True  # Exclude soft-deleted tenants
            ).exclude(
                id__in=tenants_with_subscription
            )
            
            # Serialize tenants
            from tenants.serializers import TenantSerializer
            serializer = TenantSerializer(tenants_without, many=True)
            
            response = Response(serializer.data)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            logger.error(f"Error in tenants_without_subscription: {e}", exc_info=True)
            error_response = Response({
                'error': 'An error occurred while fetching tenants without subscription',
                'message': str(e) if settings.DEBUG else 'Unable to load tenants'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            add_cors_headers(error_response, request)
            return error_response
    
    def list(self, request, *args, **kwargs):
        """List subscriptions with error handling"""
        try:
            response = super().list(request, *args, **kwargs)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            logger.error(f"Error in SubscriptionViewSet.list: {e}", exc_info=True)
            error_response = Response({
                'error': 'An error occurred while fetching subscriptions',
                'message': str(e) if settings.DEBUG else 'Unable to load subscriptions'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            add_cors_headers(error_response, request)
            return error_response

    def create(self, request, *args, **kwargs):
        """Create a new subscription with automatic date handling"""
        try:
            user = request.user
            
            # Remove tenant from request.data if present (will be set from user context or validated)
            data = request.data.copy()
            
            # Determine tenant based on user role
            tenant = None
            serializer = None
            
            if user.is_super_admin():
                # Super admin can create subscription for any tenant (must specify tenant_id)
                # Validate required fields
                tenant_id = data.get('tenant_id')
                if not tenant_id:
                    error_response = Response(
                        {'error': 'tenant_id is required for super admin'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    add_cors_headers(error_response, request)
                    return error_response
                
                plan_id = data.get('plan_id')
                if not plan_id:
                    error_response = Response(
                        {'error': 'plan_id is required'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    add_cors_headers(error_response, request)
                    return error_response
                
                # Validate serializer with plan_id (will be converted to plan automatically)
                serializer = self.get_serializer(data=data)
                try:
                    serializer.is_valid(raise_exception=True)
                except Exception as e:
                    logger.error(f"Serializer validation error: {e}")
                    error_response = Response(
                        {'error': 'Validation error', 'details': str(e) if settings.DEBUG else 'Invalid data'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    add_cors_headers(error_response, request)
                    return error_response
                
                # Get tenant from validated data or fallback to data
                tenant_from_validated = serializer.validated_data.get('tenant')
                if tenant_from_validated:
                    if isinstance(tenant_from_validated, Tenant):
                        tenant = tenant_from_validated
                    elif isinstance(tenant_from_validated, dict):
                        tenant_id = tenant_from_validated.get('id')
                        tenant = Tenant.objects.get(id=tenant_id)
                    elif hasattr(tenant_from_validated, 'id'):
                        tenant = Tenant.objects.get(id=tenant_from_validated.id)
                    else:
                        tenant = None
                else:
                    tenant = None
                
                # Fallback: get tenant from data
                if not tenant:
                    try:
                        tenant_id = int(data.get('tenant_id'))
                        tenant = Tenant.objects.get(id=tenant_id)
                    except (ValueError, TypeError, Tenant.DoesNotExist):
                        error_response = Response(
                            {'error': 'Tenant not found'},
                            status=status.HTTP_404_NOT_FOUND
                        )
                        add_cors_headers(error_response, request)
                        return error_response
                
            elif user.is_tenant_admin() and hasattr(user, 'tenant') and user.tenant:
                # Tenant admin can create subscription for their own tenant
                tenant = user.tenant
                
                # Remove tenant_id from data (will use user's tenant)
                if 'tenant' in data:
                    del data['tenant']
                if 'tenant_id' in data:
                    del data['tenant_id']
                
                # Validate serializer with plan_id (will be converted to plan automatically)
                serializer = self.get_serializer(data=data)
                try:
                    serializer.is_valid(raise_exception=True)
                except Exception as e:
                    logger.error(f"Serializer validation error: {e}")
                    error_response = Response(
                        {'error': 'Validation error', 'details': str(e) if settings.DEBUG else 'Invalid data'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    add_cors_headers(error_response, request)
                    return error_response
            else:
                error_response = Response(
                    {'error': 'Vous devez être admin d\'un tenant pour créer un abonnement'},
                    status=status.HTTP_403_FORBIDDEN
                )
                add_cors_headers(error_response, request)
                return error_response
            
            # Check if tenant already has a subscription
            # Un tenant ne peut avoir qu'un seul abonnement à la fois (OneToOneField)
            existing_subscription = None
            try:
                existing_subscription = Subscription.objects.get(tenant=tenant)
            except Subscription.DoesNotExist:
                pass
            
            if existing_subscription:
                # Si un abonnement existe déjà, on le met à jour au lieu d'en créer un nouveau
                # Cela permet de changer de plan ou de réactiver un abonnement annulé
                plan = serializer.validated_data.get('plan')
                if not plan:
                    error_response = Response(
                        {'error': 'Plan is required'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    add_cors_headers(error_response, request)
                    return error_response
                
                # Si l'abonnement est actif ou en trial, on ne peut que le mettre à jour (changement de plan)
                if existing_subscription.status in ['active', 'trial']:
                    # Mise à jour du plan et du cycle de facturation
                    existing_subscription.plan = plan
                    billing_cycle = serializer.validated_data.get('billing_cycle', existing_subscription.billing_cycle)
                    existing_subscription.billing_cycle = billing_cycle
                    
                    # Réinitialiser les dates si changement de cycle
                    now = timezone.now()
                    if billing_cycle == 'monthly':
                        existing_subscription.current_period_end = now + timedelta(days=30)
                    else:
                        existing_subscription.current_period_end = now + timedelta(days=365)
                    existing_subscription.current_period_start = now
                    
                    existing_subscription.save()
                    
                    headers = self.get_success_headers(serializer.data)
                    response = Response(
                        SubscriptionSerializer(existing_subscription).data,
                        status=status.HTTP_200_OK,
                        headers=headers
                    )
                    add_cors_headers(response, request)
                    return response
                else:
                    # Si l'abonnement est annulé ou expiré, on peut le réactiver
                    # Réactiver l'abonnement avec le nouveau plan
                    existing_subscription.plan = plan
                    billing_cycle = serializer.validated_data.get('billing_cycle', 'monthly')
                    existing_subscription.billing_cycle = billing_cycle
                    
                    # Réinitialiser les dates
                    now = timezone.now()
                    status_value = serializer.validated_data.get('status', 'active')
                    
                    # Set trial dates if status is trial
                    trial_start = None
                    trial_end = None
                    if status_value == 'trial':
                        try:
                            from settings_app.models import SystemSettings
                            settings = SystemSettings.get_settings()
                            trial_days = settings.default_trial_days if settings.enable_trial else 0
                        except Exception:
                            trial_days = 14
                        
                        trial_start = now
                        trial_end = now + timedelta(days=trial_days)
                        existing_subscription.trial_start = trial_start
                        existing_subscription.trial_end = trial_end
                        existing_subscription.current_period_start = trial_start
                        existing_subscription.current_period_end = trial_end
                    else:
                        if billing_cycle == 'monthly':
                            existing_subscription.current_period_end = now + timedelta(days=30)
                        else:
                            existing_subscription.current_period_end = now + timedelta(days=365)
                        existing_subscription.current_period_start = now
                    
                    existing_subscription.status = status_value
                    existing_subscription.cancelled_at = None
                    existing_subscription.save()
                    
                    headers = self.get_success_headers(serializer.data)
                    response = Response(
                        SubscriptionSerializer(existing_subscription).data,
                        status=status.HTTP_200_OK,
                        headers=headers
                    )
                    add_cors_headers(response, request)
                    return response
            
            # Get plan from validated data
            plan = serializer.validated_data.get('plan')
            if not plan:
                error_response = Response(
                    {'error': 'Plan is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                add_cors_headers(error_response, request)
                return error_response
            
            # Calculate dates
            now = timezone.now()
            billing_cycle = serializer.validated_data.get('billing_cycle', 'monthly')
            status_value = serializer.validated_data.get('status', 'active')
            
            # Set trial dates if status is trial
            trial_start = None
            trial_end = None
            current_period_start = now
            current_period_end = now
            
            if status_value == 'trial':
                # Get trial days from SystemSettings
                try:
                    from settings_app.models import SystemSettings
                    settings = SystemSettings.get_settings()
                    trial_days = settings.default_trial_days if settings.enable_trial else 0
                except Exception:
                    trial_days = 14  # Fallback to 14 days
                
                trial_start = now
                trial_end = now + timedelta(days=trial_days)
                current_period_start = trial_start
                current_period_end = trial_end
            else:
                # Set billing period based on cycle
                if billing_cycle == 'monthly':
                    current_period_end = now + timedelta(days=30)
                else:  # yearly
                    current_period_end = now + timedelta(days=365)
            
            # Create subscription with calculated dates
            subscription = Subscription.objects.create(
                tenant=tenant,
                plan=plan,
                status=status_value,
                billing_cycle=billing_cycle,
                trial_start=trial_start,
                trial_end=trial_end,
                current_period_start=current_period_start,
                current_period_end=current_period_end,
            )
            
            # Activer automatiquement les fonctionnalités selon le plan
            try:
                from tenants.utils import enable_features_for_tenant
                enable_features_for_tenant(tenant, plan)
            except Exception as e:
                # Ne pas bloquer la création de l'abonnement si l'activation des features échoue
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Erreur activation fonctionnalités pour tenant {tenant.slug}: {e}")
            
            headers = self.get_success_headers(serializer.data)
            response = Response(
                SubscriptionSerializer(subscription).data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )
            add_cors_headers(response, request)
            return response
            
        except Exception as e:
            logger.error(f"Error in SubscriptionViewSet.create: {e}", exc_info=True)
            error_response = Response(
                {
                    'error': 'An error occurred while creating the subscription',
                    'message': str(e) if settings.DEBUG else 'Unable to create subscription'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            add_cors_headers(error_response, request)
            return error_response

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a subscription"""
        subscription = self.get_object()
        
        # Check permissions
        if not request.user.is_super_admin():
            if not request.user.is_tenant_admin() or request.user.tenant != subscription.tenant:
                return Response(
                    {'error': 'Vous n\'avez pas la permission d\'annuler cet abonnement'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Cancel via Stripe if connected
        if subscription.stripe_subscription_id:
            try:
                from .stripe_service import StripeService
                StripeService.cancel_subscription(subscription)
            except Exception as e:
                # If Stripe fails, still cancel locally
                pass
        
        subscription.status = 'cancelled'
        subscription.cancelled_at = timezone.now()
        subscription.save(update_fields=['status', 'cancelled_at'])
        
        return Response({
            'status': 'Subscription cancelled',
            'subscription': SubscriptionSerializer(subscription).data
        })

    @action(detail=True, methods=['post'])
    def reactivate(self, request, pk=None):
        """Reactivate a cancelled subscription"""
        subscription = self.get_object()
        
        if not request.user.is_super_admin():
            return Response(
                {'error': 'Only super admin can reactivate subscriptions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Reactivate via Stripe if connected
        if subscription.stripe_subscription_id:
            try:
                from .stripe_service import StripeService
                StripeService.reactivate_subscription(subscription)
            except Exception as e:
                return Response(
                    {'error': f'Erreur réactivation Stripe: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        subscription.status = 'active'
        subscription.cancelled_at = None
        subscription.save(update_fields=['status', 'cancelled_at'])
        
        return Response({
            'status': 'Subscription reactivated',
            'subscription': SubscriptionSerializer(subscription).data
        })

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a subscription (trial -> active)"""
        subscription = self.get_object()
        
        if not request.user.is_super_admin():
            return Response(
                {'error': 'Only super admin can activate subscriptions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if subscription.status == 'active':
            return Response(
                {'error': 'Subscription is already active'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = subscription.status
        subscription.status = 'active'
        subscription.cancelled_at = None
        
        # Update period dates if coming from trial
        if old_status == 'trial' and subscription.trial_end:
            subscription.current_period_start = timezone.now()
            if subscription.billing_cycle == 'monthly':
                subscription.current_period_end = timezone.now() + timedelta(days=30)
            else:
                subscription.current_period_end = timezone.now() + timedelta(days=365)
            subscription.save(update_fields=['status', 'cancelled_at', 'current_period_start', 'current_period_end'])
        else:
            subscription.save(update_fields=['status', 'cancelled_at'])
        
        return Response({
            'status': 'Subscription activated',
            'subscription': SubscriptionSerializer(subscription).data
        })

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        """Suspend a subscription (active -> past_due)"""
        subscription = self.get_object()
        
        if not request.user.is_super_admin():
            return Response(
                {'error': 'Only super admin can suspend subscriptions'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if subscription.status != 'active':
            return Response(
                {'error': 'Only active subscriptions can be suspended'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        subscription.status = 'past_due'
        subscription.save(update_fields=['status'])
        
        return Response({
            'status': 'Subscription suspended',
            'subscription': SubscriptionSerializer(subscription).data
        })

    @action(detail=True, methods=['post'])
    def update_plan(self, request, pk=None):
        """Update subscription plan"""
        subscription = self.get_object()
        
        if not request.user.is_super_admin():
            return Response(
                {'error': 'Only super admin can update subscription plans'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        plan_id = request.data.get('plan_id')
        if not plan_id:
            return Response(
                {'error': 'plan_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            new_plan = PricingPlan.objects.get(id=plan_id)
            subscription.plan = new_plan
            subscription.save(update_fields=['plan'])
            
            # Synchroniser les fonctionnalités avec le nouveau plan
            try:
                from tenants.utils import sync_tenant_features
                sync_tenant_features(subscription.tenant)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Erreur synchronisation fonctionnalités pour tenant {subscription.tenant.slug}: {e}")
            
            return Response({
                'status': 'Subscription plan updated',
                'subscription': SubscriptionSerializer(subscription).data
            })
        except PricingPlan.DoesNotExist:
            return Response(
                {'error': 'Plan not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update subscription status (admin only)"""
        subscription = self.get_object()
        
        if not request.user.is_super_admin():
            return Response(
                {'error': 'Only super admin can update subscription status'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        new_status = request.data.get('status')
        if not new_status or new_status not in ['trial', 'active', 'past_due', 'cancelled', 'expired']:
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        subscription.status = new_status
        if new_status == 'cancelled':
            subscription.cancelled_at = timezone.now()
        elif new_status == 'active':
            subscription.cancelled_at = None
            # Activer les fonctionnalités lors de l'activation
            try:
                from tenants.utils import enable_features_for_tenant
                enable_features_for_tenant(subscription.tenant, subscription.plan)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Erreur activation fonctionnalités pour tenant {subscription.tenant.slug}: {e}")
        elif new_status == 'trial':
            # Activer les fonctionnalités lors du passage en trial
            try:
                from tenants.utils import enable_features_for_tenant
                enable_features_for_tenant(subscription.tenant, subscription.plan)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Erreur activation fonctionnalités pour tenant {subscription.tenant.slug}: {e}")
        
        subscription.save(update_fields=['status', 'cancelled_at'])
        
        return Response({
            'status': 'Subscription status updated',
            'subscription': SubscriptionSerializer(subscription).data
        })

    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        """Get detailed subscription information including invoices and payments"""
        subscription = self.get_object()
        
        # Check permissions
        user = request.user
        if not user.is_super_admin():
            if not user.is_tenant_admin() or user.tenant != subscription.tenant:
                return Response(
                    {'error': 'Vous n\'avez pas la permission d\'accéder à ces détails'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Get related invoices
        invoices = subscription.invoices.all().order_by('-created_at')
        invoice_serializer = InvoiceSerializer(invoices, many=True)
        
        # Get related payments
        payments = Payment.objects.filter(invoice__subscription=subscription).order_by('-created_at')
        payment_serializer = PaymentSerializer(payments, many=True)
        
        # Calculate summary
        from django.db.models import Sum
        total_invoiced = invoices.aggregate(Sum('total'))['total__sum'] or 0
        total_paid = invoices.filter(status='paid').aggregate(Sum('total'))['total__sum'] or 0
        unpaid_amount = invoices.filter(status__in=['open', 'draft']).aggregate(Sum('total'))['total__sum'] or 0
        
        return Response({
            'subscription': SubscriptionSerializer(subscription).data,
            'invoices': invoice_serializer.data,
            'payments': payment_serializer.data,
            'summary': {
                'total_invoiced': float(total_invoiced),
                'total_paid': float(total_paid),
                'unpaid_amount': float(unpaid_amount),
                'invoices_count': invoices.count(),
                'paid_invoices_count': invoices.filter(status='paid').count(),
                'unpaid_invoices_count': invoices.filter(status__in=['open', 'draft']).count(),
            }
        })


class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing invoices (read-only, created automatically)"""
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter invoices based on user role and query parameters"""
        try:
            user = self.request.user
            queryset = None
            
            try:
                if user.is_super_admin():
                    queryset = Invoice.objects.all()
                elif hasattr(user, 'is_tenant_admin') and user.is_tenant_admin() and hasattr(user, 'tenant') and user.tenant:
                    queryset = Invoice.objects.filter(tenant=user.tenant)
                else:
                    return Invoice.objects.none()
            except Exception as e:
                logger.error(f"Error checking user permissions in InvoiceViewSet: {e}", exc_info=True)
                return Invoice.objects.none()
            
            if queryset is None:
                return Invoice.objects.none()
            
            # Apply filters from query parameters
            tenant_id = self.request.query_params.get('tenant_id')
            if tenant_id:
                try:
                    queryset = queryset.filter(tenant_id=int(tenant_id))
                except (ValueError, TypeError):
                    pass
            
            status = self.request.query_params.get('status')
            if status:
                queryset = queryset.filter(status=status)
            
            date_from = self.request.query_params.get('date_from')
            if date_from:
                try:
                    from datetime import datetime
                    date_from_obj = datetime.strptime(date_from, '%Y-%m-%d')
                    queryset = queryset.filter(issue_date__gte=date_from_obj)
                except (ValueError, TypeError):
                    pass
            
            date_to = self.request.query_params.get('date_to')
            if date_to:
                try:
                    from datetime import datetime
                    date_to_obj = datetime.strptime(date_to, '%Y-%m-%d')
                    queryset = queryset.filter(issue_date__lte=date_to_obj)
                except (ValueError, TypeError):
                    pass
            
            # Apply sorting
            order_by = self.request.query_params.get('order_by', '-created_at')
            ordering = self.request.query_params.get('ordering', 'desc')
            
            # Validate order_by field
            allowed_order_fields = ['created_at', 'issue_date', 'due_date', 'total', 'status', 'invoice_number']
            if order_by.lstrip('-') not in allowed_order_fields:
                order_by = '-created_at'
            
            # Apply ordering direction
            if ordering == 'asc':
                if order_by.startswith('-'):
                    order_by = order_by.lstrip('-')
            elif ordering == 'desc':
                if not order_by.startswith('-'):
                    order_by = f'-{order_by}'
            
            queryset = queryset.order_by(order_by)
            
            return queryset.order_by('-created_at', '-id')
        except Exception as e:
            logger.error(f"Error in InvoiceViewSet.get_queryset: {e}", exc_info=True)
            return Invoice.objects.none()
    
    def list(self, request, *args, **kwargs):
        """List invoices with error handling"""
        try:
            response = super().list(request, *args, **kwargs)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            logger.error(f"Error in InvoiceViewSet.list: {e}", exc_info=True)
            error_response = Response({
                'error': 'An error occurred while fetching invoices',
                'message': str(e) if settings.DEBUG else 'Unable to load invoices'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            add_cors_headers(error_response, request)
            return error_response

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark an invoice as paid (admin only)"""
        invoice = self.get_object()
        
        if not request.user.is_super_admin():
            return Response(
                {'error': 'Only super admin can mark invoices as paid'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        invoice.status = 'paid'
        invoice.paid_at = timezone.now()
        invoice.save(update_fields=['status', 'paid_at'])
        
        return Response({
            'status': 'Invoice marked as paid',
            'invoice': InvoiceSerializer(invoice).data
        })

    @action(detail=True, methods=['post'])
    def send_reminder(self, request, pk=None):
        """Send payment reminder email for unpaid invoice"""
        invoice = self.get_object()
        
        if not request.user.is_super_admin():
            return Response(
                {'error': 'Only super admin can send payment reminders'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if invoice.status == 'paid':
            return Response(
                {'error': 'Invoice is already paid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from django.core.mail import send_mail
            from django.conf import settings
            
            # Send reminder email
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:9494')
            invoice_url = f"{frontend_url}/dashboard/billing/invoices/{invoice.id}"
            
            send_mail(
                subject=f'Rappel de paiement - Facture {invoice.invoice_number}',
                message=f'''
Bonjour,

Nous vous rappelons que votre facture {invoice.invoice_number} d'un montant de {invoice.total}€ est en attente de paiement.

Date d'échéance : {invoice.due_date.strftime('%d/%m/%Y')}

Vous pouvez accéder à votre facture et effectuer le paiement en cliquant sur le lien suivant :
{invoice_url}

Pour toute question, n'hésitez pas à nous contacter.

Cordialement,
L'équipe VTCBuilder
                ''',
                html_message=f'''
                <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2>Rappel de paiement</h2>
                    <p>Bonjour,</p>
                    <p>Nous vous rappelons que votre <strong>facture {invoice.invoice_number}</strong> d'un montant de <strong>{invoice.total}€</strong> est en attente de paiement.</p>
                    <p><strong>Date d'échéance :</strong> {invoice.due_date.strftime('%d/%m/%Y')}</p>
                    <p>
                        <a href="{invoice_url}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Accéder à ma facture
                        </a>
                    </p>
                    <p>Pour toute question, n'hésitez pas à nous contacter.</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">Cordialement,<br>L'équipe VTCBuilder</p>
                </body>
                </html>
                ''',
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@vtcbuilder.com'),
                recipient_list=[invoice.tenant.email],
                fail_silently=False,
            )
            
            return Response({
                'status': 'Reminder email sent successfully',
                'message': f'Email de rappel envoyé à {invoice.tenant.email}'
            })
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error sending reminder email: {str(e)}")
            return Response(
                {'error': f'Erreur lors de l\'envoi de l\'email: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def download_pdf(self, request, pk=None):
        """Generate and download invoice PDF as HTML (printable)"""
        from django.http import HttpResponse
        from django.template.loader import render_to_string
        
        invoice = self.get_object()
        
        # Check permissions
        user = request.user
        if not user.is_super_admin():
            if not user.is_tenant_admin() or user.tenant != invoice.tenant:
                return Response(
                    {'error': 'Vous n\'avez pas la permission d\'accéder à cette facture'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Try to use custom template if available
        template_id = request.query_params.get('template_id')
        if template_id:
            try:
                template = InvoiceTemplate.objects.get(id=template_id, is_active=True)
                html_content = template.render(invoice)
                response = HttpResponse(html_content, content_type='text/html')
                response['Content-Disposition'] = f'inline; filename="facture-{invoice.invoice_number}.html"'
                add_cors_headers(response, request)
                return response
            except InvoiceTemplate.DoesNotExist:
                pass  # Fall back to default template
        
        # Use default template or system default
        default_template = InvoiceTemplate.objects.filter(is_default=True, is_active=True).first()
        if default_template:
            html_content = default_template.render(invoice)
            response = HttpResponse(html_content, content_type='text/html')
            response['Content-Disposition'] = f'inline; filename="facture-{invoice.invoice_number}.html"'
            add_cors_headers(response, request)
            return response
        
        # Generate HTML invoice (can be printed as PDF by browser) - Professional template
        status_display = dict(Invoice.STATUS_CHOICES).get(invoice.status, invoice.status)
        status_color = '#10b981' if invoice.status == 'paid' else '#f59e0b' if invoice.status == 'open' else '#ef4444'
        plan_name = invoice.subscription.plan.name if invoice.subscription and invoice.subscription.plan else 'Abonnement'
        
        html_content = f"""
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture {invoice.invoice_number}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        @media print {{
            @page {{
                size: A4;
                margin: 1.5cm;
            }}
            .no-print {{
                display: none;
            }}
            body {{
                background: white;
            }}
        }}
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #f9fafb;
            padding: 40px 20px;
        }}
        .invoice-container {{
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 50px;
            border-radius: 8px;
        }}
        .header {{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 50px;
            padding-bottom: 30px;
            border-bottom: 3px solid #3b82f6;
        }}
        .company-info {{
            flex: 1;
        }}
        .company-name {{
            font-size: 28px;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 8px;
        }}
        .company-details {{
            font-size: 12px;
            color: #6b7280;
            line-height: 1.8;
        }}
        .invoice-info {{
            text-align: right;
            flex: 1;
        }}
        .invoice-title {{
            font-size: 36px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 10px;
            letter-spacing: 2px;
        }}
        .invoice-number {{
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 15px;
        }}
        .status-badge {{
            display: inline-block;
            padding: 8px 20px;
            border-radius: 25px;
            font-size: 13px;
            font-weight: 600;
            background-color: {status_color};
            color: white;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        .content-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 50px;
        }}
        .section {{
            background: #f9fafb;
            padding: 25px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }}
        .section-title {{
            font-size: 16px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        .info-item {{
            margin-bottom: 12px;
            font-size: 14px;
        }}
        .info-label {{
            font-weight: 600;
            color: #4b5563;
            display: inline-block;
            min-width: 140px;
        }}
        .info-value {{
            color: #1f2937;
        }}
        .items-table {{
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            background: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
        }}
        .items-table thead {{
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
        }}
        .items-table th {{
            padding: 18px 20px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        .items-table th:last-child,
        .items-table td:last-child {{
            text-align: right;
        }}
        .items-table tbody tr {{
            border-bottom: 1px solid #e5e7eb;
        }}
        .items-table tbody tr:hover {{
            background: #f9fafb;
        }}
        .items-table td {{
            padding: 18px 20px;
            font-size: 14px;
            color: #1f2937;
        }}
        .items-table tfoot {{
            background: #f9fafb;
            border-top: 2px solid #3b82f6;
        }}
        .items-table tfoot td {{
            padding: 20px;
            font-weight: 700;
            font-size: 16px;
        }}
        .total-row {{
            font-size: 20px;
            color: #1e40af;
        }}
        .footer-section {{
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
        }}
        .footer-text {{
            font-size: 13px;
            color: #6b7280;
            line-height: 1.8;
            margin-bottom: 10px;
        }}
        .footer-contact {{
            font-size: 12px;
            color: #9ca3af;
        }}
        .footer-contact a {{
            color: #3b82f6;
            text-decoration: none;
        }}
        .footer-contact a:hover {{
            text-decoration: underline;
        }}
        .print-button {{
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #3b82f6;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: all 0.3s;
        }}
        .print-button:hover {{
            background: #2563eb;
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }}
        @media print {{
            .print-button {{
                display: none;
            }}
            .invoice-container {{
                box-shadow: none;
                padding: 0;
            }}
        }}
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="company-info">
                <div class="company-name">VTCBuilder</div>
                <div class="company-details">
                    Plateforme SaaS pour Chauffeurs VTC<br>
                    support@vtcbuilder.com<br>
                    www.vtcbuilder.com
                </div>
            </div>
            <div class="invoice-info">
                <div class="invoice-title">FACTURE</div>
                <div class="invoice-number">N° {invoice.invoice_number}</div>
                <div class="status-badge">{status_display}</div>
            </div>
        </div>
        
        <div class="content-grid">
            <div class="section">
                <div class="section-title">Facturé à</div>
                <div class="info-item">
                    <span class="info-label">Nom:</span>
                    <span class="info-value">{invoice.tenant.name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">{invoice.tenant.email}</span>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Détails de la facture</div>
                <div class="info-item">
                    <span class="info-label">Date d'émission:</span>
                    <span class="info-value">{invoice.issue_date.strftime('%d/%m/%Y')}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Date d'échéance:</span>
                    <span class="info-value">{invoice.due_date.strftime('%d/%m/%Y')}</span>
                </div>
                {f'<div class="info-item"><span class="info-label">Date de paiement:</span><span class="info-value">{invoice.paid_at.strftime("%d/%m/%Y")}</span></div>' if invoice.paid_at else ''}
            </div>
        </div>
        
        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th style="text-align: right;">Sous-total</th>
                    <th style="text-align: right;">TVA</th>
                    <th style="text-align: right;">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>{plan_name}</strong></td>
                    <td style="text-align: right;">{invoice.subtotal:.2f} {invoice.currency}</td>
                    <td style="text-align: right;">{invoice.tax:.2f} {invoice.currency}</td>
                    <td style="text-align: right;"><strong>{invoice.total:.2f} {invoice.currency}</strong></td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3" style="text-align: right; font-size: 16px;">TOTAL TTC:</td>
                    <td class="total-row">{invoice.total:.2f} {invoice.currency}</td>
                </tr>
            </tfoot>
        </table>
        
        <div class="footer-section">
            <div class="footer-text">
                <strong>Merci de votre confiance !</strong>
            </div>
            <div class="footer-contact">
                Pour toute question concernant cette facture, contactez-nous à<br>
                <a href="mailto:support@vtcbuilder.com">support@vtcbuilder.com</a>
            </div>
        </div>
    </div>
    
    <button class="print-button no-print" onclick="window.print()">🖨️ Imprimer / Enregistrer en PDF</button>
</body>
</html>
        """
        
        response = HttpResponse(html_content, content_type='text/html')
        response['Content-Disposition'] = f'inline; filename="facture-{invoice.invoice_number}.html"'
        add_cors_headers(response, request)
        return response

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate a new invoice for a subscription"""
        from django.utils.crypto import get_random_string
        
        subscription_id = request.data.get('subscription_id')
        
        if not subscription_id:
            return Response(
                {'error': 'subscription_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            subscription = Subscription.objects.get(id=subscription_id)
        except Subscription.DoesNotExist:
            return Response(
                {'error': 'Subscription not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permissions
        user = request.user
        if not user.is_super_admin():
            if not user.is_tenant_admin() or user.tenant != subscription.tenant:
                return Response(
                    {'error': 'Vous n\'avez pas la permission de générer une facture pour cet abonnement'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Generate invoice number
        invoice_number = f"INV-{subscription.tenant.slug.upper()}-{timezone.now().strftime('%Y%m%d')}-{get_random_string(length=6, allowed_chars='0123456789').upper()}"
        
        # Calculate amounts
        if subscription.billing_cycle == 'monthly':
            subtotal = subscription.plan.price_monthly
        else:
            subtotal = subscription.plan.price_yearly if subscription.plan.price_yearly else subscription.plan.price_monthly * 12
        
        tax = subtotal * Decimal('0.20')  # 20% TVA
        total = subtotal + tax
        
        # Calculate dates
        now = timezone.now()
        due_date = now + timedelta(days=30)  # 30 days payment term
        
        # Create invoice
        invoice = Invoice.objects.create(
            subscription=subscription,
            tenant=subscription.tenant,
            invoice_number=invoice_number,
            status='open',
            subtotal=subtotal,
            tax=tax,
            total=total,
            currency='EUR',
            issue_date=now,
            due_date=due_date,
        )
        
        return Response({
            'message': 'Facture générée avec succès',
            'invoice': InvoiceSerializer(invoice).data
        }, status=status.HTTP_201_CREATED)


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing payments"""
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter payments based on user role and query parameters"""
        try:
            user = self.request.user
            queryset = None
            
            try:
                if user.is_super_admin():
                    queryset = Payment.objects.all()
                elif hasattr(user, 'is_tenant_admin') and user.is_tenant_admin() and hasattr(user, 'tenant') and user.tenant:
                    queryset = Payment.objects.filter(tenant=user.tenant)
                else:
                    return Payment.objects.none()
            except Exception as e:
                logger.error(f"Error checking user permissions in PaymentViewSet: {e}", exc_info=True)
                return Payment.objects.none()
            
            if queryset is None:
                return Payment.objects.none()
            
            # Apply filters from query parameters
            tenant_id = self.request.query_params.get('tenant_id')
            if tenant_id:
                try:
                    queryset = queryset.filter(tenant_id=int(tenant_id))
                except (ValueError, TypeError):
                    pass
            
            status = self.request.query_params.get('status')
            if status:
                queryset = queryset.filter(status=status)
            
            payment_method = self.request.query_params.get('payment_method')
            if payment_method:
                queryset = queryset.filter(payment_method=payment_method)
            
            date_from = self.request.query_params.get('date_from')
            if date_from:
                try:
                    from datetime import datetime
                    date_from_obj = datetime.strptime(date_from, '%Y-%m-%d')
                    queryset = queryset.filter(created_at__gte=date_from_obj)
                except (ValueError, TypeError):
                    pass
            
            date_to = self.request.query_params.get('date_to')
            if date_to:
                try:
                    from datetime import datetime
                    date_to_obj = datetime.strptime(date_to, '%Y-%m-%d')
                    queryset = queryset.filter(created_at__lte=date_to_obj)
                except (ValueError, TypeError):
                    pass
            
            # Apply sorting
            order_by = self.request.query_params.get('order_by', '-created_at')
            ordering = self.request.query_params.get('ordering', 'desc')
            
            # Validate order_by field
            allowed_order_fields = ['created_at', 'amount', 'status', 'payment_method']
            if order_by.lstrip('-') not in allowed_order_fields:
                order_by = '-created_at'
            
            # Apply ordering direction
            if ordering == 'asc':
                if order_by.startswith('-'):
                    order_by = order_by.lstrip('-')
            elif ordering == 'desc':
                if not order_by.startswith('-'):
                    order_by = f'-{order_by}'
            
            queryset = queryset.order_by(order_by, '-id')
            
            return queryset
        except Exception as e:
            logger.error(f"Error in PaymentViewSet.get_queryset: {e}", exc_info=True)
            return Payment.objects.none()
    
    def list(self, request, *args, **kwargs):
        """List payments with error handling"""
        try:
            response = super().list(request, *args, **kwargs)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            logger.error(f"Error in PaymentViewSet.list: {e}", exc_info=True)
            error_response = Response({
                'error': 'An error occurred while fetching payments',
                'message': str(e) if settings.DEBUG else 'Unable to load payments'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            add_cors_headers(error_response, request)
            return error_response


class PaymentMethodViewSet(viewsets.ModelViewSet):
    """ViewSet for managing payment methods"""
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter payment methods based on user role"""
        try:
            user = self.request.user
            
            try:
                # Super admin can see all payment methods
                if user.is_super_admin():
                    return PaymentMethod.objects.all()
            except Exception as e:
                logger.error(f"Error checking super admin in PaymentMethodViewSet: {e}", exc_info=True)
            
            # Tenant users see only enabled payment methods
            return PaymentMethod.objects.filter(is_active=True, is_enabled=True)
        except Exception as e:
            logger.error(f"Error in PaymentMethodViewSet.get_queryset: {e}", exc_info=True)
            return PaymentMethod.objects.none()
    
    def list(self, request, *args, **kwargs):
        """Override list to always return empty list instead of 404"""
        try:
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            response = Response(serializer.data)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            logger.error(f"Error in PaymentMethodViewSet.list: {e}", exc_info=True)
            error_response = Response({
                'error': 'An error occurred while fetching payment methods',
                'message': str(e) if settings.DEBUG else 'Unable to load payment methods'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            add_cors_headers(error_response, request)
            return error_response

    def create(self, request, *args, **kwargs):
        """Only super admin can create payment methods"""
        if not request.user.is_super_admin():
            return Response(
                {'error': 'Only super admin can create payment methods'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Only super admin can update payment methods"""
        if not request.user.is_super_admin():
            return Response(
                {'error': 'Only super admin can update payment methods'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Only super admin can delete payment methods"""
        if not request.user.is_super_admin():
            return Response(
                {'error': 'Only super admin can delete payment methods'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def toggle_enabled(self, request, pk=None):
        """Toggle payment method enabled status"""
        payment_method = self.get_object()
        
        if not request.user.is_super_admin():
            return Response(
                {'error': 'Only super admin can toggle payment methods'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        payment_method.is_enabled = not payment_method.is_enabled
        payment_method.save(update_fields=['is_enabled'])
        
        return Response({
            'status': 'Payment method updated',
            'payment_method': PaymentMethodSerializer(payment_method).data
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def billing_stats(request):
    """Get comprehensive billing statistics (super admin only)"""
    try:
        if not request.user.is_super_admin():
            error_response = Response(
                {'error': 'Only super admin can view billing stats'},
                status=status.HTTP_403_FORBIDDEN
            )
            add_cors_headers(error_response, request)
            return error_response
        
        now = timezone.now()
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)
        last_month_end = this_month_start - timedelta(seconds=1)
        this_year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # ========== REVENUS ==========
        total_revenue = Payment.objects.filter(status='succeeded').aggregate(total=Sum('amount'))['total'] or Decimal('0')
        monthly_revenue = Payment.objects.filter(status='succeeded', paid_at__gte=this_month_start).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        last_month_revenue = Payment.objects.filter(status='succeeded', paid_at__gte=last_month_start, paid_at__lte=last_month_end).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        yearly_revenue = Payment.objects.filter(status='succeeded', paid_at__gte=this_year_start).aggregate(total=Sum('amount'))['total'] or Decimal('0')
        
        # ========== ABONNEMENTS ==========
        total_subscriptions = Subscription.objects.count()
        active_subscriptions = Subscription.objects.filter(status='active').count()
        trial_subscriptions = Subscription.objects.filter(status='trial').count()
        cancelled_subscriptions = Subscription.objects.filter(status='cancelled').count()
        past_due_subscriptions = Subscription.objects.filter(status='past_due').count()
        expired_subscriptions = Subscription.objects.filter(status='expired').count()
        
        # Répartition par cycle de facturation
        monthly_billing = Subscription.objects.filter(billing_cycle='monthly').count()
        yearly_billing = Subscription.objects.filter(billing_cycle='yearly').count()
        
        # Plans tarifaires les plus utilisés
        from django.db.models import Count
        plan_usage = PricingPlan.objects.annotate(
            subscription_count=Count('subscriptions')
        ).order_by('-subscription_count')[:5]
        popular_plans = [
            {
                'id': plan.id,
                'name': plan.name,
                'subscriptions_count': plan.subscription_count,
                'price_monthly': float(plan.price_monthly),
            }
            for plan in plan_usage
        ]
        
        # ========== FACTURES ==========
        total_invoices = Invoice.objects.count()
        paid_invoices = Invoice.objects.filter(status='paid').count()
        unpaid_invoices = Invoice.objects.filter(status__in=['open', 'draft']).count()
        overdue_invoices = Invoice.objects.filter(status__in=['open', 'draft'], due_date__lt=now).count()
        
        unpaid_amount = Invoice.objects.filter(status__in=['open', 'draft']).aggregate(total=Sum('total'))['total'] or Decimal('0')
        overdue_amount = Invoice.objects.filter(status__in=['open', 'draft'], due_date__lt=now).aggregate(total=Sum('total'))['total'] or Decimal('0')
        
        # Revenus par factures
        invoice_revenue = Invoice.objects.filter(status='paid').aggregate(total=Sum('total'))['total'] or Decimal('0')
        
        # ========== PAIEMENTS ==========
        total_payments = Payment.objects.count()
        succeeded_payments = Payment.objects.filter(status='succeeded').count()
        pending_payments = Payment.objects.filter(status='pending').count()
        failed_payments = Payment.objects.filter(status='failed').count()
        
        # Répartition par méthode de paiement
        payment_methods_dist = Payment.objects.values('method').annotate(
            count=Count('id'),
            total_amount=Sum('amount')
        ).order_by('-count')
        payment_methods_stats = [
            {
                'method': pm['method'],
                'count': pm['count'],
                'total_amount': float(pm.get('total_amount', 0) or 0),
            }
            for pm in payment_methods_dist
        ]
        
        # Revenus des 12 derniers mois
        monthly_revenues = []
        for i in range(11, -1, -1):
            month_start = (now - timedelta(days=30*i)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            if i == 0:
                month_end = now
            else:
                next_month = month_start + timedelta(days=32)
                month_end = next_month.replace(day=1) - timedelta(seconds=1)
            
            month_revenue = Payment.objects.filter(
                status='succeeded',
                paid_at__gte=month_start,
                paid_at__lte=month_end
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
            
            monthly_revenues.append({
                'month': month_start.strftime('%Y-%m'),
                'label': month_start.strftime('%b %Y'),
                'revenue': float(month_revenue),
            })
        
        # ========== STATISTIQUES GLOBALES ==========
        # Note: total_tenants est retiré car c'est déjà dans /admin/stats
        tenants_with_subscription = Subscription.objects.values('tenant').distinct().count()
        
        # Revenu récurrent mensuel (MRR)
        mrr = Decimal('0')
        for sub in Subscription.objects.filter(status='active'):
            if sub.billing_cycle == 'monthly':
                mrr += sub.plan.price_monthly
            else:  # yearly
                mrr += sub.plan.price_yearly / 12 if sub.plan.price_yearly else sub.plan.price_monthly
        
        response = Response({
            # Revenus
            'total_revenue': float(total_revenue),
            'monthly_revenue': float(monthly_revenue),
            'last_month_revenue': float(last_month_revenue),
            'yearly_revenue': float(yearly_revenue),
            'monthly_recurring_revenue': float(mrr),
            'monthly_revenues_chart': monthly_revenues,
            
            # Abonnements
            'total_subscriptions': total_subscriptions,
            'active_subscriptions': active_subscriptions,
            'trial_subscriptions': trial_subscriptions,
            'cancelled_subscriptions': cancelled_subscriptions,
            'past_due_subscriptions': past_due_subscriptions,
            'expired_subscriptions': expired_subscriptions,
            'monthly_billing': monthly_billing,
            'yearly_billing': yearly_billing,
            'popular_plans': popular_plans,
            
            # Factures
            'total_invoices': total_invoices,
            'paid_invoices': paid_invoices,
            'unpaid_invoices': unpaid_invoices,
            'overdue_invoices': overdue_invoices,
            'unpaid_amount': float(unpaid_amount),
            'overdue_amount': float(overdue_amount),
            'invoice_revenue': float(invoice_revenue),
            
            # Paiements
            'total_payments': total_payments,
            'succeeded_payments': succeeded_payments,
            'pending_payments': pending_payments,
            'failed_payments': failed_payments,
            'payment_methods_stats': payment_methods_stats,
            
            # Tenants (seulement les stats liées aux abonnements)
            'tenants_with_subscription': tenants_with_subscription,
        })
        add_cors_headers(response, request)
        return response
    except Exception as e:
        logger.error(f"Error in billing_stats: {e}", exc_info=True)
        error_response = Response({
            'error': 'An error occurred while fetching billing statistics',
            'message': str(e) if settings.DEBUG else 'Unable to load billing statistics',
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        add_cors_headers(error_response, request)
        return error_response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unpaid_items(request):
    """Get all unpaid items (subscriptions and invoices) - super admin only"""
    if not request.user.is_super_admin():
        return Response(
            {'error': 'Only super admin can view unpaid items'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Past due subscriptions
    past_due_subscriptions = Subscription.objects.filter(status='past_due').select_related('tenant', 'plan')
    
    # Unpaid invoices (open or draft)
    unpaid_invoices = Invoice.objects.filter(
        status__in=['open', 'draft']
    ).select_related('tenant', 'subscription', 'subscription__plan').order_by('-due_date')
    
    # Overdue invoices (past due_date)
    now = timezone.now()
    overdue_invoices = Invoice.objects.filter(
        status__in=['open', 'draft'],
        due_date__lt=now
    ).select_related('tenant', 'subscription', 'subscription__plan').order_by('-due_date')
    
    from .serializers import SubscriptionSerializer, InvoiceSerializer
    
    return Response({
        'past_due_subscriptions': [
            SubscriptionSerializer(sub).data for sub in past_due_subscriptions
        ],
        'unpaid_invoices': [
            InvoiceSerializer(inv).data for inv in unpaid_invoices
        ],
        'overdue_invoices': [
            InvoiceSerializer(inv).data for inv in overdue_invoices
        ],
        'stats': {
            'past_due_count': past_due_subscriptions.count(),
            'unpaid_invoices_count': unpaid_invoices.count(),
            'overdue_invoices_count': overdue_invoices.count(),
            'total_unpaid_amount': float(
                unpaid_invoices.aggregate(Sum('total'))['total__sum'] or 0
            ),
            'total_overdue_amount': float(
                overdue_invoices.aggregate(Sum('total'))['total__sum'] or 0
            ),
        }
    })


class InvoiceTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing invoice templates"""
    queryset = InvoiceTemplate.objects.all()
    serializer_class = InvoiceTemplateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter templates based on user role - always use public schema"""
        try:
            from django_tenants.utils import schema_context
            
            user = self.request.user
            
            # InvoiceTemplate is a shared model, always access from public schema
            with schema_context('public'):
                if user.is_super_admin():
                    return InvoiceTemplate.objects.all()
                
                # Tenant users see only active templates
                return InvoiceTemplate.objects.filter(is_active=True)
        except Exception as e:
            logger.error(f"Error in InvoiceTemplateViewSet.get_queryset: {e}", exc_info=True)
            try:
                from django_tenants.utils import schema_context
                with schema_context('public'):
                    return InvoiceTemplate.objects.none()
            except:
                return InvoiceTemplate.objects.none()
    
    def list(self, request, *args, **kwargs):
        """List templates with error handling"""
        try:
            from django_tenants.utils import schema_context
            
            # Ensure we're in public schema context
            with schema_context('public'):
                response = super().list(request, *args, **kwargs)
                add_cors_headers(response, request)
                return response
        except Exception as e:
            logger.error(f"Error in InvoiceTemplateViewSet.list: {e}", exc_info=True)
            error_response = Response({
                'error': 'An error occurred while fetching invoice templates',
                'message': str(e) if settings.DEBUG else 'Unable to load templates'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            add_cors_headers(error_response, request)
            return error_response
    
    def create(self, request, *args, **kwargs):
        """Only super admin can create templates"""
        if not request.user.is_super_admin():
            error_response = Response(
                {'error': 'Only super admin can create invoice templates'},
                status=status.HTTP_403_FORBIDDEN
            )
            add_cors_headers(error_response, request)
            return error_response
        
        from django_tenants.utils import schema_context
        with schema_context('public'):
            response = super().create(request, *args, **kwargs)
            add_cors_headers(response, request)
            return response
    
    def update(self, request, *args, **kwargs):
        """Only super admin can update templates"""
        if not request.user.is_super_admin():
            error_response = Response(
                {'error': 'Only super admin can update invoice templates'},
                status=status.HTTP_403_FORBIDDEN
            )
            add_cors_headers(error_response, request)
            return error_response
        
        from django_tenants.utils import schema_context
        with schema_context('public'):
            response = super().update(request, *args, **kwargs)
            add_cors_headers(response, request)
            return response
    
    def destroy(self, request, *args, **kwargs):
        """Only super admin can delete templates"""
        if not request.user.is_super_admin():
            error_response = Response(
                {'error': 'Only super admin can delete invoice templates'},
                status=status.HTTP_403_FORBIDDEN
            )
            add_cors_headers(error_response, request)
            return error_response
        
        from django_tenants.utils import schema_context
        with schema_context('public'):
            response = super().destroy(request, *args, **kwargs)
            add_cors_headers(response, request)
            return response
    
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """Set template as default"""
        if not request.user.is_super_admin():
            error_response = Response(
                {'error': 'Only super admin can set default template'},
                status=status.HTTP_403_FORBIDDEN
            )
            add_cors_headers(error_response, request)
            return error_response
        
        from django_tenants.utils import schema_context
        with schema_context('public'):
            template = self.get_object()
            # Unset other defaults
            InvoiceTemplate.objects.filter(is_default=True).update(is_default=False)
            template.is_default = True
            template.save()
            
            response = Response({
                'status': 'Template set as default',
                'template': InvoiceTemplateSerializer(template).data
            })
            add_cors_headers(response, request)
            return response
    
    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """Preview template with sample invoice data"""
        from django_tenants.utils import schema_context
        
        with schema_context('public'):
            template = self.get_object()
            
            # Create sample invoice data
            sample_data = {
                'invoice_number': 'INV-SAMPLE-001',
                'tenant_name': 'Exemple Tenant',
                'tenant_email': 'exemple@tenant.com',
                'issue_date': '01/01/2024',
                'due_date': '31/01/2024',
                'paid_at': None,
                'subtotal': 100.0,
                'tax': 20.0,
                'total': 120.0,
                'currency': 'EUR',
                'status': 'Ouverte',
                'plan_name': 'Plan Business',
                'subscription_id': 1,
            }
            
            from django.template import Template, Context
            template_obj = Template(template.html_template)
            context = Context(sample_data)
            html = template_obj.render(context)
            
            if template.css_styles:
                html = f'<style>{template.css_styles}</style>\n{html}'
            
            response = Response({
                'html': html,
                'template': InvoiceTemplateSerializer(template).data
            })
            add_cors_headers(response, request)
            return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_card_registration(request):
    """
    Complete card registration after setup intent confirmation
    Attaches payment method to subscription for future payments
    """
    try:
        subscription_id = request.data.get('subscription_id')
        payment_method_id = request.data.get('payment_method_id')
        
        if not subscription_id or not payment_method_id:
            error_response = Response(
                {'error': 'subscription_id et payment_method_id sont requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
            add_cors_headers(error_response, request)
            return error_response
        
        # Get subscription
        try:
            subscription = Subscription.objects.get(id=subscription_id)
        except Subscription.DoesNotExist:
            error_response = Response(
                {'error': 'Abonnement non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
            add_cors_headers(error_response, request)
            return error_response
        
        # Check user has access to this subscription
        user = request.user
        if not user.is_super_admin():
            if not hasattr(user, 'tenant') or user.tenant != subscription.tenant:
                error_response = Response(
                    {'error': 'Accès non autorisé à cet abonnement'},
                    status=status.HTTP_403_FORBIDDEN
                )
                add_cors_headers(error_response, request)
                return error_response
        
        # Attach payment method to subscription
        try:
            from .stripe_service import StripeService
            result = StripeService.attach_payment_method_to_subscription(
                subscription,
                payment_method_id
            )
            
            response = Response({
                'message': 'Carte bancaire enregistrée avec succès ! Aucun prélèvement ne sera effectué pendant votre essai gratuit.',
                'success': True,
                'subscription': SubscriptionSerializer(subscription).data,
            }, status=status.HTTP_200_OK)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            logger.error(f"Error attaching payment method: {e}", exc_info=True)
            error_response = Response(
                {'error': f'Erreur lors de l\'enregistrement de la carte : {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            add_cors_headers(error_response, request)
            return error_response
            
    except Exception as e:
        logger.error(f"Error in complete_card_registration: {e}", exc_info=True)
        error_response = Response(
            {'error': f'Erreur lors de l\'enregistrement de la carte : {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        add_cors_headers(error_response, request)
        return error_response

