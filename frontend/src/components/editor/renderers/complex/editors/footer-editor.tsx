'use client'

import React, { useState } from 'react'
import { Block } from '../../../types'
import { BlockType } from '@/services/blocks.service'
import { CollapsibleSection } from '../../../CollapsibleSection'
import UrlInputWithSuggestions from '../../../ui/UrlInputWithSuggestions'

interface ComplexRendererProps {
  block: Block
  blockType?: BlockType
  onUpdate: (updates: Partial<Block>) => void
}

export function renderFooter({ block, onUpdate }: ComplexRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const footerColumns = safeBlock.data.columns || [
    { title: 'Produit', description: '', links: [
      { label: 'Tarifs', url: '/#pricing' },
      { label: 'Fonctionnalités', url: '/features' },
      { label: 'Templates', url: '/templates' }
    ]},
    { title: 'Support', description: '', links: [
      { label: 'Documentation', url: '/docs' },
      { label: 'Contact', url: '/contact' },
      { label: 'FAQ', url: '/faq' }
    ]},
    { title: 'Légal', description: '', links: [
      { label: 'CGV', url: '/legal/terms' },
      { label: 'Confidentialité', url: '/legal/privacy' }
    ]}
  ]
  
  // État pour les colonnes rétractées
  const [collapsedColumns, setCollapsedColumns] = useState<Set<number>>(new Set())
  
  const toggleColumnCollapse = (colIndex: number) => {
    setCollapsedColumns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(colIndex)) {
        newSet.delete(colIndex)
      } else {
        newSet.add(colIndex)
      }
      return newSet
    })
  }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre du footer
        </label>
        <input
          type="text"
          value={safeBlock.data.title || 'VTCBuilder'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="VTCBuilder"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description du footer
        </label>
        <textarea
          value={safeBlock.data.description || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, description: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          rows={2}
          placeholder="La solution complète pour créer votre site VTC professionnel."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte du copyright
        </label>
        <input
          type="text"
          value={safeBlock.data.copyright || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, copyright: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="© 2024 Votre Entreprise. Tous droits réservés."
        />
      </div>
      <CollapsibleSection title="Colonnes du footer" count={footerColumns.length} defaultCollapsed={false}>
        <div className="space-y-2">
          {footerColumns.map((column: any, colIndex: number) => {
            const isCollapsed = collapsedColumns.has(colIndex)
            return (
              <div key={colIndex} className="border border-gray-200 dark:border-gray-700 rounded">
                {/* Header de la colonne avec bouton pour rétracter/déplier */}
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <input
                    type="text"
                    value={column.title || ''}
                    onChange={(e) => {
                      const newColumns = [...footerColumns]
                      newColumns[colIndex] = { ...column, title: e.target.value }
                      onUpdate({ data: { ...block.data, columns: newColumns } })
                    }}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Titre de la colonne"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={() => toggleColumnCollapse(colIndex)}
                    className="ml-2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                    title={isCollapsed ? 'Déplier la colonne' : 'Rétracter la colonne'}
                  >
                    <svg 
                      className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                {/* Contenu de la colonne (rétractable) */}
                {!isCollapsed && (
                  <div className="p-2 space-y-2">
                    <textarea
                      value={column.description || ''}
                      onChange={(e) => {
                        const newColumns = [...footerColumns]
                        newColumns[colIndex] = { ...column, description: e.target.value }
                        onUpdate({ data: { ...block.data, columns: newColumns } })
                      }}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      rows={2}
                      placeholder="Description de la colonne (optionnel)"
                    />
                    <div className="space-y-1">
                      {(column.links || []).map((link: any, linkIndex: number) => (
                        <div key={linkIndex} className="flex gap-1">
                          <UrlInputWithSuggestions
                            value={link.url || ''}
                            onChange={(url) => {
                              const newColumns = [...footerColumns]
                              const newLinks = [...(newColumns[colIndex].links || [])]
                              newLinks[linkIndex] = { ...link, url }
                              newColumns[colIndex] = { ...column, links: newLinks }
                              onUpdate({ data: { ...block.data, columns: newColumns } })
                            }}
                            placeholder="URL"
                            className="text-xs flex-1"
                          />
                          <input
                            type="text"
                            value={link.label || ''}
                            onChange={(e) => {
                              const newColumns = [...footerColumns]
                              const newLinks = [...(newColumns[colIndex].links || [])]
                              newLinks[linkIndex] = { ...link, label: e.target.value }
                              newColumns[colIndex] = { ...column, links: newLinks }
                              onUpdate({ data: { ...block.data, columns: newColumns } })
                            }}
                            className="w-24 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                            placeholder="Label"
                          />
                          <button
                            onClick={() => {
                              const newColumns = [...footerColumns]
                              newColumns[colIndex] = {
                                ...column,
                                links: (column.links || []).filter((_: any, i: number) => i !== linkIndex)
                              }
                              onUpdate({ data: { ...block.data, columns: newColumns } })
                            }}
                            className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center"
                            title="Supprimer ce lien"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newColumns = [...footerColumns]
                          newColumns[colIndex] = {
                            ...column,
                            links: [...(column.links || []), { label: '', url: '' }]
                          }
                          onUpdate({ data: { ...block.data, columns: newColumns } })
                        }}
                        className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        + Ajouter lien
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onUpdate({ data: { ...block.data, columns: [...footerColumns, { title: '', links: [] }] } })}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Ajouter colonne
          </button>
          {footerColumns.length > 1 && (
            <button
              onClick={() => onUpdate({ data: { ...block.data, columns: footerColumns.slice(0, -1) } })}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              - Supprimer colonne
            </button>
          )}
        </div>
      </CollapsibleSection>
    </div>
  )
}

