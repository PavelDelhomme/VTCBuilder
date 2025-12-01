"""
Views for Project management
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Project, ProjectPage
from .serializers import ProjectSerializer, ProjectDetailSerializer, ProjectPageSerializer
from api.utils import add_cors_headers


class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing projects
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter projects based on user"""
        user = self.request.user
        
        # Vérifier que l'utilisateur est authentifié
        if not user or not user.is_authenticated:
            return Project.objects.none()
        
        # Super admin sees all projects
        # Vérifier d'abord is_super_admin (méthode personnalisée)
        if hasattr(user, 'is_super_admin') and callable(user.is_super_admin) and user.is_super_admin():
            return Project.objects.all()
        
        # Vérifier aussi is_superuser (attribut Django standard)
        if hasattr(user, 'is_superuser') and user.is_superuser:
            return Project.objects.all()
        
        # Tenant admin sees only their tenant's projects
        if hasattr(user, 'tenant') and user.tenant:
            return Project.objects.filter(tenant=user.tenant)
        
        return Project.objects.none()
    
    def get_serializer_class(self):
        """Use detail serializer for retrieve"""
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectSerializer
    
    def create(self, request, *args, **kwargs):
        """Create project with CORS"""
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            response = Response(serializer.data, status=status.HTTP_201_CREATED)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            response = Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            add_cors_headers(response, request)
            return response
    
    def list(self, request, *args, **kwargs):
        """List projects with CORS"""
        import logging
        logger = logging.getLogger(__name__)
        
        # Vérifier l'authentification avant de continuer
        if not request.user or not request.user.is_authenticated:
            response = Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
            add_cors_headers(response, request)
            # Ne pas logger comme une erreur, c'est normal pour les requêtes non authentifiées
            return response
        
        try:
            response = super().list(request, *args, **kwargs)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            logger.error(f"Error in ProjectViewSet.list: {e}", exc_info=True)
            response = Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            add_cors_headers(response, request)
            return response
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve project with CORS"""
        try:
            response = super().retrieve(request, *args, **kwargs)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            response = Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            add_cors_headers(response, request)
            return response
    
    def update(self, request, *args, **kwargs):
        """Update project with CORS"""
        try:
            response = super().update(request, *args, **kwargs)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            response = Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            add_cors_headers(response, request)
            return response
    
    def destroy(self, request, *args, **kwargs):
        """Delete project with CORS"""
        try:
            response = super().destroy(request, *args, **kwargs)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            response = Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            add_cors_headers(response, request)
            return response
    
    @action(detail=True, methods=['post'])
    def add_page(self, request, pk=None):
        """Add a page to the project"""
        try:
            project = self.get_object()
            page_slug = request.data.get('page_slug')
            page_type = request.data.get('page_type', 'public')
            order = request.data.get('order', 0)
            
            if not page_slug:
                response = Response(
                    {'error': 'page_slug is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                add_cors_headers(response, request)
                return response
            
            page, created = ProjectPage.objects.get_or_create(
                project=project,
                page_slug=page_slug,
                page_type=page_type,
                defaults={'order': order}
            )
            
            if not created:
                page.order = order
                page.save()
            
            serializer = ProjectPageSerializer(page)
            response = Response(serializer.data, status=status.HTTP_201_CREATED)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            response = Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            add_cors_headers(response, request)
            return response
    
    @action(detail=True, methods=['delete'])
    def remove_page(self, request, pk=None):
        """Remove a page from the project"""
        try:
            project = self.get_object()
            page_id = request.data.get('page_id')
            
            if not page_id:
                response = Response(
                    {'error': 'page_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                add_cors_headers(response, request)
                return response
            
            page = ProjectPage.objects.get(id=page_id, project=project)
            page.delete()
            
            response = Response(status=status.HTTP_204_NO_CONTENT)
            add_cors_headers(response, request)
            return response
        except ProjectPage.DoesNotExist:
            response = Response(
                {'error': 'Page not found'},
                status=status.HTTP_404_NOT_FOUND
            )
            add_cors_headers(response, request)
            return response
        except Exception as e:
            response = Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            add_cors_headers(response, request)
            return response
    
    @action(detail=True, methods=['patch'], url_path='pages/(?P<page_id>[^/.]+)')
    def update_page(self, request, pk=None, page_id=None):
        """Update a page in the project (e.g., toggle is_active)"""
        try:
            project = self.get_object()
            page = ProjectPage.objects.get(id=page_id, project=project)
            
            # Update page fields
            if 'is_active' in request.data:
                page.is_active = request.data['is_active']
            if 'order' in request.data:
                page.order = request.data['order']
            
            page.save()
            
            serializer = ProjectPageSerializer(page)
            response = Response(serializer.data)
            add_cors_headers(response, request)
            return response
        except ProjectPage.DoesNotExist:
            response = Response(
                {'error': 'Page not found'},
                status=status.HTTP_404_NOT_FOUND
            )
            add_cors_headers(response, request)
            return response
        except Exception as e:
            response = Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            add_cors_headers(response, request)
            return response

