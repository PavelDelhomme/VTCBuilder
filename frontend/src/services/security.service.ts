/**
 * Service for Security/WAF management
 */
import api from '@/lib/api'

export interface WAFRule {
  id: number
  name: string
  description: string
  rule_type: string
  status: 'active' | 'inactive' | 'testing'
  config: Record<string, any>
  priority: number
  action: 'allow' | 'block' | 'challenge' | 'log'
  created_at: string
  updated_at: string
}

export interface WAFLog {
  id: number
  ip_address: string
  request_method: string
  request_path: string
  action: string
  severity: string
  reason: string
  timestamp: string
  matched_rule_name?: string
  threat_type?: string
}

export interface SecurityAlert {
  id: number
  alert_type: string
  severity: string
  status: string
  title: string
  message: string
  ip_address?: string
  created_at: string
}

export interface FirewallRule {
  id: number
  name: string
  description: string
  rule_type: string
  status: 'active' | 'inactive'
  config: Record<string, any>
  priority: number
  created_at: string
}

export interface SecuritySettings {
  waf_enabled: boolean
  waf_mode: 'blocking' | 'monitoring' | 'learning'
  rate_limit_enabled: boolean
  rate_limit_requests_per_minute: number
  rate_limit_requests_per_hour: number
  ip_reputation_enabled: boolean
  block_known_bad_ips: boolean
  log_all_requests: boolean
  log_retention_days: number
  alert_on_critical: boolean
  alert_on_high: boolean
  alert_on_medium: boolean
  alert_email: string
  auto_block_after_attempts: number
  auto_block_duration_hours: number
}

const securityService = {
  // WAF Rules
  async getWAFRules(): Promise<WAFRule[]> {
    const response = await api.get('/security/waf/rules/')
    return Array.isArray(response.data) ? response.data : response.data.results || []
  },

  async createWAFRule(data: Partial<WAFRule>): Promise<WAFRule> {
    const response = await api.post('/security/waf/rules/', data)
    return response.data
  },

  async updateWAFRule(id: number, data: Partial<WAFRule>): Promise<WAFRule> {
    const response = await api.patch(`/security/waf/rules/${id}/`, data)
    return response.data
  },

  async deleteWAFRule(id: number): Promise<void> {
    await api.delete(`/security/waf/rules/${id}/`)
  },

  async toggleWAFRuleStatus(id: number): Promise<WAFRule> {
    const response = await api.post(`/security/waf/rules/${id}/toggle_status/`)
    return response.data
  },

  async initDefaultWAFRules(force: boolean = false): Promise<{ message: string; rules: WAFRule[]; count: number }> {
    const response = await api.post('/security/waf/rules/init_default_rules/', { force })
    return response.data
  },

  // WAF Logs
  async getWAFLogs(params?: { days?: number; ip_address?: string; severity?: string; action?: string }): Promise<WAFLog[]> {
    const response = await api.get('/security/waf/logs/', { params })
    return Array.isArray(response.data) ? response.data : response.data.results || []
  },

  async getWAFStats(days: number = 7): Promise<any> {
    const response = await api.get('/security/waf/logs/stats/', { params: { days } })
    return response.data
  },

  // Security Alerts
  async getAlerts(params?: { status?: string; severity?: string }): Promise<SecurityAlert[]> {
    const response = await api.get('/security/alerts/', { params })
    return Array.isArray(response.data) ? response.data : response.data.results || []
  },

  async acknowledgeAlert(id: number): Promise<SecurityAlert> {
    const response = await api.post(`/security/alerts/${id}/acknowledge/`)
    return response.data
  },

  async resolveAlert(id: number): Promise<SecurityAlert> {
    const response = await api.post(`/security/alerts/${id}/resolve/`)
    return response.data
  },

  // Firewall Rules
  async getFirewallRules(): Promise<FirewallRule[]> {
    const response = await api.get('/security/firewall/rules/')
    return Array.isArray(response.data) ? response.data : response.data.results || []
  },

  async createFirewallRule(data: Partial<FirewallRule>): Promise<FirewallRule> {
    const response = await api.post('/security/firewall/rules/', data)
    return response.data
  },

  async updateFirewallRule(id: number, data: Partial<FirewallRule>): Promise<FirewallRule> {
    const response = await api.patch(`/security/firewall/rules/${id}/`, data)
    return response.data
  },

  async deleteFirewallRule(id: number): Promise<void> {
    await api.delete(`/security/firewall/rules/${id}/`)
  },

  async initDefaultFirewallRules(force: boolean = false): Promise<{ message: string; rules: FirewallRule[]; count: number }> {
    const response = await api.post('/security/firewall/rules/init_default_rules/', { force })
    return response.data
  },

  // Security Settings
  async getSettings(): Promise<SecuritySettings> {
    const response = await api.get('/security/settings/')
    return response.data
  },

  async updateSettings(data: Partial<SecuritySettings>): Promise<SecuritySettings> {
    const response = await api.patch('/security/settings/', data)
    return response.data
  },
}

export default securityService

