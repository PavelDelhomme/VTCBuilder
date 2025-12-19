/**
 * Renderer pour le bloc header
 * Correspond exactement au PublicHeader pour avoir le même rendu
 */

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { RendererProps } from '../types'
import { useTheme } from '@/contexts/ThemeContext'
import authService from '@/services/auth.service'

export const renderHeader = ({ block, wrapperStyles, theme }: RendererProps): React.ReactElement => {
  const headerLinks = block.data.links || []
  const logoText = block.data.logo_text || 'VTCBuilder'
  const logoUrl = block.data.logo_url || '/'
  const showThemeToggle = block.data.show_theme_toggle !== false
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { resolvedTheme, toggleTheme } = useTheme()
  
  // Utiliser resolvedTheme si disponible, sinon utiliser le theme passé en prop
  const currentTheme = resolvedTheme || theme || 'light'

  // Détecter l'authentification comme dans PublicHeader
  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== 'undefined') {
      setIsAuthenticated(authService.isAuthenticated())
      setIsSuperAdmin(authService.isSuperAdmin())
    }
  }, [])
  
  return (
    <header 
      style={{
        ...wrapperStyles,
        position: block.data.sticky ? 'sticky' : 'static',
        top: block.data.sticky ? '0' : undefined,
        zIndex: block.data.sticky ? 50 : undefined,
        marginLeft: 0,
        marginRight: 0,
      }}
      className={`transition-colors duration-300 ${block.data.sticky ? 'sticky top-0 z-50' : ''} ${
        block.styles?.background_color || block.styles?.backgroundColor
          ? ''
          : currentTheme === 'dark'
            ? 'bg-gray-900/90 backdrop-blur-md border-b border-gray-800'
            : 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href={logoUrl} className="flex items-center space-x-2 flex-shrink-0">
            {block.data.logo_image && (
              <img src={block.data.logo_image} alt={logoText} className="h-6 sm:h-8 w-auto flex-shrink-0" />
            )}
            <h1 className={`text-xl sm:text-2xl font-bold whitespace-nowrap ${
              currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {logoText}
            </h1>
            {block.data.badge && (
              <span className={`text-xs whitespace-nowrap ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {block.data.badge}
              </span>
            )}
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {showThemeToggle && (
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                  currentTheme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-label={currentTheme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
                title={currentTheme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              >
                {currentTheme === 'dark' ? (
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
            {/* Navigation links si définis */}
            {headerLinks.length > 0 && (
              <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
                {headerLinks.map((link: any, index: number) => (
                  <Link
                    key={index}
                    href={link.url || '#'}
                    className={`text-sm xl:text-base whitespace-nowrap ${
                      currentTheme === 'dark' 
                        ? 'text-gray-300 hover:text-white' 
                        : 'text-gray-700 hover:text-gray-900'
                    } font-medium`}
                  >
                    {link.label || `Lien ${index + 1}`}
                  </Link>
                ))}
              </nav>
            )}
            
            {/* Boutons d'authentification - Responsive */}
            {!isMounted ? (
              <>
                <Link
                  href="/login"
                  className={`text-sm sm:text-base whitespace-nowrap ${
                    currentTheme === 'dark' 
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
                    className={`px-2 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${
                      currentTheme === 'dark'
                        ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                        : 'bg-white text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <span className="hidden sm:inline">Administration</span>
                    <span className="sm:hidden">Admin</span>
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className={`px-2 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${
                      currentTheme === 'dark'
                        ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                        : 'bg-white text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <span className="hidden sm:inline">Mon Dashboard</span>
                    <span className="sm:hidden">Dashboard</span>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-sm sm:text-base whitespace-nowrap ${
                    currentTheme === 'dark' 
                      ? 'text-gray-300 hover:text-white' 
                      : 'text-gray-700 hover:text-gray-900'
                  } font-medium`}
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className={`px-2 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${
                    currentTheme === 'dark'
                      ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                      : 'bg-white text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <span className="hidden sm:inline">Créer un compte</span>
                  <span className="sm:hidden">S'inscrire</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

