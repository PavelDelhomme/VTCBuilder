'use client'

import React from 'react'
import { Block } from '../../types'

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
