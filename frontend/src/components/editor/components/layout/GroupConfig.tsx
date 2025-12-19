'use client'

import React from 'react'
import { Block } from '../../types'

export function GroupConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          👥 Groupe: Groupe d'éléments. Ajoutez des blocs enfants pour les grouper ensemble.
        </p>
      </div>
    </div>
  )
}
