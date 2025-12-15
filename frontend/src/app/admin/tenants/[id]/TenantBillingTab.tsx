'use client'

import { useEffect, useState } from 'react'
import billingService, { Subscription, Invoice, Payment, PricingPlan } from '@/services/billing.service'
import ResponsiveTable from '@/components/shared/ResponsiveTable'
import toast from 'react-hot-toast'

interface TenantBillingTabProps {
  tenantId: number
  tenantName: string
}

type BillingSubTab = 'subscriptions' | 'invoices' | 'payments'

export default function TenantBillingTab({ tenantId, tenantName }: TenantBillingTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<BillingSubTab>('subscriptions')
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewSubscriptionModal, setShowNewSubscriptionModal] = useState(false)
  const [newSubscriptionData, setNewSubscriptionData] = useState({
    plan_id: '',
    billing_cycle: 'monthly' as 'monthly' | 'yearly',
    start_trial: false,
  })

  useEffect(() => {
    loadBillingData()
  }, [tenantId])

  const loadBillingData = async () => {
    try {
      setLoading(true)
      const [subs, invs, pays, plans] = await Promise.all([
        billingService.getSubscriptions(),
        billingService.getInvoices(),
        billingService.getPayments(),
        billingService.getPricingPlans(),
      ])
      
      // Filtrer par tenant
      setSubscriptions(subs.filter((sub: Subscription) => sub.tenant?.id === tenantId))
      setInvoices(invs.filter((inv: Invoice) => inv.tenant?.id === tenantId))
      setPayments(pays.filter((pay: Payment) => pay.tenant?.id === tenantId))
      setPricingPlans(Array.isArray(plans) ? plans : [])
    } catch (error) {
      console.error('Error chargement facturation:', error)
      toast.error('Error lors du chargement des données de facturation')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubscription = async () => {
    if (!newSubscriptionData.plan_id) {
      toast.error('Veuillez sélectionner un plan')
      return
    }

    try {
      await billingService.createSubscription({
        tenant: { id: tenantId } as any,
        plan: { id: parseInt(newSubscriptionData.plan_id) } as any,
        billing_cycle: newSubscriptionData.billing_cycle,
        status: newSubscriptionData.start_trial ? 'trial' : 'active',
      } as any)
      toast.success('Abonnement créé avec succès !')
      setShowNewSubscriptionModal(false)
      setNewSubscriptionData({ plan_id: '', billing_cycle: 'monthly', start_trial: false })
      loadBillingData()
    } catch (error: any) {
      console.error('Error création abonnement:', error)
      toast.error(error.response?.data?.error || error.response?.data?.detail || 'Error lors de la création de l\'abonnement')
    }
  }

  const handleCancelSubscription = async (subscriptionId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cet abonnement ?')) {
      return
    }

    try {
      await billingService.cancelSubscription(subscriptionId)
      toast.success('Abonnement annulé avec succès !')
      loadBillingData()
    } catch (error: any) {
      console.error('Error annulation abonnement:', error)
      toast.error(error.response?.data?.error || 'Error lors de l\'annulation')
    }
  }

  const handleReactivateSubscription = async (subscriptionId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir réactiver cet abonnement ?')) {
      return
    }

    try {
      await billingService.reactivateSubscription(subscriptionId)
      toast.success('Abonnement réactivé avec succès !')
      loadBillingData()
    } catch (error: any) {
      console.error('Error réactivation abonnement:', error)
      toast.error(error.response?.data?.error || 'Error lors de la réactivation')
    }
  }

  const handleMarkInvoicePaid = async (invoiceId: number) => {
    if (!confirm('Marquer cette facture comme payée ?')) {
      return
    }

    try {
      await billingService.markInvoicePaid(invoiceId)
      toast.success('Facture marquée comme payée !')
      loadBillingData()
    } catch (error: any) {
      console.error('Error marquage facture:', error)
      toast.error(error.response?.data?.error || 'Error lors du marquage')
    }
  }

  const formatPrice = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount)
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '-'
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch (error) {
      return '-'
    }
  }

  const getStatusBadge = (status: string, type: 'subscription' | 'invoice' | 'payment') => {
    const statusColors: { [key: string]: string } = {
      // Subscription
      active: 'bg-green-100 text-green-800',
      trial: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      past_due: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-gray-100 dark:bg-gray-900 text-gray-800',
      // Invoice
      paid: 'bg-green-100 text-green-800',
      open: 'bg-yellow-100 text-yellow-800',
      draft: 'bg-gray-100 dark:bg-gray-900 text-gray-800',
      void: 'bg-red-100 text-red-800',
      uncollectible: 'bg-red-100 text-red-800',
      // Payment
      succeeded: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800',
    }
    return statusColors[status] || 'bg-gray-100 dark:bg-gray-900 text-gray-800'
  }

  const subTabs = [
    { id: 'subscriptions' as BillingSubTab, name: 'Abonnements', icon: '📋', count: subscriptions.length },
    { id: 'invoices' as BillingSubTab, name: 'Factures', icon: '🧾', count: invoices.length },
    { id: 'payments' as BillingSubTab, name: 'Paiements', icon: '💳', count: payments.length },
  ]

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement des données de facturation...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      {/* Sub-tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`${
                activeSubTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Subscriptions Tab */}
      {activeSubTab === 'subscriptions' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold">Abonnement</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {subscriptions.length > 0 
                  ? `Un tenant ne peut avoir qu'un seul abonnement actif à la fois`
                  : `Gérez l'abonnement de ${tenantName}`
                }
              </p>
            </div>
            {/* Ne montrer le bouton que s'il n'y a pas d'abonnement actif */}
            {subscriptions.length === 0 || !subscriptions.some((sub: Subscription) => sub.status === 'active' || sub.status === 'trial') ? (
              <button
                onClick={() => setShowNewSubscriptionModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {subscriptions.length > 0 ? 'Réactiver l\'abonnement' : '+ Créer un abonnement'}
              </button>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Un abonnement actif existe déjà
              </div>
            )}
          </div>

          {subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Aucun abonnement trouvé pour ce tenant</p>
              <button
                onClick={() => setShowNewSubscriptionModal(true)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Créer un abonnement →
              </button>
            </div>
          ) : (
            <ResponsiveTable
              headers={['Plan', 'Statut', 'Cycle', 'Période', 'Créé le', 'Actions']}
              emptyMessage="Aucun abonnement"
            >
              {subscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50 dark:bg-gray-900">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {subscription.plan?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {subscription.plan && formatPrice(subscription.plan.price_monthly)}/mois
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(subscription.status, 'subscription')}`}>
                      {subscription.status === 'trial' ? 'Essai' : 
                       subscription.status === 'active' ? 'Actif' :
                       subscription.status === 'cancelled' ? 'Annulé' :
                       subscription.status === 'past_due' ? 'En retard' :
                       subscription.status === 'expired' ? 'Expiré' : subscription.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {subscription.billing_cycle === 'monthly' ? 'Mensuel' : 'Annuel'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div>Du {formatDate(subscription.current_period_start)}</div>
                    <div>Au {formatDate(subscription.current_period_end)}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(subscription.current_period_start)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {subscription.status === 'active' && (
                        <button
                          onClick={() => handleCancelSubscription(subscription.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Annuler l'abonnement"
                        >
                          Annuler
                        </button>
                      )}
                      {subscription.status === 'cancelled' && (
                        <button
                          onClick={() => handleReactivateSubscription(subscription.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Réactiver l'abonnement"
                        >
                          Réactiver
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </ResponsiveTable>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeSubTab === 'invoices' && (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Factures</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Toutes les factures de {tenantName}</p>
          </div>

          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Aucune facture trouvée pour ce tenant</p>
            </div>
          ) : (
            <ResponsiveTable
              headers={['N° Facture', 'Abonnement', 'Montant', 'Statut', 'Émission', 'Échéance', 'Actions']}
              emptyMessage="Aucune facture"
            >
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:bg-gray-900">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 font-mono">
                      {invoice.invoice_number}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {invoice.subscription?.plan?.name || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatPrice(invoice.total, invoice.currency)}
                    </div>
                    {invoice.tax > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        HT: {formatPrice(invoice.subtotal, invoice.currency)} + TVA: {formatPrice(invoice.tax, invoice.currency)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(invoice.status, 'invoice')}`}>
                      {invoice.status === 'paid' ? 'Payée' :
                       invoice.status === 'open' ? 'Ouverte' :
                       invoice.status === 'draft' ? 'Brouillon' :
                       invoice.status === 'void' ? 'Annulée' :
                       invoice.status === 'uncollectible' ? 'Impayable' : invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(invoice.issue_date)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(invoice.due_date)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => {
                          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9495'
                          const token = localStorage.getItem('token')
                          const url = `${apiUrl}/api/invoices/${invoice.id}/download_pdf/`
                          window.open(url, '_blank')
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                        title="Voir en HTML"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const blob = await billingService.downloadInvoicePdf(invoice.id)
                            const url = window.URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `facture-${invoice.invoice_number}.html`
                            document.body.appendChild(a)
                            a.click()
                            window.URL.revokeObjectURL(url)
                            document.body.removeChild(a)
                            toast.success('Facture téléchargée')
                          } catch (error: any) {
                            toast.error('Error lors du téléchargement')
                          }
                        }}
                        className="text-purple-600 hover:text-purple-900 dark:text-purple-400"
                        title="Télécharger PDF/HTML"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      {invoice.status !== 'paid' && invoice.status !== 'void' && (
                        <button
                          onClick={() => handleMarkInvoicePaid(invoice.id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400"
                          title="Marquer comme payée"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </ResponsiveTable>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeSubTab === 'payments' && (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Paiements</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Historique des paiements de {tenantName}</p>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Aucun paiement trouvé pour ce tenant</p>
            </div>
          ) : (
            <ResponsiveTable
              headers={['Montant', 'Méthode', 'Statut', 'Facture', 'Date', 'Référence']}
              emptyMessage="Aucun paiement"
            >
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 dark:bg-gray-900">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatPrice(payment.amount, payment.currency)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {payment.method === 'card' ? 'Carte bancaire' :
                     payment.method === 'bank_transfer' ? 'Virement' :
                     payment.method === 'paypal' ? 'PayPal' :
                     payment.method === 'other' ? 'Autre' : payment.method}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(payment.status, 'payment')}`}>
                      {payment.status === 'succeeded' ? 'Réussi' :
                       payment.status === 'pending' ? 'En attente' :
                       payment.status === 'processing' ? 'En cours' :
                       payment.status === 'failed' ? 'Échoué' :
                       payment.status === 'refunded' ? 'Remboursé' : payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {payment.invoice?.invoice_number || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {payment.paid_at ? formatDate(payment.paid_at) : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono text-xs">
                    {payment.stripe_payment_intent_id || '-'}
                  </td>
                </tr>
              ))}
            </ResponsiveTable>
          )}
        </div>
      )}

      {/* New Subscription Modal */}
      {showNewSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Créer un nouvel abonnement</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plan tarifaire *
                </label>
                <select
                  value={newSubscriptionData.plan_id}
                  onChange={(e) => setNewSubscriptionData({ ...newSubscriptionData, plan_id: e.target.value })}
                  className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un plan</option>
                  {pricingPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {formatPrice(plan.price_monthly)}/mois
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cycle de facturation
                </label>
                <select
                  value={newSubscriptionData.billing_cycle}
                  onChange={(e) => setNewSubscriptionData({ ...newSubscriptionData, billing_cycle: e.target.value as 'monthly' | 'yearly' })}
                  className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="monthly">Mensuel</option>
                  <option value="yearly">Annuel</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="start_trial"
                  checked={newSubscriptionData.start_trial}
                  onChange={(e) => setNewSubscriptionData({ ...newSubscriptionData, start_trial: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded"
                />
                <label htmlFor="start_trial" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Démarrer en période d'essai
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNewSubscriptionModal(false)
                  setNewSubscriptionData({ plan_id: '', billing_cycle: 'monthly', start_trial: false })
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateSubscription}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Créer l'abonnement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

