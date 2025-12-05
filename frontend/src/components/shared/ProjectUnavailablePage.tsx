'use client'

import { useTheme } from '@/contexts/ThemeContext'
import Link from 'next/link'

interface ProjectUnavailablePageProps {
  projectName?: string
  reason?: string
}

export default function ProjectUnavailablePage({ 
  projectName = 'ce projet',
  reason = 'Le projet est actuellement hors ligne'
}: ProjectUnavailablePageProps) {
  const { resolvedTheme } = useTheme()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animation rigolotte */}
        <div className="mb-8 relative">
          <div className="inline-block animate-bounce">
            <div className="text-9xl mb-4">😴</div>
          </div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
            <div className="text-4xl animate-pulse">💤</div>
          </div>
        </div>

        {/* Message principal */}
        <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Oups ! {projectName} est en pause
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          {reason}
        </p>

        {/* Illustration */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
              <svg 
                className="w-32 h-32 text-blue-600 dark:text-blue-400 animate-pulse" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
                />
              </svg>
            </div>
            <div className="absolute -top-4 -right-4 animate-bounce delay-300">
              <div className="text-4xl">🌙</div>
            </div>
            <div className="absolute -bottom-4 -left-4 animate-bounce delay-500">
              <div className="text-4xl">⭐</div>
            </div>
          </div>
        </div>

        {/* Message détaillé */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔧</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Maintenance en cours
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Le projet est temporairement désactivé pour maintenance ou mise à jour.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">⏰</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Bientôt de retour
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Nous travaillons dur pour remettre le projet en ligne rapidement.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">📧</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Besoin d'aide ?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Contactez-nous si vous avez des questions ou besoin d'assistance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            🏠 Retour à l'accueil
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            📞 Nous contacter
          </Link>
        </div>

        {/* Code d'erreur stylisé */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
            HTTP 503 • Service Temporairement Indisponible
          </p>
        </div>
      </div>
    </div>
  )
}

