"""
Management command to create default projects for existing tenants
"""
from django.core.management.base import BaseCommand
from tenants.models import Tenant
from projects.models import Project
from django.utils.text import slugify


class Command(BaseCommand):
    help = 'Creates a default project for each tenant that does not have one'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔄 Création des projets par défaut pour les tenants...\n'))

        tenants = Tenant.objects.all()
        created_count = 0
        existing_count = 0

        for tenant in tenants:
            project_slug = f"{tenant.slug}-site"
            project_name = f"{tenant.name} - Site Principal"

            # Check if project already exists
            existing_project = Project.objects.filter(slug=project_slug, tenant=tenant).first()
            
            if existing_project:
                self.stdout.write(
                    self.style.WARNING(f'  ℹ️  Projet existe déjà pour {tenant.name}: {existing_project.name}')
                )
                existing_count += 1
            else:
                try:
                    project = Project.objects.create(
                        name=project_name,
                        slug=project_slug,
                        description=f"Projet principal pour {tenant.name}",
                        tenant=tenant,
                        is_system_project=False,
                        status='active'
                    )
                    self.stdout.write(
                        self.style.SUCCESS(f'  ✅ Projet créé pour {tenant.name}: {project.name} (ID: {project.id})')
                    )
                    created_count += 1
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'  ❌ Erreur création projet pour {tenant.name}: {e}')
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Terminé: {created_count} projets créés, {existing_count} projets existants'
            )
        )

