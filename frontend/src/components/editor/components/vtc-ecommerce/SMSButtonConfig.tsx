'use client'

import React from 'react'
import { Block } from '../../types'

export function SMSButtonConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Numéro de téléphone
        </label>
        <input
          type="tel"
          value={safeBlock.data.phone || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, phone: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="+33612345678"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte du bouton
        </label>
        <input
          type="text"
          value={safeBlock.data.button_text || 'Envoyer un SMS'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_text: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Message par défaut
        </label>
        <textarea
          value={safeBlock.data.default_message || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, default_message: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          rows={2}
          placeholder="Bonjour, je souhaite..."
        />
      </div>
    </div>
  )
}

// Product Gallery (Galerie Produit)
