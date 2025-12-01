"""
URLs for analytics app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserActionViewSet, FeatureUsageViewSet, usage_stats

router = DefaultRouter()
router.register(r'actions', UserActionViewSet, basename='user-action')
router.register(r'feature-usage', FeatureUsageViewSet, basename='feature-usage')

urlpatterns = [
    path('', include(router.urls)),
    path('usage-stats/', usage_stats, name='usage-stats'),
]

