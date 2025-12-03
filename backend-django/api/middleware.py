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
        Only emit logs that are not 401 errors for expected endpoints
        """
        message = str(record.getMessage())
        message_lower = message.lower()
        
        # Check if this is a 401/Unauthorized log (DRF format: "GET /api/endpoint/ 401")
        # or Django format: "Unauthorized: /api/endpoint/"
        if 'unauthorized' in message_lower or ' 401' in message or '401 ' in message:
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
                    if 'unauthorized' in message_lower or ' 401' in message or '401 ' in message:
                        return
        
        # Check args (sometimes the endpoint is in args)
        args = getattr(record, 'args', ())
        if args:
            for arg in args:
                if isinstance(arg, str):
                    arg_lower = arg.lower()
                    for endpoint in SILENT_401_ENDPOINTS:
                        endpoint_lower = endpoint.lower()
                        if ((endpoint_lower in arg_lower or endpoint in arg) and 
                            ('unauthorized' in message_lower or ' 401' in message or '401 ' in message)):
                            return
        
        # If we get here, emit the log normally
        # Use the parent class's emit method
        super().emit(record)


class SuppressExpected401LogFilter(logging.Filter):
    """
    Logging filter to suppress 401 Unauthorized logs for expected endpoints
    """
    
    def filter(self, record):
        """
        Filter out 401 logs for expected endpoints
        """
        # Check if this is an Unauthorized log
        message = str(record.getMessage())
        # Also check the pathname and args if available
        pathname = getattr(record, 'pathname', '')
        args = getattr(record, 'args', ())
        
        # Check message content - look for "Unauthorized" in various forms
        message_lower = message.lower()
        if 'unauthorized' in message_lower or '401' in message:
            # Check if message contains any silent endpoint
            for endpoint in SILENT_401_ENDPOINTS:
                endpoint_lower = endpoint.lower()
                if (endpoint_lower in message_lower or 
                    endpoint in message or 
                    endpoint in pathname or
                    endpoint_lower in pathname.lower()):
                    # Suppress this log
                    return False
        
        # Check args (sometimes the endpoint is in args)
        if args:
            for arg in args:
                if isinstance(arg, str):
                    arg_lower = arg.lower()
                    for endpoint in SILENT_401_ENDPOINTS:
                        endpoint_lower = endpoint.lower()
                        if ((endpoint_lower in arg_lower or endpoint in arg) and 
                            ('unauthorized' in message_lower or ' 401' in message or '401 ' in message)):
                            return False
        
        return True


class SuppressExpected401Middleware(MiddlewareMixin):
    """
    Middleware to suppress logging of expected 401 errors for specific endpoints
    """
    
    def process_response(self, request, response):
        """
        Suppress logging of 401 errors for expected endpoints
        """
        # Only process API requests
        if not request.path.startswith('/api/'):
            return response
        
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

