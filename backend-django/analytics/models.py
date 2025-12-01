"""
Analytics models for tracking user actions
"""
from django.db import models
from django.utils import timezone
from tenants.models import User, Tenant


class UserAction(models.Model):
    """
    Track user actions across the platform
    """
    ACTION_TYPES = [
        ('page_view', 'Page View'),
        ('page_create', 'Page Created'),
        ('page_edit', 'Page Edited'),
        ('page_delete', 'Page Deleted'),
        ('block_add', 'Block Added'),
        ('block_edit', 'Block Edited'),
        ('block_delete', 'Block Deleted'),
        ('block_click', 'Block Clicked'),
        ('service_create', 'Service Created'),
        ('service_edit', 'Service Edited'),
        ('service_delete', 'Service Deleted'),
        ('booking_create', 'Booking Created'),
        ('booking_edit', 'Booking Edited'),
        ('booking_delete', 'Booking Deleted'),
        ('template_use', 'Template Used'),
        ('button_click', 'Button Clicked'),
        ('form_submit', 'Form Submitted'),
        ('login', 'User Login'),
        ('logout', 'User Logout'),
        ('register', 'User Registration'),
        ('subscription_create', 'Subscription Created'),
        ('subscription_update', 'Subscription Updated'),
        ('payment_success', 'Payment Succeeded'),
        ('payment_failed', 'Payment Failed'),
        ('feature_use', 'Feature Used'),
        ('project_create', 'Project Created'),
        ('project_edit', 'Project Edited'),
        ('project_delete', 'Project Deleted'),
        ('cta_click', 'CTA Clicked'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='actions')
    tenant = models.ForeignKey(Tenant, on_delete=models.SET_NULL, null=True, blank=True, related_name='actions')
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    action_name = models.CharField(max_length=255, help_text="Human-readable action name")
    resource_type = models.CharField(max_length=100, blank=True, help_text="Type of resource (e.g., 'page', 'block', 'service')")
    resource_id = models.IntegerField(null=True, blank=True, help_text="ID of the resource")
    metadata = models.JSONField(default=dict, blank=True, help_text="Additional metadata about the action")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_actions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['action_type', '-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['tenant', '-created_at']),
            models.Index(fields=['resource_type', 'resource_id']),
        ]
    
    def __str__(self):
        return f"{self.action_name} by {self.user.email if self.user else 'Anonymous'} at {self.created_at}"


class FeatureUsage(models.Model):
    """
    Track feature usage statistics
    """
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='feature_usages')
    feature_name = models.CharField(max_length=100)
    usage_count = models.IntegerField(default=0)
    last_used_at = models.DateTimeField(null=True, blank=True)
    first_used_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'feature_usages'
        unique_together = ['tenant', 'feature_name']
        ordering = ['-usage_count']
        indexes = [
            models.Index(fields=['tenant', '-usage_count']),
            models.Index(fields=['feature_name', '-usage_count']),
        ]
    
    def __str__(self):
        return f"{self.tenant.name} - {self.feature_name}: {self.usage_count}"

