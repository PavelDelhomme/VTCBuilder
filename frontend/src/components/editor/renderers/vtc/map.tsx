/**
 * Renderer pour le bloc map (carte Google Maps)
 */

import React from 'react'
import { RendererProps } from '../types'

export const renderMap = ({ block, wrapperStyles }: RendererProps): React.ReactElement => {
  const mapAddress = block.data.address || ''
  const mapHeight = block.data.height || 400
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data.title && (
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-6">
          {block.data.title}
        </h2>
      )}
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600" style={{ height: `${mapHeight}px` }}>
        {mapAddress ? (
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(mapAddress)}`}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p>Configurez une adresse pour afficher la carte</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

