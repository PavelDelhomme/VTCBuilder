"""
Management command to enable all features for system tenants
"""
from django.core.management.base import BaseCommand
from tenants.models import Tenant
from tenants.utils import is_system_tenant, enable_all_features_for_system_tenant


class Command(BaseCommand):
    help = 'Enable all features for system tenants (vtcbuilder-public-website, public schema, reference-tenant)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔧 Activation de toutes les fonctionnalités pour les tenants système...\n'))
        
        # Récupérer tous les tenants système
        system_tenants = Tenant.objects.filter(
            deleted_at__isnull=True
        )
        
        system_tenants_list = [t for t in system_tenants if is_system_tenant(t)]
        
        if not system_tenants_list:
            self.stdout.write(self.style.WARNING('⚠️  Aucun tenant système trouvé'))
            return
        
        total_enabled = 0
        total_skipped = 0
        
        for tenant in system_tenants_list:
            self.stdout.write(f'📦 Traitement du tenant: {tenant.name} (slug: {tenant.slug})')
            
            result = enable_all_features_for_system_tenant(tenant)
            
            if 'error' in result:
                self.stdout.write(self.style.ERROR(f'   ❌ Erreur: {result["error"]}'))
                continue
            
            enabled = result.get('enabled', 0)
            skipped = result.get('skipped', 0)
            features_count = result.get('features_count', 0)
            users_count = result.get('users_count', 0)
            
            total_enabled += enabled
            total_skipped += skipped
            
            self.stdout.write(self.style.SUCCESS(
                f'   ✅ {enabled} fonctionnalité(s) activée(s) pour {users_count} utilisateur(s) '
                f'({features_count} fonctionnalités disponibles, {skipped} déjà activées)'
            ))
        
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(f'✅ Total: {total_enabled} fonctionnalité(s) activée(s), {total_skipped} déjà activée(s)'))
        self.stdout.write('')
        self.stdout.write('💡 Les tenants système ont maintenant accès à toutes les fonctionnalités')

