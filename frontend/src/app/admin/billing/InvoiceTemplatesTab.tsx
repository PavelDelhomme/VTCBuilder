'use client'

import { useState, useEffect } from 'react'
import billingService from '@/services/billing.service'
import ResponsiveTable from '@/components/ResponsiveTable'
import toast from 'react-hot-toast'
import LoadingSpinner from '@/components/LoadingSpinner'

interface InvoiceTemplate {
  id: number
  name: string
  description?: string
  html_template: string
  css_styles?: string
  js_script?: string
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

interface InvoiceTemplatesTabProps {
  onUpdate: () => void
}

export default function InvoiceTemplatesTab({ onUpdate }: InvoiceTemplatesTabProps) {
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<InvoiceTemplate | null>(null)
  const [previewHtml, setPreviewHtml] = useState<string>('')

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const data = await billingService.getInvoiceTemplates()
      setTemplates(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('Erreur chargement templates:', error)
      // Ne pas afficher d'erreur si c'est juste que la table n'existe pas encore
      if (error.response?.status !== 500) {
        toast.error('Erreur lors du chargement des templates')
      }
      setTemplates([])
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
      onUpdate()
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
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour')
    }
  }

  const handleEdit = async (template: InvoiceTemplate) => {
    try {
      // Récupérer le template complet depuis l'API pour avoir toutes les données
      const fullTemplate = await billingService.getInvoiceTemplate(template.id)
      setEditingTemplate(fullTemplate)
    } catch (error: any) {
      toast.error('Erreur lors du chargement du template')
      console.error(error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return
    
    try {
      await billingService.deleteInvoiceTemplate(id)
      toast.success('Template supprimé avec succès')
      loadTemplates()
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression')
    }
  }

  const handleSetDefault = async (id: number) => {
    try {
      await billingService.setDefaultInvoiceTemplate(id)
      toast.success('Template défini comme défaut')
      loadTemplates()
      onUpdate()
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
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Créez et personnalisez les templates HTML pour vos factures
        </p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Créer un template
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden w-full max-w-full">
        <div className="overflow-x-auto -mx-3 sm:-mx-4 lg:-mx-6 xl:-mx-8 px-3 sm:px-4 lg:px-6 xl:px-8">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[180px] sticky left-0 bg-gray-50 dark:bg-gray-900 z-10">
                  Nom
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px] hidden md:table-cell">
                  Description
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[110px]">
                  Par défaut
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[90px]">
                  Actif
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[110px] hidden lg:table-cell">
                  Créé le
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[160px] sticky right-0 bg-gray-50 dark:bg-gray-900 z-10">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {templates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 sm:px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Aucun template de facture. Créez-en un pour commencer.
                  </td>
                </tr>
              ) : (
                templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 sticky left-0 bg-white dark:bg-gray-800 z-10 min-w-[180px]">
                      <div className="break-words max-w-[200px] sm:max-w-none">{template.name}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell min-w-[200px]">
                      <div className="break-words max-w-[250px]">{template.description || '-'}</div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap min-w-[110px]">
                      {template.is_default ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Oui
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          Non
                        </span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap min-w-[90px]">
                      {template.is_active ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Actif
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell min-w-[110px]">
                      {new Date(template.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm sticky right-0 bg-white dark:bg-gray-800 z-10 min-w-[160px]">
                      <div className="flex justify-end items-center gap-1 sm:gap-2 flex-nowrap">
                        <button
                          onClick={() => handlePreview(template)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 p-1 sm:p-0"
                          title="Prévisualiser"
                        >
                          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                    <button
                      onClick={() => handleEdit(template)}
                      className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 p-1 sm:p-0"
                      title="Modifier"
                    >
                          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {!template.is_default && (
                          <button
                            onClick={() => handleSetDefault(template.id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 p-1 sm:p-0"
                            title="Définir comme défaut"
                          >
                            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 p-1 sm:p-0"
                          title="Supprimer"
                        >
                          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] my-4 overflow-hidden flex flex-col">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                Prévisualisation : {previewTemplate.name}
              </h3>
              <button
                onClick={() => {
                  setPreviewTemplate(null)
                  setPreviewHtml('')
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 ml-2"
              >
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-3 sm:p-6 min-w-0">
              <div className="overflow-x-auto">
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-full min-h-[400px] sm:min-h-[500px] border border-gray-300 dark:border-gray-600 rounded"
                  title="Preview"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
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
  const [showPreview, setShowPreview] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')

  // Générer la prévisualisation en temps réel
  const generatePreview = useCallback((html: string, css: string, js: string) => {
    // Remplacer les variables par des exemples
    let preview = html
      .replace(/\{\{ invoice_number \}\}/g, 'INV-2024-001')
      .replace(/\{\{ tenant_name \}\}/g, 'Exemple Tenant')
      .replace(/\{\{ tenant_email \}\}/g, 'exemple@tenant.com')
      .replace(/\{\{ issue_date \}\}/g, '01/01/2024')
      .replace(/\{\{ due_date \}\}/g, '31/01/2024')
      .replace(/\{\{ paid_at \}\}/g, '')
      .replace(/\{\{ subtotal \}\}/g, '100.00')
      .replace(/\{\{ tax \}\}/g, '20.00')
      .replace(/\{\{ total \}\}/g, '120.00')
      .replace(/\{\{ currency \}\}/g, 'EUR')
      .replace(/\{\{ status \}\}/g, 'Payé')
      .replace(/\{\{ plan_name \}\}/g, 'Plan Business')
      .replace(/\{\{ subscription_id \}\}/g, '123')
      .replace(/\{% if paid_at %\}.*?\{\% endif %\}/gs, '') // Supprimer les conditions Django

    // Ajouter le CSS
    if (css) {
      preview = `<style>${css}</style>\n${preview}`
    }

    // Ajouter le JavaScript
    if (js) {
      preview = `${preview}\n<script>${js}</script>`
    }

    return preview
  }, [])

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
    js_script: template?.js_script || '',
    is_default: template?.is_default || false,
    is_active: template?.is_active !== undefined ? template.is_active : true,
  })

  // Mettre à jour la prévisualisation quand le template change
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        description: template.description || '',
        html_template: template.html_template || '',
        css_styles: template.css_styles || '',
        js_script: template.js_script || '',
        is_default: template.is_default || false,
        is_active: template.is_active !== undefined ? template.is_active : true,
      })
    }
  }, [template])

  // Mettre à jour la prévisualisation en temps réel
  useEffect(() => {
    const preview = generatePreview(
      formData.html_template,
      formData.css_styles || '',
      formData.js_script || ''
    )
    setPreviewHtml(preview)
  }, [formData.html_template, formData.css_styles, formData.js_script, generatePreview])

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              title="Aperçu en temps réel"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {showPreview ? 'Masquer' : 'Aperçu'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          {showPreview && (
            <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aperçu en temps réel</h4>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden" style={{ height: '300px' }}>
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-full"
                  title="Preview"
                />
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-6">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                JavaScript (optionnel)
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Code JavaScript qui sera exécuté après le chargement du template (calculs, animations, etc.)
              </p>
              <textarea
                value={formData.js_script}
                onChange={(e) => setFormData({ ...formData, js_script: e.target.value })}
                className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm"
                rows={10}
                placeholder="// Exemple: calculs automatiques, animations, etc."
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
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
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

