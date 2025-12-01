"""
API URL Configuration
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Import views
from tenants.views import (
    TenantViewSet, UserViewSet, UserProfileView,
    FeatureViewSet, UserFeatureViewSet,
    login_view, register_view, register_with_plan_view, logout_view,
    request_password_reset_view, reset_password_view, verify_reset_token_view,
    verify_invitation_token_view, complete_invitation_view
)
from pages.views import PageViewSet
from services.views import ServiceViewSet
from bookings.views import BookingViewSet
from media.views import MediaViewSet, TemplateViewSet
try:
    from blocks.views import BlockTypeViewSet, BlockTemplateViewSet, CallToActionViewSet
    BLOCKS_AVAILABLE = True
except (ImportError, RuntimeError) as e:
    # Si l'app blocks n'est pas disponible, on laisse vide
    BLOCKS_AVAILABLE = False
    BlockTypeViewSet = None
    BlockTemplateViewSet = None
    CallToActionViewSet = None

from billing.views import (
    PricingPlanViewSet, SubscriptionViewSet,
    InvoiceViewSet, PaymentViewSet, PaymentMethodViewSet, InvoiceTemplateViewSet,
    billing_stats, unpaid_items, complete_card_registration
)
from settings_app.views import system_settings_view, system_settings_test_email_view, system_settings_test_stripe_view
from billing.webhooks import stripe_webhook
try:
    from projects.views import ProjectViewSet
    PROJECTS_AVAILABLE = True
except (ImportError, RuntimeError) as e:
    PROJECTS_AVAILABLE = False
    ProjectViewSet = None
from .views import DashboardView, DetailedStatsView, block_usage_tracking_view

# Router for viewsets
router = DefaultRouter()
router.register(r'tenants', TenantViewSet, basename='tenant')
router.register(r'users', UserViewSet, basename='user')
router.register(r'features', FeatureViewSet, basename='feature')
router.register(r'user-features', UserFeatureViewSet, basename='user-feature')
router.register(r'pages', PageViewSet, basename='page')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'media', MediaViewSet, basename='media')
router.register(r'templates', TemplateViewSet, basename='template')
if BLOCKS_AVAILABLE and BlockTypeViewSet:
    router.register(r'blocks/types', BlockTypeViewSet, basename='block-type')
    router.register(r'blocks/templates', BlockTemplateViewSet, basename='block-template')
if BLOCKS_AVAILABLE and CallToActionViewSet:
    router.register(r'blocks/call-to-actions', CallToActionViewSet, basename='call-to-action')
if PROJECTS_AVAILABLE and ProjectViewSet:
    router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'pricing-plans', PricingPlanViewSet, basename='pricing-plan')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'payment-methods', PaymentMethodViewSet, basename='payment-method')
router.register(r'invoice-templates', InvoiceTemplateViewSet, basename='invoice-template')
# System settings is handled as a singleton with a direct view function above

urlpatterns = [
    # IMPORTANT: Specific routes must come BEFORE the router to avoid conflicts
    
    # Stats - must come before router
    path('stats/detailed/', DetailedStatsView.as_view(), name='detailed-stats'),
    path('stats/detailed', DetailedStatsView.as_view(), name='detailed-stats-no-slash'),
    
    # Dashboard
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('dashboard', DashboardView.as_view(), name='dashboard-no-slash'),
    
    # Billing stats - must come before router
    path('billing/stats/', billing_stats, name='billing-stats-slash'),
    path('billing/stats', billing_stats, name='billing-stats'),
    path('billing/unpaid-items/', unpaid_items, name='billing-unpaid-items-slash'),
    path('billing/unpaid-items', unpaid_items, name='billing-unpaid-items'),
    
    # System Settings - must come before router for singleton access
    path('system-settings/', system_settings_view, name='system-settings-slash'),
    path('system-settings', system_settings_view, name='system-settings'),
    path('system-settings/test_email/', system_settings_test_email_view, name='system-settings-test-email-slash'),
    path('system-settings/test_email', system_settings_test_email_view, name='system-settings-test-email'),
    path('system-settings/test_stripe/', system_settings_test_stripe_view, name='system-settings-test-stripe-slash'),
    path('system-settings/test_stripe', system_settings_test_stripe_view, name='system-settings-test-stripe'),
    
    # Authentication (support both with and without trailing slash)
    path('auth/login/', login_view, name='login-slash'),
    path('auth/login', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout-slash'),
    path('auth/logout', logout_view, name='logout'),
    path('auth/register/', register_view, name='register-slash'),
    path('auth/register', register_view, name='register'),
    path('auth/register-with-plan/', register_with_plan_view, name='register-with-plan-slash'),
    path('auth/register-with-plan', register_with_plan_view, name='register-with-plan'),
    path('auth/me/', UserProfileView.as_view(), name='profile-slash'),
    path('auth/me', UserProfileView.as_view(), name='profile'),
    path('auth/password-reset/request/', request_password_reset_view, name='password-reset-request-slash'),
    path('auth/password-reset/request', request_password_reset_view, name='password-reset-request'),
    path('auth/reset-password/', reset_password_view, name='reset-password-slash'),
    path('auth/reset-password', reset_password_view, name='reset-password'),
    path('auth/verify-reset-token/', verify_reset_token_view, name='verify-reset-token-slash'),
    path('auth/verify-reset-token', verify_reset_token_view, name='verify-reset-token'),
    path('auth/verify-invitation/', verify_invitation_token_view, name='verify-invitation-slash'),
    path('auth/verify-invitation', verify_invitation_token_view, name='verify-invitation'),
    path('auth/complete-invitation/', complete_invitation_view, name='complete-invitation-slash'),
    path('auth/complete-invitation', complete_invitation_view, name='complete-invitation'),
    
    # Stripe Webhooks
    path('billing/webhooks/stripe/', stripe_webhook, name='stripe-webhook-slash'),
    path('billing/webhooks/stripe', stripe_webhook, name='stripe-webhook'),
    
    # Analytics
    path('analytics/block-usage/', block_usage_tracking_view, name='analytics-block-usage-slash'),
    path('analytics/block-usage', block_usage_tracking_view, name='analytics-block-usage'),

    # Include router URLs LAST (order matters!)
    path('', include(router.urls)),
]

