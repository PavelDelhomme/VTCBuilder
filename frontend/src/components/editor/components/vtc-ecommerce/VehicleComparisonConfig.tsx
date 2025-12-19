'use client'

import React from 'react'
import { Block } from '../../types'

export function VehicleComparisonConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const vehicles = safeBlock.data.vehicles || []
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
          placeholder="Comparaison des véhicules"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre de véhicules à comparer
        </label>
        <input
          type="number"
          min="2"
          max="5"
          value={vehicles.length || 2}
          onChange={(e) => {
            const count = parseInt(e.target.value) || 2
            const newVehicles = Array(count).fill(null).map((_, i) => vehicles[i] || {
              name: `Véhicule ${i + 1}`,
              seats: 4,
              price: 0,
              features: []
            })
            onUpdate({ data: { ...safeBlock.data, vehicles: newVehicles } })
          }}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        💡 Configurez les détails de chaque véhicule dans l'aperçu
      </div>
    </div>
  )
}

// Service Packages (Forfaits Service)
