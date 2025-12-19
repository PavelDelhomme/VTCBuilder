'use client'

import React from 'react'
import { Block } from '../../types'

export function PopoverConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte du déclencheur
        </label>
        <input
          type="text"
          value={safeBlock.data.trigger || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, trigger: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Cliquez ici"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Contenu du popover
        </label>
        <textarea
          value={safeBlock.data.content || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, content: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          rows={4}
          placeholder="Contenu qui apparaît dans le popover"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Position
        </label>
        <select
          value={safeBlock.data.position || 'top'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, position: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="top">Haut</option>
          <option value="bottom">Bas</option>
          <option value="left">Gauche</option>
          <option value="right">Droite</option>
        </select>
      </div>
    </div>
  )
}
