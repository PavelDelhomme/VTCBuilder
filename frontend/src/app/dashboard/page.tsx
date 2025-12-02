'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import TenantLayout from '@/components/tenant/TenantLayout'
import PageLoader from '@/components/shared/PageLoader'

export default function TenantDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Le layout gère déjà l'authentification, on récupère juste l'utilisateur
    const currentUser = authService.getStoredUser()
    if (currentUser) {
      setUser(currentUser)
    }
    setLoading(false)
  }, [])

  if (loading || !user) {
    return (
      <TenantLayout title="Dashboard">
        <PageLoader text="Chargement du dashboard..." />
      </TenantLayout>
    )
  }

  return (
    <TenantLayout title="Mon Dashboard VTC" subtitle={`Bonjour ${user.name} !`}>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Pages */}
        <button
          onClick={() => router.push('/dashboard/pages')}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer text-left"
        >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-lg p-3">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pages</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gérer le contenu</p>
              </div>
            </div>
          </button>

        {/* Services */}
        <button
          onClick={() => router.push('/dashboard/services')}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer text-left"
        >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-lg p-3">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Services VTC</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mes prestations</p>
              </div>
            </div>
          </button>

        {/* Réservations */}
        <button
          onClick={() => router.push('/dashboard/bookings')}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer text-left"
        >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-lg p-3">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Réservations</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mes courses</p>
              </div>
            </div>
          </button>

        {/* Médias */}
        <button
          onClick={() => router.push('/dashboard/media')}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer text-left"
        >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-lg p-3">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Médias</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Images & fichiers</p>
              </div>
            </div>
          </button>

        {/* Templates */}
        <button
          onClick={() => router.push('/dashboard/templates')}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer text-left"
        >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-lg p-3">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Templates</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Design du site</p>
              </div>
            </div>
          </button>

        {/* Utilisateurs */}
        <button
          onClick={() => router.push('/dashboard/users')}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer text-left"
        >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-pink-500 rounded-lg p-3">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Utilisateurs</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gérer l'équipe</p>
              </div>
            </div>
          </button>

        {/* Facturation */}
        <button
          onClick={() => router.push('/dashboard/billing')}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer text-left"
        >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-emerald-500 rounded-lg p-3">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Facturation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Abonnements & paiements</p>
              </div>
            </div>
          </button>

        {/* Paramètres */}
        <button
          onClick={() => router.push('/dashboard/settings')}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer text-left"
        >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gray-500 rounded-lg p-3">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Paramètres</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Configuration</p>
              </div>
            </div>
        </button>
      </div>

      {/* Welcome Message */}
      <div className="mt-6 lg:mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg p-6 lg:p-8">
        <h2 className="text-xl lg:text-2xl font-bold mb-2">Bienvenue sur VTCBuilder ! 🚀</h2>
        <p className="text-blue-100 mb-4 text-sm lg:text-base">
          Créez et gérez votre site VTC professionnel facilement. Commencez par personnaliser vos pages et services.
        </p>
        <button
          onClick={() => router.push('/dashboard/pages')}
          className="bg-white dark:bg-gray-800 text-blue-600 px-4 lg:px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm lg:text-base"
        >
          Commencer →
        </button>
      </div>
    </TenantLayout>
  )
}

