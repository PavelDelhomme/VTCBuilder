"""
API views for booking models
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from api.mixins import CORSMixin
from .models import Booking
from .serializers import (
    BookingSerializer, BookingCreateSerializer,
    BookingUpdateSerializer, BookingListSerializer, BookingStatusSerializer
)


class BookingViewSet(CORSMixin, viewsets.ModelViewSet):
    """ViewSet for managing bookings"""
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return empty queryset - actual querying done in tenant_context in methods"""
        from django.db import models
        return models.QuerySet().none()

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return BookingCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return BookingUpdateSerializer
        elif self.action == 'list':
            return BookingListSerializer
        return BookingSerializer

    def list(self, request, *args, **kwargs):
        """List bookings with error handling"""
        from django_tenants.utils import tenant_context
        from tenants.models import Tenant
        
        user = request.user
        
        # Tenant admin/users see only their tenant's bookings
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    queryset = Booking.objects.filter(tenant=user.tenant)
                    
                    # Apply filters from query params
                    status_filter = request.query_params.get('status')
                    if status_filter and status_filter != 'all':
                        queryset = queryset.filter(status=status_filter)
                    
                    # Serialize within tenant context
                    serializer = BookingListSerializer(queryset, many=True)
                    return Response(serializer.data)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error listing bookings: {e}", exc_info=True)
                return Response([], status=status.HTTP_200_OK)
        
        # Super admin with tenant_id
        if user.is_super_admin():
            tenant_id = request.query_params.get('tenant_id')
            if tenant_id:
                try:
                    tenant = Tenant.objects.get(id=tenant_id)
                    with tenant_context(tenant):
                        queryset = Booking.objects.all()
                        serializer = BookingListSerializer(queryset, many=True)
                        return Response(serializer.data)
                except Exception as e:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Error listing bookings: {e}", exc_info=True)
                    return Response([], status=status.HTTP_200_OK)
        
        return Response([], status=status.HTTP_200_OK)

    def get_object(self):
        """Get booking object within tenant context"""
        from django_tenants.utils import tenant_context
        
        user = self.request.user
        
        if hasattr(user, 'tenant') and user.tenant:
            with tenant_context(user.tenant):
                pk = self.kwargs.get('pk')
                return Booking.objects.get(pk=pk, tenant=user.tenant)
        
        # For super admin with tenant_id
        from tenants.models import Tenant
        tenant_id = self.request.query_params.get('tenant_id')
        if tenant_id:
            tenant = Tenant.objects.get(id=tenant_id)
            with tenant_context(tenant):
                pk = self.kwargs.get('pk')
                return Booking.objects.get(pk=pk)
        
        from django.http import Http404
        raise Http404("Booking not found")

    def create(self, request, *args, **kwargs):
        """Create a new booking"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        
        if hasattr(user, 'tenant') and user.tenant:
            try:
                serializer = BookingCreateSerializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                validated_data = serializer.validated_data
                
                with tenant_context(user.tenant):
                    validated_data['tenant'] = user.tenant
                    booking = Booking.objects.create(**validated_data)
                    response_serializer = BookingSerializer(booking)
                    return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error creating booking: {e}", exc_info=True)
                if hasattr(e, 'detail'):
                    return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                return Response(
                    {'error': f'Error lors de la création: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(
            {'error': 'Aucun tenant associé à votre compte'},
            status=status.HTTP_400_BAD_REQUEST
        )

    def update(self, request, *args, **kwargs):
        """Update a booking"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    partial = kwargs.pop('partial', False)
                    pk = kwargs.get('pk')
                    instance = Booking.objects.get(pk=pk, tenant=user.tenant)
                    serializer = BookingUpdateSerializer(instance, data=request.data, partial=partial)
                    serializer.is_valid(raise_exception=True)
                    serializer.save()
                    return Response(serializer.data)
            except Booking.DoesNotExist:
                return Response(
                    {'error': 'Booking not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error updating booking: {e}", exc_info=True)
                return Response(
                    {'error': f'Error lors de la mise à jour: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(
            {'error': 'Aucun tenant associé à votre compte'},
            status=status.HTTP_400_BAD_REQUEST
        )

    def destroy(self, request, *args, **kwargs):
        """Delete a booking"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    pk = kwargs.get('pk')
                    instance = Booking.objects.get(pk=pk, tenant=user.tenant)
                    instance.delete()
                    return Response(status=status.HTTP_204_NO_CONTENT)
            except Booking.DoesNotExist:
                return Response(
                    {'error': 'Booking not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error deleting booking: {e}", exc_info=True)
                return Response(
                    {'error': f'Error lors de la suppression: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(
            {'error': 'Aucun tenant associé à votre compte'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm a booking"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    booking = Booking.objects.get(pk=pk, tenant=user.tenant)
                    booking.status = 'confirmed'
                    booking.save()
                    serializer = BookingStatusSerializer(booking)
                    return Response(serializer.data)
            except Booking.DoesNotExist:
                return Response(
                    {'error': 'Booking not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error confirming booking: {e}", exc_info=True)
                return Response(
                    {'error': f'Error lors de la confirmation: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(
            {'error': 'Aucun tenant associé à votre compte'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def start_trip(self, request, pk=None):
        """Start a trip"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    booking = Booking.objects.get(pk=pk, tenant=user.tenant)
                    booking.status = 'in_progress'
                    booking.save()
                    serializer = BookingStatusSerializer(booking)
                    return Response(serializer.data)
            except Booking.DoesNotExist:
                return Response(
                    {'error': 'Booking not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error starting trip: {e}", exc_info=True)
                return Response(
                    {'error': f'Error lors du démarrage: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(
            {'error': 'Aucun tenant associé à votre compte'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete a booking"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    booking = Booking.objects.get(pk=pk, tenant=user.tenant)
                    booking.status = 'completed'
                    booking.save()
                    serializer = BookingStatusSerializer(booking)
                    return Response(serializer.data)
            except Booking.DoesNotExist:
                return Response(
                    {'error': 'Booking not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error completing booking: {e}", exc_info=True)
                return Response(
                    {'error': f'Error lors de la finalisation: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(
            {'error': 'Aucun tenant associé à votre compte'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    booking = Booking.objects.get(pk=pk, tenant=user.tenant)
                    booking.status = 'cancelled'
                    booking.cancellation_reason = request.data.get('reason', '')
                    booking.save()
                    serializer = BookingStatusSerializer(booking)
                    return Response(serializer.data)
            except Booking.DoesNotExist:
                return Response(
                    {'error': 'Booking not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error cancelling booking: {e}", exc_info=True)
                return Response(
                    {'error': f'Error lors de l\'annulation: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(
            {'error': 'Aucun tenant associé à votre compte'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending bookings"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    queryset = Booking.objects.filter(tenant=user.tenant, status='pending')
                    serializer = BookingListSerializer(queryset, many=True)
                    return Response(serializer.data)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error getting pending bookings: {e}", exc_info=True)
                return Response([], status=status.HTTP_200_OK)
        
        return Response([], status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def confirmed(self, request):
        """Get confirmed bookings"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    queryset = Booking.objects.filter(tenant=user.tenant, status='confirmed')
                    serializer = BookingListSerializer(queryset, many=True)
                    return Response(serializer.data)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error getting confirmed bookings: {e}", exc_info=True)
                return Response([], status=status.HTTP_200_OK)
        
        return Response([], status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def in_progress(self, request):
        """Get in-progress bookings"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    queryset = Booking.objects.filter(tenant=user.tenant, status='in_progress')
                    serializer = BookingListSerializer(queryset, many=True)
                    return Response(serializer.data)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error getting in-progress bookings: {e}", exc_info=True)
                return Response([], status=status.HTTP_200_OK)
        
        return Response([], status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def completed(self, request):
        """Get completed bookings"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    queryset = Booking.objects.filter(tenant=user.tenant, status='completed')
                    serializer = BookingListSerializer(queryset, many=True)
                    return Response(serializer.data)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error getting completed bookings: {e}", exc_info=True)
                return Response([], status=status.HTTP_200_OK)
        
        return Response([], status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's bookings"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    today = timezone.now().date()
                    queryset = Booking.objects.filter(
                        tenant=user.tenant,
                        pickup_datetime__date=today
                    )
                    serializer = BookingListSerializer(queryset, many=True)
                    return Response(serializer.data)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error getting today's bookings: {e}", exc_info=True)
                return Response([], status=status.HTTP_200_OK)
        
        return Response([], status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming bookings"""
        from django_tenants.utils import tenant_context
        
        user = request.user
        if hasattr(user, 'tenant') and user.tenant:
            try:
                with tenant_context(user.tenant):
                    now = timezone.now()
                    queryset = Booking.objects.filter(
                        tenant=user.tenant,
                        pickup_datetime__gte=now,
                        status__in=['pending', 'confirmed']
                    ).order_by('pickup_datetime')
                    serializer = BookingListSerializer(queryset, many=True)
                    return Response(serializer.data)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Error getting upcoming bookings: {e}", exc_info=True)
                return Response([], status=status.HTTP_200_OK)
        
        return Response([], status=status.HTTP_200_OK)
