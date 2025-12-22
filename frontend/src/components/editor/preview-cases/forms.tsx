import React, { useState } from 'react'
import { PreviewCaseProps } from './types'
import Captcha from '@/components/shared/Captcha'

// Blocs de formulaires : form, form-newsletter, form-search, form-inscription, form-multi-step, 
// form-conditional, form-calculator, form-file-upload, form-payment, form-quiz, form-survey, 
// form-poll, form-rsvp, captcha

// Note: Certains cases utilisent des fonctions renderForm, renderFormMultiStep, etc. depuis './renderers/forms'
// Ces fonctions seront importées si elles existent, sinon on utilise les implémentations inline

export function renderFormNewsletter(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  return (
    <div 
      style={{
        ...wrapperStyles,
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderColor: isDark ? '#374151' : '#e5e7eb'
      }} 
      className="mb-6 p-6 rounded-lg shadow-md border"
    >
      {block.data.title && (
        <h3 
          className="text-xl font-bold mb-2"
          style={{ color: isDark ? '#f3f4f6' : '#111827' }}
        >
          {block.data.title}
        </h3>
      )}
      {block.data.description && (
        <p 
          className="text-sm mb-4"
          style={{ color: isDark ? '#9ca3af' : '#4b5563' }}
        >
          {block.data.description}
        </p>
      )}
      <form className="flex gap-2">
        <input
          type="email"
          placeholder="Votre email"
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          style={{
            borderColor: isDark ? '#4b5563' : '#d1d5db',
            backgroundColor: isDark ? '#374151' : '#ffffff',
            color: isDark ? '#f3f4f6' : '#111827'
          }}
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {block.data.button_text || 'S\'inscrire'}
        </button>
      </form>
    </div>
  )
}

export function renderFormSearch(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  return (
    <div style={wrapperStyles} className="mb-6">
      <form className="flex gap-2">
        <input
          type="search"
          placeholder={block.data.placeholder || 'Rechercher...'}
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          style={{
            borderColor: isDark ? '#4b5563' : '#d1d5db',
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            color: isDark ? '#f3f4f6' : '#111827'
          }}
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {block.data.button_text || 'Rechercher'}
        </button>
      </form>
    </div>
  )
}

export function renderFormInscription(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  return (
    <div 
      style={{
        ...wrapperStyles,
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderColor: isDark ? '#374151' : '#e5e7eb'
      }} 
      className="mb-6 p-6 rounded-lg shadow-md border"
    >
      {block.data.title && (
        <h3 
          className="text-xl font-bold mb-4"
          style={{ color: isDark ? '#f3f4f6' : '#111827' }}
        >
          {block.data.title}
        </h3>
      )}
      <form className="space-y-4">
        {block.data.show_name !== false && (
          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: isDark ? '#d1d5db' : '#374151' }}
            >
              Nom complet
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{
                borderColor: isDark ? '#4b5563' : '#d1d5db',
                backgroundColor: isDark ? '#374151' : '#ffffff',
                color: isDark ? '#f3f4f6' : '#111827'
              }}
            />
          </div>
        )}
        {block.data.show_email !== false && (
          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: isDark ? '#d1d5db' : '#374151' }}
            >
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{
                borderColor: isDark ? '#4b5563' : '#d1d5db',
                backgroundColor: isDark ? '#374151' : '#ffffff',
                color: isDark ? '#f3f4f6' : '#111827'
              }}
            />
          </div>
        )}
        {block.data.show_password !== false && (
          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: isDark ? '#d1d5db' : '#374151' }}
            >
              Mot de passe
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{
                borderColor: isDark ? '#4b5563' : '#d1d5db',
                backgroundColor: isDark ? '#374151' : '#ffffff',
                color: isDark ? '#f3f4f6' : '#111827'
              }}
            />
          </div>
        )}
        {block.data.show_phone && (
          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: isDark ? '#d1d5db' : '#374151' }}
            >
              Téléphone
            </label>
            <input
              type="tel"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{
                borderColor: isDark ? '#4b5563' : '#d1d5db',
                backgroundColor: isDark ? '#374151' : '#ffffff',
                color: isDark ? '#f3f4f6' : '#111827'
              }}
            />
          </div>
        )}
        {block.data.enable_captcha && (
          <div className="mt-4">
            <Captcha
              onVerify={(isValid) => {
                // La validation est gérée par le composant Captcha lui-même
              }}
              theme={block.data.captcha_theme || 'light'}
            />
          </div>
        )}
        <button
          type="submit"
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {block.data.button_text || 'S\'inscrire'}
        </button>
      </form>
    </div>
  )
}

export function renderFormFileUpload(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  return (
    <div style={wrapperStyles} className="mb-6">
      <form className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        {block.data.title && (
          <h3 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
            {block.data.title}
          </h3>
        )}
        <div className={`border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'} rounded-lg p-8 text-center`}>
          <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
            Glissez vos fichiers ici ou cliquez pour sélectionner
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Taille max: {block.data.max_file_size || 10} MB
          </p>
          {block.data.allowed_types && (
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
              Types: {block.data.allowed_types.join(', ')}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          disabled
        >
          Téléverser
        </button>
      </form>
    </div>
  )
}

// Composant pour form-quiz (utilise useState)
export function renderFormQuiz(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const questions = block.data.questions || []
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  
  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = { ...answers, [questionIndex]: answerIndex }
    setAnswers(newAnswers)
  }
  
  const submitQuiz = () => {
    let correct = 0
    questions.forEach((q: any, index: number) => {
      if (answers[index] === q.correct_answer) correct++
    })
    setScore(correct)
    setShowResults(true)
  }
  
  if (showResults && block.data.show_results !== false) {
    return (
      <div style={wrapperStyles} className="mb-6">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 text-center`}>
          <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Résultats</h3>
          <p className={`text-4xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} mb-2`}>
            {score} / {questions.length}
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {Math.round((score / questions.length) * 100)}% de bonnes réponses
          </p>
        </div>
      </div>
    )
  }
  
  if (questions.length === 0) {
    return (
      <div style={wrapperStyles} className="mb-6">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 text-center`}>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>No questions configured</p>
        </div>
      </div>
    )
  }
  
  const question = questions[currentQuestion]
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      <form className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        {block.data.title && (
          <h3 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-4`}>{block.data.title}</h3>
        )}
        <div className="mb-4">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Question {currentQuestion + 1} sur {questions.length}
          </p>
        </div>
        <div className="space-y-4">
          <h4 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            {question.question || 'Question'}
          </h4>
          {question.type === 'text' ? (
            <input
              type="text"
              className={`w-full px-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-900'} rounded-lg`}
              disabled
            />
          ) : (
            <div className="space-y-2">
              {(question.answers || []).map((answer: string, aIndex: number) => (
                <label
                  key={aIndex}
                  className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    answers[currentQuestion] === aIndex
                      ? `border-blue-500 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`
                      : `${isDark ? 'border-gray-600 hover:border-blue-700' : 'border-gray-300 hover:border-blue-300'}`
                  }`}
                >
                  <input
                    type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                    name={`question-${currentQuestion}`}
                    checked={answers[currentQuestion] === aIndex}
                    onChange={() => handleAnswer(currentQuestion, aIndex)}
                    className="w-4 h-4"
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{answer}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className={`px-4 py-2 ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Précédent
          </button>
          {currentQuestion < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Suivant
            </button>
          ) : (
            <button
              type="button"
              onClick={submitQuiz}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Terminer
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export function renderFormSurvey(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const questions = block.data.questions || []
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      <form className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        {block.data.title && (
          <h3 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}>{block.data.title}</h3>
        )}
        {block.data.description && (
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>{block.data.description}</p>
        )}
        <div className="space-y-6">
          {questions.map((q: any, index: number) => (
            <div key={index}>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                {q.question || 'Question'}
                {q.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {q.type === 'textarea' ? (
                <textarea
                  className={`w-full px-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-900'} rounded-lg`}
                  rows={4}
                  disabled
                />
              ) : q.type === 'radio' ? (
                <div className="space-y-2">
                  {['Option 1', 'Option 2', 'Option 3'].map((opt, oIndex) => (
                    <label key={oIndex} className="flex items-center gap-2">
                      <input type="radio" name={`survey-${index}`} disabled className="w-4 h-4" />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{opt}</span>
                    </label>
                  ))}
                </div>
              ) : q.type === 'checkbox' ? (
                <div className="space-y-2">
                  {['Option 1', 'Option 2', 'Option 3'].map((opt, oIndex) => (
                    <label key={oIndex} className="flex items-center gap-2">
                      <input type="checkbox" disabled className="w-4 h-4" />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{opt}</span>
                    </label>
                  ))}
                </div>
              ) : q.type === 'scale' ? (
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>1</span>
                  <input type="range" min="1" max="10" defaultValue="5" disabled className="flex-1" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>10</span>
                </div>
              ) : q.type === 'rating' ? (
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" disabled className={`text-2xl ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
                      ⭐
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type={q.type || 'text'}
                  className={`w-full px-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-900'} rounded-lg`}
                  disabled
                />
              )}
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          disabled
        >
          Envoyer le sondage
        </button>
      </form>
    </div>
  )
}

// Composant pour form-poll (utilise useState)
export function renderFormPoll(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const options = block.data.options || []
  const [selected, setSelected] = useState<number[]>([])
  const [voted, setVoted] = useState(false)
  const [results, setResults] = useState<Record<number, number>>({})
  const isDark = theme === 'dark'
  
  const handleVote = () => {
    if (selected.length === 0) return
    const newResults: Record<number, number> = {}
    options.forEach((_: string, index: number) => {
      newResults[index] = selected.includes(index) ? 50 : Math.random() * 30
    })
    setResults(newResults)
    setVoted(true)
  }
  
  return (
    <div style={wrapperStyles} className="mb-6">
      <form className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <h3 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
          {block.data.question || 'Question'}
        </h3>
        {!voted ? (
          <div className="space-y-3">
            {options.map((option: string, index: number) => (
              <label
                key={index}
                className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                  selected.includes(index)
                    ? `border-blue-500 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`
                    : `${isDark ? 'border-gray-600 hover:border-blue-700' : 'border-gray-300 hover:border-blue-300'}`
                }`}
              >
                <input
                  type={block.data.allow_multiple ? 'checkbox' : 'radio'}
                  name="poll"
                  checked={selected.includes(index)}
                  onChange={(e) => {
                    if (block.data.allow_multiple) {
                      setSelected(e.target.checked
                        ? [...selected, index]
                        : selected.filter(i => i !== index)
                      )
                    } else {
                      setSelected([index])
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className={`text-sm flex-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{option}</span>
              </label>
            ))}
            <button
              type="button"
              onClick={handleVote}
              disabled={selected.length === 0}
              className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Voter
            </button>
          </div>
        ) : block.data.show_results !== false ? (
          <div className="space-y-3">
            {options.map((option: string, index: number) => {
              const percentage = results[index] || 0
              return (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{option}</span>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{percentage.toFixed(0)}%</span>
                  </div>
                  <div className={`w-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Merci pour votre vote !</p>
          </div>
        )}
      </form>
    </div>
  )
}

// Composant pour form-rsvp (utilise useState)
export function renderFormRSVP(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const [response, setResponse] = useState<'yes' | 'no' | null>(null)
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      <form className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <h3 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
          {block.data.event_title || 'Événement'}
        </h3>
        {block.data.event_date && (
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
            📅 {new Date(block.data.event_date).toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        )}
        {block.data.event_location && (
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
            📍 {block.data.event_location}
          </p>
        )}
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Nom complet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full px-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-900'} rounded-lg`}
              disabled
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className={`w-full px-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-900'} rounded-lg`}
              disabled
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Confirmez votre présence <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className={`flex-1 p-4 border-2 rounded-lg cursor-pointer text-center transition-colors ${
                response === 'yes'
                  ? `border-green-500 ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`
                  : `${isDark ? 'border-gray-600 hover:border-green-700' : 'border-gray-300 hover:border-green-300'}`
              }`}>
                <input
                  type="radio"
                  name="rsvp"
                  checked={response === 'yes'}
                  onChange={() => setResponse('yes')}
                  className="sr-only"
                />
                <span className="text-lg">✅</span>
                <p className={`text-sm font-medium mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Je serai présent(e)</p>
              </label>
              <label className={`flex-1 p-4 border-2 rounded-lg cursor-pointer text-center transition-colors ${
                response === 'no'
                  ? `border-red-500 ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`
                  : `${isDark ? 'border-gray-600 hover:border-red-700' : 'border-gray-300 hover:border-red-300'}`
              }`}>
                <input
                  type="radio"
                  name="rsvp"
                  checked={response === 'no'}
                  onChange={() => setResponse('no')}
                  className="sr-only"
                />
                <span className="text-lg">❌</span>
                <p className={`text-sm font-medium mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Je ne pourrai pas venir</p>
              </label>
            </div>
          </div>
          {block.data.show_guests && (
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Nombre d'invités
              </label>
              <input
                type="number"
                min="0"
                className={`w-full px-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-900'} rounded-lg`}
                disabled
              />
            </div>
          )}
          {block.data.show_dietary && (
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Restrictions alimentaires
              </label>
              <textarea
                className={`w-full px-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-900'} rounded-lg`}
                rows={2}
                placeholder="Végétarien, allergies, etc."
                disabled
              />
            </div>
          )}
          {block.data.show_message && (
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Message (optionnel)
              </label>
              <textarea
                className={`w-full px-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-900'} rounded-lg`}
                rows={3}
                disabled
              />
            </div>
          )}
        </div>
        <button
          type="submit"
          className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          disabled
        >
          Confirmer
        </button>
      </form>
    </div>
  )
}

export function renderCaptcha(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  return (
    <div style={wrapperStyles} className="mb-6">
      <Captcha
        onVerify={(isValid) => {
          // La validation est gérée par le composant Captcha lui-même
        }}
        theme={block.data.theme || theme}
        className={block.data.className || ''}
      />
    </div>
  )
}

// Les cases suivants utilisent des fonctions depuis './renderers/forms'
// On les importe si disponibles, sinon on crée des stubs
let renderForm: ((props: PreviewCaseProps) => React.ReactElement | null) | null = null
let renderFormMultiStep: ((props: PreviewCaseProps) => React.ReactElement | null) | null = null
let renderFormConditional: ((props: PreviewCaseProps) => React.ReactElement | null) | null = null
let renderFormCalculator: ((props: PreviewCaseProps) => React.ReactElement | null) | null = null
let renderFormPayment: ((props: PreviewCaseProps) => React.ReactElement | null) | null = null

try {
  const formsRenderers = require('./renderers/forms')
  renderForm = formsRenderers.renderForm || null
  renderFormMultiStep = formsRenderers.renderFormMultiStep || null
  renderFormConditional = formsRenderers.renderFormConditional || null
  renderFormCalculator = formsRenderers.renderFormCalculator || null
  renderFormPayment = formsRenderers.renderFormPayment || null
} catch (e) {
  // Les renderers n'existent pas encore, on utilisera les stubs
}

export function renderFormBase(props: PreviewCaseProps): React.ReactElement | null {
  if (renderForm) {
    return renderForm(props)
  }
  // Stub si renderForm n'existe pas
  return (
    <div style={props.wrapperStyles} className="mb-6 p-6 border-2 border-dashed rounded">
      <p className="text-gray-500">Form renderer not available</p>
    </div>
  )
}

export function renderFormMultiStepBase(props: PreviewCaseProps): React.ReactElement | null {
  if (renderFormMultiStep) {
    return renderFormMultiStep(props)
  }
  return (
    <div style={props.wrapperStyles} className="mb-6 p-6 border-2 border-dashed rounded">
      <p className="text-gray-500">Multi-step form renderer not available</p>
    </div>
  )
}

export function renderFormConditionalBase(props: PreviewCaseProps): React.ReactElement | null {
  if (renderFormConditional) {
    return renderFormConditional(props)
  }
  return (
    <div style={props.wrapperStyles} className="mb-6 p-6 border-2 border-dashed rounded">
      <p className="text-gray-500">Conditional form renderer not available</p>
    </div>
  )
}

export function renderFormCalculatorBase(props: PreviewCaseProps): React.ReactElement | null {
  if (renderFormCalculator) {
    return renderFormCalculator(props)
  }
  return (
    <div style={props.wrapperStyles} className="mb-6 p-6 border-2 border-dashed rounded">
      <p className="text-gray-500">Calculator form renderer not available</p>
    </div>
  )
}

export function renderFormPaymentBase(props: PreviewCaseProps): React.ReactElement | null {
  if (renderFormPayment) {
    return renderFormPayment(props)
  }
  return (
    <div style={props.wrapperStyles} className="mb-6 p-6 border-2 border-dashed rounded">
      <p className="text-gray-500">Payment form renderer not available</p>
    </div>
  )
}

// Export map
export const formsCases: Record<string, (props: PreviewCaseProps) => React.ReactElement | null> = {
  'form-newsletter': renderFormNewsletter,
  'form-search': renderFormSearch,
  'form-inscription': renderFormInscription,
  'form-file-upload': renderFormFileUpload,
  'form-quiz': renderFormQuiz,
  'form-survey': renderFormSurvey,
  'form-poll': renderFormPoll,
  'form-rsvp': renderFormRSVP,
  'captcha': renderCaptcha,
  'form': renderFormBase,
  'form-multi-step': renderFormMultiStepBase,
  'form-conditional': renderFormConditionalBase,
  'form-calculator': renderFormCalculatorBase,
  'form-payment': renderFormPaymentBase,
}

