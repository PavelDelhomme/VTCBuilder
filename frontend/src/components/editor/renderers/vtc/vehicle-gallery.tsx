/**
 * Renderer pour le bloc vehicle-gallery (galerie de véhicules VTC)
 */

import React from 'react'
import { RendererProps } from '../types'

export const renderVehicleGallery = ({ block, wrapperStyles }: RendererProps): React.ReactElement => {
  const vehicles = block.data.vehicles || []
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data.title && (
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
          {block.data.title}
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.length > 0 ? (
          vehicles.map((vehicle: any, index: number) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              {vehicle.image ? (
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-48 object-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EVehicle%3C/text%3E%3C/svg%3E'
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {vehicle.name || 'Véhicule'}
                </h3>
                {vehicle.description && (
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {vehicle.description}
                  </p>
                )}
                {vehicle.price && (
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {vehicle.price}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
            No vehicles configured
          </div>
        )}
      </div>
    </div>
  )
}

