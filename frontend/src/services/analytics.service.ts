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
  actions_by_user?: Array<{
    user__id: number
    user__email: string
    user__first_name?: string
    user__last_name?: string
    tenant__name?: string
    tenant__id?: number
    total_actions: number
    page_views: number
    button_clicks: number
    link_clicks: number
    page_creates: number
    block_actions: number
    last_action: string
  }>
  actions_by_tenant?: Array<{
    tenant__id: number
    tenant__name: string
    tenant__email?: string
    total_actions: number
    unique_users: number
    page_views: number
    button_clicks: number
    link_clicks: number
    page_creates: number
    block_actions: number
    last_action: string
  }>
  actions_by_category?: {
    navigation: number
    content_creation: number
    content_deletion: number
    interactions: number
    authentication: number
    business: number
    billing: number
  }
  docs_stats?: {
    total_views: number
    unique_users: number
    most_viewed_docs: Array<{ resource_id: number; metadata: any; count: number }>
    views_by_day: Array<{ date: string; label: string; count: number }>
  }
  public_site_stats?: {
    total_actions: number
    page_views: number
    button_clicks: number
    link_clicks: number
    most_visited_pages: Array<{ resource_id: number; metadata: any; count: number }>
  }
  tenant_site_stats?: {
    total_actions: number
    unique_tenants: number
    page_views: number
    button_clicks: number
    link_clicks: number
  }
  actions_by_hour?: Array<{ hour: number; label: string; count: number }>
  actions_by_day_of_week?: Array<{ day: number; label: string; count: number }>
  top_links?: Array<{ 'metadata__url': string; action_name: string; count: number }>
  user_type_stats?: {
    anonymous: number
    authenticated: number
  }
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
      const response = await api.get('/analytics/usage-stats/', {
        validateStatus: (status) => status < 500, // Ne pas throw pour 404/403
      })
      if (response.status === 404 || response.status === 403) {
        // Endpoint non disponible ou non autorisé, retourner valeurs par défaut silencieusement
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
      return response.data
    } catch (error: any) {
      // Si erreur réseau ou autre, retourner valeurs par défaut sans logger
      if (error.code === 'ERR_NETWORK' || error.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
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
      // Pour les autres erreurs, retourner aussi des valeurs par défaut
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
      // Ne pas logger les erreurs 401/403 - c'est normal si non connecté
      if (error.response?.status === 401 || error.response?.status === 403) {
        return // Erreur silencieuse
      }
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

