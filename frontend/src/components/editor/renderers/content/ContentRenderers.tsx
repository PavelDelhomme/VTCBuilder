'use client'

import React from 'react'
import { Block } from '../../types'
import PageSelector from '../../ui/PageSelector'

interface ContentRendererProps {
  block: Block
  onUpdate: (updates: Partial<Block>) => void
}

export function renderText({ block, onUpdate }: ContentRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Contenu (éditeur simple)
        </label>
        <textarea
          value={safeBlock.data.content || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdate({ data: { ...safeBlock.data, content: e.target.value } })}
          className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Entrez votre texte..."
          rows={6}
        />
      </div>
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          💡 Astuce: Utilisez le bloc "Paragraphe" pour un texte long formaté ou le bloc "Ligne" pour un texte court sur une ligne.
        </p>
      </div>
    </div>
  )
}

export function renderHeading({ block, onUpdate }: ContentRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const headingLevel = safeBlock.data.level || 'h2'
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte du titre
        </label>
        <input
          type="text"
          value={safeBlock.data.text || ''}
          onChange={(e) => onUpdate({ data: { ...block.data, text: e.target.value } })}
          className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-lg sm:text-2xl font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Titre..."
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Niveau
          </label>
          <select
            value={headingLevel}
            onChange={(e) => onUpdate({ data: { ...block.data, level: e.target.value } })}
            className="w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="h1">H1 (Très grand)</option>
            <option value="h2">H2 (Grand)</option>
            <option value="h3">H3 (Moyen)</option>
            <option value="h4">H4 (Petit)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Alignement
          </label>
          <select
            value={safeBlock.data.align || 'left'}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, align: e.target.value } })}
            className="w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="left">Gauche</option>
            <option value="center">Centre</option>
            <option value="right">Droite</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Couleur du titre
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={safeBlock.data.color || '#000000'}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, color: e.target.value } })}
            className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
          />
          <input
            type="text"
            value={safeBlock.data.color || '#000000'}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, color: e.target.value } })}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="#000000"
          />
        </div>
      </div>
    </div>
  )
}

export function renderParagraph({ block, onUpdate }: ContentRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-2">
      <textarea
        value={safeBlock.data.content || ''}
        onChange={(e) => onUpdate({ data: { ...block.data, content: e.target.value } })}
        className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Entrez votre paragraphe..."
        rows={6}
      />
      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
        Paragraphe complet avec formatage
      </p>
    </div>
  )
}

export function renderLine({ block, onUpdate }: ContentRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-2">
      <input
        type="text"
        value={safeBlock.data.text || ''}
        onChange={(e) => onUpdate({ data: { ...block.data, text: e.target.value } })}
        className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Texte sur une ligne..."
      />
      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
        Texte sur une seule ligne
      </p>
    </div>
  )
}

export function renderButton({ block, onUpdate }: ContentRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-2">
      <input
        type="text"
        value={safeBlock.data.text || ''}
        onChange={(e) => onUpdate({ data: { ...block.data, text: e.target.value } })}
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Texte du bouton..."
      />
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Navigation vers une page
        </label>
        <PageSelector
          value={safeBlock.data.url || ''}
          onChange={(url) => onUpdate({ data: { ...block.data, url } })}
          placeholder="Sélectionner une page..."
          className="text-sm"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          💡 Sélectionnez une page du tenant ou une page publique pour créer un lien de navigation
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Style
          </label>
          <select
            value={safeBlock.data.style || 'primary'}
            onChange={(e) => onUpdate({ data: { ...block.data, style: e.target.value } })}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="primary">Primaire</option>
            <option value="secondary">Secondaire</option>
            <option value="outline">Outline</option>
            <option value="ghost">Ghost</option>
            <option value="link">Lien</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Taille
          </label>
          <select
            value={safeBlock.data.size || 'md'}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, size: e.target.value } })}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="xs">Très petit</option>
            <option value="sm">Petit</option>
            <option value="md">Moyen</option>
            <option value="lg">Grand</option>
            <option value="xl">Très grand</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Couleur de fond
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={safeBlock.data.bg_color || '#3b82f6'}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, bg_color: e.target.value } })}
            className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
          />
          <input
            type="text"
            value={safeBlock.data.bg_color || '#3b82f6'}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, bg_color: e.target.value } })}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="#3b82f6"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Couleur du texte
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={safeBlock.data.text_color || '#ffffff'}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, text_color: e.target.value } })}
            className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
          />
          <input
            type="text"
            value={safeBlock.data.text_color || '#ffffff'}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, text_color: e.target.value } })}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="#ffffff"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`button-full-width-${block.id}`}
          checked={safeBlock.data.full_width || false}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, full_width: e.target.checked } })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor={`button-full-width-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
          Largeur complète
        </label>
      </div>
      {(!safeBlock.data.text || !safeBlock.data.url) && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">Voir la prévisualisation à droite →</p>
      )}
    </div>
  )
}

export function renderLink({ block, onUpdate }: ContentRendererProps) {
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

export function renderList({ block, onUpdate }: ContentRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const listItems = safeBlock.data.items || ['Item 1', 'Item 2']
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Type de liste
        </label>
        <select
          value={safeBlock.data.list_type || 'unordered'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, list_type: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="unordered">Non ordonnée (puces)</option>
          <option value="ordered">Ordonnée (numéros)</option>
          <option value="none">Aucun style</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Éléments (un par ligne)
        </label>
        <textarea
          value={listItems.join('\n')}
          onChange={(e) => {
            const newItems = e.target.value.split('\n').filter(item => item.trim())
            onUpdate({ data: { ...block.data, items: newItems } })
          }}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Item 1&#10;Item 2&#10;Item 3"
          rows={6}
        />
      </div>
    </div>
  )
}

export function renderAlert({ block, onUpdate }: ContentRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Type d'alerte
        </label>
        <select
          value={safeBlock.data.variant || 'info'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, variant: e.target.value } })}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="info">Information (Bleu)</option>
          <option value="success">Succès (Vert)</option>
          <option value="warning">Avertissement (Jaune)</option>
          <option value="error">Erreur (Rouge)</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre (optionnel)
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Titre de l'alerte..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Message
        </label>
        <textarea
          value={safeBlock.data.message || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, message: e.target.value } })}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Message de l'alerte..."
          rows={4}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`alert-dismissible-${block.id}`}
          checked={safeBlock.data.dismissible || false}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, dismissible: e.target.checked } })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor={`alert-dismissible-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
          Permettre la fermeture (bouton X)
        </label>
      </div>
      {(!safeBlock.data.message) && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">Voir la prévisualisation à droite →</p>
      )}
    </div>
  )
}

export function renderCode({ block, onUpdate }: ContentRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const commonLanguages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'csharp', label: 'C#' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'scss', label: 'SCSS' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'sql', label: 'SQL' },
    { value: 'bash', label: 'Bash' },
    { value: 'shell', label: 'Shell' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'plaintext', label: 'Texte brut' },
  ]
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Langage de programmation
        </label>
        <select
          value={safeBlock.data.language || 'plaintext'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, language: e.target.value } })}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {commonLanguages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Code source
        </label>
        <textarea
          value={safeBlock.data.code || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, code: e.target.value } })}
          className="w-full p-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
          placeholder="Entrez votre code ici..."
          rows={10}
          spellCheck={false}
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`code-line-numbers-${block.id}`}
            checked={safeBlock.data.showLineNumbers || false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, showLineNumbers: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor={`code-line-numbers-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
            Afficher les numéros de ligne
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`code-copy-button-${block.id}`}
            checked={safeBlock.data.showCopyButton !== false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, showCopyButton: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor={`code-copy-button-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
            Bouton copier
          </label>
        </div>
      </div>
      {(!safeBlock.data.code) && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">Voir la prévisualisation à droite →</p>
      )}
    </div>
  )
}

export function renderTable({ block, onUpdate }: ContentRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const rows = safeBlock.data.rows || 3
  const cols = safeBlock.data.columns || 3
  const tableData = safeBlock.data.table_data || Array(rows).fill(null).map(() => Array(cols).fill(''))
  
  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...tableData]
    if (!newData[rowIndex]) newData[rowIndex] = []
    newData[rowIndex][colIndex] = value
    onUpdate({ data: { ...block.data, table_data: newData } })
  }
  
  const addRow = () => {
    const newData = [...tableData, Array(cols).fill('')]
    onUpdate({ data: { ...block.data, rows: rows + 1, table_data: newData } })
  }
  
  const removeRow = () => {
    if (rows > 1) {
      const newData = tableData.slice(0, -1)
      onUpdate({ data: { ...block.data, rows: rows - 1, table_data: newData } })
    }
  }
  
  const addColumn = () => {
    const newData = tableData.map((row: string[]) => [...row, ''])
    onUpdate({ data: { ...block.data, columns: cols + 1, table_data: newData } })
  }
  
  const removeColumn = () => {
    if (cols > 1) {
      const newData = tableData.map((row: string[]) => row.slice(0, -1))
      onUpdate({ data: { ...block.data, columns: cols - 1, table_data: newData } })
    }
  }
  
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Lignes</label>
          <div className="flex gap-1">
            <input
              type="number"
              value={rows}
              onChange={(e) => {
                const newRows = parseInt(e.target.value) || 1
                const newData = Array(newRows).fill(null).map((_, i) => tableData[i] || Array(cols).fill(''))
                onUpdate({ data: { ...block.data, rows: newRows, table_data: newData } })
              }}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              min={1}
              max={20}
            />
            <button onClick={addRow} className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">+</button>
            <button onClick={removeRow} className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">-</button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Colonnes</label>
          <div className="flex gap-1">
            <input
              type="number"
              value={cols}
              onChange={(e) => {
                const newCols = parseInt(e.target.value) || 1
                const newData = tableData.map((row: string[]) => [...row.slice(0, newCols), ...Array(Math.max(0, newCols - row.length)).fill('')])
                onUpdate({ data: { ...block.data, columns: newCols, table_data: newData } })
              }}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              min={1}
              max={20}
            />
            <button onClick={addColumn} className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">+</button>
            <button onClick={removeColumn} className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">-</button>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Contenu du tableau</label>
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 max-h-64 overflow-auto">
          <table className="w-full text-xs">
            <tbody>
              {tableData.map((row: string[], rowIndex: number) => (
                <tr key={rowIndex}>
                  {row.map((cell: string, colIndex: number) => (
                    <td key={colIndex} className="p-1 border border-gray-200 dark:border-gray-700">
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                        className="w-full px-1 py-0.5 text-xs border-0 focus:ring-1 focus:ring-blue-500 bg-transparent"
                        placeholder={`Cellule ${rowIndex + 1},${colIndex + 1}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`table-header-${block.id}`}
          checked={safeBlock.data.has_header || false}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, has_header: e.target.checked } })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor={`table-header-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
          Première ligne en en-tête
        </label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`table-bordered-${block.id}`}
          checked={safeBlock.data.bordered !== false}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, bordered: e.target.checked } })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor={`table-bordered-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
          Bordures visibles
        </label>
      </div>
    </div>
  )
}

export function renderQuote({ block, onUpdate }: ContentRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Citation
        </label>
        <textarea
          value={safeBlock.data.text || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, text: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Votre citation..."
          rows={3}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Auteur
        </label>
        <input
          type="text"
          value={safeBlock.data.author || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, author: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Nom de l'auteur"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Couleur de la bordure
        </label>
        <input
          type="color"
          value={safeBlock.data.color || '#3B82F6'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, color: e.target.value } })}
          className="w-full h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
        />
      </div>
    </div>
  )
}

export function renderSpacer({ block, onUpdate }: ContentRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Direction
        </label>
        <select
          value={safeBlock.data.direction || 'vertical'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, direction: e.target.value } })}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="vertical">Vertical (hauteur)</option>
          <option value="horizontal">Horizontal (largeur)</option>
        </select>
      </div>
      {safeBlock.data.direction === 'horizontal' ? (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Largeur (px)
            </label>
            <input
              type="number"
              value={safeBlock.data.width || 40}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, width: parseInt(e.target.value) || 40 } })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Largeur en pixels..."
              min={10}
              max={200}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">Espaceur horizontal de {(safeBlock.data.width || 40)}px</p>
        </>
      ) : (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hauteur (px)
            </label>
            <input
              type="number"
              value={safeBlock.data.height || 40}
              onChange={(e) => onUpdate({ data: { ...block.data, height: parseInt(e.target.value) || 40 } })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Hauteur en pixels..."
              min={10}
              max={200}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">Espaceur vertical de {(safeBlock.data.height || 40)}px</p>
        </>
      )}
    </div>
  )
}

export function renderDivider({ block, onUpdate }: ContentRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Direction
        </label>
        <select
          value={safeBlock.data.direction || 'horizontal'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, direction: e.target.value } })}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="horizontal">Horizontal (ligne)</option>
          <option value="vertical">Vertical (colonne)</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Style
        </label>
        <select
          value={safeBlock.data.style || 'solid'}
          onChange={(e) => onUpdate({ data: { ...block.data, style: e.target.value } })}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="solid">Solide</option>
          <option value="dashed">Tirets</option>
          <option value="dotted">Pointillés</option>
          <option value="double">Double</option>
        </select>
      </div>
      {safeBlock.data.direction === 'horizontal' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Largeur
          </label>
          <select
            value={safeBlock.data.width || 'full'}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, width: e.target.value } })}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="full">100%</option>
            <option value="half">50%</option>
            <option value="third">33%</option>
          </select>
        </div>
      )}
      {safeBlock.data.direction === 'vertical' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hauteur
          </label>
          <input
            type="number"
            value={safeBlock.data.height || 100}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, height: parseInt(e.target.value) || 100 } })}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Hauteur en pixels..."
            min={20}
            max={500}
          />
        </div>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
        Séparateur {safeBlock.data.direction === 'horizontal' ? 'horizontal' : 'vertical'} {safeBlock.data.style || 'solid'}
      </p>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Couleur
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={safeBlock.data.color || '#e5e7eb'}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, color: e.target.value } })}
            className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
          />
          <input
            type="text"
            value={safeBlock.data.color || '#e5e7eb'}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, color: e.target.value } })}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="#e5e7eb"
          />
        </div>
      </div>
    </div>
  )
}

