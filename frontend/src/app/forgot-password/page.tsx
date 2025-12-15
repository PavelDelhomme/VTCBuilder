'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/password-reset/request/', {
        email: email,
      })

      setSuccess(true)
    } catch (error: any) {
      console.error('Password reset request error:', error)
      
      // Gestion spécifique de l'error ERR_BLOCKED_BY_CLIENT
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        // Vérifier si c'est un blocage par extension
        const isBlocked = error.config?.url?.includes('localhost') || 
                         (typeof window !== 'undefined' && 
                          window.navigator.userAgent.includes('Chrome') || 
                          window.navigator.userAgent.includes('Firefox'))
        
        if (isBlocked) {
          setError(
            '⚠️ La requête a été bloquée par une extension de navigateur (bloqueur de publicité, privacy, etc.).\n\n' +
            'Solutions :\n' +
            '1. Désactivez temporairement vos extensions (AdBlock, uBlock, Privacy Badger, etc.)\n' +
            '2. Ou utilisez le mode navigation privée\n' +
            '3. Ou ajoutez localhost dans les exceptions de vos extensions'
          )
        } else {
          setError(
            'Error de connexion au serveur. Vérifiez que le backend est démarré et accessible sur http://localhost:9495'
          )
        }
      } else {
        setError(
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Error lors de la demande de réinitialisation. Vérifiez votre email et réessayez.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Email envoyé !</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un email avec un lien pour réinitialiser votre mot de passe.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Vérifiez votre boîte de réception (et les spams). Le lien est valable pendant 24 heures.
            </p>
            <Link
              href="/login"
              className="inline-block w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Mot de passe oublié ?
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg whitespace-pre-line">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="votre@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}

