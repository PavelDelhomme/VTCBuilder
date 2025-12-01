'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import billingService, { Invoice } from '@/services/billing.service'
import tenantService, { Tenant } from '@/services/tenant.service'
import toast from 'react-hot-toast'

interface InvoicesTabProps {
  invoices: Invoice[]
  getStatusBadge: (status: string) => string
  onUpdate: () => void
}

export default function InvoicesTab({ invoices: initialInvoices, getStatusBadge, onUpdate }: InvoicesTabProps) {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>(initialInvoices)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(false)

  // Update invoices when prop changes
  useEffect(() => {
    setInvoices(initialInvoices)
  }, [initialInvoices])
  
  // Filters and sorting
  const [filters, setFilters] = useState({
    tenant_id: '',
    status: '',
    date_from: '',
    date_to: '',
  })
  const [sorting, setSorting] = useState({
    order_by: 'created_at',
    ordering: 'desc' as 'asc' | 'desc',
  })

  useEffect(() => {
    loadTenants()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, sorting, invoices])

  const loadTenants = async () => {
    try {
      const data = await tenantService.getAll()
      setTenants(Array.isArray(data) ? data : data.results || [])
    } catch (error) {
      console.error('Erreur chargement tenants:', error)
    }
  }

  const applyFilters = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (filters.tenant_id) params.tenant_id = filters.tenant_id
      if (filters.status) params.status = filters.status
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
      if (sorting.order_by) params.order_by = sorting.order_by
      if (sorting.ordering) params.ordering = sorting.ordering

      const filtered = await billingService.getInvoices(params)
      setFilteredInvoices(Array.isArray(filtered) ? filtered : filtered.results || [])
    } catch (error: any) {
      console.error('Erreur filtrage factures:', error)
      // Fallback to client-side filtering
      let filtered = [...invoices]
      
      if (filters.tenant_id) {
        filtered = filtered.filter(inv => inv.tenant?.id === parseInt(filters.tenant_id))
      }
      if (filters.status) {
        filtered = filtered.filter(inv => inv.status === filters.status)
      }
      if (filters.date_from) {
        const dateFrom = new Date(filters.date_from)
        filtered = filtered.filter(inv => new Date(inv.issue_date) >= dateFrom)
      }
      if (filters.date_to) {
        const dateTo = new Date(filters.date_to)
        dateTo.setHours(23, 59, 59, 999)
        filtered = filtered.filter(inv => new Date(inv.issue_date) <= dateTo)
      }
      
      setFilteredInvoices(filtered)
    } finally {
      setLoading(false)
    }
  }

  const handleViewInvoice = (invoice: Invoice) => {
    window.open(`/admin/billing/invoices/${invoice.id}`, '_blank')
  }

  const handleDownloadPDF = async (invoice: Invoice) => {
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
      console.error('Erreur téléchargement PDF:', error)
      toast.error('Erreur lors du téléchargement de la facture')
    }
  }

  const handleViewHTML = async (invoice: Invoice) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9495'
      const token = localStorage.getItem('token')
      const url = `${apiUrl}/api/invoices/${invoice.id}/download_pdf/`
      window.open(url, '_blank')
    } catch (error: any) {
      console.error('Erreur ouverture HTML:', error)
      toast.error('Erreur lors de l\'ouverture de la facture')
    }
  }

  const handleMarkPaid = async (invoice: Invoice) => {
    if (!confirm('Marquer cette facture comme payée ?')) return
    
    try {
      await billingService.markInvoicePaid(invoice.id)
      toast.success('Facture marquée comme payée')
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur')
    }
  }

  const handleSendReminder = async (invoice: Invoice) => {
    if (!confirm('Envoyer un rappel de paiement pour cette facture ?')) return
    
    try {
      await billingService.sendInvoiceReminder(invoice.id)
      toast.success('Rappel envoyé avec succès')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi du rappel')
    }
  }

  const formatPrice = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      paid: 'Payée',
      open: 'Ouverte',
      draft: 'Brouillon',
      void: 'Annulée',
      uncollectible: 'Impayable',
    }
    return labels[status] || status
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Filters */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Tenant Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tenant
            </label>
            <select
              value={filters.tenant_id}
              onChange={(e) => setFilters({ ...filters, tenant_id: e.target.value })}
              className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les tenants</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Statut
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="open">Ouverte</option>
              <option value="paid">Payée</option>
              <option value="void">Annulée</option>
              <option value="uncollectible">Impayable</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date de début
            </label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date de fin
            </label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Reset Filters */}
        {(filters.tenant_id || filters.status || filters.date_from || filters.date_to) && (
          <div className="mt-4">
            <button
              onClick={() => setFilters({ tenant_id: '', status: '', date_from: '', date_to: '' })}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-3 sm:-mx-4 lg:-mx-6 xl:-mx-8 px-3 sm:px-4 lg:px-6 xl:px-8">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-900 z-20 shadow-[2px_0_4px_rgba(0,0,0,0.1)] min-w-[120px]">
                  N° Facture
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px]">
                  Tenant
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell min-w-[100px]">
                  Date
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                  Montant
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                  Statut
                </th>
                <th className="px-3 sm:px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900 z-20 shadow-[-2px_0_4px_rgba(0,0,0,0.1)] min-w-[200px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 sm:px-4 lg:px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Aucune facture trouvée
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900 dark:text-gray-100 font-mono sticky left-0 bg-white dark:bg-gray-800 z-10 shadow-[2px_0_4px_rgba(0,0,0,0.1)] min-w-[120px]">
                      <div className="truncate break-words">{invoice.invoice_number}</div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-400 min-w-[150px]">
                      <div className="min-w-0">
                        <div className="truncate break-words">{invoice.tenant?.name || '-'}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 truncate hidden sm:block">{invoice.tenant?.email || ''}</div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell min-w-[100px]">
                      {new Date(invoice.issue_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-sm font-semibold text-gray-900 dark:text-gray-100 min-w-[100px]">
                      <div className="break-words">{formatPrice(invoice.total, invoice.currency)}</div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 min-w-[100px]">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusBadge(invoice.status)}`}>
                        {getStatusLabel(invoice.status)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-right text-sm sticky right-0 bg-white dark:bg-gray-800 z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.1)] min-w-[200px]">
                      <div className="flex flex-wrap justify-end items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 sm:p-0"
                          title="Voir les détails"
                        >
                          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleViewHTML(invoice)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 sm:p-0"
                          title="Voir en HTML"
                        >
                          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(invoice)}
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-1 sm:p-0"
                          title="Télécharger PDF/HTML"
                        >
                          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                        {invoice.status !== 'paid' && invoice.status !== 'void' && (
                          <>
                            <button
                              onClick={() => handleMarkPaid(invoice)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 sm:p-0"
                              title="Marquer comme payée"
                            >
                              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleSendReminder(invoice)}
                              className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 p-1 sm:p-0"
                              title="Envoyer un rappel"
                            >
                              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

