'use client'

import React from 'react'
import { Block } from '../../types'

export function DropdownConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const items = safeBlock.data.items || [{ label: 'Option 1', value: 'option1' }]
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Label du menu
        </label>
        <input
          type="text"
          value={safeBlock.data.label || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, label: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Menu"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Options ({items.length})
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {items.map((item: any, index: number) => (
            <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
              <input
                type="text"
                value={item.label || ''}
                onChange={(e) => {
                  const newItems = [...items]
                  newItems[index] = { ...item, label: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, items: newItems } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Label"
              />
              <input
                type="text"
                value={item.value || ''}
                onChange={(e) => {
                  const newItems = [...items]
                  newItems[index] = { ...item, value: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, items: newItems } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Valeur"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onUpdate({ data: { ...safeBlock.data, items: [...items, { label: '', value: '' }] } })}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Ajouter
          </button>
          {items.length > 1 && (
            <button
              onClick={() => onUpdate({ data: { ...safeBlock.data, items: items.slice(0, -1) } })}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              - Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
