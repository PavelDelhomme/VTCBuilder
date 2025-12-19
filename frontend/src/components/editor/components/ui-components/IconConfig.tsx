'use client'

import React from 'react'
import { Block } from '../../types'

export function IconConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Icône (Emoji ou nom Font Awesome)
        </label>
        <input
          type="text"
          value={safeBlock.data.icon || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, icon: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="⭐ ou fa-star"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Taille
        </label>
        <select
          value={safeBlock.data.size || 'md'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, size: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="sm">Petit</option>
          <option value="md">Moyen</option>
          <option value="lg">Grand</option>
          <option value="xl">Très grand</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Couleur
        </label>
        <input
          type="color"
          value={safeBlock.data.color || '#000000'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, color: e.target.value } })}
          className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded-lg"
        />
      </div>
    </div>
  )
}
