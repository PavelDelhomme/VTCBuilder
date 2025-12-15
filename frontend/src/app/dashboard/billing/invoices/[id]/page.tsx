'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import authService from '@/services/auth.service'
import TenantLayout from '@/components/tenant/TenantLayout'
import billingService, { Invoice } from '@/services/billing.service'
import toast from 'react-hot-toast'

export default function InvoiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const invoiceId = params?.id ? parseInt(params.id as string) : null
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = authService.getStoredUser()
    if (!currentUser || authService.isSuperAdmin()) {
      router.push('/admin/dashboard')
      return
    }
    if (invoiceId) {
      loadInvoice()
    }
  }, [invoiceId, router])

  const loadInvoice = async () => {
    if (!invoiceId) return
    try {
      const data = await billingService.getInvoice(invoiceId)
      setInvoice(data)
    } catch (error: any) {
      console.error('Error chargement facture:', error)
      toast.error('Error lors du chargement de la facture')
      router.push('/dashboard/billing')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!invoiceId) return
    try {
      const blob = await billingService.downloadInvoicePdf(invoiceId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `facture-${invoice?.invoice_number || invoiceId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Facture téléchargée avec succès')
    } catch (error: any) {
      toast.error('Error lors du téléchargement')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <TenantLayout title="Facture">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        </div>
      </TenantLayout>
    )
  }

  if (!invoice) {
    return (
      <TenantLayout title="Facture">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Facture introuvable</p>
        </div>
      </TenantLayout>
    )
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      paid: 'Payée',
      open: 'En attente',
      draft: 'Brouillon',
      void: 'Annulée',
      uncollectible: 'Impayée',
    }
    return labels[status] || status
  }

  return (
    <TenantLayout title={`Facture ${invoice.invoice_number}`}>
      <div className="space-y-6">
        {/* Actions */}
        <div className="flex justify-between items-center print:hidden">
          <button
            onClick={() => router.back()}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100 flex items-center"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="bg-white dark:bg-gray-800 border border-gray-300 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:bg-gray-900 flex items-center"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimer
            </button>
            <button
              onClick={handleDownload}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Télécharger PDF
            </button>
          </div>
        </div>

        {/* Invoice */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-8 border-b">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">FACTURE</h1>
              <p className="text-gray-600 dark:text-gray-400">VTCBuilder</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">N° {invoice.invoice_number}</p>
              <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
                invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                invoice.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 dark:bg-gray-900 text-gray-800'
              }`}>
                {getStatusLabel(invoice.status)}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-4">Informations Client</h2>
              <div className="space-y-2 text-gray-900 dark:text-gray-100">
                <p className="font-semibold">{invoice.tenant?.name || 'Client'}</p>
                <p className="text-sm">{invoice.tenant?.email || ''}</p>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-4">Détails de la facture</h2>
              <div className="space-y-2 text-sm text-gray-900 dark:text-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Date d'émission:</span>
                  <span className="font-medium">{new Date(invoice.issue_date).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Date d'échéance:</span>
                  <span className="font-medium">{new Date(invoice.due_date).toLocaleDateString('fr-FR')}</span>
                </div>
                {invoice.paid_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Date de paiement:</span>
                    <span className="font-medium">{new Date(invoice.paid_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Description</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Sous-total</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">TVA</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-4 px-4 text-gray-900 dark:text-gray-100">
                    {invoice.subscription?.plan?.name || 'Abonnement'} - {invoice.subscription?.billing_cycle === 'monthly' ? 'Mensuel' : 'Annuel'}
                  </td>
                  <td className="py-4 px-4 text-right text-gray-900 dark:text-gray-100">{invoice.subtotal.toFixed(2)} {invoice.currency}</td>
                  <td className="py-4 px-4 text-right text-gray-900 dark:text-gray-100">{invoice.tax.toFixed(2)} {invoice.currency}</td>
                  <td className="py-4 px-4 text-right font-semibold text-gray-900 dark:text-gray-100">{invoice.total.toFixed(2)} {invoice.currency}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="py-4 px-4 text-right font-semibold text-gray-900 dark:text-gray-100">Total TTC:</td>
                  <td className="py-4 px-4 text-right text-xl font-bold text-gray-900 dark:text-gray-100">{invoice.total.toFixed(2)} {invoice.currency}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-gray-200 text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">Merci de votre confiance !</p>
            <p>Pour toute question concernant cette facture, contactez-nous à support@vtcbuilder.com</p>
          </div>
        </div>
      </div>
    </TenantLayout>
  )
}

