"""
Utility functions for tenant management
"""
from django_tenants.utils import tenant_context
from tenants.models import Tenant, User, Feature, UserFeature
from billing.models import Subscription


def is_system_tenant(tenant):
    """
    Vérifie si un tenant est un tenant système VTCBuilder.
    Les tenants système ont accès à toutes les fonctionnalités.
    """
    if not tenant:
        return False
    return (
        tenant.slug == 'vtcbuilder-public-website' or
        tenant.slug == 'public' or
        tenant.schema_name == 'public' or
        tenant.slug == 'reference-tenant' or
        getattr(tenant, 'is_system', False)
    )


def enable_all_features_for_system_tenant(tenant):
    """
    Active toutes les fonctionnalités pour un tenant système.
    Les tenants système ont accès à toutes les fonctionnalités sans restriction.
    
    Args:
        tenant: Instance du Tenant (doit être un tenant système)
    
    Returns:
        dict: Statistiques sur les fonctionnalités activées
    """
    if not is_system_tenant(tenant):
        return {
            'enabled': 0,
            'skipped': 0,
            'error': 'Tenant is not a system tenant'
        }
    
    # Récupérer toutes les fonctionnalités actives
    all_features = Feature.objects.filter(is_active=True)
    
    enabled_count = 0
    skipped_count = 0
    users_count = 0
    
    with tenant_context(tenant):
        # Récupérer tous les utilisateurs du tenant
        users = User.objects.filter(tenant=tenant, status='active')
        users_count = users.count()
        
        for user in users:
            for feature in all_features:
                # Créer ou mettre à jour UserFeature
                user_feature, created = UserFeature.objects.get_or_create(
                    user=user,
                    feature=feature,
                    defaults={
                        'is_enabled': True,
                        'enabled_by': user if user.is_tenant_admin() else None,
                    }
                )
                
                if not created and not user_feature.is_enabled:
                    # Réactiver si elle était désactivée
                    user_feature.is_enabled = True
                    user_feature.save()
                    enabled_count += 1
                elif created:
                    enabled_count += 1
                else:
                    skipped_count += 1
    
    return {
        'enabled': enabled_count,
        'skipped': skipped_count,
        'features_count': len(all_features),
        'users_count': users_count,
        'tenant': tenant.name
    }


def enable_features_for_tenant(tenant, plan=None):
    """
    Active automatiquement les fonctionnalités d'un tenant en fonction de son plan d'abonnement.
    Les tenants système ont automatiquement accès à toutes les fonctionnalités.
    
    Args:
        tenant: Instance du Tenant
        plan: Instance du PricingPlan (optionnel, récupéré depuis l'abonnement si non fourni)
    
    Returns:
        dict: Statistiques sur les fonctionnalités activées
    """
    from django_tenants.utils import tenant_context
    
    # Les tenants système ont accès à toutes les fonctionnalités
    if is_system_tenant(tenant):
        return enable_all_features_for_system_tenant(tenant)
    
    # Récupérer le plan depuis l'abonnement si non fourni
    if not plan:
        try:
            subscription = Subscription.objects.filter(
                tenant=tenant,
                status__in=['active', 'trial']
            ).first()
            if subscription:
                plan = subscription.plan
            else:
                return {
                    'enabled': 0,
                    'skipped': 0,
                    'error': 'No active subscription found'
                }
        except Exception as e:
            return {
                'enabled': 0,
                'skipped': 0,
                'error': str(e)
            }
    
    if not plan:
        return {
            'enabled': 0,
            'skipped': 0,
            'error': 'No plan provided'
        }
    
    # Récupérer toutes les fonctionnalités disponibles pour ce plan
    # Une fonctionnalité est disponible si :
    # 1. Elle n'a aucun plan associé (accessible à tous)
    # 2. Elle a le plan actuel dans ses available_plans
    all_features = Feature.objects.filter(is_active=True)
    available_features = []
    
    for feature in all_features:
        if feature.is_available_for_plan(plan):
            available_features.append(feature)
    
    # Activer les fonctionnalités pour tous les utilisateurs du tenant
    enabled_count = 0
    skipped_count = 0
    users_count = 0
    
    with tenant_context(tenant):
        # Récupérer tous les utilisateurs du tenant
        users = User.objects.filter(tenant=tenant, status='active')
        users_count = users.count()
        
        for user in users:
            for feature in available_features:
                # Créer ou mettre à jour UserFeature
                user_feature, created = UserFeature.objects.get_or_create(
                    user=user,
                    feature=feature,
                    defaults={
                        'is_enabled': True,
                        'enabled_by': user if user.is_tenant_admin() else None,
                    }
                )
                
                if not created and not user_feature.is_enabled:
                    # Réactiver si elle était désactivée
                    user_feature.is_enabled = True
                    user_feature.save()
                    enabled_count += 1
                elif created:
                    enabled_count += 1
                else:
                    skipped_count += 1
    
    return {
        'enabled': enabled_count,
        'skipped': skipped_count,
        'features_count': len(available_features),
        'users_count': users_count,
        'plan': plan.name
    }


def sync_tenant_features(tenant):
    """
    Synchronise les fonctionnalités d'un tenant avec son plan actuel.
    Désactive les fonctionnalités qui ne sont plus disponibles et active celles qui le sont.
    Les tenants système ont toujours accès à toutes les fonctionnalités.
    
    Args:
        tenant: Instance du Tenant
    
    Returns:
        dict: Statistiques sur la synchronisation
    """
    from django_tenants.utils import tenant_context
    
    # Les tenants système ont toujours accès à toutes les fonctionnalités
    if is_system_tenant(tenant):
        return enable_all_features_for_system_tenant(tenant)
    
    try:
        subscription = Subscription.objects.filter(
            tenant=tenant,
            status__in=['active', 'trial']
        ).first()
        
        if not subscription:
            return {
                'enabled': 0,
                'disabled': 0,
                'error': 'No active subscription found'
            }
        
        plan = subscription.plan
        
        # Récupérer toutes les fonctionnalités disponibles pour ce plan
        all_features = Feature.objects.filter(is_active=True)
        available_features = [f for f in all_features if f.is_available_for_plan(plan)]
        available_feature_ids = {f.id for f in available_features}
        
        enabled_count = 0
        disabled_count = 0
        
        with tenant_context(tenant):
            users = User.objects.filter(tenant=tenant, status='active')
            
            for user in users:
                # Activer les fonctionnalités disponibles
                for feature in available_features:
                    user_feature, created = UserFeature.objects.get_or_create(
                        user=user,
                        feature=feature,
                        defaults={'is_enabled': True}
                    )
                    if not user_feature.is_enabled:
                        user_feature.is_enabled = True
                        user_feature.save()
                        enabled_count += 1
                    elif created:
                        enabled_count += 1
                
                # Désactiver les fonctionnalités non disponibles
                user_features = UserFeature.objects.filter(user=user)
                for user_feature in user_features:
                    if user_feature.feature.id not in available_feature_ids:
                        if user_feature.is_enabled:
                            user_feature.is_enabled = False
                            user_feature.save()
                            disabled_count += 1
        
        users_count = users.count() if 'users' in locals() else 0
        
        return {
            'enabled': enabled_count,
            'disabled': disabled_count,
            'features_count': len(available_features),
            'users_count': users_count,
            'plan': plan.name
        }
    except Exception as e:
        return {
            'enabled': 0,
            'disabled': 0,
            'error': str(e)
        }

