"""
API views for service models
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from api.mixins import CORSMixin
from .models import Service
from .serializers import ServiceSerializer, ServiceListSerializer, ServicePriceSerializer


class ServiceViewSet(CORSMixin, viewsets.ModelViewSet):
    """ViewSet for managing services"""
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return empty queryset - actual querying done in tenant_context in methods"""
        # We can't return a QuerySet created in tenant_context here because
        # the context ends before serialization. Each method must handle tenant_context.
        from django.db import models
        return models.QuerySet().none()

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return ServiceListSerializer
        elif self.action == 'pricing':
            return ServicePriceSerializer
        return ServiceSerializer

    def list(self, request, *args, **kwargs):
        """List services with error handling"""
        import logging
        logger = logging.getLogger(__name__)
        from django_tenants.utils import tenant_context
        from tenants.models import Tenant
        from django.db import connection
        
        user = request.user
        
        # Tenant admin/users see only their tenant's services
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    # In tenant context, all services belong to this tenant
                    # So we can query all services without filtering by tenant
                    queryset = Service.objects.all()
                    
                    # Apply filters from query params
                    is_active = request.query_params.get('is_active')
                    if is_active is not None:
                        is_active_bool = is_active.lower() == 'true'
                        queryset = queryset.filter(is_active=is_active_bool)
                    
                    # Serialize within tenant context
                    serializer = ServiceListSerializer(queryset, many=True)
                    return Response(serializer.data)
            except Exception as e:
                logger.error(f"Error listing services for tenant {user.tenant.id if user.tenant else 'None'}: {str(e)}", exc_info=True)
                # Return error details for debugging
                return Response(
                    {'error': f'Error lors de la récupération des services: {str(e)}', 'details': str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        # Super admin with tenant_id
        if user.is_super_admin():
            tenant_id = request.query_params.get('tenant_id')
            if tenant_id:
                try:
                    tenant = Tenant.objects.get(id=tenant_id)
                    with tenant_context(tenant):
                        queryset = Service.objects.all()
                        serializer = ServiceListSerializer(queryset, many=True)
                        return Response(serializer.data)
                except Tenant.DoesNotExist:
                    return Response(
                        {'error': 'Tenant not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
                except Exception as e:
                    logger.error(f"Error listing services for tenant {tenant_id}: {str(e)}", exc_info=True)
                    return Response(
                        {'error': f'Error lors de la récupération des services: {str(e)}', 'details': str(e)},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
        
        return Response([], status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        """Create a new service"""
        from django_tenants.utils import tenant_context
        from django.utils.text import slugify
        import logging
        logger = logging.getLogger(__name__)
        
        user = request.user
        
        # Tenant admin creates service in their tenant
        if hasattr(user, 'tenant') and user.tenant:
            try:
                # Remove tenant from request.data if present (will be set from user context)
                data = request.data.copy()
                if 'tenant' in data:
                    del data['tenant']
                
                # Validate data first using serializer (without saving)
                serializer = ServiceSerializer(data=data)
                if not serializer.is_valid():
                    logger.error(f"Serializer validation errors: {serializer.errors}")
                    return Response(
                        {'error': 'Error de validation', 'details': serializer.errors},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                validated_data = serializer.validated_data
                
                # Auto-generate slug if not provided
                if not validated_data.get('slug') and validated_data.get('name'):
                    validated_data['slug'] = slugify(validated_data.get('name'))
                
                with tenant_context(user.tenant):
                    # Set tenant FK - django-tenants handles cross-schema FK
                    validated_data['tenant'] = user.tenant
                    service = Service.objects.create(**validated_data)
                    
                    # Serialize within tenant context
                    response_serializer = ServiceSerializer(service)
                    return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"Error creating service: {e}", exc_info=True)
                
                # If serializer validation error, return validation errors
                if hasattr(e, 'detail'):
                    return Response({'error': str(e.detail), 'details': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                
                return Response(
                    {'error': f'Error lors de la création: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(
            {'error': 'Aucun tenant associé à votre compte'},
            status=status.HTTP_400_BAD_REQUEST
        )

    def update(self, request, *args, **kwargs):
        """Update a service"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    partial = kwargs.pop('partial', False)
                    pk = kwargs.get('pk')
                    instance = Service.objects.get(pk=pk)
                    serializer = ServiceSerializer(instance, data=request.data, partial=partial)
                    serializer.is_valid(raise_exception=True)
                    serializer.save()
                    return Response(serializer.data)
            except Service.DoesNotExist:
                return Response(
                    {'error': 'Service not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error updating service: {e}", exc_info=True)
                return Response(
                    {'error': f'Error lors de la mise à jour: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(
            {'error': 'Aucun tenant associé à votre compte'},
            status=status.HTTP_400_BAD_REQUEST
        )

    def destroy(self, request, *args, **kwargs):
        """Delete a service"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    pk = kwargs.get('pk')
                    instance = Service.objects.get(pk=pk)
                    instance.delete()
                    return Response(status=status.HTTP_204_NO_CONTENT)
            except Service.DoesNotExist:
                return Response(
                    {'error': 'Service not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error deleting service: {e}", exc_info=True)
                return Response(
                    {'error': f'Error lors de la suppression: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(
            {'error': 'Aucun tenant associé à votre compte'},
            status=status.HTTP_400_BAD_REQUEST
        )

    def get_object(self):
        """Get service object within tenant context"""
        from django_tenants.utils import tenant_context
        
        user = self.request.user
        
        if hasattr(user, 'tenant') and user.tenant:
            with tenant_context(user.tenant):
                pk = self.kwargs.get('pk')
                return Service.objects.get(pk=pk)
        
        # For super admin with tenant_id
        from tenants.models import Tenant
        tenant_id = self.request.query_params.get('tenant_id')
        if tenant_id:
            tenant = Tenant.objects.get(id=tenant_id)
            with tenant_context(tenant):
                pk = self.kwargs.get('pk')
                return Service.objects.get(pk=pk)
        
        from django.http import Http404
        raise Http404("Service not found")

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a service"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    service = Service.objects.get(pk=pk)
                    service.is_active = True
                    service.save()
                    return Response({'status': 'Service activated'})
            except Service.DoesNotExist:
                return Response(
                    {'error': 'Service not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error activating service: {e}", exc_info=True)
                return Response(
                    {'error': f'Error lors de l\'activation: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(
            {'error': 'Aucun tenant associé à votre compte'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a service"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    service = Service.objects.get(pk=pk)
                    service.is_active = False
                    service.save()
                    return Response({'status': 'Service deactivated'})
            except Service.DoesNotExist:
                return Response(
                    {'error': 'Service not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error deactivating service: {e}", exc_info=True)
                return Response(
                    {'error': f'Error lors de la désactivation: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(
            {'error': 'Aucun tenant associé à votre compte'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active services"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    queryset = Service.objects.filter(is_active=True)
                    serializer = ServiceListSerializer(queryset, many=True)
                    return Response(serializer.data)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error getting active services: {e}", exc_info=True)
                return Response([], status=status.HTTP_200_OK)
        
        return Response([], status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def pricing(self, request):
        """Get pricing information for services"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    queryset = Service.objects.filter(is_active=True)
                    serializer = ServicePriceSerializer(queryset, many=True)
                    return Response(serializer.data)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error getting pricing: {e}", exc_info=True)
                return Response([], status=status.HTTP_200_OK)
        
        return Response([], status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def pricing_detail(self, request, pk=None):
        """Get detailed pricing for a specific service"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    service = Service.objects.get(pk=pk)
                    serializer = ServicePriceSerializer(service)
                    return Response(serializer.data)
            except Service.DoesNotExist:
                return Response(
                    {'error': 'Service not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error getting pricing detail: {e}", exc_info=True)
                return Response(
                    {'error': f'Error lors de la récupération: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(
            {'error': 'Aucun tenant associé à votre compte'},
            status=status.HTTP_400_BAD_REQUEST
        )
