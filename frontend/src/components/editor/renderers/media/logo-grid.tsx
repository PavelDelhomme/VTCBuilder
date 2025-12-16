/**
 * Renderer pour le bloc logo-grid
 */

import React from 'react'
import { RendererProps } from '../types'

export const renderLogoGrid = ({ block, wrapperStyles }: RendererProps): React.ReactElement => {
  const logos = block.data.logos || []
  const logoColumns = block.data.columns || 4
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data.title && (
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-6">
          {block.data.title}
        </h2>
      )}
      <div 
        className="grid gap-6 items-center justify-items-center"
        style={{
          gridTemplateColumns: `repeat(${logoColumns}, 1fr)`,
        }}
      >
        {logos.length > 0 ? (
          logos.map((logo: any, i: number) => (
            <div key={i} className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
              {logo.url ? (
                <img
                  src={logo.url}
                  alt={logo.alt || `Logo ${i + 1}`}
                  className="max-h-12 max-w-full object-contain"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="60"%3E%3Crect fill="%23ddd" width="120" height="60"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="12" dy="20" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ELogo%3C/text%3E%3C/svg%3E'
                  }}
                />
              ) : (
                <div className="w-24 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400 text-xs">
                  Logo
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
            No logo configured
          </div>
        )}
      </div>
    </div>
  )
}

