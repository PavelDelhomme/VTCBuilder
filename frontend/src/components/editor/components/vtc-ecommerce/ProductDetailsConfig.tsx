'use client'

import React from 'react'
import { Block } from '../../types'

export function ProductDetailsConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nom du produit
        </label>
        <input
          type="text"
          value={safeBlock.data.name || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, name: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Nom du produit"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Prix
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={safeBlock.data.price || 0}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, price: parseFloat(e.target.value) } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Devise
        </label>
        <input
          type="text"
          value={safeBlock.data.currency || 'EUR'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, currency: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="EUR"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={safeBlock.data.description || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, description: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          rows={4}
          placeholder="Description du produit..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Stock disponible
        </label>
        <input
          type="number"
          min="0"
          value={safeBlock.data.stock || 0}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, stock: parseInt(e.target.value) } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={safeBlock.data.in_stock === true}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, in_stock: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">En stock</span>
        </label>
      </div>
    </div>
  )
}

// Add to Cart (Ajouter au Panier)
