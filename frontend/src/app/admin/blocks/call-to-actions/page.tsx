'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/AdminLayout'
import { callToActionService, CallToAction } from '@/services/blocks.service'
import toast from 'react-hot-toast'
import PageLoader from '@/components/PageLoader'

export default function AdminCallToActionsPage() {
  const router = useRouter()
  const [ctas, setCtas] = useState<CallToAction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCta, setEditingCta] = useState<CallToAction | null>(null)
  const [viewingCta, setViewingCta] = useState<CallToAction | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; ctaId: number | null; ctaName: string }>({ show: false, ctaId: null, ctaName: '' })
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    description: '',
    type: 'button' as 'button' | 'link' | 'banner' | 'popup' | 'inline' | 'sticky' | 'floating',
    default_text: 'Cliquez ici',
    default_url: '#',
    styles: '{}',
    config: '{}',
    is_active: true,
    is_global: true,
  })

  useEffect(() => {
    if (!authService.isSuperAdmin()) {
      router.push('/dashboard')
      return
    }
    loadCtas()
  }, [router])

  const loadCtas = async () => {
    try {
      setLoading(true)
      const data = await callToActionService.getAll()
      setCtas(data)
    } catch (error: any) {
      console.error('Erreur chargement CTAs:', error)
      toast.error('Erreur lors du chargement des call-to-actions')
      setCtas([])
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
    
    // Validate JSON fields
    const stylesValidation = validateJSON(formData.styles)
    if (!stylesValidation.valid) {
      toast.error('Le JSON des styles est invalide')
      return
    }

    const configValidation = validateJSON(formData.config)
    if (!configValidation.valid) {
      toast.error('Le JSON de configuration est invalide')
      return
    }

    try {
      const data = {
        name: formData.name,
        label: formData.label,
        description: formData.description,
        type: formData.type,
        default_text: formData.default_text,
        default_url: formData.default_url,
        styles: stylesValidation.data,
        config: configValidation.data,
        is_active: formData.is_active,
        is_global: formData.is_global,
      }

      if (editingCta) {
        await callToActionService.update(editingCta.id, data)
        toast.success('Call-to-Action mis à jour avec succès !')
      } else {
        await callToActionService.create(data)
        toast.success('Call-to-Action créé avec succès !')
      }

      resetForm()
      setShowForm(false)
      loadCtas()
    } catch (error: any) {
      console.error('Erreur sauvegarde CTA:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      label: '',
      description: '',
      type: 'button',
      default_text: 'Cliquez ici',
      default_url: '#',
      styles: '{}',
      config: '{}',
      is_active: true,
      is_global: true,
    })
    setEditingCta(null)
    setShowForm(false)
  }

  const handleView = (cta: CallToAction) => {
    setViewingCta(cta)
  }

  const handleEdit = (cta: CallToAction) => {
    setEditingCta(cta)
    setFormData({
      name: cta.name,
      label: cta.label,
      description: cta.description || '',
      type: cta.type,
      default_text: cta.default_text,
      default_url: cta.default_url,
      styles: JSON.stringify(cta.styles, null, 2),
      config: JSON.stringify(cta.config, null, 2),
      is_active: cta.is_active,
      is_global: cta.is_global,
    })
    setShowForm(true)
    setViewingCta(null) // Fermer la popup de visualisation si ouverte
  }

  const handleDeleteClick = (cta: CallToAction) => {
    setDeleteConfirm({ show: true, ctaId: cta.id, ctaName: cta.label || cta.name })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.ctaId) return
    
    try {
      await callToActionService.delete(deleteConfirm.ctaId)
      toast.success('Call-to-Action supprimé avec succès !')
      setDeleteConfirm({ show: false, ctaId: null, ctaName: '' })
      loadCtas()
    } catch (error: any) {
      console.error('Erreur suppression CTA:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, ctaId: null, ctaName: '' })
  }

  const getTypeBadge = (type: string) => {
    const badges: Record<string, string> = {
      button: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      link: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      banner: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      popup: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      inline: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      sticky: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      floating: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    }
    return badges[type] || 'bg-gray-100 text-gray-800'
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      button: 'Bouton',
      link: 'Lien',
      banner: 'Bannière',
      popup: 'Popup',
      inline: 'Inline',
      sticky: 'Fixe',
      floating: 'Flottant',
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <AdminLayout title="Gestion des Call-to-Actions">
        <PageLoader text="Chargement des call-to-actions..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Gestion des Call-to-Actions"
      subtitle="Créez et gérez les call-to-actions réutilisables pour vos blocs"
      headerActions={
        <button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="w-full sm:w-auto bg-blue-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm sm:text-base font-medium transition-colors shadow-sm hover:shadow-md"
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="whitespace-nowrap">Nouveau Call-to-Action</span>
        </button>
      }
    >
      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {editingCta ? 'Modifier le Call-to-Action' : 'Créer un Nouveau Call-to-Action'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom (unique) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="bouton-principal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Libellé *
                </label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Bouton Principal"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Description du call-to-action"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="button">Bouton</option>
                  <option value="link">Lien</option>
                  <option value="banner">Bannière</option>
                  <option value="popup">Popup</option>
                  <option value="inline">Inline</option>
                  <option value="sticky">Fixe</option>
                  <option value="floating">Flottant</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Texte par défaut *
                </label>
                <input
                  type="text"
                  required
                  value={formData.default_text}
                  onChange={(e) => setFormData({ ...formData, default_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Cliquez ici"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL par défaut *
              </label>
              <input
                type="text"
                required
                value={formData.default_url}
                onChange={(e) => setFormData({ ...formData, default_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="# ou /page"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Styles (JSON)
              </label>
              <textarea
                value={formData.styles}
                onChange={(e) => setFormData({ ...formData, styles: e.target.value })}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-xs sm:text-sm"
                placeholder='{"background": "#3B82F6", "color": "#FFFFFF", "borderRadius": "8px", "padding": "12px 24px"}'
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Configuration (JSON)
              </label>
              <textarea
                value={formData.config}
                onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-xs sm:text-sm"
                placeholder='{"target": "_blank", "rel": "noopener"}'
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2 h-4 w-4"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Actif</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_global}
                  onChange={(e) => setFormData({ ...formData, is_global: e.target.checked })}
                  className="mr-2 h-4 w-4"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Global (disponible pour tous)</span>
              </label>
            </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {editingCta ? 'Mettre à jour' : 'Créer'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full sm:w-auto bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingCta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {viewingCta.label}
              </h2>
              <button
                onClick={() => setViewingCta(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Preview */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Aperçu</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-center">
                      {viewingCta.type === 'button' && (
                        <button
                          style={viewingCta.styles || {}}
                          className="px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                          {viewingCta.default_text}
                        </button>
                      )}
                      {viewingCta.type === 'link' && (
                        <a
                          href={viewingCta.default_url}
                          style={viewingCta.styles || {}}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {viewingCta.default_text}
                        </a>
                      )}
                      {viewingCta.type === 'banner' && (
                        <div
                          style={viewingCta.styles || {}}
                          className="w-full p-4 rounded-lg text-center"
                        >
                          {viewingCta.default_text}
                        </div>
                      )}
                      {['popup', 'inline', 'sticky', 'floating'].includes(viewingCta.type) && (
                        <div
                          style={viewingCta.styles || {}}
                          className="px-6 py-3 rounded-lg"
                        >
                          {viewingCta.default_text}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Nom</label>
                    <p className="text-sm font-mono text-gray-900 dark:text-gray-100">{viewingCta.name}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Type</label>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(viewingCta.type)}`}>
                      {getTypeLabel(viewingCta.type)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Texte par défaut</label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{viewingCta.default_text}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">URL par défaut</label>
                    <p className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">{viewingCta.default_url}</p>
                  </div>
                  {viewingCta.description && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">{viewingCta.description}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Statut</label>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      viewingCta.is_active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {viewingCta.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Visibilité</label>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      viewingCta.is_global 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {viewingCta.is_global ? 'Global' : 'Privé'}
                    </span>
                  </div>
                </div>

                {/* Styles */}
                {viewingCta.styles && Object.keys(viewingCta.styles).length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Styles</label>
                    <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-xs overflow-x-auto">
                      {JSON.stringify(viewingCta.styles, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Config */}
                {viewingCta.config && Object.keys(viewingCta.config).length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Configuration</label>
                    <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-xs overflow-x-auto">
                      {JSON.stringify(viewingCta.config, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  setViewingCta(null)
                  handleEdit(viewingCta)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Modifier
              </button>
              <button
                onClick={() => setViewingCta(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Confirmer la suppression
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Êtes-vous sûr de vouloir supprimer le call-to-action <strong className="text-gray-900 dark:text-gray-100">&quot;{deleteConfirm.ctaName}&quot;</strong> ?
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                Cette action est irréversible.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden w-full max-w-full">
        <div className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Call-to-Actions ({ctas.length})</h3>
          {ctas.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Aucun call-to-action créé. Créez-en un pour commencer.
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {ctas.map((cta) => (
                <div
                  key={cta.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => handleView(cta)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate flex-1 min-w-0">{cta.label}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getTypeBadge(cta.type)}`}>
                          {getTypeLabel(cta.type)}
                        </span>
                        {!cta.is_active && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 whitespace-nowrap">
                            Inactif
                          </span>
                        )}
                        {cta.is_global && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 whitespace-nowrap">
                            Global
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 break-words">
                        <span className="font-mono text-xs">{cta.name}</span>
                        {cta.description && ` - ${cta.description}`}
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-500 break-words">
                        Texte: &quot;{cta.default_text}&quot; → <span className="font-mono">{cta.default_url}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleEdit(cta)}
                        className="flex-1 sm:flex-none px-3 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        title="Modifier"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="hidden sm:inline">Modifier</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cta)}
                        className="flex-1 sm:flex-none px-3 py-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        title="Supprimer"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="hidden sm:inline">Supprimer</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </AdminLayout>
  )
}

