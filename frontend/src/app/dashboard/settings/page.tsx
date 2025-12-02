'use client'

import { useEffect, useState } from 'react'
import TenantLayout from '@/components/tenant/TenantLayout'
import tenantService from '@/services/tenant.service'
import authService from '@/services/auth.service'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tenant, setTenant] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    primary_color: '#3B82F6',
    secondary_color: '#8B5CF6',
  })

  useEffect(() => {
    loadTenant()
  }, [])

  const loadTenant = async () => {
    try {
      const user = authService.getStoredUser()
      if (user?.tenant_id) {
        const tenantData = await tenantService.getById(user.tenant_id)
        setTenant(tenantData)
        setFormData({
          name: tenantData.name || '',
          email: tenantData.email || '',
          primary_color: tenantData.primary_color || '#3B82F6',
          secondary_color: tenantData.secondary_color || '#8B5CF6',
        })
      }
    } catch (error) {
      console.error('Erreur chargement tenant:', error)
      toast.error('Erreur lors du chargement des paramètres')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenant) return

    setSaving(true)
    try {
      await tenantService.update(tenant.id, formData)
      toast.success('Paramètres mis à jour avec succès')
      loadTenant()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <TenantLayout title="Paramètres" subtitle="Configuration de votre site">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        </div>
      </TenantLayout>
    )
  }

  return (
    <TenantLayout 
      title="Paramètres" 
      subtitle="Configurez votre site VTC"
    >
      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Informations générales</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom de votre société
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ma Société VTC"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email de contact
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="contact@exemple.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="primary_color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Couleur primaire
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="primary_color"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="h-10 w-20 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="secondary_color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Couleur secondaire
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="secondary_color"
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    className="h-10 w-20 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#8B5CF6"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-4">Zone dangereuse</h2>
          <p className="text-sm text-red-700 mb-4">
            Ces actions sont irréversibles. Faites attention.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
                  toast.error('Fonctionnalité à implémenter')
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Supprimer mon compte
            </button>
          </div>
        </div>
      </div>
    </TenantLayout>
  )
}

