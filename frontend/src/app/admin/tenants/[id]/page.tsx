'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/AdminLayout'
import tenantService, { Tenant } from '@/services/tenant.service'
import userService, { User } from '@/services/user.service'
import ResponsiveTable from '@/components/ResponsiveTable'
import toast from 'react-hot-toast'
import TenantBillingTab from './TenantBillingTab'
import TenantSiteTab from './TenantSiteTab'
import TenantSettingsTab from './TenantSettingsTab'
import PageLoader from '@/components/PageLoader'
import LoadingSpinner from '@/components/LoadingSpinner'

function AdminDebugSection({ tenantId }: { tenantId: number }) {
  const [adminInfo, setAdminInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('admin123')

  useEffect(() => {
    loadAdminInfo()
  }, [tenantId])

  const loadAdminInfo = async () => {
    try {
      setLoading(true)
      const info = await tenantService.getAdminInfo(tenantId)
      setAdminInfo(info)
    } catch (error) {
      console.error('Erreur chargement info admin:', error)
      setAdminInfo({ exists: false })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!confirm(`Réinitialiser le mot de passe de ${adminInfo?.email || 'l\'admin'} en "${password}" ?`)) {
      return
    }

    try {
      setResetting(true)
      const result = await tenantService.resetAdminPassword(tenantId, password)
      setShowPassword(true)
      toast.success('Mot de passe réinitialisé avec succès !')
      loadAdminInfo()
    } catch (error: any) {
      console.error('Erreur réinitialisation mot de passe:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la réinitialisation')
    } finally {
      setResetting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <LoadingSpinner size="sm" text="Chargement des informations admin..." />
      </div>
    )
  }

  if (!adminInfo || !adminInfo.exists) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">🔐 Informations Admin (Debug)</h3>
        <p className="text-yellow-800 dark:text-yellow-200">{adminInfo?.message || 'Aucun utilisateur admin trouvé pour ce tenant'}</p>
      </div>
    )
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-4">🔐 Informations Admin (Debug)</h3>
      
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <dt className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Email Admin</dt>
          <dd className="mt-1 text-sm text-yellow-900 dark:text-yellow-100 font-mono break-all">{adminInfo.email}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Username</dt>
          <dd className="mt-1 text-sm text-yellow-900 dark:text-yellow-100 font-mono">{adminInfo.username}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Statut</dt>
          <dd className="mt-1 text-sm text-yellow-900 dark:text-yellow-100 capitalize">{adminInfo.status}</dd>
        </div>
      </dl>

      <div className="border-t border-yellow-300 dark:border-yellow-700 pt-4 mt-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
          <div className="flex-1">
            <label htmlFor="password" className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Mot de passe à définir
            </label>
            <input
              id="password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-yellow-300 dark:border-yellow-700 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="admin123"
            />
          </div>
          <button
            onClick={handleResetPassword}
            disabled={resetting || !password}
            className="px-4 py-2 bg-yellow-600 dark:bg-yellow-700 text-white rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {resetting ? 'Réinitialisation...' : 'Réinitialiser'}
          </button>
        </div>

        {showPassword && (
          <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-700 rounded-lg">
            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">✅ Mot de passe réinitialisé !</p>
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              Email: <span className="font-mono font-semibold">{adminInfo.email}</span>
            </p>
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              Mot de passe: <span className="font-mono font-semibold">{password}</span>
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
              Vous pouvez maintenant vous connecter avec ces identifiants sur{' '}
              <a
                href="http://localhost:9494/login"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-yellow-900 dark:text-yellow-100 hover:text-yellow-800 dark:hover:text-yellow-200"
              >
                http://localhost:9494/login
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function TenantUsersTab({ tenantId, tenantName }: { tenantId: number; tenantName: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingPassword, setEditingPassword] = useState<number | null>(null)
  const [passwordData, setPasswordData] = useState<{ [key: number]: { new_password: string; confirm_password: string } }>({})
  const [passwordSaving, setPasswordSaving] = useState<{ [key: number]: boolean }>({})
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'operator' as 'tenant-admin' | 'driver' | 'operator',
    status: 'active' as 'active' | 'inactive' | 'suspended' | 'pending',
    password: '',
    confirm_password: '',
  })

  useEffect(() => {
    loadUsers()
  }, [tenantId])

  const loadUsers = async () => {
    try {
      setLoading(true)
      // Récupérer tous les utilisateurs du tenant spécifié
      const data = await userService.getAll({ tenant_id: tenantId })
      
      // Handle different response formats
      let usersArray: User[] = []
      if (Array.isArray(data)) {
        usersArray = data
      } else if (data && typeof data === 'object') {
        usersArray = data.results || data.data || []
      }
      
      setUsers(usersArray)
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error)
      toast.error('Erreur lors du chargement des utilisateurs')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (userId: number, userEmail: string) => {
    if (!confirm(`Envoyer un email de réinitialisation de mot de passe à ${userEmail} ?`)) {
      return
    }

    try {
      await userService.sendPasswordReset(userId)
      toast.success('Email de réinitialisation envoyé avec succès !')
    } catch (error: any) {
      console.error('Erreur envoi email reset:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi de l\'email')
    }
  }

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userEmail} ?`)) {
      return
    }

    try {
      await userService.delete(userId)
      toast.success('Utilisateur supprimé avec succès !')
      loadUsers()
    } catch (error: any) {
      console.error('Erreur suppression utilisateur:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression')
    }
  }

  const handleEditPassword = (userId: number) => {
    setEditingPassword(userId)
    setPasswordData({
      ...passwordData,
      [userId]: { new_password: '', confirm_password: '' }
    })
  }

  const handleCancelEditPassword = (userId: number) => {
    setEditingPassword(null)
    const newPasswordData = { ...passwordData }
    delete newPasswordData[userId]
    setPasswordData(newPasswordData)
  }

  const handleSavePassword = async (userId: number) => {
    const pwdData = passwordData[userId]
    if (!pwdData) return

    if (pwdData.new_password !== pwdData.confirm_password) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    if (pwdData.new_password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setPasswordSaving({ ...passwordSaving, [userId]: true })

    try {
      await userService.update(userId, {
        password: pwdData.new_password
      } as any)
      toast.success('Mot de passe modifié avec succès !')
      handleCancelEditPassword(userId)
      // Optionnel: forcer reconnexion utilisateur si besoin
    } catch (error: any) {
      console.error('Erreur modification mot de passe:', error)
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          (error.response?.data?.username ? `Erreur: ${error.response.data.username.join(', ')}` : null) ||
                          'Erreur lors de la modification du mot de passe'
      toast.error(errorMessage)
      console.error('Détails erreur:', error.response?.data)
    } finally {
      setPasswordSaving({ ...passwordSaving, [userId]: false })
    }
  }

  const handleOpenCreateModal = () => {
    setFormData({
      email: '',
      username: '',
      first_name: '',
      last_name: '',
      phone: '',
      role: 'operator',
      status: 'active',
      password: '',
      confirm_password: '',
    })
    setEditingUser(null)
    setShowCreateModal(true)
  }

  const handleOpenEditModal = (user: User) => {
    setFormData({
      email: user.email || '',
      username: user.username || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      role: (user.role as 'tenant-admin' | 'driver' | 'operator') || 'operator',
      status: (user.status as 'active' | 'inactive' | 'suspended' | 'pending') || 'active',
      password: '',
      confirm_password: '',
    })
    setEditingUser(user)
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setEditingUser(null)
    setFormData({
      email: '',
      username: '',
      first_name: '',
      last_name: '',
      phone: '',
      role: 'operator',
      status: 'active',
      password: '',
      confirm_password: '',
    })
  }

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Validation
      if (!formData.email.trim()) {
        toast.error('L\'email est requis')
        setSaving(false)
        return
      }

      if (editingUser) {
        // Mise à jour
        const updateData: any = {
          email: formData.email.trim(),
          username: formData.username.trim() || formData.email.split('@')[0],
          first_name: formData.first_name.trim() || null,
          last_name: formData.last_name.trim() || null,
          phone: formData.phone.trim() || null,
          role: formData.role,
          status: formData.status,
          tenant: tenantId,
        }

        // Ajouter le mot de passe seulement s'il est fourni
        if (formData.password && formData.password.length >= 8) {
          if (formData.password !== formData.confirm_password) {
            toast.error('Les mots de passe ne correspondent pas')
            setSaving(false)
            return
          }
          updateData.password = formData.password
        }

        await userService.update(editingUser.id, updateData)
        toast.success('Utilisateur mis à jour avec succès !')
      } else {
        // Création
        if (!formData.password || formData.password.length < 8) {
          toast.error('Le mot de passe doit contenir au moins 8 caractères')
          setSaving(false)
          return
        }

        if (formData.password !== formData.confirm_password) {
          toast.error('Les mots de passe ne correspondent pas')
          setSaving(false)
          return
        }

        const createData: any = {
          email: formData.email.trim(),
          username: formData.username.trim() || formData.email.split('@')[0],
          first_name: formData.first_name.trim() || null,
          last_name: formData.last_name.trim() || null,
          phone: formData.phone.trim() || null,
          role: formData.role,
          status: formData.status,
          password: formData.password,
          tenant: tenantId,
        }

        await userService.create(createData)
        toast.success('Utilisateur créé avec succès !')
      }

      handleCloseModal()
      loadUsers()
    } catch (error: any) {
      console.error('Erreur sauvegarde utilisateur:', error)
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message ||
                          (error.response?.data?.quota ? `Quota dépassé: ${error.response.data.quota.current}/${error.response.data.quota.max}` : null) ||
                          'Erreur lors de la sauvegarde de l\'utilisateur'
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateUserStatus = async (userId: number, newStatus: 'active' | 'inactive' | 'suspended' | 'pending') => {
    try {
      await userService.update(userId, { status: newStatus } as any)
      toast.success(`Statut mis à jour: ${newStatus}`)
      loadUsers()
    } catch (error: any) {
      console.error('Erreur mise à jour statut:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour du statut')
    }
  }

  const handleUpdateUserRole = async (userId: number, newRole: 'tenant-admin' | 'driver' | 'operator') => {
    try {
      await userService.update(userId, { role: newRole } as any)
      toast.success(`Rôle mis à jour: ${newRole}`)
      loadUsers()
    } catch (error: any) {
      console.error('Erreur mise à jour rôle:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour du rôle')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: string } = {
      active: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
      suspended: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    }
    return badges[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  }

  const getRoleBadge = (role: string) => {
    const badges: { [key: string]: string } = {
      'tenant-admin': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      'driver': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      'operator': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300',
    }
    return badges[role] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
  }

  const filteredUsers = users.filter(user => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.name?.toLowerCase().includes(searchLower) ||
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <PageLoader text="Chargement des utilisateurs..." />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Utilisateurs de {tenantName}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {users.length} utilisateur{users.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvel utilisateur
          </button>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {search ? 'Aucun utilisateur trouvé pour cette recherche' : 'Aucun utilisateur trouvé pour ce tenant'}
          </p>
          {!search && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              L'utilisateur admin devrait normalement apparaître ici. Vérifiez que le tenant a bien un admin.
            </p>
          )}
        </div>
      ) : (
        <ResponsiveTable
          headers={['Nom', 'Email', 'Rôle', 'Statut', 'Créé le', 'Actions']}
          emptyMessage="Aucun utilisateur"
        >
          {filteredUsers.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 dark:bg-gray-900">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user.first_name?.[0] || user.last_name?.[0] || user.email?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.name || user.email || 'Sans nom'}
                    </div>
                    {user.first_name || user.last_name ? (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.first_name} {user.last_name}
                      </div>
                    ) : null}
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-gray-100 font-mono">{user.email}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <select
                  value={user.role}
                  onChange={(e) => handleUpdateUserRole(user.id, e.target.value as 'tenant-admin' | 'driver' | 'operator')}
                  className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getRoleBadge(user.role)} cursor-pointer focus:ring-2 focus:ring-blue-500`}
                  disabled={user.role === 'super-admin'}
                >
                  <option value="tenant-admin">Admin Tenant</option>
                  <option value="driver">Driver</option>
                  <option value="operator">Operator</option>
                </select>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <select
                  value={user.status}
                  onChange={(e) => handleUpdateUserStatus(user.id, e.target.value as 'active' | 'inactive' | 'suspended' | 'pending')}
                  className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusBadge(user.status)} cursor-pointer focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="suspended">Suspendu</option>
                  <option value="pending">En attente</option>
                </select>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '-'}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                {editingPassword === user.id ? (
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Nouveau mot de passe"
                        value={passwordData[user.id]?.new_password || ''}
                        onChange={(e) => setPasswordData({
                          ...passwordData,
                          [user.id]: {
                            ...passwordData[user.id],
                            new_password: e.target.value,
                            confirm_password: passwordData[user.id]?.confirm_password || ''
                          }
                        })}
                        className="px-2 py-1 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded text-xs w-32"
                        minLength={8}
                      />
                      <input
                        type="password"
                        placeholder="Confirmer"
                        value={passwordData[user.id]?.confirm_password || ''}
                        onChange={(e) => setPasswordData({
                          ...passwordData,
                          [user.id]: {
                            ...passwordData[user.id],
                            confirm_password: e.target.value,
                            new_password: passwordData[user.id]?.new_password || ''
                          }
                        })}
                        className="px-2 py-1 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded text-xs w-32"
                        minLength={8}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSavePassword(user.id)}
                        disabled={passwordSaving[user.id]}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {passwordSaving[user.id] ? 'Sauvegarde...' : '✅ Sauvegarder'}
                      </button>
                      <button
                        onClick={() => handleCancelEditPassword(user.id)}
                        disabled={passwordSaving[user.id]}
                        className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 disabled:opacity-50"
                      >
                        ❌ Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    <button
                      onClick={() => handleOpenEditModal(user)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Modifier l'utilisateur"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEditPassword(user.id)}
                      className="text-green-600 hover:text-green-900"
                      title="Modifier le mot de passe directement"
                    >
                      🔒 Modifier MDP
                    </button>
                    <button
                      onClick={() => handleResetPassword(user.id, user.email)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Envoyer un email de réinitialisation"
                    >
                      🔑 Reset Email
                    </button>
                    {user.role !== 'tenant-admin' && user.role !== 'super-admin' && (
                      <button
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer l'utilisateur"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </ResponsiveTable>
      )}

      {/* Modal de création/édition d'utilisateur */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom d'utilisateur
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Généré automatiquement si vide"
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
                      className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rôle *
                    </label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'tenant-admin' | 'driver' | 'operator' })}
                      className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="operator">Operator</option>
                      <option value="driver">Driver</option>
                      <option value="tenant-admin">Tenant Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Statut *
                    </label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'suspended' | 'pending' })}
                      className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Actif</option>
                      <option value="inactive">Inactif</option>
                      <option value="suspended">Suspendu</option>
                      <option value="pending">En attente</option>
                    </select>
                  </div>

                  {!editingUser && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Mot de passe *
                        </label>
                        <input
                          type="password"
                          required={!editingUser}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          minLength={8}
                          placeholder="Minimum 8 caractères"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirmer le mot de passe {!editingUser && '*'}
                        </label>
                        <input
                          type="password"
                          required={!editingUser}
                          value={formData.confirm_password}
                          onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                          className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          minLength={8}
                          placeholder="Minimum 8 caractères"
                        />
                      </div>
                    </>
                  )}

                  {editingUser && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        💡 Pour modifier le mot de passe, utilisez le bouton "Modifier MDP" dans la liste des utilisateurs.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Enregistrement...' : editingUser ? 'Mettre à jour' : 'Créer l\'utilisateur'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

type Tab = 'overview' | 'users' | 'billing' | 'site' | 'settings'

export default function TenantDetailPage() {
  const router = useRouter()
  const params = useParams()
  const tenantId = params?.id ? parseInt(params.id as string) : null
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  useEffect(() => {
    if (!authService.isSuperAdmin()) {
      router.push('/dashboard')
      return
    }
    if (tenantId) {
      loadTenant()
    } else {
      setLoading(false)
    }
  }, [router, tenantId])

  const loadTenant = async () => {
    try {
      const data = await tenantService.getById(tenantId!)
      setTenant(data)
    } catch (error) {
      // Erreur chargement tenant - redirection vers liste
      router.push('/admin/tenants')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout
        title="Détails du Tenant"
        subtitle="Informations du tenant"
      >
        <PageLoader text="Chargement des détails du tenant..." />
      </AdminLayout>
    )
  }

  if (!tenant) {
    return null
  }

  const tabs = [
    { id: 'overview' as Tab, name: 'Vue d\'ensemble', icon: '📊' },
    { id: 'users' as Tab, name: 'Utilisateurs', icon: '👥' },
    { id: 'billing' as Tab, name: 'Facturation', icon: '💳' },
    { id: 'site' as Tab, name: 'Site Web', icon: '🌐' },
    { id: 'settings' as Tab, name: 'Paramètres', icon: '⚙️' },
  ]

  return (
    <AdminLayout
      title={tenant.name}
      subtitle={tenant.email}
      headerActions={
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => router.push('/admin/tenants')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-sm"
          >
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            tenant.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
            tenant.status === 'suspended' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
            'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
          }`}>
            {tenant.status}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            tenant.plan === 'enterprise' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' :
            tenant.plan === 'business' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
            'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
          }`}>
            {tenant.plan}
          </span>
        </div>
      }
    >
      {/* Tabs - Responsive */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mb-6">
        {/* Mobile: Select dropdown */}
        <div className="lg:hidden py-4">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as Tab)}
            className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.icon} {tab.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Desktop: Horizontal tabs */}
        <nav className="hidden lg:flex -mb-px space-x-4 sm:space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Informations du Tenant</h2>
                <dl className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{tenant.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{tenant.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Slug</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">/{tenant.slug}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 capitalize">{tenant.plan}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Statut</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 capitalize">{tenant.status}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Créé le</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {new Date(tenant.created_at).toLocaleDateString('fr-FR')}
                    </dd>
                </div>
              </dl>
            </div>

            <AdminDebugSection tenantId={tenantId!} />
          </div>
        )}

        {activeTab === 'users' && (
          <TenantUsersTab tenantId={tenantId!} tenantName={tenant.name} />
        )}

        {activeTab === 'billing' && (
          <TenantBillingTab tenantId={tenantId!} tenantName={tenant.name} />
        )}

        {activeTab === 'site' && (
          <TenantSiteTab tenantId={tenantId!} tenantName={tenant.name} tenantSlug={tenant.slug} />
        )}

        {activeTab === 'settings' && (
          <TenantSettingsTab tenantId={tenantId!} tenantName={tenant.name} />
        )}
      </div>
    </AdminLayout>
  )
}

