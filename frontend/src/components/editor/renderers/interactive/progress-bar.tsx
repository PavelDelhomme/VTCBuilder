/**
 * Renderer pour le bloc progress-bar
 */

import React from 'react'
import { RendererProps } from '../types'

export const renderProgressBar = ({ block, wrapperStyles }: RendererProps): React.ReactElement => {
  const percentage = Math.min(100, Math.max(0, block.data.percentage || 0))
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data.label && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{block.data.label}</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{percentage}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

