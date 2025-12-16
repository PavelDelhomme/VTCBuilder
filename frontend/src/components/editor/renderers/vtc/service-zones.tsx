/**
 * Renderer pour le bloc service-zones (zones de service VTC)
 */

import React from 'react'
import { RendererProps } from '../types'

export const renderServiceZones = ({ block, wrapperStyles }: RendererProps): React.ReactElement => {
  const zones = block.data.zones || []
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data.title && (
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
          {block.data.title}
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.length > 0 ? (
          zones.map((zone: any, index: number) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
              {zone.icon && (
                <div className="text-4xl mb-3">{zone.icon}</div>
              )}
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {zone.name || 'Zone'}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {zone.description || 'Description de la zone'}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
            No zone configured
          </div>
        )}
      </div>
    </div>
  )
}

