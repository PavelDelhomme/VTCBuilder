'use client'

import React from 'react'
import { Block } from '../types'
import { BlockType } from '@/services/blocks.service'
import UrlInputWithSuggestions from '../ui/UrlInputWithSuggestions'
import ImageSelector from '../ui/ImageSelector'
import { getGradientFromTailwind } from '../utils/gradient'

export function renderCTASectionEditor(block: Block, onUpdate: (updates: Partial<Block>) => void) {
  const safeBlock = { ...block, data: block.data || {} }
  
  // Déterminer le style d'arrière-plan
  const ctaBackgroundType = safeBlock.data?.background_type || 'gradient'
  let backgroundStyle: React.CSSProperties = {}
  
  if (ctaBackgroundType === 'image' && safeBlock.data?.background_image) {
    backgroundStyle = {
      backgroundImage: safeBlock.data.background_overlay 
        ? `url(${safeBlock.data.background_image}), ${safeBlock.data.background_overlay}`
        : `url(${safeBlock.data.background_image})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
    if (safeBlock.data.background_image_opacity !== undefined) {
      backgroundStyle.opacity = safeBlock.data.background_image_opacity
    }
  } else if (ctaBackgroundType === 'solid') {
    backgroundStyle.backgroundColor = safeBlock.data?.background_color || '#2563eb'
  } else {
    // Gradient par défaut - convertir depuis Tailwind si nécessaire
    const gradientValue = safeBlock.data?.background_gradient
    if (gradientValue && (gradientValue.includes('from-') || gradientValue.includes('to-'))) {
      backgroundStyle.background = getGradientFromTailwind(gradientValue)
    } else {
      backgroundStyle.background = gradientValue || 'linear-gradient(to right, #2563eb, #9333ea)'
    }
  }

  const buttonUrl = safeBlock.data?.button_url || safeBlock.data?.button_link
  const buttonText = safeBlock.data?.button_text

  return (
    <div className="space-y-4">
      {/* Prévisualisation */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <div
          style={{
            ...backgroundStyle,
            padding: '3rem 2rem',
            minHeight: '200px',
          }}
          className="rounded-lg"
        >
          <div className="max-w-4xl mx-auto text-center">
            {safeBlock.data.title && (
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                {safeBlock.data.title}
              </h2>
            )}
            {(safeBlock.data.description || safeBlock.data.subtitle) && (
              <p className="text-base sm:text-lg text-white/90 mb-6 max-w-2xl mx-auto">
                {safeBlock.data.description || safeBlock.data.subtitle}
              </p>
            )}
            {buttonText && buttonUrl && (
              <div className="inline-block px-8 py-3 rounded-lg font-bold text-base transition-all shadow-xl bg-white text-blue-600">
                {buttonText}
              </div>
            )}
            {(!safeBlock.data.title && !safeBlock.data.description && !buttonText) && (
              <p className="text-white/70 text-sm">Aperçu du bloc CTA - Configurez les champs ci-dessous</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Formulaire d'édition */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Titre
          </label>
          <input
            type="text"
            value={safeBlock.data.title || ''}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Prêt à démarrer ?"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={safeBlock.data.description || ''}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, description: e.target.value } })}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            rows={3}
            placeholder="Créez votre site VTC professionnel dès aujourd'hui..."
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Texte du bouton
          </label>
          <input
            type="text"
            value={safeBlock.data.button_text || ''}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_text: e.target.value } })}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="🚀 Créer mon compte gratuitement"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL du bouton
          </label>
          <UrlInputWithSuggestions
            value={safeBlock.data.button_url || ''}
            onChange={(url) => onUpdate({ data: { ...safeBlock.data, button_url: url } })}
            placeholder="/register"
            className="text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Style du bouton
          </label>
          <select
            value={safeBlock.data.button_style || 'light'}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_style: e.target.value } })}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="light">Clair (blanc sur fond coloré)</option>
            <option value="dark">Sombre (gris foncé)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type d'arrière-plan
          </label>
          <select
            value={safeBlock.data.background_type || 'gradient'}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, background_type: e.target.value } })}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-2"
          >
            <option value="gradient">Dégradé de couleur</option>
            <option value="image">Image</option>
            <option value="solid">Couleur unie</option>
          </select>
        </div>

        {safeBlock.data.background_type === 'gradient' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dégradé de fond
            </label>
            <input
              type="text"
              value={safeBlock.data.background_gradient || 'linear-gradient(to right, #2563eb, #9333ea)'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, background_gradient: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
              placeholder="linear-gradient(to right, #2563eb, #9333ea)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Exemples: linear-gradient(to right, #2563eb, #9333ea) ou radial-gradient(circle, #2563eb, #9333ea)
            </p>
          </div>
        )}

        {safeBlock.data.background_type === 'image' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image de fond
            </label>
            <ImageSelector
              value={safeBlock.data.background_image || ''}
              onChange={(imageUrl) => onUpdate({ data: { ...safeBlock.data, background_image: imageUrl } })}
              className="text-sm"
              projectId={1}
            />
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Opacité de l'image (0-1)
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={safeBlock.data.background_image_opacity || 1}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, background_image_opacity: parseFloat(e.target.value) || 1 } })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
            </div>
            <div className="mt-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dégradé par-dessus l'image (optionnel)
              </label>
              <input
                type="text"
                value={safeBlock.data.background_overlay || ''}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, background_overlay: e.target.value } })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
                placeholder="linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))"
              />
            </div>
          </div>
        )}

        {safeBlock.data.background_type === 'solid' && (
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Couleur de fond
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={safeBlock.data.background_color || '#2563eb'}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, background_color: e.target.value } })}
                className="h-8 w-16 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={safeBlock.data.background_color || '#2563eb'}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, background_color: e.target.value } })}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
                placeholder="#2563eb"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

