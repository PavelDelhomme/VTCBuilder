'use client'

import React from 'react'
import { Block } from '../../types'

export function RelatedPostsConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre de la section
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Articles liés"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre d'articles
        </label>
        <input
          type="number"
          value={safeBlock.data.count || 3}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, count: parseInt(e.target.value) || 3 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          min={1}
          max={12}
        />
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        💡 Les articles seront chargés automatiquement depuis votre base de données.
      </div>
    </div>
  )
}
