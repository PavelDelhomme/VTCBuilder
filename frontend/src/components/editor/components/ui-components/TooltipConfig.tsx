'use client'

import React from 'react'
import { Block } from '../../types'

export function TooltipConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte à afficher
        </label>
        <input
          type="text"
          value={safeBlock.data.text || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, text: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Texte visible"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Message du tooltip
        </label>
        <textarea
          value={safeBlock.data.tooltip || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, tooltip: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          rows={3}
          placeholder="Message qui apparaît au survol"
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
