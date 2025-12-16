/**
 * Renderer pour le bloc lightbox
 */

import React from 'react'
import { RendererProps } from '../types'

export const renderLightbox = ({ block, wrapperStyles }: RendererProps): React.ReactElement => {
  const lightboxImages = block.data?.images || []
  return (
    <div style={wrapperStyles} className="mb-6">
      <div className="grid grid-cols-3 gap-2">
        {lightboxImages.slice(0, 6).map((img: any, index: number) => (
          <div key={index} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
            {img.thumbnail || img.url ? (
              <img src={img.thumbnail || img.url || ''} alt={img.alt || ''} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Image {index + 1}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

