"""
Stripe configuration management for SystemSettings
"""
import stripe
import logging
from django.conf import settings as django_settings

logger = logging.getLogger(__name__)


def get_stripe_keys_from_settings():
    """
    Get Stripe keys from SystemSettings or environment variables
    Returns (public_key, secret_key)
    """
    try:
        from .models import SystemSettings
        system_settings = SystemSettings.get_settings()
        
        # Priority: SystemSettings > Environment variables
        public_key = system_settings.stripe_public_key or getattr(django_settings, 'STRIPE_PUBLIC_KEY', '')
        secret_key = system_settings.stripe_secret_key or getattr(django_settings, 'STRIPE_SECRET_KEY', '')
        
        return public_key, secret_key
    except Exception as e:
        logger.error(f"Error getting Stripe keys from settings: {e}", exc_info=True)
        # Fallback to environment variables
        return (
            getattr(django_settings, 'STRIPE_PUBLIC_KEY', ''),
            getattr(django_settings, 'STRIPE_SECRET_KEY', '')
        )


def update_stripe_api_key():
    """Update Stripe API key from SystemSettings"""
    try:
        _, secret_key = get_stripe_keys_from_settings()
        if secret_key:
            stripe.api_key = secret_key
            logger.info("Stripe API key updated from SystemSettings")
        else:
            # Fallback to environment variable
            stripe.api_key = getattr(django_settings, 'STRIPE_SECRET_KEY', '')
    except Exception as e:
        logger.error(f"Error updating Stripe API key: {e}", exc_info=True)


def test_stripe_connection(secret_key: str = None) -> dict:
    """
    Test Stripe connection with provided secret key or from settings
    Returns dict with status and account info
    """
    try:
        if not secret_key:
            _, secret_key = get_stripe_keys_from_settings()
        
        if not secret_key:
            return {
                'status': 'error',
                'message': 'Aucune clé secrète Stripe configurée'
            }
        
        # Temporarily set API key
        original_key = stripe.api_key
        try:
            stripe.api_key = secret_key
            
            # Test connection by retrieving account
            account = stripe.Account.retrieve()
            
            return {
                'status': 'success',
                'message': 'Connexion Stripe réussie !',
                'account': {
                    'id': account.id,
                    'country': account.country,
                    'default_currency': account.default_currency,
                    'email': getattr(account, 'email', None),
                    'type': account.type,
                }
            }
        except stripe.error.AuthenticationError as e:
            return {
                'status': 'error',
                'message': f'Error d\'authentification: {str(e)}',
                'error': 'Clé secrète invalide'
            }
        except stripe.error.StripeError as e:
            return {
                'status': 'error',
                'message': f'Error Stripe: {str(e)}',
                'error': str(e)
            }
        finally:
            # Restore original key
            stripe.api_key = original_key
    except ImportError:
        return {
            'status': 'error',
            'message': 'Le module Stripe n\'est pas installé',
            'error': 'stripe package not found'
        }
    except Exception as e:
        logger.error(f"Unexpected error testing Stripe: {e}", exc_info=True)
        return {
            'status': 'error',
            'message': f'Error inattendue: {str(e)}',
            'error': str(e)
        }

