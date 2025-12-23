'use client'

/**
 * Composant SortableBlock - Bloc draggable et redimensionnable
 * Optimisé avec React.memo pour éviter les re-renders inutiles
 */

import React, { useState, useEffect, useRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Block } from '../../types'
import { BlockType } from '@/services/blocks.service'
import { BlockRenderer } from '../../BlockRenderer'
import { ContainerChildrenRenderer } from '../containers/ContainerChildrenRenderer'

interface SortableBlockProps {
  block: Block
  blockTypes: BlockType[]
  isSelected: boolean
  onSelect: () => void
  onSelectChild?: (childId: string) => void
  onUpdate: (updates: Partial<Block>) => void
  onDelete: () => void
  onDuplicate: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  onMove?: (blockId: string, targetContainerId: string | 'root') => void
  allBlocks?: Block[]
  findBlockInTree?: (blocks: Block[], blockId: string) => { block: Block; parent: Block[] | null; index: number } | null
  selectedBlockId?: string | null
  onDragStartCapture?: (e: React.PointerEvent) => void
  isChildBlock?: boolean
}

export const SortableBlock = React.memo(function SortableBlock({
  block,
  blockTypes,
  isSelected,
  onSelect,
  onSelectChild,
  onUpdate,
  onDelete,
  onDuplicate,
  isCollapsed,
  onToggleCollapse,
  onMove,
  allBlocks,
  findBlockInTree,
  selectedBlockId,
  onDragStartCapture,
  isChildBlock = false,
}: SortableBlockProps) {
  // Vérifier si un enfant est sélectionné pour ne pas surligner le parent
  const hasSelectedChild = React.useMemo(() => {
    if (!selectedBlockId || !block.children || block.children.length === 0) return false
    // Vérifier récursivement si un enfant est sélectionné
    const checkChildren = (children: Block[]): boolean => {
      for (const child of children) {
        if (child.id === selectedBlockId) return true
        if (child.children && checkChildren(child.children)) return true
      }
      return false
    }
    return checkChildren(block.children)
  }, [selectedBlockId, block.children])
  
  // Le bloc est considéré comme sélectionné seulement s'il est directement sélectionné ET qu'aucun enfant n'est sélectionné
  const isActuallySelected = isSelected && !hasSelectedChild
  // État pour le menu contextuel
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  // Utiliser l'état passé en prop ou un état local par défaut
  const isExpanded = isCollapsed !== undefined ? !isCollapsed : true
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: block.id,
    data: {
      type: 'block',
      block: block,
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.3 : 1, // Plus transparent pendant le drag pour voir le DragOverlay
  }

  const blockType = blockTypes.find(bt => bt.name === block.type)

  // Calculer les tailles basées sur le nombre de colonnes (sur 12)
  const layoutCols = typeof block.layout === 'number' ? block.layout : 12
  const isSmall = layoutCols <= 4 // 1-4 colonnes = petit
  const isMedium = layoutCols > 4 && layoutCols <= 8 // 5-8 colonnes = moyen
  const isLarge = layoutCols > 8 // 9-12 colonnes = grand
  
  // Calculer la largeur basée sur les colonnes (système 12 colonnes)
  const getLayoutWidth = () => {
    if (layoutCols === 12) return 'w-full'
    if (layoutCols === 11) return 'w-[91.666667%]'
    if (layoutCols === 10) return 'w-[83.333333%]'
    if (layoutCols === 9) return 'w-3/4'
    if (layoutCols === 8) return 'w-2/3'
    if (layoutCols === 7) return 'w-[58.333333%]'
    if (layoutCols === 6) return 'w-1/2'
    if (layoutCols === 5) return 'w-[41.666667%]'
    if (layoutCols === 4) return 'w-1/3'
    if (layoutCols === 3) return 'w-1/4'
    if (layoutCols === 2) return 'w-1/6'
    if (layoutCols === 1) return 'w-[8.333333%]'
    return 'w-full'
  }
  
  const layoutWidthClass = getLayoutWidth()

  // Gestion du redimensionnement
  const [isResizing, setIsResizing] = useState(false)
  const [resizeIndicator, setResizeIndicator] = useState<{ cols: number; percent: number; pixels: number } | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const blockRef = useRef<HTMLDivElement>(null)

  // Mettre à jour la position de la souris pour l'indicateur
  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isResizing])

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>, direction: string) => {
    e.stopPropagation()
    e.preventDefault()
    setIsResizing(true)
    
    const startX = e.clientX
    const startLayout = block.layout || 12
    const containerWidth = blockRef.current?.parentElement?.offsetWidth || 1200

    // Paliers de colonnes disponibles (1-12)
    const availableLayouts: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12)[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!blockRef.current || !blockRef.current.parentElement) return
      
      const deltaX = moveEvent.clientX - startX
      const currentContainerWidth = blockRef.current.parentElement.offsetWidth
      const currentColWidth = currentContainerWidth / 12
      
      // Calculer le nombre de colonnes basé sur le delta
      const deltaCols = Math.round(deltaX / currentColWidth)
      const newLayoutIndex = availableLayouts.indexOf(startLayout) + (direction.includes('right') ? deltaCols : -deltaCols)
      // Limiter à minimum 1 colonne (au lieu de 2 pour plus de flexibilité)
      const minCols = 1
      const clampedIndex = Math.max(0, Math.min(availableLayouts.length - 1, newLayoutIndex))
      const newLayout = availableLayouts[clampedIndex]
      
      // Calculer les dimensions pour l'indicateur
      const calculatedWidth = (newLayout / 12) * currentContainerWidth
      const percentWidth = (newLayout / 12) * 100
      
      // Afficher l'indicateur de redimensionnement
      setResizeIndicator({
        cols: newLayout,
        percent: Math.round(percentWidth * 10) / 10,
        pixels: Math.round(calculatedWidth),
      })
      
      // Vérifier aussi que la largeur calculée ne soit pas inférieure à 150px
      if (calculatedWidth < 150 && newLayout < minCols) {
        return // Ne pas permettre la réduction en dessous de 150px
      }
      
      // Ne mettre à jour que si la valeur a vraiment changé pour éviter les boucles
      if (newLayout !== startLayout && newLayout !== block.layout) {
        onUpdate({ layout: newLayout })
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setResizeIndicator(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Déterminer la taille du texte selon la largeur du bloc
  const getTextSize = () => {
    if (isSmall) return 'text-xs'
    if (isMedium) return 'text-xs sm:text-sm'
    return 'text-sm sm:text-base'
  }

  // Déterminer la taille de l'icône selon la largeur du bloc
  const getIconSize = () => {
    if (isSmall) return 'text-sm'
    if (isMedium) return 'text-base sm:text-lg'
    return 'text-lg sm:text-xl'
  }

  // Déterminer le padding selon la largeur du bloc
  const getPadding = () => {
    if (isSmall) return 'p-2'
    if (isMedium) return 'p-2 sm:p-3'
    return 'p-3 sm:p-4'
  }

  // Déterminer la taille de l'icône container
  const getIconContainerSize = () => {
    if (isSmall) return 'w-6 h-6 sm:w-7 sm:h-7'
    if (isMedium) return 'w-7 h-7 sm:w-8 sm:h-8'
    return 'w-8 h-8 sm:w-10 sm:h-10'
  }

  // Déterminer la taille des boutons
  const getButtonSize = () => {
    if (isSmall) return 'p-1.5'
    if (isMedium) return 'p-1.5 sm:p-2'
    return 'p-2'
  }

  const getButtonIconSize = () => {
    if (isSmall) return 'w-3 h-3 sm:w-4 sm:h-4'
    if (isMedium) return 'w-3.5 h-3.5 sm:w-4 sm:h-4'
    return 'w-4 h-4 sm:w-5 sm:h-5'
  }

  // Gérer le clic sur le bloc pour ouvrir les paramètres directement
  const handleBlockClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Toujours fermer le menu contextuel d'abord si ouvert
    if (showMenu) {
      closeContextMenu()
      e.stopPropagation()
      e.preventDefault()
      // Ne pas ouvrir les paramètres immédiatement après fermeture du menu
      return
    }
    
    // Ignorer si on clique sur les handles de redimensionnement
    if ((e.target as HTMLElement).closest('[class*="cursor-nwse-resize"], [class*="cursor-nesw-resize"], [class*="cursor-ew-resize"]')) {
      return
    }
    
    // Ignorer si on clique sur le menu contextuel
    if ((e.target as HTMLElement).closest('[data-context-menu]')) {
      return
    }
    
    // Ignorer si on clique sur le bouton collapse
    if ((e.target as HTMLElement).closest('[data-collapse-button]')) {
      return
    }
    
    // Vérifier si on clique sur un enfant dans un conteneur
    // Les enfants sont dans des divs avec data-child-block-id
    const childElement = (e.target as HTMLElement).closest('[data-child-block-id]')
    if (childElement) {
      // Si onSelectChild est disponible, l'utiliser
      if (onSelectChild) {
        const childId = childElement.getAttribute('data-child-block-id')
        if (childId) {
          e.stopPropagation()
          e.preventDefault()
          onSelectChild(childId)
          return
        }
      }
      // Sinon, arrêter la propagation pour ne pas sélectionner le conteneur
      e.stopPropagation()
      return
    }
    
    // Vérifier aussi si on clique dans le contenu d'un enfant (même si pas directement sur data-child-block-id)
    // Cela peut arriver si on clique sur BlockRenderer à l'intérieur d'un enfant
    const clickedInChildContent = (e.target as HTMLElement).closest('[data-child-block-id]')
    if (clickedInChildContent) {
      e.stopPropagation()
      return
    }
    
    // Ouvrir les paramètres directement
    onSelect()
  }

  // Gérer le double-clic pour ouvrir les paramètres
  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Vérifier si on double-clique sur un enfant dans un conteneur
    const childElement = (e.target as HTMLElement).closest('[data-child-block-id]')
    if (childElement && onSelectChild) {
      const childId = childElement.getAttribute('data-child-block-id')
      if (childId) {
        e.stopPropagation()
        e.preventDefault()
        // Sélectionner l'enfant et ouvrir les paramètres
        onSelectChild(childId)
        return
      }
    }
    
    e.stopPropagation()
    e.preventDefault()
    // Ouvrir les paramètres en sélectionnant le bloc
    onSelect()
    onSelect()
  }

  // Gérer le clic droit pour afficher le menu contextuel
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    // Vérifier si on fait un clic droit sur un enfant dans ContainerChildrenRenderer
    // Les enfants dans ContainerChildrenRenderer ont data-child-block-id directement sur leur div
    // Vérifier récursivement pour gérer les blocs imbriqués (texte dans conteneur dans conteneur)
    let currentElement: HTMLElement | null = e.target as HTMLElement
    let childElement: HTMLElement | null = null
    let childId: string | null = null
    
    // Chercher récursivement un élément avec data-child-block-id
    while (currentElement && currentElement !== e.currentTarget) {
      if (currentElement.hasAttribute('data-child-block-id')) {
        childElement = currentElement
        childId = currentElement.getAttribute('data-child-block-id')
        break
      }
      currentElement = currentElement.parentElement
    }
    
    // Si on a trouvé un enfant, ne pas afficher le menu du parent
    if (childElement && childId && onSelectChild) {
      e.preventDefault()
      e.stopPropagation()
      // Ne pas afficher le menu du parent - l'enfant gère son propre menu
      // L'enfant va gérer son propre onContextMenu qui sélectionnera l'enfant et ouvrira son menu
      return
    }
    
    // Sinon, afficher le menu contextuel du bloc parent
    e.preventDefault()
    e.stopPropagation()
    // Fermer le menu précédent immédiatement
    if (showMenu) {
      closeContextMenu()
    }
    // Ouvrir le menu contextuel immédiatement
    setContextMenu({ x: e.clientX, y: e.clientY })
    setShowMenu(true)
  }

  // Fermer le menu contextuel
  const closeContextMenu = () => {
    setContextMenu(null)
    setShowMenu(false)
  }

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    if (showMenu) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        // Ne pas fermer si on clique sur le menu lui-même
        if (target.closest('[data-context-menu]')) {
          return
        }
        // Fermer le menu
        closeContextMenu()
      }
      
      // Utiliser capture phase pour intercepter avant les autres handlers
      document.addEventListener('click', handleClickOutside, true)
      document.addEventListener('contextmenu', handleClickOutside, true)
      
      return () => {
        document.removeEventListener('click', handleClickOutside, true)
        document.removeEventListener('contextmenu', handleClickOutside, true)
      }
    }
  }, [showMenu])

  return (
    <>
      <div
        ref={(node) => {
          setNodeRef(node)
          if (node && blockRef) {
            (blockRef as React.MutableRefObject<HTMLDivElement | null>).current = node
          }
        }}
        data-block-id={block.id}
        className={`relative ${layoutWidthClass} mb-4 bg-white dark:bg-gray-800 rounded-xl border-2 ${isActuallySelected ? 'border-blue-500 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800' : 'border-gray-200 dark:border-gray-700'} shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden min-h-[80px] min-w-[200px] ${isResizing ? 'select-none' : ''} group cursor-move`}
        style={{
          ...style,
          minWidth: '200px',
          minHeight: '80px',
          // Centrer le bloc si layout < 12
          ...(layoutCols < 12 ? { marginLeft: 'auto', marginRight: 'auto' } : {}),
        }}
        {...attributes}
        {...(listeners ? {
          ...listeners,
          onPointerDown: (e: React.PointerEvent) => {
            // Sélectionner le bloc automatiquement quand on commence à le glisser
            if (!isSelected) {
              onSelect()
            }
            // Capturer l'événement de clic initial pour calculer l'offset
            if (onDragStartCapture) {
              onDragStartCapture(e)
            }
            if (listeners.onPointerDown) {
              listeners.onPointerDown(e)
            }
          },
        } : {})}
        onClick={handleBlockClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => {
          // Vérifier d'abord si on clique sur un enfant AVANT d'afficher le menu du parent
          // Chercher récursivement pour gérer les blocs profondément imbriqués
          let currentElement: HTMLElement | null = e.target as HTMLElement
          let childElement: HTMLElement | null = null
          
          // Chercher récursivement un élément avec data-child-block-id
          while (currentElement && currentElement !== e.currentTarget) {
            if (currentElement.hasAttribute('data-child-block-id')) {
              childElement = currentElement
              break
            }
            currentElement = currentElement.parentElement
          }
          
          if (childElement) {
            // Si c'est un enfant, ne pas afficher le menu du parent
            // L'enfant gère son propre menu contextuel
            e.preventDefault()
            e.stopPropagation()
            return
          }
          // Sinon, appeler le handler normal
          handleContextMenu(e)
        }}
        onMouseDown={(e) => {
          // Empêcher le menu contextuel de se rouvrir après un clic gauche
          if (e.button === 0 && showMenu) {
            // Clic gauche : fermer le menu immédiatement
            closeContextMenu()
            e.stopPropagation()
          }
        }}
      >
      {/* Resize Handles - Permet le redimensionnement direct des blocs */}
      {isSelected && !isChildBlock && (
        <>
          {/* Handles latéraux pour redimensionner horizontalement */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-12 cursor-ew-resize bg-blue-500 border-2 border-white dark:border-gray-800 rounded-r-lg z-20 hover:bg-blue-600 hover:w-4 transition-all group"
            onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => handleResizeStart(e, 'left')}
            title="Redimensionner la largeur (système de colonnes)"
          >
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg">
                ← Rétrécir
              </div>
            </div>
          </div>
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-12 cursor-ew-resize bg-blue-500 border-2 border-white dark:border-gray-800 rounded-l-lg z-20 hover:bg-blue-600 hover:w-4 transition-all group"
            onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => handleResizeStart(e, 'right')}
            title="Redimensionner la largeur (système de colonnes)"
          >
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg">
                Agrandir →
              </div>
            </div>
          </div>
          
          {/* Indicateur de redimensionnement */}
          {isResizing && resizeIndicator && mousePosition && (
            <div
              className="fixed z-[100001] bg-blue-600 text-white px-3 py-2 rounded-lg shadow-xl pointer-events-none"
              style={{
                top: `${mousePosition.y - 60}px`,
                left: `${mousePosition.x}px`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="text-sm font-bold">
                {resizeIndicator.cols}/12 colonnes
              </div>
              <div className="text-xs opacity-90">
                {resizeIndicator.percent}% • {resizeIndicator.pixels}px
              </div>
            </div>
          )}
        </>
      )}
      {/* Block Header - Modern Design */}
      <div
        className={`flex items-center justify-between ${getPadding()} transition-colors ${
          isActuallySelected 
            ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-b border-blue-200 dark:border-blue-700' 
            : 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-800'
        }`}
        onClick={(e) => {
          // Ne pas ouvrir les paramètres si on drag ou si on clique sur le bouton collapse
          if (!isDragging && !(e.target as HTMLElement).closest('[data-collapse-button]')) {
            e.stopPropagation()
            handleBlockClick(e as any)
          }
        }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <button
            data-collapse-button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              if (onToggleCollapse) {
                onToggleCollapse()
              }
            }}
            onMouseDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            onPointerDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            className="flex-shrink-0 p-2.5 sm:p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 transition-colors cursor-pointer touch-manipulation z-10 relative"
            title={isExpanded ? "Masquer les propriétés" : "Afficher les propriétés"}
          >
            <svg 
              className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div 
            className={`flex-shrink-0 ${getIconContainerSize()} rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-700`}
            {...(!isActuallySelected ? { ...attributes, ...listeners } : {})}
            onClick={(e) => {
              // Si le bloc est sélectionné, les listeners sont sur le bloc principal
              if (isActuallySelected) {
                e.stopPropagation()
              }
            }}
          >
            <span className={getIconSize()}>{blockType?.icon || '📦'}</span>
          </div>
          <div className="min-w-0 flex-1">
            <span className={`${getTextSize()} font-semibold text-gray-900 dark:text-gray-100 truncate block`}>{blockType?.label || block.type}</span>
            {blockType?.description && layoutCols > 4 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate block hidden sm:block">{blockType.description}</span>
            )}
          </div>
        </div>
        {/* Indicateur clic pour paramètres et bouton Supprimer - visible au survol */}
        <div className="flex items-center gap-2 flex-shrink-0 z-10 relative opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="text-xs text-gray-400 dark:text-gray-500 px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700" title="Clic droit pour ouvrir les paramètres du bloc">
            <span className="text-blue-600 dark:text-blue-400">⚙️</span> Clic droit paramètres
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${blockType?.label || block.type}" ?`)) {
                onDelete()
              }
            }}
            className="p-1.5 sm:p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            title="Supprimer le bloc"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        {/* Aide contextuelle pour drag and drop - visible quand sélectionné */}
        {isActuallySelected && (
          <div className="absolute top-2 right-2 opacity-100 transition-opacity z-10">
            <div className="text-xs text-blue-600 dark:text-blue-400 px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700" title="Glissez-déposez ce bloc pour le déplacer ou le mettre dans un conteneur">
              <span className="text-blue-600 dark:text-blue-400">🖱️</span> Glisser pour déplacer
            </div>
          </div>
        )}
      </div>

      {/* Block Content - Simple and Clean */}
      {isExpanded ? (
        <div 
          className={`${isSmall ? 'p-2 sm:p-3' : 'p-4 sm:p-6'} bg-white dark:bg-gray-800 min-h-[120px]`}
          style={{
            // S'assurer que les gradients prennent toute la hauteur disponible
            ...(block.styles?.background_gradient || (block.styles?.background && block.styles?.background.includes('gradient')) ? {
              minHeight: '100%',
              height: 'auto',
            } : {}),
          }}
          onClick={(e) => {
            // Empêcher la sélection du conteneur si on clique dans le contenu
            // Sauf si on clique directement sur le conteneur (pas sur un enfant)
            const target = e.target as HTMLElement
            if (target.closest('[data-child-block-id]')) {
              e.stopPropagation()
            }
          }}
        >
          {/* Conteneur avec enfants */}
          {(block.type === 'container' || block.type === 'flex-container' || block.type === 'grid-container' || 
            block.type === 'flexbox' || block.type === 'grid' || block.type === 'stack' || 
            block.type === 'inline' || block.type === 'group' || block.type === 'wrapper' || block.type === 'section' || block.type === 'rows') ? (
            <ContainerChildrenRenderer
              block={block}
              blockTypes={blockTypes}
              allBlocks={allBlocks || []} // Passer tous les blocs pour permettre de choisir un bloc existant
              onAddChild={(childBlock) => {
                const newChildren = [...(block.children || []), childBlock]
                onUpdate({ children: newChildren })
              }}
              onUpdateChild={(childId, updates) => {
                const newChildren = (block.children || []).map((child) =>
                  child.id === childId ? { ...child, ...updates } : child
                )
                onUpdate({ children: newChildren })
              }}
              onDeleteChild={(childId) => {
                const childToDelete = (block.children || []).find(c => c.id === childId)
                const childBlockType = blockTypes.find(bt => bt.name === childToDelete?.type)
                const childLabel = childBlockType?.label || childToDelete?.type || 'ce bloc'
                
                if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${childLabel}" ?\n\nCette action est irréversible et supprimera également tous les blocs enfants s'il s'agit d'un conteneur.`)) {
                  const newChildren = (block.children || []).filter((child) => child.id !== childId)
                  onUpdate({ children: newChildren })
                }
              }}
              onSelectChild={(childId) => {
                // Utiliser onSelectChild du parent pour gérer la sélection
                if (onSelectChild) {
                  onSelectChild(childId)
                }
              }}
              onSelectContainer={() => {
                // Sélectionner le conteneur parent
                onSelect()
              }}
              selectedBlockId={selectedBlockId}
              onMoveChild={(childId, targetContainerId) => {
                // Trouver l'enfant à déplacer
                const children = block.children || []
                const childToMove = children.find(c => c.id === childId)
                if (!childToMove) return
                
                // Retirer l'enfant du conteneur actuel
                const newChildren = children.filter(c => c.id !== childId)
                onUpdate({ children: newChildren })
                
                // Utiliser onMove du parent pour gérer le déplacement
                if (onMove) {
                  onMove(childId, targetContainerId)
                }
              }}
              onMoveBlockToContainer={(blockId) => {
                // Utiliser onMove du parent pour gérer le déplacement vers ce conteneur
                if (onMove) {
                  onMove(blockId, block.id)
                }
              }}
              findBlockInTree={findBlockInTree}
            />
          ) : (
            <BlockRenderer block={block} blockType={blockType} onUpdate={onUpdate} />
          )}
        </div>
      ) : (
        // Vue réduite : afficher uniquement un indicateur compact
        <div className={`${isSmall ? 'p-2' : 'p-3'} bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400 italic">
              Bloc réduit - Cliquez sur la flèche pour développer
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (onToggleCollapse) {
                  onToggleCollapse()
                }
              }}
              className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              title="Développer le bloc"
            >
              Développer
            </button>
          </div>
        </div>
      )}

      {/* Menu contextuel */}
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
            // Ne pas fermer le menu si on clique dedans
          }}
          onMouseDown={(e) => {
            e.stopPropagation()
            // Empêcher la propagation pour éviter que le clic ne déclenche handleBlockClick
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
              onSelect()
              closeContextMenu()
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
              // Sélectionner le bloc d'abord pour afficher ses paramètres
              onSelect()
              // Fermer le menu après un court délai pour permettre la sélection
              setTimeout(() => {
                closeContextMenu()
              }, 100)
              // Le bloc est maintenant sélectionné et draggable
              // L'utilisateur peut maintenant glisser le bloc vers n'importe quel conteneur
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
            title="Sélectionner le bloc et le rendre déplaçable (glisser pour déplacer)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
            Déplacer (glisser le bloc)
          </button>
          {onToggleCollapse && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleCollapse()
                closeContextMenu()
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isExpanded ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                )}
              </svg>
              {isExpanded ? 'Réduire' : 'Étendre'}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
              closeContextMenu()
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Dupliquer
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              const blockType = blockTypes.find(bt => bt.name === block.type)
              const blockLabel = blockType?.label || block.type || 'ce bloc'
              if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${blockLabel}" ?\n\nCette action est irréversible et supprimera également tous les blocs enfants s'il s'agit d'un conteneur.`)) {
                onDelete()
                closeContextMenu()
              }
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

    </div>
    </>
  )
})

