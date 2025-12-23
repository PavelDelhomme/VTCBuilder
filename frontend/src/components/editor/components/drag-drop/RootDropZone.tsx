'use client'

/**
 * Zone de drop racine pour les blocs
 */

import React from 'react'
import { useDroppable } from '@dnd-kit/core'

interface RootDropZoneProps {
  children: React.ReactNode
}

export function RootDropZone({ children }: RootDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'root-drop-zone',
    data: {
      type: 'root',
      containerId: 'root',
    },
  })
  
  return (
    <div
      ref={setNodeRef}
      className={`w-full h-full ${isOver ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 border-dashed' : ''}`}
    >
      {children}
    </div>
  )
}

