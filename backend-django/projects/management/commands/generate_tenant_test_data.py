"""
Management command to generate test projects and pages for tenants based on their subscription plan
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django_tenants.utils import tenant_context, schema_context
from tenants.models import Tenant
from billing.models import Subscription, PricingPlan
from projects.models import Project, ProjectPage
from pages.models import Page
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Generate test projects and pages for tenants based on their subscription plan'

    def add_arguments(self, parser):
        parser.add_argument(
            '--tenant-slug',
            type=str,
            help='Generate data for a specific tenant slug (optional)',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force regeneration even if pages already exist',
        )

    def handle(self, *args, **options):
        tenant_slug = options.get('tenant_slug')
        force = options.get('force', False)

        # Get tenants to process
        if tenant_slug:
            tenants = Tenant.objects.filter(slug=tenant_slug)
            if not tenants.exists():
                self.stdout.write(self.style.ERROR(f'❌ Tenant "{tenant_slug}" not found'))
                return
        else:
            # Get all test tenants
            tenants = Tenant.objects.filter(
                slug__in=['test-starter', 'test-business', 'test-entreprise', 'demo-vtc']
            )

        self.stdout.write(self.style.SUCCESS('🚀 Génération des projets et pages de test...\n'))

        for tenant in tenants:
            self.stdout.write(f'\n📦 Traitement du tenant: {tenant.name} ({tenant.slug})')
            
            # Get subscription plan
            try:
                subscription = Subscription.objects.filter(tenant=tenant).first()
                if not subscription:
                    self.stdout.write(self.style.WARNING(f'  ⚠️  Pas d\'abonnement trouvé pour {tenant.slug}'))
                    # Use starter plan as default
                    plan = PricingPlan.objects.filter(slug='starter').first()
                    if not plan:
                        self.stdout.write(self.style.ERROR(f'  ❌ Plan "starter" non trouvé. Exécutez d\'abord: python manage.py init_pricing_plans'))
                        continue
                else:
                    plan = subscription.plan
                    self.stdout.write(f'  📋 Plan: {plan.name} (max_sites: {plan.max_sites}, max_users: {plan.max_users})')
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  ❌ Erreur lors de la récupération du plan: {e}'))
                continue

            # Define page limits based on plan
            page_limits = {
                'starter': 5,  # 5 pages max pour Starter
                'business': 15,  # 15 pages max pour Business
                'enterprise': 999,  # Illimité pour Enterprise
            }
            max_pages = page_limits.get(plan.slug, 5)

            # Get or create default project (in public schema)
            try:
                # Projects are stored in public schema
                with schema_context('public'):
                    project = Project.objects.filter(tenant=tenant, slug__endswith='-site').first()
                    if not project:
                        project_slug = f"{tenant.slug}-site"
                        project_name = f"{tenant.name} - Site Principal"
                        project = Project.objects.create(
                            name=project_name,
                            slug=project_slug,
                            description=f"Projet principal pour {tenant.name}",
                            tenant=tenant,
                            is_system_project=False,
                            status='active'
                        )
                        self.stdout.write(self.style.SUCCESS(f'  ✅ Projet créé: {project.name}'))
                    else:
                        self.stdout.write(f'  ℹ️  Projet existant: {project.name}')
                    
                    # Define pages to create based on plan
                    pages_to_create = self._get_pages_for_plan(plan.slug, max_pages)
                    
                    # Create pages in tenant schema
                    with tenant_context(tenant):
                        # Create pages
                        created_count = 0
                        updated_count = 0
                        
                        for page_data in pages_to_create:
                            page, created = Page.objects.update_or_create(
                                tenant=tenant,
                                slug=page_data['slug'],
                                defaults={
                                    'title': page_data['title'],
                                    'blocks': page_data['blocks'],
                                    'meta_title': page_data.get('meta_title', page_data['title']),
                                    'meta_description': page_data.get('meta_description', ''),
                                    'status': 'published',
                                    'order': page_data.get('order', 0),
                                    'is_homepage': page_data.get('is_homepage', False),
                                }
                            )
                            
                            if created:
                                created_count += 1
                                self.stdout.write(self.style.SUCCESS(f'    ✅ Page créée: {page.title}'))
                            elif force:
                                updated_count += 1
                                self.stdout.write(f'    🔄 Page mise à jour: {page.title}')
                            
                            # Link page to project (back to public schema)
                            # Use tenant_id:page_id format for unique identification
                            with schema_context('public'):
                                page_reference = f"{tenant.id}:{page.id}"  # Format: tenant_id:page_id
                                project_page, pp_created = ProjectPage.objects.update_or_create(
                                    project=project,
                                    page_slug=page_reference,  # Use tenant_id:page_id for tenant pages
                                    page_type='tenant',
                                    defaults={
                                        'order': page_data.get('order', 0),
                                        'is_active': True,
                                    }
                                )
                        
                        self.stdout.write(self.style.SUCCESS(f'\n  ✅ {created_count} page(s) créée(s), {updated_count} page(s) mise(s) à jour'))
                        
                        # Count pages in project (in public schema)
                        with schema_context('public'):
                            self.stdout.write(f'  📊 Total pages dans le projet: {project.pages.count()}')
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  ❌ Erreur pour {tenant.slug}: {e}'))
                logger.error(f"Error generating test data for tenant {tenant.slug}: {e}", exc_info=True)
                continue

        self.stdout.write(self.style.SUCCESS('\n✅ Génération terminée !'))

    def _get_pages_for_plan(self, plan_slug: str, max_pages: int):
        """Get list of pages to create based on plan"""
        now = int(timezone.now().timestamp() * 1000)
        
        # Base pages for all plans
        base_pages = [
            {
                'slug': 'accueil',
                'title': 'Accueil',
                'order': 0,
                'is_homepage': True,
                'meta_title': 'Accueil',
                'meta_description': 'Page d\'accueil',
                'blocks': [
                    {
                        'id': f'block-{now}-1',
                        'type': 'hero',
                        'data': {
                            'title': 'Bienvenue sur votre site VTC',
                            'subtitle': 'Votre service de transport professionnel',
                            'primary_button_text': 'Réserver',
                            'primary_button_link': '/reservation',
                            'background_type': 'gradient',
                            'background_gradient': 'from-blue-500 to-purple-600',
                        },
                        'styles': {
                            'padding_top': '5rem',
                            'padding_bottom': '5rem',
                            'text_align': 'center',
                        },
                        'layout': 12,
                    },
                    {
                        'id': f'block-{now}-2',
                        'type': 'heading',
                        'data': {
                            'text': 'Nos Services',
                            'level': 'h2',
                            'align': 'center',
                        },
                        'styles': {
                            'margin_top': '3rem',
                            'margin_bottom': '2rem',
                        },
                        'layout': 12,
                    },
                    {
                        'id': f'block-{now}-3',
                        'type': 'text',
                        'data': {
                            'content': '<p>Découvrez nos services de transport professionnel adaptés à vos besoins.</p>',
                        },
                        'styles': {
                            'margin_bottom': '2rem',
                        },
                        'layout': 12,
                    },
                ],
            },
            {
                'slug': 'services',
                'title': 'Nos Services',
                'order': 1,
                'meta_title': 'Nos Services',
                'meta_description': 'Découvrez nos services de transport VTC',
                'blocks': [
                    {
                        'id': f'block-{now + 1000}-1',
                        'type': 'heading',
                        'data': {
                            'text': 'Nos Services',
                            'level': 'h1',
                            'align': 'center',
                        },
                        'styles': {
                            'margin_bottom': '2rem',
                        },
                        'layout': 12,
                    },
                    {
                        'id': f'block-{now + 1000}-2',
                        'type': 'text',
                        'data': {
                            'content': '<p>Nous proposons une gamme complète de services de transport professionnel.</p>',
                        },
                        'styles': {
                            'margin_bottom': '2rem',
                        },
                        'layout': 12,
                    },
                ],
            },
            {
                'slug': 'contact',
                'title': 'Contact',
                'order': 2,
                'meta_title': 'Contactez-nous',
                'meta_description': 'Contactez-nous pour toute demande',
                'blocks': [
                    {
                        'id': f'block-{now + 2000}-1',
                        'type': 'heading',
                        'data': {
                            'text': 'Contactez-nous',
                            'level': 'h1',
                            'align': 'center',
                        },
                        'styles': {
                            'margin_bottom': '2rem',
                        },
                        'layout': 12,
                    },
                    {
                        'id': f'block-{now + 2000}-2',
                        'type': 'text',
                        'data': {
                            'content': '<p>Utilisez le formulaire ci-dessous pour nous contacter.</p>',
                        },
                        'styles': {
                            'margin_bottom': '2rem',
                        },
                        'layout': 12,
                    },
                ],
            },
        ]

        # Additional pages based on plan
        if plan_slug == 'starter':
            # Starter: only base pages (3 pages)
            return base_pages[:3]
        
        elif plan_slug == 'business':
            # Business: base pages + additional pages (up to 15)
            additional_pages = [
                {
                    'slug': 'a-propos',
                    'title': 'À propos',
                    'order': 3,
                    'meta_title': 'À propos de nous',
                    'meta_description': 'En savoir plus sur notre entreprise',
                    'blocks': [
                        {
                            'id': f'block-{now + 3000}-1',
                            'type': 'heading',
                            'data': {
                                'text': 'À propos de nous',
                                'level': 'h1',
                                'align': 'center',
                            },
                            'styles': {
                                'margin_bottom': '2rem',
                            },
                            'layout': 12,
                        },
                        {
                            'id': f'block-{now + 3000}-2',
                            'type': 'text',
                            'data': {
                                'content': '<p>Notre histoire et nos valeurs.</p>',
                            },
                            'styles': {
                                'margin_bottom': '2rem',
                            },
                            'layout': 12,
                        },
                    ],
                },
                {
                    'slug': 'tarifs',
                    'title': 'Tarifs',
                    'order': 4,
                    'meta_title': 'Nos Tarifs',
                    'meta_description': 'Découvrez nos tarifs',
                    'blocks': [
                        {
                            'id': f'block-{now + 4000}-1',
                            'type': 'heading',
                            'data': {
                                'text': 'Nos Tarifs',
                                'level': 'h1',
                                'align': 'center',
                            },
                            'styles': {
                                'margin_bottom': '2rem',
                            },
                            'layout': 12,
                        },
                    ],
                },
            ]
            return base_pages + additional_pages
        
        elif plan_slug == 'enterprise':
            # Enterprise: all pages (up to max_pages)
            all_pages = base_pages + [
                {
                    'slug': 'a-propos',
                    'title': 'À propos',
                    'order': 3,
                    'meta_title': 'À propos de nous',
                    'meta_description': 'En savoir plus sur notre entreprise',
                    'blocks': [
                        {
                            'id': f'block-{now + 3000}-1',
                            'type': 'heading',
                            'data': {
                                'text': 'À propos de nous',
                                'level': 'h1',
                                'align': 'center',
                            },
                            'styles': {
                                'margin_bottom': '2rem',
                            },
                            'layout': 12,
                        },
                    ],
                },
                {
                    'slug': 'tarifs',
                    'title': 'Tarifs',
                    'order': 4,
                    'meta_title': 'Nos Tarifs',
                    'meta_description': 'Découvrez nos tarifs',
                    'blocks': [
                        {
                            'id': f'block-{now + 4000}-1',
                            'type': 'heading',
                            'data': {
                                'text': 'Nos Tarifs',
                                'level': 'h1',
                                'align': 'center',
                            },
                            'styles': {
                                'margin_bottom': '2rem',
                            },
                            'layout': 12,
                        },
                    ],
                },
                {
                    'slug': 'flotte',
                    'title': 'Notre Flotte',
                    'order': 5,
                    'meta_title': 'Notre Flotte',
                    'meta_description': 'Découvrez notre flotte de véhicules',
                    'blocks': [
                        {
                            'id': f'block-{now + 5000}-1',
                            'type': 'heading',
                            'data': {
                                'text': 'Notre Flotte',
                                'level': 'h1',
                                'align': 'center',
                            },
                            'styles': {
                                'margin_bottom': '2rem',
                            },
                            'layout': 12,
                        },
                    ],
                },
            ]
            return all_pages[:max_pages]
        
        # Default: return base pages
        return base_pages[:max_pages]

