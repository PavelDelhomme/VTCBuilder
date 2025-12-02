'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import userService from '@/services/user.service'
import authService from '@/services/auth.service'
import toast from 'react-hot-toast'

export default function ImpersonationBanner() {
  const router = useRouter()
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [targetUser, setTargetUser] = useState<any>(null)
  const [originalAdmin, setOriginalAdmin] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkImpersonationStatus()
  }, [])

  const checkImpersonationStatus = async () => {
    try {
      const status = await userService.getImpersonationStatus()
      setIsImpersonating(status.is_impersonating || status.impersonating || false)
      if (status.is_impersonating || status.impersonating) {
        setTargetUser(status.target_user)
        setOriginalAdmin(status.original_admin || status.impersonated_by ? { email: status.impersonated_by } : null)
      }
    } catch (error: any) {
      // Ignore 404, network errors, and blocked errors (endpoint might not be available or user not in impersonation mode)
      // This is normal if the endpoint doesn't exist or user is not impersonating
      const isExpectedError = error.response?.status === 404 || 
                             error.code === 'ERR_NETWORK' || 
                             error.code === 'ERR_BLOCKED_BY_CLIENT' ||
                             error.message?.includes('ERR_BLOCKED_BY_CLIENT') ||
                             error.message?.includes('blocked by client')
      if (!isExpectedError) {
        console.error('Erreur vérification impersonnification:', error)
      }
      // Set not impersonating on any error
      setIsImpersonating(false)
    } finally {
      setLoading(false)
    }
  }

  const handleStopImpersonating = async () => {
    if (!confirm('Arrêter l\'impersonnification et revenir à votre compte admin ?')) {
      return
    }

    try {
      const result = await userService.stopImpersonating()
      
      // Update tokens in localStorage
      if (result.tokens?.access) {
        localStorage.setItem('token', result.tokens.access)
        localStorage.setItem('refresh_token', result.tokens.refresh)
        localStorage.setItem('user', JSON.stringify(result.user))
      }
      
      toast.success(result.message || 'Retour à votre compte admin')
      setIsImpersonating(false)
      setTargetUser(null)
      setOriginalAdmin(null)
      
      // Reload page to refresh user context
      router.refresh()
      window.location.reload()
    } catch (error: any) {
      console.error('Erreur arrêt impersonnification:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de l\'arrêt de l\'impersonnification')
    }
  }

  if (loading || !isImpersonating) {
    return null
  }

  return (
    <div className="bg-yellow-500 text-white px-4 py-3 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">👤</span>
          <div>
            <span className="font-semibold">Mode Impersonnification actif</span>
            <span className="ml-2 text-sm opacity-90">
              Vous êtes connecté en tant que <strong>{targetUser?.email}</strong>
              {originalAdmin && (
                <span className="ml-2">
                  (Admin: {originalAdmin.email})
                </span>
              )}
            </span>
          </div>
        </div>
        <button
          onClick={handleStopImpersonating}
          className="bg-white dark:bg-gray-800 text-yellow-600 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-50 transition-colors text-sm"
        >
          Arrêter l'impersonnification
        </button>
      </div>
    </div>
  )
}

