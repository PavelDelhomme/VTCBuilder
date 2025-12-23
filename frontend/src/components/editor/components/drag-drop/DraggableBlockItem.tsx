'use client'

/**
 * Composant pour un élément de bloc draggable dans la popup
 */

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { BlockType } from '@/services/blocks.service'

interface DraggableBlockItemProps {
  blockType: BlockType
  onSelect: () => void
}

export function DraggableBlockItem({
  blockType,
  onSelect,
}: DraggableBlockItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `block-type-${blockType.name}`,
    data: {
      type: 'block-type',
      blockType,
    },
  })

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined

  const categoryColors: Record<string, string> = {
    'layout': 'from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30',
    'content': 'from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30',
    'media': 'from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30',
    'forms': 'from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30',
    'custom': 'from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30',
  }

  const categoryColor = categoryColors[blockType.category || 'custom'] || 'from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onSelect}
      className={`p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-600 hover:shadow-lg transition-all cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
      title={`${blockType.label || blockType.name} - ${blockType.description || 'Cliquez pour ajouter'}`}
    >
      <div className="text-center">
        <div className={`w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br ${categoryColor} flex items-center justify-center text-3xl shadow-sm`}>
          {blockType.icon || '📦'}
        </div>
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {blockType.label || blockType.name}
        </div>
        {blockType.description && (
          <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
            {blockType.description}
          </div>
        )}
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
            blockType.category === 'layout' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
            blockType.category === 'content' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
            blockType.category === 'media' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}>
            {blockType.category || 'custom'}
          </span>
          {(blockType as any).is_premium && (
            <span className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full font-medium">
              ⭐ Premium
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

