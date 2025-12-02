'use client'

import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import { useTheme } from '@/contexts/ThemeContext'

interface NavbarProps {
  title: string
  subtitle?: string
}

export default function Navbar({ title, subtitle }: NavbarProps) {
  const router = useRouter()
  const user = authService.getStoredUser()
  const { resolvedTheme, toggleTheme } = useTheme()

  return (
    <header className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-400 dark:text-gray-300 hover:text-gray-900 dark:text-gray-100 dark:hover:text-gray-100 p-2 rounded-lg hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-700 transition-colors"
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
          <span className="text-sm text-gray-700 dark:text-gray-300 dark:text-gray-300">{user?.name}</span>
          <button
            onClick={() => {
              authService.logout()
              router.push('/login')
            }}
            className="btn btn-secondary text-sm"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  )
}

