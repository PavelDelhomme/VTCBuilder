'use client'

import React from 'react'
import { Block } from '../../types'

export function HtmlRawConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Code HTML Brut
        </label>
        <textarea
          value={safeBlock.data.html || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, html: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
          rows={10}
          placeholder="<div>Votre HTML personnalisé</div>"
        />
      </div>
      <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-200">
        ⚠️ Attention: Le HTML brut est exécuté tel quel. Assurez-vous qu'il est sûr.
      </div>
    </div>
  )
}
