'use client'

import React from 'react'
import { Block } from '../../types'

interface LayoutRendererProps {
  block: Block
  onUpdate: (updates: Partial<Block>) => void
}

export function renderContainer({ block, onUpdate }: LayoutRendererProps) {
  return (
    <div className="space-y-3">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          📦 Conteneur: Ajoutez des blocs enfants pour structurer votre contenu.
        </p>
      </div>
    </div>
  )
}

export function renderFlexContainer({ block, onUpdate }: LayoutRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Direction
        </label>
        <select
          value={safeBlock.data?.direction || 'row'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, direction: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="row">Horizontal (row)</option>
          <option value="column">Vertical (column)</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Wrap
        </label>
        <select
          value={safeBlock.data?.wrap || 'nowrap'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, wrap: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="nowrap">Pas de retour à la ligne</option>
          <option value="wrap">Retour à la ligne</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Espacement (gap)
        </label>
        <input
          type="text"
          value={safeBlock.data?.gap || '1rem'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, gap: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="1rem"
        />
      </div>
    </div>
  )
}

export function renderGridContainer({ block, onUpdate }: LayoutRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Colonnes (grid-template-columns)
        </label>
        <input
          type="text"
          value={safeBlock.data?.columns || 'repeat(3, 1fr)'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, columns: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="repeat(3, 1fr)"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Exemples: repeat(3, 1fr), 1fr 2fr 1fr, auto auto
        </p>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Lignes (grid-template-rows)
        </label>
        <input
          type="text"
          value={safeBlock.data?.rows || 'auto'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, rows: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="auto ou repeat(2, 1fr)"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Exemples: auto, repeat(2, 1fr), 100px 200px, minmax(100px, auto)
        </p>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Espacement (gap)
        </label>
        <input
          type="text"
          value={safeBlock.data?.gap || '1rem'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, gap: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="1rem"
        />
      </div>
    </div>
  )
}

export function renderColumns({ block, onUpdate }: LayoutRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const columnCount = safeBlock.data.columns_count || 2
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre de colonnes
        </label>
        <input
          type="number"
          value={columnCount}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, columns_count: parseInt(e.target.value) || 2 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          min={2}
          max={6}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Espacement entre colonnes
        </label>
        <select
          value={block.styles?.gap || '1rem'}
          onChange={(e) => onUpdate({ styles: { ...block.styles, gap: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="0.5rem">Très serré</option>
          <option value="1rem">Normal</option>
          <option value="1.5rem">Espacé</option>
          <option value="2rem">Très espacé</option>
        </select>
      </div>
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 Les colonnes peuvent contenir d'autres blocs. Ajoutez des blocs enfants pour remplir chaque colonne.
        </p>
      </div>
    </div>
  )
}

export function renderRows({ block, onUpdate }: LayoutRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const rowCount = safeBlock.data.rows_count || 2
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre de lignes
        </label>
        <input
          type="number"
          value={rowCount}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, rows_count: parseInt(e.target.value) || 2 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          min={1}
          max={10}
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
        Les lignes peuvent contenir des colonnes ou d'autres blocs
      </p>
    </div>
  )
}

export function renderSection({ block, onUpdate }: LayoutRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Image de fond (URL) - Optionnel
        </label>
        <input
          type="url"
          value={safeBlock.data.background_image || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, background_image: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="https://example.com/image.jpg"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Position de l'image
          </label>
          <select
            value={safeBlock.data.background_position || 'center'}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, background_position: e.target.value } })}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="center">Centre</option>
            <option value="top">Haut</option>
            <option value="bottom">Bas</option>
            <option value="left">Gauche</option>
            <option value="right">Droite</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Taille de l'image
          </label>
          <select
            value={safeBlock.data.background_size || 'cover'}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, background_size: e.target.value } })}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="cover">Couvrir</option>
            <option value="contain">Contenir</option>
            <option value="auto">Auto</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`section-overlay-${block.id}`}
          checked={safeBlock.data.overlay || false}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, overlay: e.target.checked } })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor={`section-overlay-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
          Overlay sombre sur l'image
        </label>
      </div>
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 Cette section peut contenir d'autres blocs. Ajoutez des blocs enfants pour remplir la section.
        </p>
      </div>
    </div>
  )
}

