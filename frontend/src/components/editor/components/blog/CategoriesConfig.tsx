'use client'

import React from 'react'
import { Block } from '../../types'

export function CategoriesConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const categories = safeBlock.data.categories || [{ name: 'Catégorie 1', slug: 'categorie-1' }]
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
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Catégories"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Catégories ({categories.length})
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((cat: any, index: number) => (
            <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
              <input
                type="text"
                value={cat.name || ''}
                onChange={(e) => {
                  const newCats = [...categories]
                  newCats[index] = { ...cat, name: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, categories: newCats } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Nom"
              />
              <input
                type="text"
                value={cat.slug || ''}
                onChange={(e) => {
                  const newCats = [...categories]
                  newCats[index] = { ...cat, slug: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, categories: newCats } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Slug"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onUpdate({ data: { ...safeBlock.data, categories: [...categories, { name: '', slug: '' }] } })}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Ajouter
          </button>
          {categories.length > 1 && (
            <button
              onClick={() => onUpdate({ data: { ...safeBlock.data, categories: categories.slice(0, -1) } })}
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
