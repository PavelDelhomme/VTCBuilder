"""
API views for Block models
"""
from django.db import models
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from api.mixins import CORSMixin
from api.utils import add_cors_headers
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

try:
    from .models import BlockType, BlockTemplate
    from .serializers import BlockTypeSerializer, BlockTemplateSerializer
    BLOCKS_MODELS_AVAILABLE = True
except Exception as e:
    logger.error(f"Error importing blocks models/serializers: {e}", exc_info=True)
    BLOCKS_MODELS_AVAILABLE = False
    BlockType = None
    BlockTemplate = None
    BlockTypeSerializer = None
    BlockTemplateSerializer = None


class BlockTypeViewSet(CORSMixin, viewsets.ModelViewSet):
    """
    ViewSet for BlockType - Full CRUD operations
    Super admin can manage all block types, others see only active ones
    """
    serializer_class = BlockTypeSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None  # Disable pagination - return all block types at once

    def get_queryset(self):
        """Get queryset with error handling"""
        try:
            if not BLOCKS_MODELS_AVAILABLE or BlockType is None:
                logger.error("BlockType model is not available")
                return BlockType.objects.none() if BlockType else []
            
            user = self.request.user
            
            # Super admin sees all block types (including inactive)
            if hasattr(user, 'is_super_admin') and user.is_super_admin():
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
            instance = serializer.save()
            # Handle available_plans ManyToMany
            if 'available_plans' in serializer.validated_data:
                instance.available_plans.set(serializer.validated_data['available_plans'])
        except Exception as e:
            logger.error(f"Error in BlockTypeViewSet.perform_update: {e}", exc_info=True)
            raise

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
            
            # Check authentication
            if not request.user or not request.user.is_authenticated:
                error_response = Response({
                    'error': 'Authentication required',
                    'message': 'You must be authenticated to access block types'
                }, status=status.HTTP_401_UNAUTHORIZED)
                add_cors_headers(error_response, request)
                return error_response
            
            if not BLOCKS_MODELS_AVAILABLE or BlockType is None:
                error_response = Response({
                    'error': 'Block types are not available',
                    'message': 'The blocks app is not properly configured'
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
                add_cors_headers(error_response, request)
                return error_response
            
            # Auto-create default blocks if none exist
            if not BlockType.objects.exists():
                logger.info("No block types found, creating default blocks...")
                try:
                    from django.core.management import call_command
                    call_command('create_default_block_types', verbosity=0)
                    logger.info("Default block types created successfully")
                except Exception as e:
                    logger.error(f"Error creating default block types: {e}", exc_info=True)
                    # Continue anyway - will return empty list
            
            # Get queryset
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

