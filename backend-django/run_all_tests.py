#!/usr/bin/env python
"""
Script pour exécuter tous les tests du backend et générer un rapport
"""
import subprocess
import sys
import os

def run_tests():
    """Exécute tous les tests et génère un rapport"""
    print("🧪 Exécution de tous les tests du backend...")
    print("=" * 60)
    
    # Liste des modules à tester
    test_modules = [
        'api.tests',
        'blocks.tests',
        'projects.tests',
        'tenants.tests',
        'pages.tests',
        'services.tests',
        'bookings.tests',
        'media.tests',
        'billing.tests',
    ]
    
    results = {}
    total_tests = 0
    total_passed = 0
    total_failed = 0
    
    for module in test_modules:
        print(f"\n📦 Test du module: {module}")
        print("-" * 60)
        
        try:
            result = subprocess.run(
                ['pytest', f'{module}', '-v', '--tb=short'],
                capture_output=True,
                text=True,
                cwd='/app'
            )
            
            # Parser les résultats
            output = result.stdout + result.stderr
            if 'passed' in output:
                passed = int([line for line in output.split('\n') if 'passed' in line][0].split()[0])
                failed = int([line for line in output.split('\n') if 'failed' in line][0].split()[0]) if 'failed' in output else 0
                total_tests += passed + failed
                total_passed += passed
                total_failed += failed
                
                results[module] = {
                    'passed': passed,
                    'failed': failed,
                    'status': '✅' if failed == 0 else '❌'
                }
            else:
                results[module] = {
                    'passed': 0,
                    'failed': 0,
                    'status': '⚠️'
                }
            
            print(f"  {results[module]['status']} {results[module]['passed']} passés, {results[module]['failed']} échoués")
            
        except Exception as e:
            print(f"  ❌ Erreur lors des tests: {e}")
            results[module] = {
                'passed': 0,
                'failed': 0,
                'status': '❌'
            }
    
    # Rapport final
    print("\n" + "=" * 60)
    print("📊 RAPPORT FINAL")
    print("=" * 60)
    
    for module, result in results.items():
        print(f"{result['status']} {module}: {result['passed']} passés, {result['failed']} échoués")
    
    print(f"\n📈 Total: {total_passed} passés, {total_failed} échoués sur {total_tests} tests")
    
    if total_failed == 0:
        print("\n✅ Tous les tests sont passés !")
        return 0
    else:
        print(f"\n❌ {total_failed} test(s) ont échoué")
        return 1


if __name__ == '__main__':
    sys.exit(run_tests())

