'use client'

import React from 'react'
import { Block } from '../../types'

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
