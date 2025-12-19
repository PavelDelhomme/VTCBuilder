'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/admin/AdminLayout'
import blocksService, { BlockType } from '@/services/blocks.service'
import billingService, { PricingPlan } from '@/services/billing.service'
import DataTable, { Column, Filter } from '@/components/shared/DataTable'
import toast from 'react-hot-toast'
import PageLoader from '@/components/shared/PageLoader'

export default function AdminBlocksPage() {
  const router = useRouter()
  const [blocks, setBlocks] = useState<BlockType[]>([])
  const [filteredBlocks, setFilteredBlocks] = useState<BlockType[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBlock, setEditingBlock] = useState<BlockType | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    icon: '📦',
    category: 'content' as 'content' | 'layout' | 'media' | 'custom',
    description: '',
    schema: '{}',
    default_styles: '{}',
    call_to_action: '{}',
    available_plans: [] as number[],
    is_active: true,
    is_admin_only: false,
    order: 0,
  })
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [activeTab, setActiveTab] = useState<'info' | 'schema' | 'styles' | 'cta' | 'preview'>('info')
  const [previewData, setPreviewData] = useState<Record<string, any>>({})
  const [schemaError, setSchemaError] = useState<string | null>(null)
  const [stylesError, setStylesError] = useState<string | null>(null)
  const [ctaError, setCtaError] = useState<string | null>(null)

  useEffect(() => {
    if (!authService.isSuperAdmin()) {
      router.push('/dashboard')
      return
    }
    loadBlocks()
    loadPricingPlans()
  }, [router])

  const loadPricingPlans = async () => {
    try {
      const plans = await billingService.getPricingPlans()
      setPricingPlans(Array.isArray(plans) ? plans : plans.results || [])
    } catch (error: any) {
      console.error('Error chargement plans tarifaires:', error)
    }
  }

  const loadBlocks = async () => {
    try {
      setLoading(true)
      const data = await blocksService.getBlockTypes()
      const blocksArray = Array.isArray(data) ? data : []
      setBlocks(blocksArray)
      setFilteredBlocks(blocksArray)
    } catch (error: any) {
      console.error('Error chargement blocs:', error)
      toast.error('Error lors du chargement des blocs')
      setBlocks([])
      setFilteredBlocks([])
    } finally {
      setLoading(false)
    }
  }

  // Filter blocks based on search, category, and status
  useEffect(() => {
    let filtered = [...blocks]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(block =>
        block.name.toLowerCase().includes(query) ||
        block.label.toLowerCase().includes(query) ||
        (block.description && block.description.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(block => block.category === categoryFilter)
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(block => block.is_active)
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(block => !block.is_active)
    }

    setFilteredBlocks(filtered)
  }, [blocks, searchQuery, categoryFilter, statusFilter])

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

    const ctaValidation = validateJSON(formData.call_to_action)
    if (!ctaValidation.valid) {
      setCtaError(ctaValidation.error || 'JSON invalide')
      toast.error('Le call-to-action JSON est invalide')
      return
    }
    setCtaError(null)

    try {
      const dataToSend = {
        name: formData.name,
        label: formData.label,
        icon: formData.icon,
        category: formData.category,
        description: formData.description || '',
        schema: schemaValidation.data,
        default_styles: stylesValidation.data,
        call_to_action: ctaValidation.data,
        available_plans: formData.available_plans,
        is_active: formData.is_active,
        is_admin_only: formData.is_admin_only,
        order: formData.order,
      }

      if (editingBlock) {
        await blocksService.updateBlockType(editingBlock.id, dataToSend)
        toast.success('Bloc mis à jour avec succès !')
      } else {
        await blocksService.createBlockType(dataToSend)
        toast.success('Bloc créé avec succès !')
      }
      setShowForm(false)
      setEditingBlock(null)
      resetForm()
      loadBlocks()
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Error lors de la sauvegarde')
    }
  }

  const handleEdit = (block: BlockType) => {
    // Rediriger vers la page d'édition dédiée
    router.push(`/admin/blocks/${block.id}`)
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le bloc "${name}" ?`)) return
    try {
      await blocksService.deleteBlockType(id)
      toast.success('Bloc supprimé avec succès !')
      loadBlocks()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error lors de la suppression')
    }
  }

  const handleToggleActive = async (block: BlockType) => {
    try {
      await blocksService.updateBlockType(block.id, { is_active: !block.is_active })
      toast.success(`Bloc ${!block.is_active ? 'activé' : 'désactivé'} avec succès !`)
      loadBlocks()
    } catch (error: any) {
      toast.error('Error lors de la mise à jour')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      label: '',
      icon: '📦',
      category: 'content',
      description: '',
      schema: '{}',
      default_styles: '{}',
      call_to_action: '{}',
      available_plans: [],
      is_active: true,
      is_admin_only: false,
      order: 0,
    })
    setActiveTab('info')
    setPreviewData({})
    setSchemaError(null)
    setStylesError(null)
    setCtaError(null)
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

  const getCategoryBadge = (category: string) => {
    const badges: Record<string, string> = {
      content: 'bg-blue-100 text-blue-800',
      layout: 'bg-purple-100 text-purple-800',
      media: 'bg-green-100 text-green-800',
      custom: 'bg-orange-100 text-orange-800',
    }
    return badges[category] || 'bg-gray-100 dark:bg-gray-900 text-gray-800'
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      content: 'Contenu',
      layout: 'Mise en page',
      media: 'Médias',
      custom: 'Personnalisé',
    }
    return labels[category] || category
  }


  // Render preview based on schema
  const renderPreview = () => {
    if (!previewData || Object.keys(previewData).length === 0) {
      return (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <p>Entrez un schéma JSON valide pour voir la prévisualisation</p>
        </div>
      )
    }

    try {
      // Simple preview renderer based on schema structure
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
      <AdminLayout title="Gestion des Blocs">
        <PageLoader text="Chargement des blocs..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Gestion des Blocs"
      subtitle="Créez et gérez les types de blocs disponibles dans l'éditeur"
      headerActions={
        <button
          onClick={() => {
            resetForm()
            setEditingBlock(null)
            setShowForm(true)
          }}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center text-sm"
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau Bloc
        </button>
      }
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            {editingBlock ? 'Modifier le Bloc' : 'Créer un Nouveau Bloc'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tabs */}
            <div className="border-b border-gray-200 overflow-x-auto">
              <nav className="-mb-px flex space-x-4 sm:space-x-8">
                <button
                  type="button"
                  onClick={() => setActiveTab('info')}
                  className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === 'info'
                      ? 'border-blue-500 text-blue-600'
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
                      ? 'border-blue-500 text-blue-600'
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
                      ? 'border-blue-500 text-blue-600'
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
                      ? 'border-blue-500 text-blue-600'
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
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  Prévisualisation
                </button>
              </nav>
            </div>

            {/* Info Tab */}
            {activeTab === 'info' && (
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
                          checked={formData.available_plans.includes(plan.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                available_plans: [...formData.available_plans, plan.id],
                              })
                            } else {
                              setFormData({
                                ...formData,
                                available_plans: formData.available_plans.filter(id => id !== plan.id),
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
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      ⚠️ Aucun plan tarifaire trouvé. Créez des plans dans la section Facturation.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Statut
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Actif</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_admin_only}
                        onChange={(e) => setFormData({ ...formData, is_admin_only: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Réservé aux administrateurs uniquement</span>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                      Si coché, ce bloc ne sera visible que pour les administrateurs dans l'éditeur
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Schema Tab */}
            {activeTab === 'schema' && (
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
            )}

            {/* Styles Tab */}
            {activeTab === 'styles' && (
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
            )}

            {/* Call-to-Action Tab */}
            {activeTab === 'cta' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Configuration Call-to-Action (JSON)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const validation = validateJSON(formData.call_to_action)
                        if (!validation.valid) {
                          setCtaError(validation.error || 'JSON invalide')
                        } else {
                          setCtaError(null)
                        }
                      }}
                      className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Valider JSON
                    </button>
                  </div>
                  {ctaError && (
                    <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                      Error JSON: {ctaError}
                    </div>
                  )}
                  <textarea
                    value={formData.call_to_action}
                    onChange={(e) => {
                      setFormData({ ...formData, call_to_action: e.target.value })
                      setCtaError(null)
                    }}
                    rows={20}
                    className="w-full px-3 sm:px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs sm:text-sm"
                    placeholder='{"enabled": true, "type": "button", "default_text": "Cliquez ici", "default_url": "#", "styles": {"primary": {"background": "#3B82F6", "color": "#FFFFFF"}}}'
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    💡 Configurez les call-to-action (boutons, liens) pour ce bloc. Exemple pour un bouton :
                  </p>
                  <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-x-auto">
{`{
  "enabled": true,
  "type": "button",
  "default_text": "Cliquez ici",
  "default_url": "#",
  "styles": {
    "primary": {
      "background": "#3B82F6",
      "color": "#FFFFFF"
    }
  }
}`}
                  </pre>
                </div>
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
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
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingBlock(null)
                  resetForm()
                }}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingBlock ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Blocks Grid - Modern Card Design */}
      <div className="space-y-6 pb-6">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher un bloc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toutes les catégories</option>
              <option value="content">Contenu</option>
              <option value="layout">Mise en page</option>
              <option value="media">Médias</option>
              <option value="custom">Personnalisé</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{blocks.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{blocks.filter(b => b.is_active).length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Actifs</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{blocks.filter(b => !b.is_active).length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Inactifs</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{filteredBlocks.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Filtrés</div>
          </div>
        </div>

        {/* Blocks Grid */}
        {filteredBlocks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Aucun bloc pour le moment
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Créez votre premier bloc pour commencer
            </p>
            <button
              onClick={() => {
                resetForm()
                setEditingBlock(null)
                setShowForm(true)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Créer un bloc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBlocks.map((block) => (
              <div
                key={block.id}
                className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-600 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group cursor-pointer"
                onClick={() => handleEdit(block)}
              >
                {/* Card Header */}
                <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
                  block.is_active 
                    ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20' 
                    : 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center text-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        {block.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" title={block.label}>
                          {block.label}
                        </h3>
                        <code className="text-xs text-gray-500 dark:text-gray-400 truncate block" title={block.name}>
                          {block.name}
                        </code>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-col gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleActive(block)
                        }}
                        className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
                          block.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                        }`}
                        title={block.is_active ? 'Désactiver' : 'Activer'}
                      >
                        {block.is_active ? '✓' : '○'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {block.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2" title={block.description}>
                      {block.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadge(block.category)}`}>
                      {getCategoryLabel(block.category)}
                    </span>
                    {block.plan_names && block.plan_names.length > 0 ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {block.plan_names.length} plan{block.plan_names.length > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Gratuit
                      </span>
                    )}
                    {(block as any).is_admin_only && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        Admin
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Ordre: {block.order}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(block)
                      }}
                      className="p-1.5 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Modifier"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(block.id, block.label)
                      }}
                      className="p-1.5 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Supprimer"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </AdminLayout>
  )
}

