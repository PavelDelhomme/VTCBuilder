'use client'

import React from 'react'
import { Block } from '../../types'

export function GridConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          ⚏ Grid: Grille CSS avec propriétés avancées. Ajoutez des blocs enfants pour les placer dans la grille.
        </p>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Colonnes
        </label>
        <input
          type="text"
          value={safeBlock.data.columns || 'repeat(3, 1fr)'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, columns: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
          placeholder="repeat(3, 1fr)"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Lignes
        </label>
        <input
          type="text"
          value={safeBlock.data.rows || 'auto'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, rows: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
          placeholder="auto"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Gap (px)
        </label>
        <input
          type="number"
          value={safeBlock.data.gap || 0}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, gap: parseInt(e.target.value) || 0 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          min={0}
        />
      </div>
    </div>
  )
}
