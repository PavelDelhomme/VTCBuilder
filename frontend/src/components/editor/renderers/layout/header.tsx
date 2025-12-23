/**
 * Renderer pour le bloc header
 * Correspond exactement au PublicHeader pour avoir le même rendu
 */

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { RendererProps } from '../types'
import { useTheme } from '@/contexts/ThemeContext'
import authService from '@/services/auth.service'

function HeaderComponent({ block, wrapperStyles, contentStyles, theme }: RendererProps): React.ReactElement {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { resolvedTheme, toggleTheme } = useTheme()
  
  // Détecter l'authentification comme dans PublicHeader
  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== 'undefined') {
      setIsAuthenticated(authService.isAuthenticated())
      setIsSuperAdmin(authService.isSuperAdmin())
    }
  }, [])
  
  if (!block) {
    return <div className="p-4 text-red-600">Erreur : Bloc non défini</div>
  }
  
  const safeBlock = { ...block, data: block.data || {} }
  const headerLinks = safeBlock.data.links || []
  const logoText = safeBlock.data.logo_text || 'VTCBuilder'
  const logoUrl = safeBlock.data.logo_url || '/'
  const badge = safeBlock.data.badge || ''
  const showThemeToggle = safeBlock.data.show_theme_toggle !== false
  // S'assurer que cta_button est bien récupéré, même si c'est un objet vide
  const ctaButton = safeBlock.data.cta_button && typeof safeBlock.data.cta_button === 'object' && safeBlock.data.cta_button.text
    ? safeBlock.data.cta_button
    : null
  
  // Utiliser resolvedTheme si disponible, sinon utiliser le theme passé en prop
  const currentTheme = resolvedTheme || theme || 'light'
  
  // Gérer le sticky - s'assurer que wrapperStyles ne l'écrase pas
  const stickyStyle = safeBlock.data.sticky ? {
    position: 'sticky' as const,
    top: '0',
    zIndex: 50,
  } : {}
  
  return (
    <header 
      style={{
        ...(wrapperStyles || {}),
        ...stickyStyle,
        marginLeft: 0,
        marginRight: 0,
      }}
      className={`transition-colors duration-300 ${safeBlock.data.sticky ? 'sticky top-0 z-50' : ''} ${
        block.styles?.background_color || block.styles?.backgroundColor
          ? ''
          : currentTheme === 'dark'
          ? 'bg-gray-900 text-gray-100'
          : 'bg-white text-gray-900'
      } border-b ${currentTheme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href={logoUrl} className="flex items-center gap-2">
              <span className="text-xl font-bold">
                {logoText}
              </span>
              {badge && (
                <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                  currentTheme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {badge}
                </span>
              )}
            </Link>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex space-x-8">
            {headerLinks.map((link: any, index: number) => (
              <Link
                key={index}
                href={link.url || '#'}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentTheme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {link.label || 'Lien'}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* CTA Button */}
            {ctaButton && ctaButton.text && (
              <Link
                href={ctaButton.url || '#'}
                className={`hidden md:inline-flex px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  ctaButton.style === 'primary'
                    ? currentTheme === 'dark'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    : currentTheme === 'dark'
                      ? 'bg-gray-800 text-gray-100 hover:bg-gray-700 border border-gray-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
                }`}
                style={{
                  marginLeft: 'auto',
                }}
              >
                {ctaButton.text}
              </Link>
            )}
            
            {/* Toggle Theme */}
            {showThemeToggle && (
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  currentTheme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-label="Toggle theme"
              >
                {currentTheme === 'dark' ? '☀️' : '🌙'}
              </button>
            )}

            {/* Menu Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                currentTheme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-800'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Mobile */}
        {mobileMenuOpen && (
          <div className={`md:hidden py-4 border-t ${currentTheme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="space-y-2">
              {headerLinks.map((link: any, index: number) => (
                <Link
                  key={index}
                  href={link.url || '#'}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    currentTheme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {link.label || 'Lien'}
                </Link>
              ))}
              {ctaButton && ctaButton.text && (
                <Link
                  href={ctaButton.url || '#'}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors text-center ${
                    ctaButton.style === 'primary'
                      ? currentTheme === 'dark'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      : currentTheme === 'dark'
                        ? 'bg-gray-800 text-gray-100 hover:bg-gray-700 border border-gray-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {ctaButton.text}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export const renderHeader = ({ block, wrapperStyles, contentStyles, theme }: RendererProps): React.ReactElement => {
  return <HeaderComponent block={block} wrapperStyles={wrapperStyles} contentStyles={contentStyles} theme={theme} />
}
