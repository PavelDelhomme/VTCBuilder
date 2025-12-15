'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/admin/AdminLayout'
import userService, { User } from '@/services/user.service'
import tenantService from '@/services/tenant.service'
import { toast } from 'react-hot-toast'
import PageLoader from '@/components/shared/PageLoader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params?.id ? parseInt(params.id as string) : null
  const [user, setUser] = useState<User | null>(null)
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: '',
    tenant_id: null as number | null,
    status: '',
  })

  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: '',
  })

  useEffect(() => {
    // Vérifier côté client uniquement
    if (typeof window === 'undefined') return
    
    if (!authService.isSuperAdmin()) {
      router.push('/dashboard')
      return
    }
    
    if (userId) {
      loadUser()
      loadTenants()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const loadUser = async () => {
    if (!userId) return
    try {
      const userData = await userService.getById(userId)
      setUser(userData)
      setFormData({
        email: userData.email || '',
        username: userData.username || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        phone: userData.phone || '',
        role: userData.role || '',
        tenant_id: userData.tenant_id || null,
        status: userData.status || 'active',
      })
    } catch (error) {
      console.error('Error chargement utilisateur:', error)
      setError('Error lors du chargement de l\'utilisateur')
    } finally {
      setLoading(false)
    }
  }

  const loadTenants = async () => {
    try {
      const data = await tenantService.getAll()
      // L'API peut retourner un objet paginé {results: [...]} ou un tableau direct
      // Utiliser la même logique que dans admin/tenants/page.tsx: response.results || response || []
      const tenantsArray = data?.results || (Array.isArray(data) ? data : [])
      setTenants(Array.isArray(tenantsArray) ? tenantsArray : [])
    } catch (error) {
      console.error('Error chargement tenants:', error)
      // En cas d'erreur, s'assurer que tenants reste un tableau vide
      setTenants([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setError('')
    setSuccess('')
    setSaving(true)

    try {
      // Préparer les données pour l'API
      const updateData: any = {
        email: formData.email,
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || null,
        role: formData.role,
        status: formData.status,
      }

      // Ajouter le tenant seulement si ce n'est pas un super-admin
      if (formData.role !== 'super-admin') {
        updateData.tenant = formData.tenant_id || null
      } else {
        updateData.tenant = null
      }

      const updatedUser = await userService.update(userId, updateData)
      setSuccess('Utilisateur mis à jour avec succès !')
      
      // Si l'email a été modifié, mettre à jour le localStorage et forcer une reconnexion si c'est l'utilisateur connecté
      const currentUser = authService.getStoredUser()
      if (currentUser && currentUser.id === userId && formData.email !== user?.email) {
        // Email changé pour l'utilisateur connecté - nettoyer le localStorage
        authService.logout()
        toast.success('Email modifié. Veuillez vous reconnecter avec le nouvel email.')
        setTimeout(() => {
          authService.saveRedirectUrl()
          router.push('/login')
        }, 2000)
        return
      }
      
      setTimeout(() => {
        router.push('/admin/users')
      }, 1500)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          (error.response?.data && typeof error.response.data === 'object' 
                            ? JSON.stringify(error.response.data) 
                            : 'Error lors de la mise à jour')
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (passwordData.new_password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setError('')
    setSaving(true)

    try {
      await userService.update(userId, {
        password: passwordData.new_password,
      } as any)
      setSuccess('Mot de passe changé avec succès !')
      setPasswordData({ new_password: '', confirm_password: '' })
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error lors du changement de mot de passe')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Édition Utilisateur" subtitle="Modifier les informations de l'utilisateur">
        <PageLoader text="Chargement de l'utilisateur..." />
      </AdminLayout>
    )
  }

  if (!user) {
    return (
      <AdminLayout title="Édition Utilisateur" subtitle="Utilisateur non trouvé">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Utilisateur non trouvé</p>
          <button
            onClick={() => router.push('/admin/users')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Retour à la liste
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title={`Édition Utilisateur`}
      subtitle={`Modifier les informations de ${user.name || user.email}`}
    >
      <div className="space-y-6">
        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Formulaire principal */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Informations de l'utilisateur</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom d'utilisateur *
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Prénom */}
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prénom
                </label>
                <input
                  id="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Nom */}
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom
                </label>
                <input
                  id="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Téléphone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Téléphone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Rôle */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rôle *
                </label>
                <select
                  id="role"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="super-admin">Super Admin</option>
                  <option value="tenant-admin">Tenant Admin</option>
                  <option value="driver">Driver</option>
                  <option value="operator">Operator</option>
                </select>
              </div>

              {/* Tenant */}
              <div>
                <label htmlFor="tenant_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tenant
                </label>
                <select
                  id="tenant_id"
                  value={formData.role === 'super-admin' ? '' : (formData.tenant_id || '')}
                  onChange={(e) => {
                    if (formData.role !== 'super-admin') {
                      setFormData({ ...formData, tenant_id: e.target.value ? parseInt(e.target.value) : null })
                    }
                  }}
                  disabled={formData.role === 'super-admin'}
                  className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formData.role === 'super-admin' 
                      ? 'bg-gray-100 dark:bg-gray-900 dark:text-gray-400 cursor-not-allowed' 
                      : 'dark:bg-gray-700 dark:text-gray-100'
                  }`}
                >
                  <option value="">Aucun tenant</option>
                  {Array.isArray(tenants) && tenants.length > 0 && tenants.map((tenant: any) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
                {formData.role === 'super-admin' && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Les super admins n'ont pas de tenant</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Statut *
                </label>
                <select
                  id="status"
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="suspended">Suspendu</option>
                  <option value="pending">En attente</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.push('/admin/users')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>

        {/* Changement de mot de passe */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Changer le mot de passe</h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nouveau mot de passe *
                </label>
                <input
                  id="new_password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  minLength={8}
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Minimum 8 caractères</p>
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmer le mot de passe *
                </label>
                <input
                  id="confirm_password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  minLength={8}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                type="submit"
                disabled={saving || !passwordData.new_password || !passwordData.confirm_password}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Changement...' : 'Changer le mot de passe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}

