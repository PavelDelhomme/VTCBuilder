'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/AdminLayout'
import tenantService, { Tenant } from '@/services/tenant.service'
import PageLoader from '@/components/PageLoader'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function TenantsPage() {
  const router = useRouter()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<{ [key: number]: string }>({})
  const [navigating, setNavigating] = useState(false)
  const [sortField, setSortField] = useState<'name' | 'plan' | 'status' | 'email' | 'created_at' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    if (!authService.isSuperAdmin()) {
      router.push('/dashboard')
      return
    }
    loadTenants()
  }, [router])

  const loadTenants = async () => {
    try {
      const response = await tenantService.getAll()
      setTenants(response.results || response || [])
    } catch (error) {
      console.error('Erreur chargement tenants:', error)
      setTenants([])
    } finally {
      setLoading(false)
    }
  }

  const handleSuspend = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir suspendre ce tenant ?')) return
    setActionLoading({ ...actionLoading, [id]: 'suspend' })
    try {
      await tenantService.suspend(id)
      await loadTenants()
    } catch (error) {
      console.error('Erreur suspension:', error)
    } finally {
      setActionLoading({ ...actionLoading, [id]: '' })
    }
  }

  const handleActivate = async (id: number) => {
    setActionLoading({ ...actionLoading, [id]: 'activate' })
    try {
      await tenantService.activate(id)
      await loadTenants()
    } catch (error) {
      console.error('Erreur activation:', error)
    } finally {
      setActionLoading({ ...actionLoading, [id]: '' })
    }
  }

  const handleDelete = async (id: number, tenantName: string) => {
    const confirmMessage = `⚠️ SUPPRESSION TEMPORAIRE ⚠️\n\nVous êtes sur le point de marquer le tenant "${tenantName}" comme supprimé.\n\nCette action va :\n- Marquer le tenant comme supprimé (soft delete)\n- Le tenant sera définitivement supprimé après 1 mois\n- Vous pouvez le restaurer avant ce délai\n- Si le tenant a un abonnement actif, les utilisateurs seront désactivés au lieu d'être supprimés\n\nTapez "SUPPRIMER" pour confirmer :`
    
    const userInput = prompt(confirmMessage)
    if (userInput !== 'SUPPRIMER') {
      return
    }
    
    setActionLoading({ ...actionLoading, [id]: 'delete' })
    try {
      const result = await tenantService.delete(id)
      alert(result.message || 'Tenant marqué comme supprimé. Il sera définitivement supprimé après 1 mois. Vous pouvez le restaurer avant ce délai.')
      await loadTenants()
    } catch (error: any) {
      console.error('Erreur suppression:', error)
      alert(error.response?.data?.error || 'Erreur lors de la suppression du tenant')
    } finally {
      setActionLoading({ ...actionLoading, [id]: '' })
    }
  }

  const handleRestore = async (id: number, tenantName: string) => {
    if (!confirm(`Restaurer le tenant "${tenantName}" ?`)) return
    
    setActionLoading({ ...actionLoading, [id]: 'restore' })
    try {
      const result = await tenantService.restore(id)
      alert(result.message || 'Tenant restauré avec succès')
      await loadTenants()
    } catch (error: any) {
      console.error('Erreur restauration:', error)
      alert(error.response?.data?.error || 'Erreur lors de la restauration du tenant')
    } finally {
      setActionLoading({ ...actionLoading, [id]: '' })
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      trial: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-gray-100 dark:bg-gray-900 text-gray-800',
    }
    return badges[status as keyof typeof badges] || 'bg-gray-100 dark:bg-gray-900 text-gray-800'
  }

  const getPlanBadge = (plan: string) => {
    const badges = {
      starter: 'bg-blue-100 text-blue-800',
      business: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-indigo-100 text-indigo-800',
    }
    return badges[plan as keyof typeof badges] || 'bg-gray-100 dark:bg-gray-900 text-gray-800'
  }

  const handleSort = (field: 'name' | 'plan' | 'status' | 'email' | 'created_at') => {
    if (sortField === field) {
      // Si on clique sur la même colonne, inverser la direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Nouvelle colonne, trier par ordre croissant
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredAndSortedTenants = tenants
    .filter((tenant: Tenant) =>
      tenant.name.toLowerCase().includes(search.toLowerCase()) ||
      tenant.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a: Tenant, b: Tenant) => {
      if (!sortField) return 0

      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'plan':
          aValue = a.plan.toLowerCase()
          bValue = b.plan.toLowerCase()
          break
        case 'status':
          aValue = a.status.toLowerCase()
          bValue = b.status.toLowerCase()
          break
        case 'email':
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

  const SortIcon = ({ field }: { field: 'name' | 'plan' | 'status' | 'email' | 'created_at' }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 ml-1 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  if (loading || navigating) {
    return (
      <AdminLayout
        title="Gestion des Tenants"
        subtitle="Gérez tous vos clients et leurs sites"
      >
        <PageLoader text={navigating ? "Chargement des détails..." : "Chargement des tenants..."} />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Gestion des Tenants"
      subtitle="Gérez tous vos clients et leurs sites"
      headerActions={
        <button
          onClick={() => router.push('/admin/tenants/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nouveau Tenant
        </button>
      }
    >
          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Rechercher un tenant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tenants List */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Tenant
                        <SortIcon field="name" />
                      </div>
                    </th>
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden sm:table-cell"
                      onClick={() => handleSort('plan')}
                    >
                      <div className="flex items-center">
                        Plan
                        <SortIcon field="plan" />
                      </div>
                    </th>
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        <SortIcon field="status" />
                      </div>
                    </th>
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden md:table-cell"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center">
                        Email
                        <SortIcon field="email" />
                      </div>
                    </th>
                    <th 
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors hidden lg:table-cell"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center">
                        Créé le
                        <SortIcon field="created_at" />
                      </div>
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-900 z-10">
                      Actions
                    </th>
                  </tr>
                </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                {filteredAndSortedTenants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {search ? 'Aucun tenant trouvé' : 'Aucun tenant pour le moment'}
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedTenants.map((tenant) => (
                    <tr 
                      key={tenant.id} 
                      className="hover:bg-gray-50 dark:bg-gray-900 cursor-pointer"
                      onClick={(e) => {
                        // Ne pas naviguer si on clique sur un bouton d'action
                        if ((e.target as HTMLElement).closest('button')) {
                          return
                        }
                        setNavigating(true)
                        router.push(`/admin/tenants/${tenant.id}`)
                      }}
                    >
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[150px] sm:max-w-none">{tenant.name}</div>
                            {tenant.slug && (
                              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px] sm:max-w-none">/{tenant.slug}</div>
                            )}
                            <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden mt-1 truncate max-w-[150px]">{tenant.email}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden mt-1">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPlanBadge(tenant.plan)}`}>
                                {tenant.plan}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPlanBadge(tenant.plan)}`}>
                          {tenant.plan}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(tenant.status)}`}>
                            {tenant.status === 'trial' ? 'En Trial' : tenant.status}
                          </span>
                          {tenant.status === 'trial' && tenant.trial_ends_at && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Expire: {new Date(tenant.trial_ends_at).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                        <div className="truncate max-w-[200px]">{tenant.email}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                        {new Date(tenant.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white dark:bg-gray-800 z-10">
                        <div className="flex justify-end space-x-1 sm:space-x-2 flex-wrap gap-1 sm:gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setNavigating(true)
                              router.push(`/admin/tenants/${tenant.id}`)
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 sm:p-0"
                            title="Voir détails"
                          >
                            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {tenant.deleted_at ? (
                            // Tenant is soft deleted - show restore button
                            <button
                              onClick={() => handleRestore(tenant.id, tenant.name)}
                              disabled={actionLoading[tenant.id] === 'restore'}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed p-1 sm:p-0"
                              title="Restaurer le tenant"
                            >
                              {actionLoading[tenant.id] === 'restore' ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                              )}
                            </button>
                          ) : (
                            <>
                              {tenant.status === 'active' ? (
                                <button
                                  onClick={() => handleSuspend(tenant.id)}
                                  disabled={actionLoading[tenant.id] === 'suspend'}
                                  className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50 disabled:cursor-not-allowed p-1 sm:p-0"
                                  title="Suspendre"
                                >
                                  {actionLoading[tenant.id] === 'suspend' ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  )}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivate(tenant.id)}
                                  disabled={actionLoading[tenant.id] === 'activate'}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed p-1 sm:p-0"
                                  title="Activer"
                                >
                                  {actionLoading[tenant.id] === 'activate' ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                    </svg>
                                  )}
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(tenant.id, tenant.name)}
                                disabled={actionLoading[tenant.id] === 'delete'}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed p-1 sm:p-0"
                                title="Marquer comme supprimé (récupérable pendant 1 mois)"
                              >
                                {actionLoading[tenant.id] === 'delete' ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
    </AdminLayout>
  )
}

