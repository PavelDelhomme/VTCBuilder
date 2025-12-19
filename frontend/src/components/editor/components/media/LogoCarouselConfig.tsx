'use client'

import React from 'react'
import { Block } from '../../types'

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
