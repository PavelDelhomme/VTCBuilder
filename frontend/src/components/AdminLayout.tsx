'use client'

import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import MobileHeader from './MobileHeader'
import ImpersonationBanner from './ImpersonationBanner'
import { useTheme } from '@/contexts/ThemeContext'

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  headerActions?: React.ReactNode
}

export default function AdminLayout({ children, title, subtitle, headerActions }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { resolvedTheme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Impersonation Banner */}
      <ImpersonationBanner />
      
      {/* Mobile Header */}
      <MobileHeader 
        title={title} 
        subtitle={subtitle}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="flex">
        {/* Sidebar - Toujours présent mais caché/surpimposé selon la taille d'écran */}
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className="flex-1 w-full min-w-0 transition-all duration-300 lg:ml-64">
          {/* Desktop Header avec hamburger pour ouvrir/fermer */}
          <header className="hidden lg:block bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/50">
            <div className="w-full py-4 px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-gray-600 dark:text-gray-400 dark:text-gray-300 hover:text-gray-900 dark:text-gray-100 dark:hover:text-gray-100 p-2 rounded-lg hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                    aria-label="Toggle menu"
                    title={sidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-gray-100 truncate">{title}</h1>
                    {subtitle && <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">{subtitle}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
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
                  {headerActions && <div className="w-full lg:w-auto">{headerActions}</div>}
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="w-full max-w-full overflow-x-hidden py-4 lg:py-6 px-3 sm:px-4 lg:px-6 xl:px-8">
            <div className="w-full max-w-full overflow-x-hidden">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

