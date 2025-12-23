'use client'

import React from 'react'
import { Block } from '@/components/editor/types'
import { BlockType } from '@/services/blocks.service'
import { CollapsibleSection } from '@/components/editor/CollapsibleSection'
import ImageSelector from '@/components/editor/ui/ImageSelector'
import UrlInputWithSuggestions from '@/components/editor/ui/UrlInputWithSuggestions'

interface ComplexRendererProps {
  block: Block
  blockType?: BlockType
  onUpdate: (updates: Partial<Block>) => void
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
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
          {headerLinks.map((link: any, index: number) => {
            const [isCollapsed, setIsCollapsed] = React.useState(false)
            return (
            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title={isCollapsed ? "Développer" : "Réduire"}
                  >
                    <svg 
                      className={`w-3 h-3 text-gray-600 dark:text-gray-300 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Lien {index + 1}</span>
                </div>
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
              {!isCollapsed && (
                <>
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
                </>
              )}
            </div>
            )
          })}
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
      <CollapsibleSection title="Boutons CTA" count={safeBlock.data.cta_buttons?.length || (safeBlock.data.cta_button ? 1 : 0)} defaultCollapsed={true}>
        <div className="space-y-3">
          {(safeBlock.data.cta_buttons && safeBlock.data.cta_buttons.length > 0 ? safeBlock.data.cta_buttons : (safeBlock.data.cta_button ? [safeBlock.data.cta_button] : [])).map((cta: any, index: number) => {
            const [isCollapsed, setIsCollapsed] = React.useState(false)
            return (
              <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsCollapsed(!isCollapsed)}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title={isCollapsed ? "Développer" : "Réduire"}
                    >
                      <svg 
                        className={`w-3 h-3 text-gray-600 dark:text-gray-300 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Bouton {index + 1}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (safeBlock.data.cta_buttons && safeBlock.data.cta_buttons.length > 0) {
                        const newButtons = safeBlock.data.cta_buttons.filter((_: any, i: number) => i !== index)
                        onUpdate({ data: { ...block.data, cta_buttons: newButtons } })
                      } else {
                        onUpdate({ data: { ...block.data, cta_button: undefined, cta_buttons: [] } })
                      }
                    }}
                    className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                    title="Supprimer ce bouton"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer
                  </button>
                </div>
                {!isCollapsed && (
                  <>
                    <input
                      type="text"
                      value={cta.text || ''}
                      onChange={(e) => {
                        if (safeBlock.data.cta_buttons && safeBlock.data.cta_buttons.length > 0) {
                          const newButtons = [...safeBlock.data.cta_buttons]
                          newButtons[index] = { ...cta, text: e.target.value }
                          onUpdate({ data: { ...block.data, cta_buttons: newButtons } })
                        } else {
                          onUpdate({
                            data: {
                              ...block.data,
                              cta_button: { ...cta, text: e.target.value },
                              cta_buttons: [{ ...cta, text: e.target.value }]
                            }
                          })
                        }
                      }}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="Texte du bouton"
                    />
                    <UrlInputWithSuggestions
                      value={cta.url || ''}
                      onChange={(url) => {
                        if (safeBlock.data.cta_buttons && safeBlock.data.cta_buttons.length > 0) {
                          const newButtons = [...safeBlock.data.cta_buttons]
                          newButtons[index] = { ...cta, url: url }
                          onUpdate({ data: { ...block.data, cta_buttons: newButtons } })
                        } else {
                          onUpdate({
                            data: {
                              ...block.data,
                              cta_button: { ...cta, url: url },
                              cta_buttons: [{ ...cta, url: url }]
                            }
                          })
                        }
                      }}
                      className="w-full text-xs"
                      placeholder="URL du bouton ou sélectionner une page"
                    />
                    <select
                      value={cta.style || 'primary'}
                      onChange={(e) => {
                        if (safeBlock.data.cta_buttons && safeBlock.data.cta_buttons.length > 0) {
                          const newButtons = [...safeBlock.data.cta_buttons]
                          newButtons[index] = { ...cta, style: e.target.value }
                          onUpdate({ data: { ...block.data, cta_buttons: newButtons } })
                        } else {
                          onUpdate({
                            data: {
                              ...block.data,
                              cta_button: { ...cta, style: e.target.value },
                              cta_buttons: [{ ...cta, style: e.target.value }]
                            }
                          })
                        }
                      }}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="primary">Primaire</option>
                      <option value="secondary">Secondaire</option>
                    </select>
                  </>
                )}
              </div>
            )
          })}
          <button
            onClick={() => {
              const newButton = { text: '', url: '#', style: 'primary' }
              if (safeBlock.data.cta_buttons && safeBlock.data.cta_buttons.length > 0) {
                onUpdate({ data: { ...block.data, cta_buttons: [...safeBlock.data.cta_buttons, newButton] } })
              } else {
                onUpdate({ data: { ...block.data, cta_buttons: [newButton] } })
              }
            }}
            className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
          >
            <span>+</span>
            <span>Ajouter un bouton CTA</span>
          </button>
        </div>
      </CollapsibleSection>
    </div>
  )
}

