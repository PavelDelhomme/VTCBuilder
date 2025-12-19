'use client'

import React from 'react'
import { Block } from '../../types'

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
