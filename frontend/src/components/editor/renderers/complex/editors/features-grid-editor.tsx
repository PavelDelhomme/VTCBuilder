'use client'

import React from 'react'
import { Block } from '@/components/editor/types'
import { BlockType } from '@/services/blocks.service'
import { CollapsibleSection } from '@/components/editor/CollapsibleSection'

interface ComplexRendererProps {
  block: Block
  blockType?: BlockType
  onUpdate: (updates: Partial<Block>) => void
}

export function renderFeaturesGrid({ block, onUpdate }: ComplexRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const features = safeBlock.data.features || [
    { icon: '🎨', title: 'Site Professionnel', description: 'Designs modernes et responsive. Personnalisez votre site sans coder.' },
    { icon: '📅', title: 'Réservations en Ligne', description: 'Système de réservation complet avec calendrier et notifications.' },
    { icon: '💳', title: 'Paiements Intégrés', description: 'Acceptez les paiements en ligne. Cartes bancaires, virement, tout est possible.' }
  ]
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
          placeholder="Tout ce dont vous avez besoin"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre de colonnes
        </label>
        <select
          value={safeBlock.data.columns || 3}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, columns: parseInt(e.target.value) } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value={1}>1 colonne</option>
          <option value={2}>2 colonnes</option>
          <option value={3}>3 colonnes</option>
          <option value={4}>4 colonnes</option>
        </select>
      </div>
      <CollapsibleSection title="Fonctionnalités" count={features.length} defaultCollapsed={false}>
        <div className="space-y-2">
          {features.map((feature: any, index: number) => (
            <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={feature.icon || ''}
                  onChange={(e) => {
                    const newFeatures = [...features]
                    newFeatures[index] = { ...feature, icon: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, features: newFeatures } })
                  }}
                  className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-center"
                  placeholder="🎨"
                />
                <input
                  type="text"
                  value={feature.title || ''}
                  onChange={(e) => {
                    const newFeatures = [...features]
                    newFeatures[index] = { ...feature, title: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, features: newFeatures } })
                  }}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  placeholder="Titre de la fonctionnalité"
                />
                <button
                  onClick={() => {
                    const newFeatures = features.filter((_: any, i: number) => i !== index)
                    onUpdate({ data: { ...safeBlock.data, features: newFeatures } })
                  }}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center flex-shrink-0"
                  title="Supprimer cette fonctionnalité"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <textarea
                value={feature.description || ''}
                onChange={(e) => {
                  const newFeatures = [...features]
                  newFeatures[index] = { ...feature, description: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, features: newFeatures } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Description de la fonctionnalité"
                rows={2}
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => onUpdate({ data: { ...safeBlock.data, features: [...features, { icon: '✨', title: '', description: '' }] } })}
          className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Ajouter une fonctionnalité
        </button>
      </CollapsibleSection>
    </div>
  )
}

