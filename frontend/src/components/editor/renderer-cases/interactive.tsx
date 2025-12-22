import React from 'react'
import { RendererCaseProps } from './types'
import { CollapsibleSection } from '../CollapsibleSection'

export function renderCountdown({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date cible
        </label>
        <input
          type="datetime-local"
          value={safeBlock.data.target_date || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, target_date: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre (optionnel)
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Offre se termine dans..."
        />
      </div>
    </div>
  )
}

export function renderProgressBar({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Label
        </label>
        <input
          type="text"
          value={safeBlock.data.label || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, label: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Compétence"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Pourcentage (0-100)
        </label>
        <input
          type="number"
          value={safeBlock.data.percentage || 0}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, percentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          min={0}
          max={100}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Couleur de la barre
        </label>
        <input
          type="color"
          value={safeBlock.data.color || '#3B82F6'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, color: e.target.value } })}
          className="w-full h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
        />
      </div>
    </div>
  )
}

export function renderTabs({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const tabs = safeBlock.data.tabs || []
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Onglets
        </label>
        {tabs.length > 0 ? (
          <div className="space-y-2">
            {tabs.map((tab: any, i: number) => (
              <div key={i} className="flex gap-2 items-center p-2 border border-gray-300 dark:border-gray-600 rounded">
                <input
                  type="text"
                  value={tab.title || ''}
                  onChange={(e) => {
                    const newTabs = [...tabs]
                    newTabs[i] = { ...tab, title: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, tabs: newTabs } })
                  }}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  placeholder={`Onglet ${i + 1}`}
                />
                <button
                  onClick={() => {
                    const newTabs = tabs.filter((_: any, idx: number) => idx !== i)
                    onUpdate({ data: { ...safeBlock.data, tabs: newTabs } })
                  }}
                  className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">Aucun onglet</p>
        )}
        <button
          onClick={() => {
            const newTabs = [...tabs, { title: `Onglet ${tabs.length + 1}`, content: '' }]
            onUpdate({ data: { ...safeBlock.data, tabs: newTabs } })
          }}
          className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Ajouter un onglet
        </button>
      </div>
    </div>
  )
}

export function renderProgressCircle({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Pourcentage (0-100)
        </label>
        <input
          type="number"
          value={safeBlock.data.percentage || 0}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, percentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          min={0}
          max={100}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Couleur
        </label>
        <input
          type="color"
          value={safeBlock.data.color || '#3B82F6'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, color: e.target.value } })}
          className="w-full h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
        />
      </div>
    </div>
  )
}

export function renderModal({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre de la modale
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Titre"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Contenu
        </label>
        <textarea
          value={safeBlock.data.content || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, content: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          rows={4}
          placeholder="Contenu de la modale"
        />
      </div>
    </div>
  )
}

