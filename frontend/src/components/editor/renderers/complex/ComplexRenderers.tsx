'use client'

import React from 'react'
import { Block } from '../../types'
import { BlockType } from '@/services/blocks.service'
import { CollapsibleSection } from '../../CollapsibleSection'
import UrlInputWithSuggestions from '../../ui/UrlInputWithSuggestions'
import PageSelector from '../../ui/PageSelector'
import ImageSelector from '../../ui/ImageSelector'
import { renderCTASectionEditor } from '../CTAEditor'

interface ComplexRendererProps {
  block: Block
  blockType?: BlockType
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
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Dégradé (format Tailwind)
          </label>
          <input
            type="text"
            value={safeBlock.data.background_gradient || 'from-blue-500 via-purple-600 to-pink-500'}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, background_gradient: e.target.value } })}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="from-blue-500 via-purple-600 to-pink-500"
          />
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
            Exemples: from-blue-500 to-purple-600, from-pink-500 via-red-500 to-yellow-500
          </p>
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

export function renderHeader({ block, onUpdate }: ComplexRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const headerLinks = safeBlock.data.links || []
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte du logo
        </label>
        <input
          type="text"
          value={safeBlock.data.logo_text || 'VTCBuilder'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, logo_text: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="VTCBuilder"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL du logo (lien)
        </label>
        <input
          type="text"
          value={safeBlock.data.logo_url || '/'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, logo_url: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="/"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Image du logo
        </label>
        <ImageSelector
          value={safeBlock.data.logo_image || ''}
          onChange={(imageUrl) => onUpdate({ data: { ...safeBlock.data, logo_image: imageUrl } })}
          className="text-sm"
          projectId={1}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Uploadez une image ou sélectionnez-en une depuis votre bibliothèque média
        </p>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Badge (optionnel)
        </label>
        <input
          type="text"
          value={safeBlock.data.badge || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, badge: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Beta"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Header sticky
        </label>
        <input
          type="checkbox"
          checked={safeBlock.data.sticky !== false}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, sticky: e.target.checked } })}
          className="w-4 h-4"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Afficher le toggle de thème
        </label>
        <input
          type="checkbox"
          checked={safeBlock.data.show_theme_toggle !== false}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_theme_toggle: e.target.checked } })}
          className="w-4 h-4"
        />
      </div>
      <CollapsibleSection title="Liens de navigation" count={headerLinks.length} defaultCollapsed={false}>
        <div className="space-y-3">
          {headerLinks.map((link: any, index: number) => (
            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Lien {index + 1}</span>
                <button
                  onClick={() => {
                    const newLinks = headerLinks.filter((_: any, i: number) => i !== index)
                    onUpdate({ data: { ...block.data, links: newLinks } })
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                  title="Supprimer ce lien"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={link.label || ''}
                  onChange={(e) => {
                    const newLinks = [...headerLinks]
                    newLinks[index] = { ...link, label: e.target.value }
                    onUpdate({ data: { ...block.data, links: newLinks } })
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="Label"
                />
                <input
                  type="text"
                  value={link.url || ''}
                  onChange={(e) => {
                    const newLinks = [...headerLinks]
                    newLinks[index] = { ...link, url: e.target.value }
                    onUpdate({ data: { ...block.data, links: newLinks } })
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="URL"
                />
              </div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2">Personnalisation CSS</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="color"
                  value={link.color || '#374151'}
                  onChange={(e) => {
                    const newLinks = [...headerLinks]
                    newLinks[index] = { ...link, color: e.target.value }
                    onUpdate({ data: { ...block.data, links: newLinks } })
                  }}
                  className="h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  title="Couleur du texte"
                />
                <input
                  type="color"
                  value={link.hover_color || '#111827'}
                  onChange={(e) => {
                    const newLinks = [...headerLinks]
                    newLinks[index] = { ...link, hover_color: e.target.value }
                    onUpdate({ data: { ...block.data, links: newLinks } })
                  }}
                  className="h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                  title="Couleur au survol"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={link.font_size || ''}
                  onChange={(e) => {
                    const newLinks = [...headerLinks]
                    newLinks[index] = { ...link, font_size: e.target.value }
                    onUpdate({ data: { ...block.data, links: newLinks } })
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="Taille police (ex: 14px)"
                />
                <input
                  type="text"
                  value={link.font_weight || ''}
                  onChange={(e) => {
                    const newLinks = [...headerLinks]
                    newLinks[index] = { ...link, font_weight: e.target.value }
                    onUpdate({ data: { ...block.data, links: newLinks } })
                  }}
                  className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="Poids police (ex: 500)"
                />
              </div>
              <input
                type="text"
                value={link.custom_class || ''}
                onChange={(e) => {
                  const newLinks = [...headerLinks]
                  newLinks[index] = { ...link, custom_class: e.target.value }
                  onUpdate({ data: { ...block.data, links: newLinks } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Classes CSS personnalisées (optionnel)"
              />
            </div>
          ))}
          <button
            onClick={() => {
              const newLinks = [...headerLinks, { label: '', url: '#', color: '#374151', hover_color: '#111827' }]
              onUpdate({ data: { ...block.data, links: newLinks } })
            }}
            className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
          >
            <span>+</span>
            <span>Ajouter un lien</span>
          </button>
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Bouton CTA" defaultCollapsed={true}>
        <div className="space-y-2">
          <input
            type="text"
            value={safeBlock.data.cta_button?.text || ''}
            onChange={(e) => onUpdate({ 
              data: { 
                ...block.data, 
                cta_button: { 
                  ...safeBlock.data.cta_button, 
                  text: e.target.value 
                } 
              } 
            })}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            placeholder="Texte du bouton"
          />
          <input
            type="text"
            value={safeBlock.data.cta_button?.url || ''}
            onChange={(e) => onUpdate({ 
              data: { 
                ...block.data, 
                cta_button: { 
                  ...safeBlock.data.cta_button, 
                  url: e.target.value 
                } 
              } 
            })}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            placeholder="URL du bouton"
          />
          <select
            value={safeBlock.data.cta_button?.style || 'primary'}
            onChange={(e) => onUpdate({ 
              data: { 
                ...block.data, 
                cta_button: { 
                  ...safeBlock.data.cta_button, 
                  style: e.target.value 
                } 
              } 
            })}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="primary">Primaire</option>
            <option value="secondary">Secondaire</option>
          </select>
        </div>
      </CollapsibleSection>
    </div>
  )
}

export function renderFooter({ block, onUpdate }: ComplexRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const footerColumns = safeBlock.data.columns || [
    { title: 'Produit', description: '', links: [
      { label: 'Tarifs', url: '/#pricing' },
      { label: 'Fonctionnalités', url: '/features' },
      { label: 'Templates', url: '/templates' }
    ]},
    { title: 'Support', description: '', links: [
      { label: 'Documentation', url: '/docs' },
      { label: 'Contact', url: '/contact' },
      { label: 'FAQ', url: '/faq' }
    ]},
    { title: 'Légal', description: '', links: [
      { label: 'CGV', url: '/legal/terms' },
      { label: 'Confidentialité', url: '/legal/privacy' }
    ]}
  ]
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre du footer
        </label>
        <input
          type="text"
          value={safeBlock.data.title || 'VTCBuilder'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="VTCBuilder"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description du footer
        </label>
        <textarea
          value={safeBlock.data.description || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, description: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          rows={2}
          placeholder="La solution complète pour créer votre site VTC professionnel."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte du copyright
        </label>
        <input
          type="text"
          value={safeBlock.data.copyright || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, copyright: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="© 2024 Votre Entreprise. Tous droits réservés."
        />
      </div>
      <CollapsibleSection title="Colonnes du footer" count={footerColumns.length} defaultCollapsed={false}>
        <div className="space-y-2">
          {footerColumns.map((column: any, colIndex: number) => (
            <div key={colIndex} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
              <input
                type="text"
                value={column.title || ''}
                onChange={(e) => {
                  const newColumns = [...footerColumns]
                  newColumns[colIndex] = { ...column, title: e.target.value }
                  onUpdate({ data: { ...block.data, columns: newColumns } })
                }}
                className="w-full mb-2 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Titre de la colonne"
              />
              <textarea
                value={column.description || ''}
                onChange={(e) => {
                  const newColumns = [...footerColumns]
                  newColumns[colIndex] = { ...column, description: e.target.value }
                  onUpdate({ data: { ...block.data, columns: newColumns } })
                }}
                className="w-full mb-2 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                rows={2}
                placeholder="Description de la colonne (optionnel)"
              />
              <div className="space-y-1">
                {(column.links || []).map((link: any, linkIndex: number) => (
                  <div key={linkIndex} className="flex gap-1">
                    <UrlInputWithSuggestions
                      value={link.url || ''}
                      onChange={(url) => {
                        const newColumns = [...footerColumns]
                        const newLinks = [...(newColumns[colIndex].links || [])]
                        newLinks[linkIndex] = { ...link, url }
                        newColumns[colIndex] = { ...column, links: newLinks }
                        onUpdate({ data: { ...block.data, columns: newColumns } })
                      }}
                      placeholder="URL"
                      className="text-xs flex-1"
                    />
                    <input
                      type="text"
                      value={link.label || ''}
                      onChange={(e) => {
                        const newColumns = [...footerColumns]
                        const newLinks = [...(newColumns[colIndex].links || [])]
                        newLinks[linkIndex] = { ...link, label: e.target.value }
                        newColumns[colIndex] = { ...column, links: newLinks }
                        onUpdate({ data: { ...block.data, columns: newColumns } })
                      }}
                      className="w-24 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      placeholder="Label"
                    />
                    <button
                      onClick={() => {
                        const newColumns = [...footerColumns]
                        newColumns[colIndex] = {
                          ...column,
                          links: (column.links || []).filter((_: any, i: number) => i !== linkIndex)
                        }
                        onUpdate({ data: { ...block.data, columns: newColumns } })
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center"
                      title="Supprimer ce lien"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newColumns = [...footerColumns]
                    newColumns[colIndex] = {
                      ...column,
                      links: [...(column.links || []), { label: '', url: '' }]
                    }
                    onUpdate({ data: { ...block.data, columns: newColumns } })
                  }}
                  className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  + Ajouter lien
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onUpdate({ data: { ...block.data, columns: [...footerColumns, { title: '', links: [] }] } })}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Ajouter colonne
          </button>
          {footerColumns.length > 1 && (
            <button
              onClick={() => onUpdate({ data: { ...block.data, columns: footerColumns.slice(0, -1) } })}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              - Supprimer colonne
            </button>
          )}
        </div>
      </CollapsibleSection>
    </div>
  )
}

export function renderFeaturesGrid({ block, onUpdate }: ComplexRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const features = safeBlock.data.features || [
    { icon: '🎨', title: 'Site Professionnel', description: 'Designs modernes et responsive. Personnalisez votre site sans coder.' },
    { icon: '📅', title: 'Réservations en Ligne', description: 'Système de réservation complet avec calendrier et notifications.' },
    { icon: '💳', title: 'Paiements Intégrés', description: 'Acceptez les paiements en ligne. Cartes bancaires, virement, tout est possible.' }
  ]
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
          placeholder="Tout ce dont vous avez besoin"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre de colonnes
        </label>
        <select
          value={safeBlock.data.columns || 3}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, columns: parseInt(e.target.value) } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value={1}>1 colonne</option>
          <option value={2}>2 colonnes</option>
          <option value={3}>3 colonnes</option>
          <option value={4}>4 colonnes</option>
        </select>
      </div>
      <CollapsibleSection title="Fonctionnalités" count={features.length} defaultCollapsed={false}>
        <div className="space-y-2">
          {features.map((feature: any, index: number) => (
            <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={feature.icon || ''}
                  onChange={(e) => {
                    const newFeatures = [...features]
                    newFeatures[index] = { ...feature, icon: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, features: newFeatures } })
                  }}
                  className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-center"
                  placeholder="🎨"
                />
                <input
                  type="text"
                  value={feature.title || ''}
                  onChange={(e) => {
                    const newFeatures = [...features]
                    newFeatures[index] = { ...feature, title: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, features: newFeatures } })
                  }}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  placeholder="Titre de la fonctionnalité"
                />
                <button
                  onClick={() => {
                    const newFeatures = features.filter((_: any, i: number) => i !== index)
                    onUpdate({ data: { ...safeBlock.data, features: newFeatures } })
                  }}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center gap-1"
                  title="Supprimer cette fonctionnalité"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              </div>
              <textarea
                value={feature.description || ''}
                onChange={(e) => {
                  const newFeatures = [...features]
                  newFeatures[index] = { ...feature, description: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, features: newFeatures } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Description de la fonctionnalité"
                rows={2}
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => onUpdate({ data: { ...safeBlock.data, features: [...features, { icon: '✨', title: '', description: '' }] } })}
          className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Ajouter une fonctionnalité
        </button>
      </CollapsibleSection>
    </div>
  )
}

export function renderPricing({ block, onUpdate }: ComplexRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const defaultPlans = [
    {
      name: 'Starter',
      description: 'Pour débuter',
      price_monthly: '29',
      price_yearly: '290',
      period: 'monthly',
      badge: '',
      is_featured: false,
      features: ['Site professionnel', 'Réservations', 'Paiements', 'Support email'],
      button_text: 'Choisir ce plan',
      button_url: '/register?plan=starter',
      button_style: 'primary'
    },
    {
      name: 'Pro',
      description: 'Pour les professionnels',
      price_monthly: '79',
      price_yearly: '790',
      period: 'monthly',
      badge: 'POPULAIRE',
      is_featured: true,
      features: ['Tout Starter', 'Analytics avancés', 'Support prioritaire', 'Personnalisation avancée'],
      button_text: 'Choisir ce plan',
      button_url: '/register?plan=pro',
      button_style: 'primary'
    },
    {
      name: 'Enterprise',
      description: 'Pour les grandes entreprises',
      price_monthly: '199',
      price_yearly: '1990',
      period: 'monthly',
      badge: '',
      is_featured: false,
      features: ['Tout Pro', 'Multi-sites', 'API personnalisée', 'Support dédié'],
      button_text: 'Nous contacter',
      button_url: '/contact',
      button_style: 'secondary'
    }
  ]
  const plans = safeBlock.data.plans && safeBlock.data.plans.length > 0 
    ? safeBlock.data.plans 
    : defaultPlans
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre de la section
        </label>
        <input
          type="text"
          value={safeBlock.data.title || 'Tarifs Transparents'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Tarifs Transparents"
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
          placeholder="Choisissez le plan qui vous convient"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Plans tarifaires ({plans.length})
        </label>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {plans.map((plan: any, planIndex: number) => (
            <div key={planIndex} className="p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Plan {planIndex + 1}
                </span>
                <button
                  onClick={() => {
                    const newPlans = plans.filter((_: any, i: number) => i !== planIndex)
                    onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                  }}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center gap-1"
                  title="Supprimer ce plan"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              </div>
              
              {/* Nom du plan */}
              <div className="mb-2">
                <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Nom du plan
                </label>
                <input
                  type="text"
                  value={plan.name || ''}
                  onChange={(e) => {
                    const newPlans = [...plans]
                    newPlans[planIndex] = { ...plan, name: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  placeholder="Starter, Pro, Enterprise..."
                />
              </div>

              {/* Description */}
              <div className="mb-2">
                <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={plan.description || ''}
                  onChange={(e) => {
                    const newPlans = [...plans]
                    newPlans[planIndex] = { ...plan, description: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  placeholder="Description courte du plan"
                />
              </div>

              {/* Prix */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Prix mensuel (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={plan.price_monthly || ''}
                    onChange={(e) => {
                      const newPlans = [...plans]
                      newPlans[planIndex] = { ...plan, price_monthly: e.target.value }
                      onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="29.99"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Prix annuel (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={plan.price_yearly || ''}
                    onChange={(e) => {
                      const newPlans = [...plans]
                      newPlans[planIndex] = { ...plan, price_yearly: e.target.value }
                      onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="299.99"
                  />
                </div>
              </div>

              {/* Badge et Featured */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Badge (optionnel)
                  </label>
                  <input
                    type="text"
                    value={plan.badge || ''}
                    onChange={(e) => {
                      const newPlans = [...plans]
                      newPlans[planIndex] = { ...plan, badge: e.target.value }
                      onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="POPULAIRE, RECOMMANDÉ..."
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400">
                    <input
                      type="checkbox"
                      checked={plan.is_featured || false}
                      onChange={(e) => {
                        const newPlans = [...plans]
                        newPlans[planIndex] = { ...plan, is_featured: e.target.checked }
                        onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                      }}
                      className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    Plan mis en avant
                  </label>
                </div>
              </div>

              {/* Fonctionnalités */}
              <div className="mb-2">
                <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Fonctionnalités ({(plan.features || []).length})
                </label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {(plan.features || []).map((feature: string, featureIndex: number) => (
                    <div key={featureIndex} className="flex items-center gap-1">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const newPlans = [...plans]
                          const newFeatures = [...(plan.features || [])]
                          newFeatures[featureIndex] = e.target.value
                          newPlans[planIndex] = { ...plan, features: newFeatures }
                          onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                        }}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                        placeholder="Fonctionnalité"
                      />
                      <button
                        onClick={() => {
                          const newPlans = [...plans]
                          const newFeatures = (plan.features || []).filter((_: string, i: number) => i !== featureIndex)
                          newPlans[planIndex] = { ...plan, features: newFeatures }
                          onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                        }}
                        className="px-1.5 py-1 text-[10px] bg-red-500 text-white rounded hover:bg-red-600"
                        title="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const newPlans = [...plans]
                    const newFeatures = [...(plan.features || []), '']
                    newPlans[planIndex] = { ...plan, features: newFeatures }
                    onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                  }}
                  className="mt-1 px-2 py-1 text-[10px] bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  + Ajouter fonctionnalité
                </button>
              </div>

              {/* Bouton d'action */}
              <div className="grid grid-cols-3 gap-1">
                <div className="col-span-2">
                  <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Texte bouton
                  </label>
                  <input
                    type="text"
                    value={plan.button_text || ''}
                    onChange={(e) => {
                      const newPlans = [...plans]
                      newPlans[planIndex] = { ...plan, button_text: e.target.value }
                      onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Choisir ce plan"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Style
                  </label>
                  <select
                    value={plan.button_style || 'primary'}
                    onChange={(e) => {
                      const newPlans = [...plans]
                      newPlans[planIndex] = { ...plan, button_style: e.target.value }
                      onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                    }}
                    className="w-full px-1 py-1 text-[10px] border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  >
                    <option value="primary">Primaire</option>
                    <option value="secondary">Secondaire</option>
                    <option value="outline">Contour</option>
                  </select>
                </div>
              </div>
              <div className="mt-1">
                <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                  URL bouton
                </label>
                <UrlInputWithSuggestions
                  value={plan.button_url || ''}
                  onChange={(url) => {
                    const newPlans = [...plans]
                    newPlans[planIndex] = { ...plan, button_url: url }
                    onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                  }}
                  placeholder="/register?plan=starter"
                  className="text-xs"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => onUpdate({ 
            data: { 
              ...safeBlock.data, 
              plans: [...plans, { 
                name: '', 
                description: '',
                price_monthly: '', 
                price_yearly: '',
                period: 'monthly',
                badge: '',
                is_featured: false,
                features: [], 
                button_text: 'Choisir ce plan', 
                button_url: '',
                button_style: 'primary'
              }] 
            } 
          })}
          className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Ajouter un plan tarifaire
        </button>
      </div>
    </div>
  )
}

export function renderCTASection({ block, onUpdate }: ComplexRendererProps) {
  return renderCTASectionEditor(block, onUpdate)
}

export function renderTestimonials({ block, onUpdate }: ComplexRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const testimonials = safeBlock.data.testimonials || [{ name: '', role: '', content: '', avatar: '' }]
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
          placeholder="Témoignages de nos clients"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Témoignages ({testimonials.length})
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {testimonials.map((testimonial: any, index: number) => (
            <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
              <input
                type="text"
                value={testimonial.name || ''}
                onChange={(e) => {
                  const newTestimonials = [...testimonials]
                  newTestimonials[index] = { ...testimonial, name: e.target.value }
                  onUpdate({ data: { ...block.data, testimonials: newTestimonials } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Nom"
              />
              <input
                type="text"
                value={testimonial.role || ''}
                onChange={(e) => {
                  const newTestimonials = [...testimonials]
                  newTestimonials[index] = { ...testimonial, role: e.target.value }
                  onUpdate({ data: { ...block.data, testimonials: newTestimonials } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Rôle/Poste"
              />
              <textarea
                value={testimonial.content || ''}
                onChange={(e) => {
                  const newTestimonials = [...testimonials]
                  newTestimonials[index] = { ...testimonial, content: e.target.value }
                  onUpdate({ data: { ...block.data, testimonials: newTestimonials } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Témoignage"
                rows={2}
              />
              <input
                type="url"
                value={testimonial.avatar || ''}
                onChange={(e) => {
                  const newTestimonials = [...testimonials]
                  newTestimonials[index] = { ...testimonial, avatar: e.target.value }
                  onUpdate({ data: { ...block.data, testimonials: newTestimonials } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="URL avatar (optionnel)"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onUpdate({ data: { ...block.data, testimonials: [...testimonials, { name: '', role: '', content: '', avatar: '' }] } })}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Ajouter
          </button>
          {testimonials.length > 1 && (
            <button
              onClick={() => onUpdate({ data: { ...block.data, testimonials: testimonials.slice(0, -1) } })}
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

export function renderTimeline({ block, onUpdate }: ComplexRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const events = safeBlock.data.events || [{ date: '', title: '', description: '' }]
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
          placeholder="Notre histoire"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Événements ({events.length})
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {events.map((event: any, index: number) => (
            <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
              <input
                type="text"
                value={event.date || ''}
                onChange={(e) => {
                  const newEvents = [...events]
                  newEvents[index] = { ...event, date: e.target.value }
                  onUpdate({ data: { ...block.data, events: newEvents } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Date (ex: 2024)"
              />
              <input
                type="text"
                value={event.title || ''}
                onChange={(e) => {
                  const newEvents = [...events]
                  newEvents[index] = { ...event, title: e.target.value }
                  onUpdate({ data: { ...block.data, events: newEvents } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Titre"
              />
              <textarea
                value={event.description || ''}
                onChange={(e) => {
                  const newEvents = [...events]
                  newEvents[index] = { ...event, description: e.target.value }
                  onUpdate({ data: { ...block.data, events: newEvents } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Description"
                rows={2}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onUpdate({ data: { ...block.data, events: [...events, { date: '', title: '', description: '' }] } })}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Ajouter
          </button>
          {events.length > 1 && (
            <button
              onClick={() => onUpdate({ data: { ...block.data, events: events.slice(0, -1) } })}
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

export function renderAccordion({ block, onUpdate }: ComplexRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const items = safeBlock.data.items || [{ title: '', content: '' }]
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
          placeholder="Questions fréquentes"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Éléments ({items.length})
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {items.map((item: any, index: number) => (
            <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
              <input
                type="text"
                value={item.title || ''}
                onChange={(e) => {
                  const newItems = [...items]
                  newItems[index] = { ...item, title: e.target.value }
                  onUpdate({ data: { ...block.data, items: newItems } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Titre"
              />
              <textarea
                value={item.content || ''}
                onChange={(e) => {
                  const newItems = [...items]
                  newItems[index] = { ...item, content: e.target.value }
                  onUpdate({ data: { ...block.data, items: newItems } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Contenu"
                rows={2}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onUpdate({ data: { ...block.data, items: [...items, { title: '', content: '' }] } })}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Ajouter
          </button>
          {items.length > 1 && (
            <button
              onClick={() => onUpdate({ data: { ...block.data, items: items.slice(0, -1) } })}
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

export function renderStats({ block, onUpdate }: ComplexRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const stats = safeBlock.data.stats || [{ label: '', value: '', icon: '' }]
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
          placeholder="Nos statistiques"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Statistiques ({stats.length})
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {stats.map((stat: any, index: number) => (
            <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
              <input
                type="text"
                value={stat.value || ''}
                onChange={(e) => {
                  const newStats = [...stats]
                  newStats[index] = { ...stat, value: e.target.value }
                  onUpdate({ data: { ...block.data, stats: newStats } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Valeur (ex: 1000+)"
              />
              <input
                type="text"
                value={stat.label || ''}
                onChange={(e) => {
                  const newStats = [...stats]
                  newStats[index] = { ...stat, label: e.target.value }
                  onUpdate({ data: { ...block.data, stats: newStats } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Label (ex: Clients satisfaits)"
              />
              <input
                type="text"
                value={stat.icon || ''}
                onChange={(e) => {
                  const newStats = [...stats]
                  newStats[index] = { ...stat, icon: e.target.value }
                  onUpdate({ data: { ...block.data, stats: newStats } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Icône emoji (ex: 👥)"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onUpdate({ data: { ...block.data, stats: [...stats, { label: '', value: '', icon: '' }] } })}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Ajouter
          </button>
          {stats.length > 1 && (
            <button
              onClick={() => onUpdate({ data: { ...block.data, stats: stats.slice(0, -1) } })}
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

export function renderSocialLinks({ block, onUpdate }: ComplexRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const links = safeBlock.data.links || [{ platform: '', url: '', icon: '' }]
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
          placeholder="Suivez-nous"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Liens sociaux ({links.length})
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {links.map((link: any, index: number) => (
            <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
              <input
                type="text"
                value={link.platform || ''}
                onChange={(e) => {
                  const newLinks = [...links]
                  newLinks[index] = { ...link, platform: e.target.value }
                  onUpdate({ data: { ...block.data, links: newLinks } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Plateforme (ex: Facebook)"
              />
              <UrlInputWithSuggestions
                value={link.url || ''}
                onChange={(url) => {
                  const newLinks = [...links]
                  newLinks[index] = { ...link, url }
                  onUpdate({ data: { ...block.data, links: newLinks } })
                }}
                placeholder="URL"
                className="text-xs"
              />
              <input
                type="text"
                value={link.icon || ''}
                onChange={(e) => {
                  const newLinks = [...links]
                  newLinks[index] = { ...link, icon: e.target.value }
                  onUpdate({ data: { ...block.data, links: newLinks } })
                }}
                className="w-full mt-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Icône emoji (ex: 📘)"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onUpdate({ data: { ...block.data, links: [...links, { platform: '', url: '', icon: '' }] } })}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Ajouter
          </button>
          {links.length > 1 && (
            <button
              onClick={() => onUpdate({ data: { ...block.data, links: links.slice(0, -1) } })}
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

export function renderFAQ({ block, onUpdate }: ComplexRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const faqItems = safeBlock.data.items || []
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre de la section FAQ
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Questions fréquentes"
        />
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description (optionnel)
        </label>
        <textarea
          value={safeBlock.data.description || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, description: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          rows={2}
          placeholder="Description de la section FAQ"
        />
      </div>

      <CollapsibleSection title="Questions FAQ" count={faqItems.length} defaultCollapsed={false}>
        <div className="space-y-3">
          {faqItems.map((item: any, index: number) => (
            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Question {index + 1}</span>
                <button
                  onClick={() => {
                    const newItems = faqItems.filter((_: any, i: number) => i !== index)
                    onUpdate({ data: { ...safeBlock.data, items: newItems } })
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                  title="Supprimer cette question"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={item.question || ''}
                  onChange={(e) => {
                    const newItems = [...faqItems]
                    newItems[index] = { ...item, question: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, items: newItems } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Votre question"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Réponse
                </label>
                <textarea
                  value={item.answer || ''}
                  onChange={(e) => {
                    const newItems = [...faqItems]
                    newItems[index] = { ...item, answer: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, items: newItems } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  rows={3}
                  placeholder="Votre réponse"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newItems = [...faqItems, { question: '', answer: '' }]
              onUpdate({ data: { ...safeBlock.data, items: newItems } })
            }}
            className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
          >
            <span>+</span>
            <span>Ajouter une question</span>
          </button>
        </div>
      </CollapsibleSection>
    </div>
  )
}
