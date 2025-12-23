"""
Utility functions for API views
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)


def add_cors_headers(response, request=None):
    """
    Add CORS headers to a response based on settings and request origin
    """
    from django.conf import settings
    
    if request:
        origin = request.META.get('HTTP_ORIGIN')
        if origin:
            # Check if origin is allowed
            allowed_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
            allowed_origin_regexes = getattr(settings, 'CORS_ALLOWED_ORIGIN_REGEXES', [])
            
            # In DEBUG mode, allow localhost and common development origins
            if settings.DEBUG:
                if (origin.startswith('http://localhost') or 
                    origin.startswith('http://127.0.0.1') or
                    origin.startswith('http://192.168.1.134') or
                    origin.startswith('https://localhost') or 
                    origin.startswith('https://127.0.0.1') or
                    origin.startswith('https://192.168.1.134')):
                    response['Access-Control-Allow-Origin'] = origin
                    response['Access-Control-Allow-Credentials'] = 'true'
                    response['Access-Control-Allow-Methods'] = ', '.join(getattr(settings, 'CORS_ALLOW_METHODS', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']))
                    response['Access-Control-Allow-Headers'] = ', '.join(getattr(settings, 'CORS_ALLOW_HEADERS', ['Content-Type', 'Authorization', 'X-CSRFToken']))
                    return response
            
            # Check against allowed origins
            if origin in allowed_origins:
                response['Access-Control-Allow-Origin'] = origin
                response['Access-Control-Allow-Credentials'] = 'true'
                response['Access-Control-Allow-Methods'] = ', '.join(getattr(settings, 'CORS_ALLOW_METHODS', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']))
                response['Access-Control-Allow-Headers'] = ', '.join(getattr(settings, 'CORS_ALLOW_HEADERS', ['Content-Type', 'Authorization', 'X-CSRFToken']))
                return response
            
            # Check against regex patterns
            import re
            for pattern in allowed_origin_regexes:
                if re.match(pattern, origin):
                    response['Access-Control-Allow-Origin'] = origin
                    response['Access-Control-Allow-Credentials'] = 'true'
                    response['Access-Control-Allow-Methods'] = ', '.join(getattr(settings, 'CORS_ALLOW_METHODS', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']))
                    response['Access-Control-Allow-Headers'] = ', '.join(getattr(settings, 'CORS_ALLOW_HEADERS', ['Content-Type', 'Authorization', 'X-CSRFToken']))
                    return response
    
    return response


def get_authenticated_user_from_token(request):
    """
    Récupère l'utilisateur authentifié depuis le token JWT de manière sécurisée.
    Ne se fie JAMAIS aux paramètres de requête ou aux données de requête.
    
    Returns:
        tuple: (user, error_message)
        - user: L'objet User si authentifié, None sinon
        - error_message: Message d'error si échec, None sinon
    """
    try:
        jwt_auth = JWTAuthentication()
        header = jwt_auth.get_header(request)
        
        if not header:
            return None, "Token d'authentification manquant"
        
        raw_token = jwt_auth.get_raw_token(header)
        if not raw_token:
            return None, "Token invalide"
        
        validated_token = jwt_auth.get_validated_token(raw_token)
        user = jwt_auth.get_user(validated_token)
        
        if not user:
            return None, "Utilisateur non trouvé"
        
        if not user.is_authenticated:
            return None, "Utilisateur non authentifié"
        
        return user, None
        
    except InvalidToken:
        return None, "Token invalide ou expiré"
    except TokenError as e:
        logger.warning(f"Token error: {e}")
        return None, "Error de token"
    except Exception as e:
        logger.error(f"Error authenticating user from token: {e}", exc_info=True)
        return None, "Error d'authentification"


def is_super_admin_from_token(request):
    """
    Vérifie si l'utilisateur est super admin en utilisant UNIQUEMENT le token JWT.
    Ne se fie JAMAIS aux paramètres de requête, query params, ou request.data.
    
    Cette fonction est la source de vérité pour vérifier le statut super admin.
    
    Args:
        request: La requête HTTP Django
        
    Returns:
        bool: True si l'utilisateur est super admin, False sinon
    """
    # Log pour diagnostiquer les problèmes
    has_auth_header = 'HTTP_AUTHORIZATION' in request.META or 'Authorization' in request.headers
    auth_header_preview = ''
    if has_auth_header:
        auth_header = request.META.get('HTTP_AUTHORIZATION', '') or request.headers.get('Authorization', '')
        auth_header_preview = auth_header[:50] if auth_header else 'empty'
    
    logger.info(
        f"is_super_admin_from_token: {request.method} {request.path}, "
        f"has_auth_header: {has_auth_header}, "
        f"auth_preview: {auth_header_preview}, "
        f"request.user: {request.user.email if request.user and hasattr(request.user, 'email') else 'not set'}, "
        f"request.user.is_authenticated: {request.user.is_authenticated if request.user else False}"
    )
    
    # Essayer d'abord de récupérer l'utilisateur depuis le token JWT directement
    user, error = get_authenticated_user_from_token(request)
    
    # Si l'authentification JWT directe échoue, vérifier si DRF a déjà authentifié l'utilisateur
    # (DRF utilise aussi JWT, donc c'est sécurisé)
    if not user or error:
        # Fallback: si DRF a déjà authentifié l'utilisateur via JWT, utiliser celui-ci
        if request.user and request.user.is_authenticated:
            user = request.user
            logger.info(f"is_super_admin_from_token: Using DRF-authenticated user {user.email if hasattr(user, 'email') else 'unknown'}")
        else:
            logger.warning(f"is_super_admin_from_token: Cannot verify user - {error} (method: {request.method}, path: {request.path})")
            return False
    
    try:
        # Vérifier le statut super admin depuis l'objet User authentifié
        # Cette méthode vérifie le rôle dans la base de données
        if hasattr(user, 'is_super_admin') and callable(user.is_super_admin):
            result = user.is_super_admin()
            logger.info(f"is_super_admin_from_token: user.is_super_admin() = {result} for user {user.email if hasattr(user, 'email') else 'unknown'} (method: {request.method}, path: {request.path})")
            return result
        elif hasattr(user, 'is_superuser'):
            result = user.is_superuser
            logger.info(f"is_super_admin_from_token: user.is_superuser = {result} for user {user.email if hasattr(user, 'email') else 'unknown'} (method: {request.method}, path: {request.path})")
            return result
        elif hasattr(user, 'is_staff'):
            result = user.is_staff
            logger.info(f"is_super_admin_from_token: user.is_staff = {result} for user {user.email if hasattr(user, 'email') else 'unknown'} (method: {request.method}, path: {request.path})")
            return result
        
        logger.warning(f"is_super_admin_from_token: No super admin check method found for user {user.email if hasattr(user, 'email') else 'unknown'} (method: {request.method}, path: {request.path})")
        return False
    except Exception as e:
        logger.error(f"Error checking is_super_admin: {e} (method: {request.method}, path: {request.path})", exc_info=True)
        return False
