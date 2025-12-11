'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import authService from '@/services/auth.service'
import { isTenantSubdomain } from '@/lib/tenant-utils'
import PageLoader from '@/components/shared/PageLoader'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      try {
        const currentUser = authService.getStoredUser()
        
        // Si pas d'utilisateur connecté, sauvegarder l'URL et rediriger vers login
        if (!currentUser) {
          authService.saveRedirectUrl()
          router.push('/login')
          return
        }
        
        // Si super admin, rediriger vers admin dashboard
        if (authService.isSuperAdmin()) {
          router.push('/admin/dashboard')
          return
        }
        
        // Vérifier que l'utilisateur a un tenant
        if (!currentUser.tenant_id) {
          console.error('Utilisateur sans tenant associé')
          authService.saveRedirectUrl()
          router.push('/login')
          return
        }
        
        // Autoriser l'accès
        setIsAuthorized(true)
      } catch (error) {
        console.error('Erreur vérification auth:', error)
        authService.saveRedirectUrl()
        router.push('/login')
      } finally {
        setIsChecking(false)
      }
    }
    
    checkAuth()
  }, [router, pathname]) // Ajouter pathname pour re-vérifier lors de la navigation

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <PageLoader text="Vérification de l'authentification..." />
      </div>
    )
  }

  if (!isAuthorized) {
    return null // La redirection est en cours
  }

  return <>{children}</>
}

