'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { useTheme } from '@/contexts/ThemeContext'

interface MobileHeaderProps {
  title: string | React.ReactNode
  subtitle?: string | React.ReactNode
  onMenuClick?: () => void
  saveStatus?: React.ReactNode
}

export default function MobileHeader({ title, subtitle, onMenuClick, saveStatus }: MobileHeaderProps) {
  const { resolvedTheme, toggleTheme } = useTheme()

  return (
    <header className={`lg:hidden sticky top-0 z-30 transition-colors duration-300 ${
      resolvedTheme === 'dark' 
        ? 'bg-gray-900/90 backdrop-blur-md border-b border-gray-800 shadow-lg shadow-gray-900/50' 
        : 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'
    }`}>
      <div className="flex items-center justify-between px-3 py-2 gap-2">
        <button
          onClick={onMenuClick}
          className="text-gray-600 dark:text-gray-400 dark:text-gray-300 hover:text-gray-900 dark:text-gray-100 dark:hover:text-gray-100 p-1.5 rounded-lg hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-700 flex-shrink-0"
          aria-label="Ouvrir le menu"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex-1 text-center min-w-0">
          <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">{title}</h1>
          {subtitle && (
            typeof subtitle === 'string' ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:block">{subtitle}</p>
            ) : (
              <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{subtitle}</div>
            )
          )}
        </div>
        
        {/* Save Status - Visible sur mobile */}
        {saveStatus && (
          <div className="flex-shrink-0">
            {saveStatus}
          </div>
        )}
        
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="text-gray-600 dark:text-gray-400 dark:text-gray-300 hover:text-gray-900 dark:text-gray-100 dark:hover:text-gray-100 p-1.5 rounded-lg hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
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
  )
}

