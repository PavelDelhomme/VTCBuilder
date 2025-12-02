'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/AdminLayout'
import userService, { User } from '@/services/user.service'
import toast from 'react-hot-toast'
import PageLoader from '@/components/PageLoader'
import LoadingSpinner from '@/components/LoadingSpinner'

// Composant pour les actions mobiles
function UserActionsMobile({
  user,
  onEdit,
  onImpersonate,
  onPasswordReset,
  onActivate,
  onDeactivate,
  onSuspend,
  onDelete,
}: {
  user: User
  onEdit: () => void
  onImpersonate: () => void
  onPasswordReset: () => void
  onActivate: () => void
  onDeactivate: () => void
  onSuspend: () => void
  onDelete: () => void
}) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowMenu(!showMenu)
        }}
        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        title="Actions"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                  setShowMenu(false)
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier
              </button>
              {user.role !== 'super-admin' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onImpersonate()
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Impersonner
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onPasswordReset()
                  setShowMenu(false)
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Réinitialiser mot de passe
              </button>
              {user.status === 'active' ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeactivate()
                      setShowMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Désactiver
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSuspend()
                      setShowMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Suspendre
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onActivate()
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  Activer
                </button>
              )}
              {user.role !== 'super-admin' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<{ [key: number]: string }>({})

  useEffect(() => {
    if (!authService.isSuperAdmin()) {
      router.push('/dashboard')
      return
    }
    loadUsers()
  }, [router])

  const loadUsers = async () => {
    try {
      const data = await userService.getAll()
      setUsers(data)
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleActivate = async (id: number) => {
    setActionLoading({ ...actionLoading, [id]: 'activate' })
    try {
      await userService.activate(id)
      toast.success('Utilisateur activé')
      await loadUsers()
    } catch (error) {
      console.error('Erreur activation:', error)
      toast.error('Erreur lors de l\'activation')
    } finally {
      setActionLoading({ ...actionLoading, [id]: '' })
    }
  }

  const handleDeactivate = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver cet utilisateur ?')) return
    setActionLoading({ ...actionLoading, [id]: 'deactivate' })
    try {
      await userService.deactivate(id)
      toast.success('Utilisateur désactivé')
      await loadUsers()
    } catch (error) {
      console.error('Erreur désactivation:', error)
      toast.error('Erreur lors de la désactivation')
    } finally {
      setActionLoading({ ...actionLoading, [id]: '' })
    }
  }

  const handleSuspend = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir suspendre cet utilisateur ?')) return
    setActionLoading({ ...actionLoading, [id]: 'suspend' })
    try {
      await userService.suspend(id)
      toast.success('Utilisateur suspendu')
      await loadUsers()
    } catch (error) {
      console.error('Erreur suspension:', error)
      toast.error('Erreur lors de la suspension')
    } finally {
      setActionLoading({ ...actionLoading, [id]: '' })
    }
  }

  const handlePasswordReset = async (id: number, email: string) => {
    if (!confirm(`Envoyer un email de réinitialisation de mot de passe à ${email} ?`)) return
    setActionLoading({ ...actionLoading, [id]: 'password-reset' })
    try {
      const result = await userService.sendPasswordReset(id)
      toast.success(result.message || 'Email de réinitialisation envoyé avec succès !')
    } catch (error: any) {
      console.error('Erreur envoi reset password:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi de l\'email')
    } finally {
      setActionLoading({ ...actionLoading, [id]: '' })
    }
  }

  const handleImpersonate = async (id: number, email: string) => {
    if (!confirm(`Impersonner l'utilisateur ${email} ?\n\nVous serez connecté en tant que cet utilisateur pour gérer ses problèmes.`)) {
      return
    }
    
    setActionLoading({ ...actionLoading, [id]: 'impersonate' })
    try {
      const result = await userService.impersonate(id)
      
      // Update tokens in localStorage
      if (result.tokens?.access) {
        localStorage.setItem('token', result.tokens.access)
        localStorage.setItem('refresh_token', result.tokens.refresh)
        localStorage.setItem('user', JSON.stringify(result.target_user))
      }
      
      toast.success(result.message || 'Impersonnification démarrée')
      
      // Redirect to appropriate dashboard
      if (result.target_user?.role === 'tenant-admin') {
        router.push('/dashboard')
      } else {
        router.push('/dashboard')
      }
      
      // Reload page to refresh user context
      window.location.reload()
    } catch (error: any) {
      console.error('Erreur impersonnification:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de l\'impersonnification')
      setActionLoading({ ...actionLoading, [id]: '' })
    }
  }

  const handleDelete = async (id: number, email: string, userName: string, role: string) => {
    // Prevent deletion of super-admin
    if (role === 'super-admin') {
      toast.error('Impossible de supprimer un super-admin')
      return
    }

    const confirmMessage = `⚠️ ATTENTION ⚠️\n\nVous êtes sur le point de supprimer définitivement l'utilisateur "${userName || email}".\n\nCette action est IRRÉVERSIBLE.\n\nTapez "SUPPRIMER" pour confirmer :`
    
    const userInput = prompt(confirmMessage)
    if (userInput !== 'SUPPRIMER') {
      return
    }
    
    setActionLoading({ ...actionLoading, [id]: 'delete' })
    try {
      await userService.delete(id)
      toast.success('Utilisateur supprimé avec succès')
      await loadUsers()
    } catch (error: any) {
      console.error('Erreur suppression:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression. Impossible de supprimer un super-admin.')
    } finally {
      setActionLoading({ ...actionLoading, [id]: '' })
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
      'super-admin': 'bg-purple-100 text-purple-800',
      'tenant-admin': 'bg-blue-100 text-blue-800',
      'driver': 'bg-green-100 text-green-800',
      'operator': 'bg-gray-100 dark:bg-gray-900 text-gray-800',
    }
    return badges[role as keyof typeof badges] || 'bg-gray-100 dark:bg-gray-900 text-gray-800'
  }

  const filteredUsers = users.filter(user => {
    const searchLower = search.toLowerCase()
    return (
      user.email.toLowerCase().includes(searchLower) ||
      (user.name && user.name.toLowerCase().includes(searchLower)) ||
      (user.tenant_name && user.tenant_name.toLowerCase().includes(searchLower))
    )
  })

  if (loading) {
    return (
      <AdminLayout title="Gestion des Utilisateurs" subtitle="Gérez tous les utilisateurs de la plateforme">
        <PageLoader text="Chargement des utilisateurs..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Gestion des Utilisateurs"
      subtitle="Gérez tous les utilisateurs de la plateforme"
      headerActions={
        <button
          onClick={() => router.push('/admin/users/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel utilisateur
        </button>
      }
    >
      <div className="w-full h-full min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto pb-6">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden w-full max-w-full">
            <div className="overflow-x-auto -mx-3 sm:-mx-4 lg:-mx-6 xl:-mx-8 px-3 sm:px-4 lg:px-6 xl:px-8">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px] sticky left-0 bg-gray-50 dark:bg-gray-900 z-20 shadow-[2px_0_4px_rgba(0,0,0,0.1)]">
                      Utilisateur
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                      Rôle
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px] hidden md:table-cell">
                      Tenant
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[110px] hidden lg:table-cell">
                      Créé le
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[160px] sticky right-0 bg-gray-50 dark:bg-gray-900 z-20 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 sm:px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {search ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur pour le moment'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                      onClick={(e) => {
                        // Ne pas naviguer si on clique sur un bouton d'action
                        if ((e.target as HTMLElement).closest('button')) {
                          return
                        }
                        router.push(`/admin/users/${user.id}`)
                      }}
                    >
                      <td className="px-3 sm:px-6 py-4 sticky left-0 bg-white dark:bg-gray-800 z-10 min-w-[200px] shadow-[2px_0_4px_rgba(0,0,0,0.1)]">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">{user.name || user.email}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 break-words">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap min-w-[100px]">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 dark:text-gray-400 min-w-[150px] hidden md:table-cell">
                        <div className="break-words">{user.tenant_name || user.tenant?.name || '-'}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap min-w-[100px]">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell min-w-[110px]">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white dark:bg-gray-800 z-10 min-w-[160px] shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">
                        <div className="flex justify-end items-center gap-1 sm:gap-2 flex-nowrap" onClick={(e) => e.stopPropagation()}>
                          {/* Mobile: Bouton Actions avec popup */}
                          <div className="sm:hidden relative">
                            <UserActionsMobile
                              user={user}
                              onEdit={() => router.push(`/admin/users/${user.id}`)}
                              onImpersonate={() => handleImpersonate(user.id, user.email)}
                              onPasswordReset={() => handlePasswordReset(user.id, user.email)}
                              onActivate={() => handleActivate(user.id)}
                              onDeactivate={() => handleDeactivate(user.id)}
                              onSuspend={() => handleSuspend(user.id)}
                              onDelete={() => handleDelete(user.id, user.email, user.name, user.role)}
                            />
                          </div>
                          {/* Desktop: Boutons individuels */}
                          <div className="hidden sm:flex justify-end items-center gap-1 sm:gap-2 flex-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/admin/users/${user.id}`)
                            }}
                            className="text-indigo-600 hover:text-indigo-900 p-1 sm:p-0"
                            title="Modifier l'utilisateur"
                          >
                            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {user.role !== 'super-admin' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleImpersonate(user.id, user.email)
                              }}
                              className="text-purple-600 hover:text-purple-900 p-1 sm:p-0"
                              title="Impersonner cet utilisateur"
                            >
                              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePasswordReset(user.id, user.email)
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 sm:p-0"
                            title="Réinitialiser le mot de passe"
                          >
                            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                          </button>
                          {user.status === 'active' ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeactivate(user.id)
                                }}
                                className="text-yellow-600 hover:text-yellow-900 p-1 sm:p-0"
                                title="Désactiver"
                              >
                                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSuspend(user.id)
                                }}
                                className="text-red-600 hover:text-red-900 p-1 sm:p-0"
                                title="Suspendre"
                              >
                                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleActivate(user.id)
                              }}
                              className="text-green-600 hover:text-green-900 p-1 sm:p-0"
                              title="Activer"
                            >
                              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                            </button>
                          )}
                          {user.role !== 'super-admin' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(user.id, user.email, user.name, user.role)
                              }}
                              className="text-red-600 hover:text-red-900 p-1 sm:p-0"
                              title="Supprimer définitivement"
                            >
                              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          </div>
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

