"""
DRF Mixins for common functionality, including automatic CORS headers
"""
from rest_framework.response import Response
from api.utils import add_cors_headers
import logging

logger = logging.getLogger(__name__)


class CORSMixin:
    """
    Mixin that automatically adds CORS headers to all responses from a ViewSet.
    This ensures consistent CORS handling across all API endpoints.
    
    IMPORTANT: finalize_response est appelé APRÈS que la vue ait retourné la réponse,
    mais AVANT que Django n'appelle response.render(). C'est le bon moment pour ajouter
    les headers CORS sans déclencher le rendu de la réponse.
    """
    
    def finalize_response(self, request, response, *args, **kwargs):
        """Override finalize_response to add CORS headers to all responses"""
        # Appeler super().finalize_response() qui finalise la réponse DRF
        # Cela définit accepted_renderer et rend la réponse prête pour le rendu
        response = super().finalize_response(request, response, *args, **kwargs)
        
        # Maintenant que la réponse est finalisée, on peut ajouter les headers CORS
        # sans risquer de déclencher l'assertion "accepted_renderer not set"
        try:
            add_cors_headers(response, request)
        except Exception as e:
            # Si on a une erreur, logger mais ne pas bloquer
            logger.warning(f"Error adding CORS headers in CORSMixin.finalize_response: {e}")
        
        return response

