"""
Middleware and logging configuration to suppress expected 401 Unauthorized logs
"""
import logging
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)

# Endpoints that are expected to return 401 when not authenticated
# These are called by the frontend even when user is not logged in
SILENT_401_ENDPOINTS = [
    '/api/users/impersonation-status',
    '/api/system-settings',
    '/api/pricing-plans',
    '/api/blocks/types',
]


class Suppress401Handler(logging.StreamHandler):
    """
    Custom logging handler that suppresses 401 logs for expected endpoints
    Extends StreamHandler to properly handle stream output
    """
    def __init__(self, *args, **kwargs):
        # Remove 'stream' from kwargs if present, as we'll set it ourselves
        stream = kwargs.pop('stream', None)
        if stream is None:
            import sys
            stream = sys.stdout
        super().__init__(stream)
    
    def emit(self, record):
        """
        Only emit logs that are not 401/403 errors for expected endpoints
        """
        message = str(record.getMessage())
        message_lower = message.lower()
        
        # Check if this is a 401/Unauthorized or 403/Forbidden log (DRF format: "GET /api/endpoint/ 401" or "Forbidden: /api/endpoint/")
        # or Django format: "Unauthorized: /api/endpoint/" or "Forbidden: /api/endpoint/"
        is_401_or_403 = ('unauthorized' in message_lower or 'forbidden' in message_lower or 
                         ' 401' in message or '401 ' in message or 
                         ' 403' in message or '403 ' in message)
        
        if is_401_or_403:
            # Check if message contains any silent endpoint
            for endpoint in SILENT_401_ENDPOINTS:
                endpoint_lower = endpoint.lower()
                endpoint_short = endpoint.replace('/api/', '')
                # Check various formats
                if (endpoint_lower in message_lower or 
                    endpoint in message or
                    endpoint_short in message_lower or
                    endpoint_short.replace('-', ' ') in message_lower):
                    # Suppress this log
                    return
        
        # Check pathname if available
        pathname = getattr(record, 'pathname', '')
        if pathname:
            for endpoint in SILENT_401_ENDPOINTS:
                if endpoint in pathname or endpoint.lower() in pathname.lower():
                    if is_401_or_403:
                        return
        
        # Check args (sometimes the endpoint is in args)
        args = getattr(record, 'args', ())
        if args:
            for arg in args:
                if isinstance(arg, str):
                    arg_lower = arg.lower()
                    for endpoint in SILENT_401_ENDPOINTS:
                        endpoint_lower = endpoint.lower()
                        if ((endpoint_lower in arg_lower or endpoint in arg) and is_401_or_403):
                            return
        
        # If we get here, emit the log normally
        # Use the parent class's emit method
        super().emit(record)


class SuppressExpected401LogFilter(logging.Filter):
    """
    Logging filter to suppress 401 Unauthorized and 403 Forbidden logs for expected endpoints
    """
    
    def filter(self, record):
        """
        Filter out 401 and 403 logs for expected endpoints
        """
        # Check if this is an Unauthorized or Forbidden log
        message = str(record.getMessage())
        # Also check the pathname and args if available
        pathname = getattr(record, 'pathname', '')
        args = getattr(record, 'args', ())
        
        # Check message content - look for "Unauthorized" or "Forbidden" in various forms
        # DRF format: "GET /api/endpoint/ 401" or "Unauthorized: /api/endpoint/" or "Forbidden: /api/endpoint/"
        message_lower = message.lower()
        is_401_or_403 = ('unauthorized' in message_lower or 'forbidden' in message_lower or 
                         ' 401' in message or '401 ' in message or 
                         ' 403' in message or '403 ' in message)
        
        if is_401_or_403:
            # Check if message contains any silent endpoint
            for endpoint in SILENT_401_ENDPOINTS:
                endpoint_lower = endpoint.lower()
                endpoint_short = endpoint.replace('/api/', '')
                # Check various formats
                if (endpoint_lower in message_lower or 
                    endpoint in message or 
                    endpoint in pathname or
                    endpoint_lower in pathname.lower() or
                    endpoint_short in message_lower):
                    # Suppress this log
                    return False
        
        # Check args (sometimes the endpoint is in args)
        if args:
            for arg in args:
                if isinstance(arg, str):
                    arg_lower = arg.lower()
                    for endpoint in SILENT_401_ENDPOINTS:
                        endpoint_lower = endpoint.lower()
                        if ((endpoint_lower in arg_lower or endpoint in arg) and is_401_or_403):
                            return False
        
        return True


class SuppressExpected401Middleware(MiddlewareMixin):
    """
    Middleware to suppress logging of expected 401 errors for specific endpoints
    """
    
    def process_request(self, request):
        """
        Log all requests to page-projects and system-settings for debugging
        """
        if '/page-projects' in request.path or '/system-settings' in request.path:
            has_auth = 'Authorization' in request.headers or 'HTTP_AUTHORIZATION' in request.META
            auth_preview = ''
            if has_auth:
                auth_header = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION', '')
                auth_preview = auth_header[:50] if auth_header else 'empty'
            # Vérifier l'authentification depuis le token JWT si DRF n'a pas encore authentifié
            user_email = 'anonymous'
            is_authenticated = False
            if request.user and hasattr(request.user, 'email'):
                user_email = request.user.email
                is_authenticated = request.user.is_authenticated
            elif has_auth:
                # Essayer d'authentifier depuis le token JWT
                try:
                    from rest_framework_simplejwt.authentication import JWTAuthentication
                    jwt_auth = JWTAuthentication()
                    header = jwt_auth.get_header(request)
                    if header:
                        raw_token = jwt_auth.get_raw_token(header)
                        if raw_token:
                            validated_token = jwt_auth.get_validated_token(raw_token)
                            user = jwt_auth.get_user(validated_token)
                            if user:
                                user_email = user.email if hasattr(user, 'email') else 'authenticated'
                                is_authenticated = True
                except Exception:
                    pass
            
            logger.info(
                f"SuppressExpected401Middleware.process_request: {request.method} {request.path}. "
                f"User: {user_email}, "
                f"is_authenticated: {is_authenticated}, "
                f"auth_header={'present' if has_auth else 'missing'}, "
                f"auth_preview: {auth_preview}, "
                f"Content-Type: {request.META.get('CONTENT_TYPE', 'not set')}"
            )
        return None
    
    def process_response(self, request, response):
        """
        Suppress logging of 401 errors for expected endpoints
        """
        # Only process API requests
        if not request.path.startswith('/api/'):
            return response
        
        # Log page-projects responses for debugging
        if '/page-projects' in request.path:
            logger.info(
                f"SuppressExpected401Middleware.process_response: {request.method} {request.path} -> {response.status_code}. "
                f"User: {request.user.email if request.user and hasattr(request.user, 'email') else 'anonymous'}, "
                f"is_authenticated: {request.user.is_authenticated if request.user else False}"
            )
        
        # Check if this is a 401 response for an expected endpoint
        if response.status_code == 401:
            path = request.path.rstrip('/')
            # Check if path matches any silent endpoint
            for endpoint in SILENT_401_ENDPOINTS:
                if path == endpoint or path == endpoint + '/':
                    # Don't log this as an error - it's expected behavior
                    # The frontend handles these gracefully
                    return response
        
        return response

