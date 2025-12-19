'use client'

import React from 'react'
import { Block } from '../../types'

export function FormRSVPConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre de l'événement
        </label>
        <input
          type="text"
          value={safeBlock.data.event_title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, event_title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Événement"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date de l'événement
        </label>
        <input
          type="date"
          value={safeBlock.data.event_date || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, event_date: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Lieu
        </label>
        <input
          type="text"
          value={safeBlock.data.event_location || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, event_location: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Adresse ou lieu"
        />
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={safeBlock.data.show_guests !== false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_guests: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">Demander nombre d'invités</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={safeBlock.data.show_dietary || false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_dietary: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">Demander restrictions alimentaires</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={safeBlock.data.show_message !== false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_message: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">Demander message</span>
        </label>
      </div>
    </div>
  )
}
