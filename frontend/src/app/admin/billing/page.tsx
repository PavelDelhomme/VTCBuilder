'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/AdminLayout'
import billingService, { Subscription, Invoice, Payment, PricingPlan, PaymentMethod } from '@/services/billing.service'
import tenantService, { Tenant } from '@/services/tenant.service'
import ResponsiveTable from '@/components/ResponsiveTable'
import CreateSubscriptionModal from './CreateSubscriptionModal'
import InvoicesTab from './InvoicesTab'
import InvoiceTemplatesTab from './InvoiceTemplatesTab'
import toast from 'react-hot-toast'
import PageLoader from '@/components/PageLoader'
import FeaturesListEditor from '@/components/FeaturesListEditor'

function SubscriptionRow({
  subscription,
  getStatusBadge,
  billingService,
  pricingPlans,
  onUpdate,
  router,
}: {
  subscription: Subscription
  getStatusBadge: (status: string) => string
  billingService: any
  pricingPlans: PricingPlan[]
  onUpdate: () => void
  router: any
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleAction = async (action: string, planId?: number) => {
    setActionLoading(action)
    setShowMenu(false)
    
    try {
      switch (action) {
        case 'activate':
          await billingService.activateSubscription(subscription.id)
          toast.success('Abonnement activé avec succès')
          break
        case 'cancel':
          if (!confirm('Êtes-vous sûr de vouloir annuler cet abonnement ?')) {
            setActionLoading(null)
            return
          }
          await billingService.cancelSubscription(subscription.id)
          toast.success('Abonnement annulé')
          break
        case 'reactivate':
          await billingService.reactivateSubscription(subscription.id)
          toast.success('Abonnement réactivé avec succès')
          break
        case 'suspend':
          if (!confirm('Êtes-vous sûr de vouloir suspendre cet abonnement ?')) {
            setActionLoading(null)
            return
          }
          await billingService.suspendSubscription(subscription.id)
          toast.success('Abonnement suspendu')
          break
        case 'update_plan':
          if (!planId) {
            toast.error('Veuillez sélectionner un plan')
            setActionLoading(null)
            return
          }
          await billingService.updateSubscriptionPlan(subscription.id, planId)
          toast.success('Plan mis à jour avec succès')
          break
        case 'update_status':
          const newStatus = prompt('Nouveau statut (trial, active, past_due, cancelled, expired):')
          if (!newStatus || !['trial', 'active', 'past_due', 'cancelled', 'expired'].includes(newStatus)) {
            toast.error('Statut invalide')
            setActionLoading(null)
            return
          }
          await billingService.updateSubscriptionStatus(subscription.id, newStatus)
          toast.success('Statut mis à jour')
          break
      }
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'action')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      active: 'Actif',
      trial: 'En trial',
      cancelled: 'Annulé',
      past_due: 'En retard',
      expired: 'Expiré',
    }
    return labels[status] || status
  }

  return (
    <tr className="hover:bg-gray-50 dark:bg-gray-900">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
        {subscription.tenant?.name || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {subscription.plan.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(subscription.status)}`}>
          {getStatusLabel(subscription.status)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
        {subscription.billing_cycle === 'monthly' ? 'Mensuel' : 'Annuel'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {new Date(subscription.current_period_start).toLocaleDateString('fr-FR')} - {new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {subscription.unpaid_amount && subscription.unpaid_amount > 0 ? (
          <div>
            <span className="font-semibold text-red-600">{subscription.unpaid_amount.toFixed(2)}€</span>
            {subscription.unpaid_invoices_count && subscription.unpaid_invoices_count > 0 && (
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                {subscription.unpaid_invoices_count} facture{subscription.unpaid_invoices_count > 1 ? 's' : ''}
              </span>
            )}
          </div>
        ) : (
          <span className="text-green-600">À jour</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
        <div className="flex flex-wrap justify-end items-center gap-2">
          <button
            onClick={() => router.push(`/admin/billing/subscriptions/${subscription.id}`)}
            className="text-blue-600 hover:text-blue-900"
            title="Voir les détails complets"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <div className="relative inline-block text-left">
            <button
              onClick={() => setShowMenu(!showMenu)}
            disabled={!!actionLoading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {actionLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                En cours...
              </>
            ) : (
              <>
                Actions
                <svg className="ml-2 -mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
            <svg className="ml-2 -mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 sm:w-64 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20 max-h-96 overflow-y-auto">
                <div className="py-1" role="menu">
                  {subscription.status === 'cancelled' && (
                    <button
                      onClick={() => handleAction('reactivate')}
                      className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                      role="menuitem"
                    >
                      ✅ Réactiver
                    </button>
                  )}
                  
                  {subscription.status === 'trial' && (
                    <button
                      onClick={() => handleAction('activate')}
                      className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                      role="menuitem"
                    >
                      ▶️ Activer
                    </button>
                  )}
                  
                  {subscription.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleAction('suspend')}
                        className="block w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                        role="menuitem"
                      >
                        ⏸️ Suspendre
                      </button>
                      <button
                        onClick={() => handleAction('cancel')}
                        className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                        role="menuitem"
                      >
                        ❌ Annuler
                      </button>
                    </>
                  )}
                  
                  {subscription.status === 'past_due' && (
                    <>
                      <button
                        onClick={() => handleAction('activate')}
                        className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                        role="menuitem"
                      >
                        ✅ Réactiver
                      </button>
                      <button
                        onClick={() => handleAction('cancel')}
                        className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                        role="menuitem"
                      >
                        ❌ Annuler
                      </button>
                    </>
                  )}

                  {pricingPlans.length > 0 && (
                    <>
                      <div className="border-t border-gray-100 my-1" />
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Changer de plan</div>
                      {pricingPlans
                        .filter(plan => plan.id !== subscription.plan.id)
                        .map((plan) => (
                          <button
                            key={plan.id}
                            onClick={() => {
                              setShowMenu(false)
                              if (confirm(`Changer l'abonnement vers le plan "${plan.name}" ?`)) {
                                handleAction('update_plan', plan.id)
                              }
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900"
                            role="menuitem"
                          >
                            🔄 {plan.name} ({plan.price_monthly}€/mois)
                          </button>
                        ))}
                    </>
                  )}

                  <button
                    onClick={() => handleAction('update_status')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900"
                    role="menuitem"
                  >
                    ⚙️ Modifier le statut
                  </button>
                </div>
              </div>
            </>
          )}
          </div>
        </div>
      </td>
    </tr>
  )
}

export default function BillingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'invoices' | 'payments' | 'plans' | 'payment-methods' | 'invoice-templates' | 'unpaid'>('overview')
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [unpaidItems, setUnpaidItems] = useState<any>(null)
  const [loadingUnpaid, setLoadingUnpaid] = useState(false)
  const [showCreateSubscriptionModal, setShowCreateSubscriptionModal] = useState(false)

  // Charger les impayés automatiquement quand on change d'onglet
  useEffect(() => {
    if (activeTab === 'unpaid' && unpaidItems === null && !loadingUnpaid) {
      loadUnpaidItems()
    }
  }, [activeTab, unpaidItems, loadingUnpaid])

  const loadUnpaidItems = async () => {
    setLoadingUnpaid(true)
    try {
      const data = await billingService.getUnpaidItems()
      setUnpaidItems(data)
    } catch (error: any) {
      console.error('Erreur chargement impayés:', error)
      // Ne pas afficher d'erreur si c'est un 404 (endpoint non disponible)
      if (error.response?.status !== 404) {
        toast.error('Erreur lors du chargement des impayés')
      }
      // Initialiser avec des données vides
      setUnpaidItems({
        past_due_subscriptions: [],
        unpaid_invoices: [],
        overdue_invoices: [],
        stats: {
          past_due_count: 0,
          unpaid_invoices_count: 0,
          overdue_invoices_count: 0,
          total_unpaid_amount: 0,
          total_overdue_amount: 0,
        }
      })
    } finally {
      setLoadingUnpaid(false)
    }
  }

  useEffect(() => {
    if (!authService.isSuperAdmin()) {
      router.push('/dashboard')
      return
    }
    loadBillingData()
  }, [router])

  const loadBillingData = async () => {
    try {
      const results = await Promise.allSettled([
        billingService.getBillingStats(),
        billingService.getSubscriptions(),
        billingService.getInvoices(),
        billingService.getPayments(),
        billingService.getPricingPlans(),
        billingService.getPaymentMethods().catch(() => []), // Retourne tableau vide si 404
      ])
      
      if (results[0].status === 'fulfilled') setStats(results[0].value)
      if (results[1].status === 'fulfilled') setSubscriptions(results[1].value)
      if (results[2].status === 'fulfilled') setInvoices(results[2].value)
      if (results[3].status === 'fulfilled') setPayments(results[3].value)
      if (results[4].status === 'fulfilled') setPricingPlans(results[4].value)
      if (results[5].status === 'fulfilled') setPaymentMethods(results[5].value || [])
      else setPaymentMethods([]) // Si erreur, tableau vide
    } catch (error: any) {
      // Ne pas logger les erreurs attendues (gérées gracieusement)
      if (!error.response || (error.response?.status !== 404 && error.response?.status !== 500)) {
        console.error('Erreur chargement facturation:', error)
      }
      // Ne pas afficher de toast pour les erreurs attendues
      if (!error.response || (error.response?.status !== 404 && error.response?.status !== 500)) {
        toast.error('Erreur lors du chargement des données de facturation')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleMarkInvoicePaid = async (id: number) => {
    if (!confirm('Marquer cette facture comme payée ?')) return
    
    try {
      await billingService.markInvoicePaid(id)
      loadBillingData()
      toast.success('Facture marquée comme payée')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      trial: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      past_due: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-gray-100 dark:bg-gray-900 text-gray-800',
      paid: 'bg-green-100 text-green-800',
      open: 'bg-yellow-100 text-yellow-800',
      draft: 'bg-gray-100 dark:bg-gray-900 text-gray-800',
      succeeded: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    }
    return badges[status as keyof typeof badges] || 'bg-gray-100 dark:bg-gray-900 text-gray-800'
  }

  if (loading) {
    return (
      <AdminLayout title="Facturation">
        <PageLoader text="Chargement de la facturation..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Facturation"
      subtitle="Gestion complète de la facturation et des paiements"
    >
      <div className="w-full max-w-full overflow-x-hidden">
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        {/* Mobile: Menu déroulant */}
        <div className="lg:hidden mb-4">
          <select
            value={activeTab}
            onChange={(e) => {
              const tab = e.target.value as typeof activeTab
              setActiveTab(tab)
              if (tab === 'unpaid' && !unpaidItems) {
                billingService.getUnpaidItems()
                  .then(data => setUnpaidItems(data))
                  .catch(error => {
                    console.error('Erreur chargement impayés:', error)
                    toast.error('Erreur lors du chargement des impayés')
                  })
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="overview">Vue d&apos;ensemble</option>
            <option value="subscriptions">Abonnements ({subscriptions.length})</option>
            <option value="invoices">Factures ({invoices.length})</option>
            <option value="payments">Paiements ({payments.length})</option>
            <option value="plans">Plans Tarifaires ({pricingPlans.length})</option>
            <option value="payment-methods">Modes de Paiement ({paymentMethods.length})</option>
            <option value="unpaid">⚠️ Impayés</option>
          </select>
        </div>
        
        {/* Desktop: Onglets horizontaux */}
        <nav className="hidden lg:flex space-x-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            Vue d&apos;ensemble
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'subscriptions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            Abonnements ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'invoices'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            Factures ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'payments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            Paiements ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('invoice-templates')}
            className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'invoice-templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            Templates Factures
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'plans'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            Plans Tarifaires ({pricingPlans.length})
          </button>
          <button
            onClick={() => setActiveTab('payment-methods')}
            className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'payment-methods'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            Modes de Paiement ({paymentMethods.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('unpaid')
              // Le useEffect chargera automatiquement les données si nécessaire
            }}
            className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'unpaid'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            ⚠️ Impayés
            {stats && stats.past_due_subscriptions > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {stats.past_due_subscriptions}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Overview Tab - Dashboard Complet */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Cartes Statistiques Principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Revenus Totaux */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm opacity-90">Revenus Totaux</p>
                <svg className="w-6 h-6 sm:w-8 sm:h-8 opacity-80 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl sm:text-3xl font-bold break-words">{stats.total_revenue?.toFixed(2) || '0.00'}€</p>
              {stats.yearly_revenue && stats.yearly_revenue > 0 && (
                <p className="text-xs sm:text-sm opacity-80 mt-1 break-words">Année en cours: {stats.yearly_revenue.toFixed(2)}€</p>
              )}
            </div>

            {/* Revenus Mensuels */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm opacity-90">Revenus Ce Mois</p>
                <svg className="w-6 h-6 sm:w-8 sm:h-8 opacity-80 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-2xl sm:text-3xl font-bold break-words">{stats.monthly_revenue?.toFixed(2) || '0.00'}€</p>
              {stats.last_month_revenue && stats.last_month_revenue > 0 && (
                <p className="text-sm opacity-80 mt-1">
                  Mois dernier: {stats.last_month_revenue.toFixed(2)}€
                  {stats.monthly_revenue > stats.last_month_revenue ? (
                    <span className="ml-2">📈 +{((stats.monthly_revenue / stats.last_month_revenue - 1) * 100).toFixed(1)}%</span>
                  ) : stats.monthly_revenue < stats.last_month_revenue ? (
                    <span className="ml-2">📉 {((stats.monthly_revenue / stats.last_month_revenue - 1) * 100).toFixed(1)}%</span>
                  ) : null}
                </p>
              )}
            </div>

            {/* MRR (Monthly Recurring Revenue) */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm opacity-90">Revenus Récurrents</p>
                <svg className="w-6 h-6 sm:w-8 sm:h-8 opacity-80 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-2xl sm:text-3xl font-bold break-words">{stats.monthly_recurring_revenue?.toFixed(2) || '0.00'}€</p>
              <p className="text-xs sm:text-sm opacity-80 mt-1">MRR mensuel</p>
            </div>

            {/* Abonnements Actifs */}
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm opacity-90">Abonnements Actifs</p>
                <svg className="w-6 h-6 sm:w-8 sm:h-8 opacity-80 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{stats.active_subscriptions || 0}</p>
              {stats.total_subscriptions && (
                <p className="text-xs sm:text-sm opacity-80 mt-1">Sur {stats.total_subscriptions} au total</p>
              )}
            </div>
          </div>

          {/* Deuxième rangée de statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Factures */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Factures</p>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total_invoices || 0}</p>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="text-green-600">✓ Payées: {stats.paid_invoices || 0}</span>
                {' • '}
                <span className="text-red-600">⚠ Impayées: {stats.unpaid_invoices || 0}</span>
              </div>
            </div>

            {/* Paiements */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Paiements</p>
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total_payments || 0}</p>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="text-green-600">✓ Réussis: {stats.succeeded_payments || 0}</span>
                {' • '}
                <span className="text-yellow-600">⏳ En attente: {stats.pending_payments || 0}</span>
              </div>
            </div>

            {/* Taux de Conversion Trial -> Actif */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Taux de Conversion</p>
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.trial_subscriptions && stats.active_subscriptions 
                  ? ((stats.active_subscriptions / (stats.trial_subscriptions + stats.active_subscriptions)) * 100).toFixed(1)
                  : '0.0'}%
              </p>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="text-blue-600">Trial → Actif</span>
                {' • '}
                <span className="text-gray-600">{stats.active_subscriptions || 0} actifs</span>
              </div>
            </div>

            {/* Montant Impayé */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Montant Impayé</p>
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.unpaid_amount?.toFixed(2) || '0.00'}€</p>
              {stats.overdue_amount && stats.overdue_amount > 0 && (
                <p className="text-xs text-red-600 mt-1">Dont en retard: {stats.overdue_amount.toFixed(2)}€</p>
              )}
            </div>
          </div>

          {/* Graphique des Revenus Mensuels */}
          {stats.monthly_revenues_chart && stats.monthly_revenues_chart.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Revenus des 12 Derniers Mois</h3>
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <div className="flex items-end justify-between space-x-1 sm:space-x-2 h-48 sm:h-64" style={{ minWidth: 'max-content' }}>
                  {stats.monthly_revenues_chart.map((month: any, index: number) => {
                    const maxRevenue = Math.max(...stats.monthly_revenues_chart.map((m: any) => m.revenue || 0))
                    const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center min-w-[40px] sm:min-w-[50px]">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t relative" style={{ height: `${Math.max(height, 5)}%` }}>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"></div>
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-2 text-center transform -rotate-45 origin-top-left whitespace-nowrap">
                          {month.label?.split(' ')[0] || month.month}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 mt-1">{month.revenue.toFixed(0)}€</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Plans Tarifaires les Plus Utilisés */}
          {stats.popular_plans && stats.popular_plans.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Plans Tarifaires les Plus Utilisés</h3>
              <div className="space-y-4">
                {stats.popular_plans.map((plan: any, index: number) => {
                  const percentage = stats.total_subscriptions > 0 
                    ? (plan.subscriptions_count / stats.total_subscriptions) * 100 
                    : 0
                  return (
                    <div key={plan.id || index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{plan.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{plan.subscriptions_count} abonnement{plan.subscriptions_count > 1 ? 's' : ''}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{plan.price_monthly.toFixed(2)}€/mois</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Répartition des Modes de Paiement */}
          {stats.payment_methods_stats && stats.payment_methods_stats.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Répartition des Modes de Paiement</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.payment_methods_stats.map((pm: any, index: number) => {
                  const methodLabels: { [key: string]: string } = {
                    'card': '💳 Carte Bancaire',
                    'bank_transfer': '🏦 Virement',
                    'paypal': '🅿️ PayPal',
                    'other': '📄 Autre',
                  }
                  const percentage = stats.total_payments > 0 
                    ? (pm.count / stats.total_payments) * 100 
                    : 0
                  return (
                    <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {methodLabels[pm.method] || pm.method}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pm.count}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {percentage.toFixed(1)}% • {pm.total_amount.toFixed(2)}€
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Répartition des Statuts d'Abonnements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Statuts des Abonnements */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Répartition des Abonnements</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Actifs</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.active_subscriptions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">En Trial</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.trial_subscriptions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">En Retard</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.past_due_subscriptions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Annulés</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.cancelled_subscriptions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-500 rounded"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Expirés</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.expired_subscriptions || 0}</span>
                </div>
              </div>
              {stats.monthly_billing !== undefined && stats.yearly_billing !== undefined && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Cycle de facturation:</p>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Mensuel: {stats.monthly_billing}</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Annuel: {stats.yearly_billing}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Statuts des Factures */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Répartition des Factures</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Payées</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.paid_invoices || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Ouvertes</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.unpaid_invoices || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">En Retard</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.overdue_invoices || 0}</span>
                </div>
              </div>
              {stats.invoice_revenue && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Revenus des factures:</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.invoice_revenue.toFixed(2)}€</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fallback si pas de stats */}
      {activeTab === 'overview' && !stats && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Chargement des statistiques...</p>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Abonnements</h2>
            <button
              onClick={() => setShowCreateSubscriptionModal(true)}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base whitespace-nowrap"
            >
              + Créer un abonnement
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <ResponsiveTable
                headers={['Tenant', 'Plan', 'Statut', 'Cycle', 'Période', 'Montant', 'Actions']}
                emptyMessage="Aucun abonnement"
              >
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Aucun abonnement trouvé
                  </td>
                </tr>
              ) : (
                subscriptions.map((subscription) => (
                  <SubscriptionRow
                    key={subscription.id}
                    subscription={subscription}
                    getStatusBadge={getStatusBadge}
                    billingService={billingService}
                    pricingPlans={pricingPlans}
                    onUpdate={loadBillingData}
                    router={router}
                  />
                ))
              )}
            </ResponsiveTable>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <InvoicesTab
          invoices={invoices}
          getStatusBadge={getStatusBadge}
          onUpdate={loadBillingData}
        />
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <PaymentsHistoryTab
          payments={payments}
          getStatusBadge={getStatusBadge}
          onUpdate={loadBillingData}
        />
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <PricingPlansTab
          pricingPlans={pricingPlans}
          onUpdate={loadBillingData}
          billingService={billingService}
          getStatusBadge={getStatusBadge}
        />
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'payment-methods' && (
        <PaymentMethodsTab
          paymentMethods={paymentMethods}
          onUpdate={loadBillingData}
          billingService={billingService}
        />
      )}

      {/* Invoice Templates Tab */}
      {activeTab === 'invoice-templates' && (
        <InvoiceTemplatesTab
          onUpdate={loadBillingData}
        />
      )}

      {/* Unpaid Items Tab */}
      {activeTab === 'unpaid' && (
        <div className="space-y-6">
          {loadingUnpaid || unpaidItems === null ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Chargement des impayés...</p>
              </div>
            </div>
          ) : unpaidItems && unpaidItems.stats ? (
            <>
              {/* Stats Cards */}
              {unpaidItems.stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg shadow p-4 sm:p-6">
                    <p className="text-xs sm:text-sm text-red-700 mb-2">Abonnements en Retard</p>
                    <p className="text-2xl sm:text-3xl font-bold text-red-900 break-words">{unpaidItems.stats.past_due_count || 0}</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow p-4 sm:p-6">
                    <p className="text-xs sm:text-sm text-yellow-700 mb-2">Factures Impayées</p>
                    <p className="text-2xl sm:text-3xl font-bold text-yellow-900 break-words">{unpaidItems.stats.unpaid_invoices_count || 0}</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg shadow p-4 sm:p-6">
                    <p className="text-xs sm:text-sm text-orange-700 mb-2">Factures en Retard</p>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-900 break-words">{unpaidItems.stats.overdue_invoices_count || 0}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg shadow p-4 sm:p-6">
                    <p className="text-xs sm:text-sm text-purple-700 mb-2">Montant Total Impayé</p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-900 break-words">{unpaidItems.stats.total_unpaid_amount?.toFixed(2) || '0.00'}€</p>
                  </div>
                </div>
              )}

              {/* Past Due Subscriptions */}
              {unpaidItems.past_due_subscriptions && unpaidItems.past_due_subscriptions.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Abonnements en Retard de Paiement</h2>
                  </div>
                  <ResponsiveTable
                    headers={['Tenant', 'Plan', 'Statut', 'Montant Impayé', 'Actions']}
                    emptyMessage="Aucun abonnement en retard"
                  >
                    {unpaidItems.past_due_subscriptions.map((sub: Subscription) => (
                      <tr key={sub.id} className="hover:bg-gray-50 dark:bg-gray-900">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                          <div className="min-w-0">
                            <div className="truncate">{sub.tenant?.name || '-'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{sub.tenant?.email || '-'}</div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="truncate block">{sub.plan?.name || '-'}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(sub.status)}`}>
                            En retard
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-semibold text-red-600">
                          <div className="break-words">{sub.unpaid_amount?.toFixed(2) || '0.00'}€</div>
                          {sub.unpaid_invoices_count && sub.unpaid_invoices_count > 0 && (
                            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                              ({sub.unpaid_invoices_count} facture{sub.unpaid_invoices_count > 1 ? 's' : ''})
                            </span>
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-sm">
                          <div className="flex flex-wrap justify-end gap-1 sm:gap-2">
                            <button
                              onClick={() => router.push(`/admin/billing/subscriptions/${sub.id}`)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Voir les détails"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await billingService.activateSubscription(sub.id)
                                  toast.success('Abonnement réactivé')
                                  loadBillingData()
                                  setUnpaidItems(null)
                                } catch (error: any) {
                                  toast.error(error.response?.data?.error || 'Erreur')
                                }
                              }}
                              className="text-green-600 hover:text-green-900"
                              title="Réactiver"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </ResponsiveTable>
                </div>
              )}

              {/* Overdue Invoices */}
              {unpaidItems.overdue_invoices && unpaidItems.overdue_invoices.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-red-900">⚠️ Factures en Retard ({unpaidItems.overdue_invoices.length})</h2>
                  </div>
                  <ResponsiveTable
                    headers={['N° Facture', 'Tenant', 'Plan', 'Montant', 'Échéance', 'Retard', 'Actions']}
                    emptyMessage="Aucune facture en retard"
                  >
                    {unpaidItems.overdue_invoices.map((invoice: Invoice) => {
                      const dueDate = new Date(invoice.due_date)
                      const now = new Date()
                      const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
                      
                      return (
                        <tr key={invoice.id} className="hover:bg-red-50">
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                            <span className="truncate block">{invoice.invoice_number}</span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="min-w-0">
                              <div className="truncate">{invoice.tenant?.name || '-'}</div>
                              <div className="text-xs text-gray-400 truncate">{invoice.tenant?.email || '-'}</div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="truncate block">{invoice.subscription?.plan?.name || '-'}</span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                            <span className="break-words">{invoice.total} {invoice.currency}</span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-400">
                            {dueDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              {daysOverdue} jour{daysOverdue > 1 ? 's' : ''}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-sm">
                            <div className="flex flex-wrap justify-end gap-1 sm:gap-2">
                              <button
                                onClick={async () => {
                                  try {
                                    await billingService.sendInvoiceReminder(invoice.id)
                                    toast.success('Email de relance envoyé')
                                  } catch (error: any) {
                                    toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi de la relance')
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="Envoyer une relance"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleMarkInvoicePaid(invoice.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Marquer comme payée"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => router.push(`/admin/billing/subscriptions/${invoice.subscription?.id}`)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Voir l'abonnement"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </ResponsiveTable>
                </div>
              )}

              {/* All Unpaid Invoices */}
              {unpaidItems.unpaid_invoices && unpaidItems.unpaid_invoices.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Toutes les Factures Impayées</h2>
                  </div>
                  <ResponsiveTable
                    headers={['N° Facture', 'Tenant', 'Plan', 'Montant', 'Date', 'Échéance', 'Actions']}
                    emptyMessage="Aucune facture impayée"
                  >
                    {unpaidItems.unpaid_invoices.map((invoice: Invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:bg-gray-900">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {invoice.invoice_number}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="truncate block">{invoice.tenant?.name || '-'}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="truncate block">{invoice.subscription?.plan?.name || '-'}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                          <span className="break-words">{invoice.total} {invoice.currency}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(invoice.issue_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(invoice.due_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right text-sm">
                          <div className="flex flex-wrap justify-end gap-1 sm:gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  await billingService.sendInvoiceReminder(invoice.id)
                                  toast.success('Email de relance envoyé')
                                } catch (error: any) {
                                  toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi de la relance')
                                }
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Envoyer une relance"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleMarkInvoicePaid(invoice.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Marquer comme payée"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </ResponsiveTable>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Aucun élément impayé pour le moment</p>
              <p className="text-gray-400 text-sm">Les abonnements en retard et factures impayées apparaîtront ici</p>
            </div>
          )}
        </div>
      )}

      {/* Create Subscription Modal */}
      {showCreateSubscriptionModal && (
        <CreateSubscriptionModal
          pricingPlans={pricingPlans}
          billingService={billingService}
          tenantService={tenantService}
          onClose={() => setShowCreateSubscriptionModal(false)}
          onSuccess={() => {
            setShowCreateSubscriptionModal(false)
            loadBillingData()
            toast.success('Abonnement créé avec succès')
          }}
        />
      )}
      </div>
    </AdminLayout>
  )
}

// Pricing Plans Tab Component
function PricingPlansTab({
  pricingPlans,
  onUpdate,
  billingService,
  getStatusBadge,
}: {
  pricingPlans: PricingPlan[]
  onUpdate: () => void
  billingService: any
  getStatusBadge: (status: string) => string
}) {
  const [editing, setEditing] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<PricingPlan>>({})
  const [showCreate, setShowCreate] = useState(false)
  const [features, setFeatures] = useState<string[]>([])

  const handleCreate = () => {
    setShowCreate(true)
    setEditing(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      price_monthly: 0,
      price_yearly: undefined,
      currency: 'EUR',
      max_sites: 1,
      max_users: 1,
      max_storage_gb: 1,
      features: [],
      is_active: true,
      is_featured: false,
      order: pricingPlans.length > 0 ? Math.max(...pricingPlans.map(p => p.order || 0)) + 1 : 0,
    })
    setFeatures([])
  }

  const handleEdit = (plan: PricingPlan) => {
    setEditing(plan.id)
    setFormData(plan)
    setShowCreate(false)
    setFeatures(Array.isArray(plan.features) ? plan.features : [])
  }

  const handleSave = async () => {
    try {
      const dataToSave = {
        ...formData,
        features: features.filter(f => f.trim().length > 0),
      }

      // Generate slug from name if not provided
      if (!dataToSave.slug && dataToSave.name) {
        dataToSave.slug = dataToSave.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      }

      if (editing) {
        await billingService.updatePricingPlan(editing, dataToSave)
        toast.success('Plan tarifaire mis à jour')
      } else {
        await billingService.createPricingPlan(dataToSave)
        toast.success('Plan tarifaire créé')
      }
      setEditing(null)
      setShowCreate(false)
      setFormData({})
      setFeatures([])
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.response?.data?.slug?.[0] || 'Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le plan "${name}" ? Cette action est irréversible.`)) return

    try {
      await billingService.deletePricingPlan(id)
      toast.success('Plan tarifaire supprimé')
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression')
    }
  }

  const handleMoveUp = async (id: number) => {
    try {
      await billingService.movePlanUp(id)
      toast.success('Ordre mis à jour')
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur')
    }
  }

  const handleMoveDown = async (id: number) => {
    try {
      await billingService.movePlanDown(id)
      toast.success('Ordre mis à jour')
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur')
    }
  }

  const sortedPlans = [...pricingPlans].sort((a, b) => (a.order || 0) - (b.order || 0))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Gestion des Plans Tarifaires</h2>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Nouveau Plan
        </button>
      </div>

      {(showCreate || editing) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editing ? 'Modifier le Plan Tarifaire' : 'Nouveau Plan Tarifaire'}
          </h3>
          <PricingPlanForm
            formData={formData}
            setFormData={setFormData}
            features={features}
            setFeatures={setFeatures}
            onSave={handleSave}
            onCancel={() => {
              setShowCreate(false)
              setEditing(null)
              setFormData({})
              setFeatures([])
            }}
          />
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <ResponsiveTable
          headers={['Ordre', 'Nom', 'Prix', 'Statut', 'Caractéristiques', 'Actions']}
          emptyMessage="Aucun plan tarifaire"
        >
          {sortedPlans.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                Aucun plan tarifaire configuré
              </td>
            </tr>
          ) : (
            sortedPlans.map((plan, index) => (
              <tr key={plan.id} className="hover:bg-gray-50 dark:bg-gray-900">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleMoveUp(plan.id)}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Monter"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{plan.order ?? index}</span>
                    <button
                      onClick={() => handleMoveDown(plan.id)}
                      disabled={index === sortedPlans.length - 1}
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Descendre"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{plan.name}</div>
                    {plan.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{plan.description}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  <div>
                    <span className="font-bold">{plan.price_monthly}€</span>
                    <span className="text-gray-500 dark:text-gray-400">/mois</span>
                    {plan.price_yearly && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {plan.price_yearly}€/an
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      plan.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {plan.is_active ? 'Actif' : 'Inactif'}
                    </span>
                    {plan.is_featured && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Populaire
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="space-y-1">
                    <div>{plan.max_sites} site{plan.max_sites > 1 ? 's' : ''}</div>
                    <div>{plan.max_users} utilisateur{plan.max_users > 1 ? 's' : ''}</div>
                    <div>{plan.max_storage_gb} Go</div>
                    {plan.features && plan.features.length > 0 && (
                      <div className="text-xs text-gray-400">{plan.features.length} fonctionnalité{plan.features.length > 1 ? 's' : ''}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id, plan.name)}
                      className="text-red-600 hover:text-red-900"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </ResponsiveTable>
      </div>

      {/* Preview des plans */}
      {sortedPlans.filter(p => p.is_active).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Aperçu de l&apos;affichage sur le site public</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sortedPlans.filter(p => p.is_active).map((plan) => (
              <div
                key={plan.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 relative border-2 ${
                  plan.is_featured ? 'border-blue-500 scale-105' : 'border-gray-200'
                }`}
              >
                {plan.is_featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                      POPULAIRE
                    </span>
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
                    {plan.price_monthly}€
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">/mois</span>
                  {plan.price_yearly && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      ou {plan.price_yearly}€/an
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">{plan.max_sites} site{plan.max_sites > 1 ? 's' : ''}</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">{plan.max_users} utilisateur{plan.max_users > 1 ? 's' : ''} max</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">{plan.max_storage_gb} GB de stockage</span>
                  </li>
                  {plan.features && plan.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Pricing Plan Form Component
function PricingPlanForm({
  formData,
  setFormData,
  features,
  setFeatures,
  onSave,
  onCancel,
}: {
  formData: Partial<PricingPlan>
  setFormData: (data: Partial<PricingPlan>) => void
  features: string[]
  setFeatures: (features: string[]) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value })
              // Auto-generate slug from name
              if (!formData.slug || formData.slug === '') {
                const slug = e.target.value
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '')
                setFormData({ ...formData, name: e.target.value, slug })
              }
            }}
            className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Starter"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug *</label>
          <input
            type="text"
            value={formData.slug || ''}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="starter"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix mensuel (€) *</label>
          <input
            type="number"
            step="0.01"
            value={formData.price_monthly || 0}
            onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix annuel (€)</label>
          <input
            type="number"
            step="0.01"
            value={formData.price_yearly || ''}
            onChange={(e) => setFormData({ ...formData, price_yearly: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Optionnel"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de sites *</label>
          <input
            type="number"
            value={formData.max_sites || 1}
            onChange={(e) => setFormData({ ...formData, max_sites: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre d&apos;utilisateurs *</label>
          <input
            type="number"
            value={formData.max_users || 1}
            onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stockage (GB) *</label>
          <input
            type="number"
            value={formData.max_storage_gb || 1}
            onChange={(e) => setFormData({ ...formData, max_storage_gb: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ordre d&apos;affichage *</label>
          <input
            type="number"
            value={formData.order || 0}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Plus petit = affiché en premier</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Description du plan..."
        />
      </div>

      <div>
        <FeaturesListEditor
          features={features}
          onChange={setFeatures}
          placeholder="Ex: Support prioritaire, API complète, Analytics avancés..."
        />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.is_active || false}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Plan actif</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.is_featured || false}
            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Marquer comme &quot;Populaire&quot;</span>
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900"
        >
          Annuler
        </button>
        <button
          onClick={onSave}
          disabled={!formData.name || !formData.slug}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Enregistrer
        </button>
      </div>
    </div>
  )
}

// Payments History Tab Component
function PaymentsHistoryTab({
  payments,
  getStatusBadge,
  onUpdate,
}: {
  payments: Payment[]
  getStatusBadge: (status: string) => string
  onUpdate: () => void
}) {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterMethod, setFilterMethod] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: 'En attente',
      processing: 'En cours',
      succeeded: 'Réussi',
      failed: 'Échoué',
      refunded: 'Remboursé',
    }
    return labels[status] || status
  }

  const getMethodLabel = (method: string) => {
    const labels: { [key: string]: string } = {
      card: 'Carte bancaire',
      bank_transfer: 'Virement bancaire',
      paypal: 'PayPal',
      other: 'Autre',
    }
    return labels[method] || method
  }

  // Filter and sort payments
  const filteredPayments = payments
    .filter((payment: Payment) => {
      if (filterStatus !== 'all' && payment.status !== filterStatus) return false
      if (filterMethod !== 'all' && payment.method !== filterMethod) return false
      return true
    })
    .sort((a: Payment, b: Payment) => {
      let comparison = 0
      if (sortBy === 'date') {
        const dateA = a.paid_at ? new Date(a.paid_at).getTime() : 0
        const dateB = b.paid_at ? new Date(b.paid_at).getTime() : 0
        comparison = dateA - dateB
      } else if (sortBy === 'amount') {
        comparison = parseFloat(a.amount.toString()) - parseFloat(b.amount.toString())
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  // Calculate statistics
  const stats = {
    total: filteredPayments.length,
    totalAmount: filteredPayments
      .filter((p: Payment) => p.status === 'succeeded')
      .reduce((sum: number, p: Payment) => sum + parseFloat(p.amount.toString()), 0),
    succeeded: filteredPayments.filter((p: Payment) => p.status === 'succeeded').length,
    failed: filteredPayments.filter((p: Payment) => p.status === 'failed').length,
    pending: filteredPayments.filter((p: Payment) => p.status === 'pending').length,
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Paiements</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Montant Total</p>
          <p className="text-3xl font-bold text-green-600">
            {stats.totalAmount.toFixed(2)}€
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Réussis</p>
          <p className="text-3xl font-bold text-blue-600">{stats.succeeded}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Échoués</p>
          <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Statut
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="processing">En cours</option>
              <option value="succeeded">Réussi</option>
              <option value="failed">Échoué</option>
              <option value="refunded">Remboursé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Méthode
            </label>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes</option>
              <option value="card">Carte bancaire</option>
              <option value="bank_transfer">Virement bancaire</option>
              <option value="paypal">PayPal</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trier par
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
              className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Date</option>
              <option value="amount">Montant</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ordre
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Décroissant</option>
              <option value="asc">Croissant</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <ResponsiveTable
          headers={['Date', 'Tenant', 'Facture', 'Montant', 'Méthode', 'Statut', 'Détails']}
          emptyMessage="Aucun paiement"
        >
          {filteredPayments.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                Aucun paiement trouvé
              </td>
            </tr>
          ) : (
            filteredPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50 dark:bg-gray-900">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {payment.paid_at
                    ? new Date(payment.paid_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : payment.created_at
                    ? new Date(payment.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {payment.tenant?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {payment.invoice?.invoice_number || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {parseFloat(payment.amount.toString()).toFixed(2)} {payment.currency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {getMethodLabel(payment.method)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                      payment.status
                    )}`}
                  >
                    {getStatusLabel(payment.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {payment.stripe_payment_intent_id && (
                    <span className="text-xs text-gray-500 dark:text-gray-400" title={payment.stripe_payment_intent_id}>
                      Stripe: {payment.stripe_payment_intent_id.slice(-8)}
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </ResponsiveTable>
      </div>
    </div>
  )
}

// Payment Methods Tab Component
function PaymentMethodsTab({
  paymentMethods,
  onUpdate,
  billingService,
}: {
  paymentMethods: PaymentMethod[]
  onUpdate: () => void
  billingService: any
}) {
  const [editing, setEditing] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<PaymentMethod>>({})
  const [showCreate, setShowCreate] = useState(false)

  const methodTypeLabels: Record<string, string> = {
    card: 'Carte bancaire',
    bank_transfer: 'Virement bancaire',
    paypal: 'PayPal',
    stripe: 'Stripe',
    check: 'Chèque',
    cash: 'Espèces',
    other: 'Autre',
  }

  const handleEdit = (method: PaymentMethod) => {
    setEditing(method.id)
    setFormData(method)
    setShowCreate(false)
  }

  const handleCreate = () => {
    setShowCreate(true)
    setEditing(null)
    setFormData({
      name: '',
      method_type: 'card',
      description: '',
      is_active: true,
      is_enabled: true,
      requires_validation: false,
      settings: {},
      icon: '',
      order: paymentMethods.length,
      fee_percentage: 0,
      fee_fixed: 0,
    })
  }

  const handleSave = async () => {
    try {
      if (editing) {
        await billingService.updatePaymentMethod(editing, formData)
        toast.success('Mode de paiement mis à jour')
      } else {
        await billingService.createPaymentMethod(formData)
        toast.success('Mode de paiement créé')
      }
      setEditing(null)
      setShowCreate(false)
      setFormData({})
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le mode de paiement "${name}" ?`)) return
    
    try {
      await billingService.deletePaymentMethod(id)
      toast.success('Mode de paiement supprimé')
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression')
    }
  }

  const handleToggleEnabled = async (id: number) => {
    try {
      await billingService.togglePaymentMethodEnabled(id)
      toast.success('Statut modifié')
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Gestion des Modes de Paiement</h2>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Nouveau Mode de Paiement
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Nouveau Mode de Paiement</h3>
          <PaymentMethodForm
            formData={formData}
            setFormData={setFormData}
            onSave={handleSave}
            onCancel={() => {
              setShowCreate(false)
              setFormData({})
            }}
          />
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <ResponsiveTable
          headers={['Nom', 'Type', 'Statut', 'Commission', 'Limites', 'Actions']}
          emptyMessage="Aucun mode de paiement"
        >
          {paymentMethods.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                Aucun mode de paiement configuré
              </td>
            </tr>
          ) : (
            paymentMethods.map((method) => (
              <tr key={method.id} className="hover:bg-gray-50 dark:bg-gray-900">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {method.icon && <span className="mr-2 text-xl">{method.icon}</span>}
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{method.name}</div>
                      {method.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">{method.description}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {methodTypeLabels[method.method_type] || method.method_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      method.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {method.is_active ? 'Actif' : 'Inactif'}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      method.is_enabled ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 dark:bg-gray-900 text-gray-800'
                    }`}>
                      {method.is_enabled ? 'Disponible' : 'Masqué'}
                    </span>
                    {method.requires_validation && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Validation requise
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {method.fee_percentage > 0 && `${method.fee_percentage}%`}
                  {method.fee_percentage > 0 && method.fee_fixed > 0 && ' + '}
                  {method.fee_fixed > 0 && `${method.fee_fixed}€`}
                  {method.fee_percentage === 0 && method.fee_fixed === 0 && 'Aucune'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {method.min_amount && `Min: ${method.min_amount}€`}
                  {method.min_amount && method.max_amount && ' / '}
                  {method.max_amount && `Max: ${method.max_amount}€`}
                  {!method.min_amount && !method.max_amount && '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {editing === method.id ? (
                      <PaymentMethodForm
                        formData={formData}
                        setFormData={setFormData}
                        onSave={handleSave}
                        onCancel={() => {
                          setEditing(null)
                          setFormData({})
                        }}
                      />
                    ) : (
                      <>
                        <button
                          onClick={() => handleToggleEnabled(method.id)}
                          className={`px-3 py-1 text-xs rounded ${
                            method.is_enabled
                              ? 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                          title={method.is_enabled ? 'Désactiver' : 'Activer'}
                        >
                          {method.is_enabled ? '👁️' : '👁️‍🗨️'}
                        </button>
                        <button
                          onClick={() => handleEdit(method)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(method.id, method.name)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </ResponsiveTable>
      </div>
    </div>
  )
}

// Payment Method Form Component
function PaymentMethodForm({
  formData,
  setFormData,
  onSave,
  onCancel,
}: {
  formData: Partial<PaymentMethod>
  setFormData: (data: Partial<PaymentMethod>) => void
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Carte bancaire"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
          <select
            value={formData.method_type || 'card'}
            onChange={(e) => {
              const newType = e.target.value as any
              setFormData({ 
                ...formData, 
                method_type: newType,
                // Reset settings when changing type
                settings: newType === 'stripe' ? (formData.settings || {}) : {}
              })
            }}
            className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="card">Carte bancaire</option>
            <option value="bank_transfer">Virement bancaire</option>
            <option value="paypal">PayPal</option>
            <option value="stripe">Stripe (Carte bancaire via Stripe)</option>
            <option value="check">Chèque</option>
            <option value="cash">Espèces</option>
            <option value="other">Autre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icône (emoji)</label>
          <input
            type="text"
            value={formData.icon || ''}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="💳"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ordre d&apos;affichage</label>
          <input
            type="number"
            value={formData.order || 0}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Description du mode de paiement..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active || false}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Actif</span>
          </label>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_enabled || false}
              onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Disponible</span>
          </label>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.requires_validation || false}
              onChange={(e) => setFormData({ ...formData, requires_validation: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Validation requise</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Commission (%)</label>
          <input
            type="number"
            step="0.01"
            value={formData.fee_percentage || 0}
            onChange={(e) => setFormData({ ...formData, fee_percentage: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Commission fixe (€)</label>
          <input
            type="number"
            step="0.01"
            value={formData.fee_fixed || 0}
            onChange={(e) => setFormData({ ...formData, fee_fixed: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Montant minimum (€)</label>
          <input
            type="number"
            step="0.01"
            value={formData.min_amount || ''}
            onChange={(e) => setFormData({ ...formData, min_amount: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Montant maximum (€)</label>
          <input
            type="number"
            step="0.01"
            value={formData.max_amount || ''}
            onChange={(e) => setFormData({ ...formData, max_amount: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900"
        >
          Annuler
        </button>
        <button
          onClick={onSave}
          disabled={!formData.name}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Enregistrer
        </button>
      </div>
    </div>
  )
}

