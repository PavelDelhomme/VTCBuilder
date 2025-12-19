'use client'

import React from 'react'
import { Block } from '../../types'

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
