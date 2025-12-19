'use client'

import React from 'react'
import { Block } from '../../types'

export function EmailButtonConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Adresse email
        </label>
        <input
          type="email"
          value={safeBlock.data.email || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, email: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="contact@example.com"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte du bouton
        </label>
        <input
          type="text"
          value={safeBlock.data.button_text || 'Envoyer un email'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_text: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Sujet par défaut
        </label>
        <input
          type="text"
          value={safeBlock.data.subject || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, subject: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Demande de contact"
        />
      </div>
    </div>
  )
}

// SMS Button (Bouton SMS)
