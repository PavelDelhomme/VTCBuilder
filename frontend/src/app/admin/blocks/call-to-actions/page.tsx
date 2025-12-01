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
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce call-to-action ?')) {
      return
    }
    try {
      await callToActionService.delete(id)
      toast.success('Call-to-Action supprimé avec succès !')
      loadCtas()
    } catch (error: any) {
      console.error('Erreur suppression CTA:', error)
      toast.error('Erreur lors de la suppression')
    }
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
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center text-sm"
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau Call-to-Action
        </button>
      }
    >
      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            {editingCta ? 'Modifier le Call-to-Action' : 'Créer un Nouveau Call-to-Action'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                placeholder='{"target": "_blank", "rel": "noopener"}'
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Actif</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_global}
                  onChange={(e) => setFormData({ ...formData, is_global: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Global (disponible pour tous)</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {editingCta ? 'Mettre à jour' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">Call-to-Actions ({ctas.length})</h3>
          {ctas.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Aucun call-to-action créé. Créez-en un pour commencer.
            </div>
          ) : (
            <div className="space-y-4">
              {ctas.map((cta) => (
                <div
                  key={cta.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{cta.label}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(cta.type)}`}>
                          {getTypeLabel(cta.type)}
                        </span>
                        {!cta.is_active && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                            Inactif
                          </span>
                        )}
                        {cta.is_global && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Global
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="font-mono text-xs">{cta.name}</span>
                        {cta.description && ` - ${cta.description}`}
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        Texte: "{cta.default_text}" → {cta.default_url}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(cta)}
                        className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800 text-sm"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(cta.id)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800 text-sm"
                      >
                        Supprimer
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

