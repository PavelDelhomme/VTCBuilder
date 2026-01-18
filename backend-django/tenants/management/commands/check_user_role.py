"""
Management command to check user role and diagnose permission issues
"""
from django.core.management.base import BaseCommand
from tenants.models import User


class Command(BaseCommand):
    help = 'Check user role and diagnose permission issues'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email of the user to check',
            default='admin@vtcbuilder.com',
        )

    def handle(self, *args, **options):
        email = options['email']
        
        try:
            user = User.objects.get(email=email)
            self.stdout.write(self.style.SUCCESS(f'\n✅ User trouvé: {user.email}'))
            self.stdout.write(f'   ID: {user.id}')
            self.stdout.write(f'   Role: {user.role}')
            self.stdout.write(f'   Status: {user.status}')
            self.stdout.write(f'   is_super_admin(): {user.is_super_admin()}')
            self.stdout.write(f'   is_authenticated: {user.is_authenticated if hasattr(user, "is_authenticated") else "N/A"}')
            self.stdout.write(f'   Tenant: {user.tenant.name if user.tenant else "None"}')
            
            if not user.is_super_admin():
                self.stdout.write(self.style.WARNING(f'\n⚠️  ATTENTION: L\'utilisateur {email} n\'est PAS super admin!'))
                self.stdout.write(f'   Role actuel: {user.role}')
                self.stdout.write(f'   Pour le promouvoir en super admin, exécutez:')
                self.stdout.write(f'   python manage.py shell -c "from tenants.models import User; u = User.objects.get(email=\'{email}\'); u.role = \'super-admin\'; u.save(); print(f\'✅ {u.email} promu super admin\')"')
            else:
                self.stdout.write(self.style.SUCCESS(f'\n✅ L\'utilisateur {email} est bien super admin'))
                
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'\n❌ Utilisateur {email} non trouvé'))
            self.stdout.write(f'   Pour créer un super admin, exécutez:')
            self.stdout.write(f'   python manage.py createsuperadmin')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n❌ Erreur: {e}'))

