/**
 * Implémentations des nouveaux blocs pour BlockRenderer et BlockPreview
 * Ce fichier contient les composants de rendu et de configuration pour les blocs manquants
 */

import React from 'react'
import { Block } from './BlockEditor'

/**
 * Composants de configuration pour BlockRenderer (panneau de propriétés)
 */

// Rich Text Editor
export function RichTextEditorConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Contenu HTML
        </label>
        <textarea
          value={safeBlock.data.html || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, html: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
          rows={8}
          placeholder="<p>Votre contenu HTML ici...</p>"
        />
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        💡 Utilisez un éditeur WYSIWYG externe pour générer le HTML, puis collez-le ici.
      </div>
    </div>
  )
}

// Markdown Editor
export function MarkdownEditorConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Contenu Markdown
        </label>
        <textarea
          value={safeBlock.data.markdown || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, markdown: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
          rows={10}
          placeholder="# Titre\n\nParagraphe avec **gras** et *italique*..."
        />
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        💡 Syntaxe Markdown supportée: **gras**, *italique*, [liens](url), etc.
      </div>
    </div>
  )
}

// HTML Raw
export function HtmlRawConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Code HTML Brut
        </label>
        <textarea
          value={safeBlock.data.html || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, html: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
          rows={10}
          placeholder="<div>Votre HTML personnalisé</div>"
        />
      </div>
      <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-200">
        ⚠️ Attention: Le HTML brut est exécuté tel quel. Assurez-vous qu'il est sûr.
      </div>
    </div>
  )
}

// Icon
export function IconConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Icône (Emoji ou nom Font Awesome)
        </label>
        <input
          type="text"
          value={safeBlock.data.icon || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, icon: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="⭐ ou fa-star"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Taille
        </label>
        <select
          value={safeBlock.data.size || 'md'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, size: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="sm">Petit</option>
          <option value="md">Moyen</option>
          <option value="lg">Grand</option>
          <option value="xl">Très grand</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Couleur
        </label>
        <input
          type="color"
          value={safeBlock.data.color || '#000000'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, color: e.target.value } })}
          className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded-lg"
        />
      </div>
    </div>
  )
}

// Label
export function LabelConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte du label
        </label>
        <input
          type="text"
          value={safeBlock.data.text || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, text: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Label"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          For (ID de l'élément associé)
        </label>
        <input
          type="text"
          value={safeBlock.data.for || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, for: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="input-id"
        />
      </div>
    </div>
  )
}

// Tooltip
export function TooltipConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte à afficher
        </label>
        <input
          type="text"
          value={safeBlock.data.text || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, text: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Texte visible"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Message du tooltip
        </label>
        <textarea
          value={safeBlock.data.tooltip || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, tooltip: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          rows={3}
          placeholder="Message qui apparaît au survol"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Position
        </label>
        <select
          value={safeBlock.data.position || 'top'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, position: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="top">Haut</option>
          <option value="bottom">Bas</option>
          <option value="left">Gauche</option>
          <option value="right">Droite</option>
        </select>
      </div>
    </div>
  )
}

// Popover
export function PopoverConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte du déclencheur
        </label>
        <input
          type="text"
          value={safeBlock.data.trigger || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, trigger: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Cliquez ici"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Contenu du popover
        </label>
        <textarea
          value={safeBlock.data.content || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, content: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          rows={4}
          placeholder="Contenu qui apparaît dans le popover"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Position
        </label>
        <select
          value={safeBlock.data.position || 'top'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, position: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="top">Haut</option>
          <option value="bottom">Bas</option>
          <option value="left">Gauche</option>
          <option value="right">Droite</option>
        </select>
      </div>
    </div>
  )
}

// Dropdown
export function DropdownConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const items = safeBlock.data.items || [{ label: 'Option 1', value: 'option1' }]
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Label du menu
        </label>
        <input
          type="text"
          value={safeBlock.data.label || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, label: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Menu"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Options ({items.length})
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {items.map((item: any, index: number) => (
            <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
              <input
                type="text"
                value={item.label || ''}
                onChange={(e) => {
                  const newItems = [...items]
                  newItems[index] = { ...item, label: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, items: newItems } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Label"
              />
              <input
                type="text"
                value={item.value || ''}
                onChange={(e) => {
                  const newItems = [...items]
                  newItems[index] = { ...item, value: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, items: newItems } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Valeur"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onUpdate({ data: { ...safeBlock.data, items: [...items, { label: '', value: '' }] } })}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Ajouter
          </button>
          {items.length > 1 && (
            <button
              onClick={() => onUpdate({ data: { ...safeBlock.data, items: items.slice(0, -1) } })}
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

// Categories
export function CategoriesConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const categories = safeBlock.data.categories || [{ name: 'Catégorie 1', slug: 'categorie-1' }]
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
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Catégories"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Catégories ({categories.length})
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((cat: any, index: number) => (
            <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
              <input
                type="text"
                value={cat.name || ''}
                onChange={(e) => {
                  const newCats = [...categories]
                  newCats[index] = { ...cat, name: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, categories: newCats } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Nom"
              />
              <input
                type="text"
                value={cat.slug || ''}
                onChange={(e) => {
                  const newCats = [...categories]
                  newCats[index] = { ...cat, slug: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, categories: newCats } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Slug"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onUpdate({ data: { ...safeBlock.data, categories: [...categories, { name: '', slug: '' }] } })}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Ajouter
          </button>
          {categories.length > 1 && (
            <button
              onClick={() => onUpdate({ data: { ...safeBlock.data, categories: categories.slice(0, -1) } })}
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

// Author Box
export function AuthorBoxConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nom de l'auteur
        </label>
        <input
          type="text"
          value={safeBlock.data.name || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, name: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="John Doe"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Photo (URL)
        </label>
        <input
          type="text"
          value={safeBlock.data.avatar || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, avatar: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Bio
        </label>
        <textarea
          value={safeBlock.data.bio || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, bio: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          rows={4}
          placeholder="Biographie de l'auteur..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Lien vers le profil
        </label>
        <input
          type="text"
          value={safeBlock.data.url || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, url: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="/author/john-doe"
        />
      </div>
    </div>
  )
}

// Related Posts
export function RelatedPostsConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
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
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Articles liés"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre d'articles
        </label>
        <input
          type="number"
          value={safeBlock.data.count || 3}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, count: parseInt(e.target.value) || 3 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          min={1}
          max={12}
        />
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        💡 Les articles seront chargés automatiquement depuis votre base de données.
      </div>
    </div>
  )
}

// Table of Contents
export function TableOfContentsConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Table des matières"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Niveau minimum
        </label>
        <select
          value={safeBlock.data.minLevel || 'h2'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, minLevel: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="h1">H1</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
          <option value="h4">H4</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Niveau maximum
        </label>
        <select
          value={safeBlock.data.maxLevel || 'h4'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, maxLevel: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="h1">H1</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
          <option value="h4">H4</option>
        </select>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        💡 La table des matières sera générée automatiquement à partir des titres de la page.
      </div>
    </div>
  )
}

// Reading Time
export function ReadingTimeConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte avant le temps
        </label>
        <input
          type="text"
          value={safeBlock.data.prefix || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, prefix: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Temps de lecture:"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Mots par minute
        </label>
        <input
          type="number"
          value={safeBlock.data.wordsPerMinute || 200}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, wordsPerMinute: parseInt(e.target.value) || 200 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          min={100}
          max={300}
        />
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        💡 Le temps de lecture sera calculé automatiquement à partir du contenu de la page.
      </div>
    </div>
  )
}

// Share Buttons
export function ShareButtonsConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const platforms = safeBlock.data.platforms || ['facebook', 'twitter', 'linkedin']
  const availablePlatforms = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'email', 'copy']
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
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Partager"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Plateformes
        </label>
        <div className="space-y-2">
          {availablePlatforms.map((platform) => (
            <label key={platform} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={platforms.includes(platform)}
                onChange={(e) => {
                  const newPlatforms = e.target.checked
                    ? [...platforms, platform]
                    : platforms.filter((p: string) => p !== platform)
                  onUpdate({ data: { ...safeBlock.data, platforms: newPlatforms } })
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300 capitalize">{platform}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

// Layout blocks (flexbox, grid, stack, inline, group, wrapper)
export function FlexboxConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          📐 Flexbox: Conteneur flexbox avec propriétés avancées. Ajoutez des blocs enfants pour les aligner.
        </p>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Direction
        </label>
        <select
          value={safeBlock.data.direction || 'row'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, direction: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="row">Horizontal (row)</option>
          <option value="column">Vertical (column)</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Justify Content
        </label>
        <select
          value={safeBlock.data.justifyContent || 'flex-start'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, justifyContent: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="flex-start">Début</option>
          <option value="flex-end">Fin</option>
          <option value="center">Centre</option>
          <option value="space-between">Espace entre</option>
          <option value="space-around">Espace autour</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Align Items
        </label>
        <select
          value={safeBlock.data.alignItems || 'stretch'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, alignItems: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="stretch">Étirer</option>
          <option value="flex-start">Début</option>
          <option value="flex-end">Fin</option>
          <option value="center">Centre</option>
          <option value="baseline">Baseline</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Gap (px)
        </label>
        <input
          type="number"
          value={safeBlock.data.gap || 0}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, gap: parseInt(e.target.value) || 0 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          min={0}
        />
      </div>
    </div>
  )
}

export function GridConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          ⚏ Grid: Grille CSS avec propriétés avancées. Ajoutez des blocs enfants pour les placer dans la grille.
        </p>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Colonnes
        </label>
        <input
          type="text"
          value={safeBlock.data.columns || 'repeat(3, 1fr)'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, columns: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
          placeholder="repeat(3, 1fr)"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Lignes
        </label>
        <input
          type="text"
          value={safeBlock.data.rows || 'auto'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, rows: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
          placeholder="auto"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Gap (px)
        </label>
        <input
          type="number"
          value={safeBlock.data.gap || 0}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, gap: parseInt(e.target.value) || 0 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          min={0}
        />
      </div>
    </div>
  )
}

export function StackConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          📚 Stack: Pile verticale d'éléments. Ajoutez des blocs enfants pour les empiler verticalement.
        </p>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Espacement (px)
        </label>
        <input
          type="number"
          value={safeBlock.data.spacing || 16}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, spacing: parseInt(e.target.value) || 16 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          min={0}
        />
      </div>
    </div>
  )
}

export function InlineConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          ➡️ Inline: Ligne horizontale d'éléments. Ajoutez des blocs enfants pour les aligner horizontalement.
        </p>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Espacement (px)
        </label>
        <input
          type="number"
          value={safeBlock.data.spacing || 8}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, spacing: parseInt(e.target.value) || 8 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          min={0}
        />
      </div>
    </div>
  )
}

export function GroupConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          👥 Groupe: Groupe d'éléments. Ajoutez des blocs enfants pour les grouper ensemble.
        </p>
      </div>
    </div>
  )
}

export function WrapperConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          📦 Wrapper: Enveloppe générique pour contenir des éléments. Ajoutez des blocs enfants.
        </p>
      </div>
    </div>
  )
}

// Image Slider
export function ImageSliderConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const images = safeBlock.data.images || [{ url: '', alt: '', caption: '' }]
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre (optionnel)
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Diaporama"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Images ({images.length})
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {images.map((img: any, index: number) => (
            <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
              <input
                type="text"
                value={img.url || ''}
                onChange={(e) => {
                  const newImages = [...images]
                  newImages[index] = { ...img, url: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, images: newImages } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="URL de l'image"
              />
              <input
                type="text"
                value={img.alt || ''}
                onChange={(e) => {
                  const newImages = [...images]
                  newImages[index] = { ...img, alt: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, images: newImages } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Texte alternatif"
              />
              <input
                type="text"
                value={img.caption || ''}
                onChange={(e) => {
                  const newImages = [...images]
                  newImages[index] = { ...img, caption: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, images: newImages } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Légende (optionnel)"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onUpdate({ data: { ...safeBlock.data, images: [...images, { url: '', alt: '', caption: '' }] } })}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Ajouter
          </button>
          {images.length > 1 && (
            <button
              onClick={() => onUpdate({ data: { ...safeBlock.data, images: images.slice(0, -1) } })}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              - Supprimer
            </button>
          )}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Autoplay
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={safeBlock.data.autoplay || false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, autoplay: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">Lecture automatique</span>
        </label>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Intervalle (secondes)
        </label>
        <input
          type="number"
          value={safeBlock.data.interval || 5}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, interval: parseInt(e.target.value) || 5 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          min={1}
          max={60}
        />
      </div>
    </div>
  )
}

// Lightbox
export function LightboxConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const images = safeBlock.data.images || [{ url: '', alt: '', thumbnail: '' }]
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Images ({images.length})
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {images.map((img: any, index: number) => (
            <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
              <input
                type="text"
                value={img.url || ''}
                onChange={(e) => {
                  const newImages = [...images]
                  newImages[index] = { ...img, url: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, images: newImages } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="URL image complète"
              />
              <input
                type="text"
                value={img.thumbnail || ''}
                onChange={(e) => {
                  const newImages = [...images]
                  newImages[index] = { ...img, thumbnail: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, images: newImages } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="URL miniature"
              />
              <input
                type="text"
                value={img.alt || ''}
                onChange={(e) => {
                  const newImages = [...images]
                  newImages[index] = { ...img, alt: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, images: newImages } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Texte alternatif"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onUpdate({ data: { ...safeBlock.data, images: [...images, { url: '', alt: '', thumbnail: '' }] } })}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Ajouter
          </button>
          {images.length > 1 && (
            <button
              onClick={() => onUpdate({ data: { ...safeBlock.data, images: images.slice(0, -1) } })}
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

// Vimeo Embed
export function VimeoEmbedConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          ID ou URL Vimeo
        </label>
        <input
          type="text"
          value={safeBlock.data.vimeoId || safeBlock.data.url || ''}
          onChange={(e) => {
            const value = e.target.value
            // Extraire l'ID depuis l'URL si nécessaire
            let vimeoId = value
            if (value.includes('vimeo.com/')) {
              const match = value.match(/vimeo\.com\/(\d+)/)
              if (match) vimeoId = match[1]
            }
            onUpdate({ data: { ...safeBlock.data, vimeoId, url: value } })
          }}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="123456789 ou https://vimeo.com/123456789"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre (optionnel)
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Titre de la vidéo"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Hauteur (px)
        </label>
        <input
          type="number"
          value={safeBlock.data.height || 400}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, height: parseInt(e.target.value) || 400 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          min={200}
          max={800}
        />
      </div>
    </div>
  )
}

// Counter
export function CounterConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Valeur finale
        </label>
        <input
          type="number"
          value={safeBlock.data.value || 0}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, value: parseInt(e.target.value) || 0 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="100"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Préfixe
        </label>
        <input
          type="text"
          value={safeBlock.data.prefix || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, prefix: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="+"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Suffixe
        </label>
        <input
          type="text"
          value={safeBlock.data.suffix || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, suffix: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="%"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Durée de l'animation (ms)
        </label>
        <input
          type="number"
          value={safeBlock.data.duration || 2000}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, duration: parseInt(e.target.value) || 2000 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          min={500}
          max={10000}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Label
        </label>
        <input
          type="text"
          value={safeBlock.data.label || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, label: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Clients satisfaits"
        />
      </div>
    </div>
  )
}

// Card Grid
export function CardGridConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const cards = safeBlock.data.cards || [{ title: '', description: '', image: '', link: '' }]
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
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Nos services"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Colonnes
        </label>
        <select
          value={safeBlock.data.columns || 3}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, columns: parseInt(e.target.value) || 3 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Cartes ({cards.length})
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {cards.map((card: any, index: number) => (
            <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
              <input
                type="text"
                value={card.title || ''}
                onChange={(e) => {
                  const newCards = [...cards]
                  newCards[index] = { ...card, title: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, cards: newCards } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Titre"
              />
              <textarea
                value={card.description || ''}
                onChange={(e) => {
                  const newCards = [...cards]
                  newCards[index] = { ...card, description: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, cards: newCards } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                rows={2}
                placeholder="Description"
              />
              <input
                type="text"
                value={card.image || ''}
                onChange={(e) => {
                  const newCards = [...cards]
                  newCards[index] = { ...card, image: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, cards: newCards } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="URL image"
              />
              <input
                type="text"
                value={card.link || ''}
                onChange={(e) => {
                  const newCards = [...cards]
                  newCards[index] = { ...card, link: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, cards: newCards } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Lien (optionnel)"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onUpdate({ data: { ...safeBlock.data, cards: [...cards, { title: '', description: '', image: '', link: '' }] } })}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Ajouter
          </button>
          {cards.length > 1 && (
            <button
              onClick={() => onUpdate({ data: { ...safeBlock.data, cards: cards.slice(0, -1) } })}
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

// Logo Carousel
export function LogoCarouselConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const logos = safeBlock.data.logos || [{ url: '', name: '', link: '' }]
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
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Nos partenaires"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Logos ({logos.length})
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {logos.map((logo: any, index: number) => (
            <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
              <input
                type="text"
                value={logo.url || ''}
                onChange={(e) => {
                  const newLogos = [...logos]
                  newLogos[index] = { ...logo, url: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, logos: newLogos } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="URL du logo"
              />
              <input
                type="text"
                value={logo.name || ''}
                onChange={(e) => {
                  const newLogos = [...logos]
                  newLogos[index] = { ...logo, name: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, logos: newLogos } })
                }}
                className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Nom du partenaire"
              />
              <input
                type="text"
                value={logo.link || ''}
                onChange={(e) => {
                  const newLogos = [...logos]
                  newLogos[index] = { ...logo, link: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, logos: newLogos } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Lien (optionnel)"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onUpdate({ data: { ...safeBlock.data, logos: [...logos, { url: '', name: '', link: '' }] } })}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Ajouter
          </button>
          {logos.length > 1 && (
            <button
              onClick={() => onUpdate({ data: { ...safeBlock.data, logos: logos.slice(0, -1) } })}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              - Supprimer
            </button>
          )}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Autoplay
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={safeBlock.data.autoplay !== false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, autoplay: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">Défilement automatique</span>
        </label>
      </div>
    </div>
  )
}

// Route Calculator (Calculateur d'itinéraire) - Premium
export function RouteCalculatorConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Calculateur d'itinéraire"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={safeBlock.data.description || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, description: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          rows={3}
          placeholder="Calculez votre itinéraire et obtenez une estimation..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          API Key (Google Maps / OpenRouteService)
        </label>
        <input
          type="text"
          value={safeBlock.data.api_key || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, api_key: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
          placeholder="Votre clé API"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Service de cartographie
        </label>
        <select
          value={safeBlock.data.map_service || 'google'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, map_service: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="google">Google Maps</option>
          <option value="openrouteservice">OpenRouteService</option>
          <option value="mapbox">Mapbox</option>
        </select>
      </div>
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={safeBlock.data.show_map !== false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_map: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">Afficher la carte</span>
        </label>
      </div>
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={safeBlock.data.show_alternatives === true}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_alternatives: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">Afficher les itinéraires alternatifs</span>
        </label>
      </div>
    </div>
  )
}

// Fare Calculator (Calculateur de tarif) - Premium
export function FareCalculatorConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const pricingRules = safeBlock.data.pricing_rules || [{ 
    type: 'base', 
    label: 'Tarif de base', 
    amount: 0, 
    unit: 'fixed' 
  }]
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Estimez votre tarif"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={safeBlock.data.description || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, description: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          rows={2}
          placeholder="Calculez le prix de votre trajet..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Devise
        </label>
        <select
          value={safeBlock.data.currency || 'EUR'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, currency: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="EUR">€ EUR</option>
          <option value="USD">$ USD</option>
          <option value="GBP">£ GBP</option>
          <option value="CHF">CHF</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Règles de tarification ({pricingRules.length})
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {pricingRules.map((rule: any, index: number) => (
            <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded space-y-2">
              <select
                value={rule.type || 'base'}
                onChange={(e) => {
                  const newRules = [...pricingRules]
                  newRules[index] = { ...rule, type: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, pricing_rules: newRules } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
              >
                <option value="base">Tarif de base</option>
                <option value="distance">Par distance (km)</option>
                <option value="time">Par temps (min)</option>
                <option value="night">Supplément nuit</option>
                <option value="weekend">Supplément week-end</option>
                <option value="airport">Supplément aéroport</option>
              </select>
              <input
                type="text"
                value={rule.label || ''}
                onChange={(e) => {
                  const newRules = [...pricingRules]
                  newRules[index] = { ...rule, label: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, pricing_rules: newRules } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Libellé"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={rule.amount || 0}
                  onChange={(e) => {
                    const newRules = [...pricingRules]
                    newRules[index] = { ...rule, amount: parseFloat(e.target.value) || 0 }
                    onUpdate({ data: { ...safeBlock.data, pricing_rules: newRules } })
                  }}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  placeholder="Montant"
                />
                <select
                  value={rule.unit || 'fixed'}
                  onChange={(e) => {
                    const newRules = [...pricingRules]
                    newRules[index] = { ...rule, unit: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, pricing_rules: newRules } })
                  }}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                >
                  <option value="fixed">Fixe</option>
                  <option value="per_km">Par km</option>
                  <option value="per_min">Par minute</option>
                </select>
              </div>
              <button
                onClick={() => {
                  const newRules = pricingRules.filter((_: any, i: number) => i !== index)
                  onUpdate({ data: { ...safeBlock.data, pricing_rules: newRules } })
                }}
                className="w-full px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => onUpdate({ data: { ...safeBlock.data, pricing_rules: [...pricingRules, { type: 'base', label: '', amount: 0, unit: 'fixed' }] } })}
          className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Ajouter une règle
        </button>
      </div>
    </div>
  )
}

// Availability Calendar (Calendrier disponibilité) - Premium
export function AvailabilityCalendarConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Disponibilités"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={safeBlock.data.description || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, description: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          rows={2}
          placeholder="Consultez nos disponibilités..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Mode d'affichage
        </label>
        <select
          value={safeBlock.data.view_mode || 'month'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, view_mode: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="month">Mois</option>
          <option value="week">Semaine</option>
          <option value="day">Jour</option>
        </select>
      </div>
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={safeBlock.data.show_time_slots === true}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_time_slots: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">Afficher les créneaux horaires</span>
        </label>
      </div>
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={safeBlock.data.allow_booking === true}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, allow_booking: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">Permettre la réservation directe</span>
        </label>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Jours de la semaine disponibles
        </label>
        <div className="space-y-1">
          {['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'].map((day) => (
            <label key={day} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={(safeBlock.data.available_days || []).includes(day)}
                onChange={(e) => {
                  const currentDays = safeBlock.data.available_days || []
                  const newDays = e.target.checked
                    ? [...currentDays, day]
                    : currentDays.filter((d: string) => d !== day)
                  onUpdate({ data: { ...safeBlock.data, available_days: newDays } })
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300 capitalize">{day}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Heures d'ouverture (début)
        </label>
        <input
          type="time"
          value={safeBlock.data.start_time || '08:00'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, start_time: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Heures de fermeture (fin)
        </label>
        <input
          type="time"
          value={safeBlock.data.end_time || '22:00'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, end_time: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
    </div>
  )
}

// Captcha
export function CaptchaConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Thème
        </label>
        <select
          value={safeBlock.data.theme || 'light'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, theme: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="light">Clair</option>
          <option value="dark">Sombre</option>
        </select>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        💡 Le captcha affiche une opération mathématique simple que l'utilisateur doit résoudre pour vérifier qu'il n'est pas un robot.
      </div>
    </div>
  )
}

// Form Multi-step
export function FormMultiStepConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const steps = safeBlock.data.steps || [{ title: 'Étape 1', fields: [] }]
  
  const addStep = () => {
    onUpdate({ data: { ...safeBlock.data, steps: [...steps, { title: `Étape ${steps.length + 1}`, fields: [] }] } })
  }
  
  const updateStep = (index: number, field: string, value: any) => {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    onUpdate({ data: { ...safeBlock.data, steps: newSteps } })
  }
  
  const removeStep = (index: number) => {
    if (steps.length > 1) {
      const newSteps = steps.filter((_: any, i: number) => i !== index)
      onUpdate({ data: { ...safeBlock.data, steps: newSteps } })
    }
  }
  
  const addField = (stepIndex: number) => {
    const newSteps = [...steps]
    if (!newSteps[stepIndex].fields) newSteps[stepIndex].fields = []
    newSteps[stepIndex].fields.push({ name: '', type: 'text', label: '', required: false })
    onUpdate({ data: { ...safeBlock.data, steps: newSteps } })
  }
  
  const updateField = (stepIndex: number, fieldIndex: number, field: string, value: any) => {
    const newSteps = [...steps]
    newSteps[stepIndex].fields[fieldIndex] = { ...newSteps[stepIndex].fields[fieldIndex], [field]: value }
    onUpdate({ data: { ...safeBlock.data, steps: newSteps } })
  }
  
  const removeField = (stepIndex: number, fieldIndex: number) => {
    const newSteps = [...steps]
    newSteps[stepIndex].fields = newSteps[stepIndex].fields.filter((_: any, i: number) => i !== fieldIndex)
    onUpdate({ data: { ...safeBlock.data, steps: newSteps } })
  }
  
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
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Formulaire multi-étapes"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Étapes ({steps.length})
        </label>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {steps.map((step: any, stepIndex: number) => (
            <div key={stepIndex} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={step.title || ''}
                  onChange={(e) => updateStep(stepIndex, 'title', e.target.value)}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  placeholder="Titre de l'étape"
                />
                {steps.length > 1 && (
                  <button
                    onClick={() => removeStep(stepIndex)}
                    className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    title="Supprimer cette étape"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-600 dark:text-gray-400">Champs:</label>
                {(step.fields || []).map((field: any, fieldIndex: number) => (
                  <div key={fieldIndex} className="p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        value={field.label || ''}
                        onChange={(e) => updateField(stepIndex, fieldIndex, 'label', e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                        placeholder="Label"
                      />
                      <select
                        value={field.type || 'text'}
                        onChange={(e) => updateField(stepIndex, fieldIndex, 'type', e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      >
                        <option value="text">Texte</option>
                        <option value="email">Email</option>
                        <option value="tel">Téléphone</option>
                        <option value="number">Nombre</option>
                        <option value="textarea">Zone de texte</option>
                        <option value="select">Sélection</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={field.required || false}
                          onChange={(e) => updateField(stepIndex, fieldIndex, 'required', e.target.checked)}
                          className="w-3 h-3"
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400">Requis</span>
                      </label>
                      <button
                        onClick={() => removeField(stepIndex, fieldIndex)}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        title="Supprimer ce champ"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addField(stepIndex)}
                  className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  + Ajouter un champ
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addStep}
          className="mt-2 w-full px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Ajouter une étape
        </button>
      </div>
    </div>
  )
}

// Form Conditional
export function FormConditionalConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const fields = safeBlock.data.fields || []
  
  const addField = () => {
    onUpdate({ data: { ...safeBlock.data, fields: [...fields, { name: '', type: 'text', label: '', required: false, conditions: [] }] } })
  }
  
  const updateField = (index: number, field: string, value: any) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], [field]: value }
    onUpdate({ data: { ...safeBlock.data, fields: newFields } })
  }
  
  const removeField = (index: number) => {
    onUpdate({ data: { ...safeBlock.data, fields: fields.filter((_: any, i: number) => i !== index) } })
  }
  
  const addCondition = (fieldIndex: number) => {
    const newFields = [...fields]
    if (!newFields[fieldIndex].conditions) newFields[fieldIndex].conditions = []
    newFields[fieldIndex].conditions.push({ field: '', operator: 'equals', value: '' })
    onUpdate({ data: { ...safeBlock.data, fields: newFields } })
  }
  
  const updateCondition = (fieldIndex: number, conditionIndex: number, field: string, value: any) => {
    const newFields = [...fields]
    newFields[fieldIndex].conditions[conditionIndex] = { ...newFields[fieldIndex].conditions[conditionIndex], [field]: value }
    onUpdate({ data: { ...safeBlock.data, fields: newFields } })
  }
  
  const removeCondition = (fieldIndex: number, conditionIndex: number) => {
    const newFields = [...fields]
    newFields[fieldIndex].conditions = newFields[fieldIndex].conditions.filter((_: any, i: number) => i !== conditionIndex)
    onUpdate({ data: { ...safeBlock.data, fields: newFields } })
  }
  
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
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Formulaire conditionnel"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Champs ({fields.length})
        </label>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {fields.map((field: any, index: number) => (
            <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  value={field.label || ''}
                  onChange={(e) => updateField(index, 'label', e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  placeholder="Label"
                />
                <select
                  value={field.type || 'text'}
                  onChange={(e) => updateField(index, 'type', e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                >
                  <option value="text">Texte</option>
                  <option value="email">Email</option>
                  <option value="select">Sélection</option>
                  <option value="checkbox">Case à cocher</option>
                  <option value="radio">Bouton radio</option>
                </select>
              </div>
              <div className="mb-2">
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Conditions d'affichage:</label>
                {(field.conditions || []).map((condition: any, condIndex: number) => (
                  <div key={condIndex} className="p-2 bg-gray-50 dark:bg-gray-900 rounded mb-1 flex items-center gap-2">
                    <select
                      value={condition.field || ''}
                      onChange={(e) => updateCondition(index, condIndex, 'field', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    >
                      <option value="">Sélectionner un champ</option>
                      {fields.filter((f: any, i: number) => i < index).map((f: any, i: number) => (
                        <option key={i} value={f.name || f.label}>{f.label || f.name}</option>
                      ))}
                    </select>
                    <select
                      value={condition.operator || 'equals'}
                      onChange={(e) => updateCondition(index, condIndex, 'operator', e.target.value)}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    >
                      <option value="equals">Égal à</option>
                      <option value="not_equals">Différent de</option>
                      <option value="contains">Contient</option>
                    </select>
                    <input
                      type="text"
                      value={condition.value || ''}
                      onChange={(e) => updateCondition(index, condIndex, 'value', e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      placeholder="Valeur"
                    />
                    <button
                      onClick={() => removeCondition(index, condIndex)}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addCondition(index)}
                  className="w-full px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  + Ajouter condition
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={field.required || false}
                    onChange={(e) => updateField(index, 'required', e.target.checked)}
                    className="w-3 h-3"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Requis</span>
                </label>
                <button
                  onClick={() => removeField(index)}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  title="Supprimer ce champ"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addField}
          className="mt-2 w-full px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Ajouter un champ
        </button>
      </div>
    </div>
  )
}

// Form Calculator
export function FormCalculatorConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const fields = safeBlock.data.fields || []
  
  const addField = () => {
    onUpdate({ data: { ...safeBlock.data, fields: [...fields, { name: '', label: '', type: 'number', default_value: 0 }] } })
  }
  
  const updateField = (index: number, field: string, value: any) => {
    const newFields = [...fields]
    newFields[index] = { ...newFields[index], [field]: value }
    onUpdate({ data: { ...safeBlock.data, fields: newFields } })
  }
  
  const removeField = (index: number) => {
    onUpdate({ data: { ...safeBlock.data, fields: fields.filter((_: any, i: number) => i !== index) } })
  }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Calculateur"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Formule de calcul
        </label>
        <input
          type="text"
          value={safeBlock.data.formula || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, formula: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
          placeholder="field1 * field2 + field3"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Utilisez les noms des champs (ex: field1, field2) et les opérateurs +, -, *, /
        </p>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Champs ({fields.length})
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {fields.map((field: any, index: number) => (
            <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  value={field.name || ''}
                  onChange={(e) => updateField(index, 'name', e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  placeholder="Nom (pour formule)"
                />
                <input
                  type="text"
                  value={field.label || ''}
                  onChange={(e) => updateField(index, 'label', e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  placeholder="Label"
                />
              </div>
              <div className="flex items-center justify-between">
                <input
                  type="number"
                  value={field.default_value || 0}
                  onChange={(e) => updateField(index, 'default_value', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  placeholder="Valeur par défaut"
                />
                <button
                  onClick={() => removeField(index)}
                  className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  title="Supprimer ce champ"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addField}
          className="mt-2 w-full px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Ajouter un champ
        </button>
      </div>
    </div>
  )
}

// Form File Upload
export function FormFileUploadConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const allowedTypes = safeBlock.data.allowed_types || ['image/jpeg', 'image/png', 'application/pdf']
  const typeOptions = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  
  const toggleType = (type: string) => {
    const currentTypes = allowedTypes || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t: string) => t !== type)
      : [...currentTypes, type]
    onUpdate({ data: { ...safeBlock.data, allowed_types: newTypes } })
  }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Upload de fichiers"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Taille maximale (MB)
        </label>
        <input
          type="number"
          value={safeBlock.data.max_file_size || 10}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, max_file_size: parseInt(e.target.value) || 10 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          min={1}
          max={100}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Types de fichiers autorisés
        </label>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {typeOptions.map((type) => (
            <label key={type} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allowedTypes.includes(type)}
                onChange={() => toggleType(type)}
                className="w-3 h-3"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300">{type}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`form-file-upload-multiple-${block.id}`}
          checked={safeBlock.data.multiple || false}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, multiple: e.target.checked } })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor={`form-file-upload-multiple-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
          Permettre plusieurs fichiers
        </label>
      </div>
    </div>
  )
}

// Form Payment
export function FormPaymentConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const paymentMethods = safeBlock.data.payment_methods || ['stripe', 'paypal']
  const availableMethods = ['stripe', 'paypal', 'bank_transfer', 'check']
  
  const toggleMethod = (method: string) => {
    const currentMethods = paymentMethods || []
    const newMethods = currentMethods.includes(method)
      ? currentMethods.filter((m: string) => m !== method)
      : [...currentMethods, method]
    onUpdate({ data: { ...safeBlock.data, payment_methods: newMethods } })
  }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Paiement"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Montant (€)
        </label>
        <input
          type="number"
          value={safeBlock.data.amount || 0}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, amount: parseFloat(e.target.value) || 0 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          step="0.01"
          min={0}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Devise
        </label>
        <select
          value={safeBlock.data.currency || 'EUR'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, currency: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="EUR">EUR (€)</option>
          <option value="USD">USD ($)</option>
          <option value="GBP">GBP (£)</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Méthodes de paiement
        </label>
        <div className="space-y-1">
          {availableMethods.map((method) => (
            <label key={method} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={paymentMethods.includes(method)}
                onChange={() => toggleMethod(method)}
                className="w-3 h-3"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300 capitalize">{method.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-200">
        ⚠️ Assurez-vous d'avoir configuré les clés API de paiement dans les paramètres du site.
      </div>
    </div>
  )
}

// Form Quiz
export function FormQuizConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const questions = safeBlock.data.questions || []
  
  const addQuestion = () => {
    onUpdate({ data: { ...safeBlock.data, questions: [...questions, { question: '', type: 'single', answers: ['', ''], correct_answer: 0 }] } })
  }
  
  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    onUpdate({ data: { ...safeBlock.data, questions: newQuestions } })
  }
  
  const removeQuestion = (index: number) => {
    onUpdate({ data: { ...safeBlock.data, questions: questions.filter((_: any, i: number) => i !== index) } })
  }
  
  const addAnswer = (questionIndex: number) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].answers = [...(newQuestions[questionIndex].answers || []), '']
    onUpdate({ data: { ...safeBlock.data, questions: newQuestions } })
  }
  
  const updateAnswer = (questionIndex: number, answerIndex: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].answers[answerIndex] = value
    onUpdate({ data: { ...safeBlock.data, questions: newQuestions } })
  }
  
  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].answers = newQuestions[questionIndex].answers.filter((_: string, i: number) => i !== answerIndex)
    onUpdate({ data: { ...safeBlock.data, questions: newQuestions } })
  }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre du quiz
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Quiz"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Questions ({questions.length})
        </label>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {questions.map((q: any, qIndex: number) => (
            <div key={qIndex} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={q.question || ''}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  placeholder="Question"
                />
                <button
                  onClick={() => removeQuestion(qIndex)}
                  className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  title="Supprimer cette question"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="mb-2">
                <select
                  value={q.type || 'single'}
                  onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                >
                  <option value="single">Choix unique</option>
                  <option value="multiple">Choix multiples</option>
                  <option value="text">Réponse texte</option>
                </select>
              </div>
              {q.type !== 'text' && (
                <div className="space-y-1 mb-2">
                  <label className="text-xs text-gray-600 dark:text-gray-400">Réponses:</label>
                  {(q.answers || []).map((answer: string, aIndex: number) => (
                    <div key={aIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={q.correct_answer === aIndex}
                        onChange={() => updateQuestion(qIndex, 'correct_answer', aIndex)}
                        className="w-3 h-3"
                      />
                      <input
                        type="text"
                        value={answer}
                        onChange={(e) => updateAnswer(qIndex, aIndex, e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                        placeholder="Réponse"
                      />
                      {(q.answers || []).length > 2 && (
                        <button
                          onClick={() => removeAnswer(qIndex, aIndex)}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addAnswer(qIndex)}
                    className="w-full px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    + Ajouter réponse
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addQuestion}
          className="mt-2 w-full px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Ajouter une question
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`form-quiz-show-results-${block.id}`}
          checked={safeBlock.data.show_results !== false}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_results: e.target.checked } })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor={`form-quiz-show-results-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
          Afficher les résultats à la fin
        </label>
      </div>
    </div>
  )
}

// Form Survey
export function FormSurveyConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const questions = safeBlock.data.questions || []
  
  const addQuestion = () => {
    onUpdate({ data: { ...safeBlock.data, questions: [...questions, { question: '', type: 'text', required: false }] } })
  }
  
  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    onUpdate({ data: { ...safeBlock.data, questions: newQuestions } })
  }
  
  const removeQuestion = (index: number) => {
    onUpdate({ data: { ...safeBlock.data, questions: questions.filter((_: any, i: number) => i !== index) } })
  }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre du sondage
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Sondage"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={safeBlock.data.description || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, description: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          rows={2}
          placeholder="Description du sondage"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Questions ({questions.length})
        </label>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {questions.map((q: any, index: number) => (
            <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <input
                type="text"
                value={q.question || ''}
                onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                className="w-full mb-2 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Question"
              />
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select
                  value={q.type || 'text'}
                  onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                >
                  <option value="text">Texte</option>
                  <option value="textarea">Zone de texte</option>
                  <option value="radio">Bouton radio</option>
                  <option value="checkbox">Case à cocher</option>
                  <option value="scale">Échelle (1-10)</option>
                  <option value="rating">Note (étoiles)</option>
                </select>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={q.required || false}
                    onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                    className="w-3 h-3"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Requis</span>
                </label>
              </div>
              <button
                onClick={() => removeQuestion(index)}
                className="w-full px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                title="Supprimer cette question"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addQuestion}
          className="mt-2 w-full px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Ajouter une question
        </button>
      </div>
    </div>
  )
}

// Form Poll
export function FormPollConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const options = safeBlock.data.options || ['Option 1', 'Option 2']
  
  const addOption = () => {
    onUpdate({ data: { ...safeBlock.data, options: [...options, `Option ${options.length + 1}`] } })
  }
  
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    onUpdate({ data: { ...safeBlock.data, options: newOptions } })
  }
  
  const removeOption = (index: number) => {
    if (options.length > 2) {
      onUpdate({ data: { ...safeBlock.data, options: options.filter((_: string, i: number) => i !== index) } })
    }
  }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Question
        </label>
        <input
          type="text"
          value={safeBlock.data.question || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, question: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Quelle est votre opinion ?"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Options ({options.length})
        </label>
        <div className="space-y-2">
          {options.map((option: string, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder={`Option ${index + 1}`}
              />
              {options.length > 2 && (
                <button
                  onClick={() => removeOption(index)}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  title="Supprimer cette option"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addOption}
          className="mt-2 w-full px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Ajouter une option
        </button>
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={safeBlock.data.allow_multiple || false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, allow_multiple: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">Permettre choix multiples</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={safeBlock.data.show_results !== false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_results: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">Afficher les résultats</span>
        </label>
      </div>
    </div>
  )
}

// Form RSVP
export function FormRSVPConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre de l'événement
        </label>
        <input
          type="text"
          value={safeBlock.data.event_title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, event_title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Événement"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date de l'événement
        </label>
        <input
          type="date"
          value={safeBlock.data.event_date || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, event_date: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Lieu
        </label>
        <input
          type="text"
          value={safeBlock.data.event_location || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, event_location: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Adresse ou lieu"
        />
      </div>
      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={safeBlock.data.show_guests !== false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_guests: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">Demander nombre d'invités</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={safeBlock.data.show_dietary || false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_dietary: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">Demander restrictions alimentaires</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={safeBlock.data.show_message !== false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_message: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">Demander message</span>
        </label>
      </div>
    </div>
  )
}

