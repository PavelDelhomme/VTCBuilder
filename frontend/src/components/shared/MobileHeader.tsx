'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminSidebar from './AdminSidebar'
import { useTheme } from '@/contexts/ThemeContext'

interface MobileHeaderProps {
  title: string
  subtitle?: string
  onMenuClick?: () => void
}

export default function MobileHeader({ title, subtitle, onMenuClick }: MobileHeaderProps) {
  const { resolvedTheme, toggleTheme } = useTheme()

  return (
    <header className="lg:hidden bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onMenuClick}
          className="text-gray-600 dark:text-gray-400 dark:text-gray-300 hover:text-gray-900 dark:text-gray-100 dark:hover:text-gray-100 p-1 rounded-lg hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-700"
          aria-label="Ouvrir le menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
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
  )
}

