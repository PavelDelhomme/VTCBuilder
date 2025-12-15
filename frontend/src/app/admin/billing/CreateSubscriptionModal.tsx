'use client'

import { useState, useEffect } from 'react'
import billingService, { Subscription, PricingPlan } from '@/services/billing.service'
import tenantService, { Tenant } from '@/services/tenant.service'
import toast from 'react-hot-toast'

interface CreateSubscriptionModalProps {
  pricingPlans: PricingPlan[]
  billingService: any
  tenantService: any
  onClose: () => void
  onSuccess: () => void
}

export default function CreateSubscriptionModal({
  pricingPlans,
  billingService,
  tenantService,
  onClose,
  onSuccess,
}: CreateSubscriptionModalProps) {
  const [step, setStep] = useState<'tenant' | 'details'>('tenant')
  const [loading, setLoading] = useState(false)
  const [loadingTenants, setLoadingTenants] = useState(false)
  const [tenantsWithoutSubscription, setTenantsWithoutSubscription] = useState<Tenant[]>([])
  
  // Tenant selection
  const [tenantMode, setTenantMode] = useState<'existing' | 'new'>('existing')
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null)
  
  // New tenant form
  const [newTenantData, setNewTenantData] = useState({
    name: '',
    email: '',
    plan: 'business' as Tenant['plan'],
    status: 'active' as Tenant['status'],
  })
  
  // Subscription details
  const [subscriptionData, setSubscriptionData] = useState({
    plan_id: null as number | null,
    status: 'trial' as Subscription['status'],
    billing_cycle: 'monthly' as Subscription['billing_cycle'],
  })

  useEffect(() => {
    if (step === 'tenant' && tenantMode === 'existing') {
      loadTenantsWithoutSubscription()
    }
  }, [step, tenantMode])

  const loadTenantsWithoutSubscription = async () => {
    setLoadingTenants(true)
    try {
      // Charger uniquement les tenants qui n'ont PAS d'abonnement actif
      // Un tenant ne peut avoir qu'un seul abonnement à la fois
      const tenants = await billingService.getTenantsWithoutSubscription()
      setTenantsWithoutSubscription(tenants)
    } catch (error: any) {
      console.error('Error chargement tenants:', error)
      toast.error('Error lors du chargement des tenants sans abonnement')
    } finally {
      setLoadingTenants(false)
    }
  }

  const handleNext = async () => {
    if (step === 'tenant') {
      if (tenantMode === 'existing' && !selectedTenantId) {
        toast.error('Veuillez sélectionner un tenant')
        return
      }
      
      if (tenantMode === 'new') {
        if (!newTenantData.name || !newTenantData.email) {
          toast.error('Veuillez remplir tous les champs obligatoires')
          return
        }
        
        // Create tenant first
        setLoading(true)
        try {
          const newTenant = await tenantService.create(newTenantData)
          setSelectedTenantId(newTenant.id)
          toast.success('Tenant créé avec succès')
        } catch (error: any) {
          console.error('Error création tenant:', error)
          toast.error(error.response?.data?.error || 'Error lors de la création du tenant')
          setLoading(false)
          return
        } finally {
          setLoading(false)
        }
      }
      
      setStep('details')
    }
  }

  const handleSubmit = async () => {
    if (!subscriptionData.plan_id || !selectedTenantId) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)
    try {
      await billingService.createSubscription({
        tenant_id: selectedTenantId,
        plan_id: subscriptionData.plan_id,
        status: subscriptionData.status,
        billing_cycle: subscriptionData.billing_cycle,
      })
      
      onSuccess()
    } catch (error: any) {
      console.error('Error création abonnement:', error)
      toast.error(error.response?.data?.error || 'Error lors de la création de l\'abonnement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Créer un nouvel abonnement
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'tenant' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Sélectionnez un tenant existant ou créez-en un nouveau
                  </label>
                  
                  {/* Mode selection */}
                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={() => setTenantMode('existing')}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                        tenantMode === 'existing'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100">Tenant existant</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Sélectionner un tenant sans abonnement</div>
                    </button>
                    <button
                      onClick={() => setTenantMode('new')}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                        tenantMode === 'new'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100">Nouveau tenant</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Créer un tenant et son utilisateur admin</div>
                    </button>
                  </div>

                  {/* Existing tenant selection */}
                  {tenantMode === 'existing' && (
                    <div>
                      {loadingTenants ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-gray-500 dark:text-gray-400">Chargement...</p>
                        </div>
                      ) : tenantsWithoutSubscription.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          Aucun tenant sans abonnement trouvé
                        </div>
                      ) : (
                        <select
                          value={selectedTenantId || ''}
                          onChange={(e) => setSelectedTenantId(parseInt(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Sélectionner un tenant</option>
                          {tenantsWithoutSubscription.map((tenant) => (
                            <option key={tenant.id} value={tenant.id}>
                              {tenant.name} ({tenant.email})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  {/* New tenant form */}
                  {tenantMode === 'new' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nom du tenant *
                        </label>
                        <input
                          type="text"
                          value={newTenantData.name}
                          onChange={(e) => setNewTenantData({ ...newTenantData, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Ma Société VTC"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={newTenantData.email}
                          onChange={(e) => setNewTenantData({ ...newTenantData, email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="admin@masociete-vtc.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Plan initial
                        </label>
                        <select
                          value={newTenantData.plan}
                          onChange={(e) => setNewTenantData({ ...newTenantData, plan: e.target.value as Tenant['plan'] })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="starter">Starter</option>
                          <option value="business">Business</option>
                          <option value="enterprise">Entreprise</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Statut initial
                        </label>
                        <select
                          value={newTenantData.status}
                          onChange={(e) => setNewTenantData({ ...newTenantData, status: e.target.value as Tenant['status'] })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="trial">Trial</option>
                          <option value="active">Active</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 'details' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Plan tarifaire *
                  </label>
                  <select
                    value={subscriptionData.plan_id || ''}
                    onChange={(e) => setSubscriptionData({ ...subscriptionData, plan_id: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner un plan</option>
                    {pricingPlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - {plan.price_monthly}€/mois
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Statut initial *
                  </label>
                  <select
                    value={subscriptionData.status}
                    onChange={(e) => setSubscriptionData({ ...subscriptionData, status: e.target.value as Subscription['status'] })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cycle de facturation *
                  </label>
                  <select
                    value={subscriptionData.billing_cycle}
                    onChange={(e) => setSubscriptionData({ ...subscriptionData, billing_cycle: e.target.value as Subscription['billing_cycle'] })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">Mensuel</option>
                    <option value="yearly">Annuel</option>
                  </select>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3 mt-6">
              <button
                onClick={step === 'tenant' ? onClose : () => setStep('tenant')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
                disabled={loading}
              >
                {step === 'tenant' ? 'Annuler' : 'Retour'}
              </button>
              {step === 'tenant' ? (
                <button
                  onClick={handleNext}
                  disabled={loading || (tenantMode === 'existing' && !selectedTenantId)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Création...' : 'Suivant'}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || !subscriptionData.plan_id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Création...' : 'Créer l\'abonnement'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

