"""
Exception handlers for DRF to ensure CORS headers are always included
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated, PermissionDenied
from django.conf import settings
import logging
from api.utils import add_cors_headers

logger = logging.getLogger(__name__)

# Endpoints that are expected to return 401 when not authenticated
# These are called by the frontend even when user is not logged in
SILENT_401_ENDPOINTS = [
    '/api/users/impersonation-status',
    '/api/system-settings',
    '/api/pricing-plans',
    '/api/blocks/types',
    '/api/projects/page-projects',  # Add this endpoint to silent list
]


def custom_exception_handler(exc, context):
    """
    Custom exception handler that ensures CORS headers are always present
    and suppresses logging of expected 401 errors
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is None:
        # If DRF doesn't handle it, create a 500 response
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        response = Response({
            'error': 'Internal server error',
            'message': str(exc) if settings.DEBUG else 'An error occurred'
        }, status=500)
    
    # Suppress logging of expected 401/403 errors
    request = context.get('request')
    if request and response:
        path = request.path.rstrip('/')
        for endpoint in SILENT_401_ENDPOINTS:
            if path == endpoint or path == endpoint + '/' or path.startswith(endpoint + '/'):
                # Don't log this as an error - it's expected behavior
                # The frontend handles these gracefully
                # Set a flag on the response to prevent logging
                if response.status_code in [401, 403]:
                    response._suppress_logging = True
                break
    
    # Always add CORS headers to error responses using the utility function
    if request:
        add_cors_headers(response, request)
    
    return response

