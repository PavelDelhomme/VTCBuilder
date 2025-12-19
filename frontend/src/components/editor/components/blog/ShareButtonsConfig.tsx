'use client'

import React from 'react'
import { Block } from '../../types'

export function ShareButtonsConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const platforms = safeBlock.data.platforms || ['facebook', 'twitter', 'linkedin']
  const availablePlatforms = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'email', 'copy']
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre de la section
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Partager"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Plateformes
        </label>
        <div className="space-y-2">
          {availablePlatforms.map((platform) => (
            <label key={platform} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={platforms.includes(platform)}
                onChange={(e) => {
                  const newPlatforms = e.target.checked
                    ? [...platforms, platform]
                    : platforms.filter((p: string) => p !== platform)
                  onUpdate({ data: { ...safeBlock.data, platforms: newPlatforms } })
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300 capitalize">{platform}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
