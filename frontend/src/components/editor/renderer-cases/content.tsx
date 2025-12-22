import React from 'react'
import { RendererCaseProps } from './types'
import { CollapsibleSection } from '../CollapsibleSection'
import ImageSelector from '../ui/ImageSelector'
import UrlInputWithSuggestions from '../ui/UrlInputWithSuggestions'

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

