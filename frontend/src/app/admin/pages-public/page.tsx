'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import projectService from '@/services/project.service'
import PageLoader from '@/components/shared/PageLoader'

/**
 * Redirection vers la page du projet système
 * Cette interface n'est plus utilisée, on redirige vers /admin/projects/[slug]
 */
export default function PublicPagesManagementRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    const redirectToSystemProject = async () => {
      try {
        const systemProject = await projectService.getSystemProject()
        if (systemProject) {
          router.replace(`/admin/projects/${systemProject.slug}`)
        } else {
          // Si aucun projet système n'existe, rediriger vers la liste des projets
          router.replace('/admin/projects')
        }
      } catch (error) {
        console.error('Error redirection:', error)
        router.replace('/admin/projects')
      }
    }
    
    redirectToSystemProject()
  }, [router])
  
  return <PageLoader text="Redirection vers le projet système..." />
}
