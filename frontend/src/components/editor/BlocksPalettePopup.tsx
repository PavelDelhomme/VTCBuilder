'use client'

import React, { useState, useMemo } from 'react'
import { Block } from './BlockEditor'
import blocksService, { BlockType } from '@/services/blocks.service'

interface BlocksPalettePopupProps {
  isOpen: boolean
  onClose: () => void
  onAddBlock: (blockType: BlockType) => void
  currentBlocks: Block[]
  blockTypes: BlockType[]
}

export default function BlocksPalettePopup({ 
  isOpen, 
  onClose, 
  onAddBlock, 
  currentBlocks,
  blockTypes 
}: BlocksPalettePopupProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Vérifier si un type de bloc est un conteneur
  const isContainerType = (blockTypeName: string): boolean => {
    const containerTypes = ['container', 'grid-container', 'flex-container', 'flexbox', 'grid', 'stack', 'inline', 'group', 'wrapper', 'section', 'rows']
    return containerTypes.includes(blockTypeName)
  }

  // Vérifier si un conteneur existe dans les blocs
  const hasContainer = (blocks: Block[]): boolean => {
    const containerTypes = ['container', 'grid-container', 'flex-container', 'flexbox', 'grid', 'stack', 'inline', 'group', 'wrapper', 'section', 'rows']
    for (const block of blocks) {
      if (containerTypes.includes(block.type)) {
        return true
      }
      if (block.children && block.children.length > 0) {
        if (hasContainer(block.children)) {
          return true
        }
      }
    }
    return false
  }

  if (!isOpen) return null

  // Filtrer les blocs selon la recherche et la catégorie
  const filteredBlockTypes = blockTypes.filter((bt: BlockType) => {
    const matchesCategory = categoryFilter === 'all' || bt.category === categoryFilter
    const matchesSearch = !searchQuery || 
      bt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bt.description && bt.description.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const hasContainerInBlocks = hasContainer(currentBlocks)

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      {/* Popup */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[90vw] max-w-4xl h-[80vh] max-h-[800px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Blocs disponibles</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
          {/* Header avec recherche et filtres */}
          <div className="flex-shrink-0 p-4 sm:p-5 lg:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            {/* Barre de recherche */}
            <div className="relative mb-3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un bloc..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filtres par catégorie */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  categoryFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setCategoryFilter('layout')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  categoryFilter === 'layout'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                📐 Structure
              </button>
              <button
                onClick={() => setCategoryFilter('content')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  categoryFilter === 'content'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                📝 Contenu
              </button>
              <button
                onClick={() => setCategoryFilter('media')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  categoryFilter === 'media'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                🖼️ Médias
              </button>
              <button
                onClick={() => setCategoryFilter('custom')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  categoryFilter === 'custom'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                ⚙️ Personnalisé
              </button>
            </div>
          </div>

          {/* Liste des blocs */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
            {/* Message informatif si aucun conteneur */}
            {!hasContainerInBlocks && (
              <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                      ⚠️ Aucun conteneur détecté
                    </h4>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      Vous devez d'abord ajouter un conteneur (Container, Grid, Flex, etc.) dans la catégorie <strong>"Structure"</strong> avant de pouvoir ajouter des blocs de contenu.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Affichage des blocs */}
            {filteredBlockTypes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Aucun bloc trouvé</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Essayez avec d'autres mots-clés</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredBlockTypes.map((blockType: BlockType) => {
                  const isContainer = isContainerType(blockType.name)
                  const canAdd = isContainer || hasContainerInBlocks
                  
                  return (
                    <button
                      key={blockType.id}
                      onClick={() => {
                        if (canAdd) {
                          onAddBlock(blockType)
                          onClose()
                        } else {
                          alert('⚠️ Vous devez d\'abord ajouter un conteneur (Container, Grid, Flex, etc.) avant d\'ajouter des blocs de contenu.\n\nLes blocs de structure sont disponibles dans la catégorie "Structure".')
                        }
                      }}
                      disabled={!canAdd}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        canAdd
                          ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-500 hover:shadow-lg hover:bg-blue-50 dark:hover:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0">{blockType.icon || '📦'}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                            {blockType.label || blockType.name}
                          </h3>
                          {blockType.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                              {blockType.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

