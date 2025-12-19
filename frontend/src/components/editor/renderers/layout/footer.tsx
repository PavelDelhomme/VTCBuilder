/**
 * Renderer pour le bloc footer
 */

import React from 'react'
import { RendererProps } from '../types'

export const renderFooter = ({ block, wrapperStyles, theme }: RendererProps): React.ReactElement => {
  const safeBlock = { ...block, data: block.data || {} }
  const footerColumns = safeBlock.data.columns || []
  const currentYear = new Date().getFullYear()
  const defaultCopyright = safeBlock.data.copyright || `© ${currentYear} VTCBuilder. Tous droits réservés.`
  const defaultAdditionalText = safeBlock.data.additional_text || 'vtcbuilder.com - Développé avec ❤️ en France'
  const footerTitle = safeBlock.data.title || 'VTCBuilder'
  const footerDescription = safeBlock.data.description || 'La plateforme SaaS complète pour créer et gérer votre site VTC professionnel.'
  const supportDarkMode = block.styles?.support_dark_mode !== false
  const footerIsDark = theme === 'dark' && supportDarkMode
  
  return (
    <footer style={wrapperStyles || {}} className={`mb-0 ${footerIsDark ? 'bg-gray-800' : 'bg-gray-100'} ${footerIsDark ? 'text-gray-100' : 'text-gray-900'} py-8 sm:py-12 w-full min-w-0 overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
        {/* Titre et description du footer si définis */}
        {(footerTitle || footerDescription) && (
          <div className="mb-8 text-center sm:text-left">
            {footerTitle && (
              <h2 className={`text-2xl sm:text-3xl font-bold mb-3 ${footerIsDark ? 'text-gray-100' : 'text-gray-900'}`}>
                {footerTitle}
              </h2>
            )}
            {footerDescription && (
              <p className={`text-base sm:text-lg ${footerIsDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl ${footerTitle ? '' : 'mx-auto'}`}>
                {footerDescription}
              </p>
            )}
          </div>
        )}
        {footerColumns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 w-full min-w-0 mb-8">
            {footerColumns.map((column: any, colIndex: number) => (
              <div key={colIndex} className="min-w-0 overflow-hidden">
                {column.title && (
                  <h3 className={`${colIndex === 0 ? 'text-lg sm:text-xl font-bold' : 'font-bold text-base sm:text-lg'} mb-3 sm:mb-4 ${footerIsDark ? 'text-gray-100' : 'text-gray-900'} break-words`}>
                    {column.title}
                  </h3>
                )}
                {column.description && (
                  <p className={`text-sm sm:text-base ${footerIsDark ? 'text-gray-300' : 'text-gray-600'} mb-3 sm:mb-4 break-words`}>{column.description}</p>
                )}
                {(column.links || []).length > 0 && (
                  <ul className={`space-y-2 text-sm sm:text-base ${footerIsDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {column.links.map((link: any, linkIndex: number) => (
                      <li key={linkIndex} className="break-words">
                        <a
                          href={link.url || '#'}
                          className={`${footerIsDark ? 'hover:text-gray-100' : 'hover:text-gray-900'} transition-colors break-words`}
                        >
                          {link.label || 'Lien'}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Footer par défaut si aucune colonne n'est configurée
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className={`text-xl font-bold mb-4 ${footerIsDark ? 'text-gray-100' : 'text-gray-900'}`}>{footerTitle}</h3>
              <p className={footerIsDark ? 'text-gray-300' : 'text-gray-600'}>
                {footerDescription}
              </p>
            </div>
            <div>
              <h4 className={`font-bold mb-4 ${footerIsDark ? 'text-gray-100' : 'text-gray-900'}`}>Produit</h4>
              <ul className={`space-y-2 ${footerIsDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li><a href="/#pricing" className={`${footerIsDark ? 'hover:text-gray-100' : 'hover:text-gray-900'} transition-colors`}>Tarifs</a></li>
                <li><a href="/features" className={`${footerIsDark ? 'hover:text-gray-100' : 'hover:text-gray-900'} transition-colors`}>Fonctionnalités</a></li>
                <li><a href="/templates" className={`${footerIsDark ? 'hover:text-gray-100' : 'hover:text-gray-900'} transition-colors`}>Templates</a></li>
              </ul>
            </div>
            <div>
              <h4 className={`font-bold mb-4 ${footerIsDark ? 'text-gray-100' : 'text-gray-900'}`}>Support</h4>
              <ul className={`space-y-2 ${footerIsDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li><a href="/docs" className={`${footerIsDark ? 'hover:text-gray-100' : 'hover:text-gray-900'} transition-colors`}>Documentation</a></li>
                <li><a href="/contact" className={`${footerIsDark ? 'hover:text-gray-100' : 'hover:text-gray-900'} transition-colors`}>Contact</a></li>
                <li><a href="/faq" className={`${footerIsDark ? 'hover:text-gray-100' : 'hover:text-gray-900'} transition-colors`}>FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className={`font-bold mb-4 ${footerIsDark ? 'text-gray-100' : 'text-gray-900'}`}>Légal</h4>
              <ul className={`space-y-2 ${footerIsDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li><a href="/legal/terms" className={`${footerIsDark ? 'hover:text-gray-100' : 'hover:text-gray-900'} transition-colors`}>CGV</a></li>
                <li><a href="/legal/privacy" className={`${footerIsDark ? 'hover:text-gray-100' : 'hover:text-gray-900'} transition-colors`}>Confidentialité</a></li>
              </ul>
            </div>
          </div>
        )}
        {/* Copyright et texte additionnel - toujours affichés */}
        <div className={`border-t ${footerIsDark ? 'border-gray-700' : 'border-gray-300'} mt-8 pt-8 text-center ${footerIsDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <p className="text-sm sm:text-base">{defaultCopyright}</p>
          {defaultAdditionalText && (
            <p className="mt-2 text-xs sm:text-sm">{defaultAdditionalText}</p>
          )}
        </div>
      </div>
    </footer>
  )
}

