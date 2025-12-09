"""
API views for media models
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import logging
from django.conf import settings
from .models import Media, Template
try:
    from .template_storage import TemplateStorage
except ImportError:
    TemplateStorage = None
from .serializers import (
    MediaSerializer, MediaUploadSerializer, MediaListSerializer,
    TemplateSerializer, TemplateListSerializer
)

logger = logging.getLogger(__name__)


def add_cors_headers(response, request):
    """Helper function to add CORS headers to a response"""
    try:
        origin = request.META.get('HTTP_ORIGIN')
        if origin:
            if settings.DEBUG:
                if origin.startswith('http://localhost') or origin.startswith('http://127.0.0.1'):
                    response['Access-Control-Allow-Origin'] = origin
                    response['Access-Control-Allow-Credentials'] = 'true'
                    response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
                    response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with'
            else:
                if hasattr(settings, 'CORS_ALLOWED_ORIGINS') and origin in settings.CORS_ALLOWED_ORIGINS:
                    response['Access-Control-Allow-Origin'] = origin
                    response['Access-Control-Allow-Credentials'] = 'true'
    except Exception as e:
        logger.warning(f"Error adding CORS headers: {e}")


class MediaViewSet(viewsets.ModelViewSet):
    """ViewSet for managing media files"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        """Return empty queryset - actual querying done in tenant_context in methods"""
        from django.db import models
        return models.QuerySet().none()

    def list(self, request, *args, **kwargs):
        """List media files with error handling"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        
        # Tenant admin/users see only their tenant's media
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    queryset = Media.objects.filter(tenant=user.tenant)
                    
                    # Apply filters from query params
                    collection = request.query_params.get('collection')
                    if collection:
                        queryset = queryset.filter(collection=collection)
                    
                    # Serialize within tenant context
                    serializer = MediaListSerializer(queryset, many=True)
                    response = Response(serializer.data)
                    add_cors_headers(response, request)
                    return response
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error listing media: {e}", exc_info=True)
                response = Response([], status=status.HTTP_200_OK)
                add_cors_headers(response, request)
                return response
        
        # Super admin with tenant_id (optional for future use)
        if user.is_super_admin():
            tenant_id = request.query_params.get('tenant_id')
            if tenant_id:
                try:
                    from tenants.models import Tenant
                    tenant = Tenant.objects.get(id=tenant_id)
                    with tenant_context(tenant):
                        queryset = Media.objects.all()
                        serializer = MediaListSerializer(queryset, many=True)
                        response = Response(serializer.data)
                        add_cors_headers(response, request)
                        return response
                except Exception as e:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Error listing media: {e}", exc_info=True)
                    response = Response([], status=status.HTTP_200_OK)
                    add_cors_headers(response, request)
                    return response
        
        response = Response([], status=status.HTTP_200_OK)
        add_cors_headers(response, request)
        return response

    def get_object(self):
        """Get media object within tenant context"""
        from django_tenants.utils import tenant_context
        
        user = self.request.user
        
        if hasattr(user, 'tenant') and user.tenant:
            with tenant_context(user.tenant):
                pk = self.kwargs.get('pk')
                return Media.objects.get(pk=pk, tenant=user.tenant)
        
        # For super admin with tenant_id
        from tenants.models import Tenant
        tenant_id = self.request.query_params.get('tenant_id')
        if tenant_id:
            tenant = Tenant.objects.get(id=tenant_id)
            with tenant_context(tenant):
                pk = self.kwargs.get('pk')
                return Media.objects.get(pk=pk)
        
        from django.http import Http404
        raise Http404("Media not found")

    def create(self, request, *args, **kwargs):
        """Create a new media"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        
        if hasattr(user, 'tenant') and user.tenant:
            try:
                serializer = MediaUploadSerializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                validated_data = serializer.validated_data
                
                with tenant_context(user.tenant):
                    validated_data['tenant'] = user.tenant
                    media = Media.objects.create(**validated_data)
                    response_serializer = MediaSerializer(media)
                    response = Response(response_serializer.data, status=status.HTTP_201_CREATED)
                    add_cors_headers(response, request)
                    return response
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error creating media: {e}", exc_info=True)
                if hasattr(e, 'detail'):
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                return Response(
                    {'error': f'Erreur lors de la création: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(
            {'error': 'Aucun tenant associé à votre compte'},
            status=status.HTTP_400_BAD_REQUEST
        )

    def update(self, request, *args, **kwargs):
        """Update a media"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    partial = kwargs.pop('partial', False)
                    pk = kwargs.get('pk')
                    instance = Media.objects.get(pk=pk, tenant=user.tenant)
                    serializer = MediaSerializer(instance, data=request.data, partial=partial)
                    serializer.is_valid(raise_exception=True)
                    serializer.save()
                    return Response(serializer.data)
            except Media.DoesNotExist:
                return Response(
                    {'error': 'Media not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error updating media: {e}", exc_info=True)
                return Response(
                    {'error': f'Erreur lors de la mise à jour: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(
            {'error': 'Aucun tenant associé à votre compte'},
            status=status.HTTP_400_BAD_REQUEST
        )

    def destroy(self, request, *args, **kwargs):
        """Delete a media"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    pk = kwargs.get('pk')
                    instance = Media.objects.get(pk=pk, tenant=user.tenant)
                    instance.delete()
                    return Response(status=status.HTTP_204_NO_CONTENT)
            except Media.DoesNotExist:
                return Response(
                    {'error': 'Media not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error deleting media: {e}", exc_info=True)
                return Response(
                    {'error': f'Erreur lors de la suppression: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(
            {'error': 'Aucun tenant associé à votre compte'},
            status=status.HTTP_400_BAD_REQUEST
        )

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create' or self.action == 'upload':
            return MediaUploadSerializer
        elif self.action == 'list':
            return MediaListSerializer
        return MediaSerializer

    @action(detail=False, methods=['post'])
    def upload(self, request):
        """Upload a media file"""
        from django_tenants.utils import tenant_context
        import logging
        logger = logging.getLogger(__name__)
        
        user = request.user
        
        # Check authentication first
        if not user or not user.is_authenticated:
            error_response = Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
            add_cors_headers(error_response, request)
            return error_response
        
        if hasattr(user, 'tenant') and user.tenant:
            try:
                # Remove tenant from request.data if present (will be set from user context)
                data = request.data.copy()
                if 'tenant' in data:
                    del data['tenant']
                
                # Ensure 'file' is present in the request
                if 'file' not in data and 'file' not in request.FILES:
                    # Ne pas logger comme erreur - c'est une validation normale
                    error_response = Response(
                        {'error': 'Aucun fichier fourni. Veuillez sélectionner un fichier à téléverser.', 'details': {'file': ['Ce champ est requis.']}},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    add_cors_headers(error_response, request)
                    return error_response
                
                # Use request.FILES if file is not in data
                if 'file' not in data and 'file' in request.FILES:
                    data['file'] = request.FILES['file']
                
                serializer = MediaUploadSerializer(data=data)
                if not serializer.is_valid():
                    # Ne pas logger comme erreur - c'est une validation normale
                    error_response = Response(
                        {'error': 'Erreur de validation', 'details': serializer.errors},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                    add_cors_headers(error_response, request)
                    return error_response
                
                validated_data = serializer.validated_data
                
                # Get project_id from request if provided
                project_id = validated_data.pop('project_id', None)
                if project_id:
                    try:
                        from projects.models import Project
                        # Vérifier que le projet existe et appartient au tenant ou est un projet système
                        with tenant_context(user.tenant):
                            project = Project.objects.filter(id=project_id).first()
                            if project:
                                validated_data['project'] = project
                    except Exception as e:
                        logger.warning(f"Error setting project for media: {e}")
                        # Continuer sans projet si erreur
                
                with tenant_context(user.tenant):
                    # Set tenant FK - django-tenants handles cross-schema FK
                    validated_data['tenant'] = user.tenant
                    media = serializer.save(tenant=user.tenant)
                    response = Response(MediaSerializer(media).data, status=status.HTTP_201_CREATED)
                    add_cors_headers(response, request)
                    return response
            except Exception as e:
                logger.error(f"Error uploading media: {str(e)}", exc_info=True)
                if hasattr(e, 'detail'):
                    error_response = Response({'error': str(e.detail), 'details': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                    add_cors_headers(error_response, request)
                    return error_response
                error_response = Response(
                    {'error': f'Erreur lors du téléversement: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                add_cors_headers(error_response, request)
                return error_response
        
        return Response(
            {'error': 'Aucun tenant associé à votre compte'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['get'])
    def images(self, request):
        """Get only image files, optionally filtered by project"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        project_id = request.query_params.get('project_id')
        
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    queryset = Media.objects.filter(tenant=user.tenant, mime_type__startswith='image/')
                    
                    # Filtrer par projet si project_id fourni
                    if project_id:
                        try:
                            project_id_int = int(project_id)
                            if project_id_int > 0:
                                queryset = queryset.filter(project_id=project_id_int)
                            else:
                                # project_id=0 signifie "sans projet" (globales)
                                queryset = queryset.filter(project__isnull=True)
                        except (ValueError, TypeError):
                            pass  # Ignorer si project_id n'est pas un entier valide
                    
                    serializer = MediaListSerializer(queryset, many=True)
                    response = Response(serializer.data)
                    add_cors_headers(response, request)
                    return response
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error getting images: {e}", exc_info=True)
                response = Response([], status=status.HTTP_200_OK)
                add_cors_headers(response, request)
                return response
        
        response = Response([], status=status.HTTP_200_OK)
        add_cors_headers(response, request)
        return response

    @action(detail=False, methods=['get'])
    def documents(self, request):
        """Get only document files"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    queryset = Media.objects.filter(
                        tenant=user.tenant
                    ).filter(
                        mime_type__startswith='application/'
                    ) | Media.objects.filter(
                        tenant=user.tenant,
                        mime_type__startswith='text/'
                    )
                    serializer = MediaListSerializer(queryset, many=True)
                    return Response(serializer.data)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error getting documents: {e}", exc_info=True)
                return Response([], status=status.HTTP_200_OK)
        
        return Response([], status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def by_collection(self, request):
        """Get media filtered by collection"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        collection = request.query_params.get('collection', 'other')
        
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    queryset = Media.objects.filter(tenant=user.tenant, collection=collection)
                    serializer = MediaListSerializer(queryset, many=True)
                    return Response(serializer.data)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error getting media by collection: {e}", exc_info=True)
                return Response([], status=status.HTTP_200_OK)
        
        return Response([], status=status.HTTP_200_OK)


class TemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing templates"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # Support pour upload d'images

    def _get_reference_tenant(self):
        """Get the public website tenant for super admin template management"""
        from tenants.models import Tenant
        # Use the public website tenant (vtcbuilder-public-website) for templates
        tenant = Tenant.objects.filter(
            slug='vtcbuilder-public-website',
            deleted_at__isnull=True
        ).first()
        if not tenant:
            # Fallback to first active tenant (exclude public schema)
            tenant = Tenant.objects.filter(
                deleted_at__isnull=True, 
                status='active'
            ).exclude(schema_name='public').first()
        if not tenant:
            # Fallback to any tenant (even inactive) if no active tenant (exclude public)
            tenant = Tenant.objects.filter(
                deleted_at__isnull=True
            ).exclude(schema_name='public').first()
        return tenant

    def get_queryset(self):
        """Return empty queryset - actual querying done in tenant_context in methods"""
        from django.db import models
        return models.QuerySet().none()

    def create(self, request, *args, **kwargs):
        """Create a new template"""
        from django_tenants.utils import tenant_context
        from django.utils.text import slugify
        
        user = request.user
        
        # Super admin creates template in reference tenant
        if user.is_super_admin():
            tenant = self._get_reference_tenant()
            if not tenant:
                return Response(
                    {'error': 'Aucun tenant de référence disponible pour créer des templates'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                
                with tenant_context(tenant):
                    # Auto-generate slug if not provided
                    data = serializer.validated_data.copy()
                    if not data.get('slug'):
                        from django.utils.text import slugify
                        data['slug'] = slugify(data.get('name', ''))
                    
                    template = Template.objects.create(**data)
                    
                    # Sauvegarder automatiquement dans les fichiers (custom templates)
                    if TemplateStorage:
                        try:
                            storage = TemplateStorage()
                            template_data = storage.export_template_from_db(template)
                            storage.save_template(template_data, is_default=False)
                            logger.info(f"Template '{template.name}' sauvegardé dans les fichiers")
                        except Exception as e:
                            logger.warning(f"Impossible de sauvegarder le template dans les fichiers: {e}")
                    
                    # Générer automatiquement la preview si le template a du contenu HTML/CSS
                    if not template.preview_image and template.html_content:
                        try:
                            from media.screenshot_service import screenshot_service
                            if screenshot_service.playwright_available:
                                screenshot_service.generate_and_save_preview(template)
                                template.save()
                        except Exception as e:
                            logger.warning(f"Impossible de générer la preview automatiquement: {e}")
                    
                    return Response(TemplateSerializer(template).data, status=status.HTTP_201_CREATED)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error creating template: {e}", exc_info=True)
                return Response(
                    {'error': f'Erreur lors de la création: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        # Tenant admin creates template in their tenant
        if hasattr(user, 'tenant') and user.tenant:
            try:
                serializer = TemplateSerializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                validated_data = serializer.validated_data
                
                # Auto-generate slug if not provided
                if not validated_data.get('slug') and validated_data.get('name'):
                    from django.utils.text import slugify
                    validated_data['slug'] = slugify(validated_data.get('name'))
                
                with tenant_context(user.tenant):
                    template = Template.objects.create(**validated_data)
                    
                    # Générer automatiquement la preview si le template a du contenu HTML/CSS
                    if not template.preview_image and template.html_content:
                        try:
                            from media.screenshot_service import screenshot_service
                            if screenshot_service.playwright_available:
                                screenshot_service.generate_and_save_preview(template)
                                template.save()
                        except Exception as e:
                            logger.warning(f"Impossible de générer la preview automatiquement: {e}")
                    
                    return Response(TemplateSerializer(template).data, status=status.HTTP_201_CREATED)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error creating template: {e}", exc_info=True)
                if hasattr(e, 'detail'):
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                return Response(
                    {'error': f'Erreur lors de la création: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(
            {'error': 'Aucun tenant associé à votre compte'},
            status=status.HTTP_400_BAD_REQUEST
        )

    def update(self, request, *args, **kwargs):
        """Update a template"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        
        if user.is_super_admin():
            tenant = self._get_reference_tenant()
            if not tenant:
                return Response(
                    {'error': 'Aucun tenant de référence disponible'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                with tenant_context(tenant):
                    partial = kwargs.pop('partial', False)
                    pk = kwargs.get('pk')
                    instance = Template.objects.get(pk=pk)
                    serializer = TemplateSerializer(instance, data=request.data, partial=partial)
                    serializer.is_valid(raise_exception=True)
                    serializer.save()
                    template = serializer.instance
                    
                    # Sauvegarder automatiquement dans les fichiers (custom templates)
                    if TemplateStorage:
                        try:
                            storage = TemplateStorage()
                            template_data = storage.export_template_from_db(template)
                            storage.save_template(template_data, is_default=False)
                            logger.info(f"Template '{template.name}' mis à jour dans les fichiers")
                        except Exception as e:
                            logger.warning(f"Impossible de sauvegarder le template dans les fichiers: {e}")
                    
                    # Régénérer la preview si le contenu HTML/CSS a été modifié
                    if ('html_content' in request.data or 'css_content' in request.data) and request.data.get('regenerate_preview', False):
                        try:
                            from media.screenshot_service import screenshot_service
                            if screenshot_service.playwright_available:
                                screenshot_service.generate_and_save_preview(instance)
                                instance.save()
                        except Exception as e:
                            logger.warning(f"Impossible de régénérer la preview: {e}")
                    
                    return Response(serializer.data)
            except Template.DoesNotExist:
                return Response(
                    {'error': 'Template not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error updating template: {e}", exc_info=True)
                return Response(
                    {'error': f'Erreur lors de la mise à jour: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        # Tenant admin updates template in their tenant
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    partial = kwargs.pop('partial', False)
                    pk = kwargs.get('pk')
                    instance = Template.objects.get(pk=pk)
                    serializer = TemplateSerializer(instance, data=request.data, partial=partial)
                    serializer.is_valid(raise_exception=True)
                    serializer.save()
                    template = serializer.instance
                    
                    # Sauvegarder automatiquement dans les fichiers (custom templates)
                    if TemplateStorage:
                        try:
                            storage = TemplateStorage()
                            template_data = storage.export_template_from_db(template)
                            storage.save_template(template_data, is_default=False)
                            logger.info(f"Template '{template.name}' mis à jour dans les fichiers")
                        except Exception as e:
                            logger.warning(f"Impossible de sauvegarder le template dans les fichiers: {e}")
                    
                    # Régénérer la preview si le contenu HTML/CSS a été modifié
                    if ('html_content' in request.data or 'css_content' in request.data) and request.data.get('regenerate_preview', False):
                        try:
                            from media.screenshot_service import screenshot_service
                            if screenshot_service.playwright_available:
                                screenshot_service.generate_and_save_preview(instance)
                                instance.save()
                        except Exception as e:
                            logger.warning(f"Impossible de régénérer la preview: {e}")
                    
                    return Response(serializer.data)
            except Template.DoesNotExist:
                return Response(
                    {'error': 'Template not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error updating template: {e}", exc_info=True)
                return Response(
                    {'error': f'Erreur lors de la mise à jour: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(
            {'error': 'Aucun tenant associé à votre compte'},
            status=status.HTTP_400_BAD_REQUEST
        )

    def destroy(self, request, *args, **kwargs):
        """Delete a template"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        
        if user.is_super_admin():
            tenant = self._get_reference_tenant()
            if not tenant:
                return Response(
                    {'error': 'Aucun tenant de référence disponible'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                with tenant_context(tenant):
                    pk = kwargs.get('pk')
                    instance = Template.objects.get(pk=pk)
                    slug = instance.slug
                    instance.delete()
                    
                    # Supprimer aussi le fichier si c'est un template custom
                    if TemplateStorage:
                        try:
                            storage = TemplateStorage()
                            storage.delete_template(slug, is_default=False)
                            logger.info(f"Template '{slug}' supprimé des fichiers")
                        except Exception as e:
                            logger.warning(f"Impossible de supprimer le template des fichiers: {e}")
                    
                    return Response(status=status.HTTP_204_NO_CONTENT)
            except Template.DoesNotExist:
                return Response(
                    {'error': 'Template not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error deleting template: {e}", exc_info=True)
                return Response(
                    {'error': f'Erreur lors de la suppression: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        # Tenant admin deletes template in their tenant
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    pk = kwargs.get('pk')
                    instance = Template.objects.get(pk=pk)
                    instance.delete()
                    return Response(status=status.HTTP_204_NO_CONTENT)
            except Template.DoesNotExist:
                return Response(
                    {'error': 'Template not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error deleting template: {e}", exc_info=True)
                return Response(
                    {'error': f'Erreur lors de la suppression: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(
            {'error': 'Aucun tenant associé à votre compte'},
            status=status.HTTP_400_BAD_REQUEST
        )

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return TemplateListSerializer
        return TemplateSerializer

    def list(self, request, *args, **kwargs):
        """List templates with error handling"""
        from django_tenants.utils import tenant_context
        
        try:
            user = request.user
            
            # Tenant users access templates from their tenant
            if hasattr(user, 'tenant') and user.tenant:
                try:
                    with tenant_context(user.tenant):
                        queryset = Template.objects.filter(is_active=True)
                        
                        # Apply filters from query params
                        is_premium = request.query_params.get('is_premium')
                        category = request.query_params.get('category')
                        
                        if is_premium is not None:
                            is_premium_bool = is_premium.lower() == 'true'
                            queryset = queryset.filter(is_premium=is_premium_bool)
                        
                        if category:
                            queryset = queryset.filter(category=category)
                        
                        # Serialize within tenant context
                        serializer = TemplateListSerializer(queryset, many=True)
                        response = Response(serializer.data)
                        add_cors_headers(response, request)
                        return response
                except Exception as e:
                    logger.error(f"Error listing templates for tenant {user.tenant.id if user.tenant else 'None'}: {str(e)}", exc_info=True)
                    # Return empty array on error instead of 500
                    response = Response([], status=status.HTTP_200_OK)
                    add_cors_headers(response, request)
                    return response
            
            # Super admin can access templates from reference tenant
            try:
                if user.is_super_admin():
                    tenant = self._get_reference_tenant()
                    if tenant:
                        try:
                            logger.debug(f"Super admin accessing templates from reference tenant: {tenant.id}")
                            with tenant_context(tenant):
                                queryset = Template.objects.all()
                                
                                # Apply filters
                                is_premium = request.query_params.get('is_premium')
                                category = request.query_params.get('category')
                                
                                if is_premium is not None:
                                    is_premium_bool = is_premium.lower() == 'true'
                                    queryset = queryset.filter(is_premium=is_premium_bool)
                                
                                if category:
                                    queryset = queryset.filter(category=category)
                                
                                serializer = TemplateListSerializer(queryset, many=True)
                                logger.debug(f"Returning {len(serializer.data)} templates")
                                response = Response(serializer.data)
                                add_cors_headers(response, request)
                                return response
                        except Exception as e:
                            # Silently ignore "relation does not exist" errors (normal for public schema)
                            error_msg = str(e).lower()
                            if 'relation' not in error_msg or 'does not exist' not in error_msg:
                                logger.error(f"Error listing templates for super admin with tenant {tenant.id}: {str(e)}", exc_info=True)
                            # Return empty array on error instead of 500
                            response = Response([], status=status.HTTP_200_OK)
                            add_cors_headers(response, request)
                            return response
                    else:
                        logger.warning("No reference tenant available for super admin template listing")
                        # No reference tenant available, return empty list
                        response = Response([], status=status.HTTP_200_OK)
                        add_cors_headers(response, request)
                        return response
            except Exception as e:
                logger.error(f"Error checking super admin in TemplateViewSet.list: {e}", exc_info=True)
            
            logger.warning(f"User {user.id} is neither tenant user nor super admin")
            response = Response([], status=status.HTTP_200_OK)
            add_cors_headers(response, request)
            return response
            
        except Exception as e:
            logger.error(f"Unexpected error in TemplateViewSet.list: {str(e)}", exc_info=True)
            error_response = Response({
                'error': 'An error occurred while fetching templates',
                'message': str(e) if settings.DEBUG else 'Unable to load templates'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            add_cors_headers(error_response, request)
            return error_response

    def get_object(self):
        """Get template object within tenant context"""
        from django_tenants.utils import tenant_context
        
        user = self.request.user
        
        if hasattr(user, 'tenant') and user.tenant:
            with tenant_context(user.tenant):
                pk = self.kwargs.get('pk')
                return Template.objects.get(pk=pk)
        
        # For super admin with reference tenant
        if user.is_super_admin():
            tenant = self._get_reference_tenant()
            if tenant:
                with tenant_context(tenant):
                    pk = self.kwargs.get('pk')
                    return Template.objects.get(pk=pk)
        
        from django.http import Http404
        raise Http404("Template not found")

    @action(detail=True, methods=['post'])
    def use_template(self, request, pk=None):
        """Mark template as used (increment usage count)"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    template = Template.objects.get(pk=pk)
                    template.increment_usage()
                    serializer = TemplateSerializer(template)
                    return Response(serializer.data)
            except Template.DoesNotExist:
                return Response(
                    {'error': 'Template not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error using template: {str(e)}")
                return Response(
                    {'error': f'Erreur lors de l\'utilisation du template: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(
            {'error': 'Aucun tenant associé à votre compte'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['get'])
    def free(self, request):
        """Get only free templates"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    queryset = Template.objects.filter(is_active=True, is_premium=False)
                    serializer = TemplateListSerializer(queryset, many=True)
                    return Response(serializer.data)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error getting free templates: {e}", exc_info=True)
                return Response([], status=status.HTTP_200_OK)
        
        return Response([], status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def premium(self, request):
        """Get only premium templates"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    queryset = Template.objects.filter(is_active=True, is_premium=True)
                    serializer = TemplateListSerializer(queryset, many=True)
                    return Response(serializer.data)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error getting premium templates: {e}", exc_info=True)
                return Response([], status=status.HTTP_200_OK)
        
        return Response([], status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def generate_preview(self, request, pk=None):
        """
        Génère automatiquement une capture d'écran du template
        POST data (optionnel): {
            'width': 1200,
            'height': 800,
            'force': true  # Régénérer même si une preview existe
        }
        """
        from media.screenshot_service import screenshot_service
        
        template = self.get_object()
        
        # Vérifier si Playwright est disponible
        if not screenshot_service.playwright_available:
            response = Response(
                {'error': 'Playwright n\'est pas disponible. Installez-le avec: playwright install'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
            add_cors_headers(response, request)
            return response
        
        # Vérifier si une preview existe déjà
        if template.preview_image and not request.data.get('force', False):
            response = Response(
                {'message': 'Une preview existe déjà. Utilisez "force": true pour régénérer'},
                status=status.HTTP_200_OK
            )
            add_cors_headers(response, request)
            return response
        
        try:
            width = request.data.get('width', 1200)
            height = request.data.get('height', 800)
            
            # Générer la preview
            if screenshot_service.generate_and_save_preview(template, width, height):
                template.save()
                serializer = self.get_serializer(template)
                response = Response({
                    'message': 'Preview générée avec succès',
                    'template': serializer.data
                }, status=status.HTTP_200_OK)
            else:
                response = Response(
                    {'error': 'Erreur lors de la génération de la preview'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        except Exception as e:
            logger.error(f"Erreur lors de la génération de la preview: {e}", exc_info=True)
            response = Response(
                {'error': f'Erreur lors de la génération: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        add_cors_headers(response, request)
        return response
    
    @action(detail=True, methods=['post'])
    def render(self, request, pk=None):
        """
        Render template with provided context and blocks
        POST data: {
            'context': {'variable_name': 'value'},
            'blocks': {'block_name': '<html>...</html>'}
        }
        """
        from .template_renderer import TemplateRenderer
        
        template = self.get_object()
        context = request.data.get('context', {})
        blocks = request.data.get('blocks', {})
        
        renderer = TemplateRenderer(
            template_html=template.html_content or '',
            template_css=template.css_content or '',
            variables_def=template.variables or {}
        )
        
        rendered_html, rendered_css = renderer.render(context=context, blocks=blocks)
        
        return Response({
            'html': rendered_html,
            'css': rendered_css,
            'template_id': template.id,
            'template_name': template.name
        })
    
    @action(detail=True, methods=['get'])
    def variables(self, request, pk=None):
        """Get available variables for this template"""
        template = self.get_object()
        
        # Extract variables from template content
        from .template_renderer import TemplateRenderer
        all_vars = TemplateRenderer.extract_variables(
            (template.html_content or '') + (template.css_content or '')
        )
        
        # Merge with defined variables
        defined_vars = template.variables or {}
        
        variables_info = {}
        for var_name in all_vars:
            if var_name in defined_vars:
                variables_info[var_name] = defined_vars[var_name]
            else:
                # Auto-detect variable type
                variables_info[var_name] = {
                    'type': 'string',
                    'default': '',
                    'description': f'Variable auto-détectée: {var_name}',
                    'required': False
                }
        
        return Response({
            'variables': variables_info,
            'variable_names': all_vars
        })

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get templates filtered by category"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        category = request.query_params.get('category', 'vtc')
        
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    queryset = Template.objects.filter(is_active=True, category=category)
                    serializer = TemplateListSerializer(queryset, many=True)
                    return Response(serializer.data)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error getting templates by category: {e}", exc_info=True)
                return Response([], status=status.HTTP_200_OK)
        
        return Response([], status=status.HTTP_200_OK)
