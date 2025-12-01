import api from '@/lib/api'

export interface UsageStats {
  most_used_actions: Array<{ action_type: string; action_name: string; count: number }>
  actions_by_resource: Array<{ resource_type: string; count: number }>
  feature_usage_stats: Array<{ feature_name: string; total_usage: number; tenant_count: number }>
  actions_timeline: Array<{ date: string; label: string; count: number }>
  most_clicked_ctas: Array<{ action_name: string; resource_type: string; count: number }>
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
        return {
          most_used_actions: [],
          actions_by_resource: [],
          feature_usage_stats: [],
          actions_timeline: [],
          most_clicked_ctas: [],
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
    resource_id?: number
    metadata?: any
  }) {
    try {
      await api.post('/analytics/actions/', actionData)
    } catch (error) {
      // Silently fail - analytics should not break the app
      console.warn('Failed to track action:', error)
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

