'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import ImpersonationBanner from './ImpersonationBanner'
import { useTheme } from '@/contexts/ThemeContext'

interface TenantLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  headerActions?: React.ReactNode
}

export default function TenantLayout({ children, title, subtitle, headerActions }: TenantLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { resolvedTheme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Impersonation Banner */}
      <ImpersonationBanner />
      
      {/* Mobile Header */}
      <header className="lg:hidden bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 dark:text-gray-400 dark:text-gray-300 hover:text-gray-900 dark:text-gray-100 dark:hover:text-gray-100"
            aria-label="Ouvrir le menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate px-2">{title}</h1>
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 truncate px-2">{subtitle}</p>}
          </div>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-400 dark:text-gray-300 hover:text-gray-900 dark:text-gray-100 dark:hover:text-gray-100 p-1 rounded-lg hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-700 transition-colors"
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
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          {/* Desktop Header */}
          <header className="hidden lg:block bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/50">
            <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
                  {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>}
                </div>
                <div className="flex items-center gap-4">
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
                  {headerActions && <div>{headerActions}</div>}
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="w-full py-4 lg:py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

