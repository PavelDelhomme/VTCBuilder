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
        
        # Check message content
        if 'Unauthorized' in message:
            # Check if message contains any silent endpoint
            for endpoint in SILENT_401_ENDPOINTS:
                if endpoint in message or endpoint in pathname:
                    # Suppress this log
                    return False
        
        # Check args (sometimes the endpoint is in args)
        if args:
            for arg in args:
                if isinstance(arg, str):
                    for endpoint in SILENT_401_ENDPOINTS:
                        if endpoint in arg and 'Unauthorized' in message:
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

