'use client'

import React from 'react'
import { Block } from '../../types'

export function FlexboxConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          📐 Flexbox: Conteneur flexbox avec propriétés avancées. Ajoutez des blocs enfants pour les aligner.
        </p>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Direction
        </label>
        <select
          value={safeBlock.data.direction || 'row'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, direction: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="row">Horizontal (row)</option>
          <option value="column">Vertical (column)</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Justify Content
        </label>
        <select
          value={safeBlock.data.justifyContent || 'flex-start'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, justifyContent: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="flex-start">Début</option>
          <option value="flex-end">Fin</option>
          <option value="center">Centre</option>
          <option value="space-between">Espace entre</option>
          <option value="space-around">Espace autour</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Align Items
        </label>
        <select
          value={safeBlock.data.alignItems || 'stretch'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, alignItems: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="stretch">Étirer</option>
          <option value="flex-start">Début</option>
          <option value="flex-end">Fin</option>
          <option value="center">Centre</option>
          <option value="baseline">Baseline</option>
        </select>
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
