"""
Command to initialize default Firewall rules for security
"""
from django.core.management.base import BaseCommand
from security.models import FirewallRule


class Command(BaseCommand):
    help = 'Initialize default Firewall rules for security protection'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force recreation of default rules even if they exist',
        )

    def handle(self, *args, **options):
        force = options.get('force', False)
        
        if not force and FirewallRule.objects.filter(name__startswith='[Défaut]').exists():
            self.stdout.write(
                self.style.WARNING('Des règles Firewall existent déjà. Utilisez --force pour les recréer.')
            )
            return

        if force:
            # Supprimer les anciennes règles par défaut
            FirewallRule.objects.filter(name__startswith='[Défaut]').delete()
            self.stdout.write(self.style.SUCCESS('Anciennes règles par défaut supprimées.'))

        # Règles firewall par défaut
        default_rules = [
            {
                'name': '[Défaut] Blocage IPs Malveillantes Connues',
                'description': 'Liste d\'IPs connues pour des activités malveillantes (botnets, scanners, etc.)',
                'rule_type': 'ip_blacklist',
                'priority': 5,
                'config': {
                    'ips': [
                        # Exemples d'IPs à bloquer (à adapter selon vos besoins)
                        # '1.2.3.4',
                        # '5.6.7.8',
                    ],
                    'auto_update': True,
                    'source': 'internal',
                }
            },
            {
                'name': '[Défaut] Whitelist IPs Administrateurs',
                'description': 'Liste blanche d\'IPs autorisées pour l\'accès administrateur',
                'rule_type': 'ip_whitelist',
                'priority': 1,
                'config': {
                    'ips': [
                        # Exemples d'IPs à autoriser (à adapter selon vos besoins)
                        # '127.0.0.1',
                        # '::1',
                    ],
                    'apply_to_paths': ['/admin/', '/api/admin/'],
                }
            },
            {
                'name': '[Défaut] Blocage Pays à Risque',
                'description': 'Bloque les connexions depuis certains pays à haut risque',
                'rule_type': 'country_blacklist',
                'priority': 30,
                'config': {
                    'countries': [
                        # Exemples de codes pays (à adapter selon vos besoins)
                        # 'CN', 'RU', 'KP',
                    ],
                    'strict_mode': False,
                }
            },
        ]

        created_count = 0
        for rule_data in default_rules:
            rule, created = FirewallRule.objects.get_or_create(
                name=rule_data['name'],
                defaults={
                    'description': rule_data['description'],
                    'rule_type': rule_data['rule_type'],
                    'priority': rule_data['priority'],
                    'config': rule_data['config'],
                    'status': 'active',
                }
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Règle créée: {rule.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'⚠ Règle existe déjà: {rule.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Initialisation terminée: {created_count} nouvelle(s) règle(s) Firewall créée(s)'
            )
        )

