import React from 'react'
import { PreviewCaseProps } from './types'

// Blocs de contenu : quote, rich-text, markdown, html-raw, icon, label, tooltip, popover, dropdown, 
// categories, author-box, related-posts, table-of-contents, reading-time, share-buttons, list, link, breadcrumb, tags

export function renderQuote(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles, contentStyles } = props
  const isDark = theme === 'dark'
  return (
    <div style={wrapperStyles} className="mb-6">
      <blockquote 
        className={`border-l-4 ${block.data.color || 'border-blue-500'} pl-6 py-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-r-lg`}
        style={contentStyles}
      >
        <p className={`text-lg italic ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>
          "{block.data.text || 'Citation...'}"
        </p>
        {block.data.author && (
          <footer className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            — {block.data.author}
          </footer>
        )}
      </blockquote>
    </div>
  )
}

export function renderRichText(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  return (
    <div style={wrapperStyles} className="mb-6" dangerouslySetInnerHTML={{ __html: block.data?.html || '' }} />
  )
}

export function renderMarkdown(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  // Note: Pour un vrai rendu Markdown, il faudrait une bibliothèque comme react-markdown
  return (
    <div style={wrapperStyles} className="mb-6 prose dark:prose-invert max-w-none">
      <pre className={`whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{block.data?.markdown || ''}</pre>
    </div>
  )
}

export function renderHtmlRaw(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  return (
    <div style={wrapperStyles} className="mb-6" dangerouslySetInnerHTML={{ __html: block.data?.html || '' }} />
  )
}

export function renderIcon(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const iconSize = block.data?.size === 'sm' ? 'text-2xl' : block.data?.size === 'lg' ? 'text-5xl' : block.data?.size === 'xl' ? 'text-6xl' : 'text-4xl'
  return (
    <div style={wrapperStyles} className="mb-6 flex items-center justify-center">
      <span className={iconSize} style={{ color: block.data?.color || undefined }}>
        {block.data?.icon || '⭐'}
      </span>
    </div>
  )
}

export function renderLabel(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  return (
    <div style={wrapperStyles} className="mb-6">
      <label htmlFor={block.data?.for || undefined} className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {block.data?.text || 'Label'}
      </label>
    </div>
  )
}

export function renderTooltip(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  return (
    <div style={wrapperStyles} className="mb-6">
      <span
        className={`${isDark ? 'text-blue-400' : 'text-blue-600'} underline cursor-help`}
        title={block.data?.tooltip || ''}
      >
        {block.data?.text || 'Survolez-moi'}
      </span>
    </div>
  )
}

export function renderPopover(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  return (
    <div style={wrapperStyles} className="mb-6">
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        {block.data?.trigger || 'Cliquez ici'}
      </button>
      {/* Note: Le popover nécessiterait une bibliothèque comme Radix UI pour un vrai rendu */}
    </div>
  )
}

export function renderDropdown(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  return (
    <div style={wrapperStyles} className="mb-6">
      <select className={`px-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}`}>
        {(block.data?.items || []).map((item: any, index: number) => (
          <option key={index} value={item.value}>{item.label}</option>
        ))}
      </select>
    </div>
  )
}

export function renderCategories(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data?.title && <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{block.data.title}</h3>}
      <div className="flex flex-wrap gap-2">
        {(block.data?.categories || []).map((cat: any, index: number) => (
          <a key={index} href={`/category/${cat.slug}`} className={`px-3 py-1 ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} rounded-full text-sm`}>
            {cat.name}
          </a>
        ))}
      </div>
    </div>
  )
}

export function renderAuthorBox(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  return (
    <div style={wrapperStyles} className={`mb-6 p-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center gap-4">
        {block.data?.avatar && (
          <img src={block.data.avatar} alt={block.data?.name || ''} className="w-16 h-16 rounded-full" />
        )}
        <div>
          {block.data?.name && <h4 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{block.data.name}</h4>}
          {block.data?.bio && <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>{block.data.bio}</p>}
          {block.data?.url && (
            <a href={block.data.url} className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline mt-2 inline-block`}>
              Voir le profil →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export function renderRelatedPosts(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data?.title && <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{block.data.title}</h3>}
      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        💡 {block.data?.count || 3} articles liés seront chargés automatiquement
      </div>
    </div>
  )
}

export function renderTableOfContents(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  return (
    <div style={wrapperStyles} className={`mb-6 p-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <h3 className={`font-semibold mb-3 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{block.data?.title || 'Table des matières'}</h3>
      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        💡 Table of contents will be automatically generated from page titles
      </div>
    </div>
  )
}

export function renderReadingTime(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  return (
    <div style={wrapperStyles} className="mb-6">
      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {block.data?.prefix || 'Temps de lecture:'} <strong>5 min</strong>
      </span>
    </div>
  )
}

export function renderShareButtons(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data?.title && <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{block.data.title}</h3>}
      <div className="flex gap-2">
        {(block.data?.platforms || []).map((platform: string) => (
          <button key={platform} className={`px-3 py-1 ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} rounded text-sm capitalize`}>
            {platform}
          </button>
        ))}
      </div>
    </div>
  )
}

export function renderList(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const listItems = block.data.items || []
  const ListTag = block.data.list_type === 'ordered' ? 'ol' : 'ul'
  const listClass = block.data.list_type === 'none' ? 'list-none' : block.data.list_type === 'ordered' ? 'list-decimal' : 'list-disc'
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      {React.createElement(
        ListTag,
        { className: `${listClass} space-y-2 pl-6` },
        listItems.map((item: string, index: number) => (
          <li key={index} className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item}</li>
        ))
      )}
    </div>
  )
}

export function renderLink(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  return (
    <div style={wrapperStyles} className="mb-6">
      <a
        href={block.data.url || '#'}
        target={block.data.target || '_self'}
        rel={block.data.target === '_blank' ? 'noopener noreferrer' : undefined}
        className={isDark ? 'text-blue-400 hover:underline' : 'text-blue-600 hover:underline'}
      >
        {block.data.text || 'Lien'}
      </a>
    </div>
  )
}

export function renderBreadcrumb(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const breadcrumbItems = block.data.items || []
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      <nav className="flex items-center space-x-2 text-sm">
        {breadcrumbItems.map((item: any, index: number) => (
          <React.Fragment key={index}>
            {index > 0 && <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>/</span>}
            {index === breadcrumbItems.length - 1 ? (
              <span className={`${isDark ? 'text-gray-100' : 'text-gray-900'} font-medium`}>{item.label || `Item ${index + 1}`}</span>
            ) : (
              <a
                href={item.url || '#'}
                className={isDark ? 'text-gray-400 hover:text-gray-100' : 'text-gray-600 hover:text-gray-900'}
              >
                {item.label || `Item ${index + 1}`}
              </a>
            )}
          </React.Fragment>
        ))}
      </nav>
    </div>
  )
}

export function renderTags(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const tags = block.data.tags || []
  const tagStyle = block.data.style || 'rounded'
  const tagClass = tagStyle === 'square' ? 'rounded-none' : tagStyle === 'pill' ? 'rounded-full' : 'rounded'
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      <div className="flex flex-wrap gap-2">
        {tags.length > 0 ? (
          tags.map((tag: string, index: number) => (
            <span
              key={index}
              className={`px-3 py-1 ${isDark ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-100 text-blue-800'} text-sm font-medium ${tagClass}`}
            >
              {tag}
            </span>
          ))
        ) : (
          <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>No tag</span>
        )}
      </div>
    </div>
  )
}

// Export map
export const contentCases: Record<string, (props: PreviewCaseProps) => React.ReactElement | null> = {
  'quote': renderQuote,
  'rich-text': renderRichText,
  'markdown': renderMarkdown,
  'html-raw': renderHtmlRaw,
  'icon': renderIcon,
  'label': renderLabel,
  'tooltip': renderTooltip,
  'popover': renderPopover,
  'dropdown': renderDropdown,
  'categories': renderCategories,
  'author-box': renderAuthorBox,
  'related-posts': renderRelatedPosts,
  'table-of-contents': renderTableOfContents,
  'reading-time': renderReadingTime,
  'share-buttons': renderShareButtons,
  'list': renderList,
  'link': renderLink,
  'breadcrumb': renderBreadcrumb,
  'tags': renderTags,
}

