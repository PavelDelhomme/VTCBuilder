'use client'

import React from 'react'
import { Block } from '../types'
import { BlockType } from '@/services/blocks.service'

interface BlockLayoutPanelProps {
  block: Block
  onUpdate: (updates: Partial<Block>) => void
  allBlocks?: Block[]
  blockTypes?: BlockType[]
}

export function BlockLayoutPanel({
  block,
  onUpdate,
  allBlocks = [],
  blockTypes = [],
}: BlockLayoutPanelProps) {
  // S'assurer que block.data existe pour éviter les erreurs
  const safeBlock = { ...block, data: block.data || {} }
  
  return (
    <div className="space-y-4 min-h-0">
      {/* Configuration spécifique pour les conteneurs flex et grille */}
      {(block.type === 'grid-container' || block.type === 'flex-container' || block.type === 'columns') && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-3 uppercase tracking-wider">
            {block.type === 'grid-container' && 'Configuration de la grille'}
            {block.type === 'flex-container' && 'Configuration Flexbox'}
            {block.type === 'columns' && 'Configuration Colonnes'}
          </h4>
          <div className="space-y-3">
            {block.type === 'grid-container' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Colonnes (grid-template-columns)
                  </label>
                  <input
                    type="text"
                    value={safeBlock.data?.columns || 'repeat(3, 1fr)'}
                    onChange={(e) => onUpdate({ data: { ...safeBlock.data, columns: e.target.value } })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="repeat(3, 1fr)"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Exemples: repeat(3, 1fr), 1fr 2fr 1fr, auto auto, 200px 1fr
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lignes (grid-template-rows)
                  </label>
                  <input
                    type="text"
                    value={safeBlock.data?.rows || 'auto'}
                    onChange={(e) => onUpdate({ data: { ...safeBlock.data, rows: e.target.value } })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="auto ou repeat(2, 1fr)"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Exemples: auto, repeat(2, 1fr), 100px 200px, minmax(100px, auto)
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Espacement (gap)
                  </label>
                  <input
                    type="text"
                    value={safeBlock.data?.gap || '1rem'}
                    onChange={(e) => onUpdate({ data: { ...safeBlock.data, gap: e.target.value } })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1rem"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Exemples: 1rem, 20px, 1rem 2rem (row-gap column-gap)
                  </p>
                </div>
              </>
            )}
            {block.type === 'flex-container' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Direction
                  </label>
                  <select
                    value={safeBlock.data?.direction || 'row'}
                    onChange={(e) => onUpdate({ data: { ...safeBlock.data, direction: e.target.value } })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="row">Horizontal (row)</option>
                    <option value="column">Vertical (column)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Wrap
                  </label>
                  <select
                    value={safeBlock.data?.wrap || 'nowrap'}
                    onChange={(e) => onUpdate({ data: { ...safeBlock.data, wrap: e.target.value } })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="nowrap">Pas de retour à la ligne</option>
                    <option value="wrap">Retour à la ligne</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Espacement (gap)
                  </label>
                  <input
                    type="text"
                    value={safeBlock.data?.gap || '1rem'}
                    onChange={(e) => onUpdate({ data: { ...safeBlock.data, gap: e.target.value } })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1rem"
                  />
                </div>
              </>
            )}
            {block.type === 'columns' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre de colonnes
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={safeBlock.data?.columns_count || 2}
                    onChange={(e) => onUpdate({ data: { ...safeBlock.data, columns_count: parseInt(e.target.value) || 2 } })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Espacement (gap)
                  </label>
                  <input
                    type="text"
                    value={block.styles?.gap || block.data?.gap || '1rem'}
                    onChange={(e) => onUpdate({ 
                      styles: { ...block.styles, gap: e.target.value },
                      data: { ...block.data, gap: e.target.value }
                    })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1rem"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Configuration Layout (Largeur, Conteneur, Z-index) */}
      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
          {(() => {
            const blockType = blockTypes?.find((bt: BlockType) => bt.name === block.type)
            const blockLabel = blockType?.label || block.type
            if (block.type === 'container' || block.type === 'grid-container' || block.type === 'flex-container' || block.type === 'columns') {
              return 'Mise en page du conteneur'
            }
            return `Mise en page de ${blockLabel}`
          })()}
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Largeur (colonnes sur 12)
            </label>
            <select
              value={block?.layout || 12}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                onUpdate({ layout: parseInt(e.target.value) as Block['layout'] })
              }}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={12}>12/12 (Pleine largeur)</option>
              <option value={11}>11/12</option>
              <option value={10}>10/12</option>
              <option value={9}>9/12 (3/4)</option>
              <option value={8}>8/12 (2/3)</option>
              <option value={7}>7/12</option>
              <option value={6}>6/12 (1/2)</option>
              <option value={5}>5/12</option>
              <option value={4}>4/12 (1/3)</option>
              <option value={3}>3/12 (1/4)</option>
              <option value={2}>2/12 (1/6)</option>
              <option value={1}>1/12</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Conteneur
            </label>
            <select
              value={block?.container || 'container'}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                onUpdate({ container: e.target.value as Block['container'] })
              }}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="container">Conteneur</option>
              <option value="container-fluid">Fluide</option>
              <option value="none">Aucun</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Z-index
            </label>
            <input
              type="number"
              value={block?.styles?.z_index || 0}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onUpdate({
                  styles: {
                    ...block.styles,
                    z_index: parseInt(e.target.value) || 0,
                  },
                })
              }}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hauteur
            </label>
            <input
              type="text"
              value={block?.height || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onUpdate({ height: e.target.value })
              }}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="auto, 100px, 50vh, 100%"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Exemples: auto, 100px, 50vh, 100%, min-height(200px)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hauteur min
              </label>
              <input
                type="text"
                value={block?.minHeight || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  onUpdate({ minHeight: e.target.value })
                }}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0px"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hauteur max
              </label>
              <input
                type="text"
                value={block?.maxHeight || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  onUpdate({ maxHeight: e.target.value })
                }}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Position et Alignement */}
      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Position et Alignement</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type de position
            </label>
            <select
              value={block?.position?.type || 'static'}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                onUpdate({
                  position: {
                    ...block.position,
                    type: e.target.value as 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky',
                  },
                })
              }}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="static">Statique</option>
              <option value="relative">Relative</option>
              <option value="absolute">Absolue</option>
              <option value="fixed">Fixe</option>
              <option value="sticky">Collant</option>
            </select>
          </div>
          {block?.position?.type !== 'static' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Top
                  </label>
                  <input
                    type="text"
                    value={block?.position?.top || ''}
                    onChange={(e) => {
                      onUpdate({
                        position: {
                          ...block.position,
                          top: e.target.value,
                        },
                      })
                    }}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="0px"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Right
                  </label>
                  <input
                    type="text"
                    value={block?.position?.right || ''}
                    onChange={(e) => {
                      onUpdate({
                        position: {
                          ...block.position,
                          right: e.target.value,
                        },
                      })
                    }}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="0px"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bottom
                  </label>
                  <input
                    type="text"
                    value={block?.position?.bottom || ''}
                    onChange={(e) => {
                      onUpdate({
                        position: {
                          ...block.position,
                          bottom: e.target.value,
                        },
                      })
                    }}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="0px"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Left
                  </label>
                  <input
                    type="text"
                    value={block?.position?.left || ''}
                    onChange={(e) => {
                      onUpdate({
                        position: {
                          ...block.position,
                          left: e.target.value,
                        },
                      })
                    }}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="0px"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

