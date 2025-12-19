'use client'

import React from 'react'
import { Block } from '../../types'

export function VimeoEmbedConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          ID ou URL Vimeo
        </label>
        <input
          type="text"
          value={safeBlock.data.vimeoId || safeBlock.data.url || ''}
          onChange={(e) => {
            const value = e.target.value
            
            let vimeoId = value
            if (value.includes('vimeo.com/')) {
              const match = value.match(/vimeo\.com\/(\d+)/)
              if (match) vimeoId = match[1]
            }
            onUpdate({ data: { ...safeBlock.data, vimeoId, url: value } })
          }}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="123456789 ou https://vimeo.com/123456789"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre (optionnel)
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Titre de la vidéo"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Hauteur (px)
        </label>
        <input
          type="number"
          value={safeBlock.data.height || 400}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, height: parseInt(e.target.value) || 400 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          min={200}
          max={800}
        />
      </div>
    </div>
  )
}
