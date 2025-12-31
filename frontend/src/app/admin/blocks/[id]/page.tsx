'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/admin/AdminLayout'
import blocksService, { BlockType } from '@/services/blocks.service'
import billingService, { PricingPlan } from '@/services/billing.service'
import { callToActionService, CallToAction } from '@/services/blocks.service'
import toast from 'react-hot-toast'
import PageLoader from '@/components/shared/PageLoader'
import BlockPreview from '@/components/editor/BlockPreview'
import { Block } from '@/components/editor/types'
import { useTheme } from '@/contexts/ThemeContext'

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
  const [blockTypes, setBlockTypes] = useState<BlockType[]>([])
  const { resolvedTheme } = useTheme()
  
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
    const loadAll = async () => {
      if (!authService.isSuperAdmin()) {
        router.push('/dashboard')
        return
      }
      if (blockId) {
        // Charger les données de manière SÉRIELLE pour éviter le rate limiting WAF
        await loadBlock()
        await new Promise(resolve => setTimeout(resolve, 500));
        await loadPricingPlans()
        await new Promise(resolve => setTimeout(resolve, 500));
        await loadCallToActions()
        await new Promise(resolve => setTimeout(resolve, 500));
        await loadBlockTypes()
      } else {
        setLoading(false)
      }
    }
    loadAll()
  }, [router, blockId])

  const loadBlockTypes = async () => {
    try {
      const types = await blocksService.getBlockTypes()
      setBlockTypes(Array.isArray(types) ? types : [])
    } catch (error: any) {
      console.error('Error chargement types de blocs:', error)
    }
  }

  const loadPricingPlans = async () => {
    try {
      const plans = await billingService.getPricingPlans()
      const plansArray = Array.isArray(plans) ? plans : plans.results || []
      setPricingPlans(plansArray)
      
      // Si aucun plan n'est disponible, afficher un avertissement
      if (plansArray.length === 0) {
        console.warn('⚠️ Aucun plan tarifaire trouvé. Utilisez la commande: python manage.py init_pricing_plans')
        toast.error('Aucun plan tarifaire trouvé. Créez des plans dans la section Facturation.', {
          duration: 5000,
        })
      }
    } catch (error: any) {
      console.error('Error chargement plans tarifaires:', error)
      toast.error('Erreur lors du chargement des plans tarifaires', {
        duration: 3000,
      })
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
      toast.success('Bloc mis à jour avec succès ! Les modifications sont propagées à tous les projets et pages utilisant ce bloc.')
      router.push('/admin/blocks')
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Error lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const updatePreview = () => {
    const schemaValidation = validateJSON(formData.schema)
    const stylesValidation = validateJSON(formData.default_styles)
    
    if (schemaValidation.valid && stylesValidation.valid) {
      // Créer un bloc de test basé sur le schéma et les styles
      const testData: Record<string, any> = {}
      if (schemaValidation.data) {
        Object.entries(schemaValidation.data).forEach(([key, value]: [string, any]) => {
          if (typeof value === 'object' && value !== null) {
            // Si c'est un objet avec type, label, default, etc.
            if (value.default !== undefined) {
              testData[key] = value.default
            } else if (value.type === 'string') {
              testData[key] = value.label || key
            } else if (value.type === 'number') {
              testData[key] = 0
            } else if (value.type === 'boolean') {
              testData[key] = false
            } else if (value.type === 'array') {
              testData[key] = []
            } else {
              testData[key] = value
            }
          } else {
            testData[key] = value
          }
        })
      }
      setPreviewData(testData)
      setSchemaError(null)
      setStylesError(null)
    } else {
      if (!schemaValidation.valid) {
        setSchemaError(schemaValidation.error || 'JSON invalide')
      }
      if (!stylesValidation.valid) {
        setStylesError(stylesValidation.error || 'JSON invalide')
      }
    }
  }

  // Créer un bloc de test pour la prévisualisation
  const previewBlock: Block | null = useMemo(() => {
    if (!block || !previewData || Object.keys(previewData).length === 0) {
      return null
    }

    try {
      const stylesValidation = validateJSON(formData.default_styles)
      const defaultStyles = stylesValidation.valid ? stylesValidation.data : {}

      return {
        id: 'preview-block',
        type: block.name,
        data: previewData,
        styles: defaultStyles,
        layout: 12,
      }
    } catch (error) {
      return null
    }
  }, [block, previewData, formData.default_styles])

  const renderPreview = () => {
    if (!previewBlock || !block) {
      return (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <p className="mb-2">Entrez un schéma JSON valide pour voir la prévisualisation</p>
          <button
            type="button"
            onClick={updatePreview}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Générer la prévisualisation
          </button>
        </div>
      )
    }

    try {
      return (
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Prévisualisation du bloc "{block.label}"
              </h3>
              <button
                type="button"
                onClick={updatePreview}
                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Actualiser
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[200px]">
              <BlockPreview
                blocks={[previewBlock]}
                blockTypes={[...blockTypes, block as BlockType]}
                theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                isInteractive={false}
                isEditable={false}
              />
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Données du bloc (basées sur le schéma)
            </h4>
            <div className="space-y-2 text-xs">
              {Object.entries(previewData).map(([key, value]: [string, any]) => (
                <div key={key} className="flex items-start gap-2">
                  <span className="font-medium text-blue-700 dark:text-blue-300 min-w-[100px]">{key}:</span>
                  <span className="text-blue-600 dark:text-blue-400 break-all">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    } catch (error) {
      return (
        <div className="p-8 text-center text-red-500">
          <p>Erreur lors du rendu de la prévisualisation</p>
          <p className="text-sm mt-2">{String(error)}</p>
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
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  Statut du bloc
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="mr-3 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${formData.is_active ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          {formData.is_active ? '✓ Actif' : '○ Inactif'}
                        </span>
                        {formData.is_active && (
                          <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full font-medium">
                            Visible
                          </span>
                        )}
                        {!formData.is_active && (
                          <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full font-medium">
                            Masqué
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formData.is_active 
                          ? 'Le bloc est visible et utilisable dans l\'éditeur' 
                          : 'Le bloc est masqué et ne sera pas disponible dans l\'éditeur'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plans tarifaires requis
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Sélectionnez les plans tarifaires qui ont accès à ce bloc. Si aucun plan n'est sélectionné, le bloc est <strong className="text-green-600 dark:text-green-400">gratuit</strong> (accessible à tous les utilisateurs).
                </p>
                {pricingPlans.length === 0 ? (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                      ⚠️ Aucun plan tarifaire trouvé.
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
                      Créez des plans tarifaires dans la section <strong>Facturation</strong> pour pouvoir les associer aux blocs.
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push('/admin/billing')}
                      className="px-3 py-1.5 text-xs bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    >
                      Aller à la section Facturation
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {pricingPlans.map((plan) => {
                        const isSelected = formData.available_plan_ids.includes(plan.id)
                        return (
                          <label
                            key={plan.id}
                            className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
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
                              className="mt-1 mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm font-semibold ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}>
                                  {plan.name}
                                </span>
                                {plan.is_featured && (
                                  <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full font-medium">
                                    ⭐ Populaire
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>
                                    {plan.price_monthly}€/mois
                                  </span>
                                  {plan.price_yearly && (
                                    <>
                                      <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                                      <span className={`text-xs ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {plan.price_yearly}€/an
                                      </span>
                                    </>
                                  )}
                                </div>
                                {plan.description && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                    {plan.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </label>
                        )
                      })}
                    </div>
                    {formData.available_plan_ids.length === 0 && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Ce bloc est <strong>gratuit</strong> et accessible à tous les utilisateurs.</span>
                        </p>
                      </div>
                    )}
                    {formData.available_plan_ids.length > 0 && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span>
                            Ce bloc est <strong>premium</strong> et accessible uniquement aux plans sélectionnés ({formData.available_plan_ids.length} plan{formData.available_plan_ids.length > 1 ? 's' : ''}).
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
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
                  className="w-full px-3 sm:px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs sm:text-sm resize-y"
                  placeholder='{"title": {"type": "string", "label": "Titre", "default": "Mon titre"}, "content": {"type": "string", "label": "Contenu", "default": "Mon contenu"}}'
                />
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    💡 Définissez la structure des données que ce bloc peut contenir
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Format: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{"{key: {type, label, default}}"}</code>
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Types supportés: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">string, number, boolean, array, object</code>
                  </p>
                </div>
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
                  className="w-full px-3 sm:px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs sm:text-sm resize-y"
                  placeholder='{"color": "#000000", "fontSize": "16px", "padding": "10px", "backgroundColor": "#ffffff"}'
                />
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    💡 Définissez les styles CSS par défaut pour ce bloc
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Utilisez les noms de propriétés CSS en camelCase ou snake_case
                  </p>
                </div>
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
                  Aperçu basé sur le schéma JSON et les styles par défaut. Cliquez sur "Mettre à jour la prévisualisation" dans l'onglet Schéma pour actualiser.
                </p>
              </div>
              {renderPreview()}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={async () => {
              try {
                await blocksService.updateBlockType(blockId!, { is_active: !formData.is_active })
                setFormData({ ...formData, is_active: !formData.is_active })
                toast.success(`Bloc ${!formData.is_active ? 'activé' : 'désactivé'} avec succès !`)
              } catch (error: any) {
                toast.error('Erreur lors de la mise à jour du statut')
              }
            }}
            className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition-colors ${
              formData.is_active
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {formData.is_active ? '✓ Actif' : '○ Inactif'}
          </button>
          <div className="flex flex-col sm:flex-row gap-3">
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
        </div>
      </form>
      </div>
    </AdminLayout>
  )
}

