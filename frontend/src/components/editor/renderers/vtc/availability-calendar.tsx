/**
 * Renderer pour le bloc availability-calendar (calendrier de disponibilité VTC)
 */

import React from 'react'
import { RendererProps } from '../types'

export const renderAvailabilityCalendar = ({ block, wrapperStyles }: RendererProps): React.ReactElement => {
  const availableDays = block.data?.available_days || []
  const viewMode = block.data?.view_mode || 'month'
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data?.title && (
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {block.data.title}
        </h2>
      )}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          {viewMode === 'month' ? 'Calendrier mensuel' : 'Calendrier hebdomadaire'}
          {availableDays.length > 0 && (
            <div className="mt-4 text-sm">
              {availableDays.length} jour(s) disponible(s)
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

