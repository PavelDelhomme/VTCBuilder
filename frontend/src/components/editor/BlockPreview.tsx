'use client'

import React, { useState, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Block } from './types'
import blocksService, { BlockType } from '@/services/blocks.service'
import { renderBlockFromTemplate } from '@/lib/block-renderer'
import Captcha from '@/components/shared/Captcha'

interface BlockPreviewProps {
  blocks: Block[]
  blockTypes: BlockType[]
  onBlocksChange?: (blocks: Block[]) => void
  onBlockSelect?: (blockId: string | null) => void
  onBlockDoubleClick?: (blockId: string) => void
  onBlockRightClick?: (blockId: string, position: { x: number; y: number }) => void
  selectedBlockId?: string | null
  isInteractive?: boolean
  isEditable?: boolean
  onNavigate?: (url: string) => void // Callback pour navigation dans l'éditeur
  inspectorMode?: boolean // Mode inspecteur activé
  onInspectorModeChange?: (enabled: boolean) => void // Callback pour activer/désactiver le mode inspecteur
}

export default function BlockPreview({ 
  blocks, 
  blockTypes, 
  onBlocksChange,
  onBlockSelect,
  onBlockDoubleClick,
  onBlockRightClick,
  selectedBlockId,
  isInteractive = false,
  isEditable = false,
  onNavigate,
  inspectorMode = false,
  onInspectorModeChange
}: BlockPreviewProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setIsDragging(true)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setIsDragging(false)
    setActiveId(null)

    if (over && active.id !== over.id && onBlocksChange) {
      const oldIndex = blocks.findIndex(b => b.id === active.id)
      const newIndex = blocks.findIndex(b => b.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newBlocks = arrayMove(blocks, oldIndex, newIndex)
        onBlocksChange(newBlocks)
      }
    }
  }

  const handleBlockClick = (blockId: string) => {
    if (onBlockSelect && !isDragging && !inspectorMode) {
      onBlockSelect(blockId === selectedBlockId ? null : blockId)
    }
  }

  const handleBlockDoubleClick = (blockId: string) => {
    if (onBlockDoubleClick && !isDragging && !inspectorMode) {
      onBlockDoubleClick(blockId)
    }
  }

  const handleBlockRightClick = (blockId: string, event: React.MouseEvent) => {
    if (onBlockRightClick && !isDragging && !inspectorMode && isEditable) {
      event.preventDefault()
      event.stopPropagation()
      onBlockRightClick(blockId, { x: event.clientX, y: event.clientY })
    }
  }

  // Intercepter les clics sur les liens pour navigation dans l'éditeur
  useEffect(() => {
    if (!onNavigate) return

    const handleLinkClick = (e: MouseEvent) => {
      // Ne pas intercepter en mode inspecteur
      if (inspectorMode) return

      const target = e.target as HTMLElement
      const link = target.closest('a') as HTMLAnchorElement
      
      if (link && link.href) {
        try {
          const url = new URL(link.href)
          const pathname = url.pathname
          
          // Ne pas intercepter les liens externes, les liens avec target="_blank", ou les ancres (#)
          if (link.target === '_blank' || 
              url.origin !== window.location.origin ||
              pathname.startsWith('http') ||
              (pathname === '' && url.hash)) {
            return
          }
          
          // Intercepter uniquement les liens vers des pages publiques de l'éditeur
          // Ne pas intercepter les liens vers des pages publiées accessibles sur localhost
          const isPublicPage = pathname === '/' || 
                              pathname.startsWith('/docs') || 
                              pathname.startsWith('/contact') || 
                              pathname.startsWith('/faq') ||
                              pathname.startsWith('/legal/') ||
                              pathname.startsWith('/features') ||
                              pathname.startsWith('/templates') ||
                              pathname.startsWith('/register') ||
                              pathname.startsWith('/login')
          
          if (isPublicPage) {
            e.preventDefault()
            e.stopPropagation()
            
            // Extraire le slug de la page
            let pageSlug = 'home'
            if (pathname === '/' || pathname === '') {
              pageSlug = 'home'
            } else if (pathname.startsWith('/admin/pages-public/')) {
              const match = pathname.match(/\/admin\/pages-public\/([^\/]+)/)
              if (match) pageSlug = match[1]
            } else {
              // Extraire le slug depuis le pathname (ex: /docs -> docs, /legal/terms -> legal/terms)
              pageSlug = pathname.replace(/^\//, '').split('#')[0] || 'home'
              // Gérer les sous-pages comme legal/terms
              if (pageSlug.includes('/')) {
                // Garder le chemin complet pour les sous-pages
                pageSlug = pageSlug
              }
            }
            
            onNavigate(`/admin/pages-public/${pageSlug}/edit`)
          }
        } catch (err) {
          // Si l'URL n'est pas valide, laisser le comportement par défaut
          console.warn('URL invalide:', link.href)
        }
      }
    }

    const previewContainer = document.querySelector('.block-preview-container')
    if (previewContainer) {
      previewContainer.addEventListener('click', handleLinkClick, true) // Use capture phase
      return () => {
        previewContainer.removeEventListener('click', handleLinkClick, true)
      }
    }
  }, [onNavigate, inspectorMode])

  // Mode inspecteur : détecter les éléments survolés
  useEffect(() => {
    if (!inspectorMode || !onBlockSelect) {
      // Nettoyer les outlines quand le mode inspecteur est désactivé
      if (hoveredElement) {
        hoveredElement.style.outline = ''
        hoveredElement.style.outlineOffset = ''
        setHoveredElement(null)
      }
      return
    }

    let currentHovered: HTMLElement | null = null

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const blockElement = target.closest('[data-block-id]') as HTMLElement
      
      if (blockElement && blockElement !== currentHovered) {
        // Retirer l'outline de l'élément précédent
        if (currentHovered && currentHovered.getAttribute('data-block-id') !== selectedBlockId) {
          currentHovered.style.outline = ''
          currentHovered.style.outlineOffset = ''
        }
        
        // Ajouter l'outline au nouvel élément
        currentHovered = blockElement
        setHoveredElement(blockElement)
        if (blockElement.getAttribute('data-block-id') !== selectedBlockId) {
          blockElement.style.outline = '2px dashed #3b82f6'
          blockElement.style.outlineOffset = '2px'
          blockElement.style.cursor = 'pointer'
        }
      }
    }

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const blockElement = target.closest('[data-block-id]') as HTMLElement
      
      // Vérifier si on sort vraiment du bloc (pas juste d'un enfant)
      if (blockElement && !blockElement.contains(e.relatedTarget as Node)) {
        if (blockElement.getAttribute('data-block-id') !== selectedBlockId) {
          blockElement.style.outline = ''
          blockElement.style.outlineOffset = ''
          blockElement.style.cursor = ''
        }
        if (currentHovered === blockElement) {
          currentHovered = null
          setHoveredElement(null)
        }
      }
    }

    const handleClick = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      const target = e.target as HTMLElement
      const blockElement = target.closest('[data-block-id]') as HTMLElement
      
      if (blockElement) {
        const blockId = blockElement.getAttribute('data-block-id')
        if (blockId && onBlockSelect) {
          onBlockSelect(blockId === selectedBlockId ? null : blockId)
        }
      }
    }

    const previewContainer = document.querySelector('.block-preview-container')
    if (previewContainer) {
      previewContainer.addEventListener('mouseover', handleMouseOver, true)
      previewContainer.addEventListener('mouseout', handleMouseOut, true)
      previewContainer.addEventListener('click', handleClick, true)
      
      return () => {
        previewContainer.removeEventListener('mouseover', handleMouseOver, true)
        previewContainer.removeEventListener('mouseout', handleMouseOut, true)
        previewContainer.removeEventListener('click', handleClick, true)
        // Nettoyer les outlines
        if (currentHovered && currentHovered.getAttribute('data-block-id') !== selectedBlockId) {
          currentHovered.style.outline = ''
          currentHovered.style.outlineOffset = ''
          currentHovered.style.cursor = ''
        }
      }
    }
  }, [inspectorMode, onBlockSelect, selectedBlockId, hoveredElement])

  const activeBlock = activeId ? blocks.find(b => b.id === activeId) : null

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 overflow-y-auto flex flex-col block-preview-container">
      {/* Preview Header - Simulated Browser Bar */}
      <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 px-4 py-2 flex items-center gap-2 flex-shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 bg-white dark:bg-gray-900 rounded px-3 py-1 text-xs text-gray-600 dark:text-gray-400">
          localhost:9494/
        </div>
        {inspectorMode && (
          <div className="text-xs text-blue-600 dark:text-blue-400 px-2 font-semibold">
            🔍 Mode Inspecteur Actif - Cliquez sur un élément pour le sélectionner
          </div>
        )}
        {isEditable && !inspectorMode && (
          <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
            💡 Double-cliquez pour modifier • Clic droit pour menu contextuel
          </div>
        )}
        {isInteractive && !inspectorMode && !isEditable && (
          <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
            Mode prévisualisation interactive
          </div>
        )}
      </div>

      {/* Preview Content */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-y-auto w-full">
          <div className="p-4 sm:p-6 lg:p-8 w-full max-w-full">
            {blocks.length === 0 ? (
              <div className="text-center py-20 lg:py-32">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">Aucun contenu à prévisualiser</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Ajoutez des blocs dans l'éditeur à gauche pour voir la prévisualisation ici
                  </p>
                </div>
              </div>
            ) : (
              <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                {blocks.map((block) => (
                  <SortablePreviewBlock
                    key={block.id}
                    block={block}
                    blockType={blockTypes.find((bt: BlockType) => bt.name === block.type)}
                    isSelected={selectedBlockId === block.id}
                    isInteractive={isInteractive}
                    isEditable={isEditable}
                    onClick={() => handleBlockClick(block.id)}
                    onDoubleClick={() => handleBlockDoubleClick(block.id)}
                    onRightClick={(e) => handleBlockRightClick(block.id, e)}
                  />
                ))}
              </SortableContext>
            )}
          </div>
        </div>
        <DragOverlay>
          {activeBlock ? (
            <div className="opacity-50">
              <BlockPreviewRenderer
                block={activeBlock}
                blockType={blockTypes.find((bt: BlockType) => bt.name === activeBlock.type)}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

// Sortable Preview Block Component
function SortablePreviewBlock({
  block,
  blockType,
  isSelected,
  isInteractive,
  isEditable,
  onClick,
  onDoubleClick,
  onRightClick,
}: {
  block: Block
  blockType?: BlockType
  isSelected: boolean
  isInteractive: boolean
  isEditable: boolean
  onClick: () => void
  onDoubleClick: () => void
  onRightClick?: (e: React.MouseEvent) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id, disabled: !isInteractive })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-block-id={block.id}
      className={`mb-6 relative group ${isInteractive ? 'cursor-move' : isEditable ? 'cursor-pointer' : ''} ${
        isSelected ? 'ring-4 ring-blue-500 ring-offset-4 shadow-lg' : ''
      } ${isEditable && !isSelected ? 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-2' : ''}`}
      onClick={onClick}
      onDoubleClick={isEditable ? onDoubleClick : undefined}
      onContextMenu={isEditable ? onRightClick : undefined}
      {...(isInteractive ? { ...attributes, ...listeners } : {})}
    >
      {isInteractive && (
        <div className="absolute -top-2 -left-2 z-10 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="mr-1">⋮⋮</span>
          Déplacer
        </div>
      )}
      {isEditable && !isInteractive && (
        <div className="absolute -top-2 -left-2 z-10 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Double-clic pour éditer
        </div>
      )}
      <BlockPreviewRenderer block={block} blockType={blockType} />
    </div>
  )
}

// FAQ Section Component with state
function FAQSectionPreview({ title, items, wrapperStyles }: { title?: string; items: any[]; wrapperStyles?: React.CSSProperties }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  
  return (
    <div style={wrapperStyles} className="mb-6">
      {title && (
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
          {title}
        </h2>
      )}
      <div className="space-y-4 max-w-4xl mx-auto">
        {items.length > 0 ? (
          items.map((item: any, i: number) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:bg-gray-900 transition-colors"
              >
                <span className="font-semibold text-gray-900 dark:text-gray-100 pr-8">
                  {item.question || `Question ${i + 1}`}
                </span>
                <span className="text-blue-600 text-xl flex-shrink-0">
                  {openIndex === i ? '−' : '+'}
                </span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 text-gray-600 dark:text-gray-400 border-t border-gray-100">
                  <p className="pt-4">{item.answer || 'Réponse...'}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
            Aucune question FAQ
          </div>
        )}
      </div>
    </div>
  )
}

function BlockPreviewRenderer({ block, blockType, blockTypes }: { block: Block; blockType?: BlockType; blockTypes?: BlockType[] }) {
  // Liste des blocs qui ont un rendu hardcodé et doivent toujours utiliser le switch case
  const blocksWithHardcodedRender = [
    'hero', 'progress-bar', 'cta-section', 'features-grid', 'pricing', 
    'heading', 'text', 'paragraph', 'image', 'button', 'link', 'list',
    'quote', 'code', 'alert', 'divider', 'spacer', 'container', 'flex-container',
    'grid-container', 'columns', 'section', 'footer', 'header', 'contact-form',
    'faq-section', 'banner', 'tabs', 'accordion', 'carousel', 'modal',
    'table', 'chart', 'stats', 'timeline', 'calendar', 'countdown',
    'form', 'form-newsletter', 'form-search', 'form-inscription', 'form-login',
    'booking-form', 'pricing-card', 'pricing-cards-grid', 'billing-cycle-toggle',
    'rating', 'icon-box', 'card', 'testimonials', 'logo-grid', 'team-member',
    'search-bar', 'docs-grid', 'quick-start-section', 'support-hours', 'trial-info',
    'rich-text', 'markdown', 'html-raw', 'icon', 'label', 'tooltip', 'popover',
    'dropdown', 'categories', 'author-box', 'related-posts', 'table-of-contents',
    'reading-time', 'share-buttons', 'flexbox', 'grid', 'stack', 'inline', 'group',
    'wrapper', 'image-slider', 'lightbox', 'vimeo-embed', 'counter', 'card-grid',
    'logo-carousel', 'progress-circle', 'route-calculator', 'fare-calculator', 'availability-calendar',
    'captcha'
  ]
  
  // Si le bloc a un rendu hardcodé, utiliser directement le switch case
  const shouldUseHardcodedRender = blocksWithHardcodedRender.includes(block.type)
  
  // Try to render using template from database first (only if not hardcoded)
  if (!shouldUseHardcodedRender && blockType?.render_template && Object.keys(blockType.render_template).length > 0) {
    try {
      const rendered = renderBlockFromTemplate(block, blockType, blockTypes)
      if (rendered) {
        // Apply wrapper styles
        // IMPORTANT: Ne jamais utiliser padding shorthand ici pour éviter les conflits
        const hasIndividualPadding = !!(block.styles?.padding_top || block.styles?.padding_bottom || 
                                      block.styles?.padding_left || block.styles?.padding_right ||
                                      block.styles?.padding_vertical || block.styles?.padding_horizontal ||
                                      block.styles?.paddingTop || block.styles?.paddingBottom ||
                                      block.styles?.paddingLeft || block.styles?.paddingRight ||
                                      block.styles?.paddingVertical || block.styles?.paddingHorizontal)
        
        // Calculer les valeurs de padding individuelles
        const paddingTop = block.styles?.padding_vertical || block.styles?.padding_top || block.styles?.paddingVertical
        const paddingBottom = block.styles?.padding_vertical || block.styles?.padding_bottom || block.styles?.paddingBottom
        const paddingLeft = block.styles?.padding_horizontal || block.styles?.padding_left || block.styles?.paddingLeft
        const paddingRight = block.styles?.padding_horizontal || block.styles?.padding_right || block.styles?.paddingRight
        
        const wrapperStyles: React.CSSProperties = {
          position: block.position?.type || block.styles?.position || 'static',
          top: block.position?.top || block.styles?.top,
          right: block.position?.right || block.styles?.right,
          bottom: block.position?.bottom || block.styles?.bottom,
          left: block.position?.left || block.styles?.left,
          zIndex: block.styles?.z_index || block.styles?.zIndex,
          overflow: block.styles?.overflow || 'visible',
          marginTop: block.styles?.margin_vertical || block.styles?.margin_top || block.styles?.marginTop,
          marginBottom: block.styles?.margin_vertical || block.styles?.margin_bottom || block.styles?.marginBottom,
          marginLeft: block.styles?.margin_horizontal || block.styles?.margin_left || block.styles?.marginLeft,
          marginRight: block.styles?.margin_horizontal || block.styles?.margin_right || block.styles?.marginRight,
          // Padding - Utiliser uniquement les propriétés individuelles pour éviter les conflits
          ...(hasIndividualPadding ? {
            ...(paddingTop !== undefined && paddingTop !== null && paddingTop !== '' ? { paddingTop } : {}),
            ...(paddingBottom !== undefined && paddingBottom !== null && paddingBottom !== '' ? { paddingBottom } : {}),
            ...(paddingLeft !== undefined && paddingLeft !== null && paddingLeft !== '' ? { paddingLeft } : {}),
            ...(paddingRight !== undefined && paddingRight !== null && paddingRight !== '' ? { paddingRight } : {}),
          } : block.styles?.padding ? {
            padding: block.styles.padding
          } : {}),
          background: block.styles?.background && block.styles?.background.includes('gradient')
            ? block.styles?.background
            : block.styles?.background_color || block.styles?.backgroundColor || undefined,
          color: block.styles?.color,
          width: block.width,
          height: block.height,
          minWidth: block.minWidth,
          minHeight: block.minHeight,
          maxWidth: block.maxWidth,
          maxHeight: block.maxHeight,
        }
        
        // Get layout and container classes
        const layoutCols = block.layout || 12
        const layoutWidth = 
          layoutCols === 12 ? 'w-full' :
          layoutCols === 11 ? 'w-11/12' :
          layoutCols === 10 ? 'w-5/6' :
          layoutCols === 9 ? 'w-3/4' :
          layoutCols === 8 ? 'w-2/3' :
          layoutCols === 7 ? 'w-7/12' :
          layoutCols === 6 ? 'w-1/2' :
          layoutCols === 5 ? 'w-5/12' :
          layoutCols === 4 ? 'w-1/3' :
          layoutCols === 3 ? 'w-1/4' :
          layoutCols === 2 ? 'w-1/6' :
          layoutCols === 1 ? 'w-[8.333333%]' : 'w-full'
        
        const containerClass = block.container === 'container-fluid' ? 'w-full' :
          block.container === 'none' ? '' : 'max-w-7xl mx-auto'
        
        return (
          <div 
            className={`${containerClass} mb-6`} 
            style={wrapperStyles}
          >
            <div className={layoutWidth}>
              {rendered}
            </div>
          </div>
        )
      }
    } catch (error) {
      console.error('Error rendering block from template:', error)
      // Fall through to default rendering
    }
  }
  
  // Fallback to original switch-based rendering
  // Styles du wrapper (container) - position, margin, padding du container
  // IMPORTANT: Ne jamais utiliser padding shorthand ici pour éviter les conflits avec les propriétés individuelles
  const hasIndividualPadding = !!(block.styles?.padding_top || block.styles?.padding_bottom || 
                                block.styles?.padding_left || block.styles?.padding_right ||
                                block.styles?.padding_vertical || block.styles?.padding_horizontal ||
                                block.styles?.paddingTop || block.styles?.paddingBottom ||
                                block.styles?.paddingLeft || block.styles?.paddingRight ||
                                block.styles?.paddingVertical || block.styles?.paddingHorizontal)
  
  // Calculer les valeurs de padding individuelles
  const paddingTop = block.styles?.padding_vertical || block.styles?.padding_top || block.styles?.paddingVertical
  const paddingBottom = block.styles?.padding_vertical || block.styles?.padding_bottom || block.styles?.paddingBottom
  const paddingLeft = block.styles?.padding_horizontal || block.styles?.padding_left || block.styles?.paddingLeft
  const paddingRight = block.styles?.padding_horizontal || block.styles?.padding_right || block.styles?.paddingRight
  
  const wrapperStyles: React.CSSProperties = {
    // Position
    position: block.position?.type || block.styles?.position || 'static',
    // Coordonnées de position
    top: block.position?.top || block.styles?.top,
    right: block.position?.right || block.styles?.right,
    bottom: block.position?.bottom || block.styles?.bottom,
    left: block.position?.left || block.styles?.left,
    // Z-index
    zIndex: block.styles?.z_index || block.styles?.zIndex,
    // Overflow
    overflow: block.styles?.overflow || 'visible',
    // Margin (espacement externe)
    marginTop: block.styles?.margin_vertical || block.styles?.margin_top || block.styles?.marginTop,
    marginBottom: block.styles?.margin_vertical || block.styles?.margin_bottom || block.styles?.marginBottom,
    marginLeft: block.styles?.margin_horizontal || block.styles?.margin_left || block.styles?.marginLeft,
    marginRight: block.styles?.margin_horizontal || block.styles?.margin_right || block.styles?.marginRight,
    // Transition
    transition: block.styles?.transition || (block.styles?.transition_duration 
      ? `all ${block.styles?.transition_duration || 300}ms ease-in-out`
      : undefined),
    // Couleur de fond du wrapper (appliquée au conteneur)
    background: block.styles?.background && block.styles?.background.includes('gradient')
      ? block.styles?.background
      : block.styles?.background_color || block.styles?.backgroundColor || undefined,
    // Couleur de texte du wrapper
    color: block.styles?.color,
    // Padding du wrapper - Utiliser uniquement les propriétés individuelles pour éviter les conflits
    // Ne jamais utiliser padding shorthand si on a des propriétés individuelles
    ...(hasIndividualPadding ? {
      ...(paddingTop !== undefined && paddingTop !== null && paddingTop !== '' ? { paddingTop } : {}),
      ...(paddingBottom !== undefined && paddingBottom !== null && paddingBottom !== '' ? { paddingBottom } : {}),
      ...(paddingLeft !== undefined && paddingLeft !== null && paddingLeft !== '' ? { paddingLeft } : {}),
      ...(paddingRight !== undefined && paddingRight !== null && paddingRight !== '' ? { paddingRight } : {}),
    } : block.styles?.padding ? {
      padding: block.styles.padding
    } : {}),
    // Bordures du wrapper
    borderWidth: block.styles?.border_width || block.styles?.borderWidth,
    borderStyle: block.styles?.border_style || block.styles?.borderStyle,
    borderColor: block.styles?.border_color || block.styles?.borderColor,
    borderRadius: block.styles?.border_radius || block.styles?.borderRadius,
    // Box shadow
    boxShadow: block.styles?.box_shadow === 'sm' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' :
               block.styles?.box_shadow === 'md' ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' :
               block.styles?.box_shadow === 'lg' ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' :
               block.styles?.box_shadow === 'xl' ? '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' :
               block.styles?.box_shadow === '2xl' ? '0 25px 50px -12px rgb(0 0 0 / 0.25)' :
               block.styles?.box_shadow === 'none' ? 'none' :
               block.styles?.box_shadow || block.styles?.boxShadow || undefined,
  }

  // Styles du contenu (appliqués aux éléments internes comme boutons, textes, etc.)
  const contentStyles: React.CSSProperties = {
    // Couleur de fond - Utiliser background pour tout (évite le conflit avec backgroundColor)
    background: block.styles?.background && block.styles?.background.includes('gradient')
      ? block.styles?.background
      : block.styles?.background_color || block.styles?.backgroundColor || undefined,
    // Couleur de texte
    color: block.styles?.color,
    // Opacité
    opacity: block.styles?.opacity !== undefined ? block.styles?.opacity : 1,
    // Transform
    transform: block.styles?.transform,
    // Box shadow (support des nouvelles valeurs)
    boxShadow: block.styles?.box_shadow === 'sm' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' :
               block.styles?.box_shadow === 'md' ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' :
               block.styles?.box_shadow === 'lg' ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' :
               block.styles?.box_shadow === 'xl' ? '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' :
               block.styles?.box_shadow === '2xl' ? '0 25px 50px -12px rgb(0 0 0 / 0.25)' :
               block.styles?.box_shadow === 'none' ? 'none' :
               block.styles?.box_shadow || block.styles?.boxShadow || undefined,
    // Border radius
    borderRadius: block.styles?.border_radius || block.styles?.borderRadius,
    // Backdrop filter
    backdropFilter: block.styles?.backdrop_filter || block.styles?.backdropFilter,
    // Padding (espacement interne du contenu)
    paddingTop: block.styles?.padding_vertical || block.styles?.padding_top || block.styles?.paddingVertical,
    paddingBottom: block.styles?.padding_vertical || block.styles?.padding_bottom || block.styles?.paddingBottom,
    paddingLeft: block.styles?.padding_horizontal || block.styles?.padding_left || block.styles?.paddingLeft,
    paddingRight: block.styles?.padding_horizontal || block.styles?.padding_right || block.styles?.paddingRight,
    // Bordures
    borderWidth: block.styles?.border_width || block.styles?.borderWidth,
    borderStyle: block.styles?.border_style || block.styles?.borderStyle,
    borderColor: block.styles?.border_color || block.styles?.borderColor,
    // Alignement du texte
    textAlign: block.styles?.text_align || block.styles?.textAlign || block.styles?.text_align || 'left',
  }

  // Get layout width (système 12 colonnes Bootstrap)
  const layoutCols = typeof block.layout === 'number' ? block.layout : 12
  const layoutWidth = layoutCols === 12 ? 'w-full' :
    layoutCols === 11 ? 'w-[91.666667%]' :
    layoutCols === 10 ? 'w-[83.333333%]' :
    layoutCols === 9 ? 'w-3/4' :
    layoutCols === 8 ? 'w-2/3' :
    layoutCols === 7 ? 'w-[58.333333%]' :
    layoutCols === 6 ? 'w-1/2' :
    layoutCols === 5 ? 'w-[41.666667%]' :
    layoutCols === 4 ? 'w-1/3' :
    layoutCols === 3 ? 'w-1/4' :
    layoutCols === 2 ? 'w-1/6' :
    layoutCols === 1 ? 'w-[8.333333%]' : 'w-full'

  // Get container class
  const containerClass = block.container === 'container-fluid' ? 'w-full' :
    block.container === 'none' ? '' : 'max-w-7xl mx-auto'

  const content = (() => {
    switch (block.type) {
    case 'heading':
      const headingLevel = block.data.level || 'h2'
      const HeadingTag = headingLevel === 'h1' ? 'h1' :
                        headingLevel === 'h2' ? 'h2' :
                        headingLevel === 'h3' ? 'h3' :
                        headingLevel === 'h4' ? 'h4' : 'h2'
      const headingAlign = block.data.align || contentStyles.textAlign || 'left'
      return (
        <div className="mb-6" style={{ textAlign: headingAlign }}>
          {HeadingTag === 'h1' && <h1 className="font-bold inline-block" style={{
            ...contentStyles,
            fontSize: block.styles?.font_size || '2rem',
            fontWeight: block.styles?.font_weight || 'bold',
            marginBottom: block.styles?.margin_bottom || '1rem',
            color: block.data.color || contentStyles.color || undefined
          }}>
            {block.data.text || 'Titre'}
          </h1>}
          {HeadingTag === 'h2' && (
            <h2 className="font-bold inline-block" style={{
              ...contentStyles,
              fontSize: block.styles?.font_size || '2rem',
              fontWeight: block.styles?.font_weight || 'bold',
              marginBottom: block.styles?.margin_bottom || '1rem',
              color: block.data.color || contentStyles.color || undefined
            }}>
              {block.data.text || 'Titre'}
            </h2>
          )}
          {HeadingTag === 'h3' && (
            <h3 className="font-bold inline-block" style={{
              ...contentStyles,
              fontSize: block.styles?.font_size || '2rem',
              fontWeight: block.styles?.font_weight || 'bold',
              marginBottom: block.styles?.margin_bottom || '1rem',
              color: block.data.color || contentStyles.color || undefined
            }}>
              {block.data.text || 'Titre'}
            </h3>
          )}
          {HeadingTag === 'h4' && (
            <h4 className="font-bold inline-block" style={{
              ...contentStyles,
              fontSize: block.styles?.font_size || '2rem',
              fontWeight: block.styles?.font_weight || 'bold',
              marginBottom: block.styles?.margin_bottom || '1rem',
              color: block.data.color || contentStyles.color || undefined
            }}>
              {block.data.text || 'Titre'}
            </h4>
          )}
        </div>
      )

    case 'text':
      return (
        <div className="mb-6 prose dark:prose-invert max-w-none" style={{ textAlign: contentStyles.textAlign }}>
          <div 
            dangerouslySetInnerHTML={{ 
              __html: (block.data.content || '').replace(/\n/g, '<br />') 
            }}
            style={{
              ...contentStyles,
              fontSize: block.styles?.font_size || '1rem',
              lineHeight: block.styles?.line_height || '1.6',
            }}
          />
        </div>
      )

    case 'image':
      if (!block.data.url && !block.data.src) {
        return (
          <div className="mb-6 p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded text-center text-gray-400">
            Image non configurée
          </div>
        )
      }
      const imageUrl = block.data.url || block.data.src
      const imageAlign = block.data.align || contentStyles.textAlign || 'center'
      return (
        <div className="mb-6">
          <div style={{ textAlign: imageAlign }}>
            <img
              src={imageUrl}
              alt={block.data.alt || ''}
              className="rounded-lg shadow-md"
              style={{
                width: block.data.width ? `${block.data.width}%` : '100%',
                maxWidth: '100%',
                height: 'auto',
                display: 'inline-block',
              }}
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage non disponible%3C/text%3E%3C/svg%3E'
              }}
            />
          </div>
          {block.data.caption && (
            <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-2 text-center">
              {block.data.caption}
            </p>
          )}
        </div>
      )

    case 'button':
      const buttonSizeClass = block.data.size === 'xs' ? 'px-2 py-1 text-xs' :
                              block.data.size === 'sm' ? 'px-3 py-1.5 text-sm' :
                              block.data.size === 'lg' ? 'px-8 py-4 text-lg' :
                              block.data.size === 'xl' ? 'px-10 py-5 text-xl' :
                              'px-6 py-3'
      
      const buttonStyleClass = block.data.style === 'primary' 
        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
        : block.data.style === 'secondary'
        ? 'bg-gray-600 hover:bg-gray-700 text-white'
        : block.data.style === 'ghost'
        ? 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
        : block.data.style === 'link'
        ? 'bg-transparent text-blue-600 hover:underline'
        : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900'
      
      const buttonAlign = block.data.align || contentStyles.textAlign || 'left'
      
      return (
        <div className="mb-6" style={{ textAlign: buttonAlign }}>
          <a
            href={block.data.url || '#'}
            className={`${block.data.full_width ? 'w-full block text-center' : 'inline-block'} ${buttonSizeClass} rounded-lg font-medium transition-colors ${buttonStyleClass}`}
            style={{
              ...contentStyles,
              // Ne pas utiliser padding shorthand si on a des propriétés individuelles
              ...(block.styles?.padding && !block.styles?.padding_top && !block.styles?.padding_bottom && !block.styles?.padding_left && !block.styles?.padding_right
                ? { padding: block.styles.padding }
                : {}),
              borderRadius: contentStyles.borderRadius || block.styles?.border_radius || '0.5rem',
              backgroundColor: block.data.bg_color || contentStyles.backgroundColor || undefined,
              color: block.data.text_color || contentStyles.color || undefined,
            }}
          >
            {block.data.text || 'Bouton'}
          </a>
        </div>
      )

    case 'video':
      if (!block.data.url) {
        return (
          <div style={wrapperStyles} className="mb-6 p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded text-center text-gray-400">
            Vidéo non configurée
          </div>
        )
      }
      const videoWidth = block.data.width || 100
      const videoHeight = block.data.height || 400
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {block.data.title}
            </h3>
          )}
          <div 
            className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mx-auto"
            style={{
              width: `${videoWidth}%`,
              height: `${videoHeight}px`,
              maxWidth: '100%'
            }}
          >
            <iframe
              src={block.data.url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )

    case 'spacer':
      const spacerDirection = block.data.direction || 'vertical'
      if (spacerDirection === 'horizontal') {
        return (
          <div 
            style={{ 
              ...wrapperStyles,
              width: `${block.data.width || 40}px`,
              height: '1px',
              display: 'inline-block',
              verticalAlign: 'middle'
            }} 
            className="mb-6"
          />
        )
      }
      return (
        <div 
          style={{ 
            ...contentStyles,
            height: `${block.data.height || 40}px`,
            display: 'block'
          }} 
          className="mb-6"
        />
      )

    case 'divider':
      const dividerDirection = block.data.direction || 'horizontal'
      const dividerStyle = block.data.style === 'solid' ? 'solid' : 
                          block.data.style === 'dashed' ? 'dashed' : 
                          block.data.style === 'dotted' ? 'dotted' : 
                          block.data.style === 'double' ? 'double' : 'solid'
      
      if (dividerDirection === 'vertical') {
        const dividerHeight = block.data.height || 100
        return (
          <div style={wrapperStyles} className="mb-6 flex items-center justify-center">
            <div 
              className={`border-l-2 border-gray-400 dark:border-gray-600`}
              style={{ 
                borderStyle: dividerStyle,
                height: `${dividerHeight}px`,
                margin: block.styles?.margin || '0 1rem'
              }}
            />
          </div>
        )
      }
      
      // Horizontal divider
      const dividerWidth = block.data.width === 'full' ? '100%' : 
                          block.data.width === 'half' ? '50%' : 
                          block.data.width === 'third' ? '33%' : '100%'
      return (
        <div style={wrapperStyles} className="mb-6 flex justify-center">
          <div 
            className={`border-t-2 border-gray-400 dark:border-gray-600`}
            style={{ 
              borderStyle: dividerStyle,
              width: dividerWidth,
              margin: block.styles?.margin || '2rem 0'
            }}
          />
        </div>
      )

    case 'alert':
      const variant = block.data.variant || 'info'
      const variantStyles = {
        info: {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-200',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          ),
        },
        success: {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-800 dark:text-green-200',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
        },
        warning: {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-800 dark:text-yellow-200',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ),
        },
        error: {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-200',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ),
        },
      }
      const style = variantStyles[variant as keyof typeof variantStyles] || variantStyles.info
      
      return (
        <div style={wrapperStyles} className="mb-6">
          <div className={`${style.bg} ${style.border} border-l-4 rounded-lg p-4 ${style.text}`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {style.icon}
              </div>
              <div className="ml-3 flex-1">
                {block.data.title && (
                  <h3 className="text-sm font-semibold mb-1">
                    {block.data.title}
                  </h3>
                )}
                {block.data.message ? (
                  <p className="text-sm">{block.data.message}</p>
                ) : (
                  <p className="text-sm italic opacity-75">Aucun message configuré</p>
                )}
              </div>
              {block.data.dismissible && (
                <div className="ml-4 flex-shrink-0">
                  <button
                    type="button"
                    className={`inline-flex ${style.text} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent rounded-md`}
                    aria-label="Fermer"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )

    case 'code':
      const code = block.data.code || ''
      const language = block.data.language || 'plaintext'
      const showLineNumbers = block.data.showLineNumbers || false
      const showCopyButton = block.data.showCopyButton !== false
      
      // Fonction pour copier le code
      const handleCopyCode = async () => {
        try {
          await navigator.clipboard.writeText(code)
          // Afficher un feedback visuel temporaire
          const button = document.activeElement as HTMLElement
          if (button) {
            const originalText = button.textContent
            button.textContent = '✓ Copié!'
            button.classList.add('text-green-400')
            setTimeout(() => {
              button.textContent = originalText
              button.classList.remove('text-green-400')
            }, 2000)
          }
        } catch (err) {
          console.error('Erreur lors de la copie:', err)
        }
      }
      
      // Fonction pour obtenir le nom du langage pour affichage
      const getLanguageLabel = (lang: string) => {
        const labels: Record<string, string> = {
          javascript: 'JavaScript',
          typescript: 'TypeScript',
          python: 'Python',
          java: 'Java',
          cpp: 'C++',
          c: 'C',
          csharp: 'C#',
          php: 'PHP',
          ruby: 'Ruby',
          go: 'Go',
          rust: 'Rust',
          html: 'HTML',
          css: 'CSS',
          scss: 'SCSS',
          json: 'JSON',
          xml: 'XML',
          sql: 'SQL',
          bash: 'Bash',
          shell: 'Shell',
          yaml: 'YAML',
          markdown: 'Markdown',
          plaintext: 'Texte brut',
        }
        return labels[lang] || lang
      }
      
      return (
        <div style={wrapperStyles} className="mb-6">
          <div className="bg-gray-900 dark:bg-gray-950 rounded-lg overflow-hidden border border-gray-700 dark:border-gray-800">
            {/* Header avec langage et bouton copier */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-900 border-b border-gray-700 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span className="text-xs font-medium text-gray-300 dark:text-gray-400">
                  {getLanguageLabel(language)}
                </span>
              </div>
              {showCopyButton && code && (
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors rounded hover:bg-gray-700 dark:hover:bg-gray-800"
                  title="Copier le code"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copier
                </button>
              )}
            </div>
            
            {/* Code content */}
            <div className="relative">
              <pre className={`m-0 p-4 overflow-x-auto text-sm font-mono ${showLineNumbers ? 'pl-12' : ''}`}>
                {code ? (
                  <code className={`text-gray-100 dark:text-gray-200 ${showLineNumbers ? 'block' : ''}`}>
                    {showLineNumbers ? (
                      code.split('\n').map((line: string, index: number) => (
                        <div key={index} className="flex">
                          <span className="inline-block w-8 text-right pr-4 text-gray-500 dark:text-gray-600 select-none">
                            {index + 1}
                          </span>
                          <span className="flex-1">{line || ' '}</span>
                        </div>
                      ))
                    ) : (
                      code
                    )}
                  </code>
                ) : (
                  <span className="text-gray-500 dark:text-gray-600 italic">Aucun code configuré</span>
                )}
              </pre>
            </div>
          </div>
        </div>
      )

    case 'container':
      return (
        <div 
          style={{
            ...contentStyles,
            minHeight: block.minHeight || '200px',
            height: block.height || 'auto',
            maxHeight: block.maxHeight || 'none',
          }} 
          className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
        >
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="text-2xl mb-2">📦</div>
            <div className="text-sm font-semibold">Conteneur</div>
            <div className="text-xs mt-1">Conteneur avec largeur maximale</div>
            {block.children && block.children.length > 0 && (
              <div className="mt-4 space-y-2">
                {block.children.map((child: any, idx: number) => (
                  <div key={idx} className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    Bloc enfant {idx + 1}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    
    case 'flex-container':
      return (
        <div 
          style={{ 
            ...contentStyles, 
            display: 'flex', 
            flexDirection: block.data?.direction || 'row', 
            gap: block.data?.gap || '1rem', 
            flexWrap: block.data?.wrap || 'nowrap',
            minHeight: block.minHeight || '200px',
            height: block.height || 'auto',
            maxHeight: block.maxHeight || 'none',
          }} 
          className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
        >
          <div className="text-center text-gray-500 dark:text-gray-400 flex-1">
            <div className="text-2xl mb-2">📐</div>
            <div className="text-sm font-semibold">Flex Container</div>
            <div className="text-xs mt-1">Direction: {block.data?.direction || 'row'}</div>
            {block.children && block.children.length > 0 && (
              <div className="mt-4 space-y-2">
                {block.children.map((child: any, idx: number) => (
                  <div key={idx} className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    Bloc {idx + 1}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    
    case 'grid-container': {
      const gridColumns = block.data?.columns || 'repeat(3, 1fr)'
      const gridRows = block.data?.rows || 'auto'
      const gridGap = block.data?.gap || '1rem'
      return (
        <div 
          style={{
            ...contentStyles,
            display: 'grid',
            gridTemplateColumns: gridColumns,
            gridTemplateRows: gridRows,
            gap: gridGap,
            minHeight: block.minHeight || '200px',
            height: block.height || 'auto',
            maxHeight: block.maxHeight || 'none',
          }} 
          className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
        >
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="text-2xl mb-2">⚏</div>
            <div className="text-sm font-semibold">Grille</div>
            <div className="text-xs mt-1">Colonnes: {gridColumns}</div>
            <div className="text-xs mt-1">Lignes: {gridRows}</div>
            {block.children && block.children.length > 0 && (
              <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: gridColumns, gridTemplateRows: gridRows }}>
                {block.children.map((child: any, idx: number) => (
                  <div key={idx} className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    Bloc {idx + 1}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }
    
    case 'columns':
      const columnCount = block.data.columns_count || 2
      return (
        <div 
          style={{
            ...contentStyles,
            display: 'grid',
            gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
            gap: block.styles?.gap || '1rem',
          }}
          className="mb-6"
        >
          {block.children && block.children.length > 0 ? (
            block.children.map((childBlock: Block, i: number) => (
              <div key={childBlock.id || i} className="min-h-[100px]">
                <BlockPreviewRenderer
                  block={childBlock}
                  blockType={blockTypes?.find((bt: BlockType) => bt.name === childBlock.type)}
                  blockTypes={blockTypes}
                />
              </div>
            ))
          ) : (
            Array.from({ length: columnCount }).map((_, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800 p-4 rounded border-2 border-dashed border-gray-300 dark:border-gray-700 min-h-[100px] flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500 text-sm">Colonne {i + 1}</span>
              </div>
            ))
          )}
        </div>
      )

    case 'rows':
      const rowCount = block.data.rows_count || 2
      return (
        <div style={wrapperStyles} className="mb-6 space-y-4">
          {Array.from({ length: rowCount }).map((_, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
              Ligne {i + 1} - Les colonnes peuvent être ajoutées ici
            </div>
          ))}
        </div>
      )

    case 'table':
      const tableRows = block.data.rows || 3
      const tableCols = block.data.columns || 3
      const tableData = block.data.table_data || Array(tableRows).fill(null).map(() => Array(tableCols).fill(''))
      const hasHeader = block.data.has_header || false
      const bordered = block.data.bordered !== false
      
      return (
        <div style={wrapperStyles} className="mb-6 overflow-x-auto">
          <table className={`w-full ${bordered ? 'border border-gray-300 dark:border-gray-600' : ''}`}>
            {hasHeader && tableData.length > 0 && (
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  {tableData[0].map((cell: string, colIndex: number) => (
                    <th key={colIndex} className={`px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100 ${bordered ? 'border border-gray-300 dark:border-gray-600' : ''}`}>
                      {cell || `En-tête ${colIndex + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {(hasHeader ? tableData.slice(1) : tableData).map((row: string[], rowIndex: number) => (
                <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  {row.map((cell: string, colIndex: number) => (
                    <td key={colIndex} className={`px-4 py-2 text-gray-700 dark:text-gray-300 ${bordered ? 'border border-gray-300 dark:border-gray-600' : ''}`}>
                      {cell || `Cellule ${rowIndex + 1},${colIndex + 1}`}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'paragraph':
      return (
        <div style={wrapperStyles} className="mb-6">
          <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {block.data.content || 'Paragraphe vide'}
          </p>
        </div>
      )

    case 'line':
      return (
        <div style={wrapperStyles} className="mb-6">
          <span className="text-base text-gray-700 dark:text-gray-300">
            {block.data.text || 'Texte sur une ligne'}
          </span>
        </div>
      )

    case 'form-newsletter':
      return (
        <div style={wrapperStyles} className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          {block.data.title && (
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {block.data.title}
            </h3>
          )}
          {block.data.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {block.data.description}
            </p>
          )}
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Votre email"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {block.data.button_text || 'S\'inscrire'}
            </button>
          </form>
        </div>
      )

    case 'form-search':
      return (
        <div style={wrapperStyles} className="mb-6">
          <form className="flex gap-2">
            <input
              type="search"
              placeholder={block.data.placeholder || 'Rechercher...'}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {block.data.button_text || 'Rechercher'}
            </button>
          </form>
        </div>
      )

    case 'form-inscription':
      return (
        <div style={wrapperStyles} className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          {block.data.title && (
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {block.data.title}
            </h3>
          )}
          <form className="space-y-4">
            {block.data.show_name !== false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            {block.data.show_email !== false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            {block.data.show_password !== false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            {block.data.show_phone && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            {block.data.enable_captcha && (
              <div className="mt-4">
                <Captcha
                  onVerify={(isValid) => {
                    // La validation est gérée par le composant Captcha lui-même
                  }}
                  theme={block.data.captcha_theme || 'light'}
                />
              </div>
            )}
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {block.data.button_text || 'S\'inscrire'}
            </button>
          </form>
        </div>
      )

    case 'testimonials':
      const testimonials = block.data.testimonials || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.title && (
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
              {block.data.title}
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial: any, index: number) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                {testimonial.avatar && (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                  />
                )}
                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                  "{testimonial.content || 'Témoignage...'}"
                </p>
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {testimonial.name || 'Nom'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role || 'Rôle'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )

    case 'pricing': {
      const PricingPreview = () => {
        const [plans, setPlans] = useState<any[]>(block.data.plans || [])
        const [loading, setLoading] = useState(false)
        
        useEffect(() => {
          if (block.data.source === 'dynamic' || block.data.source === 'api') {
            setLoading(true)
            const apiUrl = block.data.api_endpoint || '/api/billing/pricing-plans/'
            // Use absolute URL for API calls
            const fullUrl = apiUrl.startsWith('http') ? apiUrl : `${window.location.origin}${apiUrl}`
            fetch(fullUrl, {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              credentials: 'include',
            })
              .then(async res => {
                if (!res.ok) {
                  // Si c'est une erreur 401/403, ne pas essayer de parser en JSON
                  if (res.status === 401 || res.status === 403) {
                    const text = await res.text()
                    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
                      throw new Error('Authentification requise')
                    }
                  }
                  throw new Error(`HTTP error! status: ${res.status}`)
                }
                const contentType = res.headers.get('content-type') || ''
                // Vérifier que c'est bien du JSON
                if (!contentType.includes('application/json')) {
                  const text = await res.text()
                  // Si c'est du HTML, c'est probablement une page de login ou d'erreur
                  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
                    throw new Error('Réponse HTML reçue au lieu de JSON (authentification requise?)')
                  }
                  throw new Error(`Response is not JSON (Content-Type: ${contentType})`)
                }
                return res.json()
              })
              .then(data => {
                const plansData = Array.isArray(data) ? data : (data.results || data.plans || [])
                setPlans(plansData.filter((p: any) => p.is_active).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)))
              })
              .catch(err => {
                // Ne logger l'erreur que si ce n'est pas une erreur d'authentification attendue
                if (!err.message.includes('Authentification requise') && !err.message.includes('Réponse HTML')) {
                  console.error('Erreur chargement plans:', err)
                }
                setPlans([])
              })
              .finally(() => setLoading(false))
          }
        }, [block.data.source, block.data.api_endpoint])
        
        const formatPrice = (price: number) => {
          return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)
        }
        
        return (
          <div style={wrapperStyles} className="mb-6">
            {block.data.show_title !== false && block.data.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
                {block.data.title}
              </h2>
            )}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : plans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map((plan: any, index: number) => {
                  // Calculer le prix pour l'affichage
                  const priceMonthly = parseFloat(plan.price_monthly || plan.price || 0)
                  const priceYearly = plan.price_yearly ? parseFloat(plan.price_yearly) : null
                  
                  // Déterminer le style du bouton
                  const buttonStyle = plan.button_style || (plan.is_featured ? 'primary' : 'secondary')
                  const buttonStylesMap: Record<string, string> = {
                    primary: 'bg-blue-600 text-white hover:bg-blue-700',
                    secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600',
                    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900'
                  }
                  const buttonClasses = buttonStylesMap[buttonStyle] || buttonStylesMap.primary
                  
                  // URL du bouton
                  const buttonUrl = plan.button_url || `/register?plan=${plan.slug || plan.id || index}`
                  const buttonText = plan.button_text || `Choisir ${plan.name || 'ce plan'}`
                  
                  return (
                    <div
                      key={plan.id || index}
                      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 relative ${
                        plan.is_featured ? 'ring-4 ring-blue-500 scale-105' : ''
                      }`}
                    >
                      {/* Badge personnalisé ou POPULAIRE par défaut si featured */}
                      {(plan.badge || plan.is_featured) && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                            {plan.badge || 'POPULAIRE'}
                          </span>
                        </div>
                      )}
                      
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {plan.name || `Plan ${index + 1}`}
                      </h3>
                      
                      {plan.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>
                      )}
                      
                      <div className="mb-6">
                        {priceMonthly > 0 ? (
                          <>
                            <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
                              {formatPrice(priceMonthly)}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">/mois</span>
                            {priceYearly && priceYearly > 0 && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                ou {formatPrice(priceYearly)}/an 
                                {priceMonthly > 0 && (
                                  <span className="ml-1">
                                    (-{Math.round((1 - (priceYearly / (priceMonthly * 12))) * 100)}%)
                                  </span>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                            Gratuit
                          </span>
                        )}
                      </div>
                      
                      <ul className="space-y-3 mb-8">
                        {/* Fonctionnalités personnalisées */}
                        {plan.features && plan.features.length > 0 ? (
                          plan.features.map((feature: string, i: number) => (
                            feature && (
                              <li key={i} className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                              </li>
                            )
                          ))
                        ) : (
                          // Fonctionnalités par défaut si aucune n'est définie (pour compatibilité API)
                          <>
                            {plan.max_sites && (
                              <li className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                <span className="text-gray-700 dark:text-gray-300">{plan.max_sites} site{(plan.max_sites || 1) > 1 ? 's' : ''}</span>
                              </li>
                            )}
                            {plan.max_users && (
                              <li className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                <span className="text-gray-700 dark:text-gray-300">{plan.max_users} utilisateur{(plan.max_users || 1) > 1 ? 's' : ''} max</span>
                              </li>
                            )}
                            {plan.max_storage_gb && (
                              <li className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                <span className="text-gray-700 dark:text-gray-300">{plan.max_storage_gb} GB de stockage</span>
                              </li>
                            )}
                          </>
                        )}
                      </ul>
                      
                      {buttonText && buttonUrl && (
                        <a
                          href={buttonUrl}
                          className={`block w-full text-center py-3 rounded-lg font-bold transition-colors ${buttonClasses}`}
                        >
                          {buttonText}
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                Aucun plan tarifaire disponible
              </div>
            )}
          </div>
        )
      }
      return <PricingPreview />
    }

    case 'timeline':
      const events = block.data.events || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.title && (
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
              {block.data.title}
            </h2>
          )}
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600 transform md:-translate-x-1/2"></div>
            {events.map((event: any, index: number) => (
              <div key={index} className="relative mb-8 md:flex md:items-center">
                <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8 md:ml-auto'}`}>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">
                      {event.date || 'Date'}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {event.title || 'Titre'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {event.description || 'Description'}
                    </p>
                  </div>
                </div>
                <div className="absolute left-4 md:left-1/2 w-8 h-8 bg-blue-600 rounded-full border-4 border-white dark:border-gray-800 transform md:-translate-x-1/2 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pl-8' : 'md:pr-8 md:text-right'}`}></div>
              </div>
            ))}
          </div>
        </div>
      )

    case 'accordion':
      const accordionItems = block.data.items || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.title && (
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
              {block.data.title}
            </h2>
          )}
          <div className="space-y-2">
            {accordionItems.map((item: any, index: number) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700">
                  {item.title || `Élément ${index + 1}`}
                </div>
                <div className="px-6 py-4 text-gray-700 dark:text-gray-300">
                  {item.content || 'Contenu...'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )

    case 'stats':
      const stats = block.data.stats || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.title && (
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
              {block.data.title}
            </h2>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat: any, index: number) => (
              <div key={index} className="text-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                {stat.icon && (
                  <div className="text-4xl mb-2">{stat.icon}</div>
                )}
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.value || '0'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label || 'Label'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )

    case 'social-links':
      const socialLinks = block.data.links || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.title && (
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
              {block.data.title}
            </h2>
          )}
          <div className="flex flex-wrap justify-center gap-4">
            {socialLinks.map((link: any, index: number) => (
              <a
                key={index}
                href={link.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {link.icon && <span className="text-xl">{link.icon}</span>}
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {link.platform || 'Plateforme'}
                </span>
              </a>
            ))}
          </div>
        </div>
      )

    case 'booking-form':
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.title && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {block.data.title}
            </h2>
          )}
          <form className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 space-y-4">
            {block.data.show_pickup !== false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Point de prise en charge
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Adresse de départ"
                />
              </div>
            )}
            {block.data.show_dropoff !== false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Point de destination
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Adresse d'arrivée"
                />
              </div>
            )}
            {block.data.show_date !== false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date et heure
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            {block.data.show_passengers && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre de passagers
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            {block.data.show_vehicle && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type de véhicule
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Berline</option>
                  <option>Van</option>
                  <option>Luxe</option>
                </select>
              </div>
            )}
            {block.data.show_phone !== false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
            )}
            {block.data.show_notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes spéciales
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Informations supplémentaires..."
                />
              </div>
            )}
            {block.data.enable_captcha && (
              <div className="mt-4">
                <Captcha
                  onVerify={(isValid) => {
                    // La validation est gérée par le composant Captcha lui-même
                  }}
                  theme={block.data.captcha_theme || 'light'}
                />
              </div>
            )}
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {block.data.button_text || 'Réserver'}
            </button>
          </form>
        </div>
      )

    case 'pricing-table':
      const pricingRows = block.data.rows || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.title && (
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
              {block.data.title}
            </h2>
          )}
          <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Trajet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Prix</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Durée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {pricingRows.length > 0 ? (
                  pricingRows.map((row: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {row.route || 'Trajet'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {row.price || 'Prix'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {row.duration || 'Durée'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      Aucun tarif configuré
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )

    case 'service-zones':
      const zones = block.data.zones || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.title && (
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
              {block.data.title}
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zones.length > 0 ? (
              zones.map((zone: any, index: number) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
                  {zone.icon && (
                    <div className="text-4xl mb-3">{zone.icon}</div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {zone.name || 'Zone'}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {zone.description || 'Description de la zone'}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
                Aucune zone configurée
              </div>
            )}
          </div>
        </div>
      )

    case 'vehicle-gallery':
      const vehicles = block.data.vehicles || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.title && (
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
              {block.data.title}
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.length > 0 ? (
              vehicles.map((vehicle: any, index: number) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {vehicle.image ? (
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="w-full h-48 object-cover"
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EVéhicule%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400">Image</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {vehicle.name || 'Véhicule'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {vehicle.description || 'Description du véhicule'}
                    </p>
                    {vehicle.features && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {vehicle.features}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
                Aucun véhicule configuré
              </div>
            )}
          </div>
        </div>
      )

    case 'contact-buttons':
      const contacts = block.data.contacts || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.title && (
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-6">
              {block.data.title}
            </h2>
          )}
          <div className="flex flex-wrap justify-center gap-4">
            {contacts.length > 0 ? (
              contacts.map((contact: any, index: number) => {
                const getHref = () => {
                  switch (contact.type) {
                    case 'phone':
                      return `tel:${contact.value}`
                    case 'whatsapp':
                      return `https://wa.me/${contact.value.replace(/[^0-9]/g, '')}`
                    case 'email':
                      return `mailto:${contact.value}`
                    case 'sms':
                      return `sms:${contact.value}`
                    default:
                      return '#'
                  }
                }
                return (
                  <a
                    key={index}
                    href={getHref()}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {contact.icon && <span className="text-xl">{contact.icon}</span>}
                    <span>{contact.label || contact.type}</span>
                  </a>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded w-full">
                Aucun contact configuré
              </div>
            )}
          </div>
        </div>
      )

    case 'map':
      const mapAddress = block.data.address || ''
      const mapHeight = block.data.height || 400
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.title && (
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-6">
              {block.data.title}
            </h2>
          )}
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600" style={{ height: `${mapHeight}px` }}>
            {mapAddress ? (
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(mapAddress)}`}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p>Configurez une adresse pour afficher la carte</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )

    case 'badges':
      const badges = block.data.badges || []
      const getBadgeColor = (color: string) => {
        const colors: Record<string, string> = {
          blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
          gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        }
        return colors[color] || colors.blue
      }
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.title && (
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-6">
              {block.data.title}
            </h2>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            {badges.length > 0 ? (
              badges.map((badge: any, index: number) => (
                <div
                  key={index}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${getBadgeColor(badge.color || 'blue')}`}
                >
                  {badge.icon && <span className="text-lg">{badge.icon}</span>}
                  <span>{badge.text || 'Badge'}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded w-full">
                Aucun badge configuré
              </div>
            )}
          </div>
        </div>
      )

    case 'gallery':
      const images = block.data.images || []
      const galleryColumns = block.data.columns || 3
      return (
        <div style={wrapperStyles} className="mb-6">
          <div 
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${galleryColumns}, 1fr)`,
            }}
          >
            {images.length > 0 ? (
              images.map((img: string, i: number) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                  <img
                    src={img}
                    alt={`Image ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage%3C/text%3E%3C/svg%3E'
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
                Aucune image dans la galerie
              </div>
            )}
          </div>
        </div>
      )

    case 'form':
      const formFields = block.data.fields || []
      return (
        <div style={wrapperStyles} className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          {block.data.title && (
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">{block.data.title}</h3>
          )}
          <form className="space-y-4">
            {formFields.length > 0 ? (
              formFields.map((field: any, i: number) => (
                <div key={i}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {field.label || 'Champ'}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      placeholder={field.placeholder || ''}
                      disabled
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={field.placeholder || ''}
                      disabled
                    />
                  )}
                </div>
              ))
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input type="email" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                  <textarea className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" rows={4} disabled />
                </div>
              </>
            )}
            {block.data.enable_captcha && (
              <div className="mt-4">
                <Captcha
                  onVerify={(isValid) => {
                    // La validation est gérée par le composant Captcha lui-même
                  }}
                  theme={block.data.captcha_theme || 'light'}
                />
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              disabled
            >
              {block.data.submit_text || 'Envoyer'}
            </button>
          </form>
        </div>
      )

    case 'accordion':
      const items = block.data.items || []
      return (
        <div style={wrapperStyles} className="mb-6">
          <div className="space-y-2">
            {items.length > 0 ? (
              items.map((item: any, i: number) => (
                <details
                  key={i}
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <summary className="p-4 cursor-pointer font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    {item.title || `Élément ${i + 1}`}
                  </summary>
                  <div className="p-4 pt-0 text-gray-700 dark:text-gray-300">
                    {item.content || 'Contenu...'}
                  </div>
                </details>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
                Aucun élément d'accordéon
              </div>
            )}
          </div>
        </div>
      )

    case 'tabs':
      const tabs = block.data.tabs || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {tabs.length > 0 ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                {tabs.map((tab: any, i: number) => (
                  <button
                    key={i}
                    className={`px-4 py-2 font-medium text-sm transition-colors ${
                      i === 0
                        ? 'bg-white dark:bg-gray-900 text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                    disabled
                  >
                    {tab.title || `Onglet ${i + 1}`}
                  </button>
                ))}
              </div>
              <div className="p-4 bg-white dark:bg-gray-900">
                {tabs[0]?.content || 'Contenu de l\'onglet...'}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
              Aucun onglet
            </div>
          )}
        </div>
      )

    case 'hero':
      const heroBg = block.data.background_type === 'gradient' && block.data.background_gradient
        ? `linear-gradient(to ${block.data.background_gradient.includes('to-') ? block.data.background_gradient.split('to-')[1] : 'right'}, ${block.data.background_gradient.includes('from-') ? block.data.background_gradient.split('from-')[1].split(' ')[0] : '#667eea'}, ${block.data.background_gradient.includes('via-') ? block.data.background_gradient.split('via-')[1].split(' ')[0] : '#764ba2'}, ${block.data.background_gradient.includes('to-') ? block.data.background_gradient.split('to-')[1].split(' ')[0] : '#764ba2'})`
        : block.data.background_image
        ? `url(${block.data.background_image})`
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      
      const heroButtons = block.data.buttons || (block.data.button_text ? [{ text: block.data.button_text, url: block.data.button_url, style: 'primary' }] : [])
      
      return (
        <div 
          style={{
            // Copier wrapperStyles sans les propriétés de padding et color pour éviter les conflits
            // (la couleur doit être appliquée uniquement au contenu, pas au conteneur)
            ...Object.fromEntries(
              Object.entries(wrapperStyles).filter(([key]) => 
                !['padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'color'].includes(key)
              )
            ),
            background: heroBg,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            // Utiliser les propriétés individuelles au lieu de padding shorthand
            paddingTop: block.styles?.padding_top || block.styles?.padding_vertical || '5rem',
            paddingRight: block.styles?.padding_right || block.styles?.padding_horizontal || '2rem',
            paddingBottom: block.styles?.padding_bottom || block.styles?.padding_vertical || '8rem',
            paddingLeft: block.styles?.padding_left || block.styles?.padding_horizontal || '2rem',
            textAlign: block.styles?.text_align || 'center',
            minHeight: '400px',
          }}
          className="mb-6 relative rounded-lg overflow-hidden"
        >
          {block.data.overlay && (
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          )}
          <div className="relative z-10" style={{ color: block.styles?.color || '#ffffff' }}>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">{block.data.title || 'Titre Hero'}</h1>
            {block.data.subtitle && (
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">{block.data.subtitle}</p>
            )}
            {heroButtons.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {heroButtons.map((btn: any, index: number) => (
                  <a
                    key={index}
                    href={btn.url || '#'}
                    className={`px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-xl ${
                      btn.style === 'primary'
                        ? 'bg-white text-blue-600 hover:bg-blue-50'
                        : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border border-white/30'
                    }`}
                  >
                    {btn.text}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )

    case 'features-grid':
      const features = block.data.features || []
      const columns = block.data.columns || 3
      // Déterminer les classes de grille en fonction du nombre de colonnes
      const gridClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      }[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.title && (
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
              {block.data.title}
            </h2>
          )}
          <div className={`grid ${gridClasses} gap-8`}>
            {features.length > 0 ? (
              features.map((feature: any, i: number) => (
                <div key={i} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="text-5xl mb-4">{feature.icon || '✨'}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {feature.title || `Fonctionnalité ${i + 1}`}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description || 'Description...'}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
                Aucune fonctionnalité
              </div>
            )}
          </div>
        </div>
      )

    case 'cta-section':
      return (
        <div
          style={{
            // Copier contentStyles sans les propriétés de padding pour éviter les conflits
            ...Object.fromEntries(
              Object.entries(contentStyles).filter(([key]) => 
                !['padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'].includes(key)
              )
            ),
            background: block.data.background_gradient || 'linear-gradient(to right, #2563eb, #9333ea)',
            // Ne pas utiliser padding shorthand si on a des propriétés individuelles
            ...(block.styles?.padding && !block.styles?.padding_top && !block.styles?.padding_bottom && !block.styles?.padding_left && !block.styles?.padding_right
              ? { padding: block.styles.padding }
              : {
                  paddingTop: block.styles?.padding_top || block.styles?.padding_vertical || '5rem',
                  paddingRight: block.styles?.padding_right || block.styles?.padding_horizontal || '2rem',
                  paddingBottom: block.styles?.padding_bottom || block.styles?.padding_vertical || '5rem',
                  paddingLeft: block.styles?.padding_left || block.styles?.padding_horizontal || '2rem',
                }),
          }}
          className="mb-6 rounded-lg"
        >
          <div className="max-w-4xl mx-auto text-center">
            {block.data.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {block.data.title}
              </h2>
            )}
            {block.data.description && (
              <p className="text-xl text-white/90 mb-8">
                {block.data.description}
              </p>
            )}
            {block.data.button_text && block.data.button_url && (
              <a
                href={block.data.button_url}
                className={`inline-block px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-xl ${
                  block.data.button_style === 'dark'
                    ? 'bg-white text-gray-900 hover:bg-gray-100'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                {block.data.button_text}
              </a>
            )}
          </div>
        </div>
      )

    case 'contact-form':
      return (
        <div style={wrapperStyles} className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {block.data.title && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {block.data.title}
            </h2>
          )}
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom complet *
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>
            {block.data.show_subject !== false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sujet *
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100">
                  <option>Sélectionnez un sujet</option>
                  <option>Support technique</option>
                  <option>Question commerciale</option>
                  <option>Question de facturation</option>
                  <option>Suggestion de fonctionnalité</option>
                  <option>Autre</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message *
              </label>
              <textarea
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {block.data.submit_text || 'Envoyer le message'}
            </button>
          </form>
        </div>
      )

    case 'faq-section':
      const faqItems = block.data.items || []
      return (
        <FAQSectionPreview 
          title={block.data.title}
          items={faqItems}
          wrapperStyles={wrapperStyles}
        />
      )

    case 'banner':
      return (
        <div
          style={{
            // Copier wrapperStyles sans les propriétés de padding pour éviter les conflits
            ...Object.fromEntries(
              Object.entries(wrapperStyles).filter(([key]) => 
                !['padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'].includes(key)
              )
            ),
            backgroundImage: block.data.background_image ? `url(${block.data.background_image})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: `${block.data.min_height || 400}px`,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: block.data.text_align === 'left' ? 'flex-start' : block.data.text_align === 'right' ? 'flex-end' : 'center',
            // Ne pas utiliser padding shorthand si on a des propriétés individuelles
            ...(block.styles?.padding && !block.styles?.padding_top && !block.styles?.padding_bottom && !block.styles?.padding_left && !block.styles?.padding_right
              ? { padding: block.styles.padding }
              : {
                  paddingTop: block.styles?.padding_top || block.styles?.padding_vertical || '4rem',
                  paddingRight: block.styles?.padding_right || block.styles?.padding_horizontal || '2rem',
                  paddingBottom: block.styles?.padding_bottom || block.styles?.padding_vertical || '4rem',
                  paddingLeft: block.styles?.padding_left || block.styles?.padding_horizontal || '2rem',
                }),
          }}
          className="mb-6 rounded-lg overflow-hidden"
        >
          {block.data.overlay && (
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          )}
          <div className="relative z-10 text-white w-full">
            {block.data.title && (
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{block.data.title}</h1>
            )}
            {block.data.subtitle && (
              <p className="text-xl mb-6">{block.data.subtitle}</p>
            )}
            {block.data.button_text && block.data.button_url && (
              <a
                href={block.data.button_url}
                className="inline-block px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                {block.data.button_text}
              </a>
            )}
          </div>
        </div>
      )

    case 'header':
      const headerLinks = block.data.links || []
      const logoText = block.data.logo_text || 'VTCBuilder'
      const logoUrl = block.data.logo_url || '/'
      const showThemeToggle = block.data.show_theme_toggle !== false
      
      return (
        <header 
          style={{
            ...wrapperStyles,
            position: block.data.sticky ? 'sticky' : 'static',
            top: block.data.sticky ? '0' : undefined,
            zIndex: block.data.sticky ? 50 : undefined,
          }}
          className={`mb-6 ${block.data.sticky ? 'sticky top-0 z-50' : ''} ${
            block.styles?.background_color || block.styles?.backgroundColor
              ? ''
              : 'bg-white/95 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <a href={logoUrl} className="flex items-center space-x-2">
                {block.data.logo_image && (
                  <img src={block.data.logo_image} alt={logoText} className="h-8 w-auto" />
                )}
                <h1 className={`text-2xl font-bold ${
                  block.styles?.color || 'text-gray-900 dark:text-white'
                }`}>
                  {logoText}
                </h1>
                {block.data.badge && (
                  <span className={`text-xs ${
                    block.styles?.color || 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {block.data.badge}
                  </span>
                )}
              </a>
              <div className="flex items-center space-x-4">
                {showThemeToggle && (
                  <button
                    className={`p-2 rounded-lg transition-colors ${
                      block.styles?.color || 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    title="Toggle theme"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </button>
                )}
                {headerLinks.length > 0 ? (
                  <nav className="hidden md:flex items-center space-x-6">
                    {headerLinks.map((link: any, index: number) => (
                      <a
                        key={index}
                        href={link.url || '#'}
                        className={`font-medium transition-colors ${link.custom_class || ''} ${
                          !link.color && !link.custom_class
                            ? (block.styles?.color || 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100')
                            : ''
                        }`}
                        style={{
                          color: link.color || undefined,
                          fontSize: link.font_size || undefined,
                          fontWeight: link.font_weight || undefined,
                          ...(link.hover_color ? {
                            '--hover-color': link.hover_color,
                          } as React.CSSProperties : {}),
                        } as React.CSSProperties}
                        onMouseEnter={(e) => {
                          if (link.hover_color) {
                            e.currentTarget.style.color = link.hover_color
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (link.color) {
                            e.currentTarget.style.color = link.color
                          }
                        }}
                      >
                        {link.label || `Lien ${index + 1}`}
                      </a>
                    ))}
                  </nav>
                ) : (
                  <div className="text-sm text-gray-400 dark:text-gray-500">
                    Aucun lien configuré
                  </div>
                )}
                {block.data.cta_button && (
                  <a
                    href={block.data.cta_button.url || '#'}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      block.data.cta_button.style === 'primary'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {block.data.cta_button.text || 'Action'}
                  </a>
                )}
              </div>
            </div>
          </div>
        </header>
      )
    
    case 'footer':
      const footerColumns = block.data.columns || []
      return (
        <footer style={wrapperStyles} className="mb-6 bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {footerColumns.length > 0 ? (
                footerColumns.map((column: any, colIndex: number) => (
                  <div key={colIndex}>
                    {column.title && (
                      <h3 className={`${colIndex === 0 ? 'text-xl' : 'font-bold'} mb-4`}>
                        {column.title}
                      </h3>
                    )}
                    {column.description && (
                      <p className="text-gray-400 mb-4">{column.description}</p>
                    )}
                    {(column.links || []).length > 0 && (
                      <ul className="space-y-2 text-gray-400">
                        {column.links.map((link: any, linkIndex: number) => (
                          <li key={linkIndex}>
                            <a
                              href={link.url || '#'}
                              className="hover:text-white transition-colors"
                            >
                              {link.label || 'Lien'}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-400 border-2 border-dashed border-gray-700 rounded">
                  Aucune colonne configurée
                </div>
              )}
            </div>
            {(block.data.copyright || block.data.additional_text) && (
              <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                {block.data.copyright && <p>{block.data.copyright}</p>}
                {block.data.additional_text && (
                  <p className="mt-2 text-sm">{block.data.additional_text}</p>
                )}
              </div>
            )}
          </div>
        </footer>
      )

    case 'section':
      return (
        <div
          style={{
            ...contentStyles,
            backgroundImage: block.data.background_image ? `url(${block.data.background_image})` : undefined,
            backgroundSize: block.data.background_size || 'cover',
            backgroundPosition: block.data.background_position || 'center',
            position: 'relative',
            // Ne pas utiliser padding shorthand si on a des propriétés individuelles
            ...(block.styles?.padding && !block.styles?.padding_top && !block.styles?.padding_bottom && !block.styles?.padding_left && !block.styles?.padding_right
              ? { padding: block.styles.padding }
              : {
                  paddingTop: block.styles?.padding_top || block.styles?.padding_vertical || '2rem',
                  paddingRight: block.styles?.padding_right || block.styles?.padding_horizontal || '2rem',
                  paddingBottom: block.styles?.padding_bottom || block.styles?.padding_vertical || '2rem',
                  paddingLeft: block.styles?.padding_left || block.styles?.padding_horizontal || '2rem',
                }),
            minHeight: block.styles?.min_height || 'auto',
          }}
          className="mb-6 rounded-lg"
        >
          {block.data.overlay && block.data.background_image && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg"></div>
          )}
          <div className="relative z-10">
            {block.children && block.children.length > 0 ? (
              block.children.map((childBlock: Block, i: number) => (
                <div key={childBlock.id || i}>
                  <BlockPreviewRenderer
                    block={childBlock}
                    blockType={blockTypes?.find((bt: BlockType) => bt.name === childBlock.type)}
                    blockTypes={blockTypes}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded">
                Ajoutez des blocs dans cette section
              </div>
            )}
          </div>
        </div>
      )

    case 'carousel':
      const carouselItems = block.data.items || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {carouselItems.length > 0 ? (
            <div className="relative overflow-hidden rounded-lg">
              <div className="flex transition-transform duration-500" style={{ transform: `translateX(0)` }}>
                {carouselItems.map((item: any, index: number) => (
                  <div key={index} className="min-w-full relative">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title || `Slide ${index + 1}`}
                        className="w-full h-96 object-cover"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%23ddd" width="800" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ESlide%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    )}
                    {(item.title || item.description) && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                        {item.title && <h3 className="text-2xl font-bold mb-2">{item.title}</h3>}
                        {item.description && <p>{item.description}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
              Aucun élément dans le carousel
            </div>
          )}
        </div>
      )

    case 'countdown':
      const targetDate = block.data.target_date ? new Date(block.data.target_date).getTime() : null
      const now = Date.now()
      const timeLeft = targetDate && targetDate > now ? targetDate - now : 0
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)
      
      return (
        <div style={wrapperStyles} className="mb-6 bg-gradient-to-br from-blue-600 to-purple-600 text-white p-8 rounded-lg text-center">
          {block.data.title && (
            <h3 className="text-2xl font-bold mb-6">{block.data.title}</h3>
          )}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{days}</div>
              <div className="text-sm opacity-90">Jours</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{hours}</div>
              <div className="text-sm opacity-90">Heures</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{minutes}</div>
              <div className="text-sm opacity-90">Minutes</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">{seconds}</div>
              <div className="text-sm opacity-90">Secondes</div>
            </div>
          </div>
        </div>
      )

    case 'progress-bar':
      const percentage = Math.min(100, Math.max(0, block.data.percentage || 0))
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.label && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{block.data.label}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{percentage}%</span>
            </div>
          )}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percentage}%`,
                backgroundColor: block.data.color || '#3B82F6',
              }}
            />
          </div>
        </div>
      )

    case 'quote':
      return (
        <div style={wrapperStyles} className="mb-6">
          <blockquote 
            className={`border-l-4 ${block.data.color || 'border-blue-500'} pl-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-r-lg`}
            style={contentStyles}
          >
            <p className={`text-lg italic text-gray-800 dark:text-gray-200 mb-2`}>
              "{block.data.text || 'Citation...'}"
            </p>
            {block.data.author && (
              <footer className="text-sm text-gray-600 dark:text-gray-400">
                — {block.data.author}
              </footer>
            )}
          </blockquote>
        </div>
      )

    case 'icon-box':
      return (
        <div style={wrapperStyles} className="mb-6">
          <div 
            className={`p-6 rounded-lg border-2 ${block.data.border_color || 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-center`}
            style={contentStyles}
          >
            {block.data.icon && (
              <div className="text-5xl mb-4">{block.data.icon}</div>
            )}
            {block.data.title && (
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {block.data.title}
              </h3>
            )}
            {block.data.description && (
              <p className="text-gray-600 dark:text-gray-400">
                {block.data.description}
              </p>
            )}
          </div>
        </div>
      )

    case 'feature-card':
      return (
        <div style={wrapperStyles} className="mb-6">
          <div 
            className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow"
            style={contentStyles}
          >
            {block.data.icon && (
              <div className="text-5xl mb-4">{block.data.icon}</div>
            )}
            {block.data.title && (
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {block.data.title}
              </h3>
            )}
            {block.data.description && (
              <p className="text-gray-600 dark:text-gray-400">
                {block.data.description}
              </p>
            )}
            {block.data.link_url && block.data.link_text && (
              <a 
                href={block.data.link_url}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium mt-4 inline-block"
              >
                {block.data.link_text} →
              </a>
            )}
          </div>
        </div>
      )

    case 'video-embed':
      const videoUrl = block.data.url || ''
      const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')
      const isVimeo = videoUrl.includes('vimeo.com')
      
      let embedUrl = ''
      if (isYouTube) {
        const youtubeId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
        if (youtubeId) embedUrl = `https://www.youtube.com/embed/${youtubeId}`
      } else if (isVimeo) {
        const vimeoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1]
        if (vimeoId) embedUrl = `https://player.vimeo.com/video/${vimeoId}`
      }
      
      return (
        <div style={wrapperStyles} className="mb-6">
          {embedUrl ? (
            <div className="relative w-full" style={{ paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src={embedUrl}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : videoUrl ? (
            <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded text-center text-gray-400">
              URL vidéo non supportée. Utilisez YouTube ou Vimeo.
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded text-center text-gray-400">
              Aucune vidéo configurée
            </div>
          )}
        </div>
      )

    case 'team-member':
      return (
        <div style={wrapperStyles} className="mb-6">
          <div 
            className="text-center p-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            style={contentStyles}
          >
            {block.data.avatar && (
              <img
                src={block.data.avatar}
                alt={block.data.name || 'Membre'}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96"%3E%3Crect fill="%23ddd" width="96" height="96" rx="48"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="32" dy="33" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E?%3C/text%3E%3C/svg%3E'
                }}
              />
            )}
            {block.data.name && (
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {block.data.name}
              </h3>
            )}
            {block.data.role && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                {block.data.role}
              </p>
            )}
            {block.data.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {block.data.bio}
              </p>
            )}
            {block.data.social_links && Array.isArray(block.data.social_links) && block.data.social_links.length > 0 && (
              <div className="flex justify-center gap-3">
                {block.data.social_links.map((link: any, i: number) => (
                  <a
                    key={i}
                    href={link.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.icon || '🔗'}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )

    case 'logo-grid': {
      const logos = block.data.logos || []
      const logoColumns = block.data.columns || 4
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.title && (
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-6">
              {block.data.title}
            </h2>
          )}
          <div 
            className="grid gap-6 items-center justify-items-center"
            style={{
              gridTemplateColumns: `repeat(${logoColumns}, 1fr)`,
            }}
          >
            {logos.length > 0 ? (
              logos.map((logo: any, i: number) => (
                <div key={i} className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100">
                  {logo.url ? (
                    <img
                      src={logo.url}
                      alt={logo.alt || `Logo ${i + 1}`}
                      className="max-h-12 max-w-full object-contain"
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="60"%3E%3Crect fill="%23ddd" width="120" height="60"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="12" dy="20" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ELogo%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  ) : (
                    <div className="w-24 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400 text-xs">
                      Logo
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
                Aucun logo configuré
              </div>
            )}
          </div>
        </div>
      )
    }

    case 'card': {
      const cards = block.data.cards || []
      const cardColumns = block.data.columns || 3
      const gridColsClass = cardColumns === 1 ? 'md:grid-cols-1' : cardColumns === 2 ? 'md:grid-cols-2' : cardColumns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'
      return (
        <div style={wrapperStyles} className="mb-6">
          <div className={`grid grid-cols-1 ${gridColsClass} gap-6`}>
            {cards.length > 0 ? (
              cards.map((card: any, index: number) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                  {card.image && (
                    <img
                      src={card.image}
                      alt={card.title || `Card ${index + 1}`}
                      className="w-full h-48 object-cover"
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  )}
                  <div className="p-6">
                    {card.title && (
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{card.title}</h3>
                    )}
                    {card.description && (
                      <p className="text-gray-700 dark:text-gray-300 mb-4">{card.description}</p>
                    )}
                    {card.button_text && card.button_url && (
                      <a
                        href={card.button_url}
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {card.button_text}
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
                Aucune carte configurée
              </div>
            )}
          </div>
        </div>
      )
    }

    case 'tabs': {
      const tabs = block.data.tabs || []
      // Utiliser un composant séparé pour gérer l'état
      const TabsPreview = () => {
        const [activeTab, setActiveTab] = useState(0)
        return (
          <div style={wrapperStyles} className="mb-6">
            {tabs.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                  {tabs.map((tab: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setActiveTab(index)}
                      className={`px-6 py-3 font-medium text-sm transition-colors ${
                        activeTab === index
                          ? 'bg-white dark:bg-gray-900 text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      {tab.title || `Onglet ${index + 1}`}
                    </button>
                  ))}
                </div>
                <div className="p-6">
                  <p className="text-gray-700 dark:text-gray-300">{tabs[activeTab]?.content || 'Contenu...'}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
                Aucun onglet configuré
              </div>
            )}
          </div>
        )
      }
      return <TabsPreview />
    }

    case 'rating':
      const rating = block.data.rating || 5
      const ratingSize = block.data.size || 'medium'
      const sizeClass = ratingSize === 'small' ? 'text-lg' : ratingSize === 'large' ? 'text-3xl' : 'text-2xl'
      return (
        <div style={wrapperStyles} className="mb-6 text-center">
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className={sizeClass}>
                {star <= rating ? '⭐' : '☆'}
              </span>
            ))}
          </div>
          {block.data.show_text !== false && block.data.text && (
            <p className="mt-2 text-gray-700 dark:text-gray-300">{block.data.text}</p>
          )}
        </div>
      )

    case 'breadcrumb':
      const breadcrumbItems = block.data.items || []
      return (
        <div style={wrapperStyles} className="mb-6">
          <nav className="flex items-center space-x-2 text-sm">
            {breadcrumbItems.map((item: any, index: number) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-gray-400">/</span>}
                {index === breadcrumbItems.length - 1 ? (
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{item.label || `Item ${index + 1}`}</span>
                ) : (
                  <a
                    href={item.url || '#'}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    {item.label || `Item ${index + 1}`}
                  </a>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      )

    case 'tags':
      const tags = block.data.tags || []
      const tagStyle = block.data.style || 'rounded'
      const tagClass = tagStyle === 'square' ? 'rounded-none' : tagStyle === 'pill' ? 'rounded-full' : 'rounded'
      return (
        <div style={wrapperStyles} className="mb-6">
          <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? (
              tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className={`px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium ${tagClass}`}
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-gray-400">Aucun tag</span>
            )}
          </div>
        </div>
      )

    case 'progress-circle':
      const progressPercentage = block.data.percentage || 75
      const circleSize = block.data.size || 'medium'
      const sizeMap: { [key: string]: { size: string; stroke: string } } = {
        small: { size: '100', stroke: '8' },
        medium: { size: '150', stroke: '10' },
        large: { size: '200', stroke: '12' },
      }
      const { size: svgSize, stroke: strokeWidth } = sizeMap[circleSize]
      const radius = (parseInt(svgSize) - parseInt(strokeWidth)) / 2
      const circumference = 2 * Math.PI * radius
      const offset = circumference - (progressPercentage / 100) * circumference
      return (
        <div style={wrapperStyles} className="mb-6 flex flex-col items-center">
          <div className="relative" style={{ width: `${svgSize}px`, height: `${svgSize}px` }}>
            <svg width={svgSize} height={svgSize} className="transform -rotate-90">
              <circle
                cx={parseInt(svgSize) / 2}
                cy={parseInt(svgSize) / 2}
                r={radius}
                stroke="#e5e7eb"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <circle
                cx={parseInt(svgSize) / 2}
                cy={parseInt(svgSize) / 2}
                r={radius}
                stroke="#3b82f6"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{progressPercentage}%</span>
            </div>
          </div>
          {block.data.text && (
            <p className="mt-4 text-gray-700 dark:text-gray-300">{block.data.text}</p>
          )}
        </div>
      )

    case 'search-bar':
      return (
        <div style={wrapperStyles} className="mb-6">
          <form
            action={block.data.action || '#'}
            method="get"
            className="flex gap-2"
          >
            <input
              type="search"
              placeholder={block.data.placeholder || 'Rechercher...'}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {block.data.show_button !== false && (
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Rechercher
              </button>
            )}
          </form>
        </div>
      )

    case 'audio-player':
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.src ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              {block.data.title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {block.data.title}
                </h3>
              )}
              <audio
                controls={block.data.controls !== false}
                autoPlay={block.data.autoplay === true}
                loop={block.data.loop === true}
                className="w-full"
              >
                <source src={block.data.src} />
                Votre navigateur ne supporte pas l'élément audio.
              </audio>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
              Aucun fichier audio configuré
            </div>
          )}
        </div>
      )

    case 'modal': {
      const ModalPreview = () => {
        const [isOpen, setIsOpen] = useState(false)
        const sizeClass = block.data.size === 'small' ? 'max-w-md' : block.data.size === 'large' ? 'max-w-4xl' : block.data.size === 'fullscreen' ? 'max-w-full h-full' : 'max-w-2xl'
        return (
          <div style={wrapperStyles} className="mb-6">
            <button
              onClick={() => setIsOpen(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {block.data.trigger_text || 'Ouvrir'}
            </button>
            {isOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setIsOpen(false)}>
                <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl ${sizeClass} w-full m-4`} onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{block.data.title || 'Modal'}</h3>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-6 text-gray-700 dark:text-gray-300">
                    {block.data.content || 'Contenu de la modal...'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      }
      return <ModalPreview />
    }

    case 'chart':
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {block.data.title}
            </h3>
          )}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded">
              Graphique {block.data.chart_type || 'line'} - Prévisualisation (nécessite Chart.js)
            </div>
            <p className="text-xs text-gray-500 mt-2">Type: {block.data.chart_type || 'line'}</p>
          </div>
        </div>
      )

    case 'calendar':
      return (
        <div style={wrapperStyles} className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="h-96 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded">
              Calendrier {block.data.calendar_type || 'month'} - Prévisualisation (nécessite bibliothèque calendrier)
            </div>
            {block.data.show_events !== false && (
              <p className="text-xs text-gray-500 mt-2">Événements activés</p>
            )}
          </div>
        </div>
      )

    case 'pagination':
      const currentPage = block.data.current_page || 1
      const totalPages = block.data.total_pages || 10
      const showArrows = block.data.show_arrows !== false
      return (
        <div style={wrapperStyles} className="mb-6">
          <nav className="flex items-center justify-center gap-2">
            {showArrows && (
              <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50" disabled={currentPage === 1}>
                ‹
              </button>
            )}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              return (
                <button
                  key={i}
                  className={`px-3 py-2 border rounded-lg ${
                    pageNum === currentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            {showArrows && (
              <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50" disabled={currentPage === totalPages}>
                ›
              </button>
            )}
          </nav>
        </div>
      )

    case 'list':
      const listItems = block.data.items || []
      const ListTag = block.data.list_type === 'ordered' ? 'ol' : 'ul'
      const listClass = block.data.list_type === 'none' ? 'list-none' : block.data.list_type === 'ordered' ? 'list-decimal' : 'list-disc'
      return (
        <div style={wrapperStyles} className="mb-6">
          {React.createElement(
            ListTag,
            { className: `${listClass} space-y-2 pl-6` },
            listItems.map((item: string, index: number) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">{item}</li>
            ))
          )}
        </div>
      )

    case 'link':
      return (
        <div style={wrapperStyles} className="mb-6">
          <a
            href={block.data.url || '#'}
            target={block.data.target || '_self'}
            rel={block.data.target === '_blank' ? 'noopener noreferrer' : undefined}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {block.data.text || 'Lien'}
          </a>
        </div>
      )

    case 'rich-text':
      return (
        <div style={wrapperStyles} className="mb-6" dangerouslySetInnerHTML={{ __html: block.data?.html || '' }} />
      )

    case 'markdown':
      // Note: Pour un vrai rendu Markdown, il faudrait une bibliothèque comme react-markdown
      return (
        <div style={wrapperStyles} className="mb-6 prose dark:prose-invert max-w-none">
          <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{block.data?.markdown || ''}</pre>
        </div>
      )

    case 'html-raw':
      return (
        <div style={wrapperStyles} className="mb-6" dangerouslySetInnerHTML={{ __html: block.data?.html || '' }} />
      )

    case 'icon':
      const iconSize = block.data?.size === 'sm' ? 'text-2xl' : block.data?.size === 'lg' ? 'text-5xl' : block.data?.size === 'xl' ? 'text-6xl' : 'text-4xl'
      return (
        <div style={wrapperStyles} className="mb-6 flex items-center justify-center">
          <span className={iconSize} style={{ color: block.data?.color || undefined }}>
            {block.data?.icon || '⭐'}
          </span>
        </div>
      )

    case 'label':
      return (
        <div style={wrapperStyles} className="mb-6">
          <label htmlFor={block.data?.for || undefined} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {block.data?.text || 'Label'}
          </label>
        </div>
      )

    case 'tooltip':
      return (
        <div style={wrapperStyles} className="mb-6">
          <span
            className="text-blue-600 dark:text-blue-400 underline cursor-help"
            title={block.data?.tooltip || ''}
          >
            {block.data?.text || 'Survolez-moi'}
          </span>
        </div>
      )

    case 'popover':
      return (
        <div style={wrapperStyles} className="mb-6">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {block.data?.trigger || 'Cliquez ici'}
          </button>
          {/* Note: Le popover nécessiterait une bibliothèque comme Radix UI pour un vrai rendu */}
        </div>
      )

    case 'dropdown':
      return (
        <div style={wrapperStyles} className="mb-6">
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
            {(block.data?.items || []).map((item: any, index: number) => (
              <option key={index} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>
      )

    case 'categories':
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data?.title && <h3 className="text-lg font-semibold mb-3">{block.data.title}</h3>}
          <div className="flex flex-wrap gap-2">
            {(block.data?.categories || []).map((cat: any, index: number) => (
              <a key={index} href={`/category/${cat.slug}`} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700">
                {cat.name}
              </a>
            ))}
          </div>
        </div>
      )

    case 'author-box':
      return (
        <div style={wrapperStyles} className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            {block.data?.avatar && (
              <img src={block.data.avatar} alt={block.data?.name || ''} className="w-16 h-16 rounded-full" />
            )}
            <div>
              {block.data?.name && <h4 className="font-semibold text-gray-900 dark:text-gray-100">{block.data.name}</h4>}
              {block.data?.bio && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{block.data.bio}</p>}
              {block.data?.url && (
                <a href={block.data.url} className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
                  Voir le profil →
                </a>
              )}
            </div>
          </div>
        </div>
      )

    case 'related-posts':
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data?.title && <h3 className="text-lg font-semibold mb-3">{block.data.title}</h3>}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            💡 {block.data?.count || 3} articles liés seront chargés automatiquement
          </div>
        </div>
      )

    case 'table-of-contents':
      return (
        <div style={wrapperStyles} className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-3">{block.data?.title || 'Table des matières'}</h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            💡 La table des matières sera générée automatiquement à partir des titres de la page
          </div>
        </div>
      )

    case 'reading-time':
      return (
        <div style={wrapperStyles} className="mb-6">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {block.data?.prefix || 'Temps de lecture:'} <strong>5 min</strong>
          </span>
        </div>
      )

    case 'share-buttons':
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data?.title && <h3 className="text-sm font-semibold mb-2">{block.data.title}</h3>}
          <div className="flex gap-2">
            {(block.data?.platforms || []).map((platform: string) => (
              <button key={platform} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700 capitalize">
                {platform}
              </button>
            ))}
          </div>
        </div>
      )

    case 'flexbox':
    case 'grid':
    case 'stack':
    case 'inline':
    case 'group':
    case 'wrapper':
      // Ces blocs sont des conteneurs, ils affichent leurs enfants
      return (
        <div style={wrapperStyles} className="mb-6">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {block.type === 'flexbox' && '📐 Flexbox Container'}
            {block.type === 'grid' && '⚏ Grid Container'}
            {block.type === 'stack' && '📚 Stack Container'}
            {block.type === 'inline' && '➡️ Inline Container'}
            {block.type === 'group' && '👥 Group Container'}
            {block.type === 'wrapper' && '📦 Wrapper Container'}
          </div>
          {/* Les enfants seront rendus par le composant parent */}
        </div>
      )

    case 'image-slider':
      const sliderImages = block.data?.images || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data?.title && <h3 className="text-lg font-semibold mb-3">{block.data.title}</h3>}
          <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800" style={{ height: '400px' }}>
            {sliderImages.length > 0 ? (
              <div className="flex h-full">
                {sliderImages.slice(0, 1).map((img: any, index: number) => (
                  <img key={index} src={img.url || ''} alt={img.alt || ''} className="w-full h-full object-cover" />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">Aucune image</div>
            )}
          </div>
        </div>
      )

    case 'lightbox':
      const lightboxImages = block.data?.images || []
      return (
        <div style={wrapperStyles} className="mb-6">
          <div className="grid grid-cols-3 gap-2">
            {lightboxImages.slice(0, 6).map((img: any, index: number) => (
              <div key={index} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                {img.thumbnail || img.url ? (
                  <img src={img.thumbnail || img.url || ''} alt={img.alt || ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Image {index + 1}</div>
                )}
              </div>
            ))}
          </div>
          {lightboxImages.length === 0 && (
            <div className="text-center py-8 text-gray-400">Aucune image dans la lightbox</div>
          )}
        </div>
      )

    case 'vimeo-embed':
      const vimeoId = block.data?.vimeoId || (block.data?.url ? block.data.url.match(/vimeo\.com\/(\d+)/)?.[1] : '')
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data?.title && <h3 className="text-lg font-semibold mb-3">{block.data.title}</h3>}
          {vimeoId ? (
            <div className="relative" style={{ paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
              <iframe
                src={`https://player.vimeo.com/video/${vimeoId}`}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center text-gray-400">
              ID Vimeo requis
            </div>
          )}
        </div>
      )

    case 'counter':
      return (
        <div style={wrapperStyles} className="mb-6 text-center">
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            {block.data?.prefix || ''}{block.data?.value || 0}{block.data?.suffix || ''}
          </div>
          {block.data?.label && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">{block.data.label}</div>
          )}
        </div>
      )

    case 'card-grid':
      const gridCards = block.data?.cards || []
      const gridColumns = block.data?.columns || 3
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data?.title && <h3 className="text-lg font-semibold mb-4">{block.data.title}</h3>}
          <div className={`grid grid-cols-1 md:grid-cols-${gridColumns} gap-4`}>
            {gridCards.map((card: any, index: number) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {card.image && (
                  <img src={card.image} alt={card.title || ''} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  {card.title && <h4 className="font-semibold mb-2">{card.title}</h4>}
                  {card.description && <p className="text-sm text-gray-600 dark:text-gray-400">{card.description}</p>}
                  {card.link && (
                    <a href={card.link} className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-2 inline-block">
                      En savoir plus →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          {gridCards.length === 0 && (
            <div className="text-center py-8 text-gray-400">Aucune carte</div>
          )}
        </div>
      )

    case 'logo-carousel':
      const carouselLogos = block.data?.logos || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data?.title && <h3 className="text-lg font-semibold mb-4">{block.data.title}</h3>}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {carouselLogos.map((logo: any, index: number) => (
              <div key={index} className="flex-shrink-0 w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center p-4">
                {logo.url ? (
                  <img src={logo.url} alt={logo.name || ''} className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="text-gray-400 text-xs text-center">{logo.name || `Logo ${index + 1}`}</div>
                )}
              </div>
            ))}
          </div>
          {carouselLogos.length === 0 && (
            <div className="text-center py-8 text-gray-400">Aucun logo</div>
          )}
        </div>
      )

    case 'route-calculator':
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data?.title && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {block.data.title}
            </h2>
          )}
          {block.data?.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {block.data.description}
            </p>
          )}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Point de départ
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Adresse de départ"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Point d'arrivée
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Adresse de destination"
                  readOnly
                />
              </div>
              <button
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                disabled
              >
                Calculer l'itinéraire
              </button>
              {block.data?.show_map !== false && (
                <div className="mt-4 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Carte (nécessite une clé API)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )

    case 'fare-calculator':
      const pricingRules = block.data?.pricing_rules || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data?.title && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {block.data.title}
            </h2>
          )}
          {block.data?.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {block.data.description}
            </p>
          )}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="0"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Durée (min)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="0"
                    readOnly
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2">
                  {pricingRules.length > 0 ? (
                    pricingRules.map((rule: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 dark:text-gray-300">{rule.label || 'Tarif'}</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {rule.amount || 0} {block.data?.currency || 'EUR'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                      Aucune règle de tarification configurée
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    0 {block.data?.currency || 'EUR'}
                  </span>
                </div>
              </div>
              <button
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                disabled
              >
                Calculer le tarif
              </button>
            </div>
          </div>
        </div>
      )

    case 'availability-calendar':
      const availableDays = block.data?.available_days || []
      const viewMode = block.data?.view_mode || 'month'
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data?.title && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {block.data.title}
            </h2>
          )}
          {block.data?.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {block.data.description}
            </p>
          )}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600" disabled>
                  ←
                </button>
                <span className="px-4 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                </span>
                <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600" disabled>
                  →
                </button>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Mode: {viewMode === 'month' ? 'Mois' : viewMode === 'week' ? 'Semaine' : 'Jour'}
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, index) => {
                const day = index + 1
                const isAvailable = availableDays.length === 0 || Math.random() > 0.3
                return (
                  <div
                    key={index}
                    className={`aspect-square flex items-center justify-center text-sm rounded ${
                      isAvailable
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {day <= 31 ? day : ''}
                  </div>
                )
              })}
            </div>
            {block.data?.show_time_slots && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Créneaux horaires</p>
                <div className="flex flex-wrap gap-2">
                  {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'].map((time) => (
                    <button
                      key={time}
                      className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                      disabled
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {block.data?.allow_booking && (
              <button
                className="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                disabled
              >
                Réserver
              </button>
            )}
          </div>
        </div>
      )

    case 'form-multi-step': {
      const steps = block.data.steps || []
      const [currentStep, setCurrentStep] = useState(0)
      
      return (
        <div style={wrapperStyles} className="mb-6">
          <form className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {block.data.title && (
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{block.data.title}</h3>
            )}
            {steps.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-6">
                  {steps.map((step: any, index: number) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === currentStep ? 'bg-blue-600 text-white' : 
                        index < currentStep ? 'bg-green-500 text-white' : 
                        'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-12 h-1 mx-2 ${
                          index < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                {steps[currentStep] && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {steps[currentStep].title || `Étape ${currentStep + 1}`}
                    </h4>
                    {(steps[currentStep].fields || []).map((field: any, fIndex: number) => (
                      <div key={fIndex}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {field.label || 'Champ'}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                          <textarea
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            rows={3}
                            disabled
                          />
                        ) : (
                          <input
                            type={field.type || 'text'}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            disabled
                          />
                        )}
                      </div>
                    ))}
                    <div className="flex justify-between mt-6">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                        disabled={currentStep === 0}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Précédent
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                        disabled={currentStep === steps.length - 1}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {currentStep === steps.length - 1 ? 'Envoyer' : 'Suivant'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </form>
        </div>
      )
    }
    
    case 'form-conditional': {
      const fields = block.data.fields || []
      const [formData, setFormData] = useState<Record<string, any>>({})
      
      const shouldShowField = (field: any) => {
        if (!field.conditions || field.conditions.length === 0) return true
        return field.conditions.some((condition: any) => {
          const fieldValue = formData[condition.field]
          if (condition.operator === 'equals') return fieldValue === condition.value
          if (condition.operator === 'not_equals') return fieldValue !== condition.value
          if (condition.operator === 'contains') return String(fieldValue || '').includes(condition.value)
          return true
        })
      }
      
      return (
        <div style={wrapperStyles} className="mb-6">
          <form className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {block.data.title && (
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{block.data.title}</h3>
            )}
            <div className="space-y-4">
              {fields.map((field: any, index: number) => {
                if (!shouldShowField(field)) return null
                return (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {field.label || 'Champ'}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        disabled
                      >
                        <option>Sélectionner...</option>
                      </select>
                    ) : field.type === 'checkbox' ? (
                      <label className="flex items-center gap-2">
                        <input type="checkbox" disabled className="w-4 h-4" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Case à cocher</span>
                      </label>
                    ) : field.type === 'radio' ? (
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input type="radio" name={`radio-${index}`} disabled className="w-4 h-4" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Option 1</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="radio" name={`radio-${index}`} disabled className="w-4 h-4" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Option 2</span>
                        </label>
                      </div>
                    ) : (
                      <input
                        type={field.type || 'text'}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        disabled
                      />
                    )}
                  </div>
                )
              })}
            </div>
            <button
              type="submit"
              className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              disabled
            >
              Envoyer
            </button>
          </form>
        </div>
      )
    }
    
    case 'form-calculator': {
      const fields = block.data.fields || []
      const [values, setValues] = useState<Record<string, number>>({})
      const [result, setResult] = useState<number | null>(null)
      
      const calculate = () => {
        if (!block.data.formula) return
        try {
          let formula = block.data.formula
          fields.forEach((field: any) => {
            const value = values[field.name] || field.default_value || 0
            formula = formula.replace(new RegExp(field.name, 'g'), String(value))
          })
          // Évaluer la formule de manière sécurisée
          const calculated = Function(`"use strict"; return (${formula})`)()
          setResult(calculated)
        } catch (e) {
          console.error('Erreur calcul:', e)
        }
      }
      
      return (
        <div style={wrapperStyles} className="mb-6">
          <form className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {block.data.title && (
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{block.data.title}</h3>
            )}
            <div className="space-y-4">
              {fields.map((field: any, index: number) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {field.label || field.name}
                  </label>
                  <input
                    type="number"
                    value={values[field.name] || field.default_value || 0}
                    onChange={(e) => {
                      const newValues = { ...values, [field.name]: parseFloat(e.target.value) || 0 }
                      setValues(newValues)
                      calculate()
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    step="0.01"
                  />
                </div>
              ))}
            </div>
            {result !== null && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Résultat:</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.toFixed(2)}</p>
              </div>
            )}
          </form>
        </div>
      )
    }
    
    case 'form-file-upload': {
      return (
        <div style={wrapperStyles} className="mb-6">
          <form className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {block.data.title && (
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{block.data.title}</h3>
            )}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Glissez vos fichiers ici ou cliquez pour sélectionner
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Taille max: {block.data.max_file_size || 10} MB
              </p>
              {block.data.allowed_types && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Types: {block.data.allowed_types.join(', ')}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              disabled
            >
              Téléverser
            </button>
          </form>
        </div>
      )
    }
    
    case 'form-payment': {
      const paymentMethods = block.data.payment_methods || ['stripe']
      const amount = block.data.amount || 0
      const currency = block.data.currency || 'EUR'
      
      const formatAmount = (amt: number, curr: string) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: curr }).format(amt)
      }
      
      return (
        <div style={wrapperStyles} className="mb-6">
          <form className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {block.data.title && (
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{block.data.title}</h3>
            )}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">Montant à payer:</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatAmount(amount, currency)}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom sur la carte
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Jean Dupont"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Numéro de carte
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="1234 5678 9012 3456"
                  disabled
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date d'expiration
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="MM/AA"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="123"
                    disabled
                  />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Méthodes de paiement:</p>
              <div className="flex gap-4">
                {paymentMethods.includes('stripe') && (
                  <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300">💳 Stripe</span>
                  </div>
                )}
                {paymentMethods.includes('paypal') && (
                  <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300">🅿️ PayPal</span>
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              disabled
            >
              Payer {formatAmount(amount, currency)}
            </button>
          </form>
        </div>
      )
    }
    
    case 'form-quiz': {
      const questions = block.data.questions || []
      const [currentQuestion, setCurrentQuestion] = useState(0)
      const [answers, setAnswers] = useState<Record<number, any>>({})
      const [showResults, setShowResults] = useState(false)
      const [score, setScore] = useState(0)
      
      const handleAnswer = (questionIndex: number, answerIndex: number) => {
        const newAnswers = { ...answers, [questionIndex]: answerIndex }
        setAnswers(newAnswers)
      }
      
      const submitQuiz = () => {
        let correct = 0
        questions.forEach((q: any, index: number) => {
          if (answers[index] === q.correct_answer) correct++
        })
        setScore(correct)
        setShowResults(true)
      }
      
      if (showResults && block.data.show_results !== false) {
        return (
          <div style={wrapperStyles} className="mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Résultats</h3>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {score} / {questions.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round((score / questions.length) * 100)}% de bonnes réponses
              </p>
            </div>
          </div>
        )
      }
      
      if (questions.length === 0) {
        return (
          <div style={wrapperStyles} className="mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">Aucune question configurée</p>
            </div>
          </div>
        )
      }
      
      const question = questions[currentQuestion]
      
      return (
        <div style={wrapperStyles} className="mb-6">
          <form className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {block.data.title && (
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{block.data.title}</h3>
            )}
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Question {currentQuestion + 1} sur {questions.length}
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {question.question || 'Question'}
              </h4>
              {question.type === 'text' ? (
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  disabled
                />
              ) : (
                <div className="space-y-2">
                  {(question.answers || []).map((answer: string, aIndex: number) => (
                    <label
                      key={aIndex}
                      className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        answers[currentQuestion] === aIndex
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                    >
                      <input
                        type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                        name={`question-${currentQuestion}`}
                        checked={answers[currentQuestion] === aIndex}
                        onChange={() => handleAnswer(currentQuestion, aIndex)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{answer}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              {currentQuestion < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Suivant
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submitQuiz}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Terminer
                </button>
              )}
            </div>
          </form>
        </div>
      )
    }
    
    case 'form-survey': {
      const questions = block.data.questions || []
      
      return (
        <div style={wrapperStyles} className="mb-6">
          <form className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {block.data.title && (
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{block.data.title}</h3>
            )}
            {block.data.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{block.data.description}</p>
            )}
            <div className="space-y-6">
              {questions.map((q: any, index: number) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {q.question || 'Question'}
                    {q.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {q.type === 'textarea' ? (
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      rows={4}
                      disabled
                    />
                  ) : q.type === 'radio' ? (
                    <div className="space-y-2">
                      {['Option 1', 'Option 2', 'Option 3'].map((opt, oIndex) => (
                        <label key={oIndex} className="flex items-center gap-2">
                          <input type="radio" name={`survey-${index}`} disabled className="w-4 h-4" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : q.type === 'checkbox' ? (
                    <div className="space-y-2">
                      {['Option 1', 'Option 2', 'Option 3'].map((opt, oIndex) => (
                        <label key={oIndex} className="flex items-center gap-2">
                          <input type="checkbox" disabled className="w-4 h-4" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : q.type === 'scale' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">1</span>
                      <input type="range" min="1" max="10" defaultValue="5" disabled className="flex-1" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">10</span>
                    </div>
                  ) : q.type === 'rating' ? (
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" disabled className="text-2xl text-gray-300 dark:text-gray-600">
                          ⭐
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type={q.type || 'text'}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      disabled
                    />
                  )}
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              disabled
            >
              Envoyer le sondage
            </button>
          </form>
        </div>
      )
    }
    
    case 'form-poll': {
      const options = block.data.options || []
      const [selected, setSelected] = useState<number[]>([])
      const [voted, setVoted] = useState(false)
      const [results, setResults] = useState<Record<number, number>>({})
      
      const handleVote = () => {
        if (selected.length === 0) return
        const newResults: Record<number, number> = {}
        options.forEach((_: string, index: number) => {
          newResults[index] = selected.includes(index) ? 50 : Math.random() * 30
        })
        setResults(newResults)
        setVoted(true)
      }
      
      return (
        <div style={wrapperStyles} className="mb-6">
          <form className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {block.data.question || 'Question'}
            </h3>
            {!voted ? (
              <div className="space-y-3">
                {options.map((option: string, index: number) => (
                  <label
                    key={index}
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      selected.includes(index)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    <input
                      type={block.data.allow_multiple ? 'checkbox' : 'radio'}
                      name="poll"
                      checked={selected.includes(index)}
                      onChange={(e) => {
                        if (block.data.allow_multiple) {
                          setSelected(e.target.checked
                            ? [...selected, index]
                            : selected.filter(i => i !== index)
                          )
                        } else {
                          setSelected([index])
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{option}</span>
                  </label>
                ))}
                <button
                  type="button"
                  onClick={handleVote}
                  disabled={selected.length === 0}
                  className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Voter
                </button>
              </div>
            ) : block.data.show_results !== false ? (
              <div className="space-y-3">
                {options.map((option: string, index: number) => {
                  const percentage = results[index] || 0
                  return (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{percentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Merci pour votre vote !</p>
              </div>
            )}
          </form>
        </div>
      )
    }
    
    case 'form-rsvp': {
      const [response, setResponse] = useState<'yes' | 'no' | null>(null)
      
      return (
        <div style={wrapperStyles} className="mb-6">
          <form className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {block.data.event_title || 'Événement'}
            </h3>
            {block.data.event_date && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                📅 {new Date(block.data.event_date).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            )}
            {block.data.event_location && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                📍 {block.data.event_location}
              </p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmez votre présence <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className={`flex-1 p-4 border-2 rounded-lg cursor-pointer text-center transition-colors ${
                    response === 'yes'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700'
                  }`}>
                    <input
                      type="radio"
                      name="rsvp"
                      checked={response === 'yes'}
                      onChange={() => setResponse('yes')}
                      className="sr-only"
                    />
                    <span className="text-lg">✅</span>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">Je serai présent(e)</p>
                  </label>
                  <label className={`flex-1 p-4 border-2 rounded-lg cursor-pointer text-center transition-colors ${
                    response === 'no'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-700'
                  }`}>
                    <input
                      type="radio"
                      name="rsvp"
                      checked={response === 'no'}
                      onChange={() => setResponse('no')}
                      className="sr-only"
                    />
                    <span className="text-lg">❌</span>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">Je ne pourrai pas venir</p>
                  </label>
                </div>
              </div>
              {block.data.show_guests && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre d'invités
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    disabled
                  />
                </div>
              )}
              {block.data.show_dietary && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Restrictions alimentaires
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={2}
                    placeholder="Végétarien, allergies, etc."
                    disabled
                  />
                </div>
              )}
              {block.data.show_message && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message (optionnel)
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={3}
                    disabled
                  />
                </div>
              )}
            </div>
            <button
              type="submit"
              className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              disabled
            >
              Confirmer
            </button>
          </form>
        </div>
      )
    }

    case 'captcha':
      return (
        <div style={wrapperStyles} className="mb-6">
          <Captcha
            onVerify={(isValid) => {
              // La validation est gérée par le composant Captcha lui-même
            }}
            theme={block.data.theme || 'light'}
          className={block.data.className || ''}
        />
      </div>
    )

    // Blocs VTC
    case 'driver-profile':
      return (
        <div style={wrapperStyles} className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              {block.data?.photo_url && (
                <img
                  src={block.data.photo_url}
                  alt={block.data.name || 'Chauffeur'}
                  className="w-20 h-20 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {block.data?.name || 'Nom du chauffeur'}
                </h3>
                {block.data?.rating && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{block.data.rating}</span>
                    {block.data?.reviews_count && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({block.data.reviews_count} avis)
                      </span>
                    )}
                  </div>
                )}
                {block.data?.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{block.data.description}</p>
                )}
                {block.data?.experience_years && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {block.data.experience_years} ans d'expérience
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )

    case 'email-button':
      return (
        <div style={wrapperStyles} className="mb-6">
          <a
            href={`mailto:${block.data?.email || ''}${block.data?.subject ? `?subject=${encodeURIComponent(block.data.subject)}` : ''}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {block.data?.button_text || 'Envoyer un email'}
          </a>
        </div>
      )

    case 'sms-button':
      return (
        <div style={wrapperStyles} className="mb-6">
          <a
            href={`sms:${block.data?.phone || ''}${block.data?.default_message ? `?body=${encodeURIComponent(block.data.default_message)}` : ''}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {block.data?.button_text || 'Envoyer un SMS'}
          </a>
        </div>
      )

    case 'vehicle-comparison':
      const comparisonVehicles = block.data?.vehicles || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data?.title && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {block.data.title}
            </h2>
          )}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600">Caractéristique</th>
                  {comparisonVehicles.map((vehicle: any, index: number) => (
                    <th key={index} className="p-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600">
                      {vehicle.name || `Véhicule ${index + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">Places</td>
                  {comparisonVehicles.map((vehicle: any, index: number) => (
                    <td key={index} className="p-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600">
                      {vehicle.seats || 4}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">Prix</td>
                  {comparisonVehicles.map((vehicle: any, index: number) => (
                    <td key={index} className="p-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600">
                      {vehicle.price || 0} €
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )

    case 'service-packages':
      const packages = block.data?.packages || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data?.title && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {block.data.title}
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pkg: any, index: number) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {pkg.name || `Forfait ${index + 1}`}
                </h3>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                  {pkg.price || 0} €
                </div>
                {pkg.features && pkg.features.length > 0 && (
                  <ul className="space-y-2">
                    {pkg.features.map((feature: string, fIndex: number) => (
                      <li key={fIndex} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-green-500">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )

    // Blocs E-commerce
    case 'product-gallery':
      const productImages = block.data?.images || []
      const displayMode = block.data?.display_mode || 'grid'
      return (
        <div style={wrapperStyles} className="mb-6">
          {productImages.length > 0 ? (
            displayMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {productImages.map((img: string, index: number) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Produit ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            ) : (
              <div className="relative">
                <img
                  src={productImages[0]}
                  alt="Produit"
                  className="w-full h-64 object-cover rounded-lg"
                />
                {block.data?.show_thumbnails && productImages.length > 1 && (
                  <div className="mt-4 flex gap-2">
                    {productImages.slice(1, 5).map((img: string, index: number) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Miniature ${index + 1}`}
                        className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-75"
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="text-center py-8 text-gray-400">Aucune image</div>
          )}
        </div>
      )

    case 'product-details':
      return (
        <div style={wrapperStyles} className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {block.data?.name || 'Nom du produit'}
            </h2>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
              {block.data?.price || 0} {block.data?.currency || 'EUR'}
            </div>
            {block.data?.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">{block.data.description}</p>
            )}
            <div className="flex items-center gap-4">
              {block.data?.in_stock ? (
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                  En stock ({block.data?.stock || 0} disponibles)
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-medium">
                  Rupture de stock
                </span>
              )}
            </div>
          </div>
        </div>
      )

    case 'add-to-cart':
      return (
        <div style={wrapperStyles} className="mb-6">
          <div className="flex items-center gap-4">
            {block.data?.show_quantity && (
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">-</button>
                <input
                  type="number"
                  min="1"
                  defaultValue="1"
                  className="w-16 px-2 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
                <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">+</button>
              </div>
            )}
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {block.data?.button_text || 'Ajouter au panier'}
            </button>
          </div>
        </div>
      )

    case 'buy-now':
      return (
        <div style={wrapperStyles} className="mb-6">
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {block.data?.button_text || 'Acheter maintenant'}
          </button>
        </div>
      )

    case 'trust-badges':
      const trustBadges = block.data?.badges || []
      const layout = block.data?.layout || 'horizontal'
      return (
        <div style={wrapperStyles} className="mb-6">
          {trustBadges.length > 0 ? (
            <div className={`flex ${layout === 'vertical' ? 'flex-col' : layout === 'grid' ? 'flex-wrap' : 'flex-row'} gap-4`}>
              {trustBadges.map((badge: any, index: number) => (
                <div key={index} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <span className="text-xl">{badge.icon || '✅'}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{badge.text || ''}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400">Aucun badge configuré</div>
          )}
        </div>
      )

    case 'payment-methods':
      const methods = block.data?.methods || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data?.title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {block.data.title}
            </h3>
          )}
          {methods.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {methods.map((method: any, index: number) => (
                <div key={index} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <span className="text-xl">{method.icon || '💳'}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{method.name || ''}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400">Aucune méthode configurée</div>
          )}
        </div>
      )

    default:
      return (
        <div style={wrapperStyles} className="mb-6 p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Bloc {block.type}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Prévisualisation non disponible</p>
            </div>
          </div>
        </div>
      )
    }
  })()

  // Générer les classes d'animation au survol
  const getHoverAnimationClass = () => {
    const animation = block.styles?.hover_animation || 'none'
    switch (animation) {
      case 'scale':
        return 'hover:scale-105'
      case 'lift':
        return 'hover:-translate-y-2 hover:shadow-lg'
      case 'fade':
        return 'hover:opacity-80'
      case 'rotate':
        return 'hover:rotate-3'
      case 'glow':
        return 'hover:shadow-2xl hover:shadow-blue-500/50'
      default:
        return ''
    }
  }

  // Appliquer l'alignement selon le type de position
  const getAlignmentClasses = () => {
    if (block.position?.type === 'relative' || block.position?.type === 'absolute' || block.position?.type === 'fixed' || block.position?.type === 'sticky') {
      const align = block.position?.align || 'left'
      switch (align) {
        case 'left':
          return 'mr-auto'
        case 'center':
          return 'mx-auto'
        case 'right':
          return 'ml-auto'
        case 'stretch':
          return 'w-full'
        default:
          return ''
      }
    }
    return ''
  }

  // Wrap content with layout and container
  return (
    <div 
      className={`${containerClass} mb-6 ${getHoverAnimationClass()} ${getAlignmentClasses()}`} 
      style={wrapperStyles}
    >
      <div className={layoutWidth}>
        {content}
      </div>
    </div>
  )
}

