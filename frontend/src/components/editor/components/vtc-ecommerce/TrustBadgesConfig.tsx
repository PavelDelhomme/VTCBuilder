'use client'

import React from 'react'
import { Block } from '../../types'

export function TrustBadgesConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const badges = safeBlock.data.badges || []
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Badges (un par ligne: texte|icône)
        </label>
        <textarea
          value={badges.map((b: any) => `${b.text || ''}|${b.icon || '✅'}`).join('\n')}
          onChange={(e) => {
            const lines = e.target.value.split('\n').filter(line => line.trim())
            const newBadges = lines.map(line => {
              const [text, icon] = line.split('|')
              return { text: text?.trim() || '', icon: icon?.trim() || '✅' }
            })
            onUpdate({ data: { ...safeBlock.data, badges: newBadges } })
          }}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
          rows={5}
          placeholder="Paiement sécurisé|🔒&#10;Livraison rapide|🚚&#10;Garantie qualité|⭐"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Disposition
        </label>
        <select
          value={safeBlock.data.layout || 'horizontal'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, layout: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="horizontal">Horizontal</option>
          <option value="vertical">Vertical</option>
          <option value="grid">Grille</option>
        </select>
      </div>
    </div>
  )
}

// Payment Methods (Méthodes de Paiement)
