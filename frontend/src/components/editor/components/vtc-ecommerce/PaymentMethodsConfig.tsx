'use client'

import React from 'react'
import { Block } from '../../types'

export function PaymentMethodsConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const methods = safeBlock.data.methods || []
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Méthodes acceptées (une par ligne: nom|icône)
        </label>
        <textarea
          value={methods.map((m: any) => `${m.name || ''}|${m.icon || '💳'}`).join('\n')}
          onChange={(e) => {
            const lines = e.target.value.split('\n').filter(line => line.trim())
            const newMethods = lines.map(line => {
              const [name, icon] = line.split('|')
              return { name: name?.trim() || '', icon: icon?.trim() || '💳' }
            })
            onUpdate({ data: { ...safeBlock.data, methods: newMethods } })
          }}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
          rows={5}
          placeholder="Carte bancaire|💳&#10;PayPal|💼&#10;Espèces|💵"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre
        </label>
        <input
          type="text"
          value={safeBlock.data.title || 'Méthodes de paiement acceptées'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
    </div>
  )
}
