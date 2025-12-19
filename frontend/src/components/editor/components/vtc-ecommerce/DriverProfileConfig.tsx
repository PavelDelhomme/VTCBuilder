'use client'

import React from 'react'
import { Block } from '../../types'

export function DriverProfileConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nom du chauffeur
        </label>
        <input
          type="text"
          value={safeBlock.data.name || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, name: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Jean Dupont"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Photo (URL)
        </label>
        <input
          type="text"
          value={safeBlock.data.photo_url || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, photo_url: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Note (0-5)
        </label>
        <input
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={safeBlock.data.rating || 5}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, rating: parseFloat(e.target.value) } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre d'avis
        </label>
        <input
          type="number"
          min="0"
          value={safeBlock.data.reviews_count || 0}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, reviews_count: parseInt(e.target.value) } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
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
          rows={3}
          placeholder="Description du chauffeur..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Années d'expérience
        </label>
        <input
          type="number"
          min="0"
          value={safeBlock.data.experience_years || 0}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, experience_years: parseInt(e.target.value) } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
    </div>
  )
}

// Email Button (Bouton Email)
