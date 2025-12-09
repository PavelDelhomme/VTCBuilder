'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import api from '@/lib/api'
import AdminLayout from '@/components/admin/AdminLayout'
import PageLoader from '@/components/shared/PageLoader'
import { useNavigationLoading } from '@/hooks/useNavigationLoading'

interface DashboardStats {
  total_tenants: number
  active_tenants: number
  trial_tenants: number
  total_users: number
  monthly_revenue?: number
  trials_expiring_soon?: number
  trials_expiring_soon_list?: Array<{
    tenant_id: number
    tenant_name: string
    plan_name: string
    trial_end: string
    days_remaining: number
  }>
}

interface DetailedStatsSummary {
  overview: {
    total_tenants: number
    active_tenants: number
    trial_tenants: number
    total_users: number
    active_subscriptions: number
    trial_subscriptions: number
    trials_expiring_soon?: number
  }
  activity: {
    users_today: number
    users_this_week: number
    tenants_today: number
    tenants_this_week: number
  }
  revenue: {
    monthly: number
    total: number
  }
  alerts: Array<{
    type: 'error' | 'warning' | 'info'
    severity: 'high' | 'medium' | 'low'
    title: string
    count: number
  }>
  trials_expiring_soon_list?: Array<{
    tenant_id: number
    tenant_name: string
    plan_name: string
    trial_end: string
    days_remaining: number
  }>
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [detailedStats, setDetailedStats] = useState<DetailedStatsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const { isNavigating, navigate } = useNavigationLoading()

  useEffect(() => {
    if (!authService.isSuperAdmin()) {
      router.push('/dashboard')
      return
    }

    loadDashboardData()
  }, [router])

  const loadDashboardData = async () => {
    try {
      // Load basic dashboard stats
      const response = await api.get('/dashboard/')
      // Le backend retourne directement les stats, pas dans un objet 'stats'
      const statsData = response.data.stats || response.data || {}
      setStats({
        total_tenants: statsData.total_tenants || 0,
        active_tenants: statsData.active_tenants || 0,
        trial_tenants: statsData.trial_tenants || 0,
        total_users: statsData.total_users || 0,
        monthly_revenue: statsData.monthly_revenue || 0,
        trials_expiring_soon: statsData.trials_expiring_soon || 0,
        trials_expiring_soon_list: statsData.trials_expiring_soon_list || [],
      })

      // Load detailed stats summary
      try {
        const detailedResponse = await api.get('/stats/detailed/')
        const detailed = detailedResponse.data
        setDetailedStats({
          overview: detailed.overview || {
            total_tenants: 0,
            active_tenants: 0,
            trial_tenants: 0,
            total_users: 0,
            active_subscriptions: 0,
            trial_subscriptions: 0,
          },
          activity: detailed.activity || {
            users_today: 0,
            users_this_week: 0,
            tenants_today: 0,
            tenants_this_week: 0,
          },
          revenue: detailed.revenue || {
            monthly: 0,
            total: 0,
          },
          alerts: detailed.alerts || [],
        })
      } catch (error) {
        console.warn('Erreur chargement stats détaillées:', error)
        // Continue without detailed stats
      }
    } catch (error: any) {
      // Ne pas logger les erreurs 401 (non authentifié), réseau ou bloquées (bloqueur de pub)
      const isExpectedError = error.response?.status === 401 ||
                             error.code === 'ERR_NETWORK' || 
                             error.code === 'ERR_BLOCKED_BY_CLIENT' ||
                             error.message?.includes('ERR_BLOCKED_BY_CLIENT') ||
                             error.message?.includes('blocked by client')
      if (!isExpectedError) {
        console.error('Erreur chargement dashboard:', error)
      }
      setStats({
        total_tenants: 0,
        active_tenants: 0,
        trial_tenants: 0,
        total_users: 0,
        monthly_revenue: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Tableau de bord" subtitle="Vue d'ensemble de la plateforme">
        <PageLoader text="Chargement du tableau de bord..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Dashboard Super Admin"
      subtitle="Gestion complète de la plateforme VTCBuilder"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5 mb-6">
          <div className="card h-full flex items-center">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-2 sm:p-3">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-5 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Tenants</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 break-words">{stats?.total_tenants || 0}</p>
              </div>
            </div>
          </div>

          <div className="card h-full flex items-center">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-2 sm:p-3">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-5 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Tenants Actifs</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 break-words">{stats?.active_tenants || 0}</p>
              </div>
            </div>
          </div>

          <div className="card h-full flex items-center">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-2 sm:p-3">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-5 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">En Trial</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 break-words">{stats?.trial_tenants || 0}</p>
                {stats?.trials_expiring_soon && stats.trials_expiring_soon > 0 && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 truncate">
                    {stats.trials_expiring_soon} expire{stats.trials_expiring_soon > 1 ? 'nt' : ''} bientôt
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="card h-full flex items-center">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-2 sm:p-3">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-5 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Utilisateurs</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 break-words">{stats?.total_users || 0}</p>
              </div>
            </div>
          </div>

          <div className="card h-full flex items-center">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0 bg-green-600 rounded-md p-2 sm:p-3">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-5 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Revenus Mensuels</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 break-words">{stats?.monthly_revenue || 0}€</p>
              </div>
            </div>
          </div>
        </div>

        {/* Résumé Statistiques Détaillées */}
        {detailedStats && (
          <div className="mt-0 px-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Résumé des Statistiques</h2>
              <button
                onClick={() => navigate('/admin/stats')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Voir toutes les statistiques →
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
              {/* Activité Aujourd'hui */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm opacity-90">Aujourd'hui</p>
                  <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold">{detailedStats.activity.users_today || 0}</p>
                <p className="text-sm opacity-80 mt-1">Nouveaux utilisateurs</p>
              </div>

              {/* Activité Cette Semaine */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm opacity-90">Cette Semaine</p>
                  <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold">{detailedStats.activity.users_this_week || 0}</p>
                <p className="text-sm opacity-80 mt-1">Utilisateurs</p>
              </div>

              {/* Abonnements Actifs */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm opacity-90">Abonnements</p>
                  <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold">{detailedStats.overview.active_subscriptions || 0}</p>
                <p className="text-sm opacity-80 mt-1">
                  {detailedStats.overview.trial_subscriptions || 0} en trial
                </p>
              </div>

              {/* Revenu Total */}
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm opacity-90">Revenu Total</p>
                  <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(detailedStats.revenue.total || 0)}
                </p>
                <p className="text-sm opacity-80 mt-1">
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(detailedStats.revenue.monthly || 0)}/mois
                </p>
              </div>
            </div>

            {/* Alertes */}
            {((detailedStats.alerts && detailedStats.alerts.length > 0) || (detailedStats.trials_expiring_soon_list && detailedStats.trials_expiring_soon_list.length > 0)) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Alertes ({(detailedStats.alerts?.length || 0) + (detailedStats.trials_expiring_soon_list?.length || 0)})
                  </h3>
                  <button
                    onClick={() => navigate('/admin/stats')}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Voir détails →
                  </button>
                </div>
                <div className="space-y-2">
                  {/* Trials expiring soon */}
                  {detailedStats.trials_expiring_soon_list && detailedStats.trials_expiring_soon_list.length > 0 && (
                    <>
                      {detailedStats.trials_expiring_soon_list.slice(0, 5).map((trial, index) => {
                        const trialEndDate = new Date(trial.trial_end)
                        const formattedDate = trialEndDate.toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })
                        return (
                          <div key={index} className="flex items-center justify-between text-sm py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                            <div className="flex-1">
                              <span className="text-yellow-700 dark:text-yellow-400 font-medium">
                                {trial.tenant_name}
                              </span>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>Plan: {trial.plan_name}</span>
                                <span className="mx-2">•</span>
                                <span>Expire le {formattedDate}</span>
                                <span className="mx-2">•</span>
                                <span className={trial.days_remaining <= 1 ? 'text-red-600 font-semibold' : ''}>
                                  {trial.days_remaining} jour{trial.days_remaining > 1 ? 's' : ''} restant{trial.days_remaining > 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => navigate(`/admin/tenants/${trial.tenant_id}`)}
                              className="text-xs text-blue-600 hover:text-blue-800 ml-4"
                            >
                              Voir →
                            </button>
                          </div>
                        )
                      })}
                      {detailedStats.trials_expiring_soon_list.length > 5 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                          + {detailedStats.trials_expiring_soon_list.length - 5} autre{detailedStats.trials_expiring_soon_list.length - 5 > 1 ? 's' : ''}...
                        </div>
                      )}
                    </>
                  )}
                  {/* Other alerts */}
                  {detailedStats.alerts && detailedStats.alerts.slice(0, 3).map((alert, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className={`${
                        alert.severity === 'high' ? 'text-red-700' :
                        alert.severity === 'medium' ? 'text-yellow-700' :
                        'text-blue-700'
                      }`}>
                        {alert.title}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{alert.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 lg:mt-8 px-0">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/tenants')}
              className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Gérer les Tenants</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Voir tous les clients</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/tenants/new')}
              className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Nouveau Tenant</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Créer un client</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/admin/stats')}
              className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Statistiques</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Voir les analytics</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/homepage')}
              className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Page d'Accueil</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Personnaliser le site public</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

