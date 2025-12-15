'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/admin/AdminLayout'
import blocksService, { BlockType } from '@/services/blocks.service'
import billingService, { PricingPlan } from '@/services/billing.service'
import { callToActionService, CallToAction } from '@/services/blocks.service'
import toast from 'react-hot-toast'
import PageLoader from '@/components/shared/PageLoader'

export default function EditBlockPage() {
  const router = useRouter()
  const params = useParams()
  const blockId = params?.id ? parseInt(params.id as string) : null
  
  const [block, setBlock] = useState<BlockType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [callToActions, setCallToActions] = useState<CallToAction[]>([])
  const [activeTab, setActiveTab] = useState<'info' | 'schema' | 'styles' | 'cta' | 'preview'>('info')
  const [previewData, setPreviewData] = useState<Record<string, any>>({})
  const [schemaError, setSchemaError] = useState<string | null>(null)
  const [stylesError, setStylesError] = useState<string | null>(null)
  const [ctaError, setCtaError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    icon: '📦',
    category: 'content' as 'content' | 'layout' | 'media' | 'custom',
    description: '',
    schema: '{}',
    default_styles: '{}',
    call_to_action_ids: [] as number[],
    available_plan_ids: [] as number[],
    is_active: true,
    order: 0,
  })

  useEffect(() => {
    if (!authService.isSuperAdmin()) {
      router.push('/dashboard')
      return
    }
    if (blockId) {
      loadBlock()
      loadPricingPlans()
      loadCallToActions()
    } else {
      setLoading(false)
    }
  }, [router, blockId])

  const loadPricingPlans = async () => {
    try {
      const plans = await billingService.getPricingPlans()
      setPricingPlans(Array.isArray(plans) ? plans : plans.results || [])
    } catch (error: any) {
      console.error('Error chargement plans tarifaires:', error)
    }
  }

  const loadCallToActions = async () => {
    try {
      const data = await callToActionService.getAll()
      setCallToActions(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('Error chargement CTAs:', error)
    }
  }

  const loadBlock = async () => {
    if (!blockId) return
    
    try {
      setLoading(true)
      const data = await blocksService.getBlockType(blockId)
      setBlock(data)
      
      // Charger les IDs des plans et CTAs
      const planIds = data.available_plans?.map((p: any) => typeof p === 'object' ? p.id : p) || []
      const ctaIds = data.call_to_actions?.map((cta: any) => typeof cta === 'object' ? cta.id : cta) || []
      
      setFormData({
        name: data.name,
        label: data.label,
        icon: data.icon || '📦',
        category: data.category,
        description: data.description || '',
        schema: JSON.stringify(data.schema || {}, null, 2),
        default_styles: JSON.stringify(data.default_styles || {}, null, 2),
        call_to_action_ids: ctaIds,
        available_plan_ids: planIds,
        is_active: data.is_active,
        order: data.order || 0,
      })
      setPreviewData(data.schema || {})
    } catch (error: any) {
      console.error('Error chargement bloc:', error)
      toast.error('Error lors du chargement du bloc')
      router.push('/admin/blocks')
    } finally {
      setLoading(false)
    }
  }

  const validateJSON = (jsonString: string): { valid: boolean; data?: any; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString)
      return { valid: true, data: parsed }
    } catch (error: any) {
      return { valid: false, error: error.message }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!blockId) return
    
    // Validate JSON fields
    const schemaValidation = validateJSON(formData.schema)
    if (!schemaValidation.valid) {
      setSchemaError(schemaValidation.error || 'JSON invalide')
      toast.error('Le schéma JSON est invalide')
      return
    }
    setSchemaError(null)

    const stylesValidation = validateJSON(formData.default_styles)
    if (!stylesValidation.valid) {
      setStylesError(stylesValidation.error || 'JSON invalide')
      toast.error('Les styles JSON sont invalides')
      return
    }
    setStylesError(null)

    try {
      setSaving(true)
      const dataToSend = {
        name: formData.name,
        label: formData.label,
        icon: formData.icon,
        category: formData.category,
        description: formData.description || '',
        schema: schemaValidation.data,
        default_styles: stylesValidation.data,
        call_to_action_ids: formData.call_to_action_ids,
        available_plan_ids: formData.available_plan_ids,
        is_active: formData.is_active,
        order: formData.order,
      }

      await blocksService.updateBlockType(blockId, dataToSend)
      toast.success('Bloc mis à jour avec succès !')
      router.push('/admin/blocks')
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Error lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const updatePreview = () => {
    const schemaValidation = validateJSON(formData.schema)
    if (schemaValidation.valid) {
      setPreviewData(schemaValidation.data || {})
      setSchemaError(null)
    } else {
      setSchemaError(schemaValidation.error || 'JSON invalide')
    }
  }

  const renderPreview = () => {
    if (!previewData || Object.keys(previewData).length === 0) {
      return (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <p>Entrez un schéma JSON valide pour voir la prévisualisation</p>
        </div>
      )
    }

    try {
      return (
        <div className="p-4 space-y-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Aperçu du bloc</h3>
            <div className="space-y-2">
              {Object.entries(previewData).map(([key, value]: [string, any]) => {
                if (typeof value === 'object' && value !== null) {
                  return (
                    <div key={key} className="border-l-2 border-blue-500 pl-3">
                      <div className="font-medium text-sm text-gray-700 dark:text-gray-300">{key}:</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {JSON.stringify(value, null, 2)}
                      </div>
                    </div>
                  )
                }
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-700 dark:text-gray-300 w-24">{key}:</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{String(value)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )
    } catch (error) {
      return (
        <div className="p-8 text-center text-red-500">
          <p>Erreur lors du rendu de la prévisualisation</p>
        </div>
      )
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Modifier le Bloc">
        <PageLoader text="Chargement du bloc..." />
      </AdminLayout>
    )
  }

  if (!block) {
    return (
      <AdminLayout title="Bloc non trouvé">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Bloc non trouvé</p>
          <button
            onClick={() => router.push('/admin/blocks')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour à la liste
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title={`Modifier le Bloc: ${block.label}`}
      subtitle={block.description || `Bloc ${block.name}`}
      headerActions={
        <button
          onClick={() => router.push('/admin/blocks')}
          className="w-full sm:w-auto text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-sm"
        >
          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <nav className="-mb-px flex space-x-4 sm:space-x-8">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Informations
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('schema')}
              className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'schema'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Schéma JSON
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('styles')}
              className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'styles'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Styles par défaut
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cta')}
              className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'cta'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Call-to-Action
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('preview')
                updatePreview()
              }}
              className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'preview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Prévisualisation
            </button>
          </nav>
        </div>

        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom (identifiant) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="ex: custom-text"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Identifiant unique (minuscules, tirets)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Label (nom affiché) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="ex: Bloc Texte Personnalisé"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icône (emoji ou nom) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="📝 ou text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catégorie *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="content">Contenu</option>
                  <option value="layout">Mise en page</option>
                  <option value="media">Médias</option>
                  <option value="custom">Personnalisé</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Statut
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Actif</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plans tarifaires requis
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Si aucun plan n'est sélectionné, le bloc est gratuit (accessible à tous)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {pricingPlans.map((plan) => (
                    <label key={plan.id} className="flex items-center p-3 border dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.available_plan_ids.includes(plan.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              available_plan_ids: [...formData.available_plan_ids, plan.id],
                            })
                          } else {
                            setFormData({
                              ...formData,
                              available_plan_ids: formData.available_plan_ids.filter(id => id !== plan.id),
                            })
                          }
                        }}
                        className="mr-2"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{plan.name}</span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400">{plan.price_monthly}€/mois</span>
                      </div>
                    </label>
                  ))}
                </div>
                {pricingPlans.length === 0 && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                    ⚠️ Aucun plan tarifaire trouvé. Créez des plans dans la section Facturation.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Schema Tab */}
        {activeTab === 'schema' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Schéma JSON (structure des données du bloc)
                  </label>
                  <button
                    type="button"
                    onClick={updatePreview}
                    className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Mettre à jour la prévisualisation
                  </button>
                </div>
                {schemaError && (
                  <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                    Error JSON: {schemaError}
                  </div>
                )}
                <textarea
                  value={formData.schema}
                  onChange={(e) => {
                    setFormData({ ...formData, schema: e.target.value })
                    setSchemaError(null)
                  }}
                  rows={20}
                  className="w-full px-3 sm:px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs sm:text-sm"
                  placeholder='{"content": {"type": "string", "label": "Contenu", "default": ""}}'
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  💡 Définissez la structure des données que ce bloc peut contenir
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Styles Tab */}
        {activeTab === 'styles' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Styles par défaut (JSON)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const validation = validateJSON(formData.default_styles)
                      if (!validation.valid) {
                        setStylesError(validation.error || 'JSON invalide')
                      } else {
                        setStylesError(null)
                      }
                    }}
                    className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Valider JSON
                  </button>
                </div>
                {stylesError && (
                  <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                    Error JSON: {stylesError}
                  </div>
                )}
                <textarea
                  value={formData.default_styles}
                  onChange={(e) => {
                    setFormData({ ...formData, default_styles: e.target.value })
                    setStylesError(null)
                  }}
                  rows={20}
                  className="w-full px-3 sm:px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs sm:text-sm"
                  placeholder='{"color": "#000000", "fontSize": "16px", "padding": "10px"}'
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  💡 Définissez les styles CSS par défaut pour ce bloc
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Call-to-Action Tab */}
        {activeTab === 'cta' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Call-to-Actions associés
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Sélectionnez les call-to-actions qui peuvent être utilisés avec ce bloc
                </p>
                {callToActions.length === 0 ? (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    ⚠️ Aucun call-to-action trouvé. Créez-en dans la section Call-to-Actions.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {callToActions.map((cta) => (
                      <label key={cta.id} className="flex items-center p-3 border dark:bg-gray-700 dark:border-gray-600 border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.call_to_action_ids.includes(cta.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                call_to_action_ids: [...formData.call_to_action_ids, cta.id],
                              })
                            } else {
                              setFormData({
                                ...formData,
                                call_to_action_ids: formData.call_to_action_ids.filter(id => id !== cta.id),
                              })
                            }
                          }}
                          className="mr-2"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{cta.label || cta.name}</span>
                          {cta.description && (
                            <span className="block text-xs text-gray-500 dark:text-gray-400">{cta.description}</span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Prévisualisation en directe
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                  Aperçu basé sur le schéma JSON défini. Cliquez sur "Mettre à jour la prévisualisation" dans l'onglet Schéma pour actualiser.
                </p>
              </div>
              {renderPreview()}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.push('/admin/blocks')}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Enregistrement...' : 'Mettre à jour'}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}

