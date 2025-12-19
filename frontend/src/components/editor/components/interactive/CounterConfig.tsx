'use client'

import React from 'react'
import { Block } from '../../types'

export function CounterConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Valeur finale
        </label>
        <input
          type="number"
          value={safeBlock.data.value || 0}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, value: parseInt(e.target.value) || 0 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="100"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Préfixe
        </label>
        <input
          type="text"
          value={safeBlock.data.prefix || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, prefix: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="+"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Suffixe
        </label>
        <input
          type="text"
          value={safeBlock.data.suffix || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, suffix: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="%"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Durée de l'animation (ms)
        </label>
        <input
          type="number"
          value={safeBlock.data.duration || 2000}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, duration: parseInt(e.target.value) || 2000 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          min={500}
          max={10000}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Label
        </label>
        <input
          type="text"
          value={safeBlock.data.label || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, label: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Clients satisfaits"
        />
      </div>
    </div>
  )
}
