"""
WAF Middleware for request filtering
"""
import re
import time
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from .models import WAFRule, WAFLog, SecurityAlert, SecuritySettings
from django.core.cache import cache


class WAFMiddleware(MiddlewareMixin):
    """
    Web Application Firewall Middleware
    Filters requests based on WAF rules
    """
    
    # SQL Injection patterns
    SQL_INJECTION_PATTERNS = [
        r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)",
        r"(\b(UNION|OR|AND)\s+\d+)",
        r"(--|#|/\*|\*/)",
        r"(\b(CHAR|ASCII|SUBSTRING|CAST|CONVERT)\s*\()",
    ]
    
    # XSS patterns
    XSS_PATTERNS = [
        r"<script[^>]*>.*?</script>",
        r"javascript:",
        r"on\w+\s*=",
        r"<iframe[^>]*>",
        r"<object[^>]*>",
        r"<embed[^>]*>",
    ]
    
    # Path traversal patterns
    PATH_TRAVERSAL_PATTERNS = [
        r"\.\./",
        r"\.\.\\",
        r"%2e%2e%2f",
        r"%2e%2e%5c",
    ]
    
    def process_request(self, request):
        """Process incoming request and apply WAF rules"""
        try:
            # Skip WAF for specific API endpoints that are safe
            safe_endpoints = [
                '/api/projects/page-projects/',
                '/api/projects/page-projects',
            ]
            if request.path in safe_endpoints or any(request.path.startswith(ep.rstrip('/')) for ep in safe_endpoints):
                return None  # Skip WAF for this endpoint
            
            # Get security settings
            settings = SecuritySettings.objects.first()
            if not settings or not settings.waf_enabled:
                return None  # WAF disabled, allow request
            
            # Get client IP
            ip_address = self.get_client_ip(request)
            
            # Get active WAF rules ordered by priority
            rules = WAFRule.objects.filter(status='active').order_by('priority')
            
            # Check each rule
            for rule in rules:
                match_result = self.check_rule(rule, request, ip_address)
                
                if match_result['matched']:
                    # Log the match
                    self.log_request(request, ip_address, rule, match_result)
                    
                    # Apply action
                    if rule.action == 'block':
                        return self.block_request(match_result['reason'])
                    elif rule.action == 'challenge':
                        # TODO: Implement CAPTCHA challenge
                        return self.block_request(match_result['reason'])
                    elif rule.action == 'log':
                        # Just log, continue processing
                        pass
                    # 'allow' action means continue to next rule
            
            # Rate limiting check
            if settings.rate_limit_enabled:
                rate_limit_result = self.check_rate_limit(request, ip_address, settings)
                if rate_limit_result['blocked']:
                    self.log_request(request, ip_address, None, {
                        'matched': True,
                        'reason': rate_limit_result['reason'],
                        'severity': 'high'
                    })
                    return self.block_request(rate_limit_result['reason'])
            
            # Built-in protection patterns (if no specific rule matched)
            if settings.waf_mode == 'blocking':
                builtin_result = self.check_builtin_patterns(request)
                if builtin_result['matched']:
                    self.log_request(request, ip_address, None, builtin_result)
                    return self.block_request(builtin_result['reason'])
            
            return None  # Request allowed
            
        except Exception as e:
            # Log error but don't block request
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"WAF Middleware error: {e}", exc_info=True)
            return None
    
    def get_client_ip(self, request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '0.0.0.0')
        return ip
    
    def check_rule(self, rule, request, ip_address):
        """Check if request matches a WAF rule"""
        config = rule.config or {}
        
        if rule.rule_type == 'ip_whitelist':
            allowed_ips = config.get('ips', [])
            if ip_address in allowed_ips:
                return {'matched': True, 'reason': 'IP whitelisted', 'severity': 'low'}
        
        elif rule.rule_type == 'ip_blacklist':
            blocked_ips = config.get('ips', [])
            if ip_address in blocked_ips:
                return {'matched': True, 'reason': f'IP blocked: {ip_address}', 'severity': 'high'}
        
        elif rule.rule_type == 'sql_injection':
            if self.check_patterns(request, self.SQL_INJECTION_PATTERNS):
                return {'matched': True, 'reason': 'SQL Injection attempt detected', 'severity': 'critical'}
        
        elif rule.rule_type == 'xss':
            if self.check_patterns(request, self.XSS_PATTERNS):
                return {'matched': True, 'reason': 'XSS attempt detected', 'severity': 'high'}
        
        elif rule.rule_type == 'path_traversal':
            if self.check_patterns(request, self.PATH_TRAVERSAL_PATTERNS):
                return {'matched': True, 'reason': 'Path traversal attempt detected', 'severity': 'high'}
        
        elif rule.rule_type == 'custom':
            patterns = config.get('patterns', [])
            if self.check_patterns(request, patterns):
                return {'matched': True, 'reason': config.get('reason', 'Custom rule matched'), 'severity': config.get('severity', 'medium')}
        
        return {'matched': False}
    
    def check_patterns(self, request, patterns):
        """Check if request matches any pattern"""
        # Check URL path
        path = request.path or ''
        query_string = request.META.get('QUERY_STRING', '')
        
        # Check request body (if available)
        body = ''
        if hasattr(request, 'body') and request.body:
            try:
                body = request.body.decode('utf-8', errors='ignore')
            except:
                pass
        
        # Combine all searchable content
        searchable_content = f"{path} {query_string} {body}".lower()
        
        for pattern in patterns:
            try:
                if re.search(pattern, searchable_content, re.IGNORECASE):
                    return True
            except re.error:
                continue
        
        return False
    
    def check_rate_limit(self, request, ip_address, settings):
        """Check rate limiting"""
        # Skip rate limiting for certain paths (e.g., health checks)
        if request.path in ['/health/', '/api/health/']:
            return {'blocked': False}
        
        # Check per minute
        minute_key = f"waf_rate_limit_minute:{ip_address}"
        minute_count = cache.get(minute_key, 0)
        if minute_count >= settings.rate_limit_requests_per_minute:
            return {
                'blocked': True,
                'reason': f'Rate limit exceeded: {minute_count} requests per minute'
            }
        cache.set(minute_key, minute_count + 1, 60)
        
        # Check per hour
        hour_key = f"waf_rate_limit_hour:{ip_address}"
        hour_count = cache.get(hour_key, 0)
        if hour_count >= settings.rate_limit_requests_per_hour:
            return {
                'blocked': True,
                'reason': f'Rate limit exceeded: {hour_count} requests per hour'
            }
        cache.set(hour_key, hour_count + 1, 3600)
        
        return {'blocked': False}
    
    def check_builtin_patterns(self, request):
        """Check built-in security patterns"""
        if self.check_patterns(request, self.SQL_INJECTION_PATTERNS):
            return {'matched': True, 'reason': 'SQL Injection attempt', 'severity': 'critical'}
        if self.check_patterns(request, self.XSS_PATTERNS):
            return {'matched': True, 'reason': 'XSS attempt', 'severity': 'high'}
        if self.check_patterns(request, self.PATH_TRAVERSAL_PATTERNS):
            return {'matched': True, 'reason': 'Path traversal attempt', 'severity': 'high'}
        return {'matched': False}
    
    def log_request(self, request, ip_address, rule, match_result):
        """Log WAF event"""
        try:
            log = WAFLog.objects.create(
                ip_address=ip_address,
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                request_method=request.method,
                request_path=request.path,
                request_headers={k: v for k, v in request.META.items() if k.startswith('HTTP_')},
                request_body=getattr(request, 'body', b'').decode('utf-8', errors='ignore')[:1000],  # Limit body size
                matched_rule=rule,
                action='blocked' if match_result.get('matched') and rule and rule.action == 'block' else 'logged',
                severity=match_result.get('severity', 'medium'),
                reason=match_result.get('reason', ''),
                timestamp=timezone.now()
            )
            
            # Create alert if severity is high enough
            settings = SecuritySettings.objects.first()
            if settings:
                severity = match_result.get('severity', 'medium')
                should_alert = (
                    (severity == 'critical' and settings.alert_on_critical) or
                    (severity == 'high' and settings.alert_on_high) or
                    (severity == 'medium' and settings.alert_on_medium)
                )
                
                if should_alert:
                    SecurityAlert.objects.create(
                        alert_type='rule_triggered',
                        severity=severity,
                        title=f"WAF Rule Triggered: {rule.name if rule else 'Built-in'}",
                        message=match_result.get('reason', ''),
                        ip_address=ip_address,
                        related_log=log,
                        related_rule=rule
                    )
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error logging WAF event: {e}", exc_info=True)
    
    def block_request(self, reason):
        """Block request and return error response"""
        return JsonResponse(
            {
                'error': 'Request blocked by WAF',
                'reason': reason,
                'code': 'WAF_BLOCKED'
            },
            status=403
        )

