'use client'

import React from 'react'
import { Block } from '../types'
import { BlockType } from '@/services/blocks.service'
// BlockRenderer is defined in BlockEditor.tsx and exported
// We need to import it from there
import { BlockRenderer } from '../BlockRenderer'
import UrlInputWithSuggestions from '../ui/UrlInputWithSuggestions'

interface BlockPropertiesPanelProps {
  block: Block
  blockType?: BlockType
  onUpdate: (updates: Partial<Block>) => void
  selectedSubElement?: { blockId: string; type: string; index: number } | null
}

export function BlockPropertiesPanel({
  block,
  blockType,
  onUpdate,
  selectedSubElement,
}: BlockPropertiesPanelProps) {
  // S'assurer que block.data existe pour éviter les erreurs
  const safeBlock = { ...block, data: block.data || {} }
  
  if (!blockType) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">Type de bloc non trouvé</div>
  }

  // Si un sous-élément est sélectionné, afficher sa configuration spécifique
  if (selectedSubElement && selectedSubElement.blockId === block.id) {
    const { type, index } = selectedSubElement
    
    // Configuration pour un lien de navigation dans le header
    if (type === 'header-link' && block.type === 'header') {
      const headerLinks = safeBlock.data.links || []
      const link = headerLinks[index]
      if (link) {
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Configuration du lien de navigation {index + 1}
              </h3>
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
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Label</label>
                <input
                  type="text"
                  value={link.label || ''}
                  onChange={(e) => {
                    const newLinks = [...headerLinks]
                    newLinks[index] = { ...link, label: e.target.value }
                    onUpdate({ data: { ...block.data, links: newLinks } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="Label"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
                <UrlInputWithSuggestions
                  value={link.url || ''}
                  onChange={(url) => {
                    const newLinks = [...headerLinks]
                    newLinks[index] = { ...link, url: url }
                    onUpdate({ data: { ...block.data, links: newLinks } })
                  }}
                  className="w-full text-xs"
                  placeholder="URL ou sélectionner une page"
                />
              </div>
            </div>
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-3">Personnalisation CSS</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Couleur</label>
                <input
                  type="color"
                  value={link.color || '#374151'}
                  onChange={(e) => {
                    const newLinks = [...headerLinks]
                    newLinks[index] = { ...link, color: e.target.value }
                    onUpdate({ data: { ...block.data, links: newLinks } })
                  }}
                  className="w-full h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Couleur au survol</label>
                <input
                  type="color"
                  value={link.hover_color || '#111827'}
                  onChange={(e) => {
                    const newLinks = [...headerLinks]
                    newLinks[index] = { ...link, hover_color: e.target.value }
                    onUpdate({ data: { ...block.data, links: newLinks } })
                  }}
                  className="w-full h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Taille police</label>
                <input
                  type="text"
                  value={link.font_size || ''}
                  onChange={(e) => {
                    const newLinks = [...headerLinks]
                    newLinks[index] = { ...link, font_size: e.target.value }
                    onUpdate({ data: { ...block.data, links: newLinks } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="14px"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Poids police</label>
                <input
                  type="text"
                  value={link.font_weight || ''}
                  onChange={(e) => {
                    const newLinks = [...headerLinks]
                    newLinks[index] = { ...link, font_weight: e.target.value }
                    onUpdate({ data: { ...block.data, links: newLinks } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Classes CSS personnalisées</label>
              <input
                type="text"
                value={link.custom_class || ''}
                onChange={(e) => {
                  const newLinks = [...headerLinks]
                  newLinks[index] = { ...link, custom_class: e.target.value }
                  onUpdate({ data: { ...block.data, links: newLinks } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Classes CSS (optionnel)"
              />
            </div>
          </div>
        )
      }
    }
    
    // Configuration pour un bouton CTA dans le header
    if (type === 'header-cta-button' && block.type === 'header') {
      const ctaButtons = safeBlock.data.cta_buttons && Array.isArray(safeBlock.data.cta_buttons) && safeBlock.data.cta_buttons.length > 0
        ? safeBlock.data.cta_buttons
        : (safeBlock.data.cta_button && typeof safeBlock.data.cta_button === 'object' && safeBlock.data.cta_button.text
          ? [safeBlock.data.cta_button]
          : [])
      const ctaButton = ctaButtons[index]
      if (ctaButton) {
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Configuration du bouton CTA {index + 1}
              </h3>
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
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Texte du bouton</label>
              <input
                type="text"
                value={ctaButton.text || ''}
                onChange={(e) => {
                  if (safeBlock.data.cta_buttons && safeBlock.data.cta_buttons.length > 0) {
                    const newButtons = [...safeBlock.data.cta_buttons]
                    newButtons[index] = { ...ctaButton, text: e.target.value }
                    onUpdate({ data: { ...block.data, cta_buttons: newButtons } })
                  } else {
                    onUpdate({
                      data: {
                        ...block.data,
                        cta_button: { ...ctaButton, text: e.target.value },
                        cta_buttons: [{ ...ctaButton, text: e.target.value }]
                      }
                    })
                  }
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Texte du bouton"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
              <UrlInputWithSuggestions
                value={ctaButton.url || ''}
                onChange={(url) => {
                  if (safeBlock.data.cta_buttons && safeBlock.data.cta_buttons.length > 0) {
                    const newButtons = [...safeBlock.data.cta_buttons]
                    newButtons[index] = { ...ctaButton, url: url }
                    onUpdate({ data: { ...block.data, cta_buttons: newButtons } })
                  } else {
                    onUpdate({
                      data: {
                        ...block.data,
                        cta_button: { ...ctaButton, url: url },
                        cta_buttons: [{ ...ctaButton, url: url }]
                      }
                    })
                  }
                }}
                className="w-full text-xs"
                placeholder="URL ou sélectionner une page"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Style</label>
              <select
                value={ctaButton.style || 'primary'}
                onChange={(e) => {
                  if (safeBlock.data.cta_buttons && safeBlock.data.cta_buttons.length > 0) {
                    const newButtons = [...safeBlock.data.cta_buttons]
                    newButtons[index] = { ...ctaButton, style: e.target.value }
                    onUpdate({ data: { ...block.data, cta_buttons: newButtons } })
                  } else {
                    onUpdate({
                      data: {
                        ...block.data,
                        cta_button: { ...ctaButton, style: e.target.value },
                        cta_buttons: [{ ...ctaButton, style: e.target.value }]
                      }
                    })
                  }
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="primary">Primaire</option>
                <option value="secondary">Secondaire</option>
              </select>
            </div>
          </div>
        )
      }
    }
    
    // Configuration pour un bouton Hero
    if (type === 'hero-button' && block.type === 'hero') {
      const heroButtons = safeBlock.data.buttons && safeBlock.data.buttons.length > 0 
        ? safeBlock.data.buttons 
        : [
            { text: 'Démarrer gratuitement', url: '/register', style: 'primary' },
            { text: 'Voir les tarifs', url: '#pricing', style: 'secondary' }
          ]
      const button = heroButtons[index]
      if (button) {
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Configuration du bouton {index + 1}
              </h3>
              <button
                onClick={() => {
                  const newButtons = heroButtons.filter((_: any, i: number) => i !== index)
                  onUpdate({ data: { ...block.data, buttons: newButtons } })
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
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Texte</label>
              <input
                type="text"
                value={button.text || ''}
                onChange={(e) => {
                  const buttons = [...heroButtons]
                  buttons[index] = { ...button, text: e.target.value }
                  onUpdate({ data: { ...block.data, buttons } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Texte du bouton"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
              <UrlInputWithSuggestions
                value={button.url || ''}
                onChange={(url) => {
                  const buttons = [...heroButtons]
                  buttons[index] = { ...button, url: url }
                  onUpdate({ data: { ...block.data, buttons } })
                }}
                className="w-full text-xs"
                placeholder="URL ou sélectionner une page"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Style</label>
              <select
                value={button.style || 'primary'}
                onChange={(e) => {
                  const buttons = [...heroButtons]
                  buttons[index] = { ...button, style: e.target.value }
                  onUpdate({ data: { ...block.data, buttons } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="primary">Principal</option>
                <option value="secondary">Secondaire</option>
              </select>
            </div>
          </div>
        )
      }
    }
    
    // Configuration pour une fonctionnalité
    if (type === 'feature' && block.type === 'features-grid') {
      const features = safeBlock.data.features || []
      const feature = features[index]
      if (feature) {
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Configuration de la fonctionnalité {index + 1}
              </h3>
              <button
                onClick={() => {
                  const newFeatures = features.filter((_: any, i: number) => i !== index)
                  onUpdate({ data: { ...block.data, features: newFeatures } })
                }}
                className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                title="Supprimer cette fonctionnalité"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Supprimer
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Icône</label>
              <input
                type="text"
                value={feature.icon || ''}
                onChange={(e) => {
                  const newFeatures = [...features]
                  newFeatures[index] = { ...feature, icon: e.target.value }
                  onUpdate({ data: { ...block.data, features: newFeatures } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="✨"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Titre</label>
              <input
                type="text"
                value={feature.title || ''}
                onChange={(e) => {
                  const newFeatures = [...features]
                  newFeatures[index] = { ...feature, title: e.target.value }
                  onUpdate({ data: { ...block.data, features: newFeatures } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Titre"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={feature.description || ''}
                onChange={(e) => {
                  const newFeatures = [...features]
                  newFeatures[index] = { ...feature, description: e.target.value }
                  onUpdate({ data: { ...block.data, features: newFeatures } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Description"
                rows={3}
              />
            </div>
          </div>
        )
      }
    }
    
    // Configuration pour un plan tarifaire
    if (type === 'pricing-plan' && (block.type === 'pricing' || block.type === 'pricing-cards')) {
      const plans = safeBlock.data.plans || []
      const plan = plans[index]
      if (plan) {
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Configuration du plan {index + 1}
              </h3>
              <button
                onClick={() => {
                  const newPlans = plans.filter((_: any, i: number) => i !== index)
                  onUpdate({ data: { ...block.data, plans: newPlans } })
                }}
                className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                title="Supprimer ce plan"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Supprimer
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
              <input
                type="text"
                value={plan.name || ''}
                onChange={(e) => {
                  const newPlans = [...plans]
                  newPlans[index] = { ...plan, name: e.target.value }
                  onUpdate({ data: { ...block.data, plans: newPlans } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Nom du plan"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Prix</label>
                <input
                  type="number"
                  value={plan.price || plan.price_monthly || 0}
                  onChange={(e) => {
                    const newPlans = [...plans]
                    newPlans[index] = { ...plan, price: parseFloat(e.target.value) || 0, price_monthly: parseFloat(e.target.value) || 0 }
                    onUpdate({ data: { ...block.data, plans: newPlans } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Devise</label>
                <input
                  type="text"
                  value={plan.currency || '€'}
                  onChange={(e) => {
                    const newPlans = [...plans]
                    newPlans[index] = { ...plan, currency: e.target.value }
                    onUpdate({ data: { ...block.data, plans: newPlans } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="€"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={plan.description || ''}
                onChange={(e) => {
                  const newPlans = [...plans]
                  newPlans[index] = { ...plan, description: e.target.value }
                  onUpdate({ data: { ...block.data, plans: newPlans } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Description"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Fonctionnalités (une par ligne)</label>
              <textarea
                value={Array.isArray(plan.features) ? plan.features.join('\n') : ''}
                onChange={(e) => {
                  const newPlans = [...plans]
                  newPlans[index] = { ...plan, features: e.target.value.split('\n').filter(f => f.trim()) }
                  onUpdate({ data: { ...block.data, plans: newPlans } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Fonctionnalité 1&#10;Fonctionnalité 2"
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Texte du bouton</label>
                <input
                  type="text"
                  value={plan.button_text || plan.buttonText || ''}
                  onChange={(e) => {
                    const newPlans = [...plans]
                    newPlans[index] = { ...plan, button_text: e.target.value, buttonText: e.target.value }
                    onUpdate({ data: { ...block.data, plans: newPlans } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  placeholder="Choisir ce plan"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">URL du bouton</label>
                <UrlInputWithSuggestions
                  value={plan.button_url || plan.buttonUrl || ''}
                  onChange={(url) => {
                    const newPlans = [...plans]
                    newPlans[index] = { ...plan, button_url: url, buttonUrl: url }
                    onUpdate({ data: { ...block.data, plans: newPlans } })
                  }}
                  className="w-full text-xs"
                  placeholder="URL ou sélectionner une page"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={plan.featured || plan.is_featured || false}
                  onChange={(e) => {
                    const newPlans = [...plans]
                    newPlans[index] = { ...plan, featured: e.target.checked, is_featured: e.target.checked }
                    onUpdate({ data: { ...block.data, plans: newPlans } })
                  }}
                  className="w-4 h-4"
                />
                Plan populaire (mis en avant)
              </label>
            </div>
          </div>
        )
      }
    }
    
    // Configuration pour une colonne du footer
    if (type === 'footer-column' && block.type === 'footer') {
      const footerColumns = safeBlock.data.columns || []
      const column = footerColumns[index]
      if (column) {
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Configuration de la colonne {index + 1}
              </h3>
              <button
                onClick={() => {
                  const newColumns = footerColumns.filter((_: any, i: number) => i !== index)
                  onUpdate({ data: { ...block.data, columns: newColumns } })
                }}
                className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                title="Supprimer cette colonne"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Supprimer
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Titre</label>
              <input
                type="text"
                value={column.title || ''}
                onChange={(e) => {
                  const newColumns = [...footerColumns]
                  newColumns[index] = { ...column, title: e.target.value }
                  onUpdate({ data: { ...block.data, columns: newColumns } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Titre de la colonne"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={column.description || ''}
                onChange={(e) => {
                  const newColumns = [...footerColumns]
                  newColumns[index] = { ...column, description: e.target.value }
                  onUpdate({ data: { ...block.data, columns: newColumns } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Description (optionnel)"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Liens</label>
              <div className="space-y-2">
                {(column.links || []).map((link: any, linkIndex: number) => (
                  <div key={linkIndex} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={link.label || ''}
                      onChange={(e) => {
                        const newColumns = [...footerColumns]
                        const newLinks = [...(column.links || [])]
                        newLinks[linkIndex] = { ...link, label: e.target.value }
                        newColumns[index] = { ...column, links: newLinks }
                        onUpdate({ data: { ...block.data, columns: newColumns } })
                      }}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      placeholder="Label"
                    />
                    <UrlInputWithSuggestions
                      value={link.url || ''}
                      onChange={(url) => {
                        const newColumns = [...footerColumns]
                        const newLinks = [...(column.links || [])]
                        newLinks[linkIndex] = { ...link, url: url }
                        newColumns[index] = { ...column, links: newLinks }
                        onUpdate({ data: { ...block.data, columns: newColumns } })
                      }}
                      className="flex-1 text-xs"
                      placeholder="URL"
                    />
                    <button
                      onClick={() => {
                        const newColumns = [...footerColumns]
                        const newLinks = (column.links || []).filter((_: any, i: number) => i !== linkIndex)
                        newColumns[index] = { ...column, links: newLinks }
                        onUpdate({ data: { ...block.data, columns: newColumns } })
                      }}
                      className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded"
                      title="Supprimer ce lien"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newColumns = [...footerColumns]
                    const newLinks = [...(column.links || []), { label: '', url: '#' }]
                    newColumns[index] = { ...column, links: newLinks }
                    onUpdate({ data: { ...block.data, columns: newColumns } })
                  }}
                  className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  + Ajouter un lien
                </button>
              </div>
            </div>
          </div>
        )
      }
    }
  }

  // Liste des blocs qui ont une configuration spéciale dans BlockRenderer
  const blocksWithSpecialConfig = [
    'features-grid',
    'features_grid',
    'pricing_cards',
    'pricing-cards',
    'hero',
    'header',
    'cta-section',
    'cta_section',
    'cta',
    'container',
    'flex-container',
    'grid-container',
    'carousel',
    'section',
    'rows',
    'flexbox',
    'grid',
    'stack',
    'inline',
    'group',
    'wrapper',
  ]

  // Si le bloc a une configuration spéciale, utiliser BlockRenderer
  if (blocksWithSpecialConfig.includes(block.type)) {
    return <BlockRenderer block={block} blockType={blockType} onUpdate={onUpdate} />
  }

  // Sinon, utiliser le schema générique
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
        <div className="text-sm text-gray-900 dark:text-gray-100">{blockType.label}</div>
      </div>

      {/* Render properties based on block schema */}
      {blockType.schema && Object.keys(blockType.schema).length > 0 && (
        <div className="space-y-3">
          {Object.entries(blockType.schema).map(([key, schema]) => {
            const schemaObj = schema as any
            return (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {schemaObj.label || key}
              </label>
                {schemaObj.type === 'text' && (
                <input
                  type="text"
                  value={safeBlock.data[key] || ''}
                  onChange={(e) =>
                    onUpdate({
                      data: { ...block.data, [key]: e.target.value },
                    })
                  }
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
                {schemaObj.type === 'textarea' && (
                <textarea
                  value={safeBlock.data[key] || ''}
                  onChange={(e) =>
                    onUpdate({
                      data: { ...block.data, [key]: e.target.value },
                    })
                  }
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              )}
                {schemaObj.type === 'number' && (
                <input
                  type="number"
                  value={safeBlock.data[key] || ''}
                  onChange={(e) =>
                    onUpdate({
                      data: { ...block.data, [key]: parseFloat(e.target.value) || 0 },
                    })
                  }
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
                {(schemaObj.type === 'url' || 
                  (schemaObj.type === 'text' && (key.toLowerCase().includes('url') || key.toLowerCase().includes('link') || key.toLowerCase().includes('href')))) && (
                  <UrlInputWithSuggestions
                    value={safeBlock.data[key] || ''}
                    onChange={(url) =>
                      onUpdate({
                        data: { ...block.data, [key]: url },
                      })
                    }
                    placeholder={schemaObj.placeholder || 'URL ou sélectionner une page...'}
                    className="text-sm"
                />
              )}
            </div>
          )
          })}
        </div>
      )}
    </div>
  )
}

