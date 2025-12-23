import React from 'react'
import { RendererCaseProps } from '../types'
import { CollapsibleSection } from '../../CollapsibleSection'

export function renderPricingTable({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const pricingRows = safeBlock.data.rows || [{ route: '', price: '', duration: '' }]
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre de la section
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Nos tarifs"
        />
      </div>
      <CollapsibleSection title="Lignes de tarifs" count={pricingRows.length} defaultCollapsed={false}>
        <div className="space-y-3">
          {pricingRows.map((row: any, index: number) => (
            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Ligne {index + 1}</span>
                <button
                  onClick={() => {
                    const newRows = pricingRows.filter((_: any, i: number) => i !== index)
                    onUpdate({ data: { ...safeBlock.data, rows: newRows } })
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                  title="Supprimer cette ligne"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Trajet
                </label>
                <input
                  type="text"
                  value={row.route || ''}
                  onChange={(e) => {
                    const newRows = [...pricingRows]
                    newRows[index] = { ...row, route: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, rows: newRows } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Trajet (ex: Aéroport → Centre-ville)"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prix
                  </label>
                  <input
                    type="text"
                    value={row.price || ''}
                    onChange={(e) => {
                      const newRows = [...pricingRows]
                      newRows[index] = { ...row, price: e.target.value }
                      onUpdate({ data: { ...safeBlock.data, rows: newRows } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Prix (ex: 45€)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Durée
                  </label>
                  <input
                    type="text"
                    value={row.duration || ''}
                    onChange={(e) => {
                      const newRows = [...pricingRows]
                      newRows[index] = { ...row, duration: e.target.value }
                      onUpdate({ data: { ...safeBlock.data, rows: newRows } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Durée (ex: 30 min)"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newRows = [...pricingRows, { route: '', price: '', duration: '' }]
              onUpdate({ data: { ...safeBlock.data, rows: newRows } })
            }}
            className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
          >
            <span>+</span>
            <span>Ajouter une ligne de tarif</span>
          </button>
        </div>
      </CollapsibleSection>
    </div>
  )
}

