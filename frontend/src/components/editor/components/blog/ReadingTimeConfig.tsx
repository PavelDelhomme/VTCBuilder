'use client'

import React from 'react'
import { Block } from '../../types'

export function ReadingTimeConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte avant le temps
        </label>
        <input
          type="text"
          value={safeBlock.data.prefix || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, prefix: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Temps de lecture:"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Mots par minute
        </label>
        <input
          type="number"
          value={safeBlock.data.wordsPerMinute || 200}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, wordsPerMinute: parseInt(e.target.value) || 200 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          min={100}
          max={300}
        />
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        💡 Le temps de lecture sera calculé automatiquement à partir du contenu de la page.
      </div>
    </div>
  )
}
