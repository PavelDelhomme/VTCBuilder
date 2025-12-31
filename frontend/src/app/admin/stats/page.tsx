'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/admin/AdminLayout'
import api from '@/lib/api'
import PageLoader from '@/components/shared/PageLoader'
import billingService from '@/services/billing.service'
import analyticsService, { UsageStats } from '@/services/analytics.service'
import { generateInsights, detectBehavioralPatterns, Insight, BehavioralPattern } from '@/lib/ai-insights'

interface DetailedStats {
  overview: {
    total_tenants: number
    active_tenants: number
    trial_tenants: number
    suspended_tenants: number
    cancelled_tenants: number
    total_users: number
    active_subscriptions: number
    trial_subscriptions: number
    past_due_subscriptions: number
    cancelled_subscriptions: number
    expiring_soon_subscriptions: number
  }
  activity: {
    users_today: number
    users_this_week: number
    users_this_month: number
    tenants_today: number
    tenants_this_week: number
    tenants_this_month: number
    recently_suspended_users: number
    password_resets_last_week: number
  }
  registrations: {
    pending_invitations: number
    expired_invitations: number
    users_by_day: Array<{ day: string; count: number }>
    tenants_by_day: Array<{ day: string; count: number }>
  }
  users_by_role: Array<{ role: string; count: number }>
  users_by_status: Array<{ status: string; count: number }>
  tenants_by_plan: Array<{ plan: string; count: number }>
  tenants_by_status: Array<{ status: string; count: number }>
  tenants_by_month: Array<{ month: string; count: number }>
  users_by_month: Array<{ month: string; count: number }>
  revenue: {
    monthly: number
    total: number
    by_month: Array<{ month: string; total: number }>
  }
  alerts: Array<{
    type: 'error' | 'warning' | 'info'
    severity: 'high' | 'medium' | 'low'
    title: string
    description: string
    count: number
    items?: Array<{ id: number; name: string; email?: string; status?: string }>
  }>
  recent_tenants: Array<{
    id: number
    name: string
    email: string
    status: string
    plan: string
    created_at: string
  }>
  recent_users: Array<{
    id: number
    name: string
    email: string
    role: string
    status: string
    tenant_name: string | null
    created_at: string
  }>
  blocks_usage?: Array<{
    block_type: string
    count: number
  }>
  templates_usage?: Array<{
    id: number
    name: string
    slug: string
    category: string
    usage_count: number
  }>
  pages_stats?: {
    total: number
    published: number
    draft: number
    scheduled: number
    homepages: number
    created_today: number
    created_this_week: number
    created_this_month: number
  }
  services_stats?: {
    total: number
    active: number
    created_today: number
    created_this_week: number
    created_this_month: number
  }
  bookings_stats?: {
    total: number
    pending: number
    confirmed: number
    completed: number
    cancelled: number
    today: number
    this_week: number
    this_month: number
  }
}

export default function StatsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DetailedStats | null>(null)
  const [billingStats, setBillingStats] = useState<any>(null)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'users' | 'tenants' | 'ctas' | 'docs' | 'features' | 'insights'>('overview')
  const [insights, setInsights] = useState<Insight[]>([])
  const [patterns, setPatterns] = useState<BehavioralPattern[]>([])

  useEffect(() => {
    const checkAuth = async () => {
      // Vérifier d'abord si le token existe
      const token = localStorage.getItem('token')
      if (!token) {
        // Pas de token, rediriger vers login
        authService.saveRedirectUrl()
        router.push('/login')
        return
      }
      
      // Vérifier si super admin
      if (!authService.isSuperAdmin()) {
        router.push('/dashboard')
        return
      }
      
      // Vérifier si on vient de se connecter (dans les 5 secondes)
      const loginTimestamp = localStorage.getItem('login_timestamp');
      const justLoggedIn = loginTimestamp && (Date.now() - parseInt(loginTimestamp, 10)) < 5000;
      
      if (justLoggedIn) {
        // Attendre un peu avant de charger les données après le login
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      await loadStats()
    }
    checkAuth()
  }, [router])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      // Charger les stats de manière SÉRIELLE pour éviter le rate limiting WAF
      // 1. Stats détaillées
      let response = null
      try {
        response = await api.get('/stats/detailed/')
      } catch (error: any) {
        console.warn('Error chargement stats détaillées:', error)
      }
      
      // Attendre 300ms avant la prochaine requête
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 2. Stats de billing
      let billingData = null
      try {
        billingData = await billingService.getBillingStats()
      } catch (error: any) {
        // Ne pas bloquer si billing stats échoue
        console.warn('Error chargement billing stats:', error)
      }
      
      // Attendre 300ms avant la prochaine requête
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 3. Stats d'utilisation
      let usageData = null
      try {
        usageData = await analyticsService.getUsageStats()
      } catch (err: any) {
        // Ne pas logger d'error si c'est juste un 404 (endpoint pas encore disponible)
        if (err?.response?.status !== 404) {
          console.warn('Error chargement usage stats:', err)
        }
      }
      
      if (billingData) {
        setBillingStats(billingData)
      }
      
      if (usageData) {
        setUsageStats(usageData)
        // Générer les insights IA maison
        const generatedInsights = generateInsights(usageData)
        const detectedPatterns = detectBehavioralPatterns(usageData)
        setInsights(generatedInsights)
        setPatterns(detectedPatterns)
      }
      
      // Fonction pour normaliser les données du backend vers la structure attendue
      const normalizeStats = (data: any): DetailedStats => {
        // Si la structure est déjà correcte, la retourner telle quelle
        if (data && data.overview) {
          return data as DetailedStats
        }
        
        // Sinon, transformer la structure du backend
        const tenants = data?.tenants || {}
        const users = data?.users || {}
        const activity = data?.activity || {}
        const revenue = data?.revenue || {}
        
        return {
          overview: {
            total_tenants: tenants.total || 0,
            active_tenants: tenants.active || 0,
            trial_tenants: tenants.trial || 0,
            suspended_tenants: tenants.suspended || 0,
            cancelled_tenants: 0,
            total_users: users.total || 0,
            active_subscriptions: revenue.active_subscriptions || 0,
            trial_subscriptions: revenue.trial_subscriptions || 0,
            past_due_subscriptions: 0,
            cancelled_subscriptions: 0,
            expiring_soon_subscriptions: 0,
          },
          activity: {
            users_today: activity.today?.new_users || 0,
            users_this_week: activity.this_week?.new_users || 0,
            users_this_month: 0,
            tenants_today: activity.today?.new_tenants || 0,
            tenants_this_week: activity.this_week?.new_tenants || 0,
            tenants_this_month: 0,
            recently_suspended_users: users.suspended || 0,
            password_resets_last_week: 0,
          },
          registrations: {
            pending_invitations: 0,
            expired_invitations: 0,
            users_by_day: [],
            tenants_by_day: [],
          },
          recent_tenants: [],
          recent_users: [],
          users_by_role: [],
          users_by_status: [],
          tenants_by_plan: [],
          tenants_by_status: [],
          tenants_by_month: [],
          users_by_month: [],
          revenue: { 
            monthly: revenue.monthly || 0, 
            total: revenue.total || 0, 
            by_month: [] 
          },
          alerts: [],
        } as DetailedStats
      }
      
      // Normaliser et définir les statistiques
      if (response) {
        const normalizedStats = normalizeStats(response.data)
        setStats(normalizedStats)
      }
    } catch (error: any) {
      console.error('Error chargement statistiques:', error)
      // Si 404 ou autre erreur, initialiser avec des valeurs vides pour éviter les erreurs d'affichage
      if (error.response?.status === 404 || error.response?.status === 500) {
        console.warn('⚠️ Endpoint /api/stats/detailed/ non disponible. Utilisation des valeurs par défaut.')
      }
      // Initialiser avec des valeurs vides pour éviter les erreurs d'affichage
      setStats({
        overview: {
          total_tenants: 0,
          active_tenants: 0,
          trial_tenants: 0,
          suspended_tenants: 0,
          cancelled_tenants: 0,
          total_users: 0,
          active_subscriptions: 0,
          trial_subscriptions: 0,
          past_due_subscriptions: 0,
          cancelled_subscriptions: 0,
          expiring_soon_subscriptions: 0,
        },
        activity: {
          users_today: 0,
          users_this_week: 0,
          users_this_month: 0,
          tenants_today: 0,
          tenants_this_week: 0,
          tenants_this_month: 0,
          recently_suspended_users: 0,
          password_resets_last_week: 0,
        },
        registrations: {
          pending_invitations: 0,
          expired_invitations: 0,
          users_by_day: [],
          tenants_by_day: [],
        },
        recent_tenants: [],
        recent_users: [],
        users_by_role: [],
        users_by_status: [],
        tenants_by_plan: [],
        tenants_by_status: [],
        tenants_by_month: [],
        users_by_month: [],
        revenue: { monthly: 0, total: 0, by_month: [] },
        alerts: [],
      } as DetailedStats)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', { 
      month: 'short', 
      year: 'numeric' 
    }).format(date)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num)
  }

  const formatDay = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', { 
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }).format(date)
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      default:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const getAlertColor = (type: string, severity: string) => {
    if (type === 'error' || severity === 'high') {
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
    }
    if (type === 'warning' || severity === 'medium') {
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
    }
    return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
  }

  if (loading) {
    return (
      <AdminLayout title="Statistiques Détaillées" subtitle="Analyse complète de la plateforme">
        <PageLoader text="Chargement des statistiques..." />
      </AdminLayout>
    )
  }

  if (!stats || !stats.overview) {
    return (
      <AdminLayout title="Statistiques Détaillées" subtitle="Erreur">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200">Erreur lors du chargement des statistiques.</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout 
      title="Statistiques Détaillées" 
      subtitle="Analyses et métriques de la plateforme avec monitoring complet et IA maison"
    >
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-6">
        <div className="w-full min-h-0 flex flex-col px-4 sm:px-6 lg:px-8 overflow-x-hidden">
          {/* Onglets de navigation */}
          <div className="flex-shrink-0 mb-6 border-b border-gray-200 dark:border-gray-700">
          {/* Mobile: Menu déroulant */}
          <div className="lg:hidden mb-4">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {[
                { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
                { id: 'actions', label: 'Actions', icon: '⚡' },
                { id: 'users', label: 'Utilisateurs', icon: '👥' },
                { id: 'tenants', label: 'Tenants', icon: '🏢' },
                { id: 'ctas', label: 'CTAs', icon: '🎯' },
                { id: 'docs', label: 'Documentation', icon: '📚' },
                { id: 'features', label: 'Fonctionnalités', icon: '🚀' },
                { id: 'insights', label: 'Insights IA', icon: '🤖' },
              ].map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.icon} {tab.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Desktop: Onglets horizontaux */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="hidden lg:flex flex-wrap -mb-px overflow-x-auto w-full">
              {[
                { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
                { id: 'actions', label: 'Actions', icon: '⚡' },
                { id: 'users', label: 'Utilisateurs', icon: '👥' },
                { id: 'tenants', label: 'Tenants', icon: '🏢' },
                { id: 'ctas', label: 'CTAs', icon: '🎯' },
                { id: 'docs', label: 'Documentation', icon: '📚' },
                { id: 'features', label: 'Fonctionnalités', icon: '🚀' },
                { id: 'insights', label: 'Insights IA', icon: '🤖' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
              </nav>
            </div>
          </div>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-8">
          {/* Cartes Statistiques Billing - Même style que /admin/billing */}
          {/* Contenu de l'onglet Vue d'ensemble - Revenus et Statistiques Générales */}
          {activeTab === 'overview' && billingStats && (
          <>
            {/* Première rangée - Cartes principales avec gradients */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {/* Revenus Totaux */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm opacity-90">Revenus Totaux</p>
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold break-words">{billingStats.total_revenue?.toFixed(2) || '0.00'}€</p>
                {billingStats.yearly_revenue && billingStats.yearly_revenue > 0 && (
                  <p className="text-xs sm:text-sm opacity-80 mt-1">Année en cours: {billingStats.yearly_revenue.toFixed(2)}€</p>
                )}
              </div>

              {/* Revenus Ce Mois */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm opacity-90">Revenus Ce Mois</p>
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold break-words">{billingStats.monthly_revenue?.toFixed(2) || '0.00'}€</p>
                {billingStats.last_month_revenue && billingStats.last_month_revenue > 0 && (
                  <p className="text-xs sm:text-sm opacity-80 mt-1">
                    Mois dernier: {billingStats.last_month_revenue.toFixed(2)}€
                    {billingStats.monthly_revenue > billingStats.last_month_revenue ? (
                      <span className="ml-2">📈 +{((billingStats.monthly_revenue / billingStats.last_month_revenue - 1) * 100).toFixed(1)}%</span>
                    ) : billingStats.monthly_revenue < billingStats.last_month_revenue ? (
                      <span className="ml-2">📉 {((billingStats.monthly_revenue / billingStats.last_month_revenue - 1) * 100).toFixed(1)}%</span>
                    ) : null}
                  </p>
                )}
              </div>

              {/* Revenus Récurrents (MRR) */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm opacity-90">Revenus Récurrents</p>
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold break-words">{billingStats.monthly_recurring_revenue?.toFixed(2) || '0.00'}€</p>
                <p className="text-xs sm:text-sm opacity-80 mt-1">MRR mensuel</p>
              </div>

              {/* Abonnements Actifs */}
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm opacity-90">Abonnements Actifs</p>
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold break-words">{billingStats.active_subscriptions || 0}</p>
                {billingStats.total_subscriptions && (
                  <p className="text-xs sm:text-sm opacity-80 mt-1">Sur {billingStats.total_subscriptions} au total</p>
                )}
              </div>
            </div>

            {/* Deuxième rangée - Cartes secondaires */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-10">
              {/* Total Factures */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Factures</p>
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{billingStats.total_invoices || 0}</p>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="text-green-600">✓ Payées: {billingStats.paid_invoices || 0}</span>
                  {' • '}
                  <span className="text-red-600">⚠ Impayées: {billingStats.unpaid_invoices || 0}</span>
                </div>
              </div>

              {/* Total Paiements */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Paiements</p>
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{billingStats.total_payments || 0}</p>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="text-green-600">✓ Réussis: {billingStats.succeeded_payments || 0}</span>
                  {' • '}
                  <span className="text-yellow-600">⏳ En attente: {billingStats.pending_payments || 0}</span>
                </div>
              </div>

              {/* Tenants */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tenants</p>
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{billingStats.total_tenants || 0}</p>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="text-blue-600">✓ Avec abonnement: {billingStats.tenants_with_subscription || 0}</span>
                  {' • '}
                  <span className="text-gray-600">Sans: {billingStats.tenants_without_subscription || 0}</span>
                </div>
              </div>

              {/* Montant Impayé */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Montant Impayé</p>
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-red-600">{billingStats.unpaid_amount?.toFixed(2) || '0.00'}€</p>
                {billingStats.overdue_amount && billingStats.overdue_amount > 0 && (
                  <p className="text-xs text-red-600 mt-1">Dont en retard: {billingStats.overdue_amount.toFixed(2)}€</p>
                )}
              </div>
            </div>

            {/* Statistiques Abonnements et Tenants */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Abonnements par statut */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Abonnements par Statut</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Actifs</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{billingStats.active_subscriptions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">En Trial</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{billingStats.trial_subscriptions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">En Retard</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{billingStats.past_due_subscriptions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Annulés</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{billingStats.cancelled_subscriptions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-500 rounded"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Expirés</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{billingStats.expired_subscriptions || 0}</span>
                  </div>
                </div>
              </div>

              {/* Tenants par statut */}
              {stats && stats.overview && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tenants par Statut</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Actifs</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.overview.active_tenants || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">En Trial</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.overview.trial_tenants || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Suspendus</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.overview.suspended_tenants || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gray-500 rounded"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Annulés</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.overview.cancelled_tenants || 0}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{stats.overview.total_tenants || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Abonnements par cycle */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Abonnements par Cycle</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Mensuel</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{billingStats.monthly_billing || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Annuel</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{billingStats.yearly_billing || 0}</span>
                  </div>
                  {billingStats.total_subscriptions && (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total</span>
                      <span className="font-bold text-gray-900 dark:text-gray-100">{billingStats.total_subscriptions}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Alertes et Problèmes - Vue d'ensemble uniquement */}
        {activeTab === 'overview' && stats.alerts && stats.alerts.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <svg className="h-6 w-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Alertes et Problèmes ({stats.alerts.length})
            </h2>
            <div className="space-y-3">
              {stats.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${getAlertColor(alert.type, alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{alert.title}</h3>
                        <p className="text-sm opacity-90">{alert.description}</p>
                        {alert.items && alert.items.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {alert.items.map((item) => (
                              <div key={item.id} className="text-sm opacity-75 flex items-center space-x-2">
                                <span>• {item.name}</span>
                                {item.email && <span className="text-xs">({item.email})</span>}
                                {item.status && (
                                  <span className="text-xs px-2 py-0.5 bg-white/50 rounded">{item.status}</span>
                                )}
                              </div>
                            ))}
                            {alert.count > alert.items.length && (
                              <p className="text-xs italic opacity-75">
                                + {alert.count - alert.items.length} autre(s)
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-2xl font-bold ml-4">{alert.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activité Récente - Vue d'ensemble uniquement */}
        {activeTab === 'overview' && stats && stats.activity && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Activité Récente</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 sm:gap-6">
              <div className="text-center p-4 sm:p-5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50 shadow-sm">
                <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.activity.users_today}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">Utilisateurs<br />Aujourd'hui</p>
              </div>
              <div className="text-center p-4 sm:p-5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/50 shadow-sm">
                <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{stats.activity.users_this_week}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">Utilisateurs<br />Cette semaine</p>
              </div>
              <div className="text-center p-4 sm:p-5 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800/50 shadow-sm">
                <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.activity.users_this_month}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">Utilisateurs<br />Ce mois</p>
              </div>
              <div className="text-center p-4 sm:p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                <p className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.activity.tenants_today}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">Tenants<br />Aujourd'hui</p>
              </div>
              <div className="text-center p-4 sm:p-5 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-100 dark:border-pink-800/50 shadow-sm">
                <p className="text-2xl sm:text-3xl font-bold text-pink-600 dark:text-pink-400">{stats.activity.tenants_this_week}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">Tenants<br />Cette semaine</p>
              </div>
              <div className="text-center p-4 sm:p-5 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800/50 shadow-sm">
                <p className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.activity.tenants_this_month}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">Tenants<br />Ce mois</p>
              </div>
              <div className="text-center p-4 sm:p-5 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800/50 shadow-sm">
                <p className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.activity.password_resets_last_week}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">Reset mot de passe<br />7 derniers jours</p>
              </div>
            </div>
          </div>
        )}

        {/* Demandes d'inscription - Vue d'ensemble uniquement */}
        {activeTab === 'overview' && stats && stats.registrations && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Demandes d'Inscription</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats.registrations.pending_invitations}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Invitations en attente</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.registrations.expired_invitations}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Invitations expirées</p>
              </div>
              {stats.activity.recently_suspended_users > 0 && (
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{stats.activity.recently_suspended_users}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Utilisateurs suspendus (7j)</p>
                </div>
              )}
            </div>
            {/* Graphique des inscriptions par jour */}
            {stats.registrations && stats.registrations.users_by_day && stats.registrations.tenants_by_day && 
             (stats.registrations.users_by_day.length > 0 || stats.registrations.tenants_by_day.length > 0) && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Inscriptions par jour (7 derniers jours)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Utilisateurs par jour */}
                  {stats.registrations.users_by_day.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Utilisateurs</h4>
                      <div className="space-y-2">
                        {stats.registrations.users_by_day.map((item) => (
                          <div key={item.day}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400">{formatDay(item.day)}</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.count}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{
                                  width: `${(item.count / Math.max(...stats.registrations.users_by_day.map(d => d.count), 1)) * 100}%`
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Tenants par jour */}
                  {stats.registrations.tenants_by_day.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tenants</h4>
                      <div className="space-y-2">
                        {stats.registrations.tenants_by_day.map((item) => (
                          <div key={item.day}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-600 dark:text-gray-400">{formatDay(item.day)}</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.count}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${(item.count / Math.max(...stats.registrations.tenants_by_day.map(d => d.count), 1)) * 100}%`
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Overview Cards - Vue d'ensemble uniquement */}
        {activeTab === 'overview' && stats.overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tenants</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{formatNumber(stats.overview?.total_tenants || 0)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">{stats.overview?.active_tenants || 0} actifs</span>
              <span className="text-gray-400 mx-2">•</span>
              <span className="text-yellow-600">{stats.overview?.trial_tenants || 0} en trial</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Utilisateurs</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{formatNumber(stats.overview?.total_users || 0)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenu Mensuel</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{formatCurrency(stats.revenue?.monthly || 0)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total: {formatCurrency(stats.revenue?.total || 0)}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Abonnements</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{formatNumber(stats.overview?.active_subscriptions || 0)}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">{stats.overview?.trial_subscriptions || 0} en trial</p>
              {(stats.overview?.past_due_subscriptions || 0) > 0 && (
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ {stats.overview.past_due_subscriptions} en retard
                </p>
              )}
              {(stats.overview?.expiring_soon_subscriptions || 0) > 0 && (
                <p className="text-sm text-yellow-600 font-medium">
                  ⚠️ {stats.overview.expiring_soon_subscriptions} expire(nt) bientôt
                </p>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Cartes supplémentaires pour les statuts - Vue d'ensemble uniquement */}
        {activeTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {(stats.overview?.suspended_tenants || 0) > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Tenants Suspendus</p>
                  <p className="text-3xl font-bold text-red-900 dark:text-red-200 mt-2">{formatNumber(stats.overview.suspended_tenants)}</p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
              </div>
            </div>
          )}
          {(stats.overview?.cancelled_tenants || 0) > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Tenants Annulés</p>
                  <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-200 mt-2">{formatNumber(stats.overview.cancelled_tenants)}</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                  <svg className="h-8 w-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>
          )}
          {stats.registrations && stats.registrations.pending_invitations > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Invitations en Attente</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-200 mt-2">{formatNumber(stats.registrations.pending_invitations)}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Charts Section - Vue d'ensemble uniquement */}
        {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Users by Status */}
          {stats.users_by_status && stats.users_by_status.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Utilisateurs par Statut</h3>
              <div className="space-y-4">
                {stats.users_by_status.map((item) => (
                  <div key={item.status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {item.status === 'active' ? 'Actif' : 
                         item.status === 'inactive' ? 'Inactif' : 
                         item.status === 'suspended' ? 'Suspendu' : 
                         item.status === 'pending' ? 'En attente' : item.status}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.status === 'active' ? 'bg-green-600' :
                          item.status === 'suspended' ? 'bg-red-600' :
                          item.status === 'pending' ? 'bg-yellow-600' :
                          'bg-gray-600'
                        }`}
                        style={{
                          width: `${((item.count || 0) / Math.max(stats.overview?.total_users || 1, 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tenants by Status */}
          {stats.tenants_by_status && stats.tenants_by_status.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tenants par Statut</h3>
              <div className="space-y-4">
                {stats.tenants_by_status.map((item) => (
                  <div key={item.status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {item.status === 'active' ? 'Actif' : 
                         item.status === 'trial' ? 'En trial' : 
                         item.status === 'suspended' ? 'Suspendu' : 
                         item.status === 'cancelled' ? 'Annulé' : item.status}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.status === 'active' ? 'bg-green-600' :
                          item.status === 'trial' ? 'bg-yellow-600' :
                          item.status === 'suspended' ? 'bg-red-600' :
                          item.status === 'cancelled' ? 'bg-gray-600' :
                          'bg-blue-600'
                        }`}
                        style={{
                          width: `${((item.count || 0) / Math.max(stats.overview?.total_tenants || 1, 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        )}

        {/* Revenue Chart - Vue d'ensemble uniquement */}
        {activeTab === 'overview' && stats.revenue?.by_month && stats.revenue.by_month.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Revenu par Mois (12 derniers mois)</h3>
            <div className="space-y-4">
              {stats.revenue.by_month.map((item) => (
                <div key={item.month}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatDate(item.month)}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatCurrency(item.total)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                      style={{
                        width: `${(item.total / Math.max(...stats.revenue.by_month.map(r => r.total))) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blocs les plus utilisés - Vue d'ensemble uniquement */}
        {activeTab === 'overview' && stats.blocks_usage && stats.blocks_usage.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              Blocs les Plus Utilisés
            </h2>
            <div className="space-y-3">
              {stats.blocks_usage.map((item, index) => (
                <div key={item.block_type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {item.block_type}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatNumber(item.count)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(item.count / Math.max(...stats.blocks_usage!.map(b => b.count), 1)) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Templates les plus utilisés - Vue d'ensemble uniquement */}
        {activeTab === 'overview' && stats.templates_usage && stats.templates_usage.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <svg className="h-6 w-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              Templates les Plus Utilisés
            </h2>
            <div className="space-y-3">
              {stats.templates_usage.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{template.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{template.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600">{formatNumber(template.usage_count)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">utilisations</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistiques Pages - Vue d'ensemble uniquement */}
        {activeTab === 'overview' && stats.pages_stats && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <svg className="h-6 w-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Statistiques des Pages
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{formatNumber(stats.pages_stats.total)}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{formatNumber(stats.pages_stats.published)}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Publiées</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{formatNumber(stats.pages_stats.draft)}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Brouillons</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{formatNumber(stats.pages_stats.homepages)}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Pages d'accueil</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques Services - Vue d'ensemble uniquement */}
        {activeTab === 'overview' && stats.services_stats && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <svg className="h-6 w-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Statistiques des Services
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">{formatNumber(stats.services_stats.total)}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{formatNumber(stats.services_stats.active)}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Actifs</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{formatNumber(stats.services_stats.created_this_month)}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Ce mois</p>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques Réservations - Vue d'ensemble uniquement */}
        {activeTab === 'overview' && stats.bookings_stats && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <svg className="h-6 w-6 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Statistiques des Réservations
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{formatNumber(stats.bookings_stats.total)}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{formatNumber(stats.bookings_stats.pending)}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">En attente</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{formatNumber(stats.bookings_stats.confirmed)}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Confirmées</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{formatNumber(stats.bookings_stats.completed)}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Terminées</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatNumber(stats.bookings_stats.today)}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Aujourd'hui</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatNumber(stats.bookings_stats.this_week)}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Cette semaine</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatNumber(stats.bookings_stats.this_month)}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Ce mois</p>
              </div>
            </div>
          </div>
        )}

        {/* Tenants par Plan - Vue d'ensemble uniquement */}
        {activeTab === 'overview' && stats.tenants_by_plan && stats.tenants_by_plan.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tenants par Plan</h3>
            <div className="space-y-4">
              {stats.tenants_by_plan.map((item) => (
                <div key={item.plan}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {item.plan === 'no_plan' ? 'Sans plan' : item.plan}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{
                        width: `${((item.count || 0) / Math.max(stats.overview?.total_tenants || 1, 1)) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tenants Récemment Créés - Vue d'ensemble uniquement */}
        {activeTab === 'overview' && stats.recent_tenants && stats.recent_tenants.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tenants Récemment Créés</h3>
            <div className="space-y-2">
              {stats.recent_tenants.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{tenant.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{tenant.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded ${
                      tenant.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                      tenant.status === 'trial' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}>
                      {tenant.status}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDay(tenant.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Utilisateurs Récemment Inscrits - Vue d'ensemble uniquement */}
        {activeTab === 'overview' && stats.recent_users && stats.recent_users.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Utilisateurs Récemment Inscrits</h3>
            <div className="space-y-2">
              {stats.recent_users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    {user.tenant_name && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">Tenant: {user.tenant_name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 capitalize">
                      {user.role}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDay(user.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contenu des onglets */}
        <div className="space-y-6 min-h-0">
            {/* Onglet: Vue d'ensemble */}
            {activeTab === 'overview' && (
              <>
                {/* Message si pas de données dans Vue d'ensemble */}
                {!usageStats && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">Les statistiques de vue d'ensemble sont affichées ci-dessus.</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Utilisez les autres onglets pour voir les détails spécifiques.</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Onglet: Actions */}
            {activeTab === 'actions' && (
              <>
                {/* Résumé des Actions */}
                {usageStats && usageStats.summary && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <svg className="h-6 w-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Résumé des Actions
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatNumber(usageStats.summary.total_actions)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Actions</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(usageStats.summary.actions_today)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Aujourd'hui</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatNumber(usageStats.summary.actions_this_week)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Cette Semaine</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatNumber(usageStats.summary.actions_this_month)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Ce Mois</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions par catégorie */}
                {usageStats && usageStats.actions_by_category && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Actions par Catégorie</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(usageStats.actions_by_category).map(([category, count]) => (
                        <div key={category} className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatNumber(count as number)}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 capitalize">{category.replace('_', ' ')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Statistiques anonymes vs authentifiés */}
                {usageStats && usageStats.user_type_stats && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Utilisateurs Anonymes vs Authentifiés</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{formatNumber(usageStats.user_type_stats.anonymous)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Anonymes</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {usageStats.summary && usageStats.summary.total_actions > 0 
                            ? `${((usageStats.user_type_stats.anonymous / usageStats.summary.total_actions) * 100).toFixed(1)}%`
                            : '0%'}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatNumber(usageStats.user_type_stats.authenticated)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Authentifiés</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {usageStats.summary && usageStats.summary.total_actions > 0 
                            ? `${((usageStats.user_type_stats.authenticated / usageStats.summary.total_actions) * 100).toFixed(1)}%`
                            : '0%'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline des Actions */}
                {usageStats && usageStats.actions_timeline && usageStats.actions_timeline.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Timeline des Actions (30 derniers jours)</h3>
                    <div className="overflow-x-auto w-full">
                      <div className="flex items-end justify-between space-x-1 h-48 min-w-full">
                        {usageStats.actions_timeline.map((day, index) => {
                          const maxCount = Math.max(...usageStats.actions_timeline.map(d => d.count))
                          const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center min-w-[30px]">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t relative" style={{ height: `${Math.max(height, 5)}%` }}>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t"></div>
                              </div>
                              <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-2 text-center transform -rotate-45 origin-top-left whitespace-nowrap">
                                {day.label}
                              </p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-1">{day.count}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {usageStats && usageStats.most_used_actions && usageStats.most_used_actions.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Actions les Plus Utilisées</h3>
                    <div className="space-y-3">
                      {usageStats.most_used_actions.map((action, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {action.action_name || action.action_type}
                            </span>
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatNumber(action.count)}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-indigo-500 h-2 rounded-full"
                              style={{
                                width: `${(action.count / Math.max(...usageStats.most_used_actions.map(a => a.count), 1)) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {usageStats.actions_by_resource && usageStats.actions_by_resource.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Actions par Type de Ressource</h3>
                    <div className="space-y-3">
                      {usageStats.actions_by_resource.map((resource, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{resource.resource_type}</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatNumber(resource.count)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions par heure */}
                {usageStats.actions_by_hour && usageStats.actions_by_hour.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Actions par Heure de la Journée</h3>
                    <div className="overflow-x-auto w-full">
                      <div className="flex items-end justify-between space-x-1 h-48 min-w-full">
                        {usageStats.actions_by_hour.map((hour, index) => {
                          const maxCount = Math.max(...usageStats.actions_by_hour.map(h => h.count))
                          const height = maxCount > 0 ? (hour.count / maxCount) * 100 : 0
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center min-w-[30px]">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t relative" style={{ height: `${Math.max(height, 5)}%` }}>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"></div>
                              </div>
                              <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-2">{hour.label}</p>
                              <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-1">{hour.count}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions par jour de la semaine */}
                {usageStats.actions_by_day_of_week && usageStats.actions_by_day_of_week.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Actions par Jour de la Semaine</h3>
                    <div className="space-y-3">
                      {usageStats.actions_by_day_of_week.map((day, index) => {
                        const maxCount = Math.max(...usageStats.actions_by_day_of_week.map(d => d.count))
                        const width = maxCount > 0 ? (day.count / maxCount) * 100 : 0
                        return (
                          <div key={index}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{day.label}</span>
                              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatNumber(day.count)}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${width}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Top liens cliqués */}
                {usageStats.top_links && usageStats.top_links.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Liens les Plus Cliqués</h3>
                    <div className="space-y-3">
                      {usageStats.top_links.map((link, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{link.action_name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{link['metadata__url'] || 'URL non disponible'}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatNumber(link.count)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">clics</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}


            {/* Onglet: Utilisateurs */}
            {activeTab === 'users' && (
              <>
                {usageStats.actions_by_user && usageStats.actions_by_user.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Utilisateurs les Plus Actifs</h3>
                    <div className="overflow-x-auto w-full">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Utilisateur</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tenant</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pages vues</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clics boutons</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Créations</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dernière action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {usageStats.actions_by_user.map((user, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {user.user__first_name && user.user__last_name
                                      ? `${user.user__first_name} ${user.user__last_name}`
                                      : user.user__email}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{user.user__email}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-900 dark:text-gray-100">{user.tenant__name || 'N/A'}</span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-sm font-bold text-indigo-600">{formatNumber(user.total_actions)}</span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-sm text-gray-900 dark:text-gray-100">{formatNumber(user.page_views)}</span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-sm text-gray-900 dark:text-gray-100">{formatNumber(user.button_clicks)}</span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-sm text-gray-900 dark:text-gray-100">{formatNumber(user.page_creates + user.block_actions)}</span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {user.last_action ? formatDay(user.last_action) : 'N/A'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {usageStats.buttons_by_user && usageStats.buttons_by_user.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Boutons Cliqués par Utilisateur</h3>
                    <div className="overflow-x-auto w-full">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Utilisateur</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bouton</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clics</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {usageStats.buttons_by_user.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {item.user__first_name && item.user__last_name
                                      ? `${item.user__first_name} ${item.user__last_name}`
                                      : item.user__email}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{item.user__email}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-900 dark:text-gray-100">{item.action_name}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{item.resource_type || 'button'}</span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-sm font-bold text-green-600">{formatNumber(item.count)}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Onglet: Tenants */}
            {activeTab === 'tenants' && (
              <>
                {usageStats.actions_by_tenant && usageStats.actions_by_tenant.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tenants les Plus Actifs</h3>
                    <div className="overflow-x-auto w-full">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tenant</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Actions</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Utilisateurs uniques</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pages vues</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clics boutons</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Créations</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dernière action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {usageStats.actions_by_tenant.map((tenant, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{tenant.tenant__name}</span>
                                  {tenant.tenant__email && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{tenant.tenant__email}</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-sm font-bold text-indigo-600">{formatNumber(tenant.total_actions)}</span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-sm text-gray-900 dark:text-gray-100">{formatNumber(tenant.unique_users)}</span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-sm text-gray-900 dark:text-gray-100">{formatNumber(tenant.page_views)}</span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-sm text-gray-900 dark:text-gray-100">{formatNumber(tenant.button_clicks)}</span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-sm text-gray-900 dark:text-gray-100">{formatNumber(tenant.page_creates + tenant.block_actions)}</span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {tenant.last_action ? formatDay(tenant.last_action) : 'N/A'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Statistiques site public vs tenants */}
                {usageStats.public_site_stats && usageStats.tenant_site_stats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Site Public (VTCBuilder)</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Actions</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatNumber(usageStats.public_site_stats.total_actions)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Pages vues</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatNumber(usageStats.public_site_stats.page_views)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Clics boutons</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatNumber(usageStats.public_site_stats.button_clicks)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Clics liens</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatNumber(usageStats.public_site_stats.link_clicks)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Sites Tenants</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Actions</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatNumber(usageStats.tenant_site_stats.total_actions)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Tenants uniques</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatNumber(usageStats.tenant_site_stats.unique_tenants)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Pages vues</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatNumber(usageStats.tenant_site_stats.page_views)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Clics boutons</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatNumber(usageStats.tenant_site_stats.button_clicks)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Onglet: CTAs */}
            {activeTab === 'ctas' && (
              <>
                {usageStats.most_clicked_ctas && usageStats.most_clicked_ctas.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">CTAs et Boutons les Plus Cliqués</h3>
                    <div className="space-y-3">
                      {usageStats.most_clicked_ctas.map((cta, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100 text-lg">{cta.action_name}</p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              {cta.resource_type && (
                                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded capitalize">
                                  {cta.resource_type}
                                </span>
                              )}
                              {cta.user__email && (
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  👤 {cta.user__email}
                                </span>
                              )}
                              {cta.tenant__name && (
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  🏢 {cta.tenant__name}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatNumber(cta.count)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">clics</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Onglet: Documentation */}
            {activeTab === 'docs' && (
              <>
                {usageStats.docs_stats && (
                  <>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Statistiques Documentation</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(usageStats.docs_stats.total_views)}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total vues</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatNumber(usageStats.docs_stats.unique_users)}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Utilisateurs uniques</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {usageStats.public_site_stats?.page_views 
                              ? `${((usageStats.docs_stats.total_views / usageStats.public_site_stats.page_views) * 100).toFixed(1)}%`
                              : '0%'}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">% des visites</p>
                        </div>
                      </div>
                    </div>

                    {usageStats.docs_stats.views_by_day && usageStats.docs_stats.views_by_day.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Vues Documentation (30 derniers jours)</h3>
                        <div className="overflow-x-auto w-full">
                          <div className="flex items-end justify-between space-x-1 h-48 min-w-full">
                            {usageStats.docs_stats.views_by_day.map((day, index) => {
                              const maxCount = Math.max(...usageStats.docs_stats.views_by_day.map(d => d.count))
                              const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0
                              return (
                                <div key={index} className="flex-1 flex flex-col items-center min-w-[30px]">
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t relative" style={{ height: `${Math.max(height, 5)}%` }}>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"></div>
                                  </div>
                                  <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-2 text-center transform -rotate-45 origin-top-left whitespace-nowrap">
                                    {day.label}
                                  </p>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-1">{day.count}</p>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {usageStats.docs_stats.most_viewed_docs && usageStats.docs_stats.most_viewed_docs.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Pages Documentation les Plus Consultées</h3>
                        <div className="space-y-3">
                          {usageStats.docs_stats.most_viewed_docs.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  Page #{doc.resource_id}
                                </p>
                                {doc.metadata?.path && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{doc.metadata.path}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatNumber(doc.count)}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">vues</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Onglet: Fonctionnalités */}
            {activeTab === 'features' && (
              <>
                {usageStats.feature_usage_stats && usageStats.feature_usage_stats.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Fonctionnalités les Plus Utilisées</h3>
                    <div className="space-y-3">
                      {usageStats.feature_usage_stats.map((feature, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100 text-lg">{feature.feature_name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Utilisée par {feature.tenant_count} tenant{feature.tenant_count > 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatNumber(feature.total_usage)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">utilisations</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Onglet: Insights IA */}
            {activeTab === 'insights' && (
              <>
                {insights.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <span className="mr-2">🤖</span>
                      Insights Automatiques (IA Maison)
                    </h3>
                    <div className="space-y-4">
                      {insights.map((insight, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-l-4 ${
                            insight.severity === 'high'
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                              : insight.severity === 'medium'
                              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{insight.title}</h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{insight.description}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  insight.type === 'trend'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    : insight.type === 'warning'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                    : insight.type === 'recommendation'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                }`}>
                                  {insight.type === 'trend' ? 'Tendance' : 
                                   insight.type === 'warning' ? 'Alerte' :
                                   insight.type === 'recommendation' ? 'Recommandation' : 'Opportunité'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{insight.category}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {patterns.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <span className="mr-2">🔍</span>
                      Patterns Comportementaux Détectés
                    </h3>
                    <div className="space-y-4">
                      {patterns.map((pattern, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{pattern.pattern}</h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{pattern.description}</p>
                              {pattern.recommendation && (
                                <p className="text-sm text-blue-700 dark:text-blue-300 italic mt-2">
                                  💡 {pattern.recommendation}
                                </p>
                              )}
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Confiance: {Math.round(pattern.confidence * 100)}%
                                </span>
                                {pattern.users_affected && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    • {pattern.users_affected} utilisateur{pattern.users_affected > 1 ? 's' : ''} concerné{pattern.users_affected > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {insights.length === 0 && patterns.length === 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">Aucun insight disponible pour le moment.</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Les insights seront générés automatiquement lorsque suffisamment de données seront disponibles.</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {!usageStats && activeTab !== 'overview' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">Chargement des statistiques d'utilisation...</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Les données analytics seront disponibles une fois que des actions auront été enregistrées.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
