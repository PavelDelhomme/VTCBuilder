'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/AdminLayout'
import projectService, { Project, ProjectPage } from '@/services/project.service'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import PageLoader from '@/components/PageLoader'

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = parseInt(params?.id as string)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [publicPages, setPublicPages] = useState<any[]>([])
  const [tenantPages, setTenantPages] = useState<any[]>([])

  useEffect(() => {
    if (!authService.isSuperAdmin()) {
      router.push('/dashboard')
      return
    }
    if (projectId) {
      loadProject()
      loadAvailablePages()
    }
  }, [router, projectId])

  const loadProject = async () => {
    try {
      setLoading(true)
      const data = await projectService.getById(projectId)
      setProject(data)
    } catch (error: any) {
      console.error('Erreur chargement projet:', error)
      toast.error('Erreur lors du chargement du projet')
      router.push('/admin/projects')
    } finally {
      setLoading(false)
    }
  }

  const loadAvailablePages = async () => {
    try {
      // Load public pages
      const settingsResponse = await api.get('/system-settings/')
      const settings = settingsResponse.data
      const pages: any[] = []
      
      // Homepage
      if (settings.public_homepage_blocks !== undefined) {
        pages.push({
          slug: 'home',
          title: 'Page d\'accueil',
          type: 'public',
        })
      }
      
      // Other public pages
      const publicPagesData = settings.public_pages || {}
      Object.entries(publicPagesData).forEach(([slug, pageData]: [string, any]) => {
        pages.push({
          slug,
          title: pageData.title || slug,
          type: 'public',
        })
      })
      
      setPublicPages(pages)
      
      // TODO: Load tenant pages if project has a tenant
      if (project?.tenant_id) {
        // Load tenant pages
        // const tenantPagesData = await pageService.getAll({ tenant_id: project.tenant_id })
        // setTenantPages(tenantPagesData)
      }
    } catch (error: any) {
      console.error('Erreur chargement pages disponibles:', error)
    }
  }

  const handleAddPage = async (pageSlug: string, pageType: 'public' | 'tenant') => {
    try {
      await projectService.addPage(projectId, pageSlug, pageType)
      toast.success('Page ajoutée au projet !')
      loadProject()
    } catch (error: any) {
      console.error('Erreur ajout page:', error)
      toast.error('Erreur lors de l\'ajout de la page')
    }
  }

  const handleRemovePage = async (pageId: number) => {
    try {
      await projectService.removePage(projectId, pageId)
      toast.success('Page retirée du projet !')
      loadProject()
    } catch (error: any) {
      console.error('Erreur retrait page:', error)
      toast.error('Erreur lors du retrait de la page')
    }
  }

  if (loading || !project) {
    return (
      <AdminLayout title="Projet" subtitle="Chargement...">
        <PageLoader text="Chargement du projet..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title={project.name}
      subtitle={`Gérer les pages du projet ${project.slug}`}
      headerActions={
        <button
          onClick={() => router.push('/admin/projects')}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          ← Retour
        </button>
      }
    >
      <div className="space-y-6">
        {/* Project Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Informations du Projet</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom
              </label>
              <input
                type="text"
                value={project.name}
                onChange={(e) => {
                  setProject({ ...project, name: e.target.value })
                }}
                onBlur={async () => {
                  try {
                    await projectService.update(project.id, { name: project.name })
                    toast.success('Projet mis à jour !')
                  } catch (error) {
                    toast.error('Erreur lors de la mise à jour')
                    loadProject()
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Statut
              </label>
              <select
                value={project.status}
                onChange={async (e) => {
                  try {
                    await projectService.update(project.id, { status: e.target.value as any })
                    setProject({ ...project, status: e.target.value as any })
                    toast.success('Statut mis à jour !')
                  } catch (error) {
                    toast.error('Erreur lors de la mise à jour')
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pages in Project */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Pages du Projet</h2>
            <button
              onClick={async () => {
                try {
                  // Récupérer les pages existantes pour trouver le prochain numéro
                  const currentSettings = await api.get('/system-settings/')
                  const publicPages = currentSettings.data.public_pages || {}
                  
                  // Trouver le prochain numéro disponible
                  let pageNumber = 1
                  let newSlug = `nouvelle-page-${pageNumber}`
                  while (publicPages[newSlug]) {
                    pageNumber++
                    newSlug = `nouvelle-page-${pageNumber}`
                  }
                  
                  // Créer la nouvelle page avec un nom automatique
                  const newPageTitle = `Nouvelle page ${pageNumber}`
                  publicPages[newSlug] = {
                    title: newPageTitle,
                    blocks: [],
                    meta_title: '',
                    meta_description: '',
                    is_active: true,
                    order: Object.keys(publicPages).length + 1,
                  }
                  
                  // Sauvegarder la nouvelle page
                  await api.patch('/system-settings/', { public_pages: publicPages })
                  
                  // Ajouter automatiquement la page au projet
                  await projectService.addPage(projectId, newSlug, 'public')
                  
                  toast.success(`Page "${newPageTitle}" créée et ajoutée au projet !`)
                  
                  // Recharger le projet pour afficher la nouvelle page
                  loadProject()
                  
                  // Naviguer vers l'éditeur de la nouvelle page
                  router.push(`/admin/pages-public/${newSlug}/edit`)
                } catch (error: any) {
                  console.error('Erreur création nouvelle page:', error)
                  toast.error(error.response?.data?.error || 'Erreur lors de la création de la nouvelle page')
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer une nouvelle page
            </button>
          </div>
          
          {project.pages && project.pages.length > 0 ? (
            <div className="space-y-2">
              {project.pages.map((page: ProjectPage) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{page.page_slug}</span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      ({page.page_type === 'public' ? 'Publique' : 'Tenant'})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (page.page_type === 'public') {
                          router.push(`/admin/pages-public/${page.page_slug}/edit`)
                        } else {
                          // TODO: Navigate to tenant page editor
                        }
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Éditer
                    </button>
                    <button
                      onClick={() => handleRemovePage(page.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              Aucune page dans ce projet
            </p>
          )}
        </div>

        {/* Available Pages to Add */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Pages Disponibles</h2>
          
          {publicPages.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pages Publiques</h3>
              <div className="space-y-2">
                {publicPages.map((page) => {
                  const isInProject = project.pages?.some((p: ProjectPage) => p.page_slug === page.slug && p.page_type === 'public')
                  return (
                    <div
                      key={page.slug}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                    >
                      <span className="text-gray-900 dark:text-gray-100">{page.title}</span>
                      {isInProject ? (
                        <span className="text-sm text-gray-500 dark:text-gray-400">Déjà dans le projet</span>
                      ) : (
                        <button
                          onClick={() => handleAddPage(page.slug, 'public')}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Ajouter
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

