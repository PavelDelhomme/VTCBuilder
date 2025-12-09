"""
Management command to consolidate duplicate system projects
"""
from django.core.management.base import BaseCommand
from projects.models import Project, ProjectPage
from tenants.models import Tenant


class Command(BaseCommand):
    help = 'Consolidate duplicate system projects into one (vtcbuilder-public-site)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔄 Consolidation des projets système...\n'))
        
        # 1. Récupérer le tenant public
        public_tenant = Tenant.objects.filter(slug='vtcbuilder-public-website').first()
        
        if not public_tenant:
            self.stdout.write(self.style.ERROR('❌ Tenant public (vtcbuilder-public-website) non trouvé!'))
            self.stdout.write(self.style.WARNING('💡 Exécutez d\'abord: python manage.py setup_public_website_tenant'))
            return
        
        # 2. Récupérer le bon projet (celui avec le tenant)
        correct_project = Project.objects.filter(
            slug='vtcbuilder-public-site',
            is_system_project=True
        ).first()
        
        # 3. Récupérer l'ancien projet (sans tenant ou avec slug différent)
        old_project = Project.objects.filter(
            slug='vtcbuilder-public',
            is_system_project=True
        ).first()
        
        if not correct_project:
            self.stdout.write(self.style.ERROR('❌ Projet système correct (vtcbuilder-public-site) non trouvé!'))
            self.stdout.write(self.style.WARNING('💡 Exécutez: python manage.py init_public_website_tenant'))
            return
        
        # S'assurer que le bon projet est lié au bon tenant
        if correct_project.tenant != public_tenant:
            correct_project.tenant = public_tenant
            correct_project.save()
            self.stdout.write(self.style.SUCCESS(f'✅ Projet {correct_project.name} lié au tenant {public_tenant.name}'))
        
        if old_project:
            self.stdout.write(self.style.WARNING(f'\n⚠️  Projet en double trouvé: {old_project.name} (ID: {old_project.id})'))
            self.stdout.write(self.style.WARNING(f'   Slug: {old_project.slug}'))
            self.stdout.write(self.style.WARNING(f'   Tenant: {old_project.tenant or "Aucun"}'))
            
            # Compter les pages dans chaque projet
            old_pages_count = ProjectPage.objects.filter(project=old_project).count()
            correct_pages_count = ProjectPage.objects.filter(project=correct_project).count()
            
            self.stdout.write(self.style.WARNING(f'   Pages dans l\'ancien projet: {old_pages_count}'))
            self.stdout.write(self.style.SUCCESS(f'   Pages dans le bon projet: {correct_pages_count}'))
            
            # Migrer les pages si nécessaire
            if old_pages_count > 0:
                self.stdout.write(self.style.WARNING(f'\n📦 Migration des pages de {old_project.name} vers {correct_project.name}...'))
                migrated = 0
                skipped = 0
                
                old_pages = ProjectPage.objects.filter(project=old_project)
                for old_page in old_pages:
                    # Vérifier si la page existe déjà dans le bon projet
                    existing = ProjectPage.objects.filter(
                        project=correct_project,
                        page_slug=old_page.page_slug,
                        page_type=old_page.page_type
                    ).first()
                    
                    if existing:
                        skipped += 1
                        self.stdout.write(self.style.WARNING(f'  ⏭️  Page {old_page.page_slug} existe déjà, ignorée'))
                    else:
                        # Migrer la page
                        old_page.project = correct_project
                        old_page.save()
                        migrated += 1
                        self.stdout.write(self.style.SUCCESS(f'  ✅ Page {old_page.page_slug} migrée'))
                
                self.stdout.write(self.style.SUCCESS(f'\n✅ Migration terminée: {migrated} page(s) migrée(s), {skipped} ignorée(s)'))
            
            # Archiver l'ancien projet
            old_project.is_deleted = True
            old_project.status = 'archived'
            old_project.save()
            self.stdout.write(self.style.SUCCESS(f'\n✅ Ancien projet {old_project.name} archivé'))
        else:
            self.stdout.write(self.style.SUCCESS('✅ Aucun projet en double trouvé'))
        
        # Afficher le résumé final
        final_pages_count = ProjectPage.objects.filter(project=correct_project).count()
        self.stdout.write(self.style.SUCCESS(f'\n📊 Résumé final:'))
        self.stdout.write(self.style.SUCCESS(f'   Projet: {correct_project.name} (ID: {correct_project.id})'))
        self.stdout.write(self.style.SUCCESS(f'   Slug: {correct_project.slug}'))
        self.stdout.write(self.style.SUCCESS(f'   Tenant: {correct_project.tenant.name if correct_project.tenant else "Aucun"}'))
        self.stdout.write(self.style.SUCCESS(f'   Pages: {final_pages_count}'))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Consolidation terminée!'))

