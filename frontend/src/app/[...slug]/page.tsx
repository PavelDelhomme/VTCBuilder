'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { isTenantSubdomain, getTenantSlug } from '@/lib/tenant-utils'
import pageService, { Page } from '@/services/page.service'
import projectService from '@/services/project.service'
import ProjectUnavailablePage from '@/components/shared/ProjectUnavailablePage'

export default function TenantPublicPage() {
  const params = useParams()
  const slug = params?.slug as string[] || []
  const pagePath = slug.join('/') || 'home'
  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [isTenant, setIsTenant] = useState(false)
  const [projectStatus, setProjectStatus] = useState<'active' | 'inactive' | 'archived' | null>(null)
  const [projectName, setProjectName] = useState<string | null>(null)

  useEffect(() => {
    // Check if we're on a tenant subdomain
    if (isTenantSubdomain()) {
      setIsTenant(true)
      checkProjectStatus()
    } else {
      setLoading(false)
    }
  }, [pagePath])

  const checkProjectStatus = async () => {
    try {
      setLoading(true)
      const tenantSlug = getTenantSlug()
      if (!tenantSlug) {
        setLoading(false)
        return
      }

      // Vérifier le statut du projet tenant
      const project = await projectService.getProjectByTenantSlug(tenantSlug)
      if (project) {
        setProjectStatus(project.status)
        setProjectName(project.name)
        
        // Si le projet est actif, charger la page
        if (project.status === 'active') {
          await loadPage()
        } else {
          setPage(null)
        }
      } else {
        // Projet non trouvé, essayer de charger la page quand même
        await loadPage()
      }
    } catch (error) {
      console.error('Erreur vérification statut projet:', error)
      // En cas d'erreur, essayer de charger la page quand même
      await loadPage()
    } finally {
      setLoading(false)
    }
  }

  const loadPage = async () => {
    try {
      // Load all pages and find the one matching the path
      const pages = await pageService.getAll({ status: 'published' })
      const foundPage = pages.find((p: Page) => {
        // Match home page
        if (pagePath === 'home' || pagePath === '') {
          return p.slug === 'home' || p.is_homepage
        }
        // Match by slug
        return p.slug === pagePath
      })
      setPage(foundPage || null)
    } catch (error) {
      console.error('Erreur chargement page:', error)
      setPage(null)
    }
  }

  // If not on tenant subdomain, redirect or show 404
  if (!isTenant && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Page non trouvée</h1>
          <p className="text-gray-600 dark:text-gray-400">Cette page n'existe pas.</p>
        </div>
      </div>
    )
  }

  // Si le projet est désactivé, afficher la page d'erreur stylisée
  if (projectStatus && projectStatus !== 'active' && !loading) {
    return (
      <ProjectUnavailablePage 
        projectName={projectName || 'ce projet'}
        reason={projectStatus === 'archived' 
          ? 'Le projet a été archivé et n\'est plus accessible'
          : 'Le projet est actuellement hors ligne pour maintenance'}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Page non trouvée</h1>
          <p className="text-gray-600 dark:text-gray-400">Cette page n'existe pas sur ce site.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800">
      {/* Simple header for tenant public site */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ma Société VTC</h1>
            <nav className="flex items-center space-x-6">
              <a href="/" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-gray-100">Accueil</a>
              <a href="/book" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-gray-100">Réserver</a>
              <a href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-gray-100">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">{page.title}</h1>
          {page.content && (
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          )}
        </article>
      </main>

      {/* Simple footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; {new Date().getFullYear()} Ma Société VTC. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}

