'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PageLoader from '@/components/shared/PageLoader'

/**
 * Page de redirection vers l'éditeur mode projet
 * Cette page redirige automatiquement vers /admin/pages-public/edit/home
 * qui est l'éditeur principal avec toutes les options pour éditer le site public
 */
export default function HomepageEditorRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Récupérer le projectId s'il est présent dans les query params
    const projectId = searchParams?.get('projectId')
    
    // Construire l'URL de redirection
    const redirectUrl = projectId 
      ? `/admin/pages-public/edit/home?projectId=${projectId}`
      : '/admin/pages-public/edit/home'
    
    // Rediriger vers l'éditeur mode projet
    router.replace(redirectUrl)
  }, [router, searchParams])
  
  // Afficher un loader pendant la redirection
  return <PageLoader />
}
