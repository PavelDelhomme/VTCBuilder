'use client'

import React from 'react'
import { Block } from '../../types'

export function BuyNowConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte du bouton
        </label>
        <input
          type="text"
          value={safeBlock.data.button_text || 'Acheter maintenant'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_text: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          ID Produit
        </label>
        <input
          type="text"
          value={safeBlock.data.product_id || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, product_id: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="product-123"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL de redirection
        </label>
        <input
          type="text"
          value={safeBlock.data.checkout_url || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, checkout_url: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="/checkout"
        />
      </div>
    </div>
  )
}

// Vehicle Comparison (Comparaison Véhicules)
