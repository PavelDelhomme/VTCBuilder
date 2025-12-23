'use client'

/**
 * Éditeur de configuration pour le bloc Hero
 */

import React from 'react'
import { Block } from '@/components/editor/types'
import { CollapsibleSection } from '@/components/editor/CollapsibleSection'
import ImageSelector from '@/components/editor/ui/ImageSelector'
import PageSelector from '@/components/editor/ui/PageSelector'

interface ComplexRendererProps {
  block: Block
  onUpdate: (updates: Partial<Block>) => void
}

export function renderHero({ block, onUpdate }: ComplexRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  
  // Initialiser les boutons par défaut si aucun bouton n'existe
  const defaultButtons = [
    { text: 'Démarrer gratuitement', url: '/register', style: 'primary' },
    { text: 'Voir les tarifs', url: '#pricing', style: 'secondary' }
  ]
  const heroButtons = safeBlock.data.buttons && safeBlock.data.buttons.length > 0 
    ? safeBlock.data.buttons 
    : defaultButtons
  
  // Initialiser le type de fond si non défini
  const heroBackgroundType = safeBlock.data.background_type || (safeBlock.data.background_image ? 'image' : 'gradient')
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre principal
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Titre Hero"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Sous-titre
        </label>
        <textarea
          value={safeBlock.data.subtitle || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, subtitle: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Sous-titre"
          rows={2}
        />
      </div>
      
      {/* Type de fond */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Type de fond
        </label>
        <select
          value={heroBackgroundType}
          onChange={(e) => {
            const newType = e.target.value
            const newData: any = { ...safeBlock.data, background_type: newType }
            // Réinitialiser les valeurs selon le type
            if (newType === 'image') {
              newData.background_color = undefined
              newData.background_gradient = undefined
            } else if (newType === 'color') {
              newData.background_image = undefined
              newData.background_gradient = undefined
              if (!newData.background_color) {
                newData.background_color = '#667eea'
              }
            } else if (newType === 'gradient') {
              newData.background_image = undefined
              newData.background_color = undefined
              if (!newData.background_gradient) {
                newData.background_gradient = 'from-blue-500 via-purple-600 to-pink-500'
              }
            }
            onUpdate({ data: newData })
          }}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="image">Image</option>
          <option value="color">Couleur unie</option>
          <option value="gradient">Dégradé</option>
        </select>
      </div>
      
      {/* Image de fond */}
      {heroBackgroundType === 'image' && (
        <div>
          <ImageSelector
            value={safeBlock.data.background_image || ''}
            onChange={(url) => onUpdate({ data: { ...safeBlock.data, background_image: url } })}
            label="Image de fond"
            projectId={1}
            placeholder="Sélectionner ou uploader une image de fond"
          />
        </div>
      )}
      
      {/* Couleur de fond */}
      {heroBackgroundType === 'color' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Couleur de fond
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={safeBlock.data.background_color || '#667eea'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, background_color: e.target.value } })}
              className="w-16 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            />
            <input
              type="text"
              value={safeBlock.data.background_color || '#667eea'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, background_color: e.target.value } })}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="#667eea"
            />
          </div>
        </div>
      )}
      
      {/* Gradient de fond */}
      {heroBackgroundType === 'gradient' && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Dégradé
          </label>
          {(() => {
            const gradientMap: Record<string, string> = {
              'blue-purple-pink': 'from-blue-500 via-purple-600 to-pink-500',
              'blue-cyan': 'from-blue-500 to-cyan-500',
              'purple-pink': 'from-purple-500 to-pink-500',
              'green-blue': 'from-green-500 to-blue-500',
              'orange-red': 'from-orange-500 to-red-500',
              'indigo-purple': 'from-indigo-500 to-purple-500',
              'teal-cyan': 'from-teal-500 to-cyan-500',
              'rose-pink': 'from-rose-500 to-pink-500',
              'violet-purple': 'from-violet-500 to-purple-500',
              'dark-gray': 'from-gray-900 via-gray-800 to-gray-900',
            }
            const reverseMap: Record<string, string> = {}
            Object.entries(gradientMap).forEach(([key, value]) => {
              reverseMap[value] = key
            })
            const currentGradient = safeBlock.data.background_gradient || 'from-blue-500 via-purple-600 to-pink-500'
            const selectedKey = reverseMap[currentGradient] || 'blue-purple-pink'
            return (
              <select
                value={selectedKey}
                onChange={(e) => {
                  onUpdate({ data: { ...safeBlock.data, background_gradient: gradientMap[e.target.value] || gradientMap['blue-purple-pink'] } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="blue-purple-pink">Bleu → Violet → Rose</option>
                <option value="blue-cyan">Bleu → Cyan</option>
                <option value="purple-pink">Violet → Rose</option>
                <option value="green-blue">Vert → Bleu</option>
                <option value="orange-red">Orange → Rouge</option>
                <option value="indigo-purple">Indigo → Violet</option>
                <option value="teal-cyan">Sarcelle → Cyan</option>
                <option value="rose-pink">Rose → Rose clair</option>
                <option value="violet-purple">Violet → Violet foncé</option>
                <option value="dark-gray">Gris foncé (mode sombre)</option>
              </select>
            )
          })()}
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 mt-2">
              Dégradé personnalisé (format Tailwind - optionnel)
            </label>
            <input
              type="text"
              value={safeBlock.data.background_gradient || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, background_gradient: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="from-blue-500 via-purple-600 to-pink-500"
            />
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
              Exemples: from-blue-500 to-purple-600, from-pink-500 via-red-500 to-yellow-500
            </p>
          </div>
        </div>
      )}
      <CollapsibleSection title="Boutons" count={heroButtons.length} defaultCollapsed={false}>
        <div className="space-y-2">
          {heroButtons.map((btn: any, index: number) => (
            <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  value={btn.text || ''}
                  onChange={(e) => {
                    const buttons = [...heroButtons]
                    buttons[index] = { ...btn, text: e.target.value }
                    onUpdate({ data: { ...block.data, buttons } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  placeholder="Texte du bouton"
                />
                <select
                  value={btn.style || 'primary'}
                  onChange={(e) => {
                    const buttons = [...heroButtons]
                    buttons[index] = { ...btn, style: e.target.value }
                    onUpdate({ data: { ...block.data, buttons } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                >
                  <option value="primary">Principal</option>
                  <option value="secondary">Secondaire</option>
                </select>
              </div>
              <PageSelector
                value={btn.url || ''}
                onChange={(url) => {
                  const buttons = [...heroButtons]
                  buttons[index] = { ...btn, url }
                  onUpdate({ data: { ...block.data, buttons } })
                }}
                placeholder="URL du bouton..."
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              />
              <button
                onClick={() => {
                  const buttons = [...heroButtons]
                  const newButtons = buttons.filter((_: any, i: number) => i !== index)
                  onUpdate({ data: { ...block.data, buttons: newButtons.length > 0 ? newButtons : defaultButtons } })
                }}
                className="mt-2 w-full px-3 py-1.5 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                title="Supprimer ce bouton"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Supprimer ce bouton
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const buttons = [...heroButtons]
              onUpdate({ data: { ...block.data, buttons: [...buttons, { text: '', url: '', style: 'primary' }] } })
            }}
            className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Ajouter un bouton
          </button>
        </div>
      </CollapsibleSection>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`hero-overlay-${block.id}`}
          checked={safeBlock.data.overlay || false}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, overlay: e.target.checked } })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor={`hero-overlay-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
          Overlay sombre sur l'image
        </label>
      </div>
    </div>
  )
}

