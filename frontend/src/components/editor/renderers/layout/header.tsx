/**
 * Renderer pour le bloc header
 */

import React, { useState } from 'react'
import { RendererProps } from '../types'

export const renderHeader = ({ block, wrapperStyles, theme }: RendererProps): React.ReactElement => {
  const headerLinks = block.data.links || []
  const logoText = block.data.logo_text || 'VTCBuilder'
  const logoUrl = block.data.logo_url || '/'
  const showThemeToggle = block.data.show_theme_toggle !== false
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <header 
      style={{
        ...wrapperStyles,
        position: block.data.sticky ? 'sticky' : 'static',
        top: block.data.sticky ? '0' : undefined,
        zIndex: block.data.sticky ? 50 : undefined,
      }}
      className={`mb-6 ${block.data.sticky ? 'sticky top-0 z-50' : ''} ${
        block.styles?.background_color || block.styles?.backgroundColor
          ? ''
          : 'bg-white/95 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between flex-wrap gap-2 min-w-0">
          <a href={logoUrl} className="flex items-center space-x-2 flex-shrink-0 min-w-0">
            {block.data.logo_image && (
              <img src={block.data.logo_image} alt={logoText} className="h-6 sm:h-8 w-auto flex-shrink-0" />
            )}
            <h1 className={`text-lg sm:text-2xl font-bold truncate ${
              block.styles?.color || 'text-gray-900 dark:text-white'
            }`}>
              {logoText}
            </h1>
            {block.data.badge && (
              <span className={`text-xs flex-shrink-0 ${
                block.styles?.color || 'text-gray-400 dark:text-gray-500'
              }`}>
                {block.data.badge}
              </span>
            )}
          </a>
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {showThemeToggle && (
              <button
                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                  block.styles?.color || 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Toggle theme"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>
            )}
            {headerLinks.length > 0 && (
              <>
                {/* Menu mobile hamburger */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  aria-label="Menu"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
                {/* Navigation desktop */}
                <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 flex-wrap">
                  {headerLinks.map((link: any, index: number) => (
                    <a
                      key={index}
                      href={link.url || '#'}
                      className={`font-medium transition-colors whitespace-nowrap ${link.custom_class || ''} ${
                        !link.color && !link.custom_class
                          ? (block.styles?.color || 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100')
                          : ''
                      }`}
                      style={{
                        color: link.color || undefined,
                        fontSize: link.font_size || undefined,
                        fontWeight: link.font_weight || undefined,
                        ...(link.hover_color ? {
                          '--hover-color': link.hover_color,
                        } as React.CSSProperties : {}),
                      } as React.CSSProperties}
                      onMouseEnter={(e) => {
                        if (link.hover_color) {
                          e.currentTarget.style.color = link.hover_color
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (link.color) {
                          e.currentTarget.style.color = link.color
                        }
                      }}
                    >
                      {link.label || `Lien ${index + 1}`}
                    </a>
                  ))}
                </nav>
                {/* Navigation mobile */}
                {mobileMenuOpen && (
                  <nav className="absolute top-full left-0 right-0 md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg z-50">
                    <div className="px-4 py-2 space-y-2">
                      {headerLinks.map((link: any, index: number) => (
                        <a
                          key={index}
                          href={link.url || '#'}
                          className={`block px-4 py-2 rounded-lg font-medium transition-colors ${link.custom_class || ''} ${
                            !link.color && !link.custom_class
                              ? (block.styles?.color || 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100')
                              : ''
                          }`}
                          style={{
                            color: link.color || undefined,
                            fontSize: link.font_size || undefined,
                            fontWeight: link.font_weight || undefined,
                          } as React.CSSProperties}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {link.label || `Lien ${index + 1}`}
                        </a>
                      ))}
                    </div>
                  </nav>
                )}
              </>
            )}
            {block.data.cta_button && (
              <a
                href={block.data.cta_button.url || '#'}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
                  block.data.cta_button.style === 'primary'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {block.data.cta_button.text || 'Action'}
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

