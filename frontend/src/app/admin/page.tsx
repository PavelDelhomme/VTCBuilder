'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import { isTenantSubdomain } from '@/lib/tenant-utils'

/**
 * Route /admin qui redirige selon le contexte :
 * - Sur localhost (super admin) → /admin/dashboard (interface super admin)
 * - Sur un sous-domaine tenant → /admin/dashboard (interface WordPress-like du tenant)
 */
export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    const checkAndRedirect = async () => {
      // Vérifier si on est sur un sous-domaine tenant
      if (isTenantSubdomain()) {
        // Sur un tenant : rediriger vers le dashboard WordPress-like du tenant
        // On utilise /dashboard pour les tenants (interface WordPress-like)
        router.replace('/dashboard')
        return
      }

      // Sur localhost (plateforme VTCBuilder)
      // Vérifier si l'utilisateur est connecté et est super admin
      const user = authService.getStoredUser()
      if (user && authService.isSuperAdmin()) {
        // Super admin → interface de gestion des tenants
        router.replace('/admin/dashboard')
      } else if (user) {
        // Utilisateur connecté mais pas super admin → rediriger vers le dashboard tenant
        router.replace('/dashboard')
      } else {
        // Pas connecté → sauvegarder l'URL et rediriger vers le login
        authService.saveRedirectUrl()
        router.replace('/login')
      }
    }

    checkAndRedirect()
  }, [router])

  // Afficher un loader pendant la redirection
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
      </div>
    </div>
  )
}

