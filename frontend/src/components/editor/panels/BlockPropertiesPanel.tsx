'use client'

import React from 'react'
import { Block } from '../types'
import { BlockType } from '@/services/blocks.service'
// BlockRenderer is defined in BlockEditor.tsx and exported
// We need to import it from there
import { BlockRenderer } from '../BlockRenderer'
import UrlInputWithSuggestions from '../ui/UrlInputWithSuggestions'

interface BlockPropertiesPanelProps {
  block: Block
  blockType?: BlockType
  onUpdate: (updates: Partial<Block>) => void
}

export function BlockPropertiesPanel({
  block,
  blockType,
  onUpdate,
}: BlockPropertiesPanelProps) {
  // S'assurer que block.data existe pour éviter les erreurs
  const safeBlock = { ...block, data: block.data || {} }
  
  if (!blockType) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">Type de bloc non trouvé</div>
  }

  // Liste des blocs qui ont une configuration spéciale dans BlockRenderer
  const blocksWithSpecialConfig = [
    'features-grid',
    'features_grid',
    'pricing_cards',
    'pricing-cards',
    'hero',
    'header',
    'cta-section',
    'cta_section',
    'container',
    'flex-container',
    'grid-container',
    'carousel',
    'section',
    'rows',
    'flexbox',
    'grid',
    'stack',
    'inline',
    'group',
    'wrapper',
  ]

  // Si le bloc a une configuration spéciale, utiliser BlockRenderer
  if (blocksWithSpecialConfig.includes(block.type)) {
    return <BlockRenderer block={block} blockType={blockType} onUpdate={onUpdate} />
  }

  // Sinon, utiliser le schema générique
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
        <div className="text-sm text-gray-900 dark:text-gray-100">{blockType.label}</div>
      </div>

      {/* Render properties based on block schema */}
      {blockType.schema && Object.keys(blockType.schema).length > 0 && (
        <div className="space-y-3">
          {Object.entries(blockType.schema).map(([key, schema]) => {
            const schemaObj = schema as any
            return (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {schemaObj.label || key}
              </label>
                {schemaObj.type === 'text' && (
                <input
                  type="text"
                  value={safeBlock.data[key] || ''}
                  onChange={(e) =>
                    onUpdate({
                      data: { ...block.data, [key]: e.target.value },
                    })
                  }
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
                {schemaObj.type === 'textarea' && (
                <textarea
                  value={safeBlock.data[key] || ''}
                  onChange={(e) =>
                    onUpdate({
                      data: { ...block.data, [key]: e.target.value },
                    })
                  }
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              )}
                {schemaObj.type === 'number' && (
                <input
                  type="number"
                  value={safeBlock.data[key] || ''}
                  onChange={(e) =>
                    onUpdate({
                      data: { ...block.data, [key]: parseFloat(e.target.value) || 0 },
                    })
                  }
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
                {(schemaObj.type === 'url' || 
                  (schemaObj.type === 'text' && (key.toLowerCase().includes('url') || key.toLowerCase().includes('link') || key.toLowerCase().includes('href')))) && (
                  <UrlInputWithSuggestions
                    value={safeBlock.data[key] || ''}
                    onChange={(url) =>
                      onUpdate({
                        data: { ...block.data, [key]: url },
                      })
                    }
                    placeholder={schemaObj.placeholder || 'URL ou sélectionner une page...'}
                    className="text-sm"
                />
              )}
            </div>
          )
          })}
        </div>
      )}
    </div>
  )
}

