"""
WAF Middleware for request filtering
"""
import re
import time
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.conf import settings
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
        import logging
        logger = logging.getLogger(__name__)
        
        # Log ENTRÉE du WAF pour toutes les requêtes PATCH vers system-settings
        if request.method == 'PATCH' and ('system-settings' in request.path):
            logger.info(f"🛡️ WAFMiddleware.process_request ENTRY: {request.method} {request.path}")
        
        try:
            # DÉSACTIVER COMPLÈTEMENT LE WAF EN MODE DEBUG POUR LOCALHOST
            is_debug = getattr(settings, 'DEBUG', False)
            ip_address = self.get_client_ip(request)
            is_local = self.is_localhost(ip_address)
            
            if request.method == 'PATCH' and ('system-settings' in request.path):
                logger.info(f"🛡️ WAFMiddleware: DEBUG={is_debug}, IP={ip_address}, is_local={is_local}")
            
            if is_debug and is_local:
                # En mode DEBUG local, désactiver complètement le WAF
                if request.method == 'PATCH' and ('system-settings' in request.path):
                    logger.info(f"🛡️ WAFMiddleware: WAF désactivé pour {request.method} {request.path} (DEBUG + localhost)")
                return None  # Skip WAF entirely
            
            # Skip WAF for specific API endpoints that are safe (public endpoints only)
            # Note: Auth endpoints are NOT in this list to keep security protections
            safe_endpoints = [
                '/api/projects/page-projects/',
                '/api/projects/page-projects',
            ]
            if request.path in safe_endpoints or any(request.path.startswith(ep.rstrip('/')) for ep in safe_endpoints):
                return None  # Skip WAF for this endpoint
            
            # Get security settings
            security_settings = SecuritySettings.objects.first()
            if not security_settings or not security_settings.waf_enabled:
                return None  # WAF disabled, allow request
            
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
            if security_settings.rate_limit_enabled:
                rate_limit_result = self.check_rate_limit(request, ip_address, security_settings)
                if rate_limit_result['blocked']:
                    self.log_request(request, ip_address, None, {
                        'matched': True,
                        'reason': rate_limit_result['reason'],
                        'severity': 'high'
                    })
                    return self.block_request(rate_limit_result['reason'])
            
            # Built-in protection patterns (if no specific rule matched)
            if security_settings.waf_mode == 'blocking':
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
    
    def is_localhost(self, ip_address):
        """Check if IP address is localhost/local development"""
        if not ip_address:
            return False
        localhost_ips = ['127.0.0.1', '::1', 'localhost', '0.0.0.0']
        # Vérifier les IPs exactes
        if ip_address in localhost_ips:
            return True
        # Vérifier les plages d'IPs privées (RFC 1918)
        if ip_address.startswith('127.') or ip_address.startswith('192.168.') or ip_address.startswith('10.') or ip_address.startswith('172.16.'):
            return True
        # Vérifier les IPs IPv6 localhost
        if ip_address.startswith('::ffff:127.') or ip_address.startswith('::ffff:192.168.') or ip_address.startswith('::ffff:10.'):
            return True
        return False
    
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
        
        # Vérifier si l'utilisateur est authentifié - les utilisateurs authentifiés ont des limites plus élevées
        is_authenticated = False
        try:
            # Vérifier si un token JWT est présent
            has_auth_header = 'HTTP_AUTHORIZATION' in request.META or 'Authorization' in request.headers
            if has_auth_header:
                from api.utils import get_authenticated_user_from_token
                user, error = get_authenticated_user_from_token(request)
                if user:
                    is_authenticated = True
        except Exception:
            pass
        
        # En mode DEBUG ou pour localhost, être beaucoup plus permissif
        is_local = self.is_localhost(ip_address)
        is_debug = getattr(settings, 'DEBUG', False)
        
        # En développement local, désactiver ou assouplir drastiquement le rate limiting
        if is_debug and is_local:
            # En local, permettre beaucoup plus de requêtes
            # Limites très élevées pour le développement
            max_requests_per_minute = 10000  # Très élevé pour le dev
            max_requests_per_hour = 1000000  # Très élevé pour le dev
        elif is_local:
            # Même en production, être plus permissif pour localhost
            max_requests_per_minute = settings.rate_limit_requests_per_minute * 10
            max_requests_per_hour = settings.rate_limit_requests_per_hour * 10
        elif is_authenticated:
            # Les utilisateurs authentifiés ont des limites plus élevées (x5)
            max_requests_per_minute = settings.rate_limit_requests_per_minute * 5
            max_requests_per_hour = settings.rate_limit_requests_per_hour * 5
        else:
            # Production normale pour utilisateurs non authentifiés
            max_requests_per_minute = settings.rate_limit_requests_per_minute
            max_requests_per_hour = settings.rate_limit_requests_per_hour
        
        try:
            # Check per minute
            minute_key = f"waf_rate_limit_minute:{ip_address}"
            minute_count = cache.get(minute_key, 0)
            if not isinstance(minute_count, (int, float)):
                minute_count = 0
            if minute_count >= max_requests_per_minute:
                # En mode DEBUG local, logger mais ne pas bloquer
                if is_debug and is_local:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.debug(f"Rate limit warning (DEBUG mode, not blocking): {minute_count} requests per minute from {ip_address}")
                    return {'blocked': False}
                return {
                    'blocked': True,
                    'reason': f'Rate limit exceeded: {minute_count} requests per minute'
                }
            cache.set(minute_key, minute_count + 1, 60)
            
            # Check per hour
            hour_key = f"waf_rate_limit_hour:{ip_address}"
            hour_count = cache.get(hour_key, 0)
            if not isinstance(hour_count, (int, float)):
                hour_count = 0
            if hour_count >= max_requests_per_hour:
                # En mode DEBUG local, logger mais ne pas bloquer
                if is_debug and is_local:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.debug(f"Rate limit warning (DEBUG mode, not blocking): {hour_count} requests per hour from {ip_address}")
                    return {'blocked': False}
                return {
                    'blocked': True,
                    'reason': f'Rate limit exceeded: {hour_count} requests per hour'
                }
            cache.set(hour_key, hour_count + 1, 3600)
        except Exception as e:
            # Si Redis est down ou erreur de cache, permettre la requête mais logger l'erreur
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"WAF rate limit cache error: {e}, allowing request")
            return {'blocked': False}
        
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

