'use client'

/**
 * Composant pour un bloc enfant draggable dans un conteneur
 */

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Block } from '../../types'
import { BlockType } from '@/services/blocks.service'
import { BlockRenderer } from '../../BlockRenderer'
import { ContainerChildrenRenderer } from '../containers/ContainerChildrenRenderer'

interface DraggableChildBlockProps {
  child: Block
  childBlockType?: BlockType
  blockTypes: BlockType[]
  selectedBlockId?: string | null
  onSelectChild: (childId: string) => void
  onUpdateChild: (childId: string, updates: Partial<Block>) => void
  onDeleteChild: (childId: string) => void
  onMoveChild?: (childId: string, targetContainerId: string | 'root') => void
  findBlockInTree?: (blocks: Block[], blockId: string) => { block: Block; parent: Block[] | null; index: number } | null
  allBlocks?: Block[]
  showMenu: boolean
  setShowMenu: (show: boolean) => void
  contextMenu: { x: number; y: number; childId?: string } | null
  setContextMenu: (menu: { x: number; y: number; childId?: string } | null) => void
  closeContextMenu: () => void
  toggleChildCollapse: (childId: string) => void
  collapsedChildren: Set<string>
}

export function DraggableChildBlock({
  child,
  childBlockType,
  blockTypes,
  selectedBlockId,
  onSelectChild,
  onUpdateChild,
  onDeleteChild,
  onMoveChild,
  findBlockInTree,
  allBlocks,
  showMenu,
  setShowMenu,
  contextMenu,
  setContextMenu,
  closeContextMenu,
  toggleChildCollapse,
  collapsedChildren,
}: DraggableChildBlockProps) {
  // Utiliser useDraggable au niveau du composant (pas dans une boucle)
  const { attributes: childAttributes, listeners: childListeners, setNodeRef: setChildNodeRef, transform: childTransform, isDragging: isChildDragging } = useDraggable({
    id: child.id,
    data: {
      type: 'block',
      block: child,
    }
  })
  
  const childStyle = {
    transform: CSS.Transform.toString(childTransform),
    opacity: isChildDragging ? 0.3 : 1,
  }
  
  return (
    <div
      ref={setChildNodeRef}
      style={childStyle}
      data-child-block-id={child.id}
      className={`bg-white dark:bg-gray-800 rounded-lg border transition-colors overflow-hidden group relative ${
        selectedBlockId === child.id
          ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-300 dark:ring-blue-600 shadow-md cursor-move'
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer'
      }`}
      {...(selectedBlockId === child.id ? { ...childAttributes, ...childListeners } : {
        ...childAttributes,
        ...childListeners,
        onPointerDown: (e: React.PointerEvent) => {
          // Sélectionner l'enfant automatiquement quand on commence à le glisser
          if (selectedBlockId !== child.id) {
            onSelectChild(child.id)
          }
          if (childListeners.onPointerDown) {
            childListeners.onPointerDown(e)
          }
        }
      })}
      onClick={(e) => {
        // Ne pas sélectionner si on clique sur un bouton
        const target = e.target as HTMLElement
        if (target.closest('button')) {
          return
        }
        e.stopPropagation()
        onSelectChild(child.id)
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (showMenu) {
          closeContextMenu()
        }
        onSelectChild(child.id)
        setContextMenu({ x: e.clientX, y: e.clientY, childId: child.id })
        setShowMenu(true)
      }}
    >
      {/* Header du bloc enfant */}
      <div className={`flex items-center justify-between p-3 border-b relative transition-colors ${
        selectedBlockId === child.id
          ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-700'
          : 'border-gray-200 dark:border-gray-700'
      }`}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              toggleChildCollapse(child.id)
              // Ne pas sélectionner le parent, mais trouver le bloc suivant dans la liste
              // et le sélectionner à la place
              if (allBlocks && findBlockInTree) {
                const result = findBlockInTree(allBlocks, child.id)
                if (result && result.parent) {
                  const currentIndex = result.index
                  const nextIndex = currentIndex + 1
                  if (nextIndex < result.parent.length) {
                    onSelectChild(result.parent[nextIndex].id)
                  } else if (currentIndex > 0) {
                    onSelectChild(result.parent[currentIndex - 1].id)
                  }
                }
              }
            }}
            onMouseDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            className="flex-shrink-0 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-20 relative"
            title={collapsedChildren.has(child.id) ? "Développer" : "Réduire"}
          >
            <svg 
              className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform duration-200 ${collapsedChildren.has(child.id) ? '' : 'rotate-90'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <span className="text-lg flex-shrink-0">{childBlockType?.icon || '📦'}</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {childBlockType?.label || child.type}
          </span>
        </div>
        {/* Bouton Supprimer et indicateur drag - visible au survol */}
        <div className="flex items-center gap-2 flex-shrink-0 z-10 relative opacity-0 group-hover:opacity-100 transition-opacity">
          {selectedBlockId === child.id && (
            <div className="text-xs text-blue-600 dark:text-blue-400 px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700" title="Glisser pour déplacer">
              <span className="text-blue-600 dark:text-blue-400">🖱️</span> Glisser
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              const childLabel = childBlockType?.label || child.type || 'ce bloc'
              if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${childLabel}" ?\n\nCette action est irréversible et supprimera également tous les blocs enfants s'il s'agit d'un conteneur.`)) {
                onDeleteChild(child.id)
              }
            }}
            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex-shrink-0"
            title="Supprimer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      {/* Contenu du bloc enfant */}
      {!collapsedChildren.has(child.id) && childBlockType && (
        <div 
          className="p-3"
          data-child-block-id={child.id}
          onClick={(e) => {
            e.stopPropagation()
            onSelectChild(child.id)
          }}
          onDoubleClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onSelectChild(child.id)
          }}
          onContextMenu={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (showMenu) {
              closeContextMenu()
            }
            onSelectChild(child.id)
            setContextMenu({ x: e.clientX, y: e.clientY, childId: child.id })
            setShowMenu(true)
          }}
          onMouseDown={(e) => {
            e.stopPropagation()
          }}
        >
          {/* Si l'enfant est un conteneur, utiliser ContainerChildrenRenderer */}
          {(child.type === 'container' || child.type === 'flex-container' || child.type === 'grid-container' || 
            child.type === 'flexbox' || child.type === 'grid' || child.type === 'stack' || 
            child.type === 'inline' || child.type === 'group' || child.type === 'wrapper' || child.type === 'section' || child.type === 'rows') ? (
            <ContainerChildrenRenderer
              block={child}
              blockTypes={blockTypes}
              allBlocks={allBlocks}
              onAddChild={(newChildBlock) => {
                const newChildren = [...(child.children || []), newChildBlock]
                onUpdateChild(child.id, { children: newChildren })
              }}
              onUpdateChild={(grandChildId, updates) => {
                const newChildren = (child.children || []).map((grandChild) =>
                  grandChild.id === grandChildId ? { ...grandChild, ...updates } : grandChild
                )
                onUpdateChild(child.id, { children: newChildren })
              }}
              onDeleteChild={(grandChildId) => {
                const newChildren = (child.children || []).filter((grandChild) => grandChild.id !== grandChildId)
                onUpdateChild(child.id, { children: newChildren })
              }}
              onSelectChild={(grandChildId) => {
                onSelectChild(grandChildId)
              }}
              onSelectContainer={() => {
                // Sélectionner le conteneur enfant (qui est lui-même un conteneur)
                onSelectChild(child.id)
              }}
              selectedBlockId={selectedBlockId}
              onMoveChild={(grandChildId, targetContainerId) => {
                const newChildren = (child.children || []).filter((grandChild) => grandChild.id !== grandChildId)
                onUpdateChild(child.id, { children: newChildren })
                if (onMoveChild) {
                  onMoveChild(grandChildId, targetContainerId)
                }
              }}
              onMoveBlockToContainer={(blockId) => {
                // Pour les conteneurs imbriqués, déplacer vers ce conteneur (child.id)
                if (onMoveChild && findBlockInTree && allBlocks) {
                  const blockInfo = findBlockInTree(allBlocks, blockId)
                  if (blockInfo && blockInfo.block) {
                    // Retirer le bloc de sa position actuelle et l'ajouter dans ce conteneur
                    onMoveChild(blockId, child.id)
                  }
                }
              }}
              findBlockInTree={findBlockInTree}
            />
          ) : (
            <div 
              data-child-block-id={child.id}
              onClick={(e) => {
                e.stopPropagation()
                onSelectChild(child.id)
              }}
              onContextMenu={(e) => {
                e.preventDefault()
                e.stopPropagation()
                // Fermer tout menu précédent
                if (showMenu) {
                  closeContextMenu()
                }
                // Sélectionner l'enfant et ouvrir ses paramètres
                onSelectChild(child.id)
                // Ouvrir le menu contextuel de l'enfant
                setContextMenu({ x: e.clientX, y: e.clientY, childId: child.id })
                setShowMenu(true)
              }}
            >
              <BlockRenderer 
                block={{ ...child, data: child.data || {} }} 
                blockType={childBlockType} 
                onUpdate={(updates) => onUpdateChild(child.id, updates)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

