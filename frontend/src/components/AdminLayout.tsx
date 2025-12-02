'use client'

import { useState, useEffect } from 'react'
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

const SIDEBAR_STATE_KEY = 'vtcbuilder_admin_sidebar_open'

export default function AdminLayout({ children, title, subtitle, headerActions }: AdminLayoutProps) {
  const { resolvedTheme, toggleTheme } = useTheme()
  
  // Fonction pour charger l'état sauvegardé depuis localStorage
  const loadSidebarState = (): boolean => {
    try {
      if (typeof window === 'undefined') return false
      
      const saved = localStorage.getItem(SIDEBAR_STATE_KEY)
      if (saved !== null) {
        return saved === 'true'
      }
    } catch (error) {
      // En cas d'erreur (localStorage bloqué, etc.), logger et retourner false
      console.error('Erreur lors du chargement de l\'état du sidebar:', error)
    }
    return false
  }

  // Fonction pour sauvegarder l'état dans localStorage
  const saveSidebarState = (isOpen: boolean) => {
    try {
      if (typeof window === 'undefined') return
      localStorage.setItem(SIDEBAR_STATE_KEY, String(isOpen))
    } catch (error) {
      // En cas d'erreur (localStorage bloqué, quota dépassé, etc.), logger seulement
      console.error('Erreur lors de la sauvegarde de l\'état du sidebar:', error)
    }
  }

  // Initialiser l'état : toujours false au début pour éviter les erreurs d'hydratation
  // L'état sera mis à jour après le montage dans useEffect
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Sauvegarder l'état à chaque changement (uniquement sur desktop)
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Ne sauvegarder que si on est sur desktop
    if (window.innerWidth >= 1024) {
      saveSidebarState(sidebarOpen)
    }
  }, [sidebarOpen])

  // Détecter la taille d'écran et ajuster l'état du sidebar après le montage
  useEffect(() => {
    // Vérifier que window est disponible (client-side uniquement)
    if (typeof window === 'undefined') return

    const checkScreenSize = () => {
      const isDesktop = window.innerWidth >= 1024
      
      if (isDesktop) {
        // Sur desktop, restaurer l'état sauvegardé ou laisser ouvert
        const savedState = loadSidebarState()
        setSidebarOpen(savedState !== null ? savedState : true)
      } else {
        // Sur mobile, toujours fermer (même si sauvegardé comme ouvert)
        setSidebarOpen(false)
      }
    }

    // Vérifier au montage (après l'hydratation)
    checkScreenSize()

    // Écouter les changements de taille d'écran
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Empêcher le scroll du body quand le sidebar est ouvert sur mobile
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    if (sidebarOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = ''
      }
    }
  }, [sidebarOpen])

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* Impersonation Banner */}
      <ImpersonationBanner />
      
      {/* Mobile Header */}
      <MobileHeader 
        title={title} 
        subtitle={subtitle}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="flex relative flex-1 min-h-0 overflow-hidden">
        {/* Sidebar - Toujours présent mais caché/surpimposé selon la taille d'écran */}
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content - S'adapte à l'espace disponible, marge conditionnelle selon l'état du sidebar */}
        {/* Sur mobile: toujours ml-0 (pas de marge), sur desktop: ml-64 si ouvert, ml-0 si fermé */}
        <div className={`flex-1 w-full min-w-0 transition-all duration-300 flex flex-col overflow-hidden ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
        }`}>
          {/* Desktop Header avec hamburger pour ouvrir/fermer */}
          <header className="hidden lg:block bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/50 flex-shrink-0">
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

          {/* Content - Utilise tout l'espace disponible avec scroll */}
          <main className="flex-1 w-full min-w-0 overflow-hidden flex flex-col">
            <div className="w-full min-w-0 flex-1 min-h-0 overflow-y-auto py-4 sm:py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

