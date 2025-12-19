"""
Views for System Settings
"""
import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from django.conf import settings
from .models import SystemSettings
from .serializers import SystemSettingsSerializer
from api.utils import is_super_admin_from_token

logger = logging.getLogger(__name__)


class IsAuthenticatedOrOptions(BasePermission):
    """
    Permission class that allows OPTIONS requests without authentication
    but requires authentication for all other methods.
    """
    def has_permission(self, request, view):
        # Allow OPTIONS requests without authentication (for CORS preflight)
        if request.method == 'OPTIONS':
            return True
        # For all other methods, require authentication
        return request.user and request.user.is_authenticated


class IsSuperAdminOrReadOnly(BasePermission):
    """
    Permission class that allows GET and OPTIONS requests without authentication
    but requires super admin status for POST, PATCH, PUT, DELETE.
    
    IMPORTANT: Cette classe vérifie le statut super admin UNIQUEMENT depuis le token JWT,
    jamais depuis les paramètres de requête ou request.data pour éviter les manipulations.
    """
    def has_permission(self, request, view):
        import logging
        from api.utils import is_super_admin_from_token, get_authenticated_user_from_token
        logger = logging.getLogger(__name__)
        
        # Allow OPTIONS requests without authentication (for CORS preflight)
        if request.method == 'OPTIONS':
            logger.info(f"IsSuperAdminOrReadOnly: Allowing OPTIONS request for {request.path}")
            return True
        
        # Allow GET requests without authentication (public read access)
        if request.method == 'GET':
            logger.debug(f"IsSuperAdminOrReadOnly: Allowing GET request for {request.path} (public read)")
            return True
        
        # For all other methods (POST, PATCH, PUT, DELETE), require super admin
        # Vérifier d'abord depuis request.user (DRF peut avoir authentifié)
        is_super_admin = False
        user_email = 'unknown'
        
        # Si DRF a authentifié, vérifier depuis request.user
        if request.user and request.user.is_authenticated:
            try:
                if hasattr(request.user, 'is_super_admin') and callable(request.user.is_super_admin):
                    is_super_admin = request.user.is_super_admin()
                elif hasattr(request.user, 'is_superuser'):
                    is_super_admin = request.user.is_superuser
                user_email = request.user.email if hasattr(request.user, 'email') else 'unknown'
            except Exception as e:
                logger.warning(f"Error checking super admin from request.user: {e}")
        
        # Si pas encore vérifié, essayer depuis le token JWT directement
        if not is_super_admin:
            is_super_admin = is_super_admin_from_token(request)
            if is_super_admin:
                user_from_token, _ = get_authenticated_user_from_token(request)
                if user_from_token:
                    user_email = user_from_token.email if hasattr(user_from_token, 'email') else 'unknown'
        
        if not is_super_admin:
            logger.warning(
                f"IsSuperAdminOrReadOnly: Permission denied for {request.method} {request.path}. "
                f"User: {user_email} is not super admin (verified from JWT token)."
            )
        else:
            logger.info(
                f"IsSuperAdminOrReadOnly: Permission granted for {request.method} {request.path}. "
                f"User: {user_email} is super admin (verified from JWT token)."
            )
        
        return is_super_admin


class IsSuperAdminOrOptions(BasePermission):
    """
    Permission class that allows OPTIONS requests without authentication
    but requires super admin status for all other methods.
    
    IMPORTANT: Cette classe vérifie le statut super admin UNIQUEMENT depuis le token JWT,
    jamais depuis les paramètres de requête ou request.data pour éviter les manipulations.
    """
    def has_permission(self, request, view):
        import logging
        from api.utils import is_super_admin_from_token
        logger = logging.getLogger(__name__)
        
        # Allow OPTIONS requests without authentication (for CORS preflight)
        if request.method == 'OPTIONS':
            logger.info(f"IsSuperAdminOrOptions: Allowing OPTIONS request for {request.path}")
            return True
        
        # Vérifier le statut super admin depuis le token JWT uniquement
        is_super_admin = is_super_admin_from_token(request)
        
        if not is_super_admin:
            user_email = 'unknown'
            if request.user and hasattr(request.user, 'email'):
                user_email = request.user.email
            logger.warning(
                f"IsSuperAdminOrOptions: Permission denied for {request.method} {request.path}. "
                f"User: {user_email} is not super admin (verified from JWT token)."
            )
        else:
            user_email = 'unknown'
            if request.user and hasattr(request.user, 'email'):
                user_email = request.user.email
            logger.info(
                f"IsSuperAdminOrOptions: Permission granted for {request.method} {request.path}. "
                f"User: {user_email} is super admin (verified from JWT token)."
            )
        
        return is_super_admin


def add_cors_headers(response, request):
    """Helper function to add CORS headers to a response"""
    try:
        # Try to get origin from HTTP_ORIGIN first
        origin = request.META.get('HTTP_ORIGIN')
        
        # If no origin, try to extract from HTTP_REFERER
        if not origin:
            referer = request.META.get('HTTP_REFERER', '')
            if referer:
                try:
                    from urllib.parse import urlparse
                    parsed = urlparse(referer)
                    origin = f"{parsed.scheme}://{parsed.netloc}"
                except Exception:
                    pass
        
        # If still no origin and in DEBUG mode, use default
        if not origin or not origin.startswith('http'):
            if settings.DEBUG:
                # Try to get from request host
                host = request.META.get('HTTP_HOST', '')
                if host:
                    scheme = 'https' if request.is_secure() else 'http'
                    origin = f"{scheme}://{host}"
                else:
                    origin = 'http://localhost:9494'
            else:
                # In production, if no origin, don't add CORS headers
                return response
        
        # Determine allowed origins and methods
        allowed_origins = []
        if settings.DEBUG:
            # In development, allow localhost, 127.0.0.1, and 192.168.1.134 on any port
            allowed_origins = [
                'http://localhost',
                'https://localhost',
                'http://127.0.0.1',
                'https://127.0.0.1',
                'http://192.168.1.134',
                'https://192.168.1.134',
            ]
        else:
            # In production, use configured allowed origins
            if hasattr(settings, 'CORS_ALLOWED_ORIGINS'):
                allowed_origins = settings.CORS_ALLOWED_ORIGINS
        
        # Check if origin is allowed (match base without port)
        origin_allowed = False
        if settings.DEBUG:
            # In DEBUG, check if origin starts with any allowed base (with or without port)
            for allowed_base in allowed_origins:
                # Check exact match or starts with base (to handle ports)
                if origin == allowed_base or origin.startswith(allowed_base + ':'):
                    origin_allowed = True
                    break
        else:
            # In production, exact match required
            origin_allowed = origin in allowed_origins
        
        # Always add CORS headers if origin is allowed, or in DEBUG mode for debugging
        if origin_allowed or settings.DEBUG:
            response['Access-Control-Allow-Origin'] = origin if origin_allowed else '*'
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Allow-Methods'] = ', '.join(getattr(settings, 'CORS_ALLOW_METHODS', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']))
            response['Access-Control-Allow-Headers'] = ', '.join(getattr(settings, 'CORS_ALLOW_HEADERS', ['accept', 'accept-encoding', 'authorization', 'content-type', 'dnt', 'origin', 'user-agent', 'x-csrftoken', 'x-requested-with']))
            response['Access-Control-Max-Age'] = '86400'
            # Add exposed headers for debugging
            if settings.DEBUG:
                response['Access-Control-Expose-Headers'] = 'Content-Type, Authorization'
    except Exception as e:
        logger.warning(f"Error adding CORS headers: {e}")
        # In DEBUG mode, still add basic CORS headers even on error
        if settings.DEBUG:
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with'
    
    return response


@api_view(['GET', 'POST', 'PATCH', 'PUT', 'OPTIONS'])
@permission_classes([IsSuperAdminOrReadOnly])
def system_settings_view(request):
    """Get, create or update system settings (singleton)"""
    try:
        # Handle OPTIONS request for CORS preflight (before authentication check)
        if request.method == 'OPTIONS':
            response = Response({}, status=status.HTTP_200_OK)
            add_cors_headers(response, request)
            return response
        
        # IsSuperAdminOrOptions already checks authentication and super admin status
        # Log user info for debugging
        user_email = getattr(request.user, 'email', 'unknown')
        user_id = getattr(request.user, 'id', None)
        has_auth_header = 'HTTP_AUTHORIZATION' in request.META
        auth_header = request.META.get('HTTP_AUTHORIZATION', 'not present')[:50] if has_auth_header else 'not present'
        logger.info(
            f"System settings request ({request.method}) - User: {user_email} (ID: {user_id}), "
            f"Auth header present: {has_auth_header}, Auth header preview: {auth_header}"
        )
        
        # GET - Retrieve settings
        if request.method == 'GET':
            try:
                instance = SystemSettings.get_settings()
                serializer = SystemSettingsSerializer(instance)
                response = Response(serializer.data)
                add_cors_headers(response, request)
                return response
            except Exception as e:
                logger.error(f"Error getting system settings: {e}", exc_info=True)
                # Try to create default instance on GET error
                try:
                    instance = SystemSettings()
                    instance.save()
                    serializer = SystemSettingsSerializer(instance)
                    response = Response(serializer.data)
                    add_cors_headers(response, request)
                    return response
                except Exception as create_error:
                    logger.error(f"Error creating default system settings: {create_error}", exc_info=True)
                    # Return default settings as fallback
                    default_data = {
                        'site_name': 'VTCBuilder',
                        'site_url': 'http://localhost:9494',
                        'contact_email': 'contact@vtcbuilder.com',
                        'support_email': 'support@vtcbuilder.com',
                        'email_host': 'smtp.maily.ovh',
                        'email_port': 587,
                        'email_use_tls': True,
                        'email_use_ssl': False,
                        'email_from': 'noreply@vtcbuilder.com',
                        'default_trial_days': 14,
                        'enable_trial': True,
                        'password_min_length': 8,
                        'require_email_verification': True,
                        'session_timeout_minutes': 1440,
                        'max_login_attempts': 5,
                        'lockout_duration_minutes': 30,
                        'default_currency': 'EUR',
                        'tax_rate': '20.00',
                        'invoice_prefix': 'INV-',
                        'payment_terms_days': 30,
                        'max_file_size_mb': 10,
                        'allowed_file_types': [],
                        'enable_email_notifications': True,
                        'notify_on_new_tenant': True,
                        'notify_on_payment_failed': True,
                        'notify_on_subscription_expiring': True,
                        'maintenance_mode': False,
                        'maintenance_message': 'Le site est en maintenance.',
                        'public_homepage_blocks': [],
                        'public_homepage_meta_title': 'VTCBuilder - Le WordPress des chauffeurs VTC',
                        'public_homepage_meta_description': 'Plateforme complète pour créer et gérer votre site VTC professionnel',
                        'extra_settings': {},
                    }
                    error_response = Response(default_data, status=status.HTTP_200_OK)
                    add_cors_headers(error_response, request)
                    return error_response
        
        # POST/PATCH/PUT - Create or update settings
        else:
            # Log détaillé pour les requêtes PATCH
            logger.info(
                f"System settings {request.method} request - User: {user_email} (ID: {user_id}), "
                f"Auth header present: {has_auth_header}, Auth header preview: {auth_header}, "
                f"Data keys: {list(request.data.keys()) if hasattr(request.data, 'keys') else 'no data'}"
            )
            # Try to get existing instance
            try:
                instance = SystemSettings.get_settings()
                # Update existing
                is_partial = request.method == 'PATCH'
                serializer = SystemSettingsSerializer(instance, data=request.data, partial=is_partial)
            except Exception:
                # Create new if doesn't exist
                instance = SystemSettings()
                serializer = SystemSettingsSerializer(instance, data=request.data)
            
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
            logger.info(
                f"System settings {request.method} successful - User: {user_email} (ID: {user_id}), "
                f"Updated fields: {list(request.data.keys()) if hasattr(request.data, 'keys') else 'unknown'}"
            )
            
            # Synchroniser les pages publiques avec le projet système après sauvegarde
            try:
                from projects.models import Project, ProjectPage
                # Chercher le projet système (peut avoir différents slugs selon la version)
                system_project = Project.objects.filter(is_system_project=True).first()
                if not system_project:
                    # Créer le projet système s'il n'existe pas
                    system_project = Project.objects.create(
                        name='VTCBuilder - Site Public',
                        slug='vtcbuilder-public-site',
                        description='Projet système pour les pages publiques de VTCBuilder',
                        is_system_project=True,
                        status='active'
                    )
                    logger.info(f"Projet système créé: {system_project.name} (ID: {system_project.id})")
                
                if system_project:
                    synced_pages = []
                    
                    # Ajouter la page d'accueil si elle existe dans public_homepage_blocks
                    # (priorité à public_homepage_blocks pour la page d'accueil)
                    if instance.public_homepage_blocks is not None:
                        page, created = ProjectPage.objects.get_or_create(
                            project=system_project,
                            page_slug='home',
                            page_type='public',
                            defaults={'order': 0, 'is_active': True}
                        )
                        synced_pages.append('home')
                        if created:
                            logger.info(f"Page 'home' ajoutée au projet système depuis public_homepage_blocks")
                    
                    # Ajouter les autres pages publiques (y compris les sous-pages)
                    # Exclure 'home' si elle existe déjà dans public_homepage_blocks pour éviter les doublons
                    if instance.public_pages:
                        # Trier les pages pour maintenir l'ordre
                        sorted_pages = sorted(instance.public_pages.items(), key=lambda x: x[1].get('order', 999) if isinstance(x[1], dict) else 999)
                        for order, (slug, page_data) in enumerate(sorted_pages, start=1):
                            # Ne pas synchroniser 'home' si elle existe déjà dans public_homepage_blocks
                            # (pour éviter les doublons dans le projet système)
                            if slug == 'home' and instance.public_homepage_blocks is not None:
                                logger.debug(f"Page 'home' ignorée dans public_pages car elle existe déjà dans public_homepage_blocks")
                                continue
                            
                            page, created = ProjectPage.objects.get_or_create(
                                project=system_project,
                                page_slug=slug,
                                page_type='public',
                                defaults={'order': order, 'is_active': True}
                            )
                            synced_pages.append(slug)
                            if created:
                                logger.info(f"Page '{slug}' ajoutée au projet système")
                    
                    logger.info(f"Synchronisation terminée: {len(synced_pages)} pages synchronisées avec le projet système")
            except Exception as sync_error:
                logger.error(f"Error synchronisation pages publiques avec projet: {sync_error}", exc_info=True)
            
            status_code = status.HTTP_200_OK if instance.pk else status.HTTP_201_CREATED
            response = Response(serializer.data, status=status_code)
            add_cors_headers(response, request)
            return response
            
    except Exception as e:
        logger.error(f"Error in system_settings_view ({request.method}): {e}", exc_info=True)
        
        # Return appropriate error response with CORS headers
        if request.method == 'GET':
            # Return default settings on error
            default_data = {
                'site_name': 'VTCBuilder',
                'site_url': 'http://localhost:9494',
                'contact_email': 'contact@vtcbuilder.com',
                'support_email': 'support@vtcbuilder.com',
                'email_host': 'smtp.maily.ovh',
                'email_port': 587,
                'email_use_tls': True,
                'email_use_ssl': False,
                'email_from': 'noreply@vtcbuilder.com',
                'default_trial_days': 14,
                'enable_trial': True,
                'password_min_length': 8,
                'require_email_verification': True,
                'session_timeout_minutes': 1440,
                'max_login_attempts': 5,
                'lockout_duration_minutes': 30,
                'default_currency': 'EUR',
                'tax_rate': '20.00',
                'invoice_prefix': 'INV-',
                'payment_terms_days': 30,
                'max_file_size_mb': 10,
                'allowed_file_types': [],
                'enable_email_notifications': True,
                'notify_on_new_tenant': True,
                'notify_on_payment_failed': True,
                'notify_on_subscription_expiring': True,
                'maintenance_mode': False,
                'maintenance_message': 'Le site est en maintenance.',
                'public_homepage_blocks': [],
                'public_homepage_meta_title': 'VTCBuilder - Le WordPress des chauffeurs VTC',
                'public_homepage_meta_description': 'Plateforme complète pour créer et gérer votre site VTC professionnel',
                'extra_settings': {},
            }
            error_response = Response(default_data, status=status.HTTP_200_OK)
            add_cors_headers(error_response, request)
            return error_response
        else:
            error_response = Response(
                {
                    'error': 'Error lors de la sauvegarde des paramètres',
                    'message': str(e) if settings.DEBUG else 'Une erreur est survenue'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            add_cors_headers(error_response, request)
            return error_response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def system_settings_test_email_view(request):
    """Test email configuration - send test email to specified recipient"""
    try:
        # Vérification sécurisée depuis le token JWT uniquement
        if not is_super_admin_from_token(request):
            error_response = Response(
                {'error': 'Only super admin can test email configuration'},
                status=status.HTTP_403_FORBIDDEN
            )
            add_cors_headers(error_response, request)
            return error_response
        
        # Get recipient email from request body
        recipient_email = request.data.get('email', '').strip()
        
        if not recipient_email or '@' not in recipient_email:
            error_response = Response(
                {
                    'status': 'error',
                    'message': 'Veuillez fournir une adresse email valide'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
            add_cors_headers(error_response, request)
            return error_response
        
        try:
            # Use Django default email settings from .env (already configured in settings.py)
            from django.core.mail import send_mail
            from django.conf import settings as django_settings
            
            # Email from address - use env var or default
            from decouple import config
            email_from = config('DEFAULT_FROM_EMAIL', default='noreply@vtcbuilder.com')
            
            # Send test email using Django's configured email backend
            send_mail(
                subject='Test Email - VTCBuilder',
                message='Ceci est un email de test depuis VTCBuilder.\n\nSi vous recevez ce message, la configuration email fonctionne correctement.\n\nLes emails automatiques (réinitialisation de mot de passe, activation de compte, factures) seront envoyés depuis noreply@vtcbuilder.com.',
                from_email=email_from,
                recipient_list=[recipient_email],
                fail_silently=False,
            )
            
            logger.info(f"Test email sent successfully to {recipient_email} from {email_from}")
            
            response = Response({
                'status': 'success',
                'message': f'Email de test envoyé avec succès à {recipient_email} !'
            })
            add_cors_headers(response, request)
            return response
        except Exception as e:
            logger.error(f"Error sending test email to {recipient_email}: {e}", exc_info=True)
            error_response = Response(
                {
                    'status': 'error',
                    'message': f'Error lors de l\'envoi de l\'email de test: {str(e)}'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
            add_cors_headers(error_response, request)
            return error_response
    except Exception as e:
        logger.error(f"Unexpected error in system_settings_test_email_view: {e}", exc_info=True)
        error_response = Response(
            {
                'status': 'error',
                'message': 'Une erreur inattendue est survenue',
                'error': str(e) if settings.DEBUG else None
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        add_cors_headers(error_response, request)
        return error_response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def system_settings_test_stripe_view(request):
    """Test Stripe connection with provided keys"""
    try:
        # Vérification sécurisée depuis le token JWT uniquement
        if not is_super_admin_from_token(request):
            error_response = Response(
                {'error': 'Only super admin can test Stripe connection'},
                status=status.HTTP_403_FORBIDDEN
            )
            add_cors_headers(error_response, request)
            return error_response
        
        from .stripe_config import test_stripe_connection
        
        # Get keys from request or settings
        secret_key = request.data.get('secret_key') or request.data.get('stripe_secret_key')
        
        # Test connection
        result = test_stripe_connection(secret_key)
        
        if result['status'] == 'success':
            response = Response(result)
        else:
            response = Response(
                result,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        add_cors_headers(response, request)
        return response
    except Exception as e:
        logger.error(f"Unexpected error in system_settings_test_stripe_view: {e}", exc_info=True)
        error_response = Response(
            {
                'status': 'error',
                'message': 'Une erreur inattendue est survenue',
                'error': str(e) if settings.DEBUG else None
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        add_cors_headers(error_response, request)
        return error_response


class SystemSettingsViewSet(viewsets.ModelViewSet):
    """ViewSet for managing system settings"""
    queryset = SystemSettings.objects.all()
    serializer_class = SystemSettingsSerializer
    permission_classes = [IsSuperAdminOrReadOnly]  # Allow GET without auth, require super admin for modifications
    http_method_names = ['get', 'put', 'patch', 'options', 'head']
    
    def get_queryset(self):
        """Return singleton instance"""
        return SystemSettings.objects.all()
    
    def get_object(self):
        """Get or create the singleton settings instance"""
        try:
            return SystemSettings.get_settings()
        except Exception:
            # If get_or_create fails, create a new instance
            instance = SystemSettings()
            instance.save()
            return instance
    
    def dispatch(self, request, *args, **kwargs):
        """Handle OPTIONS requests for CORS preflight"""
        if request.method == 'OPTIONS':
            response = Response({}, status=status.HTTP_200_OK)
            add_cors_headers(response, request)
            return response
        return super().dispatch(request, *args, **kwargs)
    
    def list(self, request, *args, **kwargs):
        """Return the singleton settings instance"""
        # GET requests are allowed without authentication (public read access)
        # Only modifications require super admin (handled by permission class)
        try:
            # get_or_create will create if doesn't exist
            instance = SystemSettings.get_settings()
            serializer = self.get_serializer(instance)
            response = Response(serializer.data)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error getting system settings: {e}", exc_info=True)
            # Try to create default instance
            try:
                instance = SystemSettings()
                instance.save()
                serializer = self.get_serializer(instance)
                response = Response(serializer.data)
                add_cors_headers(response, request)
                return response
            except Exception as create_error:
                logger.error(f"Error creating default system settings: {create_error}", exc_info=True)
                # Return error details for debugging
                error_response = Response(
                    {'error': f'Error lors de la récupération des paramètres système: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                add_cors_headers(error_response, request)
                return error_response
    
    def retrieve(self, request, *args, **kwargs):
        """Get settings instance"""
        # GET requests are allowed without authentication (public read access)
        # Only modifications require super admin (handled by permission class)
        response = super().retrieve(request, *args, **kwargs)
        add_cors_headers(response, request)
        return response
    
    def create(self, request, *args, **kwargs):
        """Create or update system settings (singleton pattern)"""
        # Vérifier si l'utilisateur est super admin
        # Vérification sécurisée depuis le token JWT uniquement
        is_super_admin = is_super_admin_from_token(request)
        
        if not is_super_admin:
            error_response = Response(
                {'error': 'Only super admin can manage system settings'},
                status=status.HTTP_403_FORBIDDEN
            )
            add_cors_headers(error_response, request)
            return error_response
        
        try:
            instance = self.get_object()
        except:
            # Create new instance if it doesn't exist
            instance = SystemSettings()
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        response = Response(serializer.data, status=status.HTTP_201_CREATED if not instance.pk else status.HTTP_200_OK)
        add_cors_headers(response, request)
        return response
    
    def update(self, request, *args, **kwargs):
        """Update system settings"""
        # Vérifier si l'utilisateur est super admin
        # Vérification sécurisée depuis le token JWT uniquement
        is_super_admin = is_super_admin_from_token(request)
        
        if not is_super_admin:
            error_response = Response(
                {'error': 'Only super admin can manage system settings'},
                status=status.HTTP_403_FORBIDDEN
            )
            add_cors_headers(error_response, request)
            return error_response
        
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        response = Response(serializer.data)
        add_cors_headers(response, request)
        return response
    
    def partial_update(self, request, *args, **kwargs):
        """Partially update system settings"""
        # Log dès l'entrée dans la méthode
        user_email = 'unknown'
        if request.user and hasattr(request.user, 'email'):
            user_email = request.user.email
        
        has_auth_header = 'HTTP_AUTHORIZATION' in request.META or 'Authorization' in request.headers
        auth_header_preview = ''
        if has_auth_header:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '') or request.headers.get('Authorization', '')
            auth_header_preview = auth_header[:50] if auth_header else 'empty'
        
        logger.info(
            f"SystemSettingsViewSet.partial_update ENTRY: user={user_email}, "
            f"method={request.method}, path={request.path}, "
            f"auth_header={'present' if has_auth_header else 'missing'}, "
            f"auth_preview: {auth_header_preview}, "
            f"data_keys: {list(request.data.keys()) if hasattr(request.data, 'keys') else 'no data'}"
        )
        
        # Vérification sécurisée depuis le token JWT uniquement
        is_super_admin = is_super_admin_from_token(request)
        
        logger.info(
            f"SystemSettingsViewSet.partial_update: user={user_email}, "
            f"is_super_admin={is_super_admin} (verified from JWT token), "
            f"method={request.method}, path={request.path}"
        )
        
        if not is_super_admin:
            logger.warning(
                f"Access denied to SystemSettingsViewSet.partial_update - User: {user_email}, "
                f"Origin: {request.META.get('HTTP_ORIGIN', 'unknown')}"
            )
            error_response = Response(
                {'error': 'Only super admin can manage system settings'},
                status=status.HTTP_403_FORBIDDEN
            )
            add_cors_headers(error_response, request)
            return error_response
        
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        response = Response(serializer.data)
        add_cors_headers(response, request)
        return response
    
    @action(detail=False, methods=['get'])
    def test_email(self, request):
        """Test email configuration"""
        # Vérification sécurisée depuis le token JWT uniquement
        if not is_super_admin_from_token(request):
            return Response(
                {'error': 'Only super admin can test email configuration'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        settings = self.get_object()
        
        try:
            from django.core.mail import send_mail
            from django.conf import settings as django_settings
            
            # Temporarily update Django email settings
            django_settings.EMAIL_HOST = settings.email_host
            django_settings.EMAIL_PORT = settings.email_port
            django_settings.EMAIL_USE_TLS = settings.email_use_tls
            django_settings.EMAIL_USE_SSL = settings.email_use_ssl
            django_settings.EMAIL_HOST_USER = settings.email_host_user
            django_settings.EMAIL_HOST_PASSWORD = settings.email_host_password
            django_settings.EMAIL_FROM = settings.email_from
            
            # Send test email
            send_mail(
                subject='Test Email - VTCBuilder',
                message='Ceci est un email de test depuis VTCBuilder.',
                from_email=settings.email_from,
                recipient_list=[request.user.email],
                fail_silently=False,
            )
            
            return Response({
                'status': 'success',
                'message': 'Email de test envoyé avec succès !'
            })
        except Exception as e:
            return Response(
                {
                    'status': 'error',
                    'message': f'Error lors de l\'envoi de l\'email de test: {str(e)}'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

