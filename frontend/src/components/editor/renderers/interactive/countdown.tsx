/**
 * Renderer pour le bloc countdown
 */

import React from 'react'
import { RendererProps } from '../types'

export const renderCountdown = ({ block, wrapperStyles }: RendererProps): React.ReactElement => {
  const targetDate = block.data.target_date ? new Date(block.data.target_date).getTime() : null
  const now = Date.now()
  const timeLeft = targetDate && targetDate > now ? targetDate - now : 0
  
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)
  
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data.title && (
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-6">
          {block.data.title}
        </h2>
      )}
      <div className="flex justify-center gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{days}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Jours</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{hours}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Heures</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{minutes}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Minutes</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{seconds}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Secondes</div>
        </div>
      </div>
    </div>
  )
}

