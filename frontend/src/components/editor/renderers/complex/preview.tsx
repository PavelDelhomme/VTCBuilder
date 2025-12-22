/**
 * Renderers pour les blocs complexes (hero, features-grid, cta-section, etc.)
 */

import React from 'react'
import Link from 'next/link'
import { RendererProps } from '../types'
import { useTheme } from '@/contexts/ThemeContext'

function HeroComponent({ block, wrapperStyles, contentStyles, theme }: RendererProps): React.ReactElement {
  const { resolvedTheme } = useTheme()
  const currentTheme = resolvedTheme || theme || 'light'
  
  if (!block) {
    return <div className="p-4 text-red-600">Erreur : Bloc non défini</div>
  }
  const safeBlock = { ...block, data: block.data || {} }
  // Convertir le gradient Tailwind en CSS gradient
  const getGradientFromTailwind = (gradient: string) => {
    if (!gradient) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    
    // Extraire les couleurs du gradient Tailwind (ex: "from-blue-500 via-purple-600 to-pink-500")
    const fromMatch = gradient.match(/from-(\w+)-(\d+)/)
    const viaMatch = gradient.match(/via-(\w+)-(\d+)/)
    const toMatch = gradient.match(/to-(\w+)-(\d+)/)
    
    // Mapping simplifié des couleurs Tailwind
    const colorMap: Record<string, Record<string, string>> = {
      blue: { '500': '#3b82f6', '600': '#2563eb' },
      purple: { '600': '#9333ea', '500': '#a855f7' },
      pink: { '500': '#ec4899', '600': '#db2777' },
    }
    
    const fromColor = fromMatch ? (colorMap[fromMatch[1]]?.[fromMatch[2]] || '#3b82f6') : '#3b82f6'
    const viaColor = viaMatch ? (colorMap[viaMatch[1]]?.[viaMatch[2]] || '#9333ea') : '#9333ea'
    const toColor = toMatch ? (colorMap[toMatch[1]]?.[toMatch[2]] || '#ec4899') : '#ec4899'
    
    return `linear-gradient(135deg, ${fromColor} 0%, ${viaColor} 50%, ${toColor} 100%)`
  }
  
  // Déterminer le fond selon le type
  let heroBg = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' // Par défaut
  const heroPreviewBackgroundType = safeBlock.data.background_type || (safeBlock.data.background_image ? 'image' : 'gradient')
  
  if (heroPreviewBackgroundType === 'image' && safeBlock.data.background_image) {
    heroBg = `url(${safeBlock.data.background_image})`
  } else if (heroPreviewBackgroundType === 'color' && safeBlock.data.background_color) {
    heroBg = safeBlock.data.background_color
  } else if (heroPreviewBackgroundType === 'gradient' && safeBlock.data.background_gradient) {
    heroBg = getGradientFromTailwind(safeBlock.data.background_gradient)
  } else if (safeBlock.data.background_gradient) {
    // Fallback pour l'ancien format
    heroBg = getGradientFromTailwind(safeBlock.data.background_gradient)
  } else if (safeBlock.data.background_image) {
    // Fallback pour l'ancien format
    heroBg = `url(${safeBlock.data.background_image})`
  }
  
  // Construire les boutons depuis primary_button_text/link et secondary_button_text/link
  const heroButtons: Array<{ text: string; url: string; style: 'primary' | 'secondary' }> = []
  if (safeBlock.data.primary_button_text && safeBlock.data.primary_button_link) {
    heroButtons.push({
      text: safeBlock.data.primary_button_text,
      url: safeBlock.data.primary_button_link,
      style: 'primary'
    })
  }
  if (safeBlock.data.secondary_button_text && safeBlock.data.secondary_button_link) {
    heroButtons.push({
      text: safeBlock.data.secondary_button_text,
      url: safeBlock.data.secondary_button_link,
      style: 'secondary'
    })
  }
  
  // Fallback vers l'ancien format si les nouveaux champs ne sont pas définis
  if (heroButtons.length === 0) {
    if (safeBlock.data.buttons && Array.isArray(safeBlock.data.buttons) && safeBlock.data.buttons.length > 0) {
      heroButtons.push(...safeBlock.data.buttons)
    } else if (safeBlock.data.button_text) {
      heroButtons.push({
        text: safeBlock.data.button_text,
        url: safeBlock.data.button_url || '#',
        style: 'primary'
      })
    } else {
      // Boutons par défaut si aucun bouton n'est défini
      heroButtons.push(
        { text: 'Démarrer gratuitement', url: '/register', style: 'primary' },
        { text: 'Voir les tarifs', url: '#pricing', style: 'secondary' }
      )
    }
  }
  
  // Déterminer le fond selon le thème si aucun fond personnalisé n'est défini
  let finalBg = heroBg
  if (!safeBlock.data.background_type && !safeBlock.data.background_image && !safeBlock.data.background_color && !safeBlock.data.background_gradient) {
    // Utiliser le gradient par défaut selon le thème (comme sur localhost:9494)
    if (currentTheme === 'dark') {
      finalBg = 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)'
    } else {
      finalBg = 'linear-gradient(135deg, #3b82f6 0%, #9333ea 50%, #ec4899 100%)'
    }
  }
  
  return (
    <section 
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center transition-colors duration-300 ${
        !safeBlock.data.background_type && !safeBlock.data.background_image && !safeBlock.data.background_color && !safeBlock.data.background_gradient
          ? currentTheme === 'dark'
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
            : 'bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500'
          : ''
      }`}
      style={{
        ...(wrapperStyles ? Object.fromEntries(
          Object.entries(wrapperStyles).filter(([key]) => 
            !['padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'color'].includes(key)
          )
        ) : {}),
        ...(safeBlock.data.background_type || safeBlock.data.background_image || safeBlock.data.background_color || safeBlock.data.background_gradient ? {
          background: finalBg,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}),
        textAlign: block.styles?.text_align || 'center',
      }}
    >
      <h1 className={`text-4xl md:text-6xl font-extrabold mb-6 ${
        currentTheme === 'dark' ? 'text-white' : 'text-white'
      }`}>
        {safeBlock.data.title || 'Hero Title'}
      </h1>
      {safeBlock.data.subtitle && (
        <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${
          currentTheme === 'dark' ? 'text-white/90' : 'text-white/90'
        }`}>
          {safeBlock.data.subtitle}
        </p>
      )}
      {heroButtons.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {heroButtons.map((btn: any, index: number) => (
            <Link
              key={index}
              href={btn.url || '#'}
              onClick={(e) => {
                // Si c'est un lien d'ancrage (#pricing), faire défiler vers l'élément
                if (btn.url && btn.url.startsWith('#')) {
                  e.preventDefault()
                  const targetId = btn.url.substring(1)
                  const targetElement = document.getElementById(targetId)
                  if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' })
                  }
                }
              }}
              className={`px-8 py-4 rounded-lg font-bold text-lg transition-colors ${
                btn.style === 'primary'
                  ? currentTheme === 'dark'
                    ? 'bg-white text-gray-900 hover:bg-gray-100 shadow-xl'
                    : 'bg-white text-blue-600 hover:bg-blue-50 shadow-xl'
                  : currentTheme === 'dark'
                    ? 'bg-gray-800/80 backdrop-blur-md text-white hover:bg-gray-800 border border-gray-700'
                    : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border border-white/30'
              }`}
            >
              {btn.text}
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

export const renderHero = ({ block, wrapperStyles, contentStyles, theme }: RendererProps): React.ReactElement => {
  return <HeroComponent block={block} wrapperStyles={wrapperStyles} contentStyles={contentStyles} theme={theme} />
}

export const renderFeaturesGrid = ({ block, wrapperStyles, contentStyles, theme }: RendererProps): React.ReactElement => {
  if (!block) {
    return <div className="p-4 text-red-600">Erreur : Bloc non défini</div>
  }
  const safeBlock = { ...block, data: block.data || {} }
  const features = safeBlock.data.features || []
  const columns = safeBlock.data.columns || 3
  const isDark = theme === 'dark'
  // Déterminer les classes de grille en fonction du nombre de colonnes avec responsive amélioré
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  
  return (
    <div 
      style={{
        ...(wrapperStyles || {}),
        backgroundColor: isDark ? '#111827' : (block.styles?.background_color || 'transparent'),
        // En mode clair, utiliser un fond transparent pour laisser voir le dégradé des cartes
        color: isDark ? '#f9fafb' : '#111827'
      }} 
      className="mb-6 w-full min-w-0 overflow-hidden"
    >
      {safeBlock.data.title && (
        <h2 
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 px-4"
          style={{ color: isDark ? '#f9fafb' : '#111827' }}
        >
          {safeBlock.data.title}
        </h2>
      )}
      <div className={`grid ${gridClasses} gap-4 sm:gap-6 lg:gap-8 w-full min-w-0`}>
        {features.length > 0 ? (
          features.map((feature: any, i: number) => {
            // Style sympa avec gradient et ombre comme le Hero
            // En mode clair, utiliser un dégradé similaire au Hero (bleu-violet-rose)
            const cardStyle: React.CSSProperties = {
              background: isDark 
                ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 50%, rgba(236, 72, 153, 0.05) 100%)',
              borderColor: isDark ? '#374151' : 'rgba(59, 130, 246, 0.2)',
              borderWidth: '1px',
              borderStyle: 'solid',
              boxShadow: isDark 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
                : '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(147, 51, 234, 0.08)',
              transition: 'all 0.3s ease',
            }
            
            return (
              <div 
                key={i} 
                className="text-center p-4 sm:p-6 rounded-xl hover:shadow-xl hover:scale-105 transition-all min-w-0 overflow-hidden relative group"
                style={cardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = isDark
                    ? '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
                    : '0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(147, 51, 234, 0.15)'
                  // Renforcer le gradient au survol en mode clair
                  if (!isDark) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)'
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = cardStyle.boxShadow as string
                  e.currentTarget.style.background = cardStyle.background as string
                  e.currentTarget.style.borderColor = cardStyle.borderColor as string
                }}
              >
                {/* Effet de brillance au survol - Dégradé similaire au Hero */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity rounded-xl"
                  style={{
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)'
                      : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 50%, rgba(236, 72, 153, 0.15) 100%)'
                  }}
                />
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 relative z-10 transform group-hover:scale-110 transition-transform">
                  {feature.icon || '✨'}
                </div>
                <h3 
                  className="text-lg sm:text-xl font-bold mb-2 break-words relative z-10"
                  style={{ color: isDark ? '#f9fafb' : '#111827' }}
                >
                  {feature.title || `Fonctionnalité ${i + 1}`}
                </h3>
                <p 
                  className="text-sm sm:text-base break-words relative z-10"
                  style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
                >
                  {feature.description || 'Description...'}
                </p>
              </div>
            )
          })
        ) : (
          <div 
            className="col-span-full text-center py-8 border-2 border-dashed rounded"
            style={{
              color: isDark ? '#9ca3af' : '#9ca3af',
              borderColor: isDark ? '#4b5563' : '#d1d5db'
            }}
          >
            No features
          </div>
        )}
      </div>
    </div>
  )
}

// Réexporter les renderers depuis les fichiers individuels
export { renderCTASection } from './cta-section'
export { renderContactForm } from './contact-form'

