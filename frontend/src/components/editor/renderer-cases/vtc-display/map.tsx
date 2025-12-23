import React from 'react'
import { RendererCaseProps } from '../types'

export function renderMap({ block, onUpdate }: RendererCaseProps) {
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
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Notre zone de service"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Adresse ou coordonnées
        </label>
        <input
          type="text"
          value={safeBlock.data.address || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, address: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Ex: Paris, France ou 48.8566, 2.3522"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Hauteur de la carte (px)
        </label>
        <input
          type="number"
          value={safeBlock.data.height || 400}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, height: parseInt(e.target.value) || 400 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          min={200}
          max={800}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`map-zoom-${block.id}`}
          checked={safeBlock.data.show_controls || false}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_controls: e.target.checked } })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor={`map-zoom-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
          Afficher les contrôles (zoom, etc.)
        </label>
      </div>
    </div>
  )
}

