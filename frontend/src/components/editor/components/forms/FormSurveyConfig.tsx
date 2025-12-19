'use client'

import React from 'react'
import { Block } from '../../types'

export function FormSurveyConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const questions = safeBlock.data.questions || []
  
  const addQuestion = () => {
    onUpdate({ data: { ...safeBlock.data, questions: [...questions, { question: '', type: 'text', required: false }] } })
  }
  
  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    onUpdate({ data: { ...safeBlock.data, questions: newQuestions } })
  }
  
  const removeQuestion = (index: number) => {
    onUpdate({ data: { ...safeBlock.data, questions: questions.filter((_: any, i: number) => i !== index) } })
  }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre du sondage
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Sondage"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={safeBlock.data.description || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, description: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          rows={2}
          placeholder="Description du sondage"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Questions ({questions.length})
        </label>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {questions.map((q: any, index: number) => (
            <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <input
                type="text"
                value={q.question || ''}
                onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                className="w-full mb-2 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                placeholder="Question"
              />
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select
                  value={q.type || 'text'}
                  onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                >
                  <option value="text">Texte</option>
                  <option value="textarea">Zone de texte</option>
                  <option value="radio">Bouton radio</option>
                  <option value="checkbox">Case à cocher</option>
                  <option value="scale">Échelle (1-10)</option>
                  <option value="rating">Note (étoiles)</option>
                </select>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={q.required || false}
                    onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                    className="w-3 h-3"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Requis</span>
                </label>
              </div>
              <button
                onClick={() => removeQuestion(index)}
                className="w-full px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                title="Supprimer cette question"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addQuestion}
          className="mt-2 w-full px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Ajouter une question
        </button>
      </div>
    </div>
  )
}
