import React from 'react'
import { RendererCaseProps } from './types'

export function renderVideoEmbed({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL de la vidéo (YouTube ou Vimeo)
        </label>
        <input
          type="text"
          value={safeBlock.data.url || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, url: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
          Supporte YouTube et Vimeo
        </p>
      </div>
    </div>
  )
}

