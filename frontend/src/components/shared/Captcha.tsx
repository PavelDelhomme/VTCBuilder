'use client'

import React, { useState, useEffect, useRef } from 'react'

interface CaptchaProps {
  onVerify: (isValid: boolean) => void
  onReset?: () => void
  className?: string
  theme?: 'light' | 'dark'
}

/**
 * Composant Captcha simple avec opération mathématique
 * Génère une opération aléatoire (addition, soustraction, multiplication)
 * et vérifie la réponse de l'utilisateur
 */
export default function Captcha({ onVerify, onReset, className = '', theme = 'light' }: CaptchaProps) {
  const [num1, setNum1] = useState(0)
  const [num2, setNum2] = useState(0)
  const [operator, setOperator] = useState<'+' | '-' | '×'>('+')
  const [answer, setAnswer] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Générer une nouvelle opération
  const generateChallenge = () => {
    const operators: ('+' | '-' | '×')[] = ['+', '-', '×']
    const randomOperator = operators[Math.floor(Math.random() * operators.length)]
    
    let n1: number
    let n2: number
    
    if (randomOperator === '×') {
      // Pour la multiplication, utiliser des nombres plus petits (1-10)
      n1 = Math.floor(Math.random() * 10) + 1
      n2 = Math.floor(Math.random() * 10) + 1
    } else {
      // Pour addition et soustraction, utiliser des nombres 1-20
      n1 = Math.floor(Math.random() * 20) + 1
      n2 = Math.floor(Math.random() * 20) + 1
      
      // Pour la soustraction, s'assurer que le résultat est positif
      if (randomOperator === '-' && n1 < n2) {
        [n1, n2] = [n2, n1]
      }
    }
    
    setNum1(n1)
    setNum2(n2)
    setOperator(randomOperator)
    setAnswer('')
    setIsVerified(false)
    setError('')
    onVerify(false)
    
    // Focus sur l'input
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  // Générer une opération au montage
  useEffect(() => {
    generateChallenge()
  }, [])

  // Réinitialiser quand onReset est appelé
  useEffect(() => {
    if (onReset) {
      const resetHandler = () => {
        generateChallenge()
      }
      // Note: onReset est une fonction, on ne peut pas l'ajouter directement comme dépendance
      // On va plutôt écouter les changements via un callback
    }
  }, [])

  // Calculer la réponse correcte
  const getCorrectAnswer = (): number => {
    switch (operator) {
      case '+':
        return num1 + num2
      case '-':
        return num1 - num2
      case '×':
        return num1 * num2
      default:
        return 0
    }
  }

  // Vérifier la réponse
  const handleVerify = () => {
    const userAnswer = parseInt(answer.trim())
    const correctAnswer = getCorrectAnswer()
    
    if (isNaN(userAnswer)) {
      setError('Veuillez entrer un nombre')
      setIsVerified(false)
      onVerify(false)
      return
    }
    
    if (userAnswer === correctAnswer) {
      setIsVerified(true)
      setError('')
      onVerify(true)
    } else {
      setError('Réponse incorrecte. Veuillez réessayer.')
      setIsVerified(false)
      onVerify(false)
      // Générer une nouvelle opération après une erreur
      setTimeout(() => {
        generateChallenge()
      }, 1500)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleVerify()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9-]/g, '') // Seulement les chiffres et le signe moins
    setAnswer(value)
    setError('')
    setIsVerified(false)
    onVerify(false)
  }

  return (
    <div className={`captcha-container ${className}`}>
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-gray-50 border-gray-300'
      }`}>
        {/* Challenge mathématique */}
        <div className={`flex items-center gap-2 font-mono text-lg font-bold ${
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        }`}>
          <span>{num1}</span>
          <span className="text-blue-600 dark:text-blue-400">{operator === '×' ? '×' : operator}</span>
          <span>{num2}</span>
          <span className="mx-2">=</span>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={answer}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            className={`w-16 px-2 py-1 text-center border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              isVerified
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : error
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-gray-100'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            placeholder="?"
            disabled={isVerified}
            autoComplete="off"
          />
        </div>

        {/* Bouton de vérification */}
        {!isVerified && (
          <button
            type="button"
            onClick={handleVerify}
            className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
          >
            Vérifier
          </button>
        )}

        {/* Indicateur de succès */}
        {isVerified && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs font-medium">Vérifié</span>
          </div>
        )}

        {/* Bouton pour générer une nouvelle opération */}
        {!isVerified && (
          <button
            type="button"
            onClick={generateChallenge}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Nouvelle opération"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      {/* Message d'error */}
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Message d'aide */}
      {!isVerified && !error && (
        <p className={`mt-1 text-xs ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Résolvez l'opération pour continuer
        </p>
      )}
    </div>
  )
}

