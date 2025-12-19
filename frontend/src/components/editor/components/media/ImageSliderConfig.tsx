'use client'

import React from 'react'
import { Block } from '../../types'

export function ImageSliderConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const images = safeBlock.data.images || [{ url: '', alt: '', caption: '' }]
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre (optionnel)
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Diaporama"
        />
      </div>
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
                placeholder="URL de l'image"
              />
              <input
                type="text"
                value={img.alt || ''}
                onChange={(e) => {
                  const newImages = [...images]
                  newImages[index] = { ...img, alt: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, images: newImages } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Texte alternatif"
              />
              <input
                type="text"
                value={img.caption || ''}
                onChange={(e) => {
                  const newImages = [...images]
                  newImages[index] = { ...img, caption: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, images: newImages } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Légende (optionnel)"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onUpdate({ data: { ...safeBlock.data, images: [...images, { url: '', alt: '', caption: '' }] } })}
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
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Autoplay
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={safeBlock.data.autoplay || false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, autoplay: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">Lecture automatique</span>
        </label>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Intervalle (secondes)
        </label>
        <input
          type="number"
          value={safeBlock.data.interval || 5}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, interval: parseInt(e.target.value) || 5 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          min={1}
          max={60}
        />
      </div>
    </div>
  )
}
