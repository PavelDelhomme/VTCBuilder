"""
Django management command to migrate all existing tenant schemas
"""
from django.core.management.base import BaseCommand
from django.core.management import call_command
from tenants.models import Tenant
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Migrate all existing tenant schemas'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force migration even if schema is up to date',
        )
        parser.add_argument(
            '--schema',
            type=str,
            help='Migrate only a specific schema',
        )

    def handle(self, *args, **options):
        force = options.get('force', False)
        specific_schema = options.get('schema', None)

        self.stdout.write(self.style.SUCCESS('🔄 Migration des schémas des tenants...\n'))

        if specific_schema:
            # Migrer un schéma spécifique
            tenants = Tenant.objects.filter(schema_name=specific_schema)
        else:
            # Migrer tous les tenants
            tenants = Tenant.objects.all()

        if not tenants.exists():
            self.stdout.write(self.style.WARNING('⚠️  Aucun tenant trouvé'))
            return

        migrated_count = 0
        error_count = 0

        for tenant in tenants:
            try:
                self.stdout.write(f'📦 Migration du schéma: {tenant.schema_name} (Tenant: {tenant.name})')
                
                # Vérifier si le schéma existe, sinon le créer
                from django.db import connection
                with connection.cursor() as cursor:
                    cursor.execute("""
                        SELECT EXISTS(
                            SELECT 1 FROM information_schema.schemata 
                            WHERE schema_name = %s
                        );
                    """, [tenant.schema_name])
                    schema_exists = cursor.fetchone()[0]
                
                if not schema_exists:
                    self.stdout.write(f'   ⚠️  Schéma {tenant.schema_name} n\'existe pas, création...')
                    # Créer le schéma
                    tenant.save()  # Cela devrait créer le schéma si auto_create_schema est True
                    # Ou créer manuellement
                    with connection.cursor() as cursor:
                        cursor.execute(f'CREATE SCHEMA IF NOT EXISTS {tenant.schema_name};')
                    self.stdout.write(f'   ✅ Schéma {tenant.schema_name} créé')
                
                # Migrer le schéma du tenant
                verbosity = options.get('verbosity', 1)
                call_command(
                    'migrate_schemas',
                    schema_name=tenant.schema_name,
                    verbosity=1 if verbosity > 1 else 0,
                    interactive=False,
                )
                
                migrated_count += 1
                self.stdout.write(self.style.SUCCESS(f'   ✅ Schéma {tenant.schema_name} migré'))
                
            except RuntimeError as e:
                # Erreur spécifique de django-tenants (schéma n'existe pas)
                if 'does not exist' in str(e):
                    error_count += 1
                    self.stdout.write(self.style.WARNING(f'   ⚠️  Schéma {tenant.schema_name} n\'existe pas, ignoré'))
                    logger.warning(f'Schéma {tenant.schema_name} n\'existe pas: {e}')
                else:
                    error_count += 1
                    self.stdout.write(self.style.ERROR(f'   ❌ Erreur migration {tenant.schema_name}: {e}'))
                    logger.error(f'Erreur migration schéma {tenant.schema_name}: {e}', exc_info=True)
            except Exception as e:
                error_count += 1
                error_msg = str(e)
                # Ignorer les erreurs de tables/index déjà existants (migration partielle)
                if 'already exists' in error_msg.lower():
                    self.stdout.write(self.style.WARNING(f'   ⚠️  Migration partielle {tenant.schema_name}: {error_msg[:100]}'))
                    logger.warning(f'Migration partielle schéma {tenant.schema_name}: {e}')
                    # Compter quand même comme migré si c'est juste un problème d'index/table existant
                    migrated_count += 1
                else:
                    self.stdout.write(self.style.ERROR(f'   ❌ Erreur migration {tenant.schema_name}: {error_msg[:200]}'))
                    logger.error(f'Erreur migration schéma {tenant.schema_name}: {e}', exc_info=True)

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(f'✅ {migrated_count} schéma(s) migré(s)'))
        if error_count > 0:
            self.stdout.write(self.style.ERROR(f'❌ {error_count} erreur(s)'))
