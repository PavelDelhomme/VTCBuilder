import React from 'react'
import { RendererCaseProps } from './types'

export function renderRating({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Note (1-5)
        </label>
        <input
          type="number"
          value={safeBlock.data.rating || 5}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, rating: Math.max(1, Math.min(5, parseInt(e.target.value) || 5)) } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          min={1}
          max={5}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Taille
        </label>
        <select
          value={safeBlock.data.size || 'medium'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, size: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="small">Petit</option>
          <option value="medium">Moyen</option>
          <option value="large">Grand</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Afficher le texte
        </label>
        <input
          type="checkbox"
          checked={safeBlock.data.show_text !== false}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_text: e.target.checked } })}
          className="w-4 h-4"
        />
        {safeBlock.data.show_text !== false && (
          <input
            type="text"
            value={safeBlock.data.text || ''}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, text: e.target.value } })}
            className="w-full mt-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            placeholder="Texte (ex: '4.5 sur 5')"
          />
        )}
      </div>
    </div>
  )
}

