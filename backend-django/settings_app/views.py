"""
Views for System Settings
"""
import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .models import SystemSettings
from .serializers import SystemSettingsSerializer

logger = logging.getLogger(__name__)


def add_cors_headers(response, request):
    """Helper function to add CORS headers to a response"""
    try:
        origin = request.META.get('HTTP_ORIGIN') or request.META.get('HTTP_REFERER', '').split('/')[0:3]
        if isinstance(origin, list):
            origin = '/'.join(origin)
        
        # Si pas d'origin, essayer de le déduire de la requête
        if not origin or not origin.startswith('http'):
            # En développement, autoriser par défaut
            if settings.DEBUG:
                origin = 'http://localhost:9494'
            else:
                return response
        
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
            if hasattr(settings, 'CORS_ALLOWED_ORIGINS') and origin in settings.CORS_ALLOWED_ORIGINS:
                response['Access-Control-Allow-Origin'] = origin
                response['Access-Control-Allow-Credentials'] = 'true'
                response['Access-Control-Allow-Methods'] = ', '.join(settings.CORS_ALLOW_METHODS)
                response['Access-Control-Allow-Headers'] = ', '.join(settings.CORS_ALLOW_HEADERS)
    except Exception as e:
        logger.warning(f"Error adding CORS headers: {e}")
    
    return response


@api_view(['GET', 'POST', 'PATCH', 'PUT', 'OPTIONS'])
def system_settings_view(request):
    """Get, create or update system settings (singleton)"""
    try:
        # Handle OPTIONS request for CORS preflight (before authentication check)
        if request.method == 'OPTIONS':
            response = Response({}, status=status.HTTP_200_OK)
            add_cors_headers(response, request)
            return response
        
        # Check authentication for non-OPTIONS requests
        if not request.user or not request.user.is_authenticated:
            error_response = Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
            add_cors_headers(error_response, request)
            return error_response
        
        # Vérifier si l'utilisateur est super admin (avec plusieurs méthodes de vérification)
        is_super_admin = False
        if hasattr(request.user, 'is_super_admin') and callable(request.user.is_super_admin):
            is_super_admin = request.user.is_super_admin()
        elif hasattr(request.user, 'is_superuser'):
            is_super_admin = request.user.is_superuser
        elif hasattr(request.user, 'is_staff'):
            is_super_admin = request.user.is_staff
        
        if not is_super_admin:
            error_response = Response(
                {'error': 'Only super admin can manage system settings'},
                status=status.HTTP_403_FORBIDDEN
            )
            add_cors_headers(error_response, request)
            return error_response
        
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
            
            # Synchroniser les pages publiques avec le projet système après sauvegarde
            try:
                from projects.models import Project, ProjectPage
                system_project = Project.objects.filter(slug='vtcbuilder-public-site', is_system_project=True).first()
                if system_project:
                    # Ajouter la page d'accueil si elle existe
                    if instance.public_homepage_blocks is not None:
                        ProjectPage.objects.get_or_create(
                            project=system_project,
                            page_slug='home',
                            page_type='public',
                            defaults={'order': 0}
                        )
                    
                    # Ajouter les autres pages publiques
                    if instance.public_pages:
                        for order, (slug, page_data) in enumerate(instance.public_pages.items(), start=1):
                            ProjectPage.objects.get_or_create(
                                project=system_project,
                                page_slug=slug,
                                page_type='public',
                                defaults={'order': order}
                            )
            except Exception as sync_error:
                logger.warning(f"Erreur synchronisation pages publiques avec projet: {sync_error}")
            
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
                    'error': 'Erreur lors de la sauvegarde des paramètres',
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
        if not request.user.is_super_admin():
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
                    'message': f'Erreur lors de l\'envoi de l\'email de test: {str(e)}'
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
        if not request.user.is_super_admin():
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
    permission_classes = [IsAuthenticated]
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
        # Vérifier si l'utilisateur est super admin
        is_super_admin = False
        if hasattr(request.user, 'is_super_admin') and callable(request.user.is_super_admin):
            is_super_admin = request.user.is_super_admin()
        elif hasattr(request.user, 'is_superuser'):
            is_super_admin = request.user.is_superuser
        elif hasattr(request.user, 'is_staff'):
            is_super_admin = request.user.is_staff
        
        if not is_super_admin:
            error_response = Response(
                {'error': 'Only super admin can view system settings'},
                status=status.HTTP_403_FORBIDDEN
            )
            add_cors_headers(error_response, request)
            return error_response
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
                    {'error': f'Erreur lors de la récupération des paramètres système: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                add_cors_headers(error_response, request)
                return error_response
    
    def retrieve(self, request, *args, **kwargs):
        """Get settings instance"""
        # Vérifier si l'utilisateur est super admin
        is_super_admin = False
        if hasattr(request.user, 'is_super_admin') and callable(request.user.is_super_admin):
            is_super_admin = request.user.is_super_admin()
        elif hasattr(request.user, 'is_superuser'):
            is_super_admin = request.user.is_superuser
        elif hasattr(request.user, 'is_staff'):
            is_super_admin = request.user.is_staff
        
        if not is_super_admin:
            error_response = Response(
                {'error': 'Only super admin can view system settings'},
                status=status.HTTP_403_FORBIDDEN
            )
            add_cors_headers(error_response, request)
            return error_response
        response = super().retrieve(request, *args, **kwargs)
        add_cors_headers(response, request)
        return response
    
    def create(self, request, *args, **kwargs):
        """Create or update system settings (singleton pattern)"""
        # Vérifier si l'utilisateur est super admin
        is_super_admin = False
        if hasattr(request.user, 'is_super_admin') and callable(request.user.is_super_admin):
            is_super_admin = request.user.is_super_admin()
        elif hasattr(request.user, 'is_superuser'):
            is_super_admin = request.user.is_superuser
        elif hasattr(request.user, 'is_staff'):
            is_super_admin = request.user.is_staff
        
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
        is_super_admin = False
        if hasattr(request.user, 'is_super_admin') and callable(request.user.is_super_admin):
            is_super_admin = request.user.is_super_admin()
        elif hasattr(request.user, 'is_superuser'):
            is_super_admin = request.user.is_superuser
        elif hasattr(request.user, 'is_staff'):
            is_super_admin = request.user.is_staff
        
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
        # Vérifier si l'utilisateur est super admin
        is_super_admin = False
        if hasattr(request.user, 'is_super_admin') and callable(request.user.is_super_admin):
            is_super_admin = request.user.is_super_admin()
        elif hasattr(request.user, 'is_superuser'):
            is_super_admin = request.user.is_superuser
        elif hasattr(request.user, 'is_staff'):
            is_super_admin = request.user.is_staff
        
        if not is_super_admin:
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
        if not request.user.is_super_admin():
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
                    'message': f'Erreur lors de l\'envoi de l\'email de test: {str(e)}'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

