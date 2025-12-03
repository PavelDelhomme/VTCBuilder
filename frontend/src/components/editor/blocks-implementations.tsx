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

