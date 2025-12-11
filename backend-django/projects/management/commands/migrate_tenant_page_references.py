"""
Management command to migrate tenant page references from old format (page_id) to new format (tenant_id:page_id)
"""
from django.core.management.base import BaseCommand
from projects.models import Project, ProjectPage
from tenants.models import Tenant


class Command(BaseCommand):
    help = 'Migrate tenant page references from old format (page_id) to new format (tenant_id:page_id)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simulate the migration without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        
        self.stdout.write(self.style.SUCCESS('🔄 Migration des références de pages tenant...\n'))
        
        if dry_run:
            self.stdout.write(self.style.WARNING('⚠️  MODE DRY-RUN : Aucune modification ne sera effectuée\n'))
        
        # Get all tenant projects (non-system projects with a tenant)
        tenant_projects = Project.objects.filter(
            is_system_project=False,
            tenant__isnull=False
        )
        
        migrated_count = 0
        skipped_count = 0
        error_count = 0
        
        for project in tenant_projects:
            self.stdout.write(f'\n📦 Projet: {project.name} (Tenant: {project.tenant.name})')
            
            # Get all tenant pages for this project
            tenant_pages = ProjectPage.objects.filter(
                project=project,
                page_type='tenant'
            )
            
            for project_page in tenant_pages:
                page_slug = project_page.page_slug
                
                # Check if already in new format (contains ':')
                if ':' in page_slug:
                    self.stdout.write(f'  ✓ Page "{page_slug}" déjà au nouveau format')
                    skipped_count += 1
                    continue
                
                # Old format: just page ID
                try:
                    page_id = int(page_slug)
                    new_reference = f"{project.tenant.id}:{page_id}"
                    
                    if dry_run:
                        self.stdout.write(self.style.WARNING(
                            f'  🔄 "{page_slug}" → "{new_reference}" (DRY-RUN)'
                        ))
                        migrated_count += 1
                    else:
                        # Check if new reference already exists
                        existing = ProjectPage.objects.filter(
                            project=project,
                            page_slug=new_reference,
                            page_type='tenant'
                        ).first()
                        
                        if existing:
                            self.stdout.write(self.style.WARNING(
                                f'  ⚠️  "{new_reference}" existe déjà, suppression de l\'ancienne référence "{page_slug}"'
                            ))
                            project_page.delete()
                        else:
                            project_page.page_slug = new_reference
                            project_page.save(update_fields=['page_slug'])
                            self.stdout.write(self.style.SUCCESS(
                                f'  ✅ "{page_slug}" → "{new_reference}"'
                            ))
                        
                        migrated_count += 1
                except ValueError:
                    self.stdout.write(self.style.ERROR(
                        f'  ❌ Format invalide pour "{page_slug}" (ne peut pas être converti)'
                    ))
                    error_count += 1
        
        self.stdout.write('\n' + '=' * 60)
        if dry_run:
            self.stdout.write(self.style.WARNING(f'DRY-RUN: {migrated_count} référence(s) seraient migrée(s)'))
        else:
            self.stdout.write(self.style.SUCCESS(f'✅ {migrated_count} référence(s) migrée(s)'))
        self.stdout.write(f'⏭️  {skipped_count} référence(s) déjà au nouveau format')
        if error_count > 0:
            self.stdout.write(self.style.ERROR(f'❌ {error_count} erreur(s)'))
        self.stdout.write('=' * 60)

