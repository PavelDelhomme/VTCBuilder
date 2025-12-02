'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import TenantLayout from '@/components/tenant/TenantLayout'
import ResponsiveTable from '@/components/shared/ResponsiveTable'
import userService, { User } from '@/services/user.service'
import toast from 'react-hot-toast'
import PageLoader from '@/components/shared/PageLoader'

export default function TenantUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'operator' as User['role'],
    password: '',
  })

  useEffect(() => {
    const currentUser = authService.getStoredUser()
    if (!currentUser || authService.isSuperAdmin()) {
      router.push('/admin/dashboard')
      return
    }
    loadUsers()
  }, [router])

  const loadUsers = async () => {
    try {
      // Le backend filtre déjà automatiquement par tenant dans UserViewSet.get_queryset()
      // On n'a pas besoin de filtrer côté frontend
      const data = await userService.getAll()
      // Les données sont déjà filtrées par le backend selon le tenant de l'utilisateur connecté
      const usersArray = Array.isArray(data) ? data : (data.results || data.data || [])
      setUsers(usersArray)
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const user = authService.getStoredUser()
      await userService.create({
        ...formData,
        tenant_id: user?.tenant_id,
        username: formData.email.split('@')[0],
      })
      setShowAddForm(false)
      setFormData({ email: '', first_name: '', last_name: '', role: 'operator', password: '' })
      toast.success('Utilisateur créé avec succès !')
      loadUsers()
    } catch (error: any) {
      console.error('Erreur création utilisateur:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la création')
    }
  }

  const handlePasswordReset = async (id: number, email: string) => {
    if (!confirm(`Envoyer un email de réinitialisation de mot de passe à ${email} ?`)) return
    try {
      const result = await userService.sendPasswordReset(id)
      toast.success(result.message || 'Email envoyé avec succès !')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi')
    }
  }

  const handleDelete = async (id: number, email: string, userName: string) => {
    const confirmMessage = `⚠️ ATTENTION ⚠️\n\nVous êtes sur le point de supprimer définitivement l'utilisateur "${userName || email}".\n\nCette action est IRRÉVERSIBLE.\n\nTapez "SUPPRIMER" pour confirmer :`
    
    const userInput = prompt(confirmMessage)
    if (userInput !== 'SUPPRIMER') {
      return
    }
    
    try {
      await userService.delete(id)
      toast.success('Utilisateur supprimé avec succès')
      loadUsers()
    } catch (error: any) {
      console.error('Erreur suppression:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression. Impossible de supprimer un super-admin.')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 dark:bg-gray-900 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    }
    return badges[status as keyof typeof badges] || 'bg-gray-100 dark:bg-gray-900 text-gray-800'
  }

  const getRoleBadge = (role: string) => {
    const badges = {
      'tenant-admin': 'bg-blue-100 text-blue-800',
      'driver': 'bg-green-100 text-green-800',
      'operator': 'bg-gray-100 dark:bg-gray-900 text-gray-800',
    }
    return badges[role as keyof typeof badges] || 'bg-gray-100 dark:bg-gray-900 text-gray-800'
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) {
    return (
      <TenantLayout title="Utilisateurs">
        <PageLoader text="Chargement des utilisateurs..." />
      </TenantLayout>
    )
  }

  return (
    <TenantLayout 
      title="Gestion des Utilisateurs" 
      subtitle="Gérez les utilisateurs de votre organisation"
      headerActions={
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-3 py-2 lg:px-4 rounded-lg hover:bg-blue-700 flex items-center text-sm lg:text-base"
        >
          <svg className="h-4 w-4 lg:h-5 lg:w-5 mr-1 lg:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="hidden sm:inline">{showAddForm ? 'Annuler' : 'Ajouter un utilisateur'}</span>
          <span className="sm:hidden">{showAddForm ? 'Annuler' : 'Ajouter'}</span>
        </button>
      }
    >
      {/* Add User Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 lg:p-6 mb-6">
          <h2 className="text-lg lg:text-xl font-semibold mb-4">Ajouter un utilisateur</h2>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mot de passe temporaire *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rôle
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="operator">Opérateur</option>
                    <option value="driver">Chauffeur</option>
                    <option value="tenant-admin">Administrateur</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Créer l'utilisateur
                  </button>
                </div>
              </form>
            </div>
          )}

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full lg:max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Users List */}
      <ResponsiveTable
        headers={['Utilisateur', 'Rôle', 'Status', 'Actions']}
        emptyMessage={search ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur pour le moment'}
      >
        {filteredUsers.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
              {search ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur pour le moment'}
            </td>
          </tr>
        ) : (
          filteredUsers.map((user) => (
          <tr key={user.id} className="hover:bg-gray-50 dark:bg-gray-900">
            <td className="px-4 sm:px-6 py-4">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name || user.email}</div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
            </td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                {user.role === 'tenant-admin' ? 'Administrateur' : user.role === 'driver' ? 'Chauffeur' : 'Opérateur'}
              </span>
            </td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.status)}`}>
                {user.status === 'active' ? 'Actif' : user.status === 'inactive' ? 'Inactif' : user.status === 'suspended' ? 'Suspendu' : 'En attente'}
              </span>
            </td>
            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div className="flex justify-end items-center space-x-2">
                <button
                  onClick={() => handlePasswordReset(user.id, user.email)}
                  className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                  title="Réinitialiser le mot de passe"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(user.id, user.email, user.name)}
                  className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="Supprimer définitivement"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          ))
        )}
      </ResponsiveTable>
    </TenantLayout>
  )
}

