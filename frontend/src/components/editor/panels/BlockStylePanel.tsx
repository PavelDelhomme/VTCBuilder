'use client'

import React from 'react'
import { Block } from '../types'
import { BlockType } from '@/services/blocks.service'

interface BlockStylePanelProps {
  block: Block
  onUpdate: (updates: Partial<Block>) => void
  allBlocks?: Block[]
  blockTypes?: BlockType[]
}

export function BlockStylePanel({
  block,
  onUpdate,
  allBlocks = [],
  blockTypes = [],
}: BlockStylePanelProps) {
  const updateStyle = (key: string, value: any) => {
    const newStyles = { ...block.styles }
    
    // Si on met à jour background_color, supprimer background si c'est un gradient
    if (key === 'background_color' || key === 'backgroundColor') {
      if (newStyles.background && newStyles.background.includes('gradient')) {
        delete newStyles.background
      }
      // Mettre à jour les deux propriétés pour compatibilité
      newStyles.background_color = value
      newStyles.backgroundColor = value
    } else {
      newStyles[key] = value
    }
    
    // Mise à jour immédiate pour les styles (comme pour data)
    // Passer un objet avec immediate: true pour forcer la mise à jour immédiate
    onUpdate({
      styles: newStyles,
    })
  }

  const commonColors = [
    { name: 'Blanc', value: '#ffffff', class: 'bg-white' },
    { name: 'Noir', value: '#000000', class: 'bg-black' },
    { name: 'Gris clair', value: '#f3f4f6', class: 'bg-gray-100' },
    { name: 'Gris', value: '#6b7280', class: 'bg-gray-500' },
    { name: 'Gris foncé', value: '#1f2937', class: 'bg-gray-800' },
    { name: 'Bleu', value: '#3b82f6', class: 'bg-blue-500' },
    { name: 'Bleu foncé', value: '#1e40af', class: 'bg-blue-800' },
    { name: 'Vert', value: '#10b981', class: 'bg-green-500' },
    { name: 'Rouge', value: '#ef4444', class: 'bg-red-500' },
    { name: 'Jaune', value: '#f59e0b', class: 'bg-yellow-500' },
    { name: 'Violet', value: '#8b5cf6', class: 'bg-purple-500' },
    { name: 'Rose', value: '#ec4899', class: 'bg-pink-500' },
  ]

  // Déterminer si c'est un conteneur (pas besoin de couleur de texte ni typographie)
  const isContainer = block.type === 'container' || 
                     block.type === 'grid-container' || 
                     block.type === 'flex-container' || 
                     block.type === 'columns'

  return (
    <div className="space-y-4 pb-4">
      {/* Support du mode sombre */}
      <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={block.data?.support_dark_mode !== false}
            onChange={(e) => onUpdate({ data: { ...block.data, support_dark_mode: e.target.checked } })}
            className="w-3 h-3"
          />
          <span className="text-gray-700 dark:text-gray-300">Support du mode sombre</span>
        </label>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
          Activez cette option pour que le bloc s'adapte automatiquement au mode sombre. Désactivez pour forcer le mode clair.
        </p>
      </div>
      
      {/* Section Couleurs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Couleurs</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
        </div>
      
      {/* Couleur de fond */}
      <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Couleur de fond
        </label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="color"
            value={block.styles?.background_color || '#ffffff'}
            onChange={(e) => updateStyle('background_color', e.target.value)}
            className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
          />
          <input
            type="text"
            value={block.styles?.background_color || '#ffffff'}
            onChange={(e) => updateStyle('background_color', e.target.value)}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="#ffffff"
          />
        </div>
        <div className="grid grid-cols-6 gap-1">
          {commonColors.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => updateStyle('background_color', color.value)}
              className={`w-full h-8 rounded border-2 ${
                block.styles?.background_color === color.value
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-300 dark:border-gray-600'
              } ${color.class}`}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Couleur de texte - Masquer pour les conteneurs */}
      {!isContainer && (
        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Couleur de texte
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={block.styles?.color || '#000000'}
              onChange={(e) => updateStyle('color', e.target.value)}
              className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <input
              type="text"
              value={block.styles?.color || '#000000'}
              onChange={(e) => updateStyle('color', e.target.value)}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="#000000"
            />
          </div>
        </div>
      )}
      </div>

      {/* Section Typographie - Masquer pour les conteneurs */}
      {!isContainer && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">📝 Typographie</span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
          </div>

        {/* Famille de police */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Famille de police
          </label>
          <select
            value={block.styles?.font_family || block.styles?.fontFamily || 'inherit'}
            onChange={(e) => {
              updateStyle('font_family', e.target.value)
              updateStyle('fontFamily', e.target.value)
            }}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="inherit">Héritée (par défaut)</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
            <option value="'Times New Roman', Times, serif">Times New Roman</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Courier New', Courier, monospace">Courier New</option>
            <option value="Verdana, sans-serif">Verdana</option>
            <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
            <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
            <option value="Impact, sans-serif">Impact</option>
            <option value="'Lucida Console', Monaco, monospace">Lucida Console</option>
            <option value="'Palatino Linotype', 'Book Antiqua', Palatino, serif">Palatino</option>
            <option value="Tahoma, sans-serif">Tahoma</option>
            <option value="'Century Gothic', sans-serif">Century Gothic</option>
            <option value="'Lucida Sans Unicode', 'Lucida Grande', sans-serif">Lucida Sans</option>
            <option value="'Arial Black', sans-serif">Arial Black</option>
            <option value="'Gill Sans', 'Gill Sans MT', sans-serif">Gill Sans</option>
            <option value="'Bookman Old Style', serif">Bookman Old Style</option>
            <option value="'Garamond', serif">Garamond</option>
            <option value="'MS Sans Serif', sans-serif">MS Sans Serif</option>
            <option value="'MS Serif', serif">MS Serif</option>
            <option value="'Symbol', sans-serif">Symbol</option>
            <option value="'Webdings', sans-serif">Webdings</option>
            <option value="'Wingdings', sans-serif">Wingdings</option>
            <option value="'Segoe UI', Tahoma, sans-serif">Segoe UI</option>
            <option value="'Roboto', sans-serif">Roboto</option>
            <option value="'Open Sans', sans-serif">Open Sans</option>
            <option value="'Lato', sans-serif">Lato</option>
            <option value="'Montserrat', sans-serif">Montserrat</option>
            <option value="'Raleway', sans-serif">Raleway</option>
            <option value="'Poppins', sans-serif">Poppins</option>
            <option value="'Playfair Display', serif">Playfair Display</option>
            <option value="'Merriweather', serif">Merriweather</option>
            <option value="'Oswald', sans-serif">Oswald</option>
            <option value="'Source Sans Pro', sans-serif">Source Sans Pro</option>
            <option value="'Ubuntu', sans-serif">Ubuntu</option>
            <option value="'PT Sans', sans-serif">PT Sans</option>
            <option value="'Droid Sans', sans-serif">Droid Sans</option>
            <option value="'Droid Serif', serif">Droid Serif</option>
            <option value="'Noto Sans', sans-serif">Noto Sans</option>
            <option value="'Noto Serif', serif">Noto Serif</option>
            <option value="'Fira Sans', sans-serif">Fira Sans</option>
            <option value="'Fira Code', monospace">Fira Code (Monospace)</option>
            <option value="'Inconsolata', monospace">Inconsolata (Monospace)</option>
            <option value="'Space Mono', monospace">Space Mono (Monospace)</option>
          </select>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
            Les polices Google Fonts nécessitent d'être chargées dans votre thème
          </p>
        </div>

        {/* Taille de police */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Taille de police
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={block.styles?.font_size || block.styles?.fontSize || ''}
              onChange={(e) => {
                updateStyle('font_size', e.target.value)
                updateStyle('fontSize', e.target.value)
              }}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="1rem, 16px, 1.2em..."
            />
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  updateStyle('font_size', e.target.value)
                  updateStyle('fontSize', e.target.value)
                  e.target.value = ''
                }
              }}
              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">Rapide</option>
              <option value="0.75rem">Très petit (0.75rem)</option>
              <option value="0.875rem">Petit (0.875rem)</option>
              <option value="1rem">Normal (1rem)</option>
              <option value="1.125rem">Moyen (1.125rem)</option>
              <option value="1.25rem">Grand (1.25rem)</option>
              <option value="1.5rem">Très grand (1.5rem)</option>
              <option value="2rem">Énorme (2rem)</option>
              <option value="3rem">Géant (3rem)</option>
            </select>
          </div>
        </div>

        {/* Poids de police */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Poids de police
          </label>
          <select
            value={block.styles?.font_weight || block.styles?.fontWeight || 'normal'}
            onChange={(e) => {
              updateStyle('font_weight', e.target.value)
              updateStyle('fontWeight', e.target.value)
            }}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="100">100 - Thin</option>
            <option value="200">200 - Extra Light</option>
            <option value="300">300 - Light</option>
            <option value="400">400 - Normal</option>
            <option value="500">500 - Medium</option>
            <option value="600">600 - Semi Bold</option>
            <option value="700">700 - Bold</option>
            <option value="800">800 - Extra Bold</option>
            <option value="900">900 - Black</option>
            <option value="normal">Normal (400)</option>
            <option value="bold">Bold (700)</option>
            <option value="lighter">Lighter</option>
            <option value="bolder">Bolder</option>
          </select>
        </div>

        {/* Style de police */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Style de police
          </label>
          <select
            value={block.styles?.font_style || block.styles?.fontStyle || 'normal'}
            onChange={(e) => {
              updateStyle('font_style', e.target.value)
              updateStyle('fontStyle', e.target.value)
            }}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="normal">Normal</option>
            <option value="italic">Italique</option>
            <option value="oblique">Oblique</option>
          </select>
        </div>

        {/* Hauteur de ligne */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hauteur de ligne (Line Height)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={block.styles?.line_height || block.styles?.lineHeight || ''}
              onChange={(e) => {
                updateStyle('line_height', e.target.value)
                updateStyle('lineHeight', e.target.value)
              }}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="1.5, 1.6, 24px..."
            />
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  updateStyle('line_height', e.target.value)
                  updateStyle('lineHeight', e.target.value)
                  e.target.value = ''
                }
              }}
              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">Rapide</option>
              <option value="1">1 - Compact</option>
              <option value="1.2">1.2 - Serré</option>
              <option value="1.5">1.5 - Normal</option>
              <option value="1.6">1.6 - Confortable</option>
              <option value="1.8">1.8 - Espacé</option>
              <option value="2">2 - Très espacé</option>
            </select>
          </div>
        </div>

        {/* Styles spécifiques pour Hero - Titre et Sous-titre */}
        {block.type === 'hero' && (
          <>
            <div className="flex items-center gap-2 mb-2 mt-4">
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Titre Hero</span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
            </div>
            
            {/* Taille du titre */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Taille du titre
              </label>
              <input
                type="text"
                value={block.styles?.title_font_size || block.styles?.titleFontSize || ''}
                onChange={(e) => {
                  updateStyle('title_font_size', e.target.value)
                  updateStyle('titleFontSize', e.target.value)
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="3rem, 48px, 4xl..."
              />
            </div>
            
            {/* Poids du titre */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Poids du titre
              </label>
              <select
                value={block.styles?.title_font_weight || block.styles?.titleFontWeight || 'bold'}
                onChange={(e) => {
                  updateStyle('title_font_weight', e.target.value)
                  updateStyle('titleFontWeight', e.target.value)
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="400">400 - Normal</option>
                <option value="500">500 - Medium</option>
                <option value="600">600 - Semi Bold</option>
                <option value="700">700 - Bold</option>
                <option value="800">800 - Extra Bold</option>
                <option value="900">900 - Black</option>
                <option value="bold">Bold (700)</option>
                <option value="extrabold">Extra Bold (800)</option>
              </select>
            </div>
            
            {/* Couleur du titre */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Couleur du titre
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={block.styles?.title_color || block.styles?.titleColor || '#ffffff'}
                  onChange={(e) => {
                    updateStyle('title_color', e.target.value)
                    updateStyle('titleColor', e.target.value)
                  }}
                  className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={block.styles?.title_color || block.styles?.titleColor || '#ffffff'}
                  onChange={(e) => {
                    updateStyle('title_color', e.target.value)
                    updateStyle('titleColor', e.target.value)
                  }}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2 mt-4">
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Sous-titre Hero</span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
            </div>
            
            {/* Taille du sous-titre */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Taille du sous-titre
              </label>
              <input
                type="text"
                value={block.styles?.subtitle_font_size || block.styles?.subtitleFontSize || ''}
                onChange={(e) => {
                  updateStyle('subtitle_font_size', e.target.value)
                  updateStyle('subtitleFontSize', e.target.value)
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="1.5rem, 24px, xl..."
              />
            </div>
            
            {/* Poids du sous-titre */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Poids du sous-titre
              </label>
              <select
                value={block.styles?.subtitle_font_weight || block.styles?.subtitleFontWeight || 'normal'}
                onChange={(e) => {
                  updateStyle('subtitle_font_weight', e.target.value)
                  updateStyle('subtitleFontWeight', e.target.value)
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="300">300 - Light</option>
                <option value="400">400 - Normal</option>
                <option value="500">500 - Medium</option>
                <option value="600">600 - Semi Bold</option>
                <option value="700">700 - Bold</option>
                <option value="normal">Normal (400)</option>
              </select>
            </div>
            
            {/* Couleur du sous-titre */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Couleur du sous-titre
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={block.styles?.subtitle_color || block.styles?.subtitleColor || '#ffffff'}
                  onChange={(e) => {
                    updateStyle('subtitle_color', e.target.value)
                    updateStyle('subtitleColor', e.target.value)
                  }}
                  className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={block.styles?.subtitle_color || block.styles?.subtitleColor || '#ffffff'}
                  onChange={(e) => {
                    updateStyle('subtitle_color', e.target.value)
                    updateStyle('subtitleColor', e.target.value)
                  }}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </>
        )}

        {/* Espacement des lettres */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Espacement des lettres (Letter Spacing)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={block.styles?.letter_spacing || block.styles?.letterSpacing || ''}
              onChange={(e) => {
                updateStyle('letter_spacing', e.target.value)
                updateStyle('letterSpacing', e.target.value)
              }}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="0px, 0.1em, -1px..."
            />
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  updateStyle('letter_spacing', e.target.value)
                  updateStyle('letterSpacing', e.target.value)
                  e.target.value = ''
                }
              }}
              className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">Rapide</option>
              <option value="normal">Normal (0)</option>
              <option value="0.05em">Tight (-0.05em)</option>
              <option value="0.1em">Loose (0.1em)</option>
              <option value="0.2em">Wide (0.2em)</option>
              <option value="0.5em">Very Wide (0.5em)</option>
            </select>
          </div>
        </div>

        {/* Espacement des mots */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Espacement des mots (Word Spacing)
          </label>
          <input
            type="text"
            value={block.styles?.word_spacing || block.styles?.wordSpacing || ''}
            onChange={(e) => {
              updateStyle('word_spacing', e.target.value)
              updateStyle('wordSpacing', e.target.value)
            }}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="normal, 0.2em, 5px..."
          />
        </div>

        {/* Transformation de texte */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Transformation de texte
          </label>
          <select
            value={block.styles?.text_transform || block.styles?.textTransform || 'none'}
            onChange={(e) => {
              updateStyle('text_transform', e.target.value)
              updateStyle('textTransform', e.target.value)
            }}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="none">Aucune</option>
            <option value="uppercase">MAJUSCULES</option>
            <option value="lowercase">minuscules</option>
            <option value="capitalize">Première Lettre Majuscule</option>
          </select>
        </div>

        {/* Décoration de texte */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Décoration de texte
          </label>
          <select
            value={block.styles?.text_decoration || block.styles?.textDecoration || 'none'}
            onChange={(e) => {
              updateStyle('text_decoration', e.target.value)
              updateStyle('textDecoration', e.target.value)
            }}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="none">Aucune</option>
            <option value="underline">Souligné</option>
            <option value="overline">Ligne au-dessus</option>
            <option value="line-through">Barré</option>
          </select>
        </div>

        {/* Alignement du texte */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Alignement du texte
          </label>
          <div className="grid grid-cols-4 gap-1">
            {[
              { value: 'left', icon: '←', label: 'Gauche' },
              { value: 'center', icon: '↔', label: 'Centre' },
              { value: 'right', icon: '→', label: 'Droite' },
              { value: 'justify', icon: '⇄', label: 'Justifié' }
            ].map((align) => (
              <button
                key={align.value}
                type="button"
                onClick={() => {
                  updateStyle('text_align', align.value)
                  updateStyle('textAlign', align.value)
                }}
                className={`px-2 py-1.5 text-xs rounded border transition-all ${
                  (block.styles?.text_align || block.styles?.textAlign || 'left') === align.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                }`}
                title={align.label}
              >
                <span className="text-sm">{align.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ombre de texte */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ombre de texte (Text Shadow)
          </label>
          <input
            type="text"
            value={block.styles?.text_shadow || block.styles?.textShadow || ''}
            onChange={(e) => {
              updateStyle('text_shadow', e.target.value)
              updateStyle('textShadow', e.target.value)
            }}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
            placeholder="2px 2px 4px rgba(0,0,0,0.3)"
          />
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
            Format: offsetX offsetY blur color
          </p>
          <div className="flex gap-1 mt-1">
            {[
              { label: 'Aucune', value: 'none' },
              { label: 'Léger', value: '1px 1px 2px rgba(0,0,0,0.2)' },
              { label: 'Moyen', value: '2px 2px 4px rgba(0,0,0,0.3)' },
              { label: 'Fort', value: '3px 3px 6px rgba(0,0,0,0.4)' }
            ].map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => {
                  updateStyle('text_shadow', preset.value)
                  updateStyle('textShadow', preset.value)
                }}
                className="px-2 py-1 text-[10px] border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
        </div>
      )}

      {/* Propriétés avancées - Premium */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Propriétés avancées</span>
          <span className="px-2 py-0.5 text-[10px] font-bold text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 rounded">PREMIUM</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
        </div>
        
        {/* Z-index */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Z-index (superposition)
          </label>
          <input
            type="number"
            value={block.styles?.z_index || 0}
            onChange={(e) => updateStyle('z_index', parseInt(e.target.value) || 0)}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="0"
          />
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
            Contrôle la superposition des éléments (plus élevé = au-dessus)
          </p>
        </div>

        {/* Position */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type de position
          </label>
          <select
            value={block.position?.type || block.styles?.position || 'static'}
            onChange={(e) => {
              const positionType = e.target.value
              onUpdate({
                position: {
                  ...block.position,
                  type: positionType as 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
                },
                styles: {
                  ...block.styles,
                  position: positionType
                }
              })
            }}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="static">Statique (dans le flux)</option>
            <option value="relative">Relative (par rapport au flux)</option>
            <option value="absolute">Absolue (par rapport au parent)</option>
            <option value="fixed">Fixe (par rapport à la fenêtre)</option>
            <option value="sticky">Sticky (collant au scroll)</option>
          </select>
        </div>

        {/* Alignement */}
        {(block.position?.type === 'relative' || block.position?.type === 'absolute' || block.styles?.position === 'relative' || block.styles?.position === 'absolute') && (
          <>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Alignement horizontal
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { value: 'left', icon: '←', label: 'Gauche' },
                  { value: 'center', icon: '↔', label: 'Centre' },
                  { value: 'right', icon: '→', label: 'Droite' },
                  { value: 'stretch', icon: '↔', label: 'Étirer' }
                ].map((align) => (
                  <button
                    key={align.value}
                    type="button"
                    onClick={() => onUpdate({
                      position: {
                        type: block.position?.type || 'static',
                        ...block.position,
                        align: align.value as 'left' | 'center' | 'right' | 'stretch'
                      }
                    })}
                    className={`px-2 py-1.5 text-xs rounded border transition-all ${
                      (block.position?.align || 'left') === align.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                    }`}
                    title={align.label}
                  >
                    <span className="text-sm">{align.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Coordonnées pour position absolute */}
            {block.position?.type === 'absolute' && (
              <div className="mb-3 space-y-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Position (px ou %)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Top</label>
                    <input
                      type="text"
                      value={block.position?.top || ''}
                      onChange={(e) => onUpdate({
                        position: {
                          type: block.position?.type || 'absolute',
                          ...block.position,
                          top: e.target.value
                        },
                        styles: {
                          ...block.styles,
                          top: e.target.value
                        }
                      })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="0px"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Right</label>
                    <input
                      type="text"
                      value={block.position?.right || ''}
                      onChange={(e) => onUpdate({
                        position: {
                          type: block.position?.type || 'absolute',
                          ...block.position,
                          right: e.target.value
                        },
                        styles: {
                          ...block.styles,
                          right: e.target.value
                        }
                      })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="0px"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Bottom</label>
                    <input
                      type="text"
                      value={block.position?.bottom || ''}
                      onChange={(e) => onUpdate({
                        position: {
                          type: block.position?.type || 'absolute',
                          ...block.position,
                          bottom: e.target.value
                        },
                        styles: {
                          ...block.styles,
                          bottom: e.target.value
                        }
                      })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="0px"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Left</label>
                    <input
                      type="text"
                      value={block.position?.left || ''}
                      onChange={(e) => onUpdate({
                        position: {
                          type: block.position?.type || 'absolute',
                          ...block.position,
                          left: e.target.value
                        },
                        styles: {
                          ...block.styles,
                          left: e.target.value
                        }
                      })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="0px"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bloc de référence pour position relative */}
            {block.position?.type === 'relative' && (
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Aligner par rapport à un autre bloc (optionnel)
                </label>
                <select
                  value={block.position?.alignTo || ''}
                  onChange={(e) => onUpdate({
                    position: {
                      type: block.position?.type || 'relative',
                      ...block.position,
                      alignTo: e.target.value || undefined
                    }
                  })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Aucun (alignement normal)</option>
                  {/* Les options seront remplies dynamiquement avec les autres blocs */}
                </select>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  Choisissez un bloc pour aligner celui-ci par rapport à lui
                </p>
              </div>
            )}
          </>
        )}

        {/* Overflow */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Overflow (débordement)
          </label>
          <select
            value={block.styles?.overflow || 'visible'}
            onChange={(e) => updateStyle('overflow', e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="visible">Visible</option>
            <option value="hidden">Caché</option>
            <option value="scroll">Défilement</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        {/* Opacité */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Opacité (0-1)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={block.styles?.opacity || 1}
            onChange={(e) => updateStyle('opacity', parseFloat(e.target.value) || 1)}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Transform */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rotation (degrés)
          </label>
          <input
            type="number"
            value={block.styles?.transform_rotate || 0}
            onChange={(e) => {
              const rotate = parseInt(e.target.value) || 0
              updateStyle('transform', `rotate(${rotate}deg)`)
              updateStyle('transform_rotate', rotate)
            }}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="0"
          />
        </div>
      </div>

      {/* Section Espacement */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Espacement</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
        </div>
      
      {/* Padding */}
      <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Espacement interne (Padding)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Vertical</label>
            <input
              type="text"
              value={block.styles?.padding_vertical || ''}
              onChange={(e) => updateStyle('padding_vertical', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="1rem"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Horizontal</label>
            <input
              type="text"
              value={block.styles?.padding_horizontal || ''}
              onChange={(e) => updateStyle('padding_horizontal', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="1rem"
            />
          </div>
        </div>
        <div className="mt-2 flex gap-1">
          {['0', '0.5rem', '1rem', '2rem', '3rem', '4rem'].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => {
                updateStyle('padding_vertical', val)
                updateStyle('padding_horizontal', val)
              }}
              className={`flex-1 px-2 py-1 text-[10px] rounded border ${
                block.styles?.padding_vertical === val && block.styles?.padding_horizontal === val
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Margin */}
      <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Espacement externe (Margin)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Vertical</label>
            <input
              type="text"
              value={block.styles?.margin_vertical || ''}
              onChange={(e) => updateStyle('margin_vertical', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Horizontal</label>
            <input
              type="text"
              value={block.styles?.margin_horizontal || ''}
              onChange={(e) => updateStyle('margin_horizontal', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="0"
            />
          </div>
        </div>
      </div>
      </div>

      {/* Section Bordures */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Bordures</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
        </div>
      
      {/* Bordures */}
      <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Bordures
        </label>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Largeur</label>
              <select
                value={block.styles?.border_width || '0'}
                onChange={(e) => updateStyle('border_width', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="0">Aucune</option>
                <option value="1px">1px</option>
                <option value="2px">2px</option>
                <option value="4px">4px</option>
                <option value="8px">8px</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Style</label>
              <select
                value={block.styles?.border_style || 'solid'}
                onChange={(e) => updateStyle('border_style', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="solid">Solide</option>
                <option value="dashed">Tirets</option>
                <option value="dotted">Pointillés</option>
                <option value="double">Double</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Couleur</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={block.styles?.border_color || '#e5e7eb'}
                onChange={(e) => updateStyle('border_color', e.target.value)}
                className="w-10 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={block.styles?.border_color || '#e5e7eb'}
                onChange={(e) => updateStyle('border_color', e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="#e5e7eb"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Rayon (Border radius)</label>
            <select
              value={block.styles?.border_radius || '0'}
              onChange={(e) => updateStyle('border_radius', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="0">Aucun</option>
              <option value="0.25rem">Petit (0.25rem)</option>
              <option value="0.5rem">Moyen (0.5rem)</option>
              <option value="1rem">Grand (1rem)</option>
              <option value="1.5rem">Très grand (1.5rem)</option>
              <option value="9999px">Rond</option>
            </select>
          </div>
        </div>
      </div>
      </div>

      {/* Section Ombres */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Ombres</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
        </div>
      
        {/* Ombres */}
        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Ombres
          </label>
          <select
            value={block.styles?.box_shadow || 'none'}
            onChange={(e) => updateStyle('box_shadow', e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="none">Aucune</option>
            <option value="sm">Petite (sm)</option>
            <option value="md">Moyenne (md)</option>
            <option value="lg">Grande (lg)</option>
            <option value="xl">Très grande (xl)</option>
            <option value="2xl">Énorme (2xl)</option>
          </select>
        </div>
      </div>
    </div>
  )
}

