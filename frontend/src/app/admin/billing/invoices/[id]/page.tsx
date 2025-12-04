'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import billingService, { Invoice } from '@/services/billing.service'
import PageLoader from '@/components/shared/PageLoader'
import toast from 'react-hot-toast'
import api from '@/lib/api'

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params?.id as string
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (invoiceId) {
      loadInvoice()
    }
  }, [invoiceId])

  const loadInvoice = async () => {
    try {
      setLoading(true)
      const data = await billingService.getInvoice(parseInt(invoiceId))
      setInvoice(data)
    } catch (error: any) {
      console.error('Erreur chargement facture:', error)
      toast.error('Erreur lors du chargement de la facture')
      router.push('/admin/billing')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!invoice) return
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9495'
      const token = localStorage.getItem('token')
      const url = `${apiUrl}/api/invoices/${invoice.id}/download_pdf/`
      
      // Créer un lien temporaire avec le token
      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      
      // Ajouter le token dans les headers via fetch puis ouvrir le blob
      const response = await fetch(url, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement')
      }
      
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const newWindow = window.open(blobUrl, '_blank')
      
      if (newWindow) {
        newWindow.onload = () => {
          window.URL.revokeObjectURL(blobUrl)
        }
      } else {
        toast.error('Impossible d\'ouvrir la fenêtre. Veuillez autoriser les pop-ups.')
        window.URL.revokeObjectURL(blobUrl)
      }
      
      toast.success('Facture ouverte')
    } catch (error: any) {
      console.error('Erreur téléchargement PDF:', error)
      toast.error('Erreur lors du téléchargement de la facture')
    }
  }

  const formatPrice = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: currency 
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      paid: { label: 'Payée', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      unpaid: { label: 'Impayée', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      overdue: { label: 'En retard', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
      cancelled: { label: 'Annulée', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
    }
    return badges[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
  }

  if (loading) {
    return (
      <AdminLayout title="Facture" subtitle="Chargement...">
        <PageLoader />
      </AdminLayout>
    )
  }

  if (!invoice) {
    return (
      <AdminLayout title="Facture" subtitle="Facture non trouvée">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Facture non trouvée</p>
          <button
            onClick={() => router.push('/admin/billing')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour à la facturation
          </button>
        </div>
      </AdminLayout>
    )
  }

  const statusBadge = getStatusBadge(invoice.status)

  return (
    <AdminLayout
      title={`Facture ${invoice.invoice_number}`}
      subtitle="Détails de la facture"
      headerActions={
        <div className="flex gap-2">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Télécharger/Imprimer
          </button>
          <button
            onClick={() => router.push('/admin/billing')}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Retour
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* En-tête de la facture */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">FACTURE</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">VTCBuilder</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                N° {invoice.invoice_number}
              </p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusBadge.className}`}>
                {statusBadge.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations client */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Informations Client
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Nom:</span>{' '}
                  <span className="text-gray-900 dark:text-gray-100">{invoice.tenant?.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>{' '}
                  <span className="text-gray-900 dark:text-gray-100">{invoice.tenant?.email || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Détails de la facture */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Détails de la facture
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Date d'émission:</span>{' '}
                  <span className="text-gray-900 dark:text-gray-100">{formatDate(invoice.issue_date)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Date d'échéance:</span>{' '}
                  <span className="text-gray-900 dark:text-gray-100">{formatDate(invoice.due_date)}</span>
                </div>
                {invoice.paid_at && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Date de paiement:</span>{' '}
                    <span className="text-gray-900 dark:text-gray-100">{formatDate(invoice.paid_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des lignes de facture */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sous-total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    TVA
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {invoice.subscription?.plan?.name || 'Abonnement'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                    {formatPrice(invoice.subtotal, invoice.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                    {formatPrice(invoice.tax, invoice.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                    {formatPrice(invoice.total, invoice.currency)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                    TOTAL TTC:
                  </td>
                  <td className="px-6 py-4 text-right text-lg font-bold text-gray-900 dark:text-gray-100">
                    {formatPrice(invoice.total, invoice.currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Footer de la facture */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Merci de votre confiance !
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Pour toute question concernant cette facture, contactez-nous à{' '}
            <a href="mailto:support@vtcbuilder.com" className="text-blue-600 dark:text-blue-400 hover:underline">
              support@vtcbuilder.com
            </a>
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}

