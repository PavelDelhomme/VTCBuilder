'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import securityService from '@/services/security.service'
import ToggleSwitch from '@/components/shared/ToggleSwitch'

interface WAFRule {
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

interface WAFLog {
  id: number
  ip_address: string
  request_method: string
  request_path: string
  action: string
  severity: string
  reason: string
  timestamp: string
  matched_rule_name?: string
}

interface SecurityAlert {
  id: number
  alert_type: string
  severity: string
  status: string
  title: string
  message: string
  ip_address?: string
  created_at: string
}

interface FirewallRule {
  id: number
  name: string
  description: string
  rule_type: string
  status: 'active' | 'inactive'
  config: Record<string, any>
  priority: number
  created_at: string
}

interface SecuritySettings {
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

export default function SecurityTab() {
  const [activeSubTab, setActiveSubTab] = useState<'waf' | 'firewall' | 'monitoring' | 'logs' | 'settings'>('waf')
  const [loading, setLoading] = useState(true)
  
  // WAF
  const [wafRules, setWafRules] = useState<WAFRule[]>([])
  const [wafLogs, setWafLogs] = useState<WAFLog[]>([])
  const [wafStats, setWafStats] = useState<any>(null)
  const [showWAFRuleModal, setShowWAFRuleModal] = useState(false)
  const [editingWAFRule, setEditingWAFRule] = useState<WAFRule | null>(null)
  
  // Alerts
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [alertFilter, setAlertFilter] = useState<'all' | 'new' | 'acknowledged' | 'resolved'>('new')
  
  // Firewall
  const [firewallRules, setFirewallRules] = useState<FirewallRule[]>([])
  const [showFirewallRuleModal, setShowFirewallRuleModal] = useState(false)
  const [editingFirewallRule, setEditingFirewallRule] = useState<FirewallRule | null>(null)
  
  // Settings
  const [settings, setSettings] = useState<SecuritySettings | null>(null)
  
  // Logs filters
  const [logFilters, setLogFilters] = useState({
    days: 7,
    severity: '',
    action: '',
    ip_address: '',
  })

  useEffect(() => {
    loadData()
  }, [activeSubTab, alertFilter])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeSubTab === 'waf') {
        await Promise.all([loadWAFRules(), loadWAFLogs(), loadWAFStats()])
      } else if (activeSubTab === 'monitoring') {
        await loadAlerts()
      } else if (activeSubTab === 'firewall') {
        await loadFirewallRules()
      } else if (activeSubTab === 'logs') {
        await loadWAFLogs()
      } else if (activeSubTab === 'settings') {
        await loadSettings()
      }
    } catch (error) {
      console.error('Error chargement données sécurité:', error)
      toast.error('Error lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const loadWAFRules = async () => {
    try {
      const rules = await securityService.getWAFRules()
      setWafRules(rules)
    } catch (error) {
      console.error('Error chargement règles WAF:', error)
    }
  }

  const loadWAFLogs = async () => {
    try {
      const params: any = { days: logFilters.days }
      if (logFilters.severity) params.severity = logFilters.severity
      if (logFilters.action) params.action = logFilters.action
      if (logFilters.ip_address) params.ip_address = logFilters.ip_address
      
      const logs = await securityService.getWAFLogs(params)
      setWafLogs(logs)
    } catch (error) {
      console.error('Error chargement logs WAF:', error)
    }
  }

  const loadWAFStats = async () => {
    try {
      const stats = await securityService.getWAFStats(7)
      setWafStats(stats)
    } catch (error) {
      console.error('Error chargement stats WAF:', error)
    }
  }

  const loadAlerts = async () => {
    try {
      const params: any = {}
      if (alertFilter !== 'all') {
        params.status = alertFilter
      }
      const alertsData = await securityService.getAlerts(params)
      setAlerts(alertsData)
    } catch (error) {
      console.error('Error chargement alertes:', error)
    }
  }

  const loadFirewallRules = async () => {
    try {
      const rules = await securityService.getFirewallRules()
      setFirewallRules(rules)
    } catch (error) {
      console.error('Error chargement règles firewall:', error)
    }
  }

  const loadSettings = async () => {
    try {
      const settingsData = await securityService.getSettings()
      setSettings(settingsData)
    } catch (error) {
      console.error('Error chargement paramètres:', error)
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) return
    
    try {
      await securityService.updateSettings(settings)
      toast.success('Paramètres de sécurité sauvegardés !')
    } catch (error) {
      console.error('Error sauvegarde paramètres:', error)
      toast.error('Error lors de la sauvegarde')
    }
  }

  const handleToggleRule = async (ruleId: number) => {
    try {
      await securityService.toggleWAFRuleStatus(ruleId)
      await loadWAFRules()
      toast.success('Règle mise à jour')
    } catch (error) {
      console.error('Error toggle règle:', error)
      toast.error('Error lors de la mise à jour')
    }
  }

  const handleDeleteWAFRule = async (ruleId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette règle ?')) return
    
    try {
      await securityService.deleteWAFRule(ruleId)
      await loadWAFRules()
      toast.success('Règle supprimée')
    } catch (error) {
      console.error('Error suppression règle:', error)
      toast.error('Error lors de la suppression')
    }
  }

  const handleSaveWAFRule = async (ruleData: Partial<WAFRule>) => {
    try {
      if (editingWAFRule) {
        await securityService.updateWAFRule(editingWAFRule.id, ruleData)
        toast.success('Règle mise à jour')
      } else {
        await securityService.createWAFRule(ruleData)
        toast.success('Règle créée')
      }
      setShowWAFRuleModal(false)
      setEditingWAFRule(null)
      await loadWAFRules()
    } catch (error: any) {
      console.error('Error sauvegarde règle:', error)
      toast.error(error.response?.data?.error || 'Error lors de la sauvegarde')
    }
  }

  const handleAcknowledgeAlert = async (alertId: number) => {
    try {
      await securityService.acknowledgeAlert(alertId)
      await loadAlerts()
      toast.success('Alerte acquittée')
    } catch (error) {
      console.error('Error acquittement alerte:', error)
      toast.error('Error lors de l\'acquittement')
    }
  }

  const handleResolveAlert = async (alertId: number) => {
    try {
      await securityService.resolveAlert(alertId)
      await loadAlerts()
      toast.success('Alerte résolue')
    } catch (error) {
      console.error('Error résolution alerte:', error)
      toast.error('Error lors de la résolution')
    }
  }

  const handleDeleteFirewallRule = async (ruleId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette règle ?')) return
    
    try {
      await securityService.deleteFirewallRule(ruleId)
      await loadFirewallRules()
      toast.success('Règle supprimée')
    } catch (error) {
      console.error('Error suppression règle:', error)
      toast.error('Error lors de la suppression')
    }
  }

  const handleSaveFirewallRule = async (ruleData: Partial<FirewallRule>) => {
    try {
      if (editingFirewallRule) {
        await securityService.updateFirewallRule(editingFirewallRule.id, ruleData)
        toast.success('Règle mise à jour')
      } else {
        await securityService.createFirewallRule(ruleData)
        toast.success('Règle créée')
      }
      setShowFirewallRuleModal(false)
      setEditingFirewallRule(null)
      await loadFirewallRules()
    } catch (error: any) {
      console.error('Error sauvegarde règle:', error)
      toast.error(error.response?.data?.error || 'Error lors de la sauvegarde')
    }
  }

  const applyLogFilters = () => {
    loadWAFLogs()
  }

  if (loading && !settings && activeSubTab === 'settings') {
    return <div className="text-center py-8">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4 overflow-x-auto">
          {[
            { id: 'waf', label: 'WAF', icon: '🛡️' },
            { id: 'firewall', label: 'Firewall', icon: '🔥' },
            { id: 'monitoring', label: 'Monitoring & Alertes', icon: '📊' },
            { id: 'logs', label: 'Logs de sécurité', icon: '📋' },
            { id: 'settings', label: 'Paramètres', icon: '⚙️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeSubTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* WAF Tab */}
      {activeSubTab === 'waf' && (
        <div className="space-y-6">
          {/* Stats */}
          {wafStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Requêtes</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{wafStats.total_requests || 0}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">7 derniers jours</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Bloquées</div>
                <div className="text-2xl font-bold text-red-600">{wafStats.blocked || 0}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Requêtes bloquées</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Autorisées</div>
                <div className="text-2xl font-bold text-green-600">{wafStats.allowed || 0}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Requêtes autorisées</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Règles Actives</div>
                <div className="text-2xl font-bold text-blue-600">{wafRules.filter(r => r.status === 'active').length}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Sur {wafRules.length} règles</div>
              </div>
            </div>
          )}

          {/* Rules */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Règles WAF</h3>
              <button 
                onClick={() => {
                  setEditingWAFRule(null)
                  setShowWAFRuleModal(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouvelle Règle
              </button>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">Chargement...</div>
              ) : wafRules.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="mb-2">Aucune règle WAF configurée</p>
                  <button
                    onClick={() => {
                      setEditingWAFRule(null)
                      setShowWAFRuleModal(true)
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Créer une règle
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {wafRules.map((rule) => (
                    <div key={rule.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{rule.name}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              rule.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : rule.status === 'testing'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {rule.status === 'active' ? 'Actif' : rule.status === 'testing' ? 'Test' : 'Inactif'}
                            </span>
                            <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium">
                              {rule.rule_type.replace('_', ' ')}
                            </span>
                            <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 font-medium">
                              Priorité: {rule.priority}
                            </span>
                          </div>
                          {rule.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{rule.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>Action: <strong className="text-gray-700 dark:text-gray-300">{rule.action}</strong></span>
                            <span>Créé: {new Date(rule.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ToggleSwitch
                            checked={rule.status === 'active'}
                            onChange={() => handleToggleRule(rule.id)}
                            size="sm"
                            color={rule.status === 'active' ? 'green' : 'gray'}
                          />
                          <button 
                            onClick={() => {
                              setEditingWAFRule(rule)
                              setShowWAFRuleModal(true)
                            }}
                            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            Éditer
                          </button>
                          <button 
                            onClick={() => handleDeleteWAFRule(rule.id)}
                            className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* WAF Rule Modal */}
          {showWAFRuleModal && (
            <WAFRuleModal
              rule={editingWAFRule}
              onClose={() => {
                setShowWAFRuleModal(false)
                setEditingWAFRule(null)
              }}
              onSave={handleSaveWAFRule}
            />
          )}
        </div>
      )}

      {/* Firewall Tab */}
      {activeSubTab === 'firewall' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Règles Firewall</h3>
              <button 
                onClick={() => {
                  setEditingFirewallRule(null)
                  setShowFirewallRuleModal(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouvelle Règle
              </button>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">Chargement...</div>
              ) : firewallRules.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="mb-2">Aucune règle firewall configurée</p>
                  <button
                    onClick={() => {
                      setEditingFirewallRule(null)
                      setShowFirewallRuleModal(true)
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Créer une règle
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {firewallRules.map((rule) => (
                    <div key={rule.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{rule.name}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              rule.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {rule.status === 'active' ? 'Actif' : 'Inactif'}
                            </span>
                            <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium">
                              {rule.rule_type.replace('_', ' ')}
                            </span>
                            <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 font-medium">
                              Priorité: {rule.priority}
                            </span>
                          </div>
                          {rule.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{rule.description}</p>
                          )}
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Créé: {new Date(rule.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setEditingFirewallRule(rule)
                              setShowFirewallRuleModal(true)
                            }}
                            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            Éditer
                          </button>
                          <button 
                            onClick={() => handleDeleteFirewallRule(rule.id)}
                            className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Firewall Rule Modal */}
          {showFirewallRuleModal && (
            <FirewallRuleModal
              rule={editingFirewallRule}
              onClose={() => {
                setShowFirewallRuleModal(false)
                setEditingFirewallRule(null)
              }}
              onSave={handleSaveFirewallRule}
            />
          )}
        </div>
      )}

      {/* Monitoring Tab */}
      {activeSubTab === 'monitoring' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Alertes de Sécurité</h3>
              <div className="flex items-center gap-2">
                <select
                  value={alertFilter}
                  onChange={(e) => setAlertFilter(e.target.value as any)}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                >
                  <option value="all">Toutes</option>
                  <option value="new">Nouvelles</option>
                  <option value="acknowledged">Acquittées</option>
                  <option value="resolved">Résolues</option>
                </select>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">Chargement...</div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>Aucune alerte {alertFilter !== 'all' ? alertFilter : ''}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`border-l-4 rounded-lg p-4 shadow-sm ${
                      alert.severity === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : alert.severity === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{alert.title}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              alert.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : alert.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                              : alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                              {alert.severity}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              alert.status === 'new' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : alert.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {alert.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{alert.message}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            {alert.ip_address && (
                              <span>IP: <strong className="text-gray-700 dark:text-gray-300">{alert.ip_address}</strong></span>
                            )}
                            <span>Créé: {new Date(alert.created_at).toLocaleString('fr-FR')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {alert.status === 'new' && (
                            <>
                              <button
                                onClick={() => handleAcknowledgeAlert(alert.id)}
                                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Acquitter
                              </button>
                              <button
                                onClick={() => handleResolveAlert(alert.id)}
                                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Résoudre
                              </button>
                            </>
                          )}
                          {alert.status === 'acknowledged' && (
                            <button
                              onClick={() => handleResolveAlert(alert.id)}
                              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Résoudre
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeSubTab === 'logs' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Filtres</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Période (jours)</label>
                <input
                  type="number"
                  value={logFilters.days}
                  onChange={(e) => setLogFilters({ ...logFilters, days: parseInt(e.target.value) || 7 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                  min={1}
                  max={30}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sévérité</label>
                <select
                  value={logFilters.severity}
                  onChange={(e) => setLogFilters({ ...logFilters, severity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                >
                  <option value="">Toutes</option>
                  <option value="critical">Critique</option>
                  <option value="high">Élevé</option>
                  <option value="medium">Moyen</option>
                  <option value="low">Faible</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Action</label>
                <select
                  value={logFilters.action}
                  onChange={(e) => setLogFilters({ ...logFilters, action: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                >
                  <option value="">Toutes</option>
                  <option value="blocked">Bloquées</option>
                  <option value="allowed">Autorisées</option>
                  <option value="logged">Loggées</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adresse IP</label>
                <input
                  type="text"
                  value={logFilters.ip_address}
                  onChange={(e) => setLogFilters({ ...logFilters, ip_address: e.target.value })}
                  placeholder="192.168.1.1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={applyLogFilters}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Appliquer les filtres
            </button>
          </div>

          {/* Logs Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Logs de Sécurité</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {wafLogs.length} log{wafLogs.length !== 1 ? 's' : ''} trouvé{wafLogs.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">Chargement...</div>
              ) : wafLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Aucun log disponible pour cette période</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">IP</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Méthode</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Chemin</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Règle</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sévérité</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Raison</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {wafLogs.slice(0, 100).map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString('fr-FR')}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-mono">
                            {log.ip_address}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                            <span className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium">
                              {log.request_method}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                            <div className="max-w-xs truncate" title={log.request_path}>
                              {log.request_path}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {log.matched_rule_name || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              log.action === 'blocked' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : log.action === 'allowed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              log.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : log.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                              : log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                              {log.severity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                            <div className="truncate" title={log.reason}>
                              {log.reason || '-'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {wafLogs.length > 100 && (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-700">
                      Affichage des 100 premiers résultats sur {wafLogs.length}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeSubTab === 'settings' && settings && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Paramètres de Sécurité</h3>
            <button
              onClick={handleSaveSettings}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Sauvegarder
            </button>
          </div>
          
          {/* WAF Settings */}
          <div className="space-y-4 border-b border-gray-200 dark:border-gray-700 pb-6">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">🛡️ Web Application Firewall (WAF)</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Activer le WAF</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Protection contre les attaques web courantes</p>
                </div>
                <ToggleSwitch
                  checked={settings.waf_enabled}
                  onChange={(checked) => setSettings({ ...settings, waf_enabled: checked })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mode WAF</label>
                <select
                  value={settings.waf_mode}
                  onChange={(e) => setSettings({ ...settings, waf_mode: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                >
                  <option value="blocking">Mode Blocage - Bloque les requêtes suspectes</option>
                  <option value="monitoring">Mode Monitoring - Log uniquement, ne bloque pas</option>
                  <option value="learning">Mode Apprentissage - Analyse et apprend les patterns</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {settings.waf_mode === 'blocking' && 'Les requêtes suspectes seront bloquées immédiatement'}
                  {settings.waf_mode === 'monitoring' && 'Les requêtes suspectes seront loggées mais autorisées'}
                  {settings.waf_mode === 'learning' && 'Le système apprend les patterns normaux avant de bloquer'}
                </p>
              </div>
            </div>
          </div>

          {/* Rate Limiting */}
          <div className="space-y-4 border-b border-gray-200 dark:border-gray-700 pb-6">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">⚡ Limitation de Débit</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Activer la limitation</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Protection contre les attaques DDoS et brute force</p>
                </div>
                <ToggleSwitch
                  checked={settings.rate_limit_enabled}
                  onChange={(checked) => setSettings({ ...settings, rate_limit_enabled: checked })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Requêtes par minute</label>
                  <input
                    type="number"
                    value={settings.rate_limit_requests_per_minute}
                    onChange={(e) => setSettings({ ...settings, rate_limit_requests_per_minute: parseInt(e.target.value) || 60 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                    min={1}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Nombre maximum de requêtes par IP par minute</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Requêtes par heure</label>
                  <input
                    type="number"
                    value={settings.rate_limit_requests_per_hour}
                    onChange={(e) => setSettings({ ...settings, rate_limit_requests_per_hour: parseInt(e.target.value) || 1000 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                    min={1}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Nombre maximum de requêtes par IP par heure</p>
                </div>
              </div>
            </div>
          </div>

          {/* IP Reputation */}
          <div className="space-y-4 border-b border-gray-200 dark:border-gray-700 pb-6">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">🌐 Réputation IP</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Activer la réputation IP</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Vérifier la réputation des adresses IP</p>
                </div>
                <ToggleSwitch
                  checked={settings.ip_reputation_enabled}
                  onChange={(checked) => setSettings({ ...settings, ip_reputation_enabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bloquer les IPs connues comme malveillantes</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Bloque automatiquement les IPs dans les listes noires</p>
                </div>
                <ToggleSwitch
                  checked={settings.block_known_bad_ips}
                  onChange={(checked) => setSettings({ ...settings, block_known_bad_ips: checked })}
                />
              </div>
            </div>
          </div>

          {/* Logging */}
          <div className="space-y-4 border-b border-gray-200 dark:border-gray-700 pb-6">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">📋 Logging</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Logger toutes les requêtes</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Attention: peut générer beaucoup de logs</p>
                </div>
                <ToggleSwitch
                  checked={settings.log_all_requests}
                  onChange={(checked) => setSettings({ ...settings, log_all_requests: checked })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rétention des logs (jours)</label>
                <input
                  type="number"
                  value={settings.log_retention_days}
                  onChange={(e) => setSettings({ ...settings, log_retention_days: parseInt(e.target.value) || 30 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                  min={1}
                  max={365}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Les logs plus anciens seront automatiquement supprimés</p>
              </div>
            </div>
          </div>

          {/* Alerting */}
          <div className="space-y-4 border-b border-gray-200 dark:border-gray-700 pb-6">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">🔔 Alertes</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Alerter sur Critique</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Alertes pour les événements critiques</p>
                </div>
                <ToggleSwitch
                  checked={settings.alert_on_critical}
                  onChange={(checked) => setSettings({ ...settings, alert_on_critical: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Alerter sur Élevé</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Alertes pour les événements de sévérité élevée</p>
                </div>
                <ToggleSwitch
                  checked={settings.alert_on_high}
                  onChange={(checked) => setSettings({ ...settings, alert_on_high: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Alerter sur Moyen</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Alertes pour les événements de sévérité moyenne</p>
                </div>
                <ToggleSwitch
                  checked={settings.alert_on_medium}
                  onChange={(checked) => setSettings({ ...settings, alert_on_medium: checked })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email pour alertes</label>
                <input
                  type="email"
                  value={settings.alert_email}
                  onChange={(e) => setSettings({ ...settings, alert_email: e.target.value })}
                  placeholder="admin@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email qui recevra les notifications d'alertes</p>
              </div>
            </div>
          </div>

          {/* Auto-blocking */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">🚫 Blocage Automatique</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bloquer après N tentatives</label>
                <input
                  type="number"
                  value={settings.auto_block_after_attempts}
                  onChange={(e) => setSettings({ ...settings, auto_block_after_attempts: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                  min={1}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Nombre de tentatives suspectes avant blocage automatique</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Durée du blocage (heures)</label>
                <input
                  type="number"
                  value={settings.auto_block_duration_hours}
                  onChange={(e) => setSettings({ ...settings, auto_block_duration_hours: parseInt(e.target.value) || 24 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                  min={1}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Durée pendant laquelle l'IP sera bloquée</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Modal pour créer/éditer une règle WAF
function WAFRuleModal({ rule, onClose, onSave }: { rule: WAFRule | null, onClose: () => void, onSave: (data: Partial<WAFRule>) => void }) {
  const [formData, setFormData] = useState<Partial<WAFRule>>({
    name: rule?.name || '',
    description: rule?.description || '',
    rule_type: rule?.rule_type || 'ip_blacklist',
    status: rule?.status || 'active',
    priority: rule?.priority || 100,
    action: rule?.action || 'block',
    config: rule?.config || {},
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {rule ? 'Éditer la règle WAF' : 'Nouvelle règle WAF'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom de la règle *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type de règle *</label>
            <select
              value={formData.rule_type}
              onChange={(e) => setFormData({ ...formData, rule_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
              required
            >
              <option value="ip_whitelist">IP Whitelist</option>
              <option value="ip_blacklist">IP Blacklist</option>
              <option value="rate_limit">Rate Limiting</option>
              <option value="sql_injection">SQL Injection Protection</option>
              <option value="xss">XSS Protection</option>
              <option value="path_traversal">Path Traversal Protection</option>
              <option value="file_upload">File Upload Protection</option>
              <option value="custom">Custom Rule</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Action *</label>
            <select
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
              required
            >
              <option value="allow">Allow - Autoriser</option>
              <option value="block">Block - Bloquer</option>
              <option value="challenge">Challenge - CAPTCHA</option>
              <option value="log">Log Only - Logger uniquement</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priorité</label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 100 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                min={1}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Plus bas = plus prioritaire</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="testing">Testing</option>
              </select>
            </div>
          </div>

          {/* Configuration spécifique selon le type */}
          {(formData.rule_type === 'ip_whitelist' || formData.rule_type === 'ip_blacklist') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adresses IP (une par ligne)</label>
              <textarea
                value={Array.isArray(formData.config?.ips) ? formData.config.ips.join('\n') : ''}
                onChange={(e) => {
                  const ips = e.target.value.split('\n').filter(ip => ip.trim())
                  setFormData({ ...formData, config: { ...formData.config, ips } })
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg font-mono text-sm"
                rows={5}
                placeholder="192.168.1.1&#10;10.0.0.1"
              />
            </div>
          )}

          {formData.rule_type === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Patterns (regex, un par ligne)</label>
              <textarea
                value={Array.isArray(formData.config?.patterns) ? formData.config.patterns.join('\n') : ''}
                onChange={(e) => {
                  const patterns = e.target.value.split('\n').filter(p => p.trim())
                  setFormData({ ...formData, config: { ...formData.config, patterns } })
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg font-mono text-sm"
                rows={5}
                placeholder="pattern1&#10;pattern2"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {rule ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal pour créer/éditer une règle Firewall
function FirewallRuleModal({ rule, onClose, onSave }: { rule: FirewallRule | null, onClose: () => void, onSave: (data: Partial<FirewallRule>) => void }) {
  const [formData, setFormData] = useState<Partial<FirewallRule>>({
    name: rule?.name || '',
    description: rule?.description || '',
    rule_type: rule?.rule_type || 'ip_blacklist',
    status: rule?.status || 'active',
    priority: rule?.priority || 100,
    config: rule?.config || {},
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {rule ? 'Éditer la règle Firewall' : 'Nouvelle règle Firewall'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom de la règle *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type de règle *</label>
            <select
              value={formData.rule_type}
              onChange={(e) => setFormData({ ...formData, rule_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
              required
            >
              <option value="ip_whitelist">IP Whitelist</option>
              <option value="ip_blacklist">IP Blacklist</option>
              <option value="country_whitelist">Country Whitelist</option>
              <option value="country_blacklist">Country Blacklist</option>
              <option value="asn_whitelist">ASN Whitelist</option>
              <option value="asn_blacklist">ASN Blacklist</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priorité</label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 100 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Configuration spécifique */}
          {(formData.rule_type === 'ip_whitelist' || formData.rule_type === 'ip_blacklist') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adresses IP (une par ligne)</label>
              <textarea
                value={Array.isArray(formData.config?.ips) ? formData.config.ips.join('\n') : ''}
                onChange={(e) => {
                  const ips = e.target.value.split('\n').filter(ip => ip.trim())
                  setFormData({ ...formData, config: { ...formData.config, ips } })
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg font-mono text-sm"
                rows={5}
                placeholder="192.168.1.1&#10;10.0.0.1"
              />
            </div>
          )}

          {(formData.rule_type === 'country_whitelist' || formData.rule_type === 'country_blacklist') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Codes pays (ISO 3166-1 alpha-2, un par ligne)</label>
              <textarea
                value={Array.isArray(formData.config?.countries) ? formData.config.countries.join('\n') : ''}
                onChange={(e) => {
                  const countries = e.target.value.split('\n').filter(c => c.trim())
                  setFormData({ ...formData, config: { ...formData.config, countries } })
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg font-mono text-sm"
                rows={5}
                placeholder="FR&#10;US&#10;GB"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Exemples: FR, US, GB, DE, etc.</p>
            </div>
          )}

          {(formData.rule_type === 'asn_whitelist' || formData.rule_type === 'asn_blacklist') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Numéros ASN (un par ligne)</label>
              <textarea
                value={Array.isArray(formData.config?.asns) ? formData.config.asns.join('\n') : ''}
                onChange={(e) => {
                  const asns = e.target.value.split('\n').filter(a => a.trim())
                  setFormData({ ...formData, config: { ...formData.config, asns } })
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg font-mono text-sm"
                rows={5}
                placeholder="12345&#10;67890"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {rule ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
