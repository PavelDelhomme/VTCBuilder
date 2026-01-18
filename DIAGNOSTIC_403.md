# Diagnostic des erreurs 403 - PATCH /api/system-settings/

## Problème
Les requêtes PATCH vers `/api/system-settings/` retournent 403 même pour les super admins authentifiés, même après refresh token.

## Corrections apportées

### 1. **UserStatusMiddleware corrigé**
- ✅ Les requêtes PATCH vers `/api/system-settings/` ne sont plus traitées comme publiques
- ✅ Seules les requêtes GET sont publiques
- ✅ L'utilisateur est rechargé depuis la DB pour vérifier le rôle à jour
- ✅ Les super admins sont autorisés avant la vérification du statut

### 2. **is_super_admin_from_token() amélioré**
- ✅ Recharge l'utilisateur depuis la DB pour s'assurer que le rôle est à jour
- ✅ Logs détaillés pour diagnostiquer les problèmes
- ✅ Fallback sur `request.user` si l'authentification JWT directe échoue

### 3. **IsSuperAdminOrReadOnly amélioré**
- ✅ Recharge l'utilisateur depuis la DB dans les deux vérifications
- ✅ Logs détaillés pour voir exactement pourquoi ça échoue
- ✅ Vérification du token avant de refuser l'accès

### 4. **WAF optimisé**
- ✅ Désactivé complètement en mode DEBUG pour localhost
- ✅ Utilisateurs authentifiés : limites x5 (300/min, 5000/h)
- ✅ Utilisateurs non authentifiés : limites normales (60/min, 1000/h)

## Diagnostic

### Étape 1: Vérifier le rôle de l'utilisateur
```bash
cd backend-django
python manage.py check_user_role --email admin@vtcbuilder.com
```

Si l'utilisateur n'est pas super admin, le promouvoir :
```bash
python manage.py shell -c "from tenants.models import User; u = User.objects.get(email='admin@vtcbuilder.com'); u.role = 'super-admin'; u.save(); print(f'✅ {u.email} promu super admin')"
```

### Étape 2: Vérifier les logs backend
Les logs backend devraient maintenant montrer :
- `is_super_admin_from_token: user.is_super_admin() = True/False for user ... (role: ...)`
- `IsSuperAdminOrReadOnly: Permission granted/denied for PATCH /api/system-settings/`
- `UserStatusMiddleware: Allowing access for super admin to /api/system-settings/`

### Étape 3: Vérifier le token
Le token JWT devrait contenir l'ID de l'utilisateur. Vérifier dans les logs :
- `is_super_admin_from_token: has_auth_header: True`
- `is_super_admin_from_token: User rechargé depuis la DB: admin@vtcbuilder.com, role: super-admin`

## Causes possibles

1. **L'utilisateur n'a pas le rôle `super-admin` dans la DB**
   - Solution: Utiliser la commande `check_user_role` et promouvoir l'utilisateur

2. **Le token est expiré ou invalide**
   - Solution: Se reconnecter pour obtenir un nouveau token

3. **Problème de cache**
   - Solution: Redémarrer le backend pour vider le cache

4. **Le UserStatusMiddleware bloque avant la permission**
   - Solution: Vérifier les logs pour voir si le middleware autorise le super admin

## Commandes utiles

```bash
# Vérifier le rôle d'un utilisateur
python manage.py check_user_role --email admin@vtcbuilder.com

# Promouvoir un utilisateur en super admin
python manage.py shell -c "from tenants.models import User; u = User.objects.get(email='admin@vtcbuilder.com'); u.role = 'super-admin'; u.save(); print(f'✅ {u.email} promu super admin')"

# Réinitialiser le cache de rate limiting WAF
python manage.py clear_waf_rate_limit --all
```

## Prochaines étapes

1. Redémarrer le backend pour appliquer les modifications
2. Vérifier le rôle de l'utilisateur avec `check_user_role`
3. Consulter les logs backend pour voir exactement où ça bloque
4. Si le problème persiste, vérifier que l'utilisateur a bien le rôle `super-admin` dans la DB

