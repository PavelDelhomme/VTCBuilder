'use client'

import { useState, useEffect } from 'react'
import { useFeatures } from '@/contexts/FeaturesContext'
import billingService, { Subscription } from '@/services/billing.service'
import authService from '@/services/auth.service'

interface SubscriptionInfoProps {
  className?: string
}

export default function SubscriptionInfo({ className = '' }: SubscriptionInfoProps) {
  const { features, loading: featuresLoading } = useFeatures()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        // Pour les super admins, pas besoin de charger l'abonnement
        if (authService.isSuperAdmin()) {
          setLoading(false)
          return
        }

        const sub = await billingService.getCurrentSubscription()
        setSubscription(sub)
      } catch (error) {
        // Erreur silencieuse si pas d'abonnement
        console.debug('No subscription found')
      } finally {
        setLoading(false)
      }
    }

    loadSubscription()
  }, [])

  if (loading || featuresLoading) {
    return null
  }

  // Pour les super admins, ne pas afficher
  if (authService.isSuperAdmin()) {
    return null
  }

  const planName = subscription?.plan?.name || 'Aucun abonnement'
  const planStatus = subscription?.status || 'none'

  // Compter les fonctionnalités disponibles
  const availableFeatures = features ? Object.entries(features).filter(([key, value]) => {
    if (key.startsWith('max_')) return false
    if (key === 'available_block_types') return false
    return value === true || (typeof value === 'number' && value > 0)
  }).length : 0

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
        title="Voir les fonctionnalités disponibles"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span className="hidden sm:inline">{planName}</span>
        <span className="sm:hidden">Plan</span>
        {planStatus === 'trial' && (
          <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded text-xs font-semibold">
            Trial
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[600px] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Abonnement & Fonctionnalités
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {subscription && (
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{subscription.plan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Statut:</span>
                    <span className={`font-medium ${
                      planStatus === 'active' ? 'text-green-600 dark:text-green-400' :
                      planStatus === 'trial' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {planStatus === 'active' ? 'Actif' :
                       planStatus === 'trial' ? 'Trial' :
                       planStatus === 'cancelled' ? 'Annulé' :
                       planStatus === 'expired' ? 'Expiré' : 'Inactif'}
                    </span>
                  </div>
                  {subscription.current_period_end && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Expire le:</span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Fonctionnalités disponibles ({availableFeatures})
              </h4>
              {features && (
                <div className="space-y-2">
                  {features.can_use_premium_blocks && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">Blocs premium</span>
                    </div>
                  )}
                  {features.can_use_analytics && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">Analytics</span>
                    </div>
                  )}
                  {features.can_use_custom_domain && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">Domaine personnalisé</span>
                    </div>
                  )}
                  {features.can_use_advanced_seo && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">SEO avancé</span>
                    </div>
                  )}
                  {features.can_use_ecommerce && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">E-commerce</span>
                    </div>
                  )}
                  {features.can_use_booking_system && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">Système de réservation</span>
                    </div>
                  )}
                  {features.max_pages > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        Pages: {features.max_pages === -1 ? 'Illimité' : features.max_pages}
                      </span>
                    </div>
                  )}
                  {features.max_storage_gb > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        Stockage: {features.max_storage_gb === -1 ? 'Illimité' : `${features.max_storage_gb} GB`}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

