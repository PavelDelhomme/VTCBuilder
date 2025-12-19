'use client'

import React from 'react'
import { Block } from '../../types'

export function FareCalculatorConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const pricingRules = safeBlock.data.pricing_rules || [{ 
    type: 'base', 
    label: 'Tarif de base', 
    amount: 0, 
    unit: 'fixed' 
  }]
  
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
          placeholder="Estimez votre tarif"
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
          rows={2}
          placeholder="Calculez le prix de votre trajet..."
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
          <option value="EUR">€ EUR</option>
          <option value="USD">$ USD</option>
          <option value="GBP">£ GBP</option>
          <option value="CHF">CHF</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Règles de tarification ({pricingRules.length})
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {pricingRules.map((rule: any, index: number) => (
            <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded space-y-2">
              <select
                value={rule.type || 'base'}
                onChange={(e) => {
                  const newRules = [...pricingRules]
                  newRules[index] = { ...rule, type: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, pricing_rules: newRules } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
              >
                <option value="base">Tarif de base</option>
                <option value="distance">Par distance (km)</option>
                <option value="time">Par temps (min)</option>
                <option value="night">Supplément nuit</option>
                <option value="weekend">Supplément week-end</option>
                <option value="airport">Supplément aéroport</option>
              </select>
              <input
                type="text"
                value={rule.label || ''}
                onChange={(e) => {
                  const newRules = [...pricingRules]
                  newRules[index] = { ...rule, label: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, pricing_rules: newRules } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Libellé"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={rule.amount || 0}
                  onChange={(e) => {
                    const newRules = [...pricingRules]
                    newRules[index] = { ...rule, amount: parseFloat(e.target.value) || 0 }
                    onUpdate({ data: { ...safeBlock.data, pricing_rules: newRules } })
                  }}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  placeholder="Montant"
                />
                <select
                  value={rule.unit || 'fixed'}
                  onChange={(e) => {
                    const newRules = [...pricingRules]
                    newRules[index] = { ...rule, unit: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, pricing_rules: newRules } })
                  }}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                >
                  <option value="fixed">Fixe</option>
                  <option value="per_km">Par km</option>
                  <option value="per_min">Par minute</option>
                </select>
              </div>
              <button
                onClick={() => {
                  const newRules = pricingRules.filter((_: any, i: number) => i !== index)
                  onUpdate({ data: { ...safeBlock.data, pricing_rules: newRules } })
                }}
                className="w-full px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => onUpdate({ data: { ...safeBlock.data, pricing_rules: [...pricingRules, { type: 'base', label: '', amount: 0, unit: 'fixed' }] } })}
          className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Ajouter une règle
        </button>
      </div>
    </div>
  )
}
