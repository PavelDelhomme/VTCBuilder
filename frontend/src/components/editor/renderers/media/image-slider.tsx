/**
 * Renderer pour le bloc image-slider
 */

import React from 'react'
import { RendererProps } from '../types'

export const renderImageSlider = ({ block, wrapperStyles }: RendererProps): React.ReactElement => {
  const sliderImages = block.data?.images || []
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data?.title && <h3 className="text-lg font-semibold mb-3">{block.data.title}</h3>}
      <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800" style={{ height: '400px' }}>
        {sliderImages.length > 0 ? (
          <div className="flex h-full">
            {sliderImages.slice(0, 1).map((img: any, index: number) => (
              <img key={index} src={img.url || ''} alt={img.alt || ''} className="w-full h-full object-cover" />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">No image</div>
        )}
      </div>
    </div>
  )
}

