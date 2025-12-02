'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/admin/AdminLayout'
import billingService from '@/services/billing.service'
import ResponsiveTable from '@/components/shared/ResponsiveTable'
import toast from 'react-hot-toast'
import PageLoader from '@/components/shared/PageLoader'

interface InvoiceTemplate {
  id: number
  name: string
  description?: string
  html_template: string
  css_styles?: string
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function InvoiceTemplatesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<InvoiceTemplate | null>(null)
  const [previewHtml, setPreviewHtml] = useState<string>('')

  useEffect(() => {
    if (!authService.isSuperAdmin()) {
      router.push('/admin/dashboard')
      return
    }
    loadTemplates()
  }, [router])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const data = await billingService.getInvoiceTemplates()
      setTemplates(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('Erreur chargement templates:', error)
      toast.error('Erreur lors du chargement des templates')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data: Partial<InvoiceTemplate>) => {
    try {
      await billingService.createInvoiceTemplate(data)
      toast.success('Template créé avec succès')
      setShowCreateModal(false)
      loadTemplates()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la création')
    }
  }

  const handleUpdate = async (id: number, data: Partial<InvoiceTemplate>) => {
    try {
      await billingService.updateInvoiceTemplate(id, data)
      toast.success('Template mis à jour avec succès')
      setEditingTemplate(null)
      loadTemplates()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return
    
    try {
      await billingService.deleteInvoiceTemplate(id)
      toast.success('Template supprimé avec succès')
      loadTemplates()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression')
    }
  }

  const handleSetDefault = async (id: number) => {
    try {
      await billingService.setDefaultInvoiceTemplate(id)
      toast.success('Template défini comme défaut')
      loadTemplates()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur')
    }
  }

  const handlePreview = async (template: InvoiceTemplate) => {
    try {
      const data = await billingService.previewInvoiceTemplate(template.id)
      setPreviewHtml(data.html)
      setPreviewTemplate(template)
    } catch (error: any) {
      toast.error('Erreur lors de la prévisualisation')
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Templates de Factures">
        <PageLoader text="Chargement des templates..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Templates de Factures" subtitle="Gérez les templates pour la génération de factures">
      <div className="mb-6 flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Créez et personnalisez les templates HTML pour vos factures
        </p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Créer un template
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <ResponsiveTable
          headers={['Nom', 'Description', 'Par défaut', 'Actif', 'Créé le', 'Actions']}
          emptyMessage="Aucun template"
        >
          {templates.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                Aucun template de facture. Créez-en un pour commencer.
              </td>
            </tr>
          ) : (
            templates.map((template) => (
              <tr key={template.id} className="hover:bg-gray-50 dark:bg-gray-900">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {template.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {template.description || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {template.is_default ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Oui
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      Non
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {template.is_active ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Actif
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Inactif
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(template.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex justify-end items-center gap-2">
                    <button
                      onClick={() => handlePreview(template)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                      title="Prévisualiser"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingTemplate(template)}
                      className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400"
                      title="Modifier"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {!template.is_default && (
                      <button
                        onClick={() => handleSetDefault(template.id)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400"
                        title="Définir comme défaut"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400"
                      title="Supprimer"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </ResponsiveTable>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingTemplate) && (
        <InvoiceTemplateModal
          template={editingTemplate}
          onClose={() => {
            setShowCreateModal(false)
            setEditingTemplate(null)
          }}
          onSave={(data) => {
            if (editingTemplate) {
              handleUpdate(editingTemplate.id, data)
            } else {
              handleCreate(data)
            }
          }}
        />
      )}

      {/* Preview Modal */}
      {previewTemplate && previewHtml && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Prévisualisation : {previewTemplate.name}
              </h3>
              <button
                onClick={() => {
                  setPreviewTemplate(null)
                  setPreviewHtml('')
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full min-h-[500px] border border-gray-300 dark:border-gray-600 rounded"
                title="Preview"
              />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

// Template Modal Component
function InvoiceTemplateModal({
  template,
  onClose,
  onSave,
}: {
  template: InvoiceTemplate | null
  onClose: () => void
  onSave: (data: Partial<InvoiceTemplate>) => void
}) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    html_template: template?.html_template || `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Facture {{ invoice_number }}</title>
    <style>
        @media print {
            @page { size: A4; margin: 2cm; }
            .no-print { display: none; }
        }
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #333;
        }
        .invoice-title {
            font-size: 32px;
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f3f4f6;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="invoice-title">FACTURE</div>
            <div>VTCBuilder</div>
        </div>
        <div>
            <div style="font-size: 18px; font-weight: bold;">N° {{ invoice_number }}</div>
        </div>
    </div>
    
    <div>
        <h3>Informations Client</h3>
        <p><strong>Nom:</strong> {{ tenant_name }}</p>
        <p><strong>Email:</strong> {{ tenant_email }}</p>
    </div>
    
    <div>
        <h3>Détails de la facture</h3>
        <p><strong>Date d'émission:</strong> {{ issue_date }}</p>
        <p><strong>Date d'échéance:</strong> {{ due_date }}</p>
        {% if paid_at %}<p><strong>Date de paiement:</strong> {{ paid_at }}</p>{% endif %}
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th style="text-align: right;">Sous-total</th>
                <th style="text-align: right;">TVA</th>
                <th style="text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ plan_name }}</td>
                <td style="text-align: right;">{{ subtotal }} {{ currency }}</td>
                <td style="text-align: right;">{{ tax }} {{ currency }}</td>
                <td style="text-align: right;">{{ total }} {{ currency }}</td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <td colspan="3" style="text-align: right; font-weight: bold;">TOTAL TTC:</td>
                <td style="text-align: right; font-weight: bold; font-size: 18px;">{{ total }} {{ currency }}</td>
            </tr>
        </tfoot>
    </table>
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
        <p>Merci de votre confiance !</p>
        <p>Pour toute question concernant cette facture, contactez-nous à support@vtcbuilder.com</p>
    </div>
</body>
</html>`,
    css_styles: template?.css_styles || '',
    is_default: template?.is_default || false,
    is_active: template?.is_active !== undefined ? template.is_active : true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {template ? 'Modifier le template' : 'Créer un template'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom du template *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template HTML *
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Variables disponibles : {'{{ invoice_number }}'}, {'{{ tenant_name }}'}, {'{{ tenant_email }}'}, {'{{ issue_date }}'}, {'{{ due_date }}'}, {'{{ paid_at }}'}, {'{{ subtotal }}'}, {'{{ tax }}'}, {'{{ total }}'}, {'{{ currency }}'}, {'{{ status }}'}, {'{{ plan_name }}'}
              </p>
              <textarea
                value={formData.html_template}
                onChange={(e) => setFormData({ ...formData, html_template: e.target.value })}
                className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm"
                rows={20}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Styles CSS (optionnel)
              </label>
              <textarea
                value={formData.css_styles}
                onChange={(e) => setFormData({ ...formData, css_styles: e.target.value })}
                className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm"
                rows={10}
              />
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Template par défaut</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Actif</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {template ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

