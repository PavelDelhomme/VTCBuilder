'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/admin/AdminLayout'
import userService from '@/services/user.service'
import tenantService from '@/services/tenant.service'
import { toast } from 'react-hot-toast'

export default function NewUserPage() {
  const router = useRouter()
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'operator',
    tenant_id: null as number | null,
    status: 'active',
    password: '',
    confirm_password: '',
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    if (!authService.isSuperAdmin()) {
      router.push('/dashboard')
      return
    }
    
    loadTenants()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadTenants = async () => {
    try {
      const data = await tenantService.getAll()
      const tenantsArray = data?.results || (Array.isArray(data) ? data : [])
      setTenants(Array.isArray(tenantsArray) ? tenantsArray : [])
    } catch (error) {
      console.error('Error chargement tenants:', error)
      setTenants([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    // Validation
    if (!formData.email.trim()) {
      setError('L\'email est requis')
      setSaving(false)
      return
    }

    if (!formData.password.trim()) {
      setError('Le mot de passe est requis')
      setSaving(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      setSaving(false)
      return
    }

    if (formData.password !== formData.confirm_password) {
      setError('Les mots de passe ne correspondent pas')
      setSaving(false)
      return
    }

    // Si le rôle est super-admin, ne pas assigner de tenant
    if (formData.role === 'super-admin' && formData.tenant_id) {
      setError('Un super-admin ne peut pas être associé à un tenant')
      setSaving(false)
      return
    }

    // Si le rôle n'est pas super-admin, un tenant est requis
    if (formData.role !== 'super-admin' && !formData.tenant_id) {
      setError('Veuillez sélectionner un tenant (sauf pour super-admin)')
      setSaving(false)
      return
    }

    try {
      // Préparer les données pour l'API
      const createData: any = {
        email: formData.email.trim(),
        username: formData.username.trim() || formData.email.split('@')[0],
        first_name: formData.first_name.trim() || null,
        last_name: formData.last_name.trim() || null,
        phone: formData.phone.trim() || null,
        role: formData.role,
        status: formData.status,
        password: formData.password,
      }

      // Ajouter le tenant seulement si ce n'est pas un super-admin
      if (formData.role !== 'super-admin' && formData.tenant_id) {
        createData.tenant = formData.tenant_id
      }

      await userService.create(createData)
      toast.success('Utilisateur créé avec succès !')
      
      setTimeout(() => {
        router.push('/admin/users')
      }, 1500)
    } catch (error: any) {
      console.error('Error création utilisateur:', error)
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message ||
                          (typeof error.response?.data === 'string' ? error.response.data : null) ||
                          error.message ||
                          'Error lors de la création de l\'utilisateur'
      
      // Gérer les erreurs de quota
      if (error.response?.data?.quota) {
        setError(`Quota dépassé: ${errorMessage}. Actuellement: ${error.response.data.quota.current}/${error.response.data.quota.max}`)
      } else {
        setError(errorMessage)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Nouvel Utilisateur" subtitle="Chargement...">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Nouvel Utilisateur"
      subtitle="Créer un nouvel utilisateur"
      headerActions={
        <button
          onClick={() => router.push('/admin/users')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900"
        >
          Annuler
        </button>
      }
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-4xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <p className="font-semibold">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="user@example.com"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Auto-généré depuis l'email si vide"
              />
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prénom
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Rôle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rôle *
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => {
                  const newRole = e.target.value
                  setFormData({ 
                    ...formData, 
                    role: newRole,
                    // Si super-admin, enlever le tenant
                    tenant_id: newRole === 'super-admin' ? null : formData.tenant_id
                  })
                }}
                className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="operator">Opérateur</option>
                <option value="driver">Chauffeur</option>
                <option value="tenant-admin">Administrateur Tenant</option>
                <option value="super-admin">Super Administrateur</option>
              </select>
            </div>

            {/* Tenant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tenant {formData.role !== 'super-admin' ? '*' : ''}
              </label>
              <select
                required={formData.role !== 'super-admin'}
                disabled={formData.role === 'super-admin'}
                value={formData.tenant_id || ''}
                onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value ? parseInt(e.target.value) : null })}
                className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formData.role === 'super-admin' 
                    ? 'bg-gray-100 dark:bg-gray-900 dark:text-gray-400 cursor-not-allowed' 
                    : 'dark:bg-gray-700 dark:text-gray-100'
                }`}
              >
                <option value="">Sélectionner un tenant</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} ({tenant.email})
                  </option>
                ))}
              </select>
              {formData.role === 'super-admin' && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Les super-administrateurs ne sont pas associés à un tenant
                </p>
              )}
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="pending">En attente</option>
                <option value="suspended">Suspendu</option>
              </select>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mot de passe *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Minimum 8 caractères"
                minLength={8}
              />
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmer le mot de passe *
              </label>
              <input
                type="password"
                required
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Répétez le mot de passe"
                minLength={8}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/admin/users')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900"
              disabled={saving}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Création...' : 'Créer l\'utilisateur'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

