# 🧪 Configuration des Tenants de Test

## ✅ Tenants de Test Disponibles

Tous les tenants de test sont maintenant configurés avec leurs domaines et schémas :

| Tenant | Domaine | Email | Mot de passe |
|--------|---------|-------|--------------|
| **Test Enterprise** | `test-enterprise.localhost` | `test-enterprise@vtcbuilder.test` | `test123` |
| **Test Business** | `test-business.localhost` | `test-business@vtcbuilder.test` | `test123` |
| **Test Starter** | `test-starter.localhost` | `test-starter@vtcbuilder.test` | `test123` |
| **Demo VTC** | `demo-vtc.localhost` | `demo@vtcbuilder.com` | `test123` |

## 🔧 Configuration Requise

### 1. Ajouter les domaines dans `/etc/hosts`

Pour accéder aux sous-domaines, ajoutez ces lignes dans `/etc/hosts` :

```bash
sudo nano /etc/hosts
```

Ajoutez :
```
127.0.0.1 test-enterprise.localhost
127.0.0.1 test-business.localhost
127.0.0.1 test-starter.localhost
127.0.0.1 demo-vtc.localhost
```

### 2. Redémarrer les services (si nécessaire)

```bash
cd backend-django
make restart
```

## 🚀 Utilisation

### Accéder à un tenant de test

1. **Test Enterprise** : http://test-enterprise.localhost:9494/login
   - Email: `test-enterprise@vtcbuilder.test`
   - Mot de passe: `test123`

2. **Test Business** : http://test-business.localhost:9494/login
   - Email: `test-business@vtcbuilder.test`
   - Mot de passe: `test123`

3. **Test Starter** : http://test-starter.localhost:9494/login
   - Email: `test-starter@vtcbuilder.test`
   - Mot de passe: `test123`

4. **Demo VTC** : http://demo-vtc.localhost:9494/login
   - Email: `demo@vtcbuilder.com`
   - Mot de passe: `test123`

## 🔄 Recréer les Tenants de Test

Si vous devez recréer les tenants de test :

```bash
cd backend-django
make setup-test-env
python setup_test_tenants.py
```

## 📋 Scripts Disponibles

- `setup_test_tenants.py` : Crée les domaines et migre les schémas
- `make setup-test-env` : Configure l'environnement de test complet (tenants, abonnements, factures)
- `make demo-tenant` : Crée un tenant de démonstration simple

