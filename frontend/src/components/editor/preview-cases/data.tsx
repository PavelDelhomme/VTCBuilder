import React from 'react'
import { PreviewCaseProps } from './types'

// Blocs de données : table, chart, card, card-grid, icon-box, feature-card, team-member, badges

export function renderTable(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const tableRows = block.data.rows || 3
  const tableCols = block.data.columns || 3
  const tableData = block.data.table_data || Array(tableRows).fill(null).map(() => Array(tableCols).fill(''))
  const hasHeader = block.data.has_header || false
  const bordered = block.data.bordered !== false
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6 overflow-x-auto">
      <table 
        className="w-full"
        style={{
          border: bordered ? `1px solid ${isDark ? '#4b5563' : '#d1d5db'}` : undefined
        }}
      >
        {hasHeader && tableData.length > 0 && (
          <thead>
            <tr style={{ backgroundColor: isDark ? '#1f2937' : '#f3f4f6' }}>
              {tableData[0].map((cell: string, colIndex: number) => (
                <th 
                  key={colIndex} 
                  className={`px-4 py-2 text-left font-semibold ${bordered ? 'border' : ''}`}
                  style={{
                    color: isDark ? '#f3f4f6' : '#111827',
                    borderColor: bordered ? (isDark ? '#4b5563' : '#d1d5db') : undefined
                  }}
                >
                  {cell || `En-tête ${colIndex + 1}`}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {(hasHeader ? tableData.slice(1) : tableData).map((row: string[], rowIndex: number) => (
            <tr 
              key={rowIndex}
              style={{
                backgroundColor: 'transparent',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? '#1f2937' : '#f9fafb'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {row.map((cell: string, colIndex: number) => (
                <td 
                  key={colIndex} 
                  className={`px-4 py-2 ${bordered ? 'border' : ''}`}
                  style={{
                    color: isDark ? '#d1d5db' : '#374151',
                    borderColor: bordered ? (isDark ? '#4b5563' : '#d1d5db') : undefined
                  }}
                >
                  {cell || `Cellule ${rowIndex + 1},${colIndex + 1}`}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function renderChart(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data.title && (
        <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
          {block.data.title}
        </h3>
      )}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6`}>
        <div className={`h-64 flex items-center justify-center ${isDark ? 'text-gray-400' : 'text-gray-400'} border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'} rounded`}>
          Graphique {block.data.chart_type || 'line'} - Prévisualisation (nécessite Chart.js)
        </div>
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-2`}>Type: {block.data.chart_type || 'line'}</p>
      </div>
    </div>
  )
}

export function renderCard(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const cards = block.data.cards || []
  const cardColumns = block.data.columns || 3
  const gridColsClass = cardColumns === 1 ? 'md:grid-cols-1' : cardColumns === 2 ? 'md:grid-cols-2' : cardColumns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      <div className={`grid grid-cols-1 ${gridColsClass} gap-6`}>
        {cards.length > 0 ? (
          cards.map((card: any, index: number) => (
            <div key={index} className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              {card.image && (
                <img
                  src={card.image}
                  alt={card.title || `Card ${index + 1}`}
                  className="w-full h-48 object-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage%3C/text%3E%3C/svg%3E'
                  }}
                />
              )}
              <div className="p-4">
                {card.title && (
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                    {card.title}
                  </h3>
                )}
                {card.description && (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                    {card.description}
                  </p>
                )}
                {card.link && (
                  <a
                    href={card.link}
                    className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
                  >
                    En savoir plus →
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className={`col-span-full text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-400'} border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'} rounded`}>
            No cards
          </div>
        )}
      </div>
    </div>
  )
}

export function renderCardGrid(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const gridCards = block.data?.cards || []
  const gridColumns = block.data?.columns || 3
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data?.title && <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-4`}>{block.data.title}</h3>}
      <div className={`grid grid-cols-1 md:grid-cols-${gridColumns} gap-4`}>
        {gridCards.map((card: any, index: number) => (
          <div key={index} className={`border ${isDark ? 'border-gray-700' : 'border-gray-200'} rounded-lg overflow-hidden`}>
            {card.image && (
              <img src={card.image} alt={card.title || ''} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              {card.title && <h4 className={`font-semibold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{card.title}</h4>}
              {card.description && <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{card.description}</p>}
              {card.link && (
                <a href={card.link} className={`${isDark ? 'text-blue-400' : 'text-blue-600'} text-sm hover:underline mt-2 inline-block`}>
                  En savoir plus →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      {gridCards.length === 0 && (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>No cards</div>
      )}
    </div>
  )
}

export function renderIconBox(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles, contentStyles } = props
  const isDark = theme === 'dark'
  return (
    <div style={wrapperStyles} className="mb-6">
      <div 
        className={`p-6 rounded-lg border-2 ${block.data.border_color || (isDark ? 'border-gray-700' : 'border-gray-200')} ${isDark ? 'bg-gray-800' : 'bg-white'} text-center`}
        style={contentStyles}
      >
        {block.data.icon && (
          <div className="text-5xl mb-4">{block.data.icon}</div>
        )}
        {block.data.title && (
          <h3 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
            {block.data.title}
          </h3>
        )}
        {block.data.description && (
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {block.data.description}
          </p>
        )}
      </div>
    </div>
  )
}

export function renderFeatureCard(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles, contentStyles } = props
  const isDark = theme === 'dark'
  return (
    <div style={wrapperStyles} className="mb-6">
      <div 
        className={`text-center p-6 rounded-lg hover:shadow-lg transition-shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}
        style={contentStyles}
      >
        {block.data.icon && (
          <div className="text-5xl mb-4">{block.data.icon}</div>
        )}
        {block.data.title && (
          <h3 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
            {block.data.title}
          </h3>
        )}
        {block.data.description && (
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {block.data.description}
          </p>
        )}
        {block.data.link_url && block.data.link_text && (
          <a 
            href={block.data.link_url}
            className={`${isDark ? 'text-blue-400' : 'text-blue-600'} hover:underline font-medium mt-4 inline-block`}
          >
            {block.data.link_text} →
          </a>
        )}
      </div>
    </div>
  )
}

export function renderTeamMember(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles, contentStyles } = props
  const isDark = theme === 'dark'
  return (
    <div style={wrapperStyles} className="mb-6">
      <div 
        className={`text-center p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
        style={contentStyles}
      >
        {block.data.avatar && (
          <img
            src={block.data.avatar}
            alt={block.data.name || 'Membre'}
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96"%3E%3Crect fill="%23ddd" width="96" height="96" rx="48"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="32" dy="33" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E?%3C/text%3E%3C/svg%3E'
            }}
          />
        )}
        {block.data.name && (
          <h3 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-1`}>
            {block.data.name}
          </h3>
        )}
        {block.data.role && (
          <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'} mb-2`}>
            {block.data.role}
          </p>
        )}
        {block.data.bio && (
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            {block.data.bio}
          </p>
        )}
        {block.data.social_links && Array.isArray(block.data.social_links) && block.data.social_links.length > 0 && (
          <div className="flex justify-center gap-3">
            {block.data.social_links.map((link: any, i: number) => (
              <a
                key={i}
                href={link.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}
              >
                {link.icon || '🔗'}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// badges utilise renderBadges depuis './renderers/data'
const renderBadges: ((props: PreviewCaseProps) => React.ReactElement | null) | null = null
// Import dynamique désactivé pour éviter les erreurs
// try {
//   const dataRenderers = await import('./renderers/data').catch(() => null)
//   if (dataRenderers) {
//     renderBadges = dataRenderers.renderBadges || null
//   }
// } catch (e) {
//   // renderer n'existe pas encore
// }

export function renderBadgesBase(props: PreviewCaseProps): React.ReactElement | null {
  if (renderBadges) {
    return renderBadges(props)
  }
  return (
    <div style={props.wrapperStyles} className="mb-6 p-6 border-2 border-dashed rounded">
      <p className="text-gray-500">Badges renderer not available</p>
    </div>
  )
}

// Export map
export const dataCases: Record<string, (props: PreviewCaseProps) => React.ReactElement | null> = {
  'table': renderTable,
  'chart': renderChart,
  'card': renderCard,
  'card-grid': renderCardGrid,
  'icon-box': renderIconBox,
  'feature-card': renderFeatureCard,
  'team-member': renderTeamMember,
  'badges': renderBadgesBase,
}

