import api from '@/lib/api'

export interface UsageStats {
  most_used_actions: Array<{ action_type: string; action_name: string; count: number }>
  actions_by_resource: Array<{ resource_type: string; count: number }>
  feature_usage_stats: Array<{ feature_name: string; total_usage: number; tenant_count: number }>
  actions_timeline: Array<{ date: string; label: string; count: number }>
  most_clicked_ctas: Array<{ 
    action_name: string
    resource_type: string
    count: number
    user__email?: string
    user__id?: number
    tenant__name?: string
  }>
  buttons_by_user: Array<{
    user__email: string
    user__id: number
    user__first_name?: string
    user__last_name?: string
    action_name: string
    resource_type: string
    count: number
  }>
  most_viewed_pages: Array<{ resource_id: number; metadata: any; count: number }>
  summary: {
    total_actions: number
    actions_today: number
    actions_this_week: number
    actions_this_month: number
    actions_last_30_days: number
  }
}

class AnalyticsService {
  async getUsageStats(): Promise<UsageStats> {
    try {
      const response = await api.get('/analytics/usage-stats/')
      return response.data
    } catch (error: any) {
      // Si l'endpoint n'existe pas encore ou erreur réseau, retourner des valeurs par défaut
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK' || error.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
        // Ne pas logger pour les erreurs attendues (ad blockers, etc.)
        // Supprimer le message "Analytics endpoint not available, using defaults" qui pollue la console
        return {
          most_used_actions: [],
          actions_by_resource: [],
          feature_usage_stats: [],
          actions_timeline: [],
          most_clicked_ctas: [],
          buttons_by_user: [],
          most_viewed_pages: [],
          summary: {
            total_actions: 0,
            actions_today: 0,
            actions_this_week: 0,
            actions_this_month: 0,
            actions_last_30_days: 0,
          }
        }
      }
      // Logger uniquement les autres erreurs
      console.error('Erreur lors de la récupération des statistiques:', error)
      throw error
    }
  }

  async trackAction(actionData: {
    action_type: string
    action_name: string
    resource_type?: string
    resource_id?: number | string
    metadata?: any
    user?: number
    tenant?: number
  }) {
    try {
      // Ne pas tracker si on est dans l'admin
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        return
      }
      
      await api.post('/analytics/actions/', actionData, {
        // Ne pas bloquer si l'utilisateur n'est pas authentifié
        validateStatus: (status) => status < 500,
      })
    } catch (error: any) {
      // Silently fail - analytics should not break the app
      // Ne logger que les erreurs critiques (500+)
      if (error.response?.status >= 500) {
        console.warn('Failed to track action:', error)
      }
    }
  }

  async trackFeatureUsage(featureName: string, tenantId?: number) {
    try {
      await api.post('/analytics/feature-usage/track/', {
        feature_name: featureName,
        tenant_id: tenantId,
      })
    } catch (error) {
      // Silently fail - analytics should not break the app
      console.warn('Failed to track feature usage:', error)
    }
  }
}

export default new AnalyticsService()

