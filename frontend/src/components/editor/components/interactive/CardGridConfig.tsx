'use client'

import React from 'react'
import { Block } from '../../types'

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
