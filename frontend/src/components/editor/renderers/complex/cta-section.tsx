/**
 * Renderer pour le bloc cta-section (Call To Action)
 */

import React from 'react'
import { RendererProps } from '../types'

export const renderCTASection = ({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles }: RendererProps): React.ReactElement => {
  // Fonction pour convertir le gradient Tailwind en CSS
  const getGradientFromTailwindCTA = (gradient: string) => {
    if (!gradient) return 'linear-gradient(to right, #2563eb, #9333ea)'
    
    const fromMatch = gradient.match(/from-(\w+)-(\d+)/)
    const viaMatch = gradient.match(/via-(\w+)-(\d+)/)
    const toMatch = gradient.match(/to-(\w+)-(\d+)/)
    
    const colorMap: Record<string, Record<string, string>> = {
      blue: { '600': '#2563eb', '500': '#3b82f6' },
      purple: { '600': '#9333ea', '500': '#a855f7' },
      pink: { '500': '#ec4899', '600': '#db2777' },
    }
    
    const fromColor = fromMatch ? (colorMap[fromMatch[1]]?.[fromMatch[2]] || '#2563eb') : '#2563eb'
    const viaColor = viaMatch ? (colorMap[viaMatch[1]]?.[viaMatch[2]] || '#9333ea') : null
    const toColor = toMatch ? (colorMap[toMatch[1]]?.[toMatch[2]] || '#9333ea') : '#9333ea'
    
    if (viaColor) {
      return `linear-gradient(to right, ${fromColor} 0%, ${viaColor} 50%, ${toColor} 100%)`
    }
    return `linear-gradient(to right, ${fromColor} 0%, ${toColor} 100%)`
  }
  
  // Déterminer le style d'arrière-plan
  const ctaPreviewBackgroundType = block.data?.background_type || 'gradient'
  let backgroundStyle: React.CSSProperties = {}
  
  if (ctaPreviewBackgroundType === 'image' && block.data?.background_image) {
    backgroundStyle = {
      backgroundImage: block.data.background_overlay 
        ? `url(${block.data.background_image}), ${block.data.background_overlay}`
        : `url(${block.data.background_image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
    if (block.data.background_image_opacity !== undefined) {
      backgroundStyle.opacity = block.data.background_image_opacity
    }
  } else if (ctaPreviewBackgroundType === 'solid') {
    backgroundStyle.backgroundColor = block.data?.background_color || '#2563eb'
  } else {
    // Gradient par défaut - convertir depuis Tailwind si nécessaire
    const gradientValue = block.data?.background_gradient
    if (gradientValue && (gradientValue.includes('from-') || gradientValue.includes('to-'))) {
      backgroundStyle.background = getGradientFromTailwindCTA(gradientValue)
    } else {
      backgroundStyle.background = gradientValue || 'linear-gradient(to right, #2563eb, #9333ea)'
    }
  }

  // Utiliser button_link ou button_url (compatibilité)
  const buttonUrl = block.data?.button_url || block.data?.button_link
  const buttonText = block.data?.button_text

  return (
    <div
      style={{
        // Copier contentStyles sans les propriétés de padding pour éviter les conflits
        ...Object.fromEntries(
          Object.entries(contentStyles).filter(([key]) => 
            !['padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'].includes(key)
          )
        ),
        ...backgroundStyle,
        // Ne pas utiliser padding shorthand si on a des propriétés individuelles
        ...(block.styles?.padding && !block.styles?.padding_top && !block.styles?.padding_bottom && !block.styles?.padding_left && !block.styles?.padding_right
          ? { padding: block.styles.padding }
          : {
              paddingTop: block.styles?.padding_top || block.styles?.padding_vertical || '8rem',
              paddingRight: block.styles?.padding_right || block.styles?.padding_horizontal || '2rem',
              paddingBottom: block.styles?.padding_bottom || block.styles?.padding_vertical || '8rem',
              paddingLeft: block.styles?.padding_left || block.styles?.padding_horizontal || '2rem',
            }),
      }}
      className="mb-6 rounded-lg"
    >
      <div className="max-w-4xl mx-auto text-center">
        {block.data.title && (
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            {block.data.title}
          </h2>
        )}
        {(block.data.description || block.data.subtitle) && (
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
            {block.data.description || block.data.subtitle}
          </p>
        )}
        {buttonText && buttonUrl && (
          <a
            href={buttonUrl}
            className={`inline-block px-10 py-4 sm:px-12 sm:py-5 rounded-lg font-bold text-lg sm:text-xl transition-all shadow-xl hover:scale-105 ${
              block.data.button_style === 'dark'
                ? 'bg-white text-gray-900 hover:bg-gray-100'
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
          >
            {buttonText}
          </a>
        )}
      </div>
    </div>
  )
}

