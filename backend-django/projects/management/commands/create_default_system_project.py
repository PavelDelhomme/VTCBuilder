"""
Management command to create default system project for public pages
"""
from django.core.management.base import BaseCommand
from projects.models import Project


class Command(BaseCommand):
    help = 'Create default system project for public pages'

    def handle(self, *args, **options):
        # Create or get system project
        project, created = Project.objects.get_or_create(
            slug='vtcbuilder-public',
            defaults={
                'name': 'VTCBuilder - Site Public',
                'description': 'Projet système pour les pages publiques de VTCBuilder',
                'is_system_project': True,
                'status': 'active',
            }
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS(f'✅ Projet système créé: {project.name} (ID: {project.id})')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'ℹ️  Projet système existe déjà: {project.name} (ID: {project.id})')
            )

