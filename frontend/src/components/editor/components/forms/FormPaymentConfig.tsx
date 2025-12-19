'use client'

import React from 'react'
import { Block } from '../../types'

export function FormPaymentConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const paymentMethods = safeBlock.data.payment_methods || ['stripe', 'paypal']
  const availableMethods = ['stripe', 'paypal', 'bank_transfer', 'check']
  
  const toggleMethod = (method: string) => {
    const currentMethods = paymentMethods || []
    const newMethods = currentMethods.includes(method)
      ? currentMethods.filter((m: string) => m !== method)
      : [...currentMethods, method]
    onUpdate({ data: { ...safeBlock.data, payment_methods: newMethods } })
  }
  
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
          placeholder="Paiement"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Montant (€)
        </label>
        <input
          type="number"
          value={safeBlock.data.amount || 0}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, amount: parseFloat(e.target.value) || 0 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          step="0.01"
          min={0}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Devise
        </label>
        <select
          value={safeBlock.data.currency || 'EUR'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, currency: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="EUR">EUR (€)</option>
          <option value="USD">USD ($)</option>
          <option value="GBP">GBP (£)</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Méthodes de paiement
        </label>
        <div className="space-y-1">
          {availableMethods.map((method) => (
            <label key={method} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={paymentMethods.includes(method)}
                onChange={() => toggleMethod(method)}
                className="w-3 h-3"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300 capitalize">{method.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-200">
        ⚠️ Assurez-vous d'avoir configuré les clés API de paiement dans les paramètres du site.
      </div>
    </div>
  )
}
