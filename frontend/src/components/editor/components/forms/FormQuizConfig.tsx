'use client'

import React from 'react'
import { Block } from '../../types'

export function FormQuizConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const questions = safeBlock.data.questions || []
  
  const addQuestion = () => {
    onUpdate({ data: { ...safeBlock.data, questions: [...questions, { question: '', type: 'single', answers: ['', ''], correct_answer: 0 }] } })
  }
  
  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions]
    newQuestions[index] = { ...newQuestions[index], [field]: value }
    onUpdate({ data: { ...safeBlock.data, questions: newQuestions } })
  }
  
  const removeQuestion = (index: number) => {
    onUpdate({ data: { ...safeBlock.data, questions: questions.filter((_: any, i: number) => i !== index) } })
  }
  
  const addAnswer = (questionIndex: number) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].answers = [...(newQuestions[questionIndex].answers || []), '']
    onUpdate({ data: { ...safeBlock.data, questions: newQuestions } })
  }
  
  const updateAnswer = (questionIndex: number, answerIndex: number, value: string) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].answers[answerIndex] = value
    onUpdate({ data: { ...safeBlock.data, questions: newQuestions } })
  }
  
  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].answers = newQuestions[questionIndex].answers.filter((_: string, i: number) => i !== answerIndex)
    onUpdate({ data: { ...safeBlock.data, questions: newQuestions } })
  }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre du quiz
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Quiz"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Questions ({questions.length})
        </label>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {questions.map((q: any, qIndex: number) => (
            <div key={qIndex} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={q.question || ''}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  placeholder="Question"
                />
                <button
                  onClick={() => removeQuestion(qIndex)}
                  className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  title="Supprimer cette question"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="mb-2">
                <select
                  value={q.type || 'single'}
                  onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                >
                  <option value="single">Choix unique</option>
                  <option value="multiple">Choix multiples</option>
                  <option value="text">Réponse texte</option>
                </select>
              </div>
              {q.type !== 'text' && (
                <div className="space-y-1 mb-2">
                  <label className="text-xs text-gray-600 dark:text-gray-400">Réponses:</label>
                  {(q.answers || []).map((answer: string, aIndex: number) => (
                    <div key={aIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={q.correct_answer === aIndex}
                        onChange={() => updateQuestion(qIndex, 'correct_answer', aIndex)}
                        className="w-3 h-3"
                      />
                      <input
                        type="text"
                        value={answer}
                        onChange={(e) => updateAnswer(qIndex, aIndex, e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                        placeholder="Réponse"
                      />
                      {(q.answers || []).length > 2 && (
                        <button
                          onClick={() => removeAnswer(qIndex, aIndex)}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addAnswer(qIndex)}
                    className="w-full px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    + Ajouter réponse
                  </button>
                </div>
              )}
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
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`form-quiz-show-results-${block.id}`}
          checked={safeBlock.data.show_results !== false}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_results: e.target.checked } })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor={`form-quiz-show-results-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
          Afficher les résultats à la fin
        </label>
      </div>
    </div>
  )
}
