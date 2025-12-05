"""
Management command to cleanup project pages - keep only specified pages
"""
from django.core.management.base import BaseCommand
from projects.models import Project, ProjectPage


class Command(BaseCommand):
    help = 'Retire toutes les pages d\'un projet sauf celles spécifiées'

    def add_arguments(self, parser):
        parser.add_argument(
            'project_id',
            type=int,
            help='ID du projet à nettoyer'
        )
        parser.add_argument(
            '--keep',
            nargs='+',
            default=['home', 'test'],
            help='Slugs des pages à conserver (défaut: home test)'
        )

    def handle(self, *args, **options):
        project_id = options['project_id']
        keep_slugs = set(options['keep'])
        
        try:
            project = Project.objects.get(id=project_id)
            self.stdout.write(f'📁 Projet: {project.name} (ID: {project.id})')
            
            # Récupérer toutes les pages du projet
            all_pages = ProjectPage.objects.filter(project=project)
            total_pages = all_pages.count()
            
            self.stdout.write(f'📄 Total de pages dans le projet: {total_pages}')
            
            # Filtrer les pages à retirer
            pages_to_remove = all_pages.exclude(page_slug__in=keep_slugs)
            pages_to_keep = all_pages.filter(page_slug__in=keep_slugs)
            
            self.stdout.write(f'✅ Pages à conserver: {pages_to_keep.count()}')
            for page in pages_to_keep:
                self.stdout.write(f'   - {page.page_slug} (ID: {page.id})')
            
            self.stdout.write(f'🗑️  Pages à retirer: {pages_to_remove.count()}')
            for page in pages_to_remove:
                self.stdout.write(f'   - {page.page_slug} (ID: {page.id})')
            
            if pages_to_remove.count() > 0:
                # Confirmer
                self.stdout.write(self.style.WARNING('\n⚠️  Voulez-vous vraiment retirer ces pages ?'))
                confirm = input('Tapez "oui" pour confirmer: ')
                
                if confirm.lower() == 'oui':
                    # Retirer les pages
                    removed_count = 0
                    for page in pages_to_remove:
                        page.delete()
                        removed_count += 1
                        self.stdout.write(self.style.SUCCESS(f'   ✅ Page "{page.page_slug}" retirée'))
                    
                    self.stdout.write(self.style.SUCCESS(f'\n✅ {removed_count} page(s) retirée(s) avec succès !'))
                    self.stdout.write(f'📄 Pages restantes dans le projet: {ProjectPage.objects.filter(project=project).count()}')
                else:
                    self.stdout.write(self.style.ERROR('❌ Opération annulée'))
            else:
                self.stdout.write(self.style.SUCCESS('\n✅ Aucune page à retirer. Le projet contient déjà uniquement les pages souhaitées.'))
                
        except Project.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'❌ Projet avec ID {project_id} non trouvé'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Erreur: {str(e)}'))

