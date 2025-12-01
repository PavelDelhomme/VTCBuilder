'use client'

import React, { useState, useEffect } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Block } from './BlockEditor'
import blocksService, { BlockType } from '@/services/blocks.service'

interface BlockPreviewProps {
  blocks: Block[]
  blockTypes: BlockType[]
  onBlocksChange?: (blocks: Block[]) => void
  onBlockSelect?: (blockId: string | null) => void
  onBlockDoubleClick?: (blockId: string) => void
  selectedBlockId?: string | null
  isInteractive?: boolean
  isEditable?: boolean
}

export default function BlockPreview({ 
  blocks, 
  blockTypes, 
  onBlocksChange,
  onBlockSelect,
  onBlockDoubleClick,
  selectedBlockId,
  isInteractive = false,
  isEditable = false
}: BlockPreviewProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

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
    if (onBlockSelect && !isDragging) {
      onBlockSelect(blockId === selectedBlockId ? null : blockId)
    }
  }

  const handleBlockDoubleClick = (blockId: string) => {
    if (onBlockDoubleClick && !isDragging) {
      onBlockDoubleClick(blockId)
    }
  }

  const activeBlock = activeId ? blocks.find(b => b.id === activeId) : null

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 overflow-y-auto flex flex-col">
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
        {isInteractive && (
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
}: {
  block: Block
  blockType?: BlockType
  isSelected: boolean
  isInteractive: boolean
  isEditable: boolean
  onClick: () => void
  onDoubleClick: () => void
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
      className={`mb-6 relative group ${isInteractive ? 'cursor-move' : isEditable ? 'cursor-pointer' : ''} ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      } ${isEditable ? 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-1' : ''}`}
      onClick={onClick}
      onDoubleClick={isEditable ? onDoubleClick : undefined}
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
  // Styles du wrapper (container) - position, margin, padding du container
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
              padding: block.styles?.padding || undefined,
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
          if (block.data.source === 'dynamic' && block.data.api_endpoint) {
            setLoading(true)
            fetch(block.data.api_endpoint)
              .then(res => res.json())
              .then(data => {
                const plansData = Array.isArray(data) ? data : (data.results || data.plans || [])
                setPlans(plansData.filter((p: any) => p.is_active).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)))
              })
              .catch(err => {
                console.error('Erreur chargement plans:', err)
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
                {plans.map((plan: any, index: number) => (
                  <div
                    key={plan.id || index}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 relative ${
                      plan.is_featured ? 'ring-4 ring-blue-500 scale-105' : ''
                    }`}
                  >
                    {plan.is_featured && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                          POPULAIRE
                        </span>
                      </div>
                    )}
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
                        {formatPrice(plan.price_monthly || plan.price || 0)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">/mois</span>
                      {plan.price_yearly && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          ou {formatPrice(plan.price_yearly)}/an (-{Math.round((1 - (plan.price_yearly / ((plan.price_monthly || plan.price || 0) * 12))) * 100)}%)
                        </div>
                      )}
                    </div>
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-gray-700 dark:text-gray-300">{plan.max_sites || 1} site{(plan.max_sites || 1) > 1 ? 's' : ''}</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-gray-700 dark:text-gray-300">{plan.max_users || 1} utilisateur{(plan.max_users || 1) > 1 ? 's' : ''} max</span>
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-gray-700 dark:text-gray-300">{plan.max_storage_gb || 1} GB de stockage</span>
                      </li>
                      {plan.features && plan.features.map((feature: string, i: number) => (
                        <li key={i} className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href={`/register?plan=${plan.slug || plan.id}`}
                      className={`block w-full text-center py-3 rounded-lg font-bold transition-colors ${
                        plan.is_featured
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      Choisir {plan.name}
                    </a>
                  </div>
                ))}
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
            ...wrapperStyles,
            background: heroBg,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: `${block.styles?.padding_top || '5rem'} ${block.styles?.padding_right || '2rem'} ${block.styles?.padding_bottom || '8rem'} ${block.styles?.padding_left || '2rem'}`,
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
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.title && (
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
              {block.data.title}
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.length > 0 ? (
              features.map((feature: any, i: number) => (
                <div key={i} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
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
            ...contentStyles,
            background: block.data.background_gradient || 'linear-gradient(to right, #2563eb, #9333ea)',
            padding: block.styles?.padding || '5rem 2rem',
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
            ...wrapperStyles,
            backgroundImage: block.data.background_image ? `url(${block.data.background_image})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: `${block.data.min_height || 400}px`,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: block.data.text_align === 'left' ? 'flex-start' : block.data.text_align === 'right' ? 'flex-end' : 'center',
            padding: block.styles?.padding || '4rem 2rem',
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

    case 'footer':
      const footerColumns = block.data.columns || []
      return (
        <div style={wrapperStyles} className="mb-6 bg-gray-900 dark:bg-gray-950 text-white p-8 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {footerColumns.length > 0 ? (
              footerColumns.map((column: any, colIndex: number) => (
                <div key={colIndex}>
                  {column.title && (
                    <h3 className="text-lg font-semibold mb-4">{column.title}</h3>
                  )}
                  <ul className="space-y-2">
                    {(column.links || []).map((link: any, linkIndex: number) => (
                      <li key={linkIndex}>
                        <a
                          href={link.url || '#'}
                          className="text-gray-300 hover:text-white transition-colors"
                        >
                          {link.label || 'Lien'}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400 border-2 border-dashed border-gray-700 rounded">
                Aucune colonne configurée
              </div>
            )}
          </div>
          {block.data.copyright && (
            <div className="border-t border-gray-800 pt-4 text-center text-sm text-gray-400">
              {block.data.copyright}
            </div>
          )}
        </div>
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
            padding: block.styles?.padding || '2rem',
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
            className="p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            style={contentStyles}
          >
            {block.data.icon && (
              <div className="text-4xl mb-4">{block.data.icon}</div>
            )}
            {block.data.title && (
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {block.data.title}
              </h3>
            )}
            {block.data.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {block.data.description}
              </p>
            )}
            {block.data.link_url && block.data.link_text && (
              <a 
                href={block.data.link_url}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
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

    case 'logo-grid':
      const logos = block.data.logos || []
      const columns = block.data.columns || 4
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
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
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

    case 'card':
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

