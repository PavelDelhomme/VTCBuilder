'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/admin/AdminLayout'
import tenantService, { Tenant } from '@/services/tenant.service'
import userService from '@/services/user.service'
import PageLoader from '@/components/shared/PageLoader'
import LoadingSpinner from '@/components/shared/LoadingSpinner'
import ActionsDropdown, { ActionItem } from '@/components/shared/ActionsDropdown'
import toast from 'react-hot-toast'
import { useNavigationLoading } from '@/hooks/useNavigationLoading'

export default function TenantsPage() {
  const router = useRouter()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<{ [key: number]: string }>({})
  const { isNavigating, navigate } = useNavigationLoading()
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
      console.error('Error chargement tenants:', error)
      setTenants([])
    } finally {
      setLoading(false)
    }
  }

  const handleSuspend = async (id: number, tenantName: string) => {
    if (!confirm(`⚠️ SUSPENSION ⚠️\n\nVous êtes sur le point de suspendre le tenant "${tenantName}".\n\nCette action va :\n- Empêcher l'accès au tenant\n- Les utilisateurs ne pourront plus se connecter\n\nÊtes-vous sûr de vouloir continuer ?`)) return
    setActionLoading({ ...actionLoading, [id]: 'suspend' })
    try {
      await tenantService.suspend(id)
      toast.success('Tenant suspendu avec succès')
      await loadTenants()
    } catch (error: any) {
      console.error('Error suspension:', error)
      toast.error(error.response?.data?.error || 'Error lors de la suspension')
    } finally {
      setActionLoading({ ...actionLoading, [id]: '' })
    }
  }

  const handleActivate = async (id: number, tenantName: string) => {
    if (!confirm(`Activer le tenant "${tenantName}" ?\n\nCette action va restaurer l'accès complet au tenant.`)) return
    setActionLoading({ ...actionLoading, [id]: 'activate' })
    try {
      await tenantService.activate(id)
      toast.success('Tenant activé avec succès')
      await loadTenants()
    } catch (error: any) {
      console.error('Error activation:', error)
      toast.error(error.response?.data?.error || 'Error lors de l\'activation')
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
      console.error('Error suppression:', error)
      alert(error.response?.data?.error || 'Error lors de la suppression du tenant')
    } finally {
      setActionLoading({ ...actionLoading, [id]: '' })
    }
  }

  const handleRestore = async (id: number, tenantName: string) => {
    if (!confirm(`⚠️ RESTAURATION ⚠️\n\nVous êtes sur le point de restaurer le tenant "${tenantName}".\n\nCette action va :\n- Restaurer l'accès au tenant\n- Réactiver tous les utilisateurs associés\n\nÊtes-vous sûr de vouloir continuer ?`)) return
    
    setActionLoading({ ...actionLoading, [id]: 'restore' })
    try {
      const result = await tenantService.restore(id)
      toast.success(result.message || 'Tenant restauré avec succès')
      await loadTenants()
    } catch (error: any) {
      console.error('Error restauration:', error)
      toast.error(error.response?.data?.error || 'Error lors de la restauration du tenant')
    } finally {
      setActionLoading({ ...actionLoading, [id]: '' })
    }
  }

  const handleImpersonate = async (tenant: Tenant) => {
    if (!confirm(`⚠️ IMPERSONNIFICATION ⚠️\n\nVous êtes sur le point d'impersonner l'administrateur du tenant "${tenant.name}".\n\nVous serez connecté en tant que cet administrateur pour gérer ses problèmes.\n\nÊtes-vous sûr de vouloir continuer ?`)) return
    
    setActionLoading({ ...actionLoading, [tenant.id]: 'impersonate' })
    try {
      // Récupérer l'utilisateur admin du tenant
      const users = await userService.getAll()
      const adminUser = users.find((u: any) => u.tenant?.id === tenant.id && u.role === 'tenant-admin')
      
      if (!adminUser) {
        toast.error('Aucun administrateur trouvé pour ce tenant')
        setActionLoading({ ...actionLoading, [tenant.id]: '' })
        return
      }

      const result = await userService.impersonate(adminUser.id)
      
      // Update tokens in localStorage
      if (result.tokens?.access) {
        localStorage.setItem('token', result.tokens.access)
        localStorage.setItem('refresh_token', result.tokens.refresh)
        localStorage.setItem('user', JSON.stringify(result.target_user))
      }
      
      toast.success(result.message || 'Impersonnification démarrée')
      
      // Redirect to dashboard
      router.push('/dashboard')
      
      // Reload page to refresh user context
      window.location.reload()
    } catch (error: any) {
      console.error('Error impersonnification:', error)
      toast.error(error.response?.data?.error || 'Error lors de l\'impersonnification')
      setActionLoading({ ...actionLoading, [tenant.id]: '' })
    }
  }

  const handlePasswordReset = async (tenant: Tenant) => {
    if (!confirm(`⚠️ RÉINITIALISATION MOT DE PASSE ⚠️\n\nVous êtes sur le point de réinitialiser le mot de passe de l'administrateur du tenant "${tenant.name}".\n\nLe mot de passe sera réinitialisé à "admin123" par défaut.\n\nÊtes-vous sûr de vouloir continuer ?`)) return
    
    setActionLoading({ ...actionLoading, [tenant.id]: 'password-reset' })
    try {
      await tenantService.resetAdminPassword(tenant.id, 'admin123')
      toast.success('Mot de passe réinitialisé avec succès. Le nouveau mot de passe est "admin123"')
    } catch (error: any) {
      console.error('Error réinitialisation mot de passe:', error)
      toast.error(error.response?.data?.error || error.message || 'Error lors de la réinitialisation du mot de passe')
    } finally {
      setActionLoading({ ...actionLoading, [tenant.id]: '' })
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
      starter: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      business: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      enterprise: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    }
    return badges[plan as keyof typeof badges] || 'bg-gray-100 dark:bg-gray-900 text-gray-800'
  }

  const getTenantType = (tenant: Tenant) => {
    // Tenant système/public pour le site VTCBuilder
    if (tenant.slug === 'vtcbuilder-public-website') {
      return { type: 'system', label: 'Site Public', color: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' }
    }
    // Schéma public PostgreSQL
    if (tenant.slug === 'public' || tenant.schema_name === 'public') {
      return { type: 'public-schema', label: 'Schéma Public', color: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white' }
    }
    // Tenant de référence (ancien, à supprimer éventuellement)
    if (tenant.slug === 'reference-tenant') {
      return { type: 'reference', label: 'Référence', color: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' }
    }
    // Tenants clients/utilisateurs
    return { type: 'client', label: 'Client', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' }
  }

  const isSystemTenant = (tenant: Tenant): boolean => {
    return tenant.slug === 'vtcbuilder-public-website' || 
           tenant.slug === 'public' || 
           tenant.schema_name === 'public' || 
           tenant.slug === 'reference-tenant'
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

  // Séparer les tenants système des tenants clients
  const allFilteredTenants = tenants.filter((tenant: Tenant) =>
    tenant.name.toLowerCase().includes(search.toLowerCase()) ||
    tenant.email.toLowerCase().includes(search.toLowerCase())
  )

  const systemTenants = allFilteredTenants.filter((tenant: Tenant) => isSystemTenant(tenant))
  const clientTenants = allFilteredTenants.filter((tenant: Tenant) => !isSystemTenant(tenant))

  const sortTenants = (tenantsList: Tenant[]) => {
    return [...tenantsList].sort((a: Tenant, b: Tenant) => {
      // Prioriser le tri par type de tenant (système en premier, puis clients)
      const aType = getTenantType(a).type
      const bType = getTenantType(b).type
      const typeOrder: { [key: string]: number } = {
        'system': 1,
        'public-schema': 2,
        'reference': 3,
        'client': 4,
      }
      const aTypeOrder = typeOrder[aType] || 99
      const bTypeOrder = typeOrder[bType] || 99
      if (aTypeOrder !== bTypeOrder) {
        return aTypeOrder - bTypeOrder
      }
      
      // Ensuite, appliquer le tri normal
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
  }

  const sortedSystemTenants = sortTenants(systemTenants)
  const sortedClientTenants = sortTenants(clientTenants)

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

  if (loading || isNavigating) {
    return (
      <AdminLayout
        title="Gestion des Tenants"
        subtitle="Gérez tous vos clients et leurs sites"
      >
        <PageLoader text={isNavigating ? "Chargement..." : "Chargement des tenants..."} />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Gestion des Tenants"
      subtitle="Gérez tous vos clients et leurs sites"
      headerActions={
        <button
          onClick={() => navigate('/admin/tenants/new')}
          disabled={isNavigating}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nouveau Tenant
        </button>
      }
    >
          {/* Info Section */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Types de Tenants</h3>
                <div className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 inline-flex text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white">Site Public</span>
                    <span>Tenant système pour le site public VTCBuilder (vtcbuilder-public-website)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 inline-flex text-xs font-semibold rounded-full bg-gradient-to-r from-gray-500 to-gray-600 text-white">Schéma Public</span>
                    <span>Schéma PostgreSQL public (données partagées)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Client</span>
                    <span>Tenants des clients/utilisateurs de la plateforme</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

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

          {/* Tenants Système VTCBuilder */}
          {sortedSystemTenants.length > 0 && (
            <div className="mb-8">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Tenants Système VTCBuilder
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Tenants spécifiques à la plateforme VTCBuilder (site public, schéma public, référence)
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden w-full max-w-full">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-blue-50 dark:bg-blue-900/20">
                      <tr>
                        <th 
                          className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors min-w-[200px]"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center">
                            Tenant
                            <SortIcon field="name" />
                          </div>
                        </th>
                        <th 
                          className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors min-w-[120px] hidden sm:table-cell"
                          onClick={() => handleSort('plan')}
                        >
                          <div className="flex items-center">
                            Plan
                            <SortIcon field="plan" />
                          </div>
                        </th>
                        <th 
                          className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors min-w-[100px]"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center">
                            Status
                            <SortIcon field="status" />
                          </div>
                        </th>
                        <th 
                          className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors min-w-[180px] hidden md:table-cell"
                          onClick={() => handleSort('email')}
                        >
                          <div className="flex items-center">
                            Email
                            <SortIcon field="email" />
                          </div>
                        </th>
                        <th 
                          className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors min-w-[110px] hidden lg:table-cell"
                          onClick={() => handleSort('created_at')}
                        >
                          <div className="flex items-center">
                            Créé le
                            <SortIcon field="created_at" />
                          </div>
                        </th>
                        <th className="px-2 sm:px-3 lg:px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {sortedSystemTenants.map((tenant) => (
                    <tr 
                      key={tenant.id} 
                      className="hover:bg-gray-50 dark:bg-gray-900 cursor-pointer"
                      onClick={(e) => {
                        // Ne pas naviguer si on clique sur un bouton d'action
                        if ((e.target as HTMLElement).closest('button')) {
                          return
                        }
                        navigate(`/admin/tenants/${tenant.id}`)
                      }}
                    >
                      <td className="px-3 sm:px-6 py-4 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">{tenant.name}</div>
                              {(() => {
                                const tenantType = getTenantType(tenant)
                                return (
                                  <span className={`px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${tenantType.color} shadow-sm`}>
                                    {tenantType.label}
                                  </span>
                                )
                              })()}
                            </div>
                            {tenant.slug && (
                              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-words mt-1">/{tenant.slug}</div>
                            )}
                            <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden mt-1 break-words">{tenant.email}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden mt-1">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPlanBadge(tenant.plan)}`}>
                                {tenant.plan}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell min-w-[120px]">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPlanBadge(tenant.plan)}`}>
                          {tenant.plan}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 min-w-[100px]">
                        <div className="flex flex-col">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${getStatusBadge(tenant.status)}`}>
                            {tenant.status === 'trial' ? 'En Trial' : tenant.status}
                          </span>
                          {tenant.status === 'trial' && tenant.trial_ends_at && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Expire: {new Date(tenant.trial_ends_at).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell min-w-[180px]">
                        <div className="break-words">{tenant.email}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell min-w-[110px]">
                        {new Date(tenant.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-2 sm:px-3 lg:px-4 py-4 whitespace-nowrap text-right text-sm font-medium min-w-[120px]">
                        <div className="flex justify-end items-center gap-1 sm:gap-2 flex-nowrap" onClick={(e) => e.stopPropagation()}>
                          {/* Desktop: Boutons individuels */}
                          <div className="hidden sm:flex justify-end items-center gap-1 sm:gap-2 flex-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/admin/tenants/${tenant.id}`)
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
                                    onClick={() => handleSuspend(tenant.id, tenant.name)}
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
                                    onClick={() => handleActivate(tenant.id, tenant.name)}
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
                          {/* Mobile: Menu dropdown avec trois points */}
                          <div className="sm:hidden">
                            <ActionsDropdown
                              actions={[
                                {
                                  label: 'Voir détails',
                                  icon: (
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  ),
                                  onClick: () => {
                                    navigate(`/admin/tenants/${tenant.id}`)
                                  },
                                },
                                ...(!tenant.deleted_at ? [
                                  {
                                    label: 'Impersonner l\'admin',
                                    icon: (
                                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                    ),
                                    onClick: () => handleImpersonate(tenant),
                                  },
                                  {
                                    label: 'Réinitialiser mot de passe admin',
                                    icon: (
                                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                      </svg>
                                    ),
                                    onClick: () => handlePasswordReset(tenant),
                                    divider: true,
                                  },
                                  ...(tenant.status === 'active' ? [
                                    {
                                      label: 'Suspendre',
                                      icon: (
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      ),
                                      onClick: () => handleSuspend(tenant.id, tenant.name),
                                      variant: 'warning' as const,
                                    },
                                  ] : [
                                    {
                                      label: 'Activer',
                                      icon: (
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                        </svg>
                                      ),
                                      onClick: () => handleActivate(tenant.id, tenant.name),
                                      variant: 'success' as const,
                                    },
                                  ]),
                                  {
                                    label: 'Supprimer',
                                    icon: (
                                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    ),
                                    onClick: () => handleDelete(tenant.id, tenant.name),
                                    variant: 'danger' as const,
                                    divider: true,
                                  },
                                ] : [
                                  {
                                    label: 'Restaurer',
                                    icon: (
                                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                      </svg>
                                    ),
                                    onClick: () => handleRestore(tenant.id, tenant.name),
                                    variant: 'success' as const,
                                  },
                                ]),
                              ]}
                              isLoading={!!actionLoading[tenant.id]}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tenants Clients */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Tenants Clients
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Tenants des clients/utilisateurs de la plateforme
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden w-full max-w-full">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th 
                        className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[200px]"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Tenant
                          <SortIcon field="name" />
                        </div>
                      </th>
                      <th 
                        className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[120px] hidden sm:table-cell"
                        onClick={() => handleSort('plan')}
                      >
                        <div className="flex items-center">
                          Plan
                          <SortIcon field="plan" />
                        </div>
                      </th>
                      <th 
                        className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[100px]"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">
                          Status
                          <SortIcon field="status" />
                        </div>
                      </th>
                      <th 
                        className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[180px] hidden md:table-cell"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center">
                          Email
                          <SortIcon field="email" />
                        </div>
                      </th>
                      <th 
                        className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[110px] hidden lg:table-cell"
                        onClick={() => handleSort('created_at')}
                      >
                        <div className="flex items-center">
                          Créé le
                          <SortIcon field="created_at" />
                        </div>
                      </th>
                      <th className="px-2 sm:px-3 lg:px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedClientTenants.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          {search ? 'Aucun tenant client trouvé' : 'Aucun tenant client pour le moment'}
                        </td>
                      </tr>
                    ) : (
                      sortedClientTenants.map((tenant) => (
                        <tr 
                          key={tenant.id} 
                          className="hover:bg-gray-50 dark:bg-gray-900 cursor-pointer"
                          onClick={(e) => {
                            // Ne pas naviguer si on clique sur un bouton d'action
                            if ((e.target as HTMLElement).closest('button')) {
                              return
                            }
                            navigate(`/admin/tenants/${tenant.id}`)
                          }}
                        >
                          <td className="px-3 sm:px-6 py-4 min-w-[200px]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">{tenant.name}</div>
                                  {(() => {
                                    const tenantType = getTenantType(tenant)
                                    return (
                                      <span className={`px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${tenantType.color} shadow-sm`}>
                                        {tenantType.label}
                                      </span>
                                    )
                                  })()}
                                </div>
                                {tenant.slug && (
                                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-words mt-1">/{tenant.slug}</div>
                                )}
                                <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden mt-1 break-words">{tenant.email}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden mt-1">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPlanBadge(tenant.plan)}`}>
                                    {tenant.plan}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell min-w-[120px]">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPlanBadge(tenant.plan)}`}>
                              {tenant.plan}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 min-w-[100px]">
                            <div className="flex flex-col">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${getStatusBadge(tenant.status)}`}>
                                {tenant.status === 'trial' ? 'En Trial' : tenant.status}
                              </span>
                              {tenant.status === 'trial' && tenant.trial_ends_at && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Expire: {new Date(tenant.trial_ends_at).toLocaleDateString('fr-FR')}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell min-w-[180px]">
                            <div className="break-words">{tenant.email}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell min-w-[110px]">
                            {new Date(tenant.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-2 sm:px-3 lg:px-4 py-4 whitespace-nowrap text-right text-sm font-medium min-w-[120px]">
                            <div className="flex justify-end items-center gap-1 sm:gap-2 flex-nowrap" onClick={(e) => e.stopPropagation()}>
                              {/* Desktop: Boutons individuels */}
                              <div className="hidden sm:flex justify-end items-center gap-1 sm:gap-2 flex-nowrap">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(`/admin/tenants/${tenant.id}`)
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
                                        onClick={() => handleSuspend(tenant.id, tenant.name)}
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
                                        onClick={() => handleActivate(tenant.id, tenant.name)}
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
                              {/* Mobile: Menu dropdown avec trois points */}
                              <div className="sm:hidden">
                                <ActionsDropdown
                                  actions={[
                                    {
                                      label: 'Voir détails',
                                      icon: (
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                      ),
                                      onClick: () => {
                                        navigate(`/admin/tenants/${tenant.id}`)
                                      },
                                    },
                                    ...(!tenant.deleted_at ? [
                                      {
                                        label: 'Impersonner l\'admin',
                                        icon: (
                                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                          </svg>
                                        ),
                                        onClick: () => handleImpersonate(tenant),
                                      },
                                      {
                                        label: 'Réinitialiser mot de passe admin',
                                        icon: (
                                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                          </svg>
                                        ),
                                        onClick: () => handlePasswordReset(tenant),
                                        divider: true,
                                      },
                                      ...(tenant.status === 'active' ? [
                                        {
                                          label: 'Suspendre',
                                          icon: (
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                          ),
                                          onClick: () => handleSuspend(tenant.id, tenant.name),
                                          variant: 'warning' as const,
                                        },
                                      ] : [
                                        {
                                          label: 'Activer',
                                          icon: (
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                            </svg>
                                          ),
                                          onClick: () => handleActivate(tenant.id, tenant.name),
                                          variant: 'success' as const,
                                        },
                                      ]),
                                      {
                                        label: 'Supprimer',
                                        icon: (
                                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        ),
                                        onClick: () => handleDelete(tenant.id, tenant.name),
                                        variant: 'danger' as const,
                                        divider: true,
                                      },
                                    ] : [
                                      {
                                        label: 'Restaurer',
                                        icon: (
                                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                          </svg>
                                        ),
                                        onClick: () => handleRestore(tenant.id, tenant.name),
                                        variant: 'success' as const,
                                      },
                                    ]),
                                  ]}
                                  isLoading={!!actionLoading[tenant.id]}
                                />
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
    </AdminLayout>
  )
}

