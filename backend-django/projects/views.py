"""
Views for Project management
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.views import APIView
from django.db.models import Q
from django.utils import timezone
from .models import Project, ProjectPage
from .serializers import ProjectSerializer, ProjectDetailSerializer, ProjectPageSerializer
from api.utils import add_cors_headers, is_super_admin_from_token
from api.mixins import CORSMixin


class IsAuthenticatedOrOptions(BasePermission):
    """
    Permission class that allows OPTIONS requests without authentication
    but requires authentication for all other methods.
    Also allows super admins even if DRF authentication is not complete.
    """
    def has_permission(self, request, view):
        import logging
        from api.utils import get_authenticated_user_from_token, is_super_admin_from_token
        logger = logging.getLogger(__name__)
        
        # Log pour debug - AVANT toute vérification
        action_name = getattr(view, 'action', None)
        logger.info(
            f"IsAuthenticatedOrOptions.has_permission called: method={request.method}, "
            f"path={request.path}, action={action_name}, "
            f"view_class={view.__class__.__name__ if view else 'None'}"
        )
        
        # Allow OPTIONS requests without authentication (for CORS preflight)
        if request.method == 'OPTIONS':
            logger.info(f"IsAuthenticatedOrOptions: Allowing OPTIONS request for {request.path}")
            return True
        
        # For all other methods, require authentication
        user = request.user
        is_authenticated = user and user.is_authenticated
        
        # Si DRF n'a pas authentifié, essayer le token JWT directement
        if not is_authenticated:
            user_from_token, auth_error = get_authenticated_user_from_token(request)
            if user_from_token and not auth_error:
                # Vérifier si c'est un super admin
                is_super_admin = is_super_admin_from_token(request)
                if is_super_admin:
                    logger.info(
                        f"IsAuthenticatedOrOptions: Permission granted for super admin (from token) for {request.method} {request.path}. "
                        f"User: {user_from_token.email if hasattr(user_from_token, 'email') else 'unknown'}, "
                        f"action={action_name}"
                    )
                    return True
        
        # Log détaillé pour debug
        if not is_authenticated:
            logger.warning(
                f"IsAuthenticatedOrOptions: Permission denied for {request.method} {request.path}. "
                f"User: {user}, is_authenticated: {is_authenticated}, "
                f"action={action_name}"
            )
        else:
            logger.info(
                f"IsAuthenticatedOrOptions: Permission granted for {request.method} {request.path}. "
                f"User: {user.email if hasattr(user, 'email') else 'unknown'} (ID: {user.id if hasattr(user, 'id') else 'unknown'}), "
                f"action={action_name}"
            )
        
        return is_authenticated


class PageProjectsView(APIView):
    """
    Vue APIView séparée pour l'endpoint page-projects
    Permet un meilleur contrôle des permissions et contourne les problèmes de routing DRF
    """
    permission_classes = [IsAuthenticatedOrOptions]
    
    def dispatch(self, request, *args, **kwargs):
        """Override dispatch to add logging"""
        import logging
        logger = logging.getLogger(__name__)
        logger.info(
            f"PageProjectsView.dispatch: {request.method} {request.path}. "
            f"User: {request.user.email if request.user and hasattr(request.user, 'email') else 'anonymous'}, "
            f"is_authenticated: {request.user.is_authenticated if request.user else False}"
        )
        return super().dispatch(request, *args, **kwargs)
    
    def get(self, request):
        """Get all projects where a page is linked"""
        import logging
        import urllib.parse
        logger = logging.getLogger(__name__)
        
        # Vérifier l'authentification depuis le token JWT uniquement
        from api.utils import get_authenticated_user_from_token
        user, auth_error = get_authenticated_user_from_token(request)
        
        if not user or auth_error:
            logger.warning(
                f"Unauthorized access to page_projects from {request.META.get('REMOTE_ADDR', 'unknown')}. "
                f"Error: {auth_error}, "
                f"auth_header={'present' if 'Authorization' in request.headers else 'missing'}"
            )
            response = Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
            add_cors_headers(response, request)
            return response
        
        # Vérifier le statut super admin depuis le token JWT uniquement
        is_super_admin = is_super_admin_from_token(request)
        is_superuser = hasattr(user, 'is_superuser') and user.is_superuser
        
        user_email = user.email if hasattr(user, 'email') else 'no-email'
        user_id = user.id if hasattr(user, 'id') else 'no-id'
        
        logger.info(
            f"PageProjectsView.get called: user={user_email} (ID: {user_id}), "
            f"is_superuser={is_superuser}, "
            f"is_super_admin={is_super_admin} (verified from JWT token), "
            f"path={request.path}"
        )
        
        try:
            # Get page_slug from query params (supports slashes like "legal/terms")
            page_slug = request.query_params.get('page_slug')
            page_type = request.query_params.get('page_type', 'public')
            
            if not page_slug:
                response = Response(
                    {'error': 'page_slug query parameter is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                add_cors_headers(response, request)
                return response
            
            # Decode the page_slug if it's URL encoded
            page_slug = urllib.parse.unquote(page_slug)
            
            # Vérifier les permissions selon le type de page
            # Les pages publiques sont accessibles UNIQUEMENT par les super admins
            # Vérification sécurisée depuis le token JWT uniquement
            if page_type == 'public':
                if not is_super_admin:
                    logger.warning(
                        f"Forbidden: Non-super-admin user {user_email} (ID: {user_id}) attempted to access public page '{page_slug}'"
                    )
                    response = Response(
                        {'error': 'Seuls les super administrateurs peuvent accéder aux pages publiques'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                    add_cors_headers(response, request)
                    return response
                logger.info(
                    f"Super admin {user_email} accessing public page '{page_slug}' (verified from JWT token)"
                )
            
            # Pour les pages tenant, vérifier que l'utilisateur appartient au tenant
            elif page_type == 'tenant':
                user_tenant = getattr(user, 'tenant', None)
                if not user_tenant:
                    logger.warning(
                        f"Forbidden: User {user_email} (ID: {user_id}) has no tenant but attempted to access tenant page '{page_slug}'"
                    )
                    response = Response(
                        {'error': 'Vous devez appartenir à un tenant pour accéder aux pages tenant'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                    add_cors_headers(response, request)
                    return response
                logger.info(
                    f"Tenant user {user_email} (tenant: {user_tenant.name}) accessing tenant page '{page_slug}'"
                )
            
            # Get all projects where this page is linked
            project_pages = ProjectPage.objects.filter(
                page_slug=page_slug,
                page_type=page_type
            ).select_related('project')
            
            # Pour les pages tenant, filtrer uniquement les projets du tenant de l'utilisateur
            if page_type == 'tenant':
                user_tenant = getattr(request.user, 'tenant', None)
                if user_tenant:
                    project_pages = project_pages.filter(project__tenant=user_tenant)
                else:
                    # Si l'utilisateur n'a pas de tenant, retourner une liste vide
                    project_pages = ProjectPage.objects.none()
            
            projects = [
                {
                    'id': pp.project.id,
                    'name': pp.project.name,
                    'slug': pp.project.slug,
                }
                for pp in project_pages
            ]
            
            response = Response({
                'page_slug': page_slug,
                'page_type': page_type,
                'projects': projects,
                'count': len(projects)
            }, status=status.HTTP_200_OK)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            logger.error(f"Error in PageProjectsView.get: {e}", exc_info=True)
            response = Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            add_cors_headers(response, request)
            return response
    
    def options(self, request):
        """Handle OPTIONS request for CORS preflight"""
        response = Response({}, status=status.HTTP_200_OK)
        add_cors_headers(response, request)
        return response


class ProjectViewSet(CORSMixin, viewsets.ModelViewSet):
    """
    ViewSet for managing projects
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticatedOrOptions]  # Allow OPTIONS without auth
    
    def get_permissions(self):
        """
        Override to ensure permissions are correctly applied for custom actions
        """
        import logging
        logger = logging.getLogger(__name__)
        
        # Get the action name if available
        action = getattr(self, 'action', None)
        
        # Check if this is a page-projects request by examining the path
        if not action and hasattr(self, 'request'):
            request_path = getattr(self.request, 'path', '')
            if '/page-projects' in request_path or request_path.endswith('/page-projects/'):
                action = 'page_projects'
                self.action = 'page_projects'
                logger.info(f"ProjectViewSet.get_permissions: Detected page_projects action from path {request_path}")
        
        if action == 'page_projects':
            logger.info(f"ProjectViewSet.get_permissions: Using IsAuthenticatedOrOptions for action 'page_projects'")
            return [IsAuthenticatedOrOptions()]
        
        # For other actions, use default permissions
        return super().get_permissions()
    
    def dispatch(self, request, *args, **kwargs):
        """Handle OPTIONS requests for CORS preflight before authentication check"""
        import logging
        logger = logging.getLogger(__name__)
        
        # Log TOUTES les requêtes vers page-projects AVANT toute autre chose
        if request.path.endswith('/page-projects/') or '/page-projects' in request.path:
            logger.info(
                f"ProjectViewSet.dispatch: INTERCEPTING {request.method} {request.path}. "
                f"User: {request.user.email if request.user and hasattr(request.user, 'email') else 'anonymous'}, "
                f"is_authenticated: {request.user.is_authenticated if request.user else False}, "
                f"args={args}, kwargs={kwargs}"
            )
        
        # Handle OPTIONS requests for CORS preflight
        if request.method == 'OPTIONS':
            logger.info(f"ProjectViewSet.dispatch: Handling OPTIONS request for {request.path}")
            response = Response({}, status=status.HTTP_200_OK)
            add_cors_headers(response, request)
            return response
        
        logger.info(
            f"ProjectViewSet.dispatch: Calling super().dispatch for {request.method} {request.path}"
        )
        return super().dispatch(request, *args, **kwargs)
    
    def initial(self, request, *args, **kwargs):
        """
        Override initial to handle permissions for page_projects action before DRF checks
        """
        import logging
        logger = logging.getLogger(__name__)
        
        # Check if this is a page-projects request
        if request.path.endswith('/page-projects/') or '/page-projects' in request.path:
            logger.info(
                f"ProjectViewSet.initial: Handling {request.method} {request.path}. "
                f"User: {request.user.email if request.user and hasattr(request.user, 'email') else 'anonymous'}, "
                f"is_authenticated: {request.user.is_authenticated if request.user else False}"
            )
            
            # For OPTIONS, allow without authentication (handled in dispatch, but just in case)
            if request.method == 'OPTIONS':
                logger.info(f"ProjectViewSet.initial: Allowing OPTIONS for {request.path}")
                # Set action manually for OPTIONS
                self.action = 'page_projects'
                return super().initial(request, *args, **kwargs)
            
            # Manually set action for page_projects so get_permissions can use it
            # IMPORTANT: Set this BEFORE calling super().initial() so permissions check uses it
            self.action = 'page_projects'
            logger.info(f"ProjectViewSet.initial: Set action to 'page_projects' for {request.path}")
        
        # Call parent initial which will check permissions
        return super().initial(request, *args, **kwargs)
    
    def check_permissions(self, request):
        """
        Override check_permissions to handle page_projects action correctly
        """
        import logging
        logger = logging.getLogger(__name__)
        
        # Check if this is a page-projects request
        if request.path.endswith('/page-projects/') or '/page-projects' in request.path:
            logger.info(
                f"ProjectViewSet.check_permissions: Checking permissions for {request.method} {request.path}. "
                f"User: {request.user.email if request.user and hasattr(request.user, 'email') else 'anonymous'}, "
                f"is_authenticated: {request.user.is_authenticated if request.user else False}, "
                f"action: {getattr(self, 'action', None)}"
            )
            
            # Manually set action if not already set
            if not hasattr(self, 'action') or self.action is None:
                self.action = 'page_projects'
                logger.info(f"ProjectViewSet.check_permissions: Set action to 'page_projects'")
        
        # Call parent check_permissions which will use get_permissions
        return super().check_permissions(request)
    
    def get_queryset(self):
        """Filter projects based on user"""
        # Vérifier l'authentification depuis le token JWT
        from api.utils import get_authenticated_user_from_token, is_super_admin_from_token
        import logging
        logger = logging.getLogger(__name__)
        
        # Essayer d'abord request.user (DRF peut avoir déjà authentifié)
        user = self.request.user
        if not user or not user.is_authenticated:
            # Si DRF n'a pas authentifié, essayer le token JWT directement
            user, auth_error = get_authenticated_user_from_token(self.request)
            if not user or auth_error:
                logger.warning(f"ProjectViewSet.get_queryset: No authenticated user for {self.request.method} {self.request.path}")
                return Project.objects.none()
        
        # Filtrer les projets non supprimés par défaut
        # (sauf si on demande explicitement les projets supprimés via query param)
        include_deleted = self.request.query_params.get('include_deleted', 'false').lower() == 'true'
        
        base_queryset = Project.objects.filter(is_deleted=False) if not include_deleted else Project.objects.all()
        
        # Optimiser les requêtes avec prefetch_related pour le comptage des pages
        base_queryset = base_queryset.prefetch_related('pages')
        
        # Super admin sees all projects
        # Vérification sécurisée depuis le token JWT uniquement
        is_super_admin = is_super_admin_from_token(self.request)
        logger.info(f"ProjectViewSet.get_queryset: user={user.email if hasattr(user, 'email') else 'unknown'}, is_super_admin={is_super_admin}, method={self.request.method}, path={self.request.path}")
        
        if is_super_admin:
            logger.info(f"ProjectViewSet.get_queryset: Returning all projects for super admin (count: {base_queryset.count()})")
            return base_queryset
        
        # Tenant admin sees only their tenant's projects
        if hasattr(user, 'tenant') and user.tenant:
            filtered = base_queryset.filter(tenant=user.tenant)
            logger.info(f"ProjectViewSet.get_queryset: Returning tenant projects for {user.email} (count: {filtered.count()})")
            return filtered
        
        logger.warning(f"ProjectViewSet.get_queryset: User {user.email if hasattr(user, 'email') else 'unknown'} has no access to projects")
        return Project.objects.none()
    
    def get_serializer_class(self):
        """Use detail serializer for retrieve"""
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectSerializer
    
    def get_object(self):
        """
        Override get_object to support UUID, slug, and ID lookup
        This is called by DRF before retrieve() and other detail actions
        """
        import logging
        logger = logging.getLogger(__name__)
        
        # Récupérer l'identifiant depuis kwargs (peut être 'pk' ou 'id')
        identifier = self.kwargs.get('pk') or self.kwargs.get('id')
        
        if not identifier:
            from rest_framework.exceptions import NotFound
            raise NotFound('Identifiant de projet manquant')
        
        logger.info(f"ProjectViewSet.get_object: Looking for project with identifier: {identifier}")
        
        # Utiliser get_queryset() pour respecter les permissions
        queryset = self.get_queryset()
        queryset = queryset.prefetch_related('pages')
        
        # Essayer de récupérer par UUID d'abord (si c'est un UUID valide)
        try:
            import uuid as uuid_lib
            project_uuid = uuid_lib.UUID(str(identifier))
            instance = queryset.get(uuid=project_uuid)
            self.check_object_permissions(self.request, instance)
            logger.info(f"ProjectViewSet.get_object: Found project by UUID: {instance.id} ({instance.name})")
            return instance
        except (ValueError, Project.DoesNotExist):
            pass
        
        # Si ce n'est pas un UUID valide ou pas trouvé, essayer par ID numérique
        try:
            project_id = int(identifier)
            instance = queryset.get(pk=project_id)
            self.check_object_permissions(self.request, instance)
            logger.info(f"ProjectViewSet.get_object: Found project by ID: {instance.id} ({instance.name})")
            return instance
        except (ValueError, Project.DoesNotExist):
            pass
        
        # Essayer par slug
        try:
            instance = queryset.get(slug=identifier)
            self.check_object_permissions(self.request, instance)
            logger.info(f"ProjectViewSet.get_object: Found project by slug: {instance.id} ({instance.name})")
            return instance
        except Project.DoesNotExist:
            logger.warning(f"ProjectViewSet.get_object: Project not found with identifier: {identifier}")
            from rest_framework.exceptions import NotFound
            raise NotFound('Projet introuvable')
    
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
        from api.utils import get_authenticated_user_from_token, is_super_admin_from_token
        user = request.user
        
        if not user or not user.is_authenticated:
            # Essayer aussi le token JWT directement
            user, auth_error = get_authenticated_user_from_token(request)
            if not user or auth_error:
                logger.warning(f"ProjectViewSet.list: No authenticated user for {request.path}")
                response = Response(
                    {'error': 'Authentication required'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
                add_cors_headers(response, request)
                return response
        
        # Vérifier le statut super admin
        is_super_admin = is_super_admin_from_token(request) or (hasattr(user, 'is_superuser') and user.is_superuser)
        logger.info(f"ProjectViewSet.list: user={user.email if hasattr(user, 'email') else 'unknown'}, is_super_admin={is_super_admin}, is_superuser={getattr(user, 'is_superuser', False)}")
        
        try:
            # Utiliser get_queryset() pour respecter les permissions
            queryset = self.get_queryset()
            queryset_count = queryset.count()
            logger.info(f"ProjectViewSet.list: Queryset count: {queryset_count}")
            
            # Si le queryset est vide mais que l'utilisateur est super admin, forcer le chargement
            if queryset_count == 0 and is_super_admin:
                logger.warning(f"ProjectViewSet.list: Queryset vide pour super admin, forcer le chargement de tous les projets")
                include_deleted = request.query_params.get('include_deleted', 'false').lower() == 'true'
                base_queryset = Project.objects.filter(is_deleted=False) if not include_deleted else Project.objects.all()
                base_queryset = base_queryset.prefetch_related('pages')
                queryset = base_queryset
                logger.info(f"ProjectViewSet.list: Nouveau queryset count: {queryset.count()}")
            
            # Paginer si nécessaire
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
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            response = Response(serializer.data)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f'Error retrieving project: {str(e)}', exc_info=True)
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
        """Soft delete project (move to trash)"""
        try:
            project = self.get_object()
            from django.utils import timezone
            
            # Soft delete: marquer comme supprimé au lieu de supprimer définitivement
            project.is_deleted = True
            project.deleted_at = timezone.now()
            project.save()
            
            response = Response(
                {'message': 'Projet déplacé dans la corbeille'},
                status=status.HTTP_200_OK
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
    
    @action(detail=True, methods=['post'])
    def add_page(self, request, pk=None):
        """Add a page to the project"""
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            project = self.get_object()
            page_slug = request.data.get('page_slug')
            page_type = request.data.get('page_type', 'public')
            order = request.data.get('order', 0)
            
            logger.info(f"ProjectViewSet.add_page: Adding page '{page_slug}' (type: {page_type}, order: {order}) to project {project.id} ({project.name})")
            
            if not page_slug:
                response = Response(
                    {'error': 'page_slug is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                add_cors_headers(response, request)
                return response
            
            # Vérifier si la page est déjà dans ce projet
            existing_page_in_project = ProjectPage.objects.filter(
                project=project,
                page_slug=page_slug,
                page_type=page_type
            ).first()
            
            if existing_page_in_project:
                # Mettre à jour l'ordre si nécessaire
                if existing_page_in_project.order != order:
                    existing_page_in_project.order = order
                    existing_page_in_project.save()
                    logger.info(f"ProjectViewSet.add_page: Updated order for existing page '{page_slug}' to {order}")
                else:
                    logger.info(f"ProjectViewSet.add_page: Page '{page_slug}' already in project (order: {existing_page_in_project.order})")
                
                serializer = ProjectPageSerializer(existing_page_in_project)
                response = Response(serializer.data, status=status.HTTP_200_OK)
                add_cors_headers(response, request)
                return response
            
            # Créer la nouvelle page
            page = ProjectPage.objects.create(
                project=project,
                page_slug=page_slug,
                page_type=page_type,
                order=order
            )
            
            logger.info(f"ProjectViewSet.add_page: Successfully created ProjectPage for '{page_slug}' in project {project.id}")
            
            serializer = ProjectPageSerializer(page)
            response = Response(serializer.data, status=status.HTTP_201_CREATED)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            logger.error(f"ProjectViewSet.add_page: Error adding page: {str(e)}", exc_info=True)
            response = Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            add_cors_headers(response, request)
            return response
    
    @action(detail=False, methods=['get', 'options'], url_path='page-projects', permission_classes=[IsAuthenticatedOrOptions])
    def page_projects(self, request):
        """Get all projects where a page is linked"""
        import logging
        logger = logging.getLogger(__name__)
        
        # Handle OPTIONS request for CORS preflight FIRST
        if request.method == 'OPTIONS':
            response = Response({}, status=status.HTTP_200_OK)
            add_cors_headers(response, request)
            return response
        
        # Log détaillé pour debug AVANT la vérification d'authentification
        user_email = 'anonymous'
        user_id = 'unknown'
        is_authenticated = False
        is_superuser = False
        is_super_admin = False
        
        # Vérifier l'authentification depuis le token JWT uniquement
        from api.utils import get_authenticated_user_from_token
        user, auth_error = get_authenticated_user_from_token(request)
        
        if not user or auth_error:
            logger.warning(
                f"Unauthorized access to page_projects from {request.META.get('REMOTE_ADDR', 'unknown')}. "
                f"Error: {auth_error}, "
                f"auth_header={'present' if 'Authorization' in request.headers else 'missing'}"
            )
            response = Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
            add_cors_headers(response, request)
            return response
        
        # Vérifier le statut super admin depuis le token JWT uniquement
        is_super_admin = is_super_admin_from_token(request)
        is_superuser = hasattr(user, 'is_superuser') and user.is_superuser
        
        user_email = user.email if hasattr(user, 'email') else 'no-email'
        user_id = user.id if hasattr(user, 'id') else 'no-id'
        
        logger.info(
            f"page_projects called: method={request.method}, "
            f"user={user_email} (ID: {user_id}), "
            f"is_superuser={is_superuser}, "
            f"is_super_admin={is_super_admin} (verified from JWT token), "
            f"path={request.path}"
        )
        
        try:
            # Get page_slug from query params (supports slashes like "legal/terms")
            page_slug = request.query_params.get('page_slug')
            page_type = request.query_params.get('page_type', 'public')
            
            if not page_slug:
                response = Response(
                    {'error': 'page_slug query parameter is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                add_cors_headers(response, request)
                return response
            
            # Decode the page_slug if it's URL encoded
            import urllib.parse
            page_slug = urllib.parse.unquote(page_slug)
            
            # Vérifier les permissions selon le type de page
            # Les pages publiques sont accessibles UNIQUEMENT par les super admins
            # Vérification sécurisée depuis le token JWT uniquement
            if page_type == 'public':
                if not is_super_admin:
                    logger.warning(
                        f"Forbidden: Non-super-admin user {user_email} (ID: {user_id}) attempted to access public page '{page_slug}'"
                    )
                    response = Response(
                        {'error': 'Seuls les super administrateurs peuvent accéder aux pages publiques'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                    add_cors_headers(response, request)
                    return response
                logger.info(
                    f"Super admin {user_email} accessing public page '{page_slug}' (verified from JWT token)"
                )
            
            # Pour les pages tenant, vérifier que l'utilisateur appartient au tenant
            # (Cette vérification sera faite lors du filtrage des projets)
            elif page_type == 'tenant':
                user_tenant = getattr(user, 'tenant', None)
                if not user_tenant:
                    logger.warning(
                        f"Forbidden: User {user_email} (ID: {user_id}) has no tenant but attempted to access tenant page '{page_slug}'"
                    )
                    response = Response(
                        {'error': 'Vous devez appartenir à un tenant pour accéder aux pages tenant'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                    add_cors_headers(response, request)
                    return response
                logger.info(
                    f"Tenant user {user_email} (tenant: {user_tenant.name}) accessing tenant page '{page_slug}'"
                )
            
            # Get all projects where this page is linked
            project_pages = ProjectPage.objects.filter(
                page_slug=page_slug,
                page_type=page_type
            ).select_related('project')
            
            # Pour les pages tenant, filtrer uniquement les projets du tenant de l'utilisateur
            if page_type == 'tenant':
                user_tenant = getattr(request.user, 'tenant', None)
                if user_tenant:
                    project_pages = project_pages.filter(project__tenant=user_tenant)
                else:
                    # Si l'utilisateur n'a pas de tenant, retourner une liste vide
                    project_pages = ProjectPage.objects.none()
            
            projects = [
                {
                    'id': pp.project.id,
                    'name': pp.project.name,
                    'slug': pp.project.slug,
                }
                for pp in project_pages
            ]
            
            response = Response({
                'page_slug': page_slug,
                'page_type': page_type,
                'projects': projects,
                'count': len(projects)
            }, status=status.HTTP_200_OK)
            add_cors_headers(response, request)
            return response
        except Exception as e:
            logger.error(f"Error in page_projects: {e}", exc_info=True)
            response = Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            add_cors_headers(response, request)
            return response
    
    @action(detail=True, methods=['delete', 'post'], url_path='remove_page/(?P<page_id>[0-9]+)')
    def remove_page(self, request, pk=None, page_id=None):
        """Remove a page from the project"""
        try:
            project = self.get_object()
            # Support page_id from URL path, query params, or body
            if not page_id:
                page_id = request.query_params.get('page_id') or request.data.get('page_id')
            
            if not page_id:
                response = Response(
                    {'error': 'page_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                add_cors_headers(response, request)
                return response
            
            try:
                page_id = int(page_id)
            except (ValueError, TypeError):
                response = Response(
                    {'error': 'page_id must be a valid integer'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                add_cors_headers(response, request)
                return response
            
            try:
                page = ProjectPage.objects.get(id=page_id, project=project)
                page.delete()
                
                response = Response(status=status.HTTP_204_NO_CONTENT)
                add_cors_headers(response, request)
                return response
            except ProjectPage.DoesNotExist:
                # La page n'existe pas ou n'est pas dans ce projet
                # Retourner 204 quand même pour éviter les erreurs si la page a déjà été supprimée
                response = Response(
                    {'message': 'Page déjà supprimée ou introuvable'},
                    status=status.HTTP_204_NO_CONTENT
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

