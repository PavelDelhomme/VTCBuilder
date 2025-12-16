/**
 * Renderer pour le bloc accordion
 */

import React from 'react'
import { RendererProps } from '../types'

export const renderAccordion = ({ block, wrapperStyles }: RendererProps): React.ReactElement => {
  const items = block.data.items || []
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data.title && (
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-6">
          {block.data.title}
        </h2>
      )}
      <div className="space-y-2">
        {items.length > 0 ? (
          items.map((item: any, i: number) => (
            <details
              key={i}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <summary className="p-4 cursor-pointer font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                {item.title || `Élément ${i + 1}`}
              </summary>
              <div className="p-4 pt-0 text-gray-700 dark:text-gray-300">
                {item.content || 'Contenu...'}
              </div>
            </details>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
            No accordion items
          </div>
        )}
      </div>
    </div>
  )
}

