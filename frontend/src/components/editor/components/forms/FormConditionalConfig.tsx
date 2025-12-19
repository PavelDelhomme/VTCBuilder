'use client'

import React from 'react'
import { Block } from '../../types'

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
