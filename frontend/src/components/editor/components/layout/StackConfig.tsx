'use client'

import React from 'react'
import { Block } from '../../types'

export function StackConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          📚 Stack: Pile verticale d'éléments. Ajoutez des blocs enfants pour les empiler verticalement.
        </p>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Espacement (px)
        </label>
        <input
          type="number"
          value={safeBlock.data.spacing || 16}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, spacing: parseInt(e.target.value) || 16 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          min={0}
        />
      </div>
    </div>
  )
}
