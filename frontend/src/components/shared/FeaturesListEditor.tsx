'use client'

import { useState } from 'react'
import LoadingSpinner from './LoadingSpinner'

interface FeaturesListEditorProps {
  features: string[]
  onChange: (features: string[]) => void
  placeholder?: string
}

export default function FeaturesListEditor({
  features,
  onChange,
  placeholder = 'Ajouter une fonctionnalité...'
}: FeaturesListEditorProps) {
  const [newFeature, setNewFeature] = useState('')

  const handleAddFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      onChange([...features, newFeature.trim()])
      setNewFeature('')
    }
  }

  const handleRemoveFeature = (index: number) => {
    onChange(features.filter((_, i) => i !== index))
  }

  const handleUpdateFeature = (index: number, value: string) => {
    const updated = [...features]
    updated[index] = value
    onChange(updated)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddFeature()
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Fonctionnalités
      </label>
      
      {/* Liste des fonctionnalités existantes */}
      <div className="space-y-2">
        {features.length > 0 ? (
          features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <svg
                className="h-5 w-5 text-green-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <input
                type="text"
                value={feature}
                onChange={(e) => handleUpdateFeature(index, e.target.value)}
                className="flex-1 px-2 py-1 border dark:bg-gray-600 dark:text-gray-100 border-gray-300 dark:border-gray-500 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nom de la fonctionnalité"
              />
              <button
                type="button"
                onClick={() => handleRemoveFeature(index)}
                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title="Supprimer"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            Aucune fonctionnalité ajoutée pour le moment
          </p>
        )}
      </div>

      {/* Champ pour ajouter une nouvelle fonctionnalité */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newFeature}
          onChange={(e) => setNewFeature(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={handleAddFeature}
          disabled={!newFeature.trim() || features.includes(newFeature.trim())}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Ajouter
        </button>
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Appuyez sur Entrée ou cliquez sur "Ajouter" pour ajouter une fonctionnalité
      </p>
    </div>
  )
}

