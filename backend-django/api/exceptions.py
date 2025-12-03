"""
Exception handlers for DRF to ensure CORS headers are always included
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated, PermissionDenied
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

# Endpoints that are expected to return 401 when not authenticated
# These are called by the frontend even when user is not logged in
SILENT_401_ENDPOINTS = [
    '/api/users/impersonation-status',
    '/api/system-settings',
    '/api/pricing-plans',
    '/api/blocks/types',
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
    
    # Suppress logging of expected 401 errors
    request = context.get('request')
    if request and response and response.status_code == 401:
        path = request.path.rstrip('/')
        for endpoint in SILENT_401_ENDPOINTS:
            if path == endpoint or path == endpoint + '/':
                # Don't log this as an error - it's expected behavior
                # The frontend handles these gracefully
                pass  # Just don't log it
    
    # Add CORS headers to error responses
    if request:
        origin = request.META.get('HTTP_ORIGIN')
        if origin:
            if settings.DEBUG:
                # En développement, autoriser tous les localhost, 127.0.0.1 et 192.168.1.134
                if (origin.startswith('http://localhost') or 
                    origin.startswith('http://127.0.0.1') or
                    origin.startswith('http://192.168.1.134') or
                    origin.startswith('https://localhost') or
                    origin.startswith('https://127.0.0.1') or
                    origin.startswith('https://192.168.1.134')):
                    response['Access-Control-Allow-Origin'] = origin
                    response['Access-Control-Allow-Credentials'] = 'true'
                    response['Access-Control-Allow-Methods'] = ', '.join(settings.CORS_ALLOW_METHODS)
                    response['Access-Control-Allow-Headers'] = ', '.join(settings.CORS_ALLOW_HEADERS)
            else:
                # En production, vérifier les origines autorisées
                if hasattr(settings, 'CORS_ALLOWED_ORIGINS') and origin in settings.CORS_ALLOWED_ORIGINS:
                    response['Access-Control-Allow-Origin'] = origin
                    response['Access-Control-Allow-Credentials'] = 'true'
    
    return response

