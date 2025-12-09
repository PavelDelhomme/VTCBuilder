"""
Middleware pour garantir que les headers CORS sont toujours envoyés, même en cas d'erreur
"""
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class CORSAlwaysMiddleware(MiddlewareMixin):
    """
    Middleware qui garantit que les headers CORS sont toujours ajoutés,
    même si une exception est levée avant que corsheaders ne puisse les ajouter
    """
    
    def process_request(self, request):
        """Gérer les requêtes OPTIONS (preflight) avant qu'elles n'atteignent les vues"""
        if request.method == 'OPTIONS':
            from django.http import HttpResponse
            origin = request.META.get('HTTP_ORIGIN', 'http://localhost:9494')
            response = HttpResponse('', status=200)
            
            # Toujours ajouter les headers CORS pour OPTIONS en développement
            if settings.DEBUG:
                if (origin.startswith('http://localhost') or 
                    origin.startswith('http://127.0.0.1') or
                    origin.startswith('http://192.168.1.134') or
                    origin.startswith('https://localhost') or
                    origin.startswith('https://127.0.0.1') or
                    origin.startswith('https://192.168.1.134')):
                    response['Access-Control-Allow-Origin'] = origin
                    response['Access-Control-Allow-Credentials'] = 'true'
                    response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
                    response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with'
                    response['Access-Control-Max-Age'] = '86400'
            else:
                # En production, utiliser la logique normale
                response = self._add_cors_headers(response, request)
            
            return response
        return None
    
    def _add_cors_headers(self, response, request):
        """Ajouter les headers CORS à une réponse"""
        try:
            origin = request.META.get('HTTP_ORIGIN') or request.META.get('HTTP_REFERER', '').split('/')[0:3]
            if isinstance(origin, list):
                origin = '/'.join(origin)
            
            # Si pas d'origin, essayer de le déduire de la requête
            if not origin:
                # En développement, autoriser par défaut
                if settings.DEBUG:
                    origin = 'http://localhost:9494'
                else:
                    return response
            
            # Vérifier si l'origin est autorisé
            allowed = False
            
            if settings.DEBUG:
                # En développement, autoriser tous les localhost, 127.0.0.1 et 192.168.1.134
                if (origin.startswith('http://localhost') or 
                    origin.startswith('http://127.0.0.1') or
                    origin.startswith('http://192.168.1.134') or
                    origin.startswith('https://localhost') or
                    origin.startswith('https://127.0.0.1') or
                    origin.startswith('https://192.168.1.134')):
                    allowed = True
            else:
                # En production, vérifier les origines autorisées
                if hasattr(settings, 'CORS_ALLOWED_ORIGINS'):
                    allowed = origin in settings.CORS_ALLOWED_ORIGINS
                elif hasattr(settings, 'CORS_ALLOW_ALL_ORIGINS') and settings.CORS_ALLOW_ALL_ORIGINS:
                    allowed = True
            
            if allowed:
                # Ajouter les headers CORS
                response['Access-Control-Allow-Origin'] = origin
                response['Access-Control-Allow-Credentials'] = 'true'
                response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
                response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with'
                # Ajouter header pour les requêtes preflight
                if request.method == 'OPTIONS':
                    response['Access-Control-Max-Age'] = '86400'
        except Exception as e:
            logger.warning(f"Error adding CORS headers in middleware: {e}")
        
        return response
    
    def process_response(self, request, response):
        """Ajouter les headers CORS à toutes les réponses"""
        # Supprimer les logs "Unauthorized" et "Forbidden" pour les endpoints attendus
        if response.status_code in [401, 403]:
            silent_endpoints = [
                '/api/users/impersonation-status',
                '/api/system-settings',
                '/api/pricing-plans',
                '/api/blocks/types',
            ]
            path = request.path.rstrip('/')
            for endpoint in silent_endpoints:
                if path == endpoint or path == endpoint + '/':
                    # Ne pas logger cette erreur - c'est attendu
                    # Marquer la réponse pour supprimer le log
                    response._suppress_logging = True
                    break
        
        # Toujours ajouter les headers CORS, même pour les erreurs
        return self._add_cors_headers(response, request)
    
    def process_exception(self, request, exception):
        """
        Si une exception est levée, retourner une réponse avec headers CORS
        """
        from django.http import JsonResponse
        
        logger.error(f"Exception in CORSAlwaysMiddleware: {exception}", exc_info=True)
        
        # Créer une réponse d'erreur avec headers CORS
        error_response = JsonResponse({
            'error': 'Internal server error',
            'message': str(exception) if settings.DEBUG else 'An error occurred'
        }, status=500)
        
        return self._add_cors_headers(error_response, request)
