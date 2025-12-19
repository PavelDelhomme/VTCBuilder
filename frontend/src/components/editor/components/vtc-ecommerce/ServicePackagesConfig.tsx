'use client'

import React from 'react'
import { Block } from '../../types'

export function ServicePackagesConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const packages = safeBlock.data.packages || []
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Nos forfaits"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre de forfaits
        </label>
        <input
          type="number"
          min="1"
          max="6"
          value={packages.length || 3}
          onChange={(e) => {
            const count = parseInt(e.target.value) || 3
            const newPackages = Array(count).fill(null).map((_, i) => packages[i] || {
              name: `Forfait ${i + 1}`,
              price: 0,
              features: []
            })
            onUpdate({ data: { ...safeBlock.data, packages: newPackages } })
          }}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        💡 Configurez les détails de chaque forfait dans l'aperçu
      </div>
    </div>
  )
}

// Trust Badges (Badges de Confiance)
