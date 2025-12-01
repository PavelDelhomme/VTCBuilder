"""
Serializers for analytics models
"""
from rest_framework import serializers
from .models import UserAction, FeatureUsage


class UserActionSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    
    class Meta:
        model = UserAction
        fields = [
            'id', 'user', 'user_email', 'tenant', 'tenant_name',
            'action_type', 'action_name', 'resource_type', 'resource_id',
            'metadata', 'ip_address', 'user_agent', 'created_at'
        ]
        read_only_fields = ['created_at']


class FeatureUsageSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    
    class Meta:
        model = FeatureUsage
        fields = [
            'id', 'tenant', 'tenant_name', 'feature_name',
            'usage_count', 'last_used_at', 'first_used_at'
        ]
        read_only_fields = ['first_used_at']

