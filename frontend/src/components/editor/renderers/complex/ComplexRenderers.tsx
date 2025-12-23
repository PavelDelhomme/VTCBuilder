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

// renderHero, renderHeader, renderFooter, renderPricing, renderFeaturesGrid
// ont été extraites dans le dossier editors/
// Réexportons-les directement depuis le fichier index.ts des editors
export {
  renderHero,
  renderHeader,
  renderFooter,
  renderPricing,
  renderFeaturesGrid
} from './editors'

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
      <CollapsibleSection title="Témoignages" count={testimonials.length} defaultCollapsed={false}>
        <div className="space-y-3">
          {testimonials.map((testimonial: any, index: number) => (
            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Témoignage {index + 1}</span>
                <button
                  onClick={() => {
                    const newTestimonials = testimonials.filter((_: any, i: number) => i !== index)
                    onUpdate({ data: { ...safeBlock.data, testimonials: newTestimonials } })
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                  title="Supprimer ce témoignage"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  value={testimonial.name || ''}
                  onChange={(e) => {
                    const newTestimonials = [...testimonials]
                    newTestimonials[index] = { ...testimonial, name: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, testimonials: newTestimonials } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Nom du client"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rôle/Poste
                </label>
                <input
                  type="text"
                  value={testimonial.role || ''}
                  onChange={(e) => {
                    const newTestimonials = [...testimonials]
                    newTestimonials[index] = { ...testimonial, role: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, testimonials: newTestimonials } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Rôle/Poste"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Témoignage
                </label>
                <textarea
                  value={testimonial.content || ''}
                  onChange={(e) => {
                    const newTestimonials = [...testimonials]
                    newTestimonials[index] = { ...testimonial, content: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, testimonials: newTestimonials } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Contenu du témoignage"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL Avatar (optionnel)
                </label>
                <ImageSelector
                  value={testimonial.avatar || ''}
                  onChange={(url) => {
                    const newTestimonials = [...testimonials]
                    newTestimonials[index] = { ...testimonial, avatar: url }
                    onUpdate({ data: { ...safeBlock.data, testimonials: newTestimonials } })
                  }}
                  className="text-sm"
                  projectId={1}
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newTestimonials = [...testimonials, { name: '', role: '', content: '', avatar: '' }]
              onUpdate({ data: { ...safeBlock.data, testimonials: newTestimonials } })
            }}
            className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
          >
            <span>+</span>
            <span>Ajouter un témoignage</span>
          </button>
        </div>
      </CollapsibleSection>
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
      <CollapsibleSection title="Événements" count={events.length} defaultCollapsed={false}>
        <div className="space-y-3">
          {events.map((event: any, index: number) => (
            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Événement {index + 1}</span>
                <button
                  onClick={() => {
                    const newEvents = events.filter((_: any, i: number) => i !== index)
                    onUpdate({ data: { ...safeBlock.data, events: newEvents } })
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                  title="Supprimer cet événement"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="text"
                  value={event.date || ''}
                  onChange={(e) => {
                    const newEvents = [...events]
                    newEvents[index] = { ...event, date: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, events: newEvents } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Date (ex: 2024)"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  value={event.title || ''}
                  onChange={(e) => {
                    const newEvents = [...events]
                    newEvents[index] = { ...event, title: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, events: newEvents } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Titre de l'événement"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={event.description || ''}
                  onChange={(e) => {
                    const newEvents = [...events]
                    newEvents[index] = { ...event, description: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, events: newEvents } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Description de l'événement"
                  rows={3}
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newEvents = [...events, { date: '', title: '', description: '' }]
              onUpdate({ data: { ...safeBlock.data, events: newEvents } })
            }}
            className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
          >
            <span>+</span>
            <span>Ajouter un événement</span>
          </button>
        </div>
      </CollapsibleSection>
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
      <CollapsibleSection title="Éléments de l'accordéon" count={items.length} defaultCollapsed={false}>
        <div className="space-y-3">
          {items.map((item: any, index: number) => (
            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Élément {index + 1}</span>
                <button
                  onClick={() => {
                    const newItems = items.filter((_: any, i: number) => i !== index)
                    onUpdate({ data: { ...safeBlock.data, items: newItems } })
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                  title="Supprimer cet élément"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  value={item.title || ''}
                  onChange={(e) => {
                    const newItems = [...items]
                    newItems[index] = { ...item, title: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, items: newItems } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Titre de l'élément"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contenu
                </label>
                <textarea
                  value={item.content || ''}
                  onChange={(e) => {
                    const newItems = [...items]
                    newItems[index] = { ...item, content: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, items: newItems } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Contenu de l'élément"
                  rows={3}
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newItems = [...items, { title: '', content: '' }]
              onUpdate({ data: { ...safeBlock.data, items: newItems } })
            }}
            className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
          >
            <span>+</span>
            <span>Ajouter un élément</span>
          </button>
        </div>
      </CollapsibleSection>
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
      <CollapsibleSection title="Statistiques" count={stats.length} defaultCollapsed={false}>
        <div className="space-y-3">
          {stats.map((stat: any, index: number) => (
            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Statistique {index + 1}</span>
                <button
                  onClick={() => {
                    const newStats = stats.filter((_: any, i: number) => i !== index)
                    onUpdate({ data: { ...safeBlock.data, stats: newStats } })
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                  title="Supprimer cette statistique"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valeur
                </label>
                <input
                  type="text"
                  value={stat.value || ''}
                  onChange={(e) => {
                    const newStats = [...stats]
                    newStats[index] = { ...stat, value: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, stats: newStats } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Valeur (ex: 1000+)"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={stat.label || ''}
                  onChange={(e) => {
                    const newStats = [...stats]
                    newStats[index] = { ...stat, label: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, stats: newStats } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Label (ex: Clients satisfaits)"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Icône (emoji)
                </label>
                <input
                  type="text"
                  value={stat.icon || ''}
                  onChange={(e) => {
                    const newStats = [...stats]
                    newStats[index] = { ...stat, icon: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, stats: newStats } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Icône emoji (ex: 👥)"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newStats = [...stats, { label: '', value: '', icon: '' }]
              onUpdate({ data: { ...safeBlock.data, stats: newStats } })
            }}
            className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
          >
            <span>+</span>
            <span>Ajouter une statistique</span>
          </button>
        </div>
      </CollapsibleSection>
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
      <CollapsibleSection title="Liens sociaux" count={links.length} defaultCollapsed={false}>
        <div className="space-y-3">
          {links.map((link: any, index: number) => (
            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Lien {index + 1}</span>
                <button
                  onClick={() => {
                    const newLinks = links.filter((_: any, i: number) => i !== index)
                    onUpdate({ data: { ...safeBlock.data, links: newLinks } })
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
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plateforme
                </label>
                <input
                  type="text"
                  value={link.platform || ''}
                  onChange={(e) => {
                    const newLinks = [...links]
                    newLinks[index] = { ...link, platform: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, links: newLinks } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Plateforme (ex: Facebook)"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL
                </label>
                <UrlInputWithSuggestions
                  value={link.url || ''}
                  onChange={(url) => {
                    const newLinks = [...links]
                    newLinks[index] = { ...link, url }
                    onUpdate({ data: { ...safeBlock.data, links: newLinks } })
                  }}
                  placeholder="URL du profil"
                  className="text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Icône (emoji)
                </label>
                <input
                  type="text"
                  value={link.icon || ''}
                  onChange={(e) => {
                    const newLinks = [...links]
                    newLinks[index] = { ...link, icon: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, links: newLinks } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Icône emoji (ex: 📘)"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newLinks = [...links, { platform: '', url: '', icon: '' }]
              onUpdate({ data: { ...safeBlock.data, links: newLinks } })
            }}
            className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
          >
            <span>+</span>
            <span>Ajouter un lien social</span>
          </button>
        </div>
      </CollapsibleSection>
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

export function renderContactForm({ block, onUpdate }: ComplexRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const formFields = safeBlock.data.fields || []
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre du formulaire
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Contactez-nous"
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
          placeholder="Description du formulaire"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte du bouton d'envoi
        </label>
        <input
          type="text"
          value={safeBlock.data.submit_text || 'Envoyer'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, submit_text: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Envoyer"
        />
      </div>

      <CollapsibleSection title="Champs du formulaire" count={formFields.length} defaultCollapsed={false}>
        <div className="space-y-3">
          {formFields.map((field: any, index: number) => (
            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Champ {index + 1}</span>
                <button
                  onClick={() => {
                    const newFields = formFields.filter((_: any, i: number) => i !== index)
                    onUpdate({ data: { ...safeBlock.data, fields: newFields } })
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                  title="Supprimer ce champ"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Label du champ
                </label>
                <input
                  type="text"
                  value={field.label || ''}
                  onChange={(e) => {
                    const newFields = [...formFields]
                    newFields[index] = { ...field, label: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, fields: newFields } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Nom du champ"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type de champ
                </label>
                <select
                  value={field.type || 'text'}
                  onChange={(e) => {
                    const newFields = [...formFields]
                    newFields[index] = { ...field, type: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, fields: newFields } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="text">Texte</option>
                  <option value="email">Email</option>
                  <option value="tel">Téléphone</option>
                  <option value="textarea">Zone de texte</option>
                  <option value="select">Liste déroulante</option>
                  <option value="checkbox">Case à cocher</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Placeholder
                </label>
                <input
                  type="text"
                  value={field.placeholder || ''}
                  onChange={(e) => {
                    const newFields = [...formFields]
                    newFields[index] = { ...field, placeholder: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, fields: newFields } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Texte d'exemple"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`field-required-${index}`}
                  checked={field.required || false}
                  onChange={(e) => {
                    const newFields = [...formFields]
                    newFields[index] = { ...field, required: e.target.checked }
                    onUpdate({ data: { ...safeBlock.data, fields: newFields } })
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={`field-required-${index}`} className="text-xs text-gray-700 dark:text-gray-300">
                  Champ requis
                </label>
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newFields = [...formFields, { label: '', type: 'text', placeholder: '', required: false }]
              onUpdate({ data: { ...safeBlock.data, fields: newFields } })
            }}
            className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
          >
            <span>+</span>
            <span>Ajouter un champ</span>
          </button>
        </div>
      </CollapsibleSection>
    </div>
  )
}
