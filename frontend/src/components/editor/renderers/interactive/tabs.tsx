/**
 * Renderer pour le bloc tabs
 */

import React from 'react'
import { RendererProps } from '../types'

export const renderTabs = ({ block, wrapperStyles }: RendererProps): React.ReactElement => {
  const tabs = block.data.tabs || []
  return (
    <div style={wrapperStyles} className="mb-6">
      {tabs.length > 0 ? (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            {tabs.map((tab: any, i: number) => (
              <button
                key={i}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  i === 0
                    ? 'bg-white dark:bg-gray-900 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                disabled
              >
                {tab.title || `Onglet ${i + 1}`}
              </button>
            ))}
          </div>
          <div className="p-4 bg-white dark:bg-gray-900">
            {tabs[0]?.content || 'Contenu de l\'onglet...'}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
          No tabs
        </div>
      )}
    </div>
  )
}

