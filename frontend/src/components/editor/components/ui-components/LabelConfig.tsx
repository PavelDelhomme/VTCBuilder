'use client'

import React from 'react'
import { Block } from '../../types'

export function LabelConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte du label
        </label>
        <input
          type="text"
          value={safeBlock.data.text || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, text: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Label"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          For (ID de l'élément associé)
        </label>
        <input
          type="text"
          value={safeBlock.data.for || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, for: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="input-id"
        />
      </div>
    </div>
  )
}
