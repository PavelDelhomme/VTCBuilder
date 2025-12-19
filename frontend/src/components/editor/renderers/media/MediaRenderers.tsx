'use client'

import React from 'react'
import { Block } from '../../types'
import { CollapsibleSection } from '../../CollapsibleSection'
import ImageSelector from '../../ui/ImageSelector'

interface MediaRendererProps {
  block: Block
  onUpdate: (updates: Partial<Block>) => void
}

export function renderImage({ block, onUpdate }: MediaRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL de l'image
        </label>
        <input
          type="url"
          value={safeBlock.data.url || safeBlock.data.src || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, url: e.target.value, src: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="https://example.com/image.jpg"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte alternatif
        </label>
        <input
          type="text"
          value={safeBlock.data.alt || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, alt: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Description de l'image"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Légende
        </label>
        <input
          type="text"
          value={safeBlock.data.caption || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, caption: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Légende (optionnel)"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Largeur (%)
          </label>
          <input
            type="number"
            value={safeBlock.data.width || 100}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, width: parseInt(e.target.value) || 100 } })}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            min={10}
            max={100}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Alignement
          </label>
          <select
            value={safeBlock.data.align || 'center'}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, align: e.target.value } })}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="left">Gauche</option>
            <option value="center">Centre</option>
            <option value="right">Droite</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export function renderVideo({ block, onUpdate }: MediaRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL de la vidéo (YouTube, Vimeo, etc.)
        </label>
        <input
          type="url"
          value={safeBlock.data.url || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, url: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre de la vidéo
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Titre (optionnel)"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Largeur (%)
          </label>
          <input
            type="number"
            value={safeBlock.data.width || 100}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, width: parseInt(e.target.value) || 100 } })}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            min={50}
            max={100}
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
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            min={200}
            max={800}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`video-autoplay-${block.id}`}
          checked={safeBlock.data.autoplay || false}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, autoplay: e.target.checked } })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor={`video-autoplay-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
          Lecture automatique
        </label>
      </div>
    </div>
  )
}

export function renderGallery({ block, onUpdate }: MediaRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const galleryImages = safeBlock.data.images || []
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre de colonnes
        </label>
        <input
          type="number"
          value={safeBlock.data.columns || 3}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, columns: parseInt(e.target.value) || 3 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          min={1}
          max={6}
        />
      </div>
      <CollapsibleSection title="Images" count={galleryImages.length} defaultCollapsed={false}>
        <div className="space-y-3">
          {galleryImages.map((img: string, index: number) => (
            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Image {index + 1}</span>
                <button
                  onClick={() => {
                    const newImages = galleryImages.filter((_: string, i: number) => i !== index)
                    onUpdate({ data: { ...safeBlock.data, images: newImages } })
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                  title="Supprimer cette image"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              </div>
              <ImageSelector
                value={img}
                onChange={(url) => {
                  const newImages = [...galleryImages]
                  newImages[index] = url
                  onUpdate({ data: { ...safeBlock.data, images: newImages } })
                }}
                className="text-sm"
                projectId={1}
              />
            </div>
          ))}
          <button
            onClick={() => {
              const newImages = [...galleryImages, '']
              onUpdate({ data: { ...safeBlock.data, images: newImages } })
            }}
            className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
          >
            <span>+</span>
            <span>Ajouter une image</span>
          </button>
        </div>
      </CollapsibleSection>
    </div>
  )
}

export function renderBanner({ block, onUpdate }: MediaRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre de la bannière
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Titre de la bannière"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Sous-titre (optionnel)
        </label>
        <input
          type="text"
          value={safeBlock.data.subtitle || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, subtitle: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Sous-titre"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Image de fond
        </label>
        <ImageSelector
          value={safeBlock.data.background_image || ''}
          onChange={(url) => onUpdate({ data: { ...safeBlock.data, background_image: url } })}
          className="text-sm"
          projectId={1}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hauteur minimale (px)
          </label>
          <input
            type="number"
            value={safeBlock.data.min_height || 400}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, min_height: parseInt(e.target.value) || 400 } })}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            min={200}
            max={1000}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Alignement du texte
          </label>
          <select
            value={safeBlock.data.text_align || 'center'}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, text_align: e.target.value } })}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="left">Gauche</option>
            <option value="center">Centre</option>
            <option value="right">Droite</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export function renderCarousel({ block, onUpdate }: MediaRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const carouselItems = safeBlock.data.items || []
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Éléments du carousel ({carouselItems.length})
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {carouselItems.map((item: any, index: number) => (
            <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
              <input
                type="url"
                value={item.image || ''}
                onChange={(e) => {
                  const newItems = [...carouselItems]
                  newItems[index] = { ...item, image: e.target.value }
                  onUpdate({ data: { ...block.data, items: newItems } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="URL de l'image"
              />
              <input
                type="text"
                value={item.title || ''}
                onChange={(e) => {
                  const newItems = [...carouselItems]
                  newItems[index] = { ...item, title: e.target.value }
                  onUpdate({ data: { ...block.data, items: newItems } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Titre (optionnel)"
              />
              <input
                type="text"
                value={item.description || ''}
                onChange={(e) => {
                  const newItems = [...carouselItems]
                  newItems[index] = { ...item, description: e.target.value }
                  onUpdate({ data: { ...block.data, items: newItems } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Description (optionnel)"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onUpdate({ data: { ...block.data, items: [...carouselItems, { image: '', title: '', description: '' }] } })}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Ajouter
          </button>
          {carouselItems.length > 1 && (
            <button
              onClick={() => onUpdate({ data: { ...block.data, items: carouselItems.slice(0, -1) } })}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              - Supprimer
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Vitesse (ms)
          </label>
          <input
            type="number"
            value={safeBlock.data.autoplay_speed || 3000}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, autoplay_speed: parseInt(e.target.value) || 3000 } })}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            min={1000}
            max={10000}
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id={`carousel-autoplay-${block.id}`}
            checked={safeBlock.data.autoplay !== false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, autoplay: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor={`carousel-autoplay-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
            Lecture automatique
          </label>
        </div>
      </div>
    </div>
  )
}

export function renderAudioPlayer({ block, onUpdate }: MediaRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL du fichier audio
        </label>
        <input
          type="url"
          value={safeBlock.data.src || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, src: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Titre de l'audio"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Contrôles
        </label>
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={safeBlock.data.controls !== false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, controls: e.target.checked } })}
              className="w-4 h-4"
            />
            Afficher les contrôles
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={safeBlock.data.autoplay === true}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, autoplay: e.target.checked } })}
              className="w-4 h-4"
            />
            Lecture automatique
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={safeBlock.data.loop === true}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, loop: e.target.checked } })}
              className="w-4 h-4"
            />
            Répéter
          </label>
        </div>
      </div>
    </div>
  )
}

export function renderLogoGrid({ block, onUpdate }: MediaRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const logos = safeBlock.data.logos || [{ url: '', alt: '' }]
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
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Nos partenaires"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre de colonnes
        </label>
        <input
          type="number"
          value={safeBlock.data.columns || 4}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, columns: Math.max(1, Math.min(6, parseInt(e.target.value) || 4)) } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          min={1}
          max={6}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Logos ({logos.length})
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {logos.map((logo: any, index: number) => (
            <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
              <input
                type="text"
                value={logo.url || ''}
                onChange={(e) => {
                  const newLogos = [...logos]
                  newLogos[index] = { ...logo, url: e.target.value }
                  onUpdate({ data: { ...block.data, logos: newLogos } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="URL du logo"
              />
              <input
                type="text"
                value={logo.alt || ''}
                onChange={(e) => {
                  const newLogos = [...logos]
                  newLogos[index] = { ...logo, alt: e.target.value }
                  onUpdate({ data: { ...block.data, logos: newLogos } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Texte alternatif"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onUpdate({ data: { ...block.data, logos: [...logos, { url: '', alt: '' }] } })}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Ajouter
          </button>
          {logos.length > 1 && (
            <button
              onClick={() => onUpdate({ data: { ...block.data, logos: logos.slice(0, -1) } })}
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

