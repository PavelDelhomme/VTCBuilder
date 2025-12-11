'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import authService from '@/services/auth.service'
import toast from 'react-hot-toast'

const reconnectSchema = z.object({
  password: z.string().min(1, 'Mot de passe requis'),
})

type ReconnectForm = z.infer<typeof reconnectSchema>

interface ReconnectModalProps {
  isOpen: boolean
  onClose: () => void
  onReconnect: () => void
  currentPath?: string
}

export default function ReconnectModal({ isOpen, onClose, onReconnect, currentPath }: ReconnectModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [userEmail, setUserEmail] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReconnectForm>({
    resolver: zodResolver(reconnectSchema),
  })

  // Récupérer l'email de l'utilisateur précédemment connecté
  useEffect(() => {
    if (isOpen) {
      const storedUser = authService.getStoredUser()
      if (storedUser?.email) {
        setUserEmail(storedUser.email)
        reset({ password: '' })
      } else {
        // Si pas d'utilisateur stocké, sauvegarder l'URL et rediriger vers login
        if (typeof window !== 'undefined' && currentPath) {
          authService.saveRedirectUrl()
        }
        onClose()
        router.push('/login')
      }
    }
  }, [isOpen, reset, onClose, router])

  const onSubmit = async (data: ReconnectForm) => {
    setLoading(true)
    try {
      const success = await authService.quickReconnect(data.password)
      
      if (success && authService.isAuthenticated()) {
        toast.success('Reconnexion réussie !')
        onReconnect()
        onClose()
        
        // Ne PAS rafraîchir la page - les requêtes seront relancées automatiquement
        // L'état de l'éditeur sera préservé
      } else {
        toast.error('Erreur lors de la reconnexion')
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || 'Erreur lors de la reconnexion'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Session expirée
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Votre session a expiré. Entrez votre mot de passe pour vous reconnecter rapidement.
            <br />
            <span className="text-xs text-blue-600 dark:text-blue-400 mt-1 block">
              ✨ Vos modifications sont sauvegardées automatiquement
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {userEmail && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reconnexion pour :</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{userEmail}</p>
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                placeholder="Entrez votre mot de passe"
                autoFocus
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se reconnecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

