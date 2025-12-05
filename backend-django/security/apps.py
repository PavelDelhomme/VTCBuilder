from django.apps import AppConfig
from django.core.management import call_command
import logging

logger = logging.getLogger(__name__)


class SecurityConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'security'
    verbose_name = 'Sécurité'

    def ready(self):
        """Initialize default WAF rules if they don't exist"""
        # Utiliser un signal pour éviter l'accès à la DB pendant l'initialisation
        try:
            from django.db.models.signals import post_migrate
            from security.models import WAFRule
            
            def init_default_rules(sender, **kwargs):
                """Initialize default rules after migrations"""
                try:
                    from security.models import FirewallRule
                    
                    # Initialiser les règles WAF
                    if not WAFRule.objects.filter(name__startswith='[Défaut]').exists():
                        logger.info('Initialisation des règles WAF par défaut...')
                        call_command('init_default_waf_rules', verbosity=0)
                        logger.info('Règles WAF par défaut initialisées avec succès')
                    
                    # Initialiser les règles Firewall
                    if not FirewallRule.objects.filter(name__startswith='[Défaut]').exists():
                        logger.info('Initialisation des règles Firewall par défaut...')
                        call_command('init_default_firewall_rules', verbosity=0)
                        logger.info('Règles Firewall par défaut initialisées avec succès')
                except Exception as e:
                    logger.warning(f'Impossible d\'initialiser les règles de sécurité par défaut: {e}')
            
            # Connecter le signal après les migrations
            post_migrate.connect(init_default_rules, sender=self)
        except Exception as e:
            # Ne pas bloquer le démarrage si l'initialisation échoue
            logger.warning(f'Impossible de configurer l\'initialisation des règles WAF: {e}')

