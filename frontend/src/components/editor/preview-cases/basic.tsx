import React from 'react'
import { PreviewCaseProps } from './types'

// Blocs de base : heading, text, image, button, video, spacer, divider, alert, code, paragraph, line

export function renderHeading(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', contentStyles } = props
  const headingLevel = block.data.level || 'h2'
  const HeadingTag = headingLevel === 'h1' ? 'h1' :
                    headingLevel === 'h2' ? 'h2' :
                    headingLevel === 'h3' ? 'h3' :
                    headingLevel === 'h4' ? 'h4' : 'h2'
  const headingAlign = block.styles?.text_align || block.data.align || contentStyles.textAlign || 'left'
  const headingColor = block.styles?.color || block.data.color || (theme === 'dark' ? undefined : contentStyles.color)
  
  return (
    <div className="mb-6" style={{ textAlign: headingAlign, width: '100%' }}>
      {HeadingTag === 'h1' && <h1 className="font-bold" style={{
        ...contentStyles,
        fontSize: block.styles?.font_size || '2rem',
        fontWeight: block.styles?.font_weight || 'bold',
        marginBottom: block.styles?.margin_bottom || '1rem',
        color: headingColor,
        textAlign: headingAlign,
        display: 'block',
        width: '100%'
      }}>
        {block.data.text || 'Title'}
      </h1>}
      {HeadingTag === 'h2' && (
        <h2 className="font-bold" style={{
          ...contentStyles,
          fontSize: block.styles?.font_size || '2rem',
          fontWeight: block.styles?.font_weight || 'bold',
          marginBottom: block.styles?.margin_bottom || '1rem',
          color: headingColor,
          textAlign: headingAlign,
          display: 'block',
          width: '100%'
        }}>
          {block.data.text || 'Title'}
        </h2>
      )}
      {HeadingTag === 'h3' && (
        <h3 className="font-bold" style={{
          ...contentStyles,
          fontSize: block.styles?.font_size || '2rem',
          fontWeight: block.styles?.font_weight || 'bold',
          marginBottom: block.styles?.margin_bottom || '1rem',
          color: headingColor,
          textAlign: headingAlign,
          display: 'block',
          width: '100%'
        }}>
          {block.data.text || 'Title'}
        </h3>
      )}
      {HeadingTag === 'h4' && (
        <h4 className="font-bold" style={{
          ...contentStyles,
          fontSize: block.styles?.font_size || '2rem',
          fontWeight: block.styles?.font_weight || 'bold',
          marginBottom: block.styles?.margin_bottom || '1rem',
          color: headingColor,
          textAlign: headingAlign,
          display: 'block',
          width: '100%'
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

export function renderText(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', contentStyles } = props
  const isDark = theme === 'dark'
  const textAlign = block.styles?.text_align || block.data.align || contentStyles.textAlign || 'left'
  const content = block.data.content || ''
  const isEmpty = !content.trim()
  const displayContent = isEmpty ? 'Entrez votre texte' : markdownToHtml(content)
  const textColor = isEmpty
    ? (isDark ? '#6b7280' : '#9ca3af')
    : (block.styles?.color || block.data.color || (isDark ? '#d1d5db' : (contentStyles.color || '#111827')))
  
  return (
    <div className="mb-6 prose max-w-none" style={{ 
      textAlign: textAlign,
      width: '100%',
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
          color: textColor,
          textAlign: textAlign,
          display: 'block',
          width: '100%',
          fontStyle: isEmpty ? 'italic' : 'normal',
        }}
      />
    </div>
  )
}

export function renderImage(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', contentStyles } = props
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
  const imageAlign = block.styles?.text_align || block.data.align || contentStyles.textAlign || 'center'
  
  return (
    <div className="mb-6" style={{ width: '100%' }}>
      <div style={{ textAlign: imageAlign, width: '100%' }}>
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

export function renderButton(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', contentStyles } = props
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
  
  const buttonAlign = block.styles?.text_align || block.data.align || contentStyles.textAlign || 'left'
  
  return (
    <div className="mb-6" style={{ textAlign: buttonAlign, width: '100%' }}>
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
          textAlign: buttonAlign,
        }}
      >
        {block.data.text || 'Bouton'}
      </a>
    </div>
  )
}

export function renderVideo(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  if (!block.data.url) {
    return (
      <div 
        style={{
          ...wrapperStyles,
          borderColor: isDark ? '#4b5563' : '#d1d5db',
          color: isDark ? '#9ca3af' : '#9ca3af'
        }} 
        className="mb-6 p-8 border-2 border-dashed rounded text-center"
      >
        Video not configured
      </div>
    )
  }
  const videoWidth = block.data.width || 100
  const videoHeight = block.data.height || 400
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data.title && (
        <h3 
          className="text-lg font-semibold mb-2"
          style={{ color: isDark ? '#f9fafb' : '#111827' }}
        >
          {block.data.title}
        </h3>
      )}
      <div 
        className="rounded-lg overflow-hidden mx-auto"
        style={{
          width: `${videoWidth}%`,
          height: `${videoHeight}px`,
          maxWidth: '100%',
          backgroundColor: isDark ? '#1f2937' : '#f3f4f6'
        }}
      >
        <iframe
          src={block.data.url}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}

export function renderSpacer(props: PreviewCaseProps): React.ReactElement | null {
  const { block, wrapperStyles, contentStyles } = props
  const spacerDirection = block.data.direction || 'vertical'
  if (spacerDirection === 'horizontal') {
    return (
      <div 
        style={{ 
          ...wrapperStyles,
          width: `${block.data.width || 40}px`,
          height: '1px',
          display: 'inline-block',
          verticalAlign: 'middle'
        }} 
        className="mb-6"
      />
    )
  }
  return (
    <div 
      style={{ 
        ...contentStyles,
        height: `${block.data.height || 40}px`,
        display: 'block'
      }} 
      className="mb-6"
    />
  )
}

export function renderDivider(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const dividerDirection = block.data.direction || 'horizontal'
  const dividerStyle = block.data.style === 'solid' ? 'solid' : 
                      block.data.style === 'dashed' ? 'dashed' : 
                      block.data.style === 'dotted' ? 'dotted' : 
                      block.data.style === 'double' ? 'double' : 'solid'
  
  if (dividerDirection === 'vertical') {
    const dividerHeight = block.data.height || 100
    return (
      <div style={wrapperStyles} className="mb-6 flex items-center justify-center">
        <div 
          className="border-l-2"
          style={{ 
            borderStyle: dividerStyle,
            height: `${dividerHeight}px`,
            margin: block.styles?.margin || '0 1rem',
            borderColor: theme === 'dark' ? '#4b5563' : '#9ca3af'
          }}
        />
      </div>
    )
  }
  
  const dividerWidth = block.data.width === 'full' ? '100%' : 
                      block.data.width === 'half' ? '50%' : 
                      block.data.width === 'third' ? '33%' : '100%'
  return (
    <div style={wrapperStyles} className="mb-6 flex justify-center">
      <div 
        style={{ 
          borderStyle: dividerStyle,
          borderColor: theme === 'dark' ? '#4b5563' : '#9ca3af',
          width: dividerWidth,
          margin: block.styles?.margin || '2rem 0'
        }}
      />
    </div>
  )
}

export function renderAlert(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const variant = block.data.variant || 'info'
  const variantStyles = {
    info: {
      bg: theme === 'dark' ? '#1e3a5f' : '#dbeafe',
      border: theme === 'dark' ? '#1e40af' : '#93c5fd',
      text: theme === 'dark' ? '#bfdbfe' : '#1e40af',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
    },
    success: {
      bg: theme === 'dark' ? '#1e3a2e' : '#d1fae5',
      border: theme === 'dark' ? '#166534' : '#6ee7b7',
      text: theme === 'dark' ? '#86efac' : '#166534',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    },
    warning: {
      bg: theme === 'dark' ? '#422006' : '#fef3c7',
      border: theme === 'dark' ? '#854d0e' : '#fde047',
      text: theme === 'dark' ? '#fde047' : '#854d0e',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
    },
    error: {
      bg: theme === 'dark' ? '#7f1d1d' : '#fee2e2',
      border: theme === 'dark' ? '#991b1b' : '#fca5a5',
      text: theme === 'dark' ? '#fca5a5' : '#991b1b',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
    },
  }
  const style = variantStyles[variant as keyof typeof variantStyles] || variantStyles.info
  
  return (
    <div style={wrapperStyles} className="mb-6">
      <div 
        className="border-l-4 rounded-lg p-4"
        style={{
          backgroundColor: style.bg as string,
          borderColor: style.border as string,
          color: style.text as string
        }}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {style.icon}
          </div>
          <div className="ml-3 flex-1">
            {block.data.title && (
              <h3 className="text-sm font-semibold mb-1">
                {block.data.title}
              </h3>
            )}
            {block.data.message ? (
              <p className="text-sm">{block.data.message}</p>
            ) : (
              <p className="text-sm italic opacity-75">No message configured</p>
            )}
          </div>
          {block.data.dismissible && (
            <div className="ml-4 flex-shrink-0">
              <button
                type="button"
                className={`inline-flex ${style.text} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent rounded-md`}
                aria-label="Fermer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function renderCode(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const code = block.data.code || ''
  const language = block.data.language || 'plaintext'
  const showLineNumbers = block.data.showLineNumbers || false
  const showCopyButton = block.data.showCopyButton !== false
  
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      const button = document.activeElement as HTMLElement
      if (button) {
        const originalText = button.textContent
        button.textContent = '✓ Copié!'
        button.classList.add('text-green-400')
        setTimeout(() => {
          button.textContent = originalText
          button.classList.remove('text-green-400')
        }, 2000)
      }
    } catch (err) {
      console.error('Error copying code:', err)
    }
  }
  
  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      python: 'Python',
      java: 'Java',
      cpp: 'C++',
      c: 'C',
      csharp: 'C#',
      php: 'PHP',
      ruby: 'Ruby',
      go: 'Go',
      rust: 'Rust',
      html: 'HTML',
      css: 'CSS',
      scss: 'SCSS',
      json: 'JSON',
      xml: 'XML',
      sql: 'SQL',
      bash: 'Bash',
      shell: 'Shell',
      yaml: 'YAML',
      markdown: 'Markdown',
      plaintext: 'Texte brut',
    }
    return labels[lang] || lang
  }
  
  const isDark = theme === 'dark'
  return (
    <div style={wrapperStyles} className="mb-6">
      <div 
        className="rounded-lg overflow-hidden border"
        style={{
          backgroundColor: isDark ? '#030712' : '#111827',
          borderColor: isDark ? '#1f2937' : '#374151',
        }}
      >
        <div 
          className="flex items-center justify-between px-4 py-2 border-b"
          style={{
            backgroundColor: isDark ? '#111827' : '#1f2937',
            borderColor: isDark ? '#1f2937' : '#374151',
          }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span 
              className="text-xs font-medium"
              style={{ color: isDark ? '#9ca3af' : '#d1d5db' }}
            >
              {getLanguageLabel(language)}
            </span>
          </div>
          {showCopyButton && code && (
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors rounded"
              style={{
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? '#1f2937' : '#374151'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              title="Copier le code"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copier
            </button>
          )}
        </div>
        
        <div className="relative">
          <pre className={`m-0 p-4 overflow-x-auto text-sm font-mono ${showLineNumbers ? 'pl-12' : ''}`}>
            {code ? (
              <code 
                className={showLineNumbers ? 'block' : ''}
                style={{ color: isDark ? '#e5e7eb' : '#f3f4f6' }}
              >
                {showLineNumbers ? (
                  code.split('\n').map((line: string, index: number) => (
                    <div key={index} className="flex">
                      <span 
                        className="inline-block w-8 text-right pr-4 select-none"
                        style={{ color: isDark ? '#4b5563' : '#6b7280' }}
                      >
                        {index + 1}
                      </span>
                      <span className="flex-1">{line || ' '}</span>
                    </div>
                  ))
                ) : (
                  code
                )}
              </code>
            ) : (
              <span 
                className="italic"
                style={{ color: isDark ? '#4b5563' : '#6b7280' }}
              >
                No code configured
              </span>
            )}
          </pre>
        </div>
      </div>
    </div>
  )
}

export function renderParagraph(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles, contentStyles } = props
  const isDark = theme === 'dark'
  const paragraphAlign = block.styles?.text_align || block.data.align || contentStyles.textAlign || 'left'
  const paragraphColor = block.styles?.color || block.data.color || (isDark ? '#d1d5db' : (contentStyles.color || '#374151'))
  return (
    <div style={{ ...wrapperStyles, width: '100%' }} className="mb-6">
      <p 
        className="text-base leading-relaxed whitespace-pre-wrap"
        style={{ 
          ...contentStyles,
          color: paragraphColor,
          textAlign: paragraphAlign,
          display: 'block',
          width: '100%'
        }}
      >
        {block.data.content || 'Empty paragraph'}
      </p>
    </div>
  )
}

export function renderLine(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles, contentStyles } = props
  const isDark = theme === 'dark'
  const lineAlign = block.styles?.text_align || block.data.align || contentStyles.textAlign || 'left'
  const lineColor = block.styles?.color || block.data.color || (isDark ? '#d1d5db' : (contentStyles.color || '#374151'))
  return (
    <div style={{ ...wrapperStyles, width: '100%' }} className="mb-6">
      <span 
        className="text-base"
        style={{ 
          ...contentStyles,
          color: lineColor,
          textAlign: lineAlign,
          display: 'block',
          width: '100%'
        }}
      >
        {block.data.content || 'Empty line'}
      </span>
    </div>
  )
}

// Export map pour faciliter l'utilisation
export const basicCases: Record<string, (props: PreviewCaseProps) => React.ReactElement | null> = {
  'heading': renderHeading,
  'text': renderText,
  'image': renderImage,
  'button': renderButton,
  'video': renderVideo,
  'spacer': renderSpacer,
  'divider': renderDivider,
  'alert': renderAlert,
  'code': renderCode,
  'paragraph': renderParagraph,
  'line': renderLine,
}

