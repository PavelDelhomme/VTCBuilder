'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/admin/AdminLayout'
import billingService, { Subscription, Invoice, Payment } from '@/services/billing.service'
import ResponsiveTable from '@/components/shared/ResponsiveTable'
import toast from 'react-hot-toast'

export default function SubscriptionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const subscriptionId = params?.id ? parseInt(params.id as string) : null
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    if (!authService.isSuperAdmin()) {
      router.push('/admin/dashboard')
      return
    }
    if (subscriptionId) {
      loadSubscriptionDetails()
    }
  }, [subscriptionId, router])

  const loadSubscriptionDetails = async () => {
    if (!subscriptionId) return
    try {
      const data = await billingService.getSubscriptionDetails(subscriptionId)
      setSubscription(data.subscription)
      setInvoices(data.invoices || [])
      setPayments(data.payments || [])
      setSummary(data.summary || {})
    } catch (error: any) {
      console.error('Erreur chargement détails abonnement:', error)
      toast.error('Erreur lors du chargement des détails')
      router.push('/admin/billing')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkInvoicePaid = async (id: number) => {
    if (!confirm('Marquer cette facture comme payée ?')) return
    
    try {
      await billingService.markInvoicePaid(id)
      toast.success('Facture marquée comme payée')
      loadSubscriptionDetails()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur')
    }
  }

  const handleSendReminder = async (id: number) => {
    try {
      await billingService.sendInvoiceReminder(id)
      toast.success('Email de relance envoyé')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi de la relance')
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
      failed: 'bg-red-100 text-red-800',
    }
    return badges[status as keyof typeof badges] || 'bg-gray-100 dark:bg-gray-900 text-gray-800'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount)
  }

  if (loading) {
    return (
      <AdminLayout title="Détails de l'Abonnement">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!subscription) {
    return (
      <AdminLayout title="Détails de l'Abonnement">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">Abonnement introuvable.</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout 
      title={`Abonnement - ${subscription.tenant?.name || 'N/A'}`}
      subtitle="Détails complets de l'abonnement, factures et paiements"
    >
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100 flex items-center"
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>

        {/* Subscription Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Informations de l'Abonnement</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tenant Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tenant</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{subscription.tenant?.name || '-'}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{subscription.tenant?.email || '-'}</p>
              <button
                onClick={() => router.push(`/admin/tenants/${subscription.tenant?.id}`)}
                className="text-blue-600 hover:text-blue-800 text-sm mt-2"
              >
                Voir le tenant →
              </button>
            </div>

            {/* Plan Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Plan & Niveau de Service</h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{subscription.plan?.name || '-'}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{subscription.plan?.description || '-'}</p>
              <div className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                <p>• {subscription.plan?.max_sites || 0} site{subscription.plan?.max_sites !== 1 ? 's' : ''}</p>
                <p>• {subscription.plan?.max_users || 0} utilisateur{subscription.plan?.max_users !== 1 ? 's' : ''}</p>
                <p>• {subscription.plan?.max_storage_gb || 0} Go de stockage</p>
              </div>
            </div>

            {/* Status & Cycle */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Statut & Cycle</h3>
              <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full mb-2 ${getStatusBadge(subscription.status)}`}>
                {subscription.status === 'active' ? 'Actif' : 
                 subscription.status === 'trial' ? 'En trial' : 
                 subscription.status === 'past_due' ? 'En retard' : 
                 subscription.status === 'cancelled' ? 'Annulé' : 
                 subscription.status}
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Facturation: {subscription.billing_cycle === 'monthly' ? 'Mensuelle' : 'Annuelle'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Prix: {subscription.billing_cycle === 'monthly' 
                  ? formatCurrency(subscription.plan?.price_monthly || 0) + '/mois'
                  : formatCurrency(subscription.plan?.price_yearly || subscription.plan?.price_monthly * 12 || 0) + '/an'}
              </p>
            </div>

            {/* Period Dates */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Période Actuelle</h3>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                Du {new Date(subscription.current_period_start).toLocaleDateString('fr-FR')}
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                Au {new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}
              </p>
              {subscription.trial_start && subscription.trial_end && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Trial:</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(subscription.trial_start).toLocaleDateString('fr-FR')} - {new Date(subscription.trial_end).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>

            {/* Financial Summary */}
            {summary && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Résumé Financier</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total facturé:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(summary.total_invoiced || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total payé:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(summary.total_paid || 0)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-600 dark:text-gray-400">Impayé:</span>
                    <span className="font-semibold text-red-600">{formatCurrency(summary.unpaid_amount || 0)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Invoices & Payments Count */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Factures & Paiements</h3>
              <div className="space-y-1 text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">{summary?.invoices_count || 0}</span> facture{summary?.invoices_count !== 1 ? 's' : ''}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-green-600">{summary?.paid_invoices_count || 0}</span> payée{summary?.paid_invoices_count !== 1 ? 's' : ''}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-red-600">{summary?.unpaid_invoices_count || 0}</span> impayée{summary?.unpaid_invoices_count !== 1 ? 's' : ''}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  <span className="font-semibold">{payments.length}</span> paiement{payments.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-3">
            {subscription.status === 'past_due' && (
              <button
                onClick={async () => {
                  try {
                    await billingService.activateSubscription(subscription.id)
                    toast.success('Abonnement réactivé')
                    loadSubscriptionDetails()
                  } catch (error: any) {
                    toast.error(error.response?.data?.error || 'Erreur')
                  }
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Réactiver l'abonnement
              </button>
            )}
            <button
              onClick={async () => {
                try {
                  await billingService.generateInvoice(subscription.id)
                  toast.success('Facture générée')
                  loadSubscriptionDetails()
                } catch (error: any) {
                  toast.error(error.response?.data?.error || 'Erreur lors de la génération')
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Générer une facture
            </button>
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Factures ({invoices.length})</h2>
          </div>
          <ResponsiveTable
            headers={['N° Facture', 'Date', 'Montant', 'Statut', 'Échéance', 'Actions']}
            emptyMessage="Aucune facture"
          >
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  Aucune facture pour cet abonnement
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => {
                const dueDate = new Date(invoice.due_date)
                const now = new Date()
                const isOverdue = invoice.status !== 'paid' && dueDate < now
                
                return (
                  <tr key={invoice.id} className={isOverdue ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(invoice.status)}`}>
                        {invoice.status === 'paid' ? 'Payée' : 
                         invoice.status === 'open' ? 'En attente' : 
                         invoice.status === 'draft' ? 'Brouillon' : invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {dueDate.toLocaleDateString('fr-FR')}
                      {isOverdue && (
                        <span className="block text-xs text-red-600 font-medium">
                          {Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))} jour{Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) > 1 ? 's' : ''} de retard
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end space-x-2">
                        {invoice.status !== 'paid' && (
                          <>
                            <button
                              onClick={() => handleSendReminder(invoice.id)}
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
                          </>
                        )}
                        <button
                          onClick={async () => {
                            try {
                              const blob = await billingService.downloadInvoicePdf(invoice.id)
                              const url = window.URL.createObjectURL(blob)
                              const newWindow = window.open(url, '_blank')
                              if (newWindow) {
                                newWindow.onload = () => {
                                  window.URL.revokeObjectURL(url)
                                }
                              } else {
                                toast.error('Impossible d\'ouvrir la fenêtre. Veuillez autoriser les pop-ups.')
                                window.URL.revokeObjectURL(url)
                              }
                              toast.success('Facture ouverte')
                            } catch (error: any) {
                              toast.error('Erreur lors de l\'ouverture de la facture')
                            }
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Télécharger/Imprimer"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </ResponsiveTable>
        </div>

        {/* Payments */}
        {payments.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Paiements ({payments.length})</h2>
            </div>
            <ResponsiveTable
              headers={['Date', 'Montant', 'Méthode', 'Statut', 'Facture']}
              emptyMessage="Aucun paiement"
            >
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 dark:bg-gray-900">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(payment.amount)} {payment.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {payment.method === 'card' ? 'Carte bancaire' : 
                     payment.method === 'bank_transfer' ? 'Virement' : 
                     payment.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(payment.status)}`}>
                      {payment.status === 'succeeded' ? 'Réussi' : 
                       payment.status === 'pending' ? 'En attente' : 
                       payment.status === 'failed' ? 'Échoué' : payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {payment.invoice?.invoice_number || '-'}
                  </td>
                </tr>
              ))}
            </ResponsiveTable>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

