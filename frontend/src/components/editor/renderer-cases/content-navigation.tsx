import React from 'react'
import { RendererCaseProps } from './types'
import { CollapsibleSection } from '../CollapsibleSection'
import UrlInputWithSuggestions from '../ui/UrlInputWithSuggestions'
import PageSelector from '../ui/PageSelector'

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
            placeholder="Sélectionner une page..."
            className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Ou saisir une URL personnalisée ci-dessus
          </div>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Ouvrir dans
        </label>
        <select
          value={safeBlock.data.target || '_self'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, target: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="_self">Même onglet</option>
          <option value="_blank">Nouvel onglet</option>
          <option value="_parent">Page parente</option>
          <option value="_top">Page principale</option>
        </select>
      </div>
    </div>
  )
}

