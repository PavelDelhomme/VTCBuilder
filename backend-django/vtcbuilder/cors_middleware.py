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
            origin = request.META.get('HTTP_ORIGIN', '')
            
            logger.info(f"🔍 CORSAlwaysMiddleware intercepting OPTIONS: path={request.path}, origin={origin or 'NOT SET'}")
            
            # Créer la réponse immédiatement
            response = HttpResponse('', status=200)
            
            # En mode DEBUG, toujours autoriser toutes les origines localhost
            if settings.DEBUG:
                # Si on a une origine, l'utiliser directement
                if origin:
                    response['Access-Control-Allow-Origin'] = origin
                else:
                    # Pas d'origine dans les headers, autoriser toutes les origines en DEBUG
                    response['Access-Control-Allow-Origin'] = '*'
                
                response['Access-Control-Allow-Credentials'] = 'true'
                response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
                response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with'
                response['Access-Control-Max-Age'] = '86400'
                
                logger.info(f"✅ CORS preflight handled (DEBUG): origin={origin or '*'}, path={request.path}")
            else:
                # En production, utiliser la logique normale
                response = self._add_cors_headers(response, request)
                logger.info(f"✅ CORS preflight handled (PROD): origin={origin}, path={request.path}")
            
            return response
        return None
    
    def _add_cors_headers(self, response, request):
        """Ajouter les headers CORS à une réponse"""
        try:
            origin = request.META.get('HTTP_ORIGIN', '')
            
            # En mode DEBUG, toujours autoriser
            if settings.DEBUG:
                if origin:
                    response['Access-Control-Allow-Origin'] = origin
                else:
                    response['Access-Control-Allow-Origin'] = '*'
            else:
                # En production, vérifier si l'origine est autorisée
                allowed = False
                if hasattr(settings, 'CORS_ALLOWED_ORIGINS') and origin:
                    allowed = origin in settings.CORS_ALLOWED_ORIGINS
                elif hasattr(settings, 'CORS_ALLOW_ALL_ORIGINS') and settings.CORS_ALLOW_ALL_ORIGINS:
                    allowed = True
                
                if allowed and origin:
                    response['Access-Control-Allow-Origin'] = origin
                else:
                    # Pas d'origine autorisée, ne pas ajouter les headers
                    return response
            
            # Ajouter les autres headers CORS
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with'
            if request.method == 'OPTIONS':
                response['Access-Control-Max-Age'] = '86400'
        except Exception as e:
            logger.warning(f"Error adding CORS headers: {e}", exc_info=True)
            # En développement, ajouter quand même les headers de base en cas d'erreur
            if settings.DEBUG:
                response['Access-Control-Allow-Origin'] = '*'
                response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
                response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with'
        
        return response
    
    def process_response(self, request, response):
        """Ajouter les headers CORS à toutes les réponses"""
        # Supprimer les logs "Unauthorized" et "Forbidden" pour les endpoints attendus
        if response.status_code in [401, 403]:
            silent_endpoints = [
                '/api/users/impersonation-status',
                '/api/system-settings',
                '/api/pricing-plans',
                '/api/billing/pricing-plans',
                '/api/blocks/types',
                '/api/projects/page-projects',
            ]
            path = request.path.rstrip('/')
            for endpoint in silent_endpoints:
                if path == endpoint or path == endpoint + '/' or path.startswith(endpoint + '/'):
                    # Ne pas logger cette erreur - c'est attendu
                    # Marquer la réponse pour supprimer le log
                    response._suppress_logging = True
                    break
        
        # Pour les réponses DRF, ne JAMAIS essayer de les rendre ou d'accéder à accepted_renderer
        # Le problème est que Django peut appeler response.render() automatiquement, ce qui déclenche
        # l'assertion si accepted_renderer n'est pas encore défini.
        # Solution: Ne pas toucher aux réponses DRF dans process_response - laisser CORSMixin/finalize_response s'en charger
        from rest_framework.response import Response as DRFResponse
        if isinstance(response, DRFResponse):
            # Pour les réponses DRF, ne pas ajouter les headers ici car:
            # 1. CORSMixin.finalize_response s'en charge déjà (appelé AVANT process_response)
            # 2. Accéder à response peut déclencher le rendu et l'assertion
            # 3. Django peut appeler response.render() automatiquement, ce qui déclenche l'assertion
            # 
            # IMPORTANT: Ne rien faire avec les réponses DRF ici - laisser CORSMixin.finalize_response gérer
            # Les headers CORS sont déjà ajoutés par CORSMixin avant que process_response ne soit appelé
            # 
            # CRITIQUE: Ne même pas accéder à response.status_code pour les réponses DRF car cela peut déclencher le rendu
            # Utiliser hasattr pour vérifier le type sans accéder aux propriétés
            return response
        else:
            # Pour les autres types de réponses (HttpResponse, JsonResponse, etc.), ajouter les headers normalement
            return self._add_cors_headers(response, request)
    
    def process_exception(self, request, exception):
        """
        Si une exception est levée, ne pas retourner de réponse directement
        Laisser Django/DRF gérer l'exception normalement
        Les headers CORS seront ajoutés dans process_response
        """
        # Ne pas logger les exceptions attendues (comme ValidationError, PermissionDenied, etc.)
        # car elles sont gérées par DRF
        import logging
        logger = logging.getLogger(__name__)
        
        # Seulement logger les exceptions inattendues
        from rest_framework.exceptions import APIException
        if not isinstance(exception, APIException):
            logger.error(f"Exception in CORSAlwaysMiddleware: {exception}", exc_info=True)
        
        # Ne pas retourner de réponse - laisser Django/DRF gérer l'exception
        return None
