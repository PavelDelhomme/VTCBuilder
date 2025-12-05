"""
Serializers for Security models
"""
from rest_framework import serializers
from .models import WAFRule, WAFLog, SecurityAlert, FirewallRule, SecuritySettings


class WAFRuleSerializer(serializers.ModelSerializer):
    """Serializer for WAF Rule"""
    
    class Meta:
        model = WAFRule
        fields = [
            'id', 'name', 'description', 'rule_type', 'status',
            'config', 'priority', 'action', 'created_at', 'updated_at',
            'created_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class WAFLogSerializer(serializers.ModelSerializer):
    """Serializer for WAF Log"""
    matched_rule_name = serializers.CharField(source='matched_rule.name', read_only=True)
    threat_type = serializers.SerializerMethodField()
    
    def get_threat_type(self, obj):
        """Get threat type from matched rule"""
        if obj.matched_rule:
            return obj.matched_rule.rule_type
        return None
    
    class Meta:
        model = WAFLog
        fields = [
            'id', 'ip_address', 'user_agent', 'request_method', 'request_path',
            'request_headers', 'request_body', 'matched_rule', 'matched_rule_name',
            'threat_type', 'action', 'severity', 'reason', 'response_status', 'response_time_ms',
            'timestamp', 'tenant'
        ]
        read_only_fields = ['id', 'timestamp']


class SecurityAlertSerializer(serializers.ModelSerializer):
    """Serializer for Security Alert"""
    related_log_id = serializers.IntegerField(source='related_log.id', read_only=True)
    related_rule_name = serializers.CharField(source='related_rule.name', read_only=True)
    
    class Meta:
        model = SecurityAlert
        fields = [
            'id', 'alert_type', 'severity', 'status', 'title', 'message',
            'ip_address', 'related_log', 'related_log_id', 'related_rule',
            'related_rule_name', 'notified', 'notification_sent_at',
            'created_at', 'acknowledged_at', 'acknowledged_by', 'resolved_at'
        ]
        read_only_fields = ['id', 'created_at', 'notification_sent_at']


class FirewallRuleSerializer(serializers.ModelSerializer):
    """Serializer for Firewall Rule"""
    
    class Meta:
        model = FirewallRule
        fields = [
            'id', 'name', 'description', 'rule_type', 'status',
            'config', 'priority', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SecuritySettingsSerializer(serializers.ModelSerializer):
    """Serializer for Security Settings"""
    
    class Meta:
        model = SecuritySettings
        fields = [
            'id', 'waf_enabled', 'waf_mode', 'rate_limit_enabled',
            'rate_limit_requests_per_minute', 'rate_limit_requests_per_hour',
            'ip_reputation_enabled', 'block_known_bad_ips', 'log_all_requests',
            'log_retention_days', 'alert_on_critical', 'alert_on_high',
            'alert_on_medium', 'alert_email', 'auto_block_after_attempts',
            'auto_block_duration_hours', 'updated_at', 'updated_by'
        ]
        read_only_fields = ['id', 'updated_at']

