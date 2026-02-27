"""
Tests complets pour tous les endpoints de l'API
Utilise les variables d'environnement pour la configuration
"""
import os
import sys
import django

# Configuration Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vtcbuilder.settings')
django.setup()

# Charger les variables d'environnement avec decouple
try:
    from decouple import config
except ImportError:
    def config(key, default=None):
        return os.getenv(key, default)

import requests
import json
from typing import Dict, List, Optional

BASE_URL = config('TEST_API_URL', default='http://localhost:9495/api')
TEST_EMAIL = config('TEST_EMAIL', default='admin@vtcbuilder.com')
TEST_PASSWORD = config('TEST_PASSWORD', default='admin123')


class ComprehensiveAPITester:
    """Testeur complet pour tous les endpoints de l'API"""
    
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.results = {
            'passed': [],
            'failed': [],
            'skipped': []
        }
        self.endpoints_tested = 0
        self.endpoints_passed = 0
        self.endpoints_failed = 0
    
    def login(self):
        """Se connecter et obtenir le token"""
        try:
            response = self.session.post(
                f'{BASE_URL}/auth/login/',
                json={'email': TEST_EMAIL, 'password': TEST_PASSWORD},
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('token') or data.get('access')
                if self.token:
                    self.session.headers.update({'Authorization': f'Bearer {self.token}'})
                return True
            print(f"❌ Login échoué: {response.status_code} - {response.text[:200]}")
            return False
        except Exception as e:
            print(f"❌ Erreur login: {e}")
            return False
    
    def test_endpoint(self, method: str, endpoint: str, name: str, 
                     data: Optional[Dict] = None, expected_status: int = 200,
                     description: str = "") -> bool:
        """Tester un endpoint"""
        self.endpoints_tested += 1
        try:
            url = f'{BASE_URL}{endpoint}'
            
            # Préparer les paramètres
            params = None
            json_data = None
            if method.upper() == 'GET':
                params = data
            else:
                json_data = data
            
            # Faire la requête
            response = self.session.request(
                method.upper(),
                url,
                json=json_data,
                params=params,
                timeout=10
            )
            
            # Vérifier le statut
            if response.status_code == expected_status:
                self.endpoints_passed += 1
                self.results['passed'].append({
                    'name': name,
                    'endpoint': f"{method} {endpoint}",
                    'status': response.status_code,
                    'description': description
                })
                return True
            else:
                error_msg = f"Status {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg = error_data.get('error', error_data.get('message', error_msg))
                except:
                    error_msg = response.text[:200]
                
                self.endpoints_failed += 1
                self.results['failed'].append({
                    'name': name,
                    'endpoint': f"{method} {endpoint}",
                    'status': response.status_code,
                    'expected': expected_status,
                    'error': error_msg,
                    'description': description
                })
                return False
        except requests.exceptions.Timeout:
            self.endpoints_failed += 1
            self.results['failed'].append({
                'name': name,
                'endpoint': f"{method} {endpoint}",
                'error': 'Timeout',
                'description': description
            })
            return False
        except Exception as e:
            self.endpoints_failed += 1
            self.results['failed'].append({
                'name': name,
                'endpoint': f"{method} {endpoint}",
                'error': str(e),
                'description': description
            })
            return False
    
    def run_all_tests(self):
        """Exécuter tous les tests"""
        print("="*80)
        print("🧪 TESTS COMPLETS DE L'API VTCBuilder")
        print("="*80)
        print(f"\n📡 API URL: {BASE_URL}")
        print(f"📧 Email: {TEST_EMAIL}")
        print(f"🔑 Mot de passe: {'*' * len(TEST_PASSWORD)}")
        print("\n" + "="*80)
        
        # Login
        print("\n🔐 Test: Login")
        if not self.login():
            print("  ❌ Login échoué - Impossible de continuer")
            return
        print(f"  ✅ Login réussi (Token obtenu)")
        
        # Définir tous les endpoints à tester
        endpoints = [
            # Dashboard & Stats
            ('GET', '/dashboard/', 'Dashboard', None, 200, 'Statistiques du dashboard'),
            ('GET', '/stats/detailed/', 'Stats détaillées', None, 200, 'Statistiques détaillées (super admin)'),
            
            # Authentication
            ('GET', '/auth/me/', 'Profil utilisateur', None, 200, 'Récupérer le profil de l\'utilisateur connecté'),
            
            # System Settings
            ('GET', '/system-settings/', 'System Settings', None, 200, 'Paramètres système'),
            
            # Tenants
            ('GET', '/tenants/', 'Liste Tenants', None, 200, 'Liste des tenants'),
            ('GET', '/tenants/features/', 'Features Tenant', None, 200, 'Features disponibles pour le tenant'),
            
            # Users
            ('GET', '/users/', 'Liste Users', None, 200, 'Liste des utilisateurs'),
            ('GET', '/users/impersonation-status/', 'Impersonation Status', None, 200, 'Statut d\'impersonation'),
            
            # Features
            ('GET', '/features/', 'Liste Features', None, 200, 'Liste des fonctionnalités'),
            ('GET', '/features/available/', 'Features Disponibles', None, 200, 'Fonctionnalités disponibles'),
            
            # Pages
            ('GET', '/pages/', 'Liste Pages', None, 200, 'Liste des pages'),
            
            # Services
            ('GET', '/services/', 'Liste Services', None, 200, 'Liste des services'),
            
            # Bookings
            ('GET', '/bookings/', 'Liste Bookings', None, 200, 'Liste des réservations'),
            
            # Media
            ('GET', '/media/', 'Liste Media', None, 200, 'Liste des médias'),
            
            # Templates
            ('GET', '/templates/', 'Liste Templates', None, 200, 'Liste des templates'),
            
            # Blocks
            ('GET', '/blocks/types/', 'Block Types', None, 200, 'Types de blocs disponibles'),
            ('GET', '/blocks/templates/', 'Block Templates', None, 200, 'Templates de blocs'),
            
            # Billing
            ('GET', '/pricing-plans/', 'Pricing Plans', None, 200, 'Plans tarifaires'),
            ('GET', '/subscriptions/', 'Subscriptions', None, 200, 'Abonnements'),
            ('GET', '/invoices/', 'Invoices', None, 200, 'Factures'),
            ('GET', '/payments/', 'Payments', None, 200, 'Paiements'),
            ('GET', '/payment-methods/', 'Payment Methods', None, 200, 'Méthodes de paiement'),
            ('GET', '/billing/stats/', 'Billing Stats', None, 200, 'Statistiques de facturation'),
            ('GET', '/billing/unpaid-items/', 'Unpaid Items', None, 200, 'Éléments impayés'),
            
            # Analytics
            ('POST', '/analytics/block-usage/', 'Block Usage Tracking', {'usages': []}, 200, 'Tracking d\'utilisation des blocs'),
        ]
        
        # Tester chaque endpoint
        print("\n" + "="*80)
        print("📋 TESTS DES ENDPOINTS")
        print("="*80)
        
        for endpoint_data in endpoints:
            method = endpoint_data[0]
            path = endpoint_data[1]
            name = endpoint_data[2]
            data = endpoint_data[3] if len(endpoint_data) > 3 else None
            expected = endpoint_data[4] if len(endpoint_data) > 4 else 200
            description = endpoint_data[5] if len(endpoint_data) > 5 else ""
            
            print(f"\n🔍 Test: {name}")
            if description:
                print(f"   📝 {description}")
            self.test_endpoint(method, path, name, data, expected, description)
        
        # Afficher les résultats
        self.print_results()
    
    def print_results(self):
        """Afficher les résultats des tests"""
        print("\n" + "="*80)
        print("📊 RÉSULTATS DES TESTS")
        print("="*80)
        
        print(f"\n✅ Réussis: {len(self.results['passed'])}/{self.endpoints_tested}")
        if self.results['passed']:
            for test in self.results['passed']:
                print(f"  ✅ {test['name']} ({test['endpoint']}) - {test['status']}")
        
        print(f"\n❌ Échoués: {len(self.results['failed'])}/{self.endpoints_tested}")
        if self.results['failed']:
            for test in self.results['failed']:
                print(f"  ❌ {test['name']} ({test['endpoint']})")
                print(f"     Status: {test.get('status', 'N/A')} (attendu: {test.get('expected', 'N/A')})")
                if 'error' in test:
                    print(f"     Erreur: {test['error'][:200]}")
        
        print(f"\n⏭️  Ignorés: {len(self.results['skipped'])}")
        
        # Résumé
        print("\n" + "="*80)
        print("📈 RÉSUMÉ")
        print("="*80)
        success_rate = (self.endpoints_passed / self.endpoints_tested * 100) if self.endpoints_tested > 0 else 0
        print(f"Total testé: {self.endpoints_tested}")
        print(f"Réussis: {self.endpoints_passed} ({success_rate:.1f}%)")
        print(f"Échoués: {self.endpoints_failed} ({100 - success_rate:.1f}%)")
        
        if self.endpoints_failed == 0:
            print("\n🎉 Tous les tests sont passés !")
        else:
            print(f"\n⚠️  {self.endpoints_failed} test(s) ont échoué")
        
        print("="*80)
        
        # Écrire le rapport JSON si REPORT_FILE est défini (pour exploitation automatique)
        report_file = os.environ.get('REPORT_FILE')
        if report_file:
            report = {
                'summary': {
                    'total': self.endpoints_tested,
                    'passed': self.endpoints_passed,
                    'failed': self.endpoints_failed,
                    'skipped': len(self.results['skipped']),
                    'success_rate_pct': round(self.endpoints_passed / self.endpoints_tested * 100, 1) if self.endpoints_tested else 0,
                },
                'passed': self.results['passed'],
                'failed': self.results['failed'],
                'skipped': self.results['skipped'],
            }
            try:
                with open(report_file, 'w', encoding='utf-8') as f:
                    json.dump(report, f, indent=2, ensure_ascii=False)
            except Exception as e:
                print(f"⚠️  Impossible d'écrire le rapport: {e}")
        
        if self.endpoints_failed > 0:
            sys.exit(1)


if __name__ == '__main__':
    tester = ComprehensiveAPITester()
    tester.run_all_tests()

