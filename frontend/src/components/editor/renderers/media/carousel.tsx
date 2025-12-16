/**
 * Renderer pour le bloc carousel
 */

import React from 'react'
import { RendererProps } from '../types'

export const renderCarousel = ({ block, wrapperStyles }: RendererProps): React.ReactElement => {
  const carouselItems = block.data.items || []
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data.title && (
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-6">
          {block.data.title}
        </h2>
      )}
      <div className="overflow-x-auto">
        <div className="flex gap-4">
          {carouselItems.length > 0 ? (
            carouselItems.map((item: any, index: number) => (
              <div key={index} className="flex-shrink-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage%3C/text%3E%3C/svg%3E'
                    }}
                  />
                )}
                <div className="p-4">
                  {item.title && (
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {item.title}
                    </h3>
                  )}
                  {item.description && (
                    <p className="text-gray-700 dark:text-gray-300">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded w-full">
              No carousel items
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

