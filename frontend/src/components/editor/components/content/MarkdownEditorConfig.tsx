'use client'

import React from 'react'
import { Block } from '../../types'

export function MarkdownEditorConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Contenu Markdown
        </label>
        <textarea
          value={safeBlock.data.markdown || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, markdown: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
          rows={10}
          placeholder="# Titre\n\nParagraphe avec **gras** et *italique*..."
        />
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        💡 Syntaxe Markdown supportée: **gras**, *italique*, [liens](url), etc.
      </div>
    </div>
  )
}
