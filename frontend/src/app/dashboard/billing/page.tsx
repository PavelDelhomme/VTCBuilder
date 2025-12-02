'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import TenantLayout from '@/components/tenant/TenantLayout'
import billingService, { Subscription, Invoice, Payment, PricingPlan } from '@/services/billing.service'
import stripeService from '@/services/stripe.service'
import ResponsiveTable from '@/components/shared/ResponsiveTable'
import StripeCheckout from '@/components/payment/StripeCheckout'
import toast from 'react-hot-toast'

export default function TenantBillingPage() {
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'subscription' | 'invoices' | 'payments' | 'plans'>('subscription')
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutPlanId, setCheckoutPlanId] = useState<number | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    const currentUser = authService.getStoredUser()
    if (!currentUser || authService.isSuperAdmin()) {
      router.push('/admin/dashboard')
      return
    }
    loadBillingData()
  }, [router])

  const loadBillingData = async () => {
    try {
      const [subs, invs, pays, plans] = await Promise.all([
        billingService.getSubscriptions(),
        billingService.getInvoices(),
        billingService.getPayments(),
        billingService.getPricingPlans(),
      ])
      
      setSubscription(subs[0] || null)
      setInvoices(invs)
      setPayments(pays)
      setPricingPlans(plans)
    } catch (error) {
      console.error('Erreur chargement facturation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgradePlan = async (planId: number) => {
    if (!confirm('Voulez-vous vraiment changer de plan ?')) return
    
    try {
      const selectedPlan = pricingPlans.find(p => p.id === planId)
      if (!selectedPlan) {
        toast.error('Plan non trouvé')
        return
      }

      // If subscription exists and has Stripe, use Stripe checkout
      if (subscription && subscription.stripe_customer_id) {
        try {
          // Create payment intent for the plan
          const amount = selectedPlan.price_monthly * 100 // Convert to cents
          const result = await stripeService.createPaymentIntent(subscription.id, amount)
          setClientSecret(result.client_secret)
          setCheckoutPlanId(planId)
          setShowCheckout(true)
          return
        } catch (error: any) {
          console.error('Erreur création payment intent:', error)
          // Fallback to direct subscription update
        }
      }

      // Direct subscription creation/update
      // Note: createSubscription will update if subscription already exists
      await billingService.createSubscription({
        plan: { id: planId } as any,
        // tenant_id not needed - backend uses user's tenant automatically
      } as any)
      loadBillingData()
      toast.success('Plan mis à jour avec succès !')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour du plan')
    }
  }

  const handleCheckoutSuccess = async () => {
    if (checkoutPlanId) {
      try {
        // Note: createSubscription will update if subscription already exists
        await billingService.createSubscription({
          plan: { id: checkoutPlanId } as any,
          // tenant_id not needed - backend uses user's tenant automatically
        } as any)
        loadBillingData()
        toast.success('Plan mis à jour avec succès !')
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour')
      }
    }
    setShowCheckout(false)
    setClientSecret(null)
    setCheckoutPlanId(null)
  }

  const handleCheckoutError = (error: string) => {
    toast.error(error)
    setShowCheckout(false)
    setClientSecret(null)
    setCheckoutPlanId(null)
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return
    
    if (!confirm('Êtes-vous sûr de vouloir annuler votre abonnement ?')) return
    
    try {
      await billingService.cancelSubscription(subscription.id)
      loadBillingData()
      toast.success('Abonnement annulé')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'annulation')
    }
  }

  const handleGenerateInvoice = async () => {
    if (!subscription) {
      toast.error('Vous devez avoir un abonnement actif pour générer une facture')
      return
    }
    
    try {
      const result = await billingService.generateInvoice(subscription.id)
      toast.success('Facture générée avec succès !')
      loadBillingData()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la génération de la facture')
    }
  }

  const handleViewInvoice = (invoice: Invoice) => {
    // Open invoice detail modal or page
    window.open(`/dashboard/billing/invoices/${invoice.id}`, '_blank')
  }

  const handleDownloadInvoice = async (invoiceId: number) => {
    try {
      // Open invoice detail page in new tab for viewing/printing
      router.push(`/dashboard/billing/invoices/${invoiceId}`)
    } catch (error: any) {
      toast.error('Erreur lors de l\'ouverture de la facture')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      trial: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      past_due: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-gray-100 dark:bg-gray-900 text-gray-800',
    }
    return badges[status as keyof typeof badges] || 'bg-gray-100 dark:bg-gray-900 text-gray-800'
  }

  const getInvoiceStatusBadge = (status: string) => {
    const badges = {
      paid: 'bg-green-100 text-green-800',
      open: 'bg-yellow-100 text-yellow-800',
      draft: 'bg-gray-100 dark:bg-gray-900 text-gray-800',
      void: 'bg-red-100 text-red-800',
    }
    return badges[status as keyof typeof badges] || 'bg-gray-100 dark:bg-gray-900 text-gray-800'
  }

  if (loading) {
    return (
      <TenantLayout title="Facturation">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        </div>
      </TenantLayout>
    )
  }

  return (
    <TenantLayout 
      title="Facturation" 
      subtitle="Gérez votre abonnement et vos paiements"
    >
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('subscription')}
            className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'subscription'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            Mon Abonnement
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
            onClick={() => setActiveTab('plans')}
            className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'plans'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            Plans Disponibles
          </button>
        </nav>
      </div>

      {/* Subscription Tab */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          {subscription ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{subscription.plan.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subscription.plan.description}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(subscription.status)}`}>
                  {subscription.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Prix</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {subscription.billing_cycle === 'monthly' 
                      ? `${subscription.plan.price_monthly}€/mois`
                      : `${subscription.plan.price_yearly}€/an`
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Période actuelle</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {new Date(subscription.current_period_start).toLocaleDateString('fr-FR')} - {new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cycle de facturation</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
                    {subscription.billing_cycle === 'monthly' ? 'Mensuel' : 'Annuel'}
                  </p>
                </div>
              </div>

              {subscription.status === 'active' && (
                <div className="mt-6">
                  <button
                    onClick={handleCancelSubscription}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Annuler l'abonnement
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800 mb-4">Vous n'avez pas d'abonnement actif.</p>
              <button
                onClick={() => setActiveTab('plans')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Choisir un plan
              </button>
            </div>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Mes Factures</h2>
            {subscription && subscription.status === 'active' && (
              <button
                onClick={handleGenerateInvoice}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Générer une facture
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <ResponsiveTable
              headers={['N° Facture', 'Date d\'émission', 'Date d\'échéance', 'Montant', 'Statut', 'Actions']}
              emptyMessage="Aucune facture pour le moment"
            >
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Aucune facture pour le moment
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {invoice.total.toFixed(2)} {invoice.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getInvoiceStatusBadge(invoice.status)}`}>
                        {invoice.status === 'paid' ? 'Payée' : invoice.status === 'open' ? 'En attente' : invoice.status === 'draft' ? 'Brouillon' : invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end items-center space-x-2">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                          title="Voir la facture"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50"
                          title="Télécharger PDF"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </ResponsiveTable>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <ResponsiveTable
            headers={['Date', 'Montant', 'Méthode', 'Statut']}
            emptyMessage="Aucun paiement pour le moment"
          >
            {payments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  Aucun paiement pour le moment
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 dark:bg-gray-900">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {payment.amount} {payment.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {payment.method === 'card' ? 'Carte bancaire' : payment.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(payment.status)}`}>
                      {payment.status === 'succeeded' ? 'Réussi' : payment.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </ResponsiveTable>
        </div>
      )}

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${
                plan.is_featured ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.is_featured && (
                <div className="text-center mb-4">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Populaire
                  </span>
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{plan.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">{plan.price_monthly}€</span>
                <span className="text-gray-600 dark:text-gray-400">/mois</span>
                {plan.price_yearly && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    ou {plan.price_yearly}€/an (économisez {((plan.price_monthly * 12) - plan.price_yearly).toFixed(2)}€)
                  </p>
                )}
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features && plan.features.length > 0 ? (
                  plan.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {plan.max_sites} site{plan.max_sites > 1 ? 's' : ''}
                    </li>
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {plan.max_users} utilisateur{plan.max_users > 1 ? 's' : ''}
                    </li>
                    <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {plan.max_storage_gb} Go de stockage
                    </li>
                  </>
                )}
              </ul>

              <button
                onClick={() => handleUpgradePlan(plan.id)}
                className={`w-full py-2 px-4 rounded-lg font-medium transition ${
                  plan.is_featured
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:bg-gray-200'
                }`}
              >
                {subscription?.plan.id === plan.id ? 'Plan actuel' : 'Choisir ce plan'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stripe Checkout Modal */}
      {showCheckout && clientSecret && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Paiement</h2>
              <button
                onClick={() => {
                  setShowCheckout(false)
                  setClientSecret(null)
                  setCheckoutPlanId(null)
                }}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <StripeCheckout
              clientSecret={clientSecret}
              onSuccess={handleCheckoutSuccess}
              onError={handleCheckoutError}
            />
          </div>
        </div>
      )}
    </TenantLayout>
  )
}

