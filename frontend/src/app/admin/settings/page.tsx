'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/admin/AdminLayout'
import settingsService, { SystemSettings } from '@/services/settings.service'
import toast from 'react-hot-toast'
import PageLoader from '@/components/shared/PageLoader'
import SecurityTab from './SecurityTab'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [testEmailRecipient, setTestEmailRecipient] = useState('')
  const [testingStripe, setTestingStripe] = useState(false)
  const [stripeTestResult, setStripeTestResult] = useState<{status: string; message: string; account?: any} | null>(null)
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [activeTab, setActiveTab] = useState<'general' | 'email' | 'security' | 'billing' | 'notifications' | 'maintenance' | 'payment'>('general')

  useEffect(() => {
    // Vérifier l'authentification avant de charger
    if (!authService.isAuthenticated()) {
      authService.saveRedirectUrl()
      router.push('/login')
      return
    }
    
    if (!authService.isSuperAdmin()) {
      router.push('/dashboard')
      return
    }
    loadSettings()
  }, [router])

  const loadSettings = async () => {
    // Ne pas charger si pas authentifié
    if (!authService.isAuthenticated()) {
      return
    }
    
    try {
      setLoading(true)
      const data = await settingsService.getSettings()
      setSettings(data)
    } catch (error: any) {
      // Gérer les erreurs d'authentification
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        authService.saveRedirectUrl()
      router.push('/login')
        return
      }
      
      // Si 404, créer avec valeurs par défaut (silencieux)
      if (error.response?.status === 404) {
        const defaultSettings = {
          site_name: 'VTCBuilder',
          site_url: 'http://localhost:9494',
          contact_email: 'contact@vtcbuilder.com',
          support_email: 'support@vtcbuilder.com',
        }
        try {
          await settingsService.updateSettings(defaultSettings)
          loadSettings()
        } catch (err: any) {
          // Erreur silencieuse lors de la création
          if (err.response?.status !== 404 && err.response?.status !== 401) {
            console.error('Error création paramètres:', err)
          }
        }
      } else {
        // Ne logger que les erreurs non attendues (pas les 401 - non authentifié)
        const isExpectedError = error.code === 'ERR_NETWORK' || 
                               error.code === 'ERR_BLOCKED_BY_CLIENT'
        if (!isExpectedError) {
          console.error('Error chargement paramètres:', error)
          toast.error('Error lors du chargement des paramètres')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    try {
      setSaving(true)
      await settingsService.updateSettings(settings)
      toast.success('Paramètres sauvegardés avec succès !')
    } catch (error: any) {
      console.error('Error sauvegarde paramètres:', error)
      toast.error(error.response?.data?.error || 'Error lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      toast.error('Veuillez entrer une adresse email valide')
      return
    }

    try {
      setTestingEmail(true)
      const result = await settingsService.testEmail(testEmailRecipient)
      if (result.status === 'success') {
        toast.success(result.message || `Email de test envoyé avec succès à ${testEmailRecipient} !`)
        setTestEmailRecipient('')
      } else {
        toast.error(result.message || 'Error lors de l\'envoi de l\'email de test')
      }
    } catch (error: any) {
      console.error('Error test email:', error)
      toast.error(error.response?.data?.message || 'Error lors du test email')
    } finally {
      setTestingEmail(false)
    }
  }

  const updateSetting = (field: keyof SystemSettings, value: any) => {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
  }

  if (loading) {
    return (
      <AdminLayout title="Paramètres">
        <PageLoader text="Chargement des paramètres..." />
      </AdminLayout>
    )
  }

  if (!settings) {
    return (
      <AdminLayout title="Paramètres">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Impossible de charger les paramètres</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Paramètres"
      subtitle="Configuration de la plateforme VTCBuilder"
    >
      <div className="w-full h-full min-h-0 flex flex-col overflow-hidden overflow-x-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-6">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 w-full overflow-x-hidden">
          {/* Mobile: Menu déroulant */}
          <div className="lg:hidden mb-4 w-full">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="block w-full max-w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm box-border"
              style={{ width: '100%', maxWidth: '100%' }}
            >
              {[
                { id: 'general', label: 'Général', icon: '⚙️' },
                { id: 'email', label: 'Email', icon: '📧' },
                { id: 'security', label: 'Sécurité', icon: '🔒' },
                { id: 'billing', label: 'Facturation', icon: '💳' },
                { id: 'notifications', label: 'Notifications', icon: '🔔' },
                { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
                { id: 'payment', label: 'Paiement', icon: '💳' },
              ].map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.icon} {tab.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Desktop: Onglets horizontaux */}
          <nav className="hidden lg:flex space-x-4 overflow-x-auto">
            {[
              { id: 'general', label: 'Général', icon: '⚙️' },
              { id: 'email', label: 'Email', icon: '📧' },
              { id: 'security', label: 'Sécurité', icon: '🔒' },
              { id: 'billing', label: 'Facturation', icon: '💳' },
              { id: 'notifications', label: 'Notifications', icon: '🔔' },
              { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
              { id: 'payment', label: 'Paiement', icon: '💳' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Paramètres Généraux</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom du site
                </label>
                <input
                  type="text"
                  value={settings.site_name}
                  onChange={(e) => updateSetting('site_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL du site
                </label>
                <input
                  type="url"
                  value={settings.site_url}
                  onChange={(e) => updateSetting('site_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email de contact
                </label>
                <input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => updateSetting('contact_email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email de support
                </label>
                <input
                  type="email"
                  value={settings.support_email}
                  onChange={(e) => updateSetting('support_email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Email Tab */}
        {activeTab === 'email' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Configuration Email</h2>
            
            {/* Info Box - Configuration simplifiée */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Configuration Email Automatique</p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Les emails sont envoyés automatiquement depuis <strong>noreply@vtcbuilder.com</strong> pour :
                  </p>
                  <ul className="list-disc list-inside mt-2 text-blue-700 dark:text-blue-300 space-y-1">
                    <li>Réinitialisation de mot de passe</li>
                    <li>Validation de création de compte</li>
                    <li>Factures et notifications de paiement</li>
                    <li>Notifications système</li>
                  </ul>
                  <p className="text-blue-700 dark:text-blue-300 mt-2">
                    La configuration SMTP est gérée via les variables d'environnement dans le fichier <code className="bg-blue-100 px-1 rounded">.env</code> du backend.
                  </p>
                </div>
              </div>
            </div>

            {/* Test Email Section */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tester l'envoi d'email</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Entrez une adresse email pour recevoir un email de test et vérifier que la configuration fonctionne correctement.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  placeholder="votre-email@exemple.com"
                  className="flex-1 px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleTestEmail}
                  disabled={testingEmail || !testEmailRecipient}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {testingEmail ? 'Envoi en cours...' : 'Envoyer un email de test'}
                </button>
              </div>
              
              {testEmailRecipient && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Un email de test sera envoyé à <strong>{testEmailRecipient}</strong>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && <SecurityTab />}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Paramètres de Facturation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Devise par défaut
                </label>
                <select
                  value={settings.default_currency}
                  onChange={(e) => updateSetting('default_currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Taux de TVA (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.tax_rate}
                  onChange={(e) => updateSetting('tax_rate', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={0}
                  max={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Préfixe facture
                </label>
                <input
                  type="text"
                  value={settings.invoice_prefix}
                  onChange={(e) => updateSetting('invoice_prefix', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="INV-"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Délai de paiement (jours)
                </label>
                <input
                  type="number"
                  value={settings.payment_terms_days}
                  onChange={(e) => updateSetting('payment_terms_days', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={1}
                />
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Paramètres de Notifications</h2>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.enable_email_notifications}
                  onChange={(e) => updateSetting('enable_email_notifications', e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Activer les notifications par email</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notify_on_new_tenant}
                  onChange={(e) => updateSetting('notify_on_new_tenant', e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifier lors de la création d'un nouveau tenant</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notify_on_payment_failed}
                  onChange={(e) => updateSetting('notify_on_payment_failed', e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifier lors d'un échec de paiement</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notify_on_subscription_expiring}
                  onChange={(e) => updateSetting('notify_on_subscription_expiring', e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifier lors de l'expiration d'un abonnement</span>
              </label>
            </div>
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Mode Maintenance</h2>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium mb-1">Mode Maintenance</p>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Le mode maintenance permet de bloquer l'accès au site pendant les mises à jour ou la maintenance.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.maintenance_mode || false}
                    onChange={(e) => updateSetting('maintenance_mode', e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Activer le mode maintenance</span>
                </label>
              </div>

              {settings.maintenance_mode && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type de maintenance
                    </label>
                    <select
                      value={settings.maintenance_mode_type || 'public_only'}
                      onChange={(e) => updateSetting('maintenance_mode_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="public_only">Site public seulement (VTCBuilder)</option>
                      <option value="platform_except_admin">Plateforme entière sauf admin (super administrateurs)</option>
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {settings.maintenance_mode_type === 'public_only' 
                        ? 'Seul le site public VTCBuilder sera en maintenance. Les tenants et l\'admin restent accessibles.'
                        : 'Toute la plateforme sera en maintenance, sauf l\'interface d\'administration pour les super administrateurs.'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message de maintenance
                    </label>
                    <textarea
                      value={settings.maintenance_message || ''}
                      onChange={(e) => updateSetting('maintenance_message', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Le site est en maintenance. Veuillez revenir plus tard."
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Trial Settings */}
        {activeTab === 'general' && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Paramètres d'Essai</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      checked={settings.enable_trial}
                      onChange={(e) => updateSetting('enable_trial', e.target.checked)}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Activer la période d'essai</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Durée de l'essai (jours)
                  </label>
                  <input
                    type="number"
                    value={settings.default_trial_days}
                    onChange={(e) => updateSetting('default_trial_days', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min={0}
                    disabled={!settings.enable_trial}
                  />
                </div>
              </div>
            </div>

            {/* Additional Useful Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Paramètres Avancés</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre maximum de tenants par compte
                  </label>
                  <input
                    type="number"
                    value={settings.extra_settings?.max_tenants_per_account || ''}
                    onChange={(e) => {
                      const extraSettings = { ...(settings.extra_settings || {}), max_tenants_per_account: e.target.value ? parseInt(e.target.value) : null }
                      updateSetting('extra_settings', extraSettings)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Illimité si vide"
                    min={1}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Laisser vide pour illimité</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Limite de pages par tenant
                  </label>
                  <input
                    type="number"
                    value={settings.extra_settings?.max_pages_per_tenant || ''}
                    onChange={(e) => {
                      const extraSettings = { ...(settings.extra_settings || {}), max_pages_per_tenant: e.target.value ? parseInt(e.target.value) : null }
                      updateSetting('extra_settings', extraSettings)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Illimité si vide"
                    min={1}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Laisser vide pour illimité</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Limite de stockage par tenant (MB)
                  </label>
                  <input
                    type="number"
                    value={settings.extra_settings?.max_storage_per_tenant_mb || ''}
                    onChange={(e) => {
                      const extraSettings = { ...(settings.extra_settings || {}), max_storage_per_tenant_mb: e.target.value ? parseInt(e.target.value) : null }
                      updateSetting('extra_settings', extraSettings)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Illimité si vide"
                    min={1}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Laisser vide pour illimité</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Délai d'expiration des sessions inactives (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.session_timeout_minutes || 1440}
                    onChange={(e) => updateSetting('session_timeout_minutes', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min={1}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Par défaut: 1440 minutes (24h)</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.extra_settings?.allow_tenant_registration !== false}
                    onChange={(e) => {
                      const extraSettings = { ...(settings.extra_settings || {}), allow_tenant_registration: e.target.checked }
                      updateSetting('extra_settings', extraSettings)
                    }}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Autoriser l'inscription de nouveaux tenants</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.extra_settings?.enable_analytics !== false}
                    onChange={(e) => {
                      const extraSettings = { ...(settings.extra_settings || {}), enable_analytics: e.target.checked }
                      updateSetting('extra_settings', extraSettings)
                    }}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Activer le suivi analytique</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.extra_settings?.enable_api_access || false}
                    onChange={(e) => {
                      const extraSettings = { ...(settings.extra_settings || {}), enable_api_access: e.target.checked }
                      updateSetting('extra_settings', extraSettings)
                    }}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Activer l'accès API pour les tenants</span>
                </label>
              </div>
            </div>
          </>
        )}

        {/* Payment/Stripe Tab */}
        {activeTab === 'payment' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Configuration Stripe</h2>
            
            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Configuration Stripe</p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Configurez Stripe pour activer les paiements par carte bancaire. Les clés API sont disponibles dans votre <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="underline font-semibold">tableau de bord Stripe</a>.
                  </p>
                </div>
              </div>
            </div>

            {/* Stripe Configuration */}
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.stripe_enabled || false}
                  onChange={(e) => updateSetting('stripe_enabled', e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Activer Stripe</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mode Stripe
                  </label>
                  <select
                    value={settings.stripe_mode || 'test'}
                    onChange={(e) => updateSetting('stripe_mode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="test">Test (sk_test_... / pk_test_...)</option>
                    <option value="live">Production (sk_live_... / pk_live_...)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Clé publique Stripe (pk_test_... ou pk_live_...)
                  </label>
                  <input
                    type="password"
                    value={settings.stripe_public_key || ''}
                    onChange={(e) => updateSetting('stripe_public_key', e.target.value)}
                    placeholder="pk_test_..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Utilisée côté frontend pour créer les Payment Intents</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Clé secrète Stripe (sk_test_... ou sk_live_...)
                  </label>
                  <input
                    type="password"
                    value={settings.stripe_secret_key || ''}
                    onChange={(e) => updateSetting('stripe_secret_key', e.target.value)}
                    placeholder="sk_test_..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">NE JAMAIS PARTAGER - Utilisée côté backend uniquement</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Secret du webhook Stripe (whsec_...)
                  </label>
                  <input
                    type="password"
                    value={settings.stripe_webhook_secret || ''}
                    onChange={(e) => updateSetting('stripe_webhook_secret', e.target.value)}
                    placeholder="whsec_..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">URL webhook: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">https://votredomaine.com/api/billing/webhooks/stripe/</code></p>
                </div>
              </div>

              {/* Test Stripe Connection */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tester la connexion Stripe</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Testez la connexion avec votre clé secrète Stripe pour vérifier que la configuration est correcte.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="password"
                    value={settings.stripe_secret_key || ''}
                    onChange={(e) => updateSetting('stripe_secret_key', e.target.value)}
                    placeholder="sk_test_... ou sk_live_..."
                    className="flex-1 px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  />
                  <button
                    onClick={async () => {
                      setTestingStripe(true)
                      setStripeTestResult(null)
                      try {
                        const result = await settingsService.testStripe(settings.stripe_secret_key)
                        setStripeTestResult(result)
                        if (result.status === 'success') {
                          toast.success('Connexion Stripe réussie !')
                        } else {
                          toast.error(result.message || 'Error lors du test Stripe')
                        }
                      } catch (error: any) {
                        console.error('Error test Stripe:', error)
                        setStripeTestResult({
                          status: 'error',
                          message: error.response?.data?.message || 'Error lors du test de connexion'
                        })
                        toast.error('Error lors du test Stripe')
                      } finally {
                        setTestingStripe(false)
                      }
                    }}
                    disabled={testingStripe || !settings.stripe_secret_key}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {testingStripe ? 'Test en cours...' : 'Tester la connexion'}
                  </button>
                </div>
                
                {stripeTestResult && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    stripeTestResult.status === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}>
                    <div className="flex items-start">
                      {stripeTestResult.status === 'success' ? (
                        <svg className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      <div className="flex-1">
                        <p className={`font-medium ${
                          stripeTestResult.status === 'success'
                            ? 'text-green-800 dark:text-green-200'
                            : 'text-red-800 dark:text-red-200'
                        }`}>
                          {stripeTestResult.message}
                        </p>
                        {stripeTestResult.account && (
                          <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                            <p><strong>ID Compte:</strong> {stripeTestResult.account.id}</p>
                            <p><strong>Pays:</strong> {stripeTestResult.account.country}</p>
                            <p><strong>Devise:</strong> {stripeTestResult.account.default_currency}</p>
                            {stripeTestResult.account.email && (
                              <p><strong>Email:</strong> {stripeTestResult.account.email}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {saving ? 'Sauvegarde...' : 'Enregistrer les paramètres'}
          </button>
        </div>
      </div>
        </div>
      </div>
    </AdminLayout>
  )
}
