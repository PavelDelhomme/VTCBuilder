/**
 * Renderer pour le bloc badges
 */

import React from 'react'
import { RendererProps } from '../types'

export const renderBadges = ({ block, wrapperStyles }: RendererProps): React.ReactElement => {
  const badges = block.data.badges || []
  const getBadgeColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    }
    return colors[color] || colors.blue
  }
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data.title && (
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-6">
          {block.data.title}
        </h2>
      )}
      <div className="flex flex-wrap gap-2 justify-center">
        {badges.length > 0 ? (
          badges.map((badge: any, index: number) => (
            <span
              key={index}
              className={`px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor(badge.color || 'blue')}`}
            >
              {badge.text || `Badge ${index + 1}`}
            </span>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded w-full">
            No badges configured
          </div>
        )}
      </div>
    </div>
  )
}

