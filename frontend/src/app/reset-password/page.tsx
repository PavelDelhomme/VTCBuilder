'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/lib/api'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams?.get('token')
    const emailParam = searchParams?.get('email')
    const userIdParam = searchParams?.get('userId')

    if (tokenParam) {
      setToken(tokenParam)
      
      if (emailParam) {
        // Cas normal : email directement dans l'URL
        setEmail(emailParam)
        verifyToken(tokenParam, emailParam, null)
      } else if (userIdParam) {
        // Cas test : userId dans l'URL, on vérifie le token et récupère l'email
        verifyToken(tokenParam, null, userIdParam)
      } else {
        // Pas d'email ni userId, on essaie de vérifier le token seul (le backend peut le gérer)
        verifyToken(tokenParam, null, null)
      }
    } else {
      setVerifying(false)
      setError('Token manquant dans l\'URL')
    }
  }, [searchParams])

  const verifyToken = async (tokenValue: string, emailValue: string | null, userIdValue: string | null) => {
    try {
      const payload: any = {
        token: tokenValue,
      }
      
      if (emailValue) {
        payload.email = emailValue
      } else if (userIdValue) {
        payload.userId = userIdValue
      }
      // Si ni email ni userId, on envoie juste le token (le backend peut le gérer)

      const response = await api.post('/auth/verify-reset-token/', payload, {
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      setTokenValid(response.data.valid)
      
      // Si l'email n'était pas fourni mais que le backend le retourne, on le met à jour
      if (response.data.email && !emailValue) {
        setEmail(response.data.email)
      }
      
      if (!response.data.valid) {
        setError(response.data.error || 'Le lien de réinitialisation est invalide ou a expiré')
      }
    } catch (error: any) {
      console.error('Error verifying token:', error)
      setError(error.response?.data?.error || 'Error lors de la vérification du token')
      setTokenValid(false)
    } finally {
      setVerifying(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setLoading(true)

    try {
      const payload: any = {
        token: token,
        password: password,
      }
      
      // Envoyer email si disponible, sinon juste le token (le backend peut le gérer)
      if (email) {
        payload.email = email
      }

      await api.post('/auth/reset-password/', payload, {
        headers: {
          'Content-Type': 'application/json',
        }
      })

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error: any) {
      console.error('Error resetting password:', error)
      setError(error.response?.data?.error || error.response?.data?.message || 'Error lors de la réinitialisation')
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Vérification du lien...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Mot de passe réinitialisé !</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Votre mot de passe a été modifié avec succès.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Redirection vers la page de connexion...</p>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Lien invalide</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Ce lien de réinitialisation est invalide ou a expiré.'}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Réinitialiser votre mot de passe</h1>
          <p className="text-gray-600 dark:text-gray-400">Entrez votre nouveau mot de passe pour {email}</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nouveau mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Minimum 8 caractères"
              minLength={8}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirmez votre mot de passe"
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}

