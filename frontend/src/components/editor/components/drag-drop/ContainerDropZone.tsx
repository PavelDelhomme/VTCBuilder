/**
 * Zone de drop pour les conteneurs
 */

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { BlockType } from '@/services/blocks.service'

interface ContainerDropZoneProps {
  containerId: string
  onDrop: (blockType: BlockType) => void
  onSelectContainer?: () => void
  children?: React.ReactNode
  className?: string
}

export function ContainerDropZone({
  containerId,
  onDrop,
  onSelectContainer,
  children,
  className = '',
}: ContainerDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `container-drop-${containerId}`,
    data: {
      type: 'container',
      containerId,
    },
  })

  // Vérifier si cette zone est survolée (via hoveredDropZone du parent)
  const dropZoneId = `container-drop-${containerId}`
  const isHovered = isOver

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isHovered ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 border-solid ring-2 ring-blue-300 dark:ring-blue-600' : 'border-dashed'} transition-all duration-200 relative`}
      title={isHovered ? 'Relâchez pour déposer le bloc ici' : 'Glissez un bloc ici pour l\'ajouter au conteneur'}
      onClick={(e) => {
        // Si on clique directement sur la zone de drop (pas sur un enfant), sélectionner le conteneur
        const target = e.target as HTMLElement
        const clickedOnChild = target.closest('[data-child-block-id]')
        const clickedOnInteractive = target.closest('button, input, textarea, select, a, [role="button"]')
        
        // Si on n'a pas cliqué sur un enfant ou un élément interactif, sélectionner le conteneur
        if (!clickedOnChild && !clickedOnInteractive && onSelectContainer) {
          e.stopPropagation()
          onSelectContainer()
        }
      }}
    >
      {children}
      {isHovered && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20 dark:bg-blue-900/30 rounded-lg pointer-events-none z-10 animate-pulse">
          <div className="bg-blue-500 dark:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-xl text-sm font-semibold flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Déposer ici
          </div>
        </div>
      )}
    </div>
  )
}

