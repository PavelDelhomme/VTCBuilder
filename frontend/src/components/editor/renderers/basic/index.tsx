/**
 * Renderers pour les blocs de base (heading, text, image, button, etc.)
 */

import React from 'react'
import { RendererProps } from '../types'

export const renderHeading = ({ block, contentStyles, theme }: RendererProps): React.ReactElement => {
  const headingLevel = block.data.level || 'h2'
  const HeadingTag = headingLevel === 'h1' ? 'h1' :
                    headingLevel === 'h2' ? 'h2' :
                    headingLevel === 'h3' ? 'h3' :
                    headingLevel === 'h4' ? 'h4' : 'h2'
  const headingAlign = block.data.align || contentStyles.textAlign || 'left'
  return (
    <div className="mb-6" style={{ textAlign: headingAlign }}>
      {HeadingTag === 'h1' && <h1 className="font-bold inline-block" style={{
        ...contentStyles,
        fontSize: block.styles?.font_size || '2rem',
        fontWeight: block.styles?.font_weight || 'bold',
        marginBottom: block.styles?.margin_bottom || '1rem',
        color: theme === 'dark' ? undefined : (block.data.color || contentStyles.color || undefined)
      }}>
        {block.data.text || 'Title'}
      </h1>}
      {HeadingTag === 'h2' && (
        <h2 className="font-bold inline-block" style={{
          ...contentStyles,
          fontSize: block.styles?.font_size || '2rem',
          fontWeight: block.styles?.font_weight || 'bold',
          marginBottom: block.styles?.margin_bottom || '1rem',
          color: theme === 'dark' ? undefined : (block.data.color || contentStyles.color || undefined)
        }}>
          {block.data.text || 'Title'}
        </h2>
      )}
      {HeadingTag === 'h3' && (
        <h3 className="font-bold inline-block" style={{
          ...contentStyles,
          fontSize: block.styles?.font_size || '2rem',
          fontWeight: block.styles?.font_weight || 'bold',
          marginBottom: block.styles?.margin_bottom || '1rem',
          color: theme === 'dark' ? undefined : (block.data.color || contentStyles.color || undefined)
        }}>
          {block.data.text || 'Title'}
        </h3>
      )}
      {HeadingTag === 'h4' && (
        <h4 className="font-bold inline-block" style={{
          ...contentStyles,
          fontSize: block.styles?.font_size || '2rem',
          fontWeight: block.styles?.font_weight || 'bold',
          marginBottom: block.styles?.margin_bottom || '1rem',
          color: theme === 'dark' ? undefined : (block.data.color || contentStyles.color || undefined)
        }}>
          {block.data.text || 'Title'}
        </h4>
      )}
    </div>
  )
}

// Fonction pour convertir le markdown basique en HTML
function markdownToHtml(markdown: string): string {
  if (!markdown) return ''
  
  let html = markdown
  
  // Convertir les liens markdown [texte](url) en <a href="url">texte</a>
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>')
  
  // Convertir le gras **texte** en <strong>texte</strong>
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  
  // Convertir l'italique *texte* en <em>texte</em>
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  
  // Convertir les sauts de ligne en <br />
  html = html.replace(/\n/g, '<br />')
  
  return html
}

export const renderText = ({ block, contentStyles, theme }: RendererProps): React.ReactElement => {
  const isDark = theme === 'dark'
  const content = block.data.content || ''
  const isEmpty = !content.trim()
  const displayContent = isEmpty ? 'Entrez votre texte' : markdownToHtml(content)
  
  return (
    <div className="mb-6 prose max-w-none" style={{ 
      textAlign: contentStyles.textAlign,
      color: isDark ? '#d1d5db' : undefined
    }}>
      <div 
        dangerouslySetInnerHTML={{ 
          __html: displayContent
        }}
        style={{
          ...contentStyles,
          fontSize: block.styles?.font_size || '1rem',
          lineHeight: block.styles?.line_height || '1.6',
          color: isEmpty 
            ? (isDark ? '#6b7280' : '#9ca3af') 
            : (isDark ? '#d1d5db' : (contentStyles.color || '#111827')),
          fontStyle: isEmpty ? 'italic' : 'normal',
        }}
      />
    </div>
  )
}

export const renderImage = ({ block, contentStyles, theme, wrapperStyles }: RendererProps): React.ReactElement => {
  const isDark = theme === 'dark'
  if (!block.data.url && !block.data.src) {
    return (
      <div 
        className="mb-6 p-8 border-2 border-dashed rounded text-center"
        style={{
          borderColor: isDark ? '#4b5563' : '#d1d5db',
          color: isDark ? '#9ca3af' : '#9ca3af'
        }}
      >
        Image not configured
      </div>
    )
  }
  const imageUrl = block.data.url || block.data.src
  const imageAlign = block.data.align || contentStyles.textAlign || 'center'
  return (
    <div className="mb-6">
      <div style={{ textAlign: imageAlign }}>
        <img
          src={imageUrl}
          alt={block.data.alt || ''}
          className="rounded-lg shadow-md"
          loading="lazy"
          decoding="async"
          style={{
            width: block.data.width ? `${block.data.width}%` : '100%',
            maxWidth: '100%',
            height: 'auto',
            display: 'inline-block',
          }}
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage not available%3C/text%3E%3C/svg%3E'
          }}
        />
      </div>
      {block.data.caption && (
        <p 
          className="text-sm italic mt-2 text-center"
          style={{ color: theme === 'dark' ? '#9ca3af' : '#4b5563' }}
        >
          {block.data.caption}
        </p>
      )}
    </div>
  )
}

export const renderButton = ({ block, contentStyles, theme }: RendererProps): React.ReactElement => {
  const buttonSizeClass = block.data.size === 'xs' ? 'px-2 py-1 text-xs' :
                          block.data.size === 'sm' ? 'px-3 py-1.5 text-sm' :
                          block.data.size === 'lg' ? 'px-8 py-4 text-lg' :
                          block.data.size === 'xl' ? 'px-10 py-5 text-xl' :
                          'px-6 py-3'
  
  const buttonStyleClass = block.data.style === 'primary' 
    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
    : block.data.style === 'secondary'
    ? 'bg-gray-600 hover:bg-gray-700 text-white'
    : block.data.style === 'ghost'
    ? `bg-transparent ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`
    : block.data.style === 'link'
    ? 'bg-transparent text-blue-600 hover:underline'
    : `border-2 border-blue-600 text-blue-600 ${theme === 'dark' ? 'hover:bg-blue-900' : 'hover:bg-blue-50'}`
  
  const buttonAlign = block.data.align || contentStyles.textAlign || 'left'
  
  return (
    <div className="mb-6" style={{ textAlign: buttonAlign }}>
      <a
        href={block.data.url || '#'}
        className={`${block.data.full_width ? 'w-full block text-center' : 'inline-block'} ${buttonSizeClass} rounded-lg font-medium transition-colors ${buttonStyleClass}`}
        style={{
          ...contentStyles,
          ...(block.styles?.padding && !block.styles?.padding_top && !block.styles?.padding_bottom && !block.styles?.padding_left && !block.styles?.padding_right
            ? { padding: block.styles.padding }
            : {}),
          borderRadius: contentStyles.borderRadius || block.styles?.border_radius || '0.5rem',
          backgroundColor: block.data.bg_color || contentStyles.backgroundColor || undefined,
          color: theme === 'dark' ? undefined : (block.data.text_color || contentStyles.color || undefined),
        }}
      >
        {block.data.text || 'Bouton'}
      </a>
    </div>
  )
}

