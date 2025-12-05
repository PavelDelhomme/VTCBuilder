'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/admin/AdminLayout'
import projectService, { Project, ProjectPage } from '@/services/project.service'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import PageLoader from '@/components/shared/PageLoader'
import BlockPreview from '@/components/editor/BlockPreview'
import blocksService from '@/services/blocks.service'
import { useNavigationLoading } from '@/hooks/useNavigationLoading'
import ToggleSwitch from '@/components/shared/ToggleSwitch'

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = parseInt(params?.id as string)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const { isNavigating, navigate } = useNavigationLoading()
  const [publicPages, setPublicPages] = useState<any[]>([])
  const [tenantPages, setTenantPages] = useState<any[]>([])
  const [previewPage, setPreviewPage] = useState<{ slug: string; blocks: any[]; title: string } | null>(null)
  const [blockTypes, setBlockTypes] = useState<any[]>([])
  const [loadingPreview, setLoadingPreview] = useState(false)

  useEffect(() => {
    if (!authService.isSuperAdmin()) {
      router.push('/dashboard')
      return
    }
    if (projectId) {
      loadProject()
      loadAvailablePages()
      loadBlockTypes()
      
      // Nettoyage automatique pour le projet système (ID 1)
      // Garde uniquement 'home' et 'test'
      if (projectId === 1) {
        const cleanupProject1 = async () => {
          try {
            // Attendre que le projet soit chargé
            const project = await projectService.getById(projectId)
            if (project.pages && project.pages.length > 0) {
              const pagesToRemove = project.pages.filter(
                (p: ProjectPage) => p.page_slug !== 'home' && p.page_slug !== 'test'
              )
              
              if (pagesToRemove.length > 0) {
                console.log(`🧹 Nettoyage automatique du projet 1: ${pagesToRemove.length} page(s) à retirer`)
                for (const page of pagesToRemove) {
                  await projectService.removePage(projectId, page.id)
                  console.log(`   ✅ Page "${page.page_slug}" retirée`)
                }
                toast.success(`${pagesToRemove.length} page(s) retirée(s) automatiquement`)
                // Recharger le projet après nettoyage
                loadProject()
              }
            }
          } catch (error) {
            console.error('Erreur nettoyage automatique:', error)
          }
        }
        
        // Attendre un peu que le projet soit chargé
        setTimeout(() => {
          cleanupProject1()
        }, 1500)
      }
    }
  }, [router, projectId])

  const loadBlockTypes = async () => {
    try {
      const types = await blocksService.getBlockTypes()
      setBlockTypes(Array.isArray(types) ? types : [])
    } catch (error) {
      console.error('Erreur chargement types de blocs:', error)
    }
  }

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
      const allPages: any[] = []
      
      // Homepage
      if (settings.public_homepage_blocks !== undefined) {
        allPages.push({
          slug: 'home',
          title: 'Page d\'accueil',
          type: 'public',
          is_active: true, // Homepage is always active
        })
      }
      
      // Other public pages
      const publicPagesData = settings.public_pages || {}
      Object.entries(publicPagesData).forEach(([slug, pageData]: [string, any]) => {
        allPages.push({
          slug,
          title: pageData.title || slug,
          type: 'public',
          is_active: pageData.is_active !== false, // Default to true if not specified
        })
      })
      
      setPublicPages(allPages)
      
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

  const handleToggleActive = async (page: ProjectPage) => {
    try {
      await projectService.updatePage(projectId, page.id, { is_active: !page.is_active })
      toast.success(`Page ${!page.is_active ? 'activée' : 'désactivée'} !`)
      loadProject()
    } catch (error: any) {
      console.error('Erreur mise à jour page:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handlePreview = async (page: ProjectPage) => {
    try {
      setLoadingPreview(true)
      
      // Charger les données de la page
      if (page.page_type === 'public') {
        const settingsResponse = await api.get('/system-settings/')
        const settings = settingsResponse.data
        
        let pageData: any = null
        const pageTitle = page.page_slug
        
        // Vérifier si c'est la homepage
        if (page.page_slug === 'home') {
          const homepageBlocks = settings.public_homepage_blocks
          pageData = {
            title: 'Page d\'accueil',
            blocks: Array.isArray(homepageBlocks) ? homepageBlocks : [],
          }
        } else {
          // Chercher dans public_pages
          const publicPages = settings.public_pages || {}
          if (publicPages[page.page_slug]) {
            const pageBlocks = publicPages[page.page_slug].blocks
            pageData = {
              title: publicPages[page.page_slug].title || page.page_slug,
              blocks: Array.isArray(pageBlocks) ? pageBlocks : [],
            }
          }
        }
        
        if (pageData) {
          setPreviewPage({
            slug: page.page_slug,
            blocks: pageData.blocks,
            title: pageData.title,
          })
        } else {
          toast.error('Page non trouvée')
        }
      } else {
        // TODO: Load tenant page
        toast.error('Prévisualisation des pages tenant non encore implémentée')
      }
    } catch (error: any) {
      console.error('Erreur chargement prévisualisation:', error)
      toast.error('Erreur lors du chargement de la prévisualisation')
    } finally {
      setLoadingPreview(false)
    }
  }

  if (loading || isNavigating || !project) {
    return (
      <AdminLayout title="Projet" subtitle="Chargement...">
        <PageLoader text={isNavigating ? "Chargement..." : "Chargement du projet..."} />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title={project.name}
      subtitle={`Gérer les pages du projet ${project.slug}`}
      headerActions={
        <button
          onClick={() => navigate('/admin/projects')}
          disabled={isNavigating}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isNavigating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 dark:border-gray-300"></div>
              <span>Chargement...</span>
            </>
          ) : (
            <>← Retour</>
          )}
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
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Pages du Projet</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Pages ajoutées à ce projet. Activez/désactivez pour les afficher ou non sur le site.
              </p>
            </div>
            {project.pages && project.pages.length > 2 && (
              <button
                onClick={async () => {
                  if (confirm(`Voulez-vous retirer toutes les pages sauf "home" et "test" ?\n\n${project.pages.length - 2} page(s) seront retirées.`)) {
                    try {
                      const pagesToRemove = project.pages.filter(
                        (p: ProjectPage) => p.page_slug !== 'home' && p.page_slug !== 'test'
                      )
                      
                      for (const page of pagesToRemove) {
                        await projectService.removePage(projectId, page.id)
                      }
                      
                      toast.success(`${pagesToRemove.length} page(s) retirée(s) avec succès !`)
                      loadProject()
                    } catch (error: any) {
                      console.error('Erreur nettoyage:', error)
                      toast.error('Erreur lors du nettoyage des pages')
                    }
                  }
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 text-sm"
                title="Retirer toutes les pages sauf home et test"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Nettoyer (garder home + test)
              </button>
            )}
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
                  navigate(`/admin/pages-public/${newSlug}/edit`)
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
              + Page
            </button>
          </div>
          
          {project.pages && project.pages.length > 0 ? (
            <div className="space-y-2">
              {project.pages.map((page: ProjectPage) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div onClick={(e) => e.stopPropagation()}>
                      <ToggleSwitch
                        checked={page.is_active !== false}
                        onChange={() => handleToggleActive(page)}
                        size="md"
                        color="green"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 dark:text-gray-100 break-words">{page.page_slug}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          page.is_active !== false
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {page.is_active !== false ? 'Visible' : 'Masquée'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {page.page_type === 'public' ? 'Publique' : 'Tenant'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handlePreview(page)}
                      className="px-3 py-1.5 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200 rounded hover:bg-purple-200 dark:hover:bg-purple-800 text-sm font-medium transition-colors flex items-center gap-1.5"
                      title="Prévisualiser"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="hidden sm:inline">Voir</span>
                    </button>
                    <button
                      onClick={() => {
                        if (page.page_type === 'public') {
                          navigate(`/admin/pages-public/${page.page_slug}/edit`)
                        } else {
                          // TODO: Navigate to tenant page editor
                        }
                      }}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition-colors flex items-center gap-1.5"
                      title="Éditer"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="hidden sm:inline">Éditer</span>
                    </button>
                    <button
                      onClick={() => handleRemovePage(page.id)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium transition-colors flex items-center gap-1.5"
                      title="Retirer"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="hidden sm:inline">Retirer</span>
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
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Pages Disponibles</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Ajoutez des pages à ce projet. <strong>Publié</strong> = accessible publiquement. <strong>Visible</strong> = affichée dans ce projet.
            </p>
          </div>
          
          {publicPages.length > 0 && (
            <div className="space-y-4">
              {/* Pages Publiques (publiées) - Sous-catégorie */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Pages Publiques (Publiées sur le site)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 ml-4">
                  Ces pages sont publiées et accessibles publiquement sur le site
                </p>
                <div className="space-y-2">
                  {publicPages
                    .filter((page) => page.is_active !== false)
                    .map((page) => {
                      const projectPage = project.pages?.find((p: ProjectPage) => p.page_slug === page.slug && p.page_type === 'public')
                      const isInProject = !!projectPage
                      return (
                        <div
                          key={page.slug}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="font-medium text-gray-900 dark:text-gray-100 break-words">{page.title}</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Publiée
                            </span>
                            {isInProject && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                projectPage.is_active !== false
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                              }`}>
                                {projectPage.is_active !== false ? 'Visible' : 'Masquée'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isInProject ? (
                              <>
                                <div onClick={(e) => e.stopPropagation()}>
                                  <ToggleSwitch
                                    checked={projectPage.is_active !== false}
                                    onChange={() => handleToggleActive(projectPage)}
                                    size="sm"
                                    color="blue"
                                    label="Visible"
                                  />
                                </div>
                                <button
                                  onClick={() => handleRemovePage(projectPage.id)}
                                  className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium transition-colors flex items-center gap-1.5"
                                  title="Retirer du projet"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  <span className="hidden sm:inline">Retirer</span>
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleAddPage(page.slug, 'public')}
                                className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition-colors flex items-center gap-1.5"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Ajouter</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  {publicPages.filter((page) => page.is_active !== false).length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                      Aucune page publique publiée
                    </p>
                  )}
                </div>
              </div>

              {/* Pages Disponibles (non publiées) */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  Pages Disponibles (Non publiées)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 ml-4">
                  Ces pages existent mais ne sont pas encore publiées publiquement
                </p>
                <div className="space-y-2">
                  {publicPages
                    .filter((page) => page.is_active === false)
                    .map((page) => {
                      const projectPage = project.pages?.find((p: ProjectPage) => p.page_slug === page.slug && p.page_type === 'public')
                      const isInProject = !!projectPage
                      return (
                        <div
                          key={page.slug}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="font-medium text-gray-900 dark:text-gray-100 break-words">{page.title}</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                              Non publiée
                            </span>
                            {isInProject && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                projectPage.is_active !== false
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                              }`}>
                                {projectPage.is_active !== false ? 'Visible' : 'Masquée'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isInProject ? (
                              <>
                                <div onClick={(e) => e.stopPropagation()}>
                                  <ToggleSwitch
                                    checked={projectPage.is_active !== false}
                                    onChange={() => handleToggleActive(projectPage)}
                                    size="sm"
                                    color="blue"
                                    label="Visible"
                                  />
                                </div>
                                <button
                                  onClick={() => handleRemovePage(projectPage.id)}
                                  className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium transition-colors flex items-center gap-1.5"
                                  title="Retirer du projet"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  <span className="hidden sm:inline">Retirer</span>
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleAddPage(page.slug, 'public')}
                                className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition-colors flex items-center gap-1.5"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Ajouter</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  {publicPages.filter((page) => page.is_active === false).length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                      Toutes les pages sont publiées
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {publicPages.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              Aucune page disponible
            </p>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Prévisualisation : {previewPage.title}
              </h2>
              <button
                onClick={() => setPreviewPage(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
              {loadingPreview ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Chargement de la prévisualisation...</span>
                  </div>
                </div>
              ) : previewPage.blocks && previewPage.blocks.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <BlockPreview blocks={previewPage.blocks} blockTypes={blockTypes} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Cette page ne contient pas encore de blocs</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Ajoutez des blocs en éditant la page</p>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  if (previewPage) {
                    const page = project?.pages?.find((p: ProjectPage) => p.page_slug === previewPage.slug)
                    if (page && page.page_type === 'public') {
                      navigate(`/admin/pages-public/${previewPage.slug}/edit`)
                    }
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Éditer la page
              </button>
              <button
                onClick={() => setPreviewPage(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

