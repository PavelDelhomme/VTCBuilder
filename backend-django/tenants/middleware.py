"""
Middleware to check user status and block access for suspended/inactive users
"""
from django.http import JsonResponse
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings


class UserStatusMiddleware:
    """
    Middleware to check if authenticated user is active/suspended/inactive
    Blocks access to API endpoints for suspended or inactive users
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip for non-API paths or public paths
        if not request.path.startswith('/api/'):
            return self.get_response(request)

        # Skip authentication check for public endpoints
        public_paths = [
            '/api/auth/login/',
            '/api/auth/register/',
            '/api/auth/register-with-plan/',
            '/api/auth/logout/',  # Allow logout even if suspended
            '/api/auth/reset-password/request/',
            '/api/auth/reset-password/reset/',
            '/api/auth/reset-password/verify/',
            '/api/auth/invitation/verify/',
            '/api/auth/invitation/complete/',
            '/api/analytics/block-usage/',  # Allow analytics tracking without auth
            '/api/users/impersonation-status/',  # Allow checking impersonation status without auth
            '/api/blocks/types/',  # Allow viewing block types without auth
            '/api/system-settings/',  # Allow viewing system settings without auth (GET only)
        ]

        if any(request.path.startswith(path) for path in public_paths):
            return self.get_response(request)

        # Check user status for authenticated requests
        try:
            jwt_auth = JWTAuthentication()
            header = jwt_auth.get_header(request)
            if header:
                raw_token = jwt_auth.get_raw_token(header)
                if raw_token:
                    validated_token = jwt_auth.get_validated_token(raw_token)
                    user = jwt_auth.get_user(validated_token)

                    if user:
                        # Log pour debug
                        import logging
                        logger = logging.getLogger(__name__)
                        is_super_admin = False
                        try:
                            is_super_admin = user.is_super_admin()
                        except Exception as e:
                            logger.warning(f"Error checking is_super_admin in UserStatusMiddleware: {e}")
                        
                        logger.info(
                            f"UserStatusMiddleware: path={request.path}, "
                            f"user={user.email if hasattr(user, 'email') else 'unknown'}, "
                            f"is_super_admin={is_super_admin}, status={user.status if hasattr(user, 'status') else 'unknown'}"
                        )
                        
                        # Super admin can always access
                        if is_super_admin:
                            logger.info(f"UserStatusMiddleware: Allowing access for super admin to {request.path}")
                            return self.get_response(request)
                        
                        # Check user status
                        if user.status == 'suspended':
                            response = JsonResponse(
                                {
                                    'error': 'Compte suspendu',
                                    'detail': 'Votre compte a été suspendu. Veuillez contacter l\'administrateur.',
                                    'status': 'suspended'
                                },
                                status=403
                            )
                            # Add CORS headers
                            origin = request.META.get('HTTP_ORIGIN')
                            if origin and settings.DEBUG:
                                if (origin.startswith('http://localhost') or 
                                    origin.startswith('http://127.0.0.1') or
                                    origin.startswith('http://192.168.1.134') or
                                    origin.startswith('https://localhost') or
                                    origin.startswith('https://127.0.0.1') or
                                    origin.startswith('https://192.168.1.134')):
                                    response['Access-Control-Allow-Origin'] = origin
                                    response['Access-Control-Allow-Credentials'] = 'true'
                            return response
                        
                        if user.status == 'inactive':
                            response = JsonResponse(
                                {
                                    'error': 'Compte désactivé',
                                    'detail': 'Votre compte a été désactivé. Veuillez contacter l\'administrateur.',
                                    'status': 'inactive'
                                },
                                status=403
                            )
                            # Add CORS headers
                            origin = request.META.get('HTTP_ORIGIN')
                            if origin and settings.DEBUG:
                                if (origin.startswith('http://localhost') or 
                                    origin.startswith('http://127.0.0.1') or
                                    origin.startswith('http://192.168.1.134') or
                                    origin.startswith('https://localhost') or
                                    origin.startswith('https://127.0.0.1') or
                                    origin.startswith('https://192.168.1.134')):
                                    response['Access-Control-Allow-Origin'] = origin
                                    response['Access-Control-Allow-Credentials'] = 'true'
                            return response

        except (InvalidToken, TokenError, AttributeError, TypeError, KeyError, ValueError):
            # If no valid token or user, let the normal authentication handle it
            pass

        return self.get_response(request)

