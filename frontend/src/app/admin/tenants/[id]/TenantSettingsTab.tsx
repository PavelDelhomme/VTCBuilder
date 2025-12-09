'use client'

import { useEffect, useState } from 'react'
import tenantService from '@/services/tenant.service'
import toast from 'react-hot-toast'
import { Tenant } from '@/services/tenant.service'

interface TenantSettingsTabProps {
  tenantId: number
  tenantName: string
}

interface Feature {
  id: string
  name: string
  description: string
  icon: string
  category: 'content' | 'business' | 'communication' | 'advanced'
}

const AVAILABLE_FEATURES: Feature[] = [
  // Content Features
  {
    id: 'pages',
    name: 'Pages',
    description: 'Créer et gérer des pages de contenu pour votre site',
    icon: '📄',
    category: 'content',
  },
  {
    id: 'media',
    name: 'Médias',
    description: 'Gérer vos images, vidéos et fichiers',
    icon: '🖼️',
    category: 'content',
  },
  {
    id: 'templates',
    name: 'Templates',
    description: 'Utiliser des templates prédéfinis pour votre site',
    icon: '🎨',
    category: 'content',
  },
  // Business Features
  {
    id: 'services',
    name: 'Services VTC',
    description: 'Gérer vos différents services (Berline, Van, etc.)',
    icon: '🚗',
    category: 'business',
  },
  {
    id: 'bookings',
    name: 'Réservations',
    description: 'Système de réservation en ligne avec calendrier',
    icon: '📅',
    category: 'business',
  },
  {
    id: 'payments',
    name: 'Paiements',
    description: 'Accepter les paiements en ligne',
    icon: '💳',
    category: 'business',
  },
  {
    id: 'users',
    name: 'Gestion Utilisateurs',
    description: 'Gérer les utilisateurs de votre tenant (chauffeurs, opérateurs)',
    icon: '👥',
    category: 'business',
  },
  // Communication Features
  {
    id: 'contact_form',
    name: 'Formulaire de Contact',
    description: 'Formulaire de contact sur votre site',
    icon: '✉️',
    category: 'communication',
  },
  {
    id: 'notifications',
    name: 'Notifications',
    description: 'Notifications email et SMS pour les réservations',
    icon: '🔔',
    category: 'communication',
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Collecter des emails pour votre newsletter',
    icon: '📧',
    category: 'communication',
  },
  // Advanced Features
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Statistiques et analyses de votre site',
    icon: '📊',
    category: 'advanced',
  },
  {
    id: 'seo',
    name: 'SEO Avancé',
    description: 'Outils SEO pour optimiser votre référencement',
    icon: '🔍',
    category: 'advanced',
  },
  {
    id: 'api_access',
    name: 'Accès API',
    description: 'Accès à l\'API pour intégrations tierces',
    icon: '🔌',
    category: 'advanced',
  },
  {
    id: 'custom_domain',
    name: 'Domaine Personnalisé',
    description: 'Utiliser votre propre nom de domaine',
    icon: '🌐',
    category: 'advanced',
  },
]

const CATEGORIES = {
  content: { name: 'Contenu', icon: '📝' },
  business: { name: 'Business', icon: '💼' },
  communication: { name: 'Communication', icon: '💬' },
  advanced: { name: 'Avancé', icon: '⚙️' },
}

export default function TenantSettingsTab({ tenantId, tenantName }: TenantSettingsTabProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [enabledFeatures, setEnabledFeatures] = useState<Set<string>>(new Set())
  const [settings, setSettings] = useState({
    name: '',
    email: '',
    primary_color: '#3B82F6',
    secondary_color: '#10B981',
  })

  useEffect(() => {
    loadTenant()
  }, [tenantId])

  const loadTenant = async () => {
    try {
      setLoading(true)
      const data = await tenantService.getById(tenantId)
      setTenant(data)
      
      // Load settings
      setSettings({
        name: data.name || '',
        email: data.email || '',
        primary_color: data.primary_color || '#3B82F6',
        secondary_color: data.secondary_color || '#10B981',
      })
      
      // Load enabled features from tenant.enabled_features or tenant.settings
      const features = data.enabled_features || data.settings?.enabled_features || []
      setEnabledFeatures(new Set(features))
    } catch (error) {
      console.error('Erreur chargement tenant:', error)
      toast.error('Erreur lors du chargement des paramètres')
    } finally {
      setLoading(false)
    }
  }

  const toggleFeature = (featureId: string) => {
    const newEnabled = new Set(enabledFeatures)
    if (newEnabled.has(featureId)) {
      newEnabled.delete(featureId)
    } else {
      newEnabled.add(featureId)
    }
    setEnabledFeatures(newEnabled)
  }

  const handleSaveFeatures = async () => {
    if (!tenant) return

    setSaving(true)
    try {
      const updatedSettings = {
        ...tenant.settings,
        enabled_features: Array.from(enabledFeatures),
      }
      
      await tenantService.update(tenant.id, {
        settings: updatedSettings,
      })
      
      toast.success('Fonctionnalités mises à jour avec succès !')
      loadTenant()
    } catch (error: any) {
      console.error('Erreur sauvegarde fonctionnalités:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!tenant) return

    setSaving(true)
    try {
      await tenantService.update(tenant.id, {
        name: settings.name,
        email: settings.email,
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
      })
      
      toast.success('Paramètres mis à jour avec succès !')
      loadTenant()
    } catch (error: any) {
      console.error('Erreur sauvegarde paramètres:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const featuresByCategory = AVAILABLE_FEATURES.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = []
    }
    acc[feature.category].push(feature)
    return acc
  }, {} as Record<string, Feature[]>)

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement des paramètres...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Paramètres généraux</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom du tenant
            </label>
            <input
              type="text"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nom de la société"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email de contact
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="contact@exemple.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Couleur primaire
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="h-10 w-20 rounded dark:bg-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="flex-1 px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Couleur secondaire
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.secondary_color}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className="h-10 w-20 rounded dark:bg-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={settings.secondary_color}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className="flex-1 px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#10B981"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
            </button>
          </div>
        </div>
      </div>

      {/* Features Management */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Gestion des Fonctionnalités</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Activez ou désactivez les fonctionnalités disponibles pour {tenantName}
            </p>
          </div>
          <button
            onClick={handleSaveFeatures}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
          </button>
        </div>

        <div className="space-y-8">
          {Object.entries(featuresByCategory).map(([category, features]) => (
            <div key={category} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{CATEGORIES[category as keyof typeof CATEGORIES].icon}</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {CATEGORIES[category as keyof typeof CATEGORIES].name}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({features.filter(f => enabledFeatures.has(f.id)).length}/{features.length} activées)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature) => {
                  const isEnabled = enabledFeatures.has(feature.id)
                  return (
                    <div
                      key={feature.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        isEnabled
                          ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => toggleFeature(feature.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{feature.icon}</span>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{feature.name}</h4>
                        </div>
                        <div
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            isEnabled ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-800 shadow ring-0 transition duration-200 ease-in-out ${
                              isEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">À propos des fonctionnalités</h4>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Les fonctionnalités désactivées seront masquées dans l'interface du tenant. 
                  Le tenant ne pourra pas accéder à ces fonctionnalités tant qu'elles ne sont pas activées.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Info */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Informations techniques</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-medium text-gray-700 dark:text-gray-300">Slug</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100 font-mono">{tenant?.slug}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700 dark:text-gray-300">Plan</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100 capitalize">{tenant?.plan}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700 dark:text-gray-300">Statut</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100 capitalize">{tenant?.status}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700 dark:text-gray-300">Créé le</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">
              {tenant?.created_at ? (() => {
                try {
                  const date = new Date(tenant.created_at)
                  return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('fr-FR')
                } catch {
                  return '-'
                }
              })() : '-'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

