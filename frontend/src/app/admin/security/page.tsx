'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/admin/AdminLayout'
import toast from 'react-hot-toast'
import PageLoader from '@/components/shared/PageLoader'

export default function SecurityPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'waf' | 'firewall' | 'monitoring' | 'logs' | 'settings'>('waf')

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    
    if (!authService.isSuperAdmin()) {
      router.push('/dashboard')
      return
    }
    
    setLoading(false)
  }, [router])

  if (loading) {
    return <PageLoader />
  }

  return (
    <AdminLayout title="Cybersécurité" subtitle="Gestion de la sécurité et protection du système">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('waf')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'waf'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              🔒 WAF (Web Application Firewall)
            </button>
            <button
              onClick={() => setActiveTab('firewall')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'firewall'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              🛡️ Firewall
            </button>
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'monitoring'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              📊 Monitoring & Alertes
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              📝 Logs de sécurité
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              ⚙️ Paramètres
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {activeTab === 'waf' && (
            <div className="space-y-4">
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <span className="text-3xl">🔒</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  WAF (Web Application Firewall)
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Interface de gestion du WAF à venir
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Fonctionnalités prévues : règles de filtrage, protection DDoS, gestion des IPs bloquées, etc.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'firewall' && (
            <div className="space-y-4">
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <span className="text-3xl">🛡️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Firewall
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Interface de gestion du firewall à venir
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Fonctionnalités prévues : règles de pare-feu, gestion des ports, etc.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-4">
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Monitoring & Alertes
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Interface de monitoring de sécurité à venir
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Fonctionnalités prévues : alertes en temps réel, graphiques de sécurité, etc.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Logs de sécurité
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Interface de consultation des logs à venir
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Fonctionnalités prévues : consultation des logs, filtres, export, etc.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <span className="text-3xl">⚙️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Paramètres de sécurité
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Configuration générale de la sécurité à venir
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Fonctionnalités prévues : configuration générale, politiques de sécurité, etc.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

