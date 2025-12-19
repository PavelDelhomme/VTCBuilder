'use client'

import React from 'react'
import { Block } from '../../types'

export function ProductGalleryConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const images = safeBlock.data.images || []
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Images (URLs, une par ligne)
        </label>
        <textarea
          value={images.join('\n')}
          onChange={(e) => {
            const imageUrls = e.target.value.split('\n').filter(url => url.trim())
            onUpdate({ data: { ...safeBlock.data, images: imageUrls } })
          }}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
          rows={5}
          placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Mode d'affichage
        </label>
        <select
          value={safeBlock.data.display_mode || 'grid'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, display_mode: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="grid">Grille</option>
          <option value="slider">Slider</option>
          <option value="lightbox">Lightbox</option>
        </select>
      </div>
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={safeBlock.data.show_thumbnails !== false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_thumbnails: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">Afficher les miniatures</span>
        </label>
      </div>
    </div>
  )
}

// Product Details (Détails Produit)
