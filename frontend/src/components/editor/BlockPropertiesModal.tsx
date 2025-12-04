'use client'

import { useState, useEffect } from 'react'
import { Block } from './types'
import blocksService, { BlockType } from '@/services/blocks.service'
import { BlockPropertiesPanel, BlockLayoutPanel, BlockStylePanel } from './BlockEditor'

interface BlockPropertiesModalProps {
  isOpen: boolean
  onClose: () => void
  block: Block | null
  blockTypes: BlockType[]
  allBlocks: Block[]
  onUpdate: (updates: Partial<Block>) => void
  onDelete?: (blockId: string) => void
  onDuplicate?: (block: Block) => void
}

export default function BlockPropertiesModal({
  isOpen,
  onClose,
  block,
  blockTypes,
  allBlocks,
  onUpdate,
  onDelete,
  onDuplicate,
}: BlockPropertiesModalProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'layout' | 'style'>('content')

  // Réinitialiser l'onglet quand le bloc change
  useEffect(() => {
    if (block) {
      setActiveTab('content')
    }
  }, [block])

  if (!isOpen || !block) return null

  const blockType = blockTypes.find((bt: BlockType) => bt.name === block.type)

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] mx-4 flex flex-col border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Modifier le bloc
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {blockType?.display_name || block.type}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'content'
                ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            📝 Contenu
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'layout'
                ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            📐 Mise en page
          </button>
          <button
            onClick={() => setActiveTab('style')}
            className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'style'
                ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            🎨 Style
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {activeTab === 'content' && (
            <div className="space-y-4">
              {/* Actions */}
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  {onDuplicate && (
                    <button
                      onClick={() => {
                        onDuplicate(block)
                        onClose()
                      }}
                      className="flex-1 px-4 py-2 text-sm font-medium bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Dupliquer
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        if (confirm('Êtes-vous sûr de vouloir supprimer ce bloc ?')) {
                          onDelete(block.id)
                          onClose()
                        }
                      }}
                      className="flex-1 px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Supprimer
                    </button>
                  )}
                </div>
              </div>

              {/* Properties Panel */}
              <BlockPropertiesPanel
                block={block}
                blockType={blockType}
                onUpdate={onUpdate}
              />
            </div>
          )}

          {activeTab === 'layout' && (
            <BlockLayoutPanel
              block={block}
              onUpdate={onUpdate}
              allBlocks={allBlocks}
            />
          )}

          {activeTab === 'style' && (
            <BlockStylePanel
              block={block}
              onUpdate={onUpdate}
              allBlocks={allBlocks}
              blockTypes={blockTypes}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

