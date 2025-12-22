import React from 'react'
import { PreviewCaseProps } from './types'

// Blocs divers : counter, pagination, search-bar

export function renderCounter(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  return (
    <div style={wrapperStyles} className="mb-6 text-center">
      <div className={`text-4xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
        {block.data?.prefix || ''}{block.data?.value || 0}{block.data?.suffix || ''}
      </div>
      {block.data?.label && (
        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>{block.data.label}</div>
      )}
    </div>
  )
}

export function renderPagination(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const currentPage = block.data.current_page || 1
  const totalPages = block.data.total_pages || 10
  const showArrows = block.data.show_arrows !== false
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      <nav className="flex items-center justify-center gap-2">
        {showArrows && (
          <button className={`px-3 py-2 border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'} rounded-lg disabled:opacity-50`} disabled={currentPage === 1}>
            ‹
          </button>
        )}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum
          if (totalPages <= 5) {
            pageNum = i + 1
          } else if (currentPage <= 3) {
            pageNum = i + 1
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i
          } else {
            pageNum = currentPage - 2 + i
          }
          const isActive = pageNum === currentPage
          return (
            <button
              key={i}
              className={`px-3 py-2 rounded-lg ${
                isActive
                  ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                  : isDark ? 'border border-gray-600 hover:bg-gray-700' : 'border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {pageNum}
            </button>
          )
        })}
        {showArrows && (
          <button className={`px-3 py-2 border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'} rounded-lg disabled:opacity-50`} disabled={currentPage === totalPages}>
            ›
          </button>
        )}
      </nav>
    </div>
  )
}

export function renderSearchBar(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  return (
    <div style={wrapperStyles} className="mb-6">
      <form
        action={block.data.action || '#'}
        method="get"
        className="flex gap-2"
      >
        <input
          type="search"
          placeholder={block.data.placeholder || 'Rechercher...'}
          className={`flex-1 px-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
        />
        {block.data.show_button !== false && (
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Rechercher
          </button>
        )}
      </form>
    </div>
  )
}

// Export map
export const miscCases: Record<string, (props: PreviewCaseProps) => React.ReactElement | null> = {
  'counter': renderCounter,
  'pagination': renderPagination,
  'search-bar': renderSearchBar,
}

