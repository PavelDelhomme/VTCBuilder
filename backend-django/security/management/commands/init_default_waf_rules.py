"""
Command to initialize default WAF rules for security
"""
from django.core.management.base import BaseCommand
from security.models import WAFRule, SecuritySettings
from django.utils import timezone


class Command(BaseCommand):
    help = 'Initialize default WAF rules for security protection'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force recreation of default rules even if they exist',
        )

    def handle(self, *args, **options):
        force = options.get('force', False)
        
        if not force and WAFRule.objects.exists():
            self.stdout.write(
                self.style.WARNING('Des règles WAF existent déjà. Utilisez --force pour les recréer.')
            )
            return

        if force:
            # Supprimer les anciennes règles par défaut
            WAFRule.objects.filter(name__startswith='[Défaut]').delete()
            self.stdout.write(self.style.SUCCESS('Anciennes règles par défaut supprimées.'))

        # Règles par défaut
        default_rules = [
            {
                'name': '[Défaut] Protection SQL Injection',
                'description': 'Détecte et bloque les tentatives d\'injection SQL communes',
                'rule_type': 'sql_injection',
                'priority': 10,
                'action': 'block',
                'config': {
                    'patterns': [
                        r"(?i)(union\s+select|select\s+.*\s+from|insert\s+into|delete\s+from|update\s+.*\s+set|drop\s+table|exec\s*\(|execute\s*\(|xp_cmdshell)",
                        r"(?i)(or\s+1\s*=\s*1|or\s+'1'\s*=\s*'1'|or\s+\"1\"\s*=\s*\"1\")",
                        r"(?i)(;.*--|;.*#|/\*.*\*/)",
                        r"(?i)(\bor\b\s+\d+\s*=\s*\d+|\band\b\s+\d+\s*=\s*\d+)",
                        r"(?i)(\bunion\b.*\bselect\b|\bselect\b.*\bfrom\b)",
                        r"(?i)(\bexec\b|\bexecute\b|\bxp_\w+)",
                    ],
                    'check_query_params': True,
                    'check_body': True,
                    'check_headers': False,
                }
            },
            {
                'name': '[Défaut] Protection XSS',
                'description': 'Détecte et bloque les tentatives d\'attaque XSS',
                'rule_type': 'xss',
                'priority': 20,
                'action': 'block',
                'config': {
                    'patterns': [
                        r"(?i)(<script[^>]*>.*?</script>)",
                        r"(?i)(javascript:.*)",
                        r"(?i)(on\w+\s*=\s*['\"])",
                        r"(?i)(<iframe[^>]*>|<embed[^>]*>|<object[^>]*>)",
                        r"(?i)(eval\s*\(|expression\s*\()",
                        r"(?i)(vbscript:|data:text/html)",
                    ],
                    'check_query_params': True,
                    'check_body': True,
                    'check_headers': False,
                }
            },
            {
                'name': '[Défaut] Protection Path Traversal',
                'description': 'Bloque les tentatives d\'accès à des fichiers en dehors du répertoire autorisé',
                'rule_type': 'path_traversal',
                'priority': 30,
                'action': 'block',
                'config': {
                    'patterns': [
                        r"(\.\./|\.\.\\|\.\.%2f|\.\.%5c)",
                        r"(/etc/passwd|/etc/shadow|/proc/|/sys/)",
                        r"(c:\\windows|/windows/)",
                    ],
                    'check_query_params': True,
                    'check_body': True,
                    'check_headers': True,
                }
            },
            {
                'name': '[Défaut] Rate Limiting Global',
                'description': 'Limite le nombre de requêtes par IP pour prévenir les attaques DDoS',
                'rule_type': 'rate_limit',
                'priority': 50,
                'action': 'block',
                'config': {
                    'requests_per_minute': 60,
                    'requests_per_hour': 1000,
                    'requests_per_day': 10000,
                    'window_size_seconds': 60,
                }
            },
            {
                'name': '[Défaut] Protection Upload de Fichiers',
                'description': 'Bloque les uploads de fichiers potentiellement dangereux',
                'rule_type': 'file_upload',
                'priority': 40,
                'action': 'block',
                'config': {
                    'blocked_extensions': ['.php', '.phtml', '.php3', '.php4', '.php5', '.phps', '.phar', '.jsp', '.jspx', '.asp', '.aspx', '.sh', '.bat', '.cmd', '.exe', '.dll', '.scr', '.vbs', '.js'],
                    'max_file_size_mb': 10,
                    'allowed_mime_types': ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'],
                }
            },
            {
                'name': '[Défaut] Protection Command Injection',
                'description': 'Détecte et bloque les tentatives d\'injection de commandes système',
                'rule_type': 'custom',
                'priority': 25,
                'action': 'block',
                'config': {
                    'patterns': [
                        r"(?i)(\||\||&|;|\$\(|`|%0a|%0d)",
                        r"(?i)(cmd\.exe|/bin/sh|/bin/bash|powershell)",
                        r"(?i)(wget|curl|nc\s|netcat)",
                    ],
                    'check_query_params': True,
                    'check_body': True,
                    'check_headers': False,
                }
            },
        ]

        created_count = 0
        for rule_data in default_rules:
            rule, created = WAFRule.objects.get_or_create(
                name=rule_data['name'],
                defaults={
                    'description': rule_data['description'],
                    'rule_type': rule_data['rule_type'],
                    'priority': rule_data['priority'],
                    'action': rule_data['action'],
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

        # Initialiser les paramètres de sécurité par défaut
        settings, created = SecuritySettings.objects.get_or_create(
            pk=1,
            defaults={
                'waf_enabled': True,
                'waf_mode': 'blocking',
                'rate_limit_enabled': True,
                'rate_limit_requests_per_minute': 60,
                'rate_limit_requests_per_hour': 1000,
                'ip_reputation_enabled': True,
                'block_known_bad_ips': True,
                'log_all_requests': False,
                'log_retention_days': 30,
                'alert_on_critical': True,
                'alert_on_high': True,
                'alert_on_medium': False,
                'auto_block_after_attempts': 5,
                'auto_block_duration_hours': 24,
            }
        )
        if created:
            self.stdout.write(
                self.style.SUCCESS('✓ Paramètres de sécurité par défaut créés')
            )
        else:
            self.stdout.write(
                self.style.WARNING('⚠ Paramètres de sécurité existent déjà')
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Initialisation terminée: {created_count} nouvelle(s) règle(s) WAF créée(s)'
            )
        )

