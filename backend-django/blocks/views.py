"""
API views for Block models
"""
from django.db import models
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from api.mixins import CORSMixin
from api.utils import add_cors_headers
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

try:
    from .models import BlockType, BlockTemplate, CallToAction
    from .serializers import BlockTypeSerializer, BlockTemplateSerializer, CallToActionSerializer
    BLOCKS_MODELS_AVAILABLE = True
except Exception as e:
    logger.error(f"Error importing blocks models/serializers: {e}", exc_info=True)
    BLOCKS_MODELS_AVAILABLE = False
    BlockType = None
    BlockTemplate = None
    CallToAction = None
    BlockTypeSerializer = None
    BlockTemplateSerializer = None
    CallToActionSerializer = None


class BlockTypeViewSet(CORSMixin, viewsets.ModelViewSet):
    """
    ViewSet for BlockType - Full CRUD operations
    Super admin can manage all block types, others see only active ones
    Unauthenticated users can view active block types
    """
    serializer_class = BlockTypeSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access for list, but check in methods
    pagination_class = None  # Disable pagination - return all block types at once

    def get_queryset(self):
        """Get queryset with error handling"""
        try:
            if not BLOCKS_MODELS_AVAILABLE or BlockType is None:
                logger.error("BlockType model is not available")
                return BlockType.objects.none() if BlockType else []
            
            # Vérifier le super admin depuis le token JWT même si DRF n'a pas authentifié
            from api.utils import is_super_admin_from_token, get_authenticated_user_from_token
            user = self.request.user
            
            # Si DRF n'a pas authentifié, essayer le token JWT directement
            if not user or not user.is_authenticated:
                user_from_token, _ = get_authenticated_user_from_token(self.request)
                if user_from_token:
                    user = user_from_token
            
            # Vérifier le super admin depuis le token JWT
            is_super_admin = is_super_admin_from_token(self.request)
            if not is_super_admin and user and hasattr(user, 'is_super_admin'):
                try:
                    is_super_admin = user.is_super_admin()
                except Exception:
                    pass
            
            # Super admin sees all block types (including inactive)
            if is_super_admin:
                queryset = BlockType.objects.all()
            else:
                # Others see only active block types
                queryset = BlockType.objects.filter(is_active=True)
            
            # Filter by category if provided
            category = self.request.query_params.get('category')
            if category:
                queryset = queryset.filter(category=category)
            
            return queryset.order_by('category', 'order', 'label')
        except Exception as e:
            logger.error(f"Error in BlockTypeViewSet.get_queryset: {e}", exc_info=True)
            return BlockType.objects.none() if BlockType else []

    def perform_create(self, serializer):
        """Only super admin can create block types"""
        try:
            user = self.request.user
            if not (hasattr(user, 'is_super_admin') and user.is_super_admin()):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Only super admin can create block types")
            instance = serializer.save()
            # Handle available_plans ManyToMany
            if 'available_plans' in serializer.validated_data:
                instance.available_plans.set(serializer.validated_data['available_plans'])
        except Exception as e:
            logger.error(f"Error in BlockTypeViewSet.perform_create: {e}", exc_info=True)
            raise

    def perform_update(self, serializer):
        """Only super admin can update block types"""
        try:
            user = self.request.user
            if not (hasattr(user, 'is_super_admin') and user.is_super_admin()):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Only super admin can update block types")
            
            # Get the old instance to track changes
            old_instance = self.get_object()
            old_name = old_instance.name
            
            instance = serializer.save()
            
            # Handle available_plans ManyToMany
            if 'available_plans' in serializer.validated_data:
                instance.available_plans.set(serializer.validated_data['available_plans'])
            
            # Propagate changes to all pages and projects that use this block type
            # This ensures that when a BlockType is updated, all blocks using it get the new schema/default_styles
            self._propagate_block_type_changes(instance, old_name)
            
        except Exception as e:
            logger.error(f"Error in BlockTypeViewSet.perform_update: {e}", exc_info=True)
            raise
    
    def _propagate_block_type_changes(self, block_type, old_name=None):
        """
        Propagate block type changes to all pages and projects that use this block type.
        This updates the schema and default_styles for all existing blocks of this type.
        """
        try:
            from settings_app.models import SystemSettings
            from projects.models import Project
            from pages.models import Page
            import json
            
            block_type_name = block_type.name
            
            # Update system settings (public pages)
            try:
                system_settings = SystemSettings.objects.first()
                if system_settings:
                    updated = False
                    
                    # Update public_homepage_blocks
                    if hasattr(system_settings, 'public_homepage_blocks') and system_settings.public_homepage_blocks:
                        homepage_blocks = system_settings.public_homepage_blocks if isinstance(system_settings.public_homepage_blocks, list) else json.loads(system_settings.public_homepage_blocks) if isinstance(system_settings.public_homepage_blocks, str) else []
                        updated_blocks = self._update_blocks_in_tree(homepage_blocks, block_type_name, block_type)
                        if updated_blocks != homepage_blocks:
                            system_settings.public_homepage_blocks = updated_blocks
                            updated = True
                    
                    # Update public_pages (all public pages)
                    if hasattr(system_settings, 'public_pages') and system_settings.public_pages:
                        public_pages = system_settings.public_pages if isinstance(system_settings.public_pages, dict) else json.loads(system_settings.public_pages) if isinstance(system_settings.public_pages, str) else {}
                        for page_slug, page_data in public_pages.items():
                            if isinstance(page_data, dict) and 'blocks' in page_data:
                                page_blocks = page_data['blocks'] if isinstance(page_data['blocks'], list) else []
                                updated_blocks = self._update_blocks_in_tree(page_blocks, block_type_name, block_type)
                                if updated_blocks != page_blocks:
                                    page_data['blocks'] = updated_blocks
                                    updated = True
                        if updated:
                            system_settings.public_pages = public_pages
                    
                    if updated:
                        system_settings.save(update_fields=['public_homepage_blocks', 'public_pages'])
                        logger.info(f"✅ Propagated block type '{block_type_name}' changes to system settings")
            except Exception as e:
                logger.error(f"Error propagating to system settings: {e}", exc_info=True)
            
            # Update all tenant pages
            try:
                pages = Page.objects.all()
                for page in pages:
                    if page.blocks:
                        page_blocks = page.blocks if isinstance(page.blocks, list) else json.loads(page.blocks) if isinstance(page.blocks, str) else []
                        updated_blocks = self._update_blocks_in_tree(page_blocks, block_type_name, block_type)
                        if updated_blocks != page_blocks:
                            page.blocks = updated_blocks
                            page.save(update_fields=['blocks'])
                            logger.info(f"✅ Updated page '{page.slug}' (tenant {page.tenant_id}) with new block type '{block_type_name}'")
            except Exception as e:
                logger.error(f"Error propagating to tenant pages: {e}", exc_info=True)
            
            # Update project pages (stored in system settings or project-specific storage)
            # Note: Project pages might be stored differently, adjust based on your implementation
            try:
                projects = Project.objects.all()
                for project in projects:
                    # If projects store blocks directly, update them here
                    # This depends on your project model structure
                    pass
            except Exception as e:
                logger.error(f"Error propagating to projects: {e}", exc_info=True)
                
        except Exception as e:
            logger.error(f"Error in _propagate_block_type_changes: {e}", exc_info=True)
    
    def _update_blocks_in_tree(self, blocks, block_type_name, block_type):
        """
        Recursively update all blocks of a given type in a tree structure.
        Updates default_styles and ensures schema compatibility.
        """
        if not isinstance(blocks, list):
            return blocks
        
        updated_blocks = []
        for block in blocks:
            if isinstance(block, dict):
                updated_block = block.copy()
                
                # If this block matches the updated block type
                if block.get('type') == block_type_name:
                    # Merge default_styles (keep existing custom styles, add new defaults)
                    if 'styles' not in updated_block:
                        updated_block['styles'] = {}
                    
                    # Update with new default styles (only if not already customized)
                    if block_type.default_styles:
                        for key, value in block_type.default_styles.items():
                            if key not in updated_block['styles']:
                                updated_block['styles'][key] = value
                    
                    # Ensure data structure matches new schema
                    if 'data' not in updated_block:
                        updated_block['data'] = {}
                    
                    # Add default values from schema if missing
                    if block_type.schema:
                        for key, schema_def in block_type.schema.items():
                            if isinstance(schema_def, dict) and 'default' in schema_def:
                                if key not in updated_block['data']:
                                    updated_block['data'][key] = schema_def['default']
                
                # Recursively update children
                if 'children' in updated_block and isinstance(updated_block['children'], list):
                    updated_block['children'] = self._update_blocks_in_tree(updated_block['children'], block_type_name, block_type)
                
                updated_blocks.append(updated_block)
            else:
                updated_blocks.append(block)
        
        return updated_blocks

    def perform_destroy(self, instance):
        """Only super admin can delete block types"""
        try:
            user = self.request.user
            if not (hasattr(user, 'is_super_admin') and user.is_super_admin()):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Only super admin can delete block types")
            instance.delete()
        except Exception as e:
            logger.error(f"Error in BlockTypeViewSet.perform_destroy: {e}", exc_info=True)
            raise

    def list(self, request, *args, **kwargs):
        """List block types with comprehensive error handling and auto-creation of defaults"""
        try:
            # Handle OPTIONS request for CORS preflight
            if request.method == 'OPTIONS':
                response = Response()
                add_cors_headers(response, request)
                return response
            
            # Allow unauthenticated access - return only active block types
            # Authenticated users get filtered results based on permissions
            
            if not BLOCKS_MODELS_AVAILABLE or BlockType is None:
                error_response = Response({
                    'error': 'Block types are not available',
                    'message': 'The blocks app is not properly configured'
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
                add_cors_headers(error_response, request)
                return error_response
            
            # Vérifier l'authentification et le super admin depuis le token JWT
            from api.utils import get_authenticated_user_from_token, is_super_admin_from_token
            user = request.user
            is_authenticated = user and user.is_authenticated
            
            # Si DRF n'a pas authentifié, essayer le token JWT directement
            if not is_authenticated:
                user_from_token, _ = get_authenticated_user_from_token(request)
                if user_from_token:
                    user = user_from_token
                    is_authenticated = True
            
            # Vérifier si c'est un super admin
            is_super_admin = is_super_admin_from_token(request)
            if not is_super_admin and user and hasattr(user, 'is_super_admin'):
                try:
                    is_super_admin = user.is_super_admin()
                except Exception:
                    pass
            
            # Auto-create default blocks if none exist (for authenticated users or super admins)
            if (is_authenticated or is_super_admin) and not BlockType.objects.exists():
                logger.info("No block types found, creating default blocks...")
                try:
                    from django.core.management import call_command
                    call_command('create_default_block_types', verbosity=0)
                    logger.info("Default block types created successfully")
                except Exception as e:
                    logger.error(f"Error creating default block types: {e}", exc_info=True)
                    # Continue anyway - will return empty list
            
            # Get queryset - utiliser get_queryset qui gère maintenant le super admin
            queryset = self.get_queryset()
            
            # Pagination
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                response = self.get_paginated_response(serializer.data)
            else:
                serializer = self.get_serializer(queryset, many=True)
                response = Response(serializer.data)
            
            add_cors_headers(response, request)
            return response
        except Exception as e:
            logger.error(f"Error in BlockTypeViewSet.list: {e}", exc_info=True, stack_info=True)
            error_response = Response({
                'error': 'An error occurred while fetching block types',
                'message': str(e) if settings.DEBUG else 'Unable to load block types'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            add_cors_headers(error_response, request)
            return error_response

    def retrieve(self, request, *args, **kwargs):
        """Retrieve a single block type with error handling"""
        try:
            if not BLOCKS_MODELS_AVAILABLE:
                error_response = Response({
                    'error': 'Block types are not available'
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
                add_cors_headers(error_response, request)
                return error_response
            
            # Allow unauthenticated access - but only for active block types
            if not request.user or not request.user.is_authenticated:
                try:
                    instance = BlockType.objects.get(pk=kwargs.get('pk'), is_active=True)
                    serializer = self.get_serializer(instance)
                    response = Response(serializer.data)
                    add_cors_headers(response, request)
                    return response
                except BlockType.DoesNotExist:
                    error_response = Response({
                        'error': 'Block type not found'
                    }, status=status.HTTP_404_NOT_FOUND)
                    add_cors_headers(error_response, request)
                    return error_response
            
            response = super().retrieve(request, *args, **kwargs)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            logger.error(f"Error in BlockTypeViewSet.retrieve: {e}", exc_info=True)
            error_response = Response({
                'error': 'An error occurred while fetching the block type',
                'message': str(e) if settings.DEBUG else 'Unable to load block type'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            add_cors_headers(error_response, request)
            return error_response


class CallToActionViewSet(CORSMixin, viewsets.ModelViewSet):
    """
    ViewSet for CallToAction - Full CRUD operations
    Super admin can manage all CTAs
    """
    serializer_class = CallToActionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        """Get queryset with error handling"""
        try:
            if not BLOCKS_MODELS_AVAILABLE or CallToAction is None:
                logger.error("CallToAction model is not available")
                return CallToAction.objects.none() if CallToAction else []
            
            # Auto-create default CTAs if none exist
            if CallToAction.objects.count() == 0:
                try:
                    from django.core.management import call_command
                    call_command('create_default_ctas', verbosity=0)
                    logger.info("Default CTAs created automatically")
                except Exception as e:
                    logger.warning(f"Could not create default CTAs: {e}")
            
            user = self.request.user
            
            # Super admin sees all CTAs (including inactive)
            if hasattr(user, 'is_super_admin') and user.is_super_admin():
                queryset = CallToAction.objects.all()
            else:
                # Others see only active and global CTAs
                queryset = CallToAction.objects.filter(is_active=True, is_global=True)
            
            # Filter by type if provided
            cta_type = self.request.query_params.get('type')
            if cta_type:
                queryset = queryset.filter(type=cta_type)
            
            return queryset.order_by('name')
        except Exception as e:
            logger.error(f"Error in CallToActionViewSet.get_queryset: {e}", exc_info=True)
            return CallToAction.objects.none() if CallToAction else []

    def perform_create(self, serializer):
        """Only super admin can create CTAs"""
        try:
            user = self.request.user
            if not (hasattr(user, 'is_super_admin') and user.is_super_admin()):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Only super admin can create call-to-actions")
            serializer.save()
        except Exception as e:
            logger.error(f"Error in CallToActionViewSet.perform_create: {e}", exc_info=True)
            raise

    def perform_update(self, serializer):
        """Only super admin can update CTAs"""
        try:
            user = self.request.user
            if not (hasattr(user, 'is_super_admin') and user.is_super_admin()):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Only super admin can update call-to-actions")
            serializer.save()
        except Exception as e:
            logger.error(f"Error in CallToActionViewSet.perform_update: {e}", exc_info=True)
            raise

    def perform_destroy(self, instance):
        """Only super admin can delete CTAs"""
        try:
            user = self.request.user
            if not (hasattr(user, 'is_super_admin') and user.is_super_admin()):
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Only super admin can delete call-to-actions")
            instance.delete()
        except Exception as e:
            logger.error(f"Error in CallToActionViewSet.perform_destroy: {e}", exc_info=True)
            raise

    def list(self, request, *args, **kwargs):
        """List CTAs with error handling"""
        try:
            if request.method == 'OPTIONS':
                response = Response()
                add_cors_headers(response, request)
                return response
            
            if not request.user or not request.user.is_authenticated:
                error_response = Response({
                    'error': 'Authentication required'
                }, status=status.HTTP_401_UNAUTHORIZED)
                add_cors_headers(error_response, request)
                return error_response
            
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            response = Response(serializer.data)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            logger.error(f"Error in CallToActionViewSet.list: {e}", exc_info=True)
            error_response = Response({
                'error': 'An error occurred while fetching call-to-actions',
                'message': str(e) if settings.DEBUG else 'Unable to load call-to-actions'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            add_cors_headers(error_response, request)
            return error_response


class BlockTemplateViewSet(CORSMixin, viewsets.ModelViewSet):
    """
    ViewSet for BlockTemplate
    """
    serializer_class = BlockTemplateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter templates based on user role"""
        user = self.request.user
        queryset = BlockTemplate.objects.filter(is_active=True)
        
        # Tenant admin/users see global templates + their tenant templates
        if hasattr(user, 'tenant') and user.tenant:
            queryset = queryset.filter(
                models.Q(is_global=True) | models.Q(tenant=user.tenant)
            )
        
        # Super admin sees all
        if user.is_super_admin():
            queryset = BlockTemplate.objects.all()
        
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        """Set tenant when creating template"""
        user = self.request.user
        if user.is_tenant_admin() and user.tenant:
            serializer.save(tenant=user.tenant)
        else:
            serializer.save()

