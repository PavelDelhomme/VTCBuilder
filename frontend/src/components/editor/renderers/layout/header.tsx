/**
 * Renderer pour le bloc header
 * Correspond exactement au PublicHeader pour avoir le même rendu
 */

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { RendererProps } from '../types'
import authService from '@/services/auth.service'

function HeaderComponent({ block, wrapperStyles, contentStyles, theme }: RendererProps): React.ReactElement {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
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
  // Gérer plusieurs boutons CTA ou un seul bouton (rétrocompatibilité)
  const ctaButtons = safeBlock.data.cta_buttons && Array.isArray(safeBlock.data.cta_buttons) && safeBlock.data.cta_buttons.length > 0
    ? safeBlock.data.cta_buttons.filter((btn: any) => btn && btn.text)
    : (safeBlock.data.cta_button && typeof safeBlock.data.cta_button === 'object' && safeBlock.data.cta_button.text
      ? [safeBlock.data.cta_button]
      : [])
  
  // Utiliser uniquement le thème de prévisualisation, pas le thème global
  const currentTheme = theme || 'light'
  
  // Gérer le sticky - s'assurer que wrapperStyles ne l'écrase pas
  const stickyStyle = safeBlock.data.sticky ? {
    position: 'sticky' as const,
    top: '0',
    zIndex: 50,
  } : {}
  
  return (
    <header 
      data-block-id={block.id}
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
      <div className="container mx-auto px-1 xs:px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 max-w-full overflow-hidden">
        <div className="flex items-center justify-between h-10 xs:h-11 sm:h-14 md:h-16 lg:h-[4.5rem] xl:h-20 min-h-[2.5rem] xs:min-h-[2.75rem] sm:min-h-[3.5rem] md:min-h-[4rem] lg:min-h-[4.5rem] xl:min-h-[5rem]">
          {/* Logo */}
          <div className="flex-shrink-0 min-w-0 max-w-[40%] xs:max-w-[50%] sm:max-w-[60%] md:max-w-none">
            <Link href={logoUrl} className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3">
              <span className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl font-bold truncate ml-1 xs:ml-1.5 sm:ml-2" title={logoText}>
                {logoText}
              </span>
              {badge && (
                <span className={`px-1 sm:px-1.5 md:px-2 lg:px-2.5 xl:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-semibold rounded flex-shrink-0 ${
                  currentTheme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {badge}
                </span>
              )}
            </Link>
          </div>

          {/* Navigation Desktop - Afficher à partir de tablette (lg) */}
          <nav className="hidden lg:flex items-center space-x-1 md:space-x-1.5 lg:space-x-2 xl:space-x-2.5 2xl:space-x-3 flex-1 justify-center max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-1 lg:mx-2 xl:mx-3 2xl:mx-4 overflow-hidden">
            {headerLinks.map((link: any, index: number) => (
              <Link
                key={index}
                href={link.url || '#'}
                data-sub-element-type="header-link"
                data-sub-element-index={index}
                data-block-id={block.id}
                className={`px-1 md:px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 py-1 md:py-1.5 lg:py-2 rounded-md text-[10px] md:text-xs lg:text-sm font-medium transition-colors whitespace-nowrap truncate max-w-[80px] md:max-w-[95px] lg:max-w-[110px] xl:max-w-[120px] 2xl:max-w-[140px] flex-shrink-0 ${
                  currentTheme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title={link.label || 'Lien'}
              >
                {link.label || 'Lien'}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 lg:gap-2.5 xl:gap-3 flex-shrink-0 mr-1 xs:mr-1.5 sm:mr-2">
            {/* CTA Buttons - Desktop - Afficher à partir de tablette (lg) */}
            {ctaButtons.length > 0 && (
              <div 
                className="hidden lg:flex items-center gap-1 md:gap-1.5 lg:gap-2 xl:gap-2.5 2xl:gap-3" 
                onClick={(e) => {
                  // Empêcher la propagation du clic pour que seul le bouton soit sélectionné
                  e.stopPropagation()
                }}
              >
                {ctaButtons.map((ctaButton: any, index: number) => (
                  <Link
                    key={index}
                    href={ctaButton.url || '#'}
                    data-sub-element-type="header-cta-button"
                    data-sub-element-index={index}
                    data-block-id={block.id}
                    onClick={(e) => {
                      // Empêcher la navigation et la propagation
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    className={`px-2 md:px-2.5 lg:px-3 xl:px-3.5 2xl:px-4 py-1 md:py-1.5 lg:py-2 rounded-lg text-[10px] md:text-xs lg:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer truncate max-w-[70px] md:max-w-[80px] lg:max-w-[90px] xl:max-w-[100px] 2xl:max-w-[110px] ${
                      ctaButton.style === 'primary'
                        ? currentTheme === 'dark'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        : currentTheme === 'dark'
                          ? 'bg-gray-800 text-gray-100 hover:bg-gray-700 border border-gray-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
                    }`}
                    title={ctaButton.text}
                  >
                    {ctaButton.text}
                  </Link>
                ))}
              </div>
            )}
            
            {/* Toggle Theme - Désactivé dans la prévisualisation car le thème est géré par le bouton de prévisualisation */}
            {/* Le thème de prévisualisation est contrôlé par le bouton dans la barre d'outils de prévisualisation */}

            {/* Menu Mobile - Afficher sur petits écrans et tablette verticale */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-1 sm:p-1.5 md:p-2 rounded-lg transition-colors flex-shrink-0 ${
                currentTheme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-800'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Mobile - Afficher sur petits écrans et tablette verticale */}
        {mobileMenuOpen && (
          <div className={`lg:hidden py-2 sm:py-3 border-t ${currentTheme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="space-y-1">
              {headerLinks.map((link: any, index: number) => (
                <Link
                  key={index}
                  href={link.url || '#'}
                  data-sub-element-type="header-link"
                  data-sub-element-index={index}
                  data-block-id={block.id}
                  onClick={(e) => {
                    // Fermer le menu mobile après clic
                    setMobileMenuOpen(false)
                    e.stopPropagation()
                  }}
                  className={`block px-3 py-2 rounded-md text-sm sm:text-base font-medium transition-colors ${
                    currentTheme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {link.label || 'Lien'}
                </Link>
              ))}
              {ctaButtons.length > 0 && (
                <div 
                  className="flex flex-col gap-2 pt-2"
                  onClick={(e) => {
                    // Empêcher la propagation du clic pour que seul le bouton soit sélectionné
                    e.stopPropagation()
                  }}
                >
                  {ctaButtons.map((ctaButton: any, index: number) => (
                    <Link
                      key={index}
                      href={ctaButton.url || '#'}
                      data-sub-element-type="header-cta-button"
                      data-sub-element-index={index}
                      data-block-id={block.id}
                      onClick={(e) => {
                        // Fermer le menu mobile après clic
                        setMobileMenuOpen(false)
                        // Empêcher la navigation et la propagation
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      className={`block px-4 py-2.5 rounded-lg text-sm sm:text-base font-medium transition-colors text-center cursor-pointer ${
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
                  ))}
                </div>
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
