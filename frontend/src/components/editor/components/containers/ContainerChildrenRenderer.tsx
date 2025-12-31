'use client'

/**
 * Composant pour afficher et gérer les enfants d'un conteneur
 */

import React, { useState, useEffect, useCallback, startTransition } from 'react'
import { Block } from '../../types'
import { BlockType } from '@/services/blocks.service'
import { ContainerDropZone } from '../drag-drop/ContainerDropZone'
import { DraggableChildBlock } from '../drag-drop/DraggableChildBlock'
import { BlockPickerModal } from '../modals/BlockPickerModal'
import { isBlockInContainer } from '../../utils/block-editor/block-tree-utils'

interface ContainerChildrenRendererProps {
  block: Block
  blockTypes: BlockType[]
  onAddChild: (child: Block) => void
  onUpdateChild: (childId: string, updates: Partial<Block>) => void
  onDeleteChild: (childId: string) => void
  onSelectChild: (childId: string) => void
  onSelectContainer?: () => void
  allBlocks?: Block[]
  selectedBlockId?: string | null
  onMoveChild?: (childId: string, targetContainerId: string | 'root') => void
  onMoveBlockToContainer?: (blockId: string) => void
  findBlockInTree?: (blocks: Block[], blockId: string) => { block: Block; parent: Block[] | null; index: number } | null
}

export function ContainerChildrenRenderer({
  block,
  blockTypes,
  onAddChild,
  onUpdateChild,
  onDeleteChild,
  onSelectChild,
  onSelectContainer,
  allBlocks,
  selectedBlockId,
  onMoveChild,
  onMoveBlockToContainer,
  findBlockInTree,
}: ContainerChildrenRendererProps) {
  const children = block.children || []
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [collapsedChildren, setCollapsedChildren] = useState<Set<string>>(new Set())
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; childId?: string } | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  
  // Fonction pour vérifier si un bloc est un conteneur
  const isContainerType = useCallback((blockTypeName: string): boolean => {
    const containerTypes = ['container', 'flex-container', 'grid-container', 'flexbox', 'grid', 'stack', 'inline', 'group', 'wrapper', 'section', 'rows', 'columns']
    return containerTypes.includes(blockTypeName)
  }, [])
  
  const toggleChildCollapse = useCallback((childId: string) => {
    setCollapsedChildren(prev => {
      const newSet = new Set(prev)
      if (newSet.has(childId)) {
        newSet.delete(childId)
      } else {
        newSet.add(childId)
      }
      return newSet
    })
  }, [])
  
  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
    setShowMenu(false)
  }, [])
  
  // Fermer le menu si on clique ailleurs (clic gauche ou droit)
  useEffect(() => {
    if (showMenu) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        // Fermer le menu si on clique n'importe où sauf sur le menu lui-même
        if (!target.closest('[data-context-menu]')) {
          closeContextMenu()
        }
      }
      // Écouter les clics gauches et droits
      document.addEventListener('click', handleClickOutside, true)
      document.addEventListener('contextmenu', handleClickOutside, true)
      // Écouter aussi les mousedown pour fermer plus rapidement
      document.addEventListener('mousedown', handleClickOutside, true)
      return () => {
        document.removeEventListener('click', handleClickOutside, true)
        document.removeEventListener('contextmenu', handleClickOutside, true)
        document.removeEventListener('mousedown', handleClickOutside, true)
      }
    }
  }, [showMenu, closeContextMenu])

  const handleAddBlock = useCallback((blockType: BlockType) => {
    // Utiliser startTransition pour optimiser les performances
    startTransition(() => {
      const newChild: Block = {
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: blockType.name,
        data: {},
        layout: block.type === 'grid-container' ? undefined : 3, // Par défaut 3 colonnes
        children: isContainerType(blockType.name) ? [] : undefined,
      }
      // Ajouter le bloc immédiatement
      onAddChild(newChild)
      // Fermer la popup après l'ajout
      setShowAddMenu(false)
    })
  }, [block.type, onAddChild, isContainerType])

  const handleAddExistingBlock = useCallback((existingBlock: Block) => {
    // Si onMoveBlockToContainer est disponible, utiliser cette fonction pour déplacer le bloc
    // Sinon, créer une copie (pour compatibilité)
    if (onMoveBlockToContainer) {
      // Déplacer le bloc existant vers ce conteneur
      onMoveBlockToContainer(existingBlock.id)
      setShowAddMenu(false)
      return
    }
    
    // Fallback : créer une copie si le déplacement n'est pas possible
    // (par exemple si onMoveBlockToContainer n'est pas disponible)
    const deepCloneBlock = (bloc: Block, baseId: string): Block => {
      const newId = bloc === existingBlock 
        ? baseId 
        : `${baseId}-child-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const cloned: Block = {
        ...bloc,
        id: newId,
        data: bloc.data ? { ...bloc.data } : {},
        styles: bloc.styles ? { ...bloc.styles } : {},
      }
      
      // Cloner récursivement les enfants avec de nouveaux IDs
      if (bloc.children && bloc.children.length > 0) {
        cloned.children = bloc.children.map((child, idx) => 
          deepCloneBlock(child, `${baseId}-child-${idx}`)
        )
      }
      
      return cloned
    }
    
    const newId = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const copiedBlock = deepCloneBlock(existingBlock, newId)
    
    // Ajouter le bloc cloné dans le conteneur
    onAddChild(copiedBlock)
    setShowAddMenu(false)
  }, [onAddChild, onMoveBlockToContainer])

  const containerStyle: React.CSSProperties = {
    minHeight: '120px',
    ...(block.type === 'flex-container' && {
      display: 'flex',
      flexDirection: block.data?.direction || 'row',
      flexWrap: block.data?.wrap || 'nowrap',
      gap: block.data?.gap || '1rem',
    }),
    ...(block.type === 'grid-container' && {
      display: 'grid',
      gridTemplateColumns: typeof block.data?.columns === 'number' 
        ? `repeat(${block.data.columns}, 1fr)` 
        : (typeof block.data?.columns === 'string' && block.data.columns.includes('repeat')
          ? block.data.columns
          : `repeat(${block.data?.columns || 2}, 1fr)`),
      gridTemplateRows: block.data?.rows || 'auto',
      gap: block.data?.gap || block.styles?.gap || '1rem',
    }),
  }

  return (
    <div className="space-y-3">
      {/* Zone de conteneur avec style approprié et zone de drop */}
      <ContainerDropZone
        containerId={block.id}
        onDrop={handleAddBlock}
        onSelectContainer={onSelectContainer}
        className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/50 min-h-[120px]"
      >
        <div 
          className="w-full h-full"
          onClick={(e) => {
            // Si on clique directement sur la zone de conteneur (pas sur un enfant), sélectionner le conteneur
            const target = e.target as HTMLElement
            // Vérifier si le clic est sur un enfant (data-child-block-id) ou sur un élément interactif
            const clickedOnChild = target.closest('[data-child-block-id]')
            const clickedOnInteractive = target.closest('button, input, textarea, select, a, [role="button"]')
            
            // Si on n'a pas cliqué sur un enfant ou un élément interactif, sélectionner le conteneur
            if (!clickedOnChild && !clickedOnInteractive && onSelectContainer) {
              e.stopPropagation()
              onSelectContainer()
            }
          }}
        >
          {children.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-2xl mb-2">📦</div>
              <p className="text-sm font-medium mb-1">Conteneur vide</p>
              <p className="text-xs mb-2">Glissez un bloc ici ou cliquez sur "Ajouter un bloc"</p>
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  💡 <strong>Astuce:</strong> Vous pouvez glisser des blocs existants depuis l'éditeur dans ce conteneur
                </p>
              </div>
            </div>
          ) : (
            <div 
              style={{
                // Utiliser le style du conteneur (grid ou flex) selon le type
                ...(block.type === 'grid-container' ? {
                  display: 'grid',
                  gridTemplateColumns: typeof block.data?.columns === 'number' 
                    ? `repeat(${block.data.columns}, 1fr)` 
                    : (typeof block.data?.columns === 'string' && block.data.columns.includes('repeat')
                      ? block.data.columns
                      : `repeat(${block.data?.columns || 2}, 1fr)`),
                  gridTemplateRows: block.data?.rows || 'auto',
                  gap: (() => {
                    let gapValue = block.data?.gap || block.styles?.gap || '1rem'
                    // Convertir les classes Tailwind gap en valeurs CSS
                    if (typeof gapValue === 'string' && gapValue.startsWith('gap-')) {
                      const gapMap: Record<string, string> = {
                        'gap-0': '0',
                        'gap-1': '0.25rem',
                        'gap-2': '0.5rem',
                        'gap-3': '0.75rem',
                        'gap-4': '1rem',
                        'gap-6': '1.5rem',
                        'gap-8': '2rem',
                        'gap-12': '3rem',
                        'gap-16': '4rem',
                      }
                      gapValue = gapMap[gapValue] || '1rem'
                    }
                    return gapValue
                  })(),
                  width: '100%',
                  minHeight: '120px',
                } : block.type === 'flex-container' ? {
                  display: 'flex',
                  flexDirection: block.data?.direction || 'row',
                  flexWrap: block.data?.wrap || 'nowrap',
                  justifyContent: block.data?.justify || 'flex-start',
                  alignItems: block.data?.align || 'stretch',
                  gap: (() => {
                    let gapValue = block.data?.gap || '1rem'
                    // Convertir les classes Tailwind gap en valeurs CSS
                    if (typeof gapValue === 'string' && gapValue.startsWith('gap-')) {
                      const gapMap: Record<string, string> = {
                        'gap-0': '0',
                        'gap-1': '0.25rem',
                        'gap-2': '0.5rem',
                        'gap-3': '0.75rem',
                        'gap-4': '1rem',
                        'gap-6': '1.5rem',
                        'gap-8': '2rem',
                        'gap-12': '3rem',
                        'gap-16': '4rem',
                      }
                      gapValue = gapMap[gapValue] || '1rem'
                    }
                    return gapValue
                  })(),
                  width: '100%',
                  minHeight: '120px',
                } : {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: block.data?.children_gap_vertical || block.data?.children_gap || '0.5rem',
                  rowGap: block.data?.children_gap_vertical || block.data?.children_gap || '0.5rem',
                  columnGap: block.data?.children_gap_horizontal || block.data?.children_gap || '0.5rem',
                  width: '100%',
                  minHeight: '120px',
                }),
              } as React.CSSProperties}
            >
              {children.map((child) => {
                const childBlockType = blockTypes.find((bt) => bt.name === child.type)
                return (
                  <DraggableChildBlock
                    key={child.id}
                    child={child}
                    childBlockType={childBlockType}
                    blockTypes={blockTypes}
                    selectedBlockId={selectedBlockId}
                    onSelectChild={onSelectChild}
                    onUpdateChild={onUpdateChild}
                    onDeleteChild={onDeleteChild}
                    onMoveChild={onMoveChild}
                    findBlockInTree={findBlockInTree}
                    allBlocks={allBlocks}
                    showMenu={showMenu}
                    setShowMenu={setShowMenu}
                    contextMenu={contextMenu}
                    setContextMenu={setContextMenu}
                    closeContextMenu={closeContextMenu}
                    toggleChildCollapse={toggleChildCollapse}
                    collapsedChildren={collapsedChildren}
                  />
                )
              })}
            </div>
          )}
        </div>
      </ContainerDropZone>

      {/* Menu contextuel pour les enfants */}
      {contextMenu && showMenu && (
        <div
          data-context-menu
          className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 min-w-[180px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => {
            e.stopPropagation()
          }}
          onMouseDown={(e) => {
            e.stopPropagation()
          }}
          onContextMenu={(e) => {
            e.stopPropagation()
            e.preventDefault()
            // Empêcher l'ouverture d'un nouveau menu contextuel si on fait un clic droit dans le menu
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              if (contextMenu.childId) {
                // Sélectionner l'enfant et ouvrir les paramètres immédiatement
                onSelectChild(contextMenu.childId)
                closeContextMenu()
              } else {
                closeContextMenu()
              }
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Paramètres
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (contextMenu.childId) {
                // Sélectionner l'enfant d'abord pour afficher ses paramètres
                onSelectChild(contextMenu.childId)
                // Fermer le menu après un court délai pour permettre la sélection
                setTimeout(() => {
                  closeContextMenu()
                }, 100)
                // L'enfant est maintenant sélectionné et draggable
                // L'utilisateur peut maintenant glisser le bloc vers n'importe quel conteneur
              }
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
            title="Sélectionner le bloc et le rendre déplaçable (glisser pour déplacer)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
            Déplacer (glisser le bloc)
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (contextMenu.childId) {
                toggleChildCollapse(contextMenu.childId)
              }
              closeContextMenu()
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {contextMenu.childId && collapsedChildren.has(contextMenu.childId) ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              )}
            </svg>
            {contextMenu.childId && collapsedChildren.has(contextMenu.childId) ? 'Étendre' : 'Réduire'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (contextMenu.childId) {
                const child = children.find(c => c.id === contextMenu.childId)
                if (child) {
                  // Fonction récursive pour dupliquer un bloc et tous ses enfants
                  const duplicateBlockRecursive = (bloc: Block): Block => {
                    const newId = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                    const duplicated: Block = {
                      ...bloc,
                      id: newId,
                    }
                    // Dupliquer récursivement les enfants si le bloc en a
                    if (bloc.children && bloc.children.length > 0) {
                      duplicated.children = bloc.children.map(child => duplicateBlockRecursive(child))
                    }
                    return duplicated
                  }
                  
                  const newChild = duplicateBlockRecursive(child)
                  const childIndex = children.findIndex(c => c.id === contextMenu.childId)
                  const newChildren = [...children]
                  newChildren.splice(childIndex + 1, 0, newChild)
                  onAddChild(newChild)
                }
              }
              closeContextMenu()
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Dupliquer
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (contextMenu.childId && onMoveChild) {
                // Retirer le bloc du conteneur et le placer à la racine (après le conteneur)
                onMoveChild(contextMenu.childId, 'root')
              }
              closeContextMenu()
            }}
            className="w-full px-4 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retirer du conteneur
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (contextMenu.childId) {
                if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bloc ?')) {
                  onDeleteChild(contextMenu.childId)
                }
              }
              closeContextMenu()
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Supprimer
          </button>
        </div>
      )}


      {/* Bouton pour ajouter un bloc */}
      <button
        onClick={() => setShowAddMenu(true)}
        className="w-full px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2"
        title="Cliquez pour ouvrir la liste des blocs disponibles, ou glissez un bloc existant dans la zone ci-dessus"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span className="text-sm font-medium">Ajouter un bloc</span>
      </button>
      {/* Aide contextuelle */}
      <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong>💡 Comment utiliser:</strong>
        </p>
        <ul className="text-xs text-gray-500 dark:text-gray-500 mt-1 space-y-0.5 list-disc list-inside">
          <li>Cliquez sur "Ajouter un bloc" pour choisir un nouveau bloc</li>
          <li>Glissez un bloc existant depuis l'éditeur dans la zone ci-dessus</li>
          <li>Appuyez sur <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Échap</kbd> pour désélectionner</li>
        </ul>
      </div>

      {/* Popup modale pour la liste des blocs */}
      {/* Permettre tous les blocs, y compris les conteneurs imbriqués */}
      {showAddMenu && (
        <BlockPickerModal
          blockTypes={blockTypes}
          existingBlocks={Array.isArray(allBlocks) ? allBlocks.filter(b => b.id !== block.id && !isBlockInContainer(b, block.id)) : []}
          onSelectNew={(blockType) => {
            handleAddBlock(blockType)
          }}
          onSelectExisting={(existingBlock) => {
            handleAddExistingBlock(existingBlock)
          }}
          onClose={() => setShowAddMenu(false)}
          blockTypesForExisting={blockTypes}
        />
      )}
    </div>
  )
}

