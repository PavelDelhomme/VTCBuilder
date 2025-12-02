'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/AdminLayout'
import templateService, { Template } from '@/services/template.service'
import toast from 'react-hot-toast'
import PageLoader from '@/components/PageLoader'

export default function AdminTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'vtc' as 'vtc' | 'business' | 'minimal' | 'modern' | 'classic',
    is_premium: false,
    price: 0,
    is_active: true,
    preview_image: null as File | null,
    html_content: '',
    css_content: '',
    variables: {} as Record<string, { type: string; default: string; description: string }>,
  })
  const [activeTab, setActiveTab] = useState<'info' | 'html' | 'css' | 'variables' | 'preview'>('info')
  const [detectedVariables, setDetectedVariables] = useState<string[]>([])
  const [htmlFile, setHtmlFile] = useState<File | null>(null)
  const [cssFile, setCssFile] = useState<File | null>(null)

  useEffect(() => {
    if (!authService.isSuperAdmin()) {
      router.push('/dashboard')
      return
    }
    loadTemplates()
  }, [router])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const data = await templateService.getAll({})
      const templatesArray = Array.isArray(data) ? data : (data?.results || data?.data || [])
      setTemplates(templatesArray)
    } catch (error: any) {
      // Ne pas logger les erreurs attendues (500, etc.)
      if (!error.response || error.response?.status !== 500) {
        console.error('Erreur chargement templates:', error)
      }
      // Ne pas afficher de toast pour les erreurs 500 (endpoint peut être en cours de développement)
      if (!error.response || error.response?.status !== 500) {
        toast.error('Erreur lors du chargement des templates')
      }
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Préparer les données pour l'envoi
      const dataToSend = new FormData()
      
      // Ajouter tous les champs texte
      dataToSend.append('name', formData.name)
      dataToSend.append('slug', formData.slug)
      dataToSend.append('description', formData.description || '')
      dataToSend.append('category', formData.category)
      dataToSend.append('is_premium', formData.is_premium.toString())
      dataToSend.append('price', formData.price.toString())
      dataToSend.append('is_active', formData.is_active.toString())
      dataToSend.append('html_content', formData.html_content || '')
      dataToSend.append('css_content', formData.css_content || '')
      dataToSend.append('variables', JSON.stringify(formData.variables || {}))
      
      // Ajouter l'image de prévisualisation si elle existe
      if (formData.preview_image instanceof File) {
        dataToSend.append('preview_image', formData.preview_image)
      }
      
      if (editingTemplate) {
        await templateService.update(editingTemplate.id, dataToSend)
        toast.success('Template mis à jour avec succès !')
      } else {
        await templateService.create(dataToSend)
        toast.success('Template créé avec succès !')
      }
      setShowForm(false)
      setEditingTemplate(null)
      resetForm()
      loadTemplates()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde')
    }
  }

  const detectVariables = () => {
    const html = formData.html_content || ''
    const css = formData.css_content || ''
    const combined = html + css
    
    // Extract variables in format {{variable_name}}
    const regex = /\{\{(\w+)\}\}/g
    const matches: RegExpExecArray[] = []
    let match: RegExpExecArray | null
    while ((match = regex.exec(combined)) !== null) {
      matches.push(match)
    }
    const variables = Array.from(new Set(matches.map(m => m[1])))
    
    setDetectedVariables(variables)
    
    // Auto-add variables to formData if they don't exist
    setFormData((prev) => {
      const currentVars = prev.variables || {}
      const newVars = { ...currentVars }
      
      variables.forEach(varName => {
        if (!newVars[varName]) {
          newVars[varName] = {
            type: 'string',
            default: '',
            description: `Variable: ${varName}`,
          }
        }
      })
      
      return { ...prev, variables: newVars }
    })
  }

  const handleEdit = async (template: Template) => {
    try {
      // Charger les détails complets du template pour avoir html_content, css_content, variables
      const fullTemplate = await templateService.getById(template.id)
      
      setEditingTemplate(fullTemplate)
      setFormData({
        name: fullTemplate.name,
        slug: fullTemplate.slug,
        description: fullTemplate.description || '',
        category: fullTemplate.category,
        is_premium: fullTemplate.is_premium,
        price: parseFloat(fullTemplate.price?.toString() || '0'),
        is_active: fullTemplate.is_active,
        preview_image: null, // L'image sera chargée depuis l'URL si disponible
        html_content: fullTemplate.html_content || '',
        css_content: fullTemplate.css_content || '',
        variables: fullTemplate.variables || {},
      })
      setShowForm(true)
      setActiveTab('info')
      // Détecter les variables après avoir chargé le contenu
      setTimeout(() => detectVariables(), 100)
    } catch (error: any) {
      console.error('Erreur chargement détails template:', error)
      toast.error('Erreur lors du chargement des détails du template')
      // Fallback: utiliser les données de la liste si le chargement échoue
      setEditingTemplate(template)
      setFormData({
        name: template.name,
        slug: template.slug,
        description: template.description || '',
        category: template.category,
        is_premium: template.is_premium,
        price: parseFloat(template.price?.toString() || '0'),
        is_active: template.is_active,
        preview_image: null,
        html_content: template.html_content || '',
        css_content: template.css_content || '',
        variables: (template as any).variables || {},
      })
      setShowForm(true)
      setActiveTab('info')
      detectVariables()
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le template "${name}" ?`)) return
    try {
      await templateService.delete(id)
      toast.success('Template supprimé avec succès !')
      loadTemplates()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression')
    }
  }

  const handleToggleActive = async (template: Template) => {
    try {
      await templateService.update(template.id, { is_active: !template.is_active })
      toast.success(`Template ${!template.is_active ? 'activé' : 'désactivé'} avec succès !`)
      loadTemplates()
    } catch (error: any) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      category: 'vtc',
      is_premium: false,
      price: 0,
      is_active: true,
      preview_image: null as File | null,
      html_content: '',
      css_content: '',
      variables: {},
    })
    setActiveTab('info')
    setHtmlFile(null)
    setCssFile(null)
    setDetectedVariables([])
  }

  const handleHtmlFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.name.endsWith('.html')) {
      toast.error('Veuillez sélectionner un fichier HTML')
      return
    }
    
    setHtmlFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setFormData({ ...formData, html_content: content })
      toast.success('Fichier HTML chargé avec succès')
    }
    reader.readAsText(file)
  }

  const handleCssFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (!file.name.endsWith('.css')) {
      toast.error('Veuillez sélectionner un fichier CSS')
      return
    }
    
    setCssFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setFormData({ ...formData, css_content: content })
      toast.success('Fichier CSS chargé avec succès')
    }
    reader.readAsText(file)
  }

  const getCategoryBadge = (category: string) => {
    const badges: Record<string, string> = {
      vtc: 'bg-blue-100 text-blue-800',
      business: 'bg-purple-100 text-purple-800',
      classic: 'bg-green-100 text-green-800',
      minimal: 'bg-gray-100 dark:bg-gray-900 text-gray-800',
      modern: 'bg-indigo-100 text-indigo-800',
    }
    return badges[category] || 'bg-gray-100 dark:bg-gray-900 text-gray-800'
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      vtc: 'VTC',
      business: 'Business',
      classic: 'Classique',
      minimal: 'Minimaliste',
      modern: 'Moderne',
    }
    return labels[category] || category
  }

  if (loading) {
    return (
      <AdminLayout title="Gestion des Templates">
        <PageLoader text="Chargement des templates..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Gestion des Templates"
      subtitle="Créez et gérez les templates disponibles pour tous les tenants"
      headerActions={
        <button
          onClick={() => {
            resetForm()
            setEditingTemplate(null)
            setShowForm(true)
          }}
          className="w-full sm:w-auto bg-blue-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm sm:text-base font-medium transition-colors shadow-sm hover:shadow-md"
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="whitespace-nowrap">Nouveau Template</span>
        </button>
      }
    >
      <div className="w-full">
      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            {editingTemplate ? 'Modifier le Template' : 'Créer un Nouveau Template'}
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
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  Informations
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('html')}
                  className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === 'html'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  HTML
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('css')}
                  className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === 'css'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  CSS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('variables')
                    detectVariables()
                  }}
                  className={`py-2 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === 'variables'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  Variables {detectedVariables.length > 0 && `(${detectedVariables.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
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
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="ex: modern-vtc"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catégorie *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as 'vtc' | 'business' | 'minimal' | 'modern' | 'classic' })}
                  className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="vtc">VTC</option>
                  <option value="business">Business</option>
                  <option value="modern">Moderne</option>
                  <option value="classic">Classique</option>
                  <option value="minimal">Minimaliste</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image de prévisualisation
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setFormData({ ...formData, preview_image: file })
                    }
                  }}
                  className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {formData.preview_image && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Fichier sélectionné : {formData.preview_image.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Premium
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_premium}
                    onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Template premium</span>
                </label>
              </div>
              {formData.is_premium && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prix (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
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
            </div>
            )}

            {/* HTML Tab */}
            {activeTab === 'html' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contenu HTML
                    </label>
                    <label className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900 cursor-pointer w-full sm:w-auto">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Uploader un fichier HTML
                      <input
                        type="file"
                        accept=".html"
                        onChange={handleHtmlFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {htmlFile && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Fichier: {htmlFile.name}</p>
                  )}
                  <textarea
                    value={formData.html_content}
                    onChange={(e) => {
                      setFormData({ ...formData, html_content: e.target.value })
                      // Auto-detect variables on change
                      setTimeout(() => detectVariables(), 500)
                    }}
                    rows={15}
                    className="w-full px-3 sm:px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs sm:text-sm"
                    placeholder="<!-- Entrez votre code HTML ici -->"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    💡 Utilisez {'{{variable_name}}'} pour créer des variables dynamiques
                  </p>
                  <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                    🔧 Utilisez {'{% block block_name %}'} pour intégrer des blocs de contenu
                  </p>
                </div>
              </div>
            )}

            {/* Variables Tab */}
            {activeTab === 'variables' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Variables détectées</h4>
                  <p className="text-xs text-blue-700 mb-3">
                    Les variables suivantes ont été détectées dans votre HTML/CSS. Configurez leurs types et valeurs par défaut.
                  </p>
                  {detectedVariables.length === 0 ? (
                    <p className="text-sm text-blue-600">
                      Aucune variable détectée. Utilisez la syntaxe {'{{variable_name}}'} dans votre HTML ou CSS.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {detectedVariables.map(varName => (
                        <span
                          key={varName}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {'{{' + varName + '}}'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {detectedVariables.map(varName => {
                    const varConfig = formData.variables[varName] || {
                      type: 'string',
                      default: '',
                      description: '',
                    }

                    return (
                      <div key={varName} className="border border-gray-200 rounded-lg p-4">
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                          Variable: <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">{'{' + '{' + varName + '}' + '}'}</code>
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Type
                            </label>
                            <select
                              value={varConfig.type}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  variables: {
                                    ...formData.variables,
                                    [varName]: {
                                      ...varConfig,
                                      type: e.target.value,
                                    },
                                  },
                                })
                              }}
                              className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                            >
                              <option value="string">Texte</option>
                              <option value="number">Nombre</option>
                              <option value="boolean">Booléen</option>
                              <option value="html">HTML (non échappé)</option>
                              <option value="url">URL</option>
                              <option value="image">Image (URL)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Valeur par défaut
                            </label>
                            <input
                              type="text"
                              value={varConfig.default}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  variables: {
                                    ...formData.variables,
                                    [varName]: {
                                      ...varConfig,
                                      default: e.target.value,
                                    },
                                  },
                                })
                              }}
                              className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                              placeholder="Valeur par défaut"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Description
                            </label>
                            <textarea
                              value={varConfig.description}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  variables: {
                                    ...formData.variables,
                                    [varName]: {
                                      ...varConfig,
                                      description: e.target.value,
                                    },
                                  },
                                })
                              }}
                              className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                              rows={2}
                              placeholder="Description de la variable"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {detectedVariables.length === 0 && (
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Aucune variable détectée dans votre template.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Pour ajouter des variables, utilisez la syntaxe <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded border">{'{{nom_variable}}'}</code> dans votre HTML ou CSS.
                    </p>
                    <div className="mt-4 text-left bg-white dark:bg-gray-800 border border-gray-200 rounded p-3 text-xs font-mono">
                      <p className="text-gray-700 dark:text-gray-300 mb-1">Exemples:</p>
                      <p className="text-gray-600 dark:text-gray-400">{'<h1>{{company_name}}</h1>'}</p>
                      <p className="text-gray-600 dark:text-gray-400">{'<img src="{{logo_url}}" alt="Logo">'}</p>
                      <p className="text-gray-600 dark:text-gray-400">{'color: {{primary_color}};'}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CSS Tab */}
            {activeTab === 'css' && (
              <div className="space-y-4">
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contenu CSS
                    </label>
                    <label className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900 cursor-pointer w-full sm:w-auto">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Uploader un fichier CSS
                      <input
                        type="file"
                        accept=".css"
                        onChange={handleCssFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {cssFile && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Fichier: {cssFile.name}</p>
                  )}
                  <textarea
                    value={formData.css_content}
                    onChange={(e) => {
                      setFormData({ ...formData, css_content: e.target.value })
                      // Auto-detect variables on change
                      setTimeout(() => detectVariables(), 500)
                    }}
                    rows={15}
                    className="w-full px-3 sm:px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs sm:text-sm"
                    placeholder="/* Entrez votre code CSS ici */"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    💡 Utilisez {'{{variable_name}}'} pour créer des variables dynamiques (couleurs, tailles, etc.)
                  </p>
                  <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                    🔧 Utilisez {'{% block block_name %}'} pour intégrer des blocs de contenu dans votre template
                  </p>
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
                    Aperçu du template avec les variables remplacées par leurs valeurs par défaut.
                  </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Aperçu du template</span>
                    <button
                      type="button"
                      onClick={() => {
                        // Force re-render by updating a state
                        setFormData({ ...formData })
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Actualiser
                    </button>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800">
                    {formData.css_content && (
                      <style dangerouslySetInnerHTML={{ __html: formData.css_content }} />
                    )}
                    {formData.html_content ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: Object.entries(formData.variables || {}).reduce(
                            (html, [key, value]: [string, any]) => {
                              const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
                              return html.replace(regex, value?.default || `{{${key}}}`)
                            },
                            formData.html_content
                          ),
                        }}
                      />
                    ) : (
                      <div className="text-center text-gray-500 dark:text-gray-400 p-8">
                        <p>Aucun contenu HTML à prévisualiser</p>
                        <p className="text-xs mt-2">Ajoutez du contenu HTML dans l'onglet HTML pour voir la prévisualisation</p>
                      </div>
                    )}
                  </div>
                </div>
                {(!formData.html_content && !formData.css_content) && (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <p>Ajoutez du contenu HTML et CSS pour voir la prévisualisation</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingTemplate(null)
                  resetForm()
                }}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingTemplate ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Templates List - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden w-full max-w-full">
          <div className="overflow-x-auto -mx-3 sm:-mx-4 lg:-mx-6 xl:-mx-8 px-3 sm:px-4 lg:px-6 xl:px-8">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-900 z-20 shadow-[2px_0_4px_rgba(0,0,0,0.1)] min-w-[200px]">
                    Nom
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px] hidden md:table-cell">
                    Slug
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                    Catégorie
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[90px] hidden lg:table-cell">
                    Type
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px] hidden lg:table-cell">
                    Prix
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[90px]">
                    Statut
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[80px] hidden md:table-cell text-center">
                    Utilisations
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900 z-20 shadow-[-2px_0_4px_rgba(0,0,0,0.1)] min-w-[140px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {templates.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 sm:px-4 lg:px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      Aucun template pour le moment. Créez-en un nouveau !
                    </td>
                  </tr>
                ) : (
                  templates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="px-3 sm:px-4 lg:px-6 py-4 min-w-[200px] max-w-[300px] sticky left-0 bg-white dark:bg-gray-800 z-10 shadow-[2px_0_4px_rgba(0,0,0,0.1)]">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={template.name}>
                          {template.name}
                        </div>
                        {template.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 hidden sm:block" title={template.description}>
                            {template.description}
                          </div>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-4 min-w-[120px] hidden md:table-cell">
                        <code className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded break-all max-w-[150px] block truncate" title={template.slug}>
                          {template.slug}
                        </code>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap min-w-[100px]">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadge(template.category)}`}>
                          {getCategoryLabel(template.category)}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap min-w-[90px] hidden lg:table-cell">
                        {template.is_premium ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            Premium
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Gratuit
                          </span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 min-w-[80px] hidden lg:table-cell">
                        {template.is_premium ? `${template.price}€` : '-'}
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap min-w-[90px]">
                        <button
                          onClick={() => handleToggleActive(template)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                            template.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {template.is_active ? 'Actif' : 'Inactif'}
                        </button>
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 min-w-[80px] hidden md:table-cell text-center">
                        {template.usage_count || 0}
                      </td>
                      <td className="px-3 sm:px-4 lg:px-6 py-4 text-right text-sm font-medium sticky right-0 bg-white dark:bg-gray-800 z-10 min-w-[140px] shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">
                        <div className="flex justify-end items-center gap-1 sm:gap-2 flex-nowrap">
                          {template.preview_image && (
                            <a
                              href={template.preview_image}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 sm:p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="Aperçu"
                            >
                              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </a>
                          )}
                          <button
                            onClick={() => handleEdit(template)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 sm:p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="Modifier"
                          >
                            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(template.id, template.name)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1.5 sm:p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
      </div>
      </div>
    </AdminLayout>
  )
}

