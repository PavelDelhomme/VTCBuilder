'use client'

import React from 'react'
import { Block } from '../../types'

export function LightboxConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const images = safeBlock.data.images || [{ url: '', alt: '', thumbnail: '' }]
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Images ({images.length})
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {images.map((img: any, index: number) => (
            <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
              <input
                type="text"
                value={img.url || ''}
                onChange={(e) => {
                  const newImages = [...images]
                  newImages[index] = { ...img, url: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, images: newImages } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="URL image complète"
              />
              <input
                type="text"
                value={img.thumbnail || ''}
                onChange={(e) => {
                  const newImages = [...images]
                  newImages[index] = { ...img, thumbnail: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, images: newImages } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="URL miniature"
              />
              <input
                type="text"
                value={img.alt || ''}
                onChange={(e) => {
                  const newImages = [...images]
                  newImages[index] = { ...img, alt: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, images: newImages } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Texte alternatif"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onUpdate({ data: { ...safeBlock.data, images: [...images, { url: '', alt: '', thumbnail: '' }] } })}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Ajouter
          </button>
          {images.length > 1 && (
            <button
              onClick={() => onUpdate({ data: { ...safeBlock.data, images: images.slice(0, -1) } })}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              - Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
