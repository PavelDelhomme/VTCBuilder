import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Block } from '../types'
import { BlockType } from '@/services/blocks.service'
import { BlockPreviewRenderer } from '../BlockPreview'

interface SortablePreviewBlockProps {
  block: Block
  blockType?: BlockType
  blockTypes: BlockType[]
  theme?: 'light' | 'dark'
  isSelected: boolean
  isInteractive: boolean
  isEditable: boolean
  onClick: () => void
  onDoubleClick: () => void
  onRightClick?: (e: React.MouseEvent) => void
}

export function SortablePreviewBlock({
  block,
  blockType,
  blockTypes,
  theme,
  isSelected,
  isInteractive,
  isEditable,
  onClick,
  onDoubleClick,
  onRightClick,
}: SortablePreviewBlockProps) {
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
      <BlockPreviewRenderer block={block} blockType={blockType} blockTypes={blockTypes || []} theme={theme || 'light'} />
    </div>
  )
}

