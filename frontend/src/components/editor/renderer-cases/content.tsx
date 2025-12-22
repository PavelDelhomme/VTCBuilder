import React from 'react'
import { RendererCaseProps } from './types'
import { CollapsibleSection } from '../CollapsibleSection'
import ImageSelector from '../ui/ImageSelector'
import UrlInputWithSuggestions from '../ui/UrlInputWithSuggestions'
import PageSelector from '../ui/PageSelector'

export function renderIconBox({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Icône (emoji ou texte)
        </label>
        <input
          type="text"
          value={safeBlock.data.icon || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, icon: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="🎯 ou ⚡"
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
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Titre de la boîte"
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
          placeholder="Description..."
          rows={3}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Couleur de la bordure
        </label>
        <input
          type="color"
          value={safeBlock.data.border_color || '#E5E7EB'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, border_color: e.target.value } })}
          className="w-full h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
        />
      </div>
    </div>
  )
}

export function renderFeatureCard({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Icône (emoji)
        </label>
        <input
          type="text"
          value={safeBlock.data.icon || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, icon: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="✨"
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
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Titre de la fonctionnalité"
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
          placeholder="Description de la fonctionnalité..."
          rows={3}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte du lien
        </label>
        <input
          type="text"
          value={safeBlock.data.link_text || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, link_text: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="En savoir plus"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL du lien
        </label>
        <UrlInputWithSuggestions
          value={safeBlock.data.link_url || ''}
          onChange={(url) => onUpdate({ data: { ...block.data, link_url: url } })}
          placeholder="URL ou sélectionner une page..."
          className="text-xs"
        />
      </div>
    </div>
  )
}

export function renderVideoEmbed({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL de la vidéo (YouTube ou Vimeo)
        </label>
        <input
          type="text"
          value={safeBlock.data.url || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, url: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
          Supporte YouTube et Vimeo
        </p>
      </div>
    </div>
  )
}

export function renderTeamMember({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const socialLinks = safeBlock.data.social_links || [{ url: '', icon: '' }]
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nom
        </label>
        <input
          type="text"
          value={safeBlock.data.name || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, name: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Jean Dupont"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Rôle
        </label>
        <input
          type="text"
          value={safeBlock.data.role || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, role: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Développeur"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Avatar
        </label>
        <ImageSelector
          value={safeBlock.data.avatar || ''}
          onChange={(url) => onUpdate({ data: { ...safeBlock.data, avatar: url } })}
          className="text-sm"
          projectId={1}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Biographie
        </label>
        <textarea
          value={safeBlock.data.bio || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, bio: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Biographie..."
          rows={3}
        />
      </div>
      <CollapsibleSection title="Liens sociaux" count={socialLinks.length} defaultCollapsed={false}>
        <div className="space-y-3">
          {socialLinks.map((link: any, index: number) => (
            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Lien {index + 1}</span>
                <button
                  onClick={() => {
                    const newLinks = socialLinks.filter((_: any, i: number) => i !== index)
                    onUpdate({ data: { ...safeBlock.data, social_links: newLinks } })
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
                  URL
                </label>
                <UrlInputWithSuggestions
                  value={link.url || ''}
                  onChange={(url) => {
                    const newLinks = [...socialLinks]
                    newLinks[index] = { ...link, url }
                    onUpdate({ data: { ...safeBlock.data, social_links: newLinks } })
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
                    const newLinks = [...socialLinks]
                    newLinks[index] = { ...link, icon: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, social_links: newLinks } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Icône emoji"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newLinks = [...socialLinks, { url: '', icon: '' }]
              onUpdate({ data: { ...safeBlock.data, social_links: newLinks } })
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

export function renderCard({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const cards = safeBlock.data.cards || [{ title: '', description: '', image: '', button_text: '', button_url: '' }]
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre de colonnes
        </label>
        <select
          value={safeBlock.data.columns || 3}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, columns: parseInt(e.target.value) } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value={1}>1 colonne</option>
          <option value={2}>2 colonnes</option>
          <option value={3}>3 colonnes</option>
          <option value={4}>4 colonnes</option>
        </select>
      </div>
      <CollapsibleSection title="Cartes" count={cards.length} defaultCollapsed={false}>
        <div className="space-y-3">
          {cards.map((card: any, index: number) => (
            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Carte {index + 1}</span>
                <button
                  onClick={() => {
                    const newCards = cards.filter((_: any, i: number) => i !== index)
                    onUpdate({ data: { ...safeBlock.data, cards: newCards } })
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                  title="Supprimer cette carte"
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
                  value={card.title || ''}
                  onChange={(e) => {
                    const newCards = [...cards]
                    newCards[index] = { ...card, title: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, cards: newCards } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Titre de la carte"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={card.description || ''}
                  onChange={(e) => {
                    const newCards = [...cards]
                    newCards[index] = { ...card, description: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, cards: newCards } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Description de la carte"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image
                </label>
                <ImageSelector
                  value={card.image || ''}
                  onChange={(url) => {
                    const newCards = [...cards]
                    newCards[index] = { ...card, image: url }
                    onUpdate({ data: { ...safeBlock.data, cards: newCards } })
                  }}
                  className="text-sm"
                  projectId={1}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Texte du bouton
                </label>
                <input
                  type="text"
                  value={card.button_text || ''}
                  onChange={(e) => {
                    const newCards = [...cards]
                    newCards[index] = { ...card, button_text: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, cards: newCards } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Texte du bouton"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL du bouton
                </label>
                <UrlInputWithSuggestions
                  value={card.button_url || ''}
                  onChange={(url) => {
                    const newCards = [...cards]
                    newCards[index] = { ...card, button_url: url }
                    onUpdate({ data: { ...safeBlock.data, cards: newCards } })
                  }}
                  placeholder="URL du bouton"
                  className="text-xs"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newCards = [...cards, { title: '', description: '', image: '', button_text: '', button_url: '' }]
              onUpdate({ data: { ...safeBlock.data, cards: newCards } })
            }}
            className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
          >
            <span>+</span>
            <span>Ajouter une carte</span>
          </button>
        </div>
      </CollapsibleSection>
    </div>
  )
}

export function renderRating({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Note (1-5)
        </label>
        <input
          type="number"
          value={safeBlock.data.rating || 5}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, rating: Math.max(1, Math.min(5, parseInt(e.target.value) || 5)) } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          min={1}
          max={5}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Taille
        </label>
        <select
          value={safeBlock.data.size || 'medium'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, size: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="small">Petit</option>
          <option value="medium">Moyen</option>
          <option value="large">Grand</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Afficher le texte
        </label>
        <input
          type="checkbox"
          checked={safeBlock.data.show_text !== false}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_text: e.target.checked } })}
          className="w-4 h-4"
        />
        {safeBlock.data.show_text !== false && (
          <input
            type="text"
            value={safeBlock.data.text || ''}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, text: e.target.value } })}
            className="w-full mt-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            placeholder="Texte (ex: '4.5 sur 5')"
          />
        )}
      </div>
    </div>
  )
}

export function renderBreadcrumb({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const breadcrumbItems = safeBlock.data.items || [{ label: 'Accueil', url: '/' }]
  
  return (
    <div className="space-y-3">
      <CollapsibleSection title="Éléments du fil d'Ariane" count={breadcrumbItems.length} defaultCollapsed={false}>
        <div className="space-y-3">
          {breadcrumbItems.map((item: any, index: number) => (
            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Élément {index + 1}</span>
                <button
                  onClick={() => {
                    const newItems = breadcrumbItems.filter((_: any, i: number) => i !== index)
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
                  Label
                </label>
                <input
                  type="text"
                  value={item.label || ''}
                  onChange={(e) => {
                    const newItems = [...breadcrumbItems]
                    newItems[index] = { ...item, label: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, items: newItems } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Label"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL
                </label>
                <UrlInputWithSuggestions
                  value={item.url || ''}
                  onChange={(url) => {
                    const newItems = [...breadcrumbItems]
                    newItems[index] = { ...item, url }
                    onUpdate({ data: { ...safeBlock.data, items: newItems } })
                  }}
                  placeholder="URL"
                  className="text-xs"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newItems = [...breadcrumbItems, { label: '', url: '' }]
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

export function renderTags({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const tags = safeBlock.data.tags || ['Tag 1', 'Tag 2']
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tags (séparés par des virgules)
        </label>
        <textarea
          value={tags.join(', ')}
          onChange={(e) => {
            const newTags = e.target.value.split(',').map(t => t.trim()).filter(t => t)
            onUpdate({ data: { ...block.data, tags: newTags } })
          }}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Tag 1, Tag 2, Tag 3..."
          rows={3}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Style
        </label>
        <select
          value={safeBlock.data.style || 'rounded'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, style: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="rounded">Arrondi</option>
          <option value="square">Carré</option>
          <option value="pill">Pilule</option>
        </select>
      </div>
    </div>
  )
}

export function renderSearchBar({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Placeholder
        </label>
        <input
          type="text"
          value={safeBlock.data.placeholder || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, placeholder: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Rechercher..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Action (URL de recherche)
        </label>
        <input
          type="url"
          value={safeBlock.data.action || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, action: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="/search"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Afficher le bouton
        </label>
        <input
          type="checkbox"
          checked={safeBlock.data.show_button !== false}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_button: e.target.checked } })}
          className="w-4 h-4"
        />
      </div>
    </div>
  )
}

export function renderPagination({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const totalPages = safeBlock.data.total_pages || 10
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre total de pages
        </label>
        <input
          type="number"
          value={totalPages}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, total_pages: Math.max(1, parseInt(e.target.value) || 1) } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          min={1}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Page actuelle
        </label>
        <input
          type="number"
          value={safeBlock.data.current_page || 1}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, current_page: Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1)) } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          min={1}
          max={totalPages}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Afficher les flèches
        </label>
        <input
          type="checkbox"
          checked={safeBlock.data.show_arrows !== false}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_arrows: e.target.checked } })}
          className="w-4 h-4"
        />
      </div>
    </div>
  )
}

export function renderLink({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte du lien
        </label>
        <input
          type="text"
          value={safeBlock.data.text || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, text: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Texte du lien"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL ou Page
        </label>
        <div className="space-y-2">
          <PageSelector
            value={safeBlock.data.url || ''}
            onChange={(url) => onUpdate({ data: { ...block.data, url } })}
            className="text-xs"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Ouvrir dans un nouvel onglet
        </label>
        <input
          type="checkbox"
          checked={safeBlock.data.target === '_blank'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, target: e.target.checked ? '_blank' : '_self' } })}
          className="w-4 h-4"
        />
      </div>
    </div>
  )
}

