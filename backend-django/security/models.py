"""
Security models for WAF, Firewall, and Security Monitoring
"""
from django.db import models
from django.utils import timezone
from django.contrib.postgres.fields import ArrayField


class WAFRule(models.Model):
    """
    Web Application Firewall Rule
    """
    RULE_TYPES = [
        ('ip_whitelist', 'IP Whitelist'),
        ('ip_blacklist', 'IP Blacklist'),
        ('rate_limit', 'Rate Limiting'),
        ('sql_injection', 'SQL Injection Protection'),
        ('xss', 'XSS Protection'),
        ('path_traversal', 'Path Traversal Protection'),
        ('file_upload', 'File Upload Protection'),
        ('custom', 'Custom Rule'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('testing', 'Testing'),
    ]
    
    name = models.CharField(max_length=255, help_text="Nom de la règle")
    description = models.TextField(blank=True, help_text="Description de la règle")
    rule_type = models.CharField(max_length=50, choices=RULE_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Rule configuration (JSON)
    config = models.JSONField(default=dict, help_text="Configuration de la règle (IPs, patterns, etc.)")
    
    # Priority (lower = higher priority)
    priority = models.IntegerField(default=100, help_text="Priorité de la règle (plus bas = plus prioritaire)")
    
    # Action when rule matches
    action = models.CharField(
        max_length=20,
        choices=[
            ('allow', 'Allow'),
            ('block', 'Block'),
            ('challenge', 'Challenge (CAPTCHA)'),
            ('log', 'Log Only'),
        ],
        default='block'
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'tenants.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='waf_rules_created'
    )
    
    class Meta:
        db_table = 'waf_rules'
        ordering = ['priority', '-created_at']
        verbose_name = 'Règle WAF'
        verbose_name_plural = 'Règles WAF'
    
    def __str__(self):
        return f"{self.name} ({self.get_rule_type_display()})"


class WAFLog(models.Model):
    """
    WAF Security Logs
    """
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    ACTION_CHOICES = [
        ('allowed', 'Allowed'),
        ('blocked', 'Blocked'),
        ('challenged', 'Challenged'),
        ('logged', 'Logged'),
    ]
    
    # Request information
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    request_method = models.CharField(max_length=10)
    request_path = models.TextField()
    request_headers = models.JSONField(default=dict)
    request_body = models.TextField(blank=True)
    
    # WAF information
    matched_rule = models.ForeignKey(
        WAFRule,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='logs'
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='medium')
    reason = models.TextField(blank=True, help_text="Raison du blocage/action")
    
    # Response information
    response_status = models.IntegerField(null=True, blank=True)
    response_time_ms = models.FloatField(null=True, blank=True)
    
    # Metadata
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='waf_logs'
    )
    
    class Meta:
        db_table = 'waf_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp', 'ip_address']),
            models.Index(fields=['-timestamp', 'severity']),
            models.Index(fields=['-timestamp', 'action']),
        ]
        verbose_name = 'Log WAF'
        verbose_name_plural = 'Logs WAF'
    
    def __str__(self):
        return f"{self.ip_address} - {self.request_path} - {self.get_action_display()} ({self.timestamp})"


class SecurityAlert(models.Model):
    """
    Security Alerts and Notifications
    """
    ALERT_TYPES = [
        ('attack_detected', 'Attack Detected'),
        ('rate_limit_exceeded', 'Rate Limit Exceeded'),
        ('suspicious_activity', 'Suspicious Activity'),
        ('ip_blocked', 'IP Blocked'),
        ('rule_triggered', 'Rule Triggered'),
        ('system_anomaly', 'System Anomaly'),
    ]
    
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('new', 'New'),
        ('acknowledged', 'Acknowledged'),
        ('resolved', 'Resolved'),
        ('false_positive', 'False Positive'),
    ]
    
    alert_type = models.CharField(max_length=50, choices=ALERT_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # Related information
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    related_log = models.ForeignKey(
        WAFLog,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='alerts'
    )
    related_rule = models.ForeignKey(
        WAFRule,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='alerts'
    )
    
    # Notification settings
    notified = models.BooleanField(default=False)
    notification_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    acknowledged_by = models.ForeignKey(
        'tenants.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='security_alerts_acknowledged'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'security_alerts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at', 'status']),
            models.Index(fields=['-created_at', 'severity']),
        ]
        verbose_name = 'Alerte de Sécurité'
        verbose_name_plural = 'Alertes de Sécurité'
    
    def __str__(self):
        return f"{self.get_alert_type_display()} - {self.title} ({self.get_severity_display()})"


class FirewallRule(models.Model):
    """
    Firewall Rules (Network Level)
    """
    RULE_TYPES = [
        ('ip_whitelist', 'IP Whitelist'),
        ('ip_blacklist', 'IP Blacklist'),
        ('country_whitelist', 'Country Whitelist'),
        ('country_blacklist', 'Country Blacklist'),
        ('asn_whitelist', 'ASN Whitelist'),
        ('asn_blacklist', 'ASN Blacklist'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    rule_type = models.CharField(max_length=50, choices=RULE_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Rule configuration
    config = models.JSONField(default=dict, help_text="IPs, countries, ASNs, etc.")
    
    # Priority
    priority = models.IntegerField(default=100)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'firewall_rules'
        ordering = ['priority', '-created_at']
        verbose_name = 'Règle Firewall'
        verbose_name_plural = 'Règles Firewall'
    
    def __str__(self):
        return f"{self.name} ({self.get_rule_type_display()})"


class SecuritySettings(models.Model):
    """
    Global Security Settings
    """
    # WAF Settings
    waf_enabled = models.BooleanField(default=True, help_text="Activer le WAF")
    waf_mode = models.CharField(
        max_length=20,
        choices=[
            ('blocking', 'Blocking Mode'),
            ('monitoring', 'Monitoring Mode'),
            ('learning', 'Learning Mode'),
        ],
        default='blocking'
    )
    
    # Rate Limiting
    rate_limit_enabled = models.BooleanField(default=True)
    rate_limit_requests_per_minute = models.IntegerField(default=60)
    rate_limit_requests_per_hour = models.IntegerField(default=1000)
    
    # IP Reputation
    ip_reputation_enabled = models.BooleanField(default=True)
    block_known_bad_ips = models.BooleanField(default=True)
    
    # Logging
    log_all_requests = models.BooleanField(default=False, help_text="Logger toutes les requêtes (peut être volumineux)")
    log_retention_days = models.IntegerField(default=30, help_text="Nombre de jours de rétention des logs")
    
    # Alerting
    alert_on_critical = models.BooleanField(default=True)
    alert_on_high = models.BooleanField(default=True)
    alert_on_medium = models.BooleanField(default=False)
    alert_email = models.EmailField(blank=True, help_text="Email pour les alertes de sécurité")
    
    # Auto-blocking
    auto_block_after_attempts = models.IntegerField(default=5, help_text="Bloquer automatiquement après N tentatives")
    auto_block_duration_hours = models.IntegerField(default=24, help_text="Durée du blocage automatique (heures)")
    
    # Metadata
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        'tenants.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='security_settings_updated'
    )
    
    class Meta:
        db_table = 'security_settings'
        verbose_name = 'Paramètres de Sécurité'
        verbose_name_plural = 'Paramètres de Sécurité'
    
    def __str__(self):
        return 'Security Settings'
    
    def save(self, *args, **kwargs):
        # Ensure only one instance exists
        if not self.pk and SecuritySettings.objects.exists():
            existing = SecuritySettings.objects.first()
            for field in self._meta.fields:
                if field.name not in ['id', 'created_at', 'updated_at']:
                    setattr(existing, field.name, getattr(self, field.name))
            existing.save()
            return existing
        super().save(*args, **kwargs)

