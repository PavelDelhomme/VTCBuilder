'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import authService from '@/services/auth.service'
import { useTheme } from '@/contexts/ThemeContext'

interface PublicHeaderProps {
  showThemeToggle?: boolean
}

export default function PublicHeader({ showThemeToggle = false }: PublicHeaderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  // Utiliser useTheme - le provider doit être monté dans le layout
  const { resolvedTheme, toggleTheme } = useTheme()

  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== 'undefined') {
      setIsAuthenticated(authService.isAuthenticated())
      setIsSuperAdmin(authService.isSuperAdmin())
    }
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-300 ${
      resolvedTheme === 'dark' 
        ? 'bg-gray-900/90 backdrop-blur-md border-b border-gray-800' 
        : 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <h1 className={`text-2xl font-bold ${
              resolvedTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>VTCBuilder</h1>
            <span className={`text-xs ${
              resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>Beta</span>
          </Link>
          <div className="flex items-center space-x-4">
            {/* Theme Toggle - Discret */}
            {showThemeToggle && (
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  resolvedTheme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-label={resolvedTheme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
                title={resolvedTheme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              >
                {resolvedTheme === 'dark' ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            )}
            {!isMounted ? (
              <>
                <Link
                  href="/login"
                  className={`${
                    resolvedTheme === 'dark' 
                      ? 'text-gray-300 hover:text-white' 
                      : 'text-gray-700 hover:text-gray-900'
                  } font-medium`}
                  suppressHydrationWarning
                >
                  Connexion
                </Link>
              </>
            ) : isAuthenticated ? (
              <>
                {isSuperAdmin ? (
                  <Link
                    href="/admin/dashboard"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      resolvedTheme === 'dark'
                        ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                        : 'bg-white text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    Administration
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      resolvedTheme === 'dark'
                        ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                        : 'bg-white text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    Mon Dashboard
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`${
                    resolvedTheme === 'dark' 
                      ? 'text-gray-300 hover:text-white' 
                      : 'text-gray-700 hover:text-gray-900'
                  } font-medium`}
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    resolvedTheme === 'dark'
                      ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                      : 'bg-white text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Créer un compte
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

