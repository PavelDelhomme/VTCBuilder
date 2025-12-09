'use client'

import { useEffect, useState, useRef } from 'react'
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
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Ref pour éviter les exécutions multiples du nettoyage (désactivé - nettoyage automatique supprimé)
  // const cleanupExecutedRef = useRef(false)

  useEffect(() => {
    if (!authService.isSuperAdmin()) {
      router.push('/dashboard')
      return
    }
    if (projectId) {
      loadProject()
      loadAvailablePages()
      loadBlockTypes()
    }
  }, [projectId]) // Retirer 'router' des dépendances pour éviter les re-renders

  // Nettoyage automatique DÉSACTIVÉ
  // Le nettoyage automatique qui retirait toutes les pages sauf "home" et "test" 
  // du projet système a été désactivé pour permettre d'ajouter librement des pages
  // à tous les projets, y compris le projet système.
  // 
  // Si tu veux nettoyer manuellement, utilise le bouton "Nettoyer" dans l'interface.
  // 
  // useEffect(() => {
  //   if (!projectId || projectId !== 1 || cleanupExecutedRef.current || !project || loading) {
  //     return
  //   }
  //   // ... code de nettoyage désactivé
  // }, [projectId, project, loading])

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
      
      // Load projects where each page is linked (excluding current project)
      const pagesWithProjects = await Promise.all(
        allPages.map(async (page) => {
          try {
            const response = await api.get(`/projects/page-projects/${page.slug}/?page_type=public`)
            const otherProjects = response.data.projects.filter(
              (p: any) => p.id !== projectId
            )
            return {
              ...page,
              otherProjects: otherProjects,
            }
          } catch (error) {
            // Si l'endpoint n'existe pas encore ou erreur, retourner la page sans projets
            return {
              ...page,
              otherProjects: [],
            }
          }
        })
      )
      
      setPublicPages(pagesWithProjects)
      
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
      loadAvailablePages() // Recharger les pages disponibles
    } catch (error: any) {
      console.error('Erreur ajout page:', error)
      const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           'Erreur lors de l\'ajout de la page'
      
      // Afficher un message d'erreur plus détaillé
      if (error.response?.data?.existing_project_name) {
        toast.error(
          `${errorMessage}\n\nCette page est déjà dans le projet "${error.response.data.existing_project_name}" (ID: ${error.response.data.existing_project_id}).`,
          { duration: 6000 }
        )
      } else {
        toast.error(errorMessage)
      }
    }
  }

  const handleRemovePage = async (pageId: number) => {
    try {
      await projectService.removePage(projectId, pageId)
      toast.success('Page retirée du projet !')
      loadProject()
      loadAvailablePages() // Recharger les pages disponibles
    } catch (error: any) {
      console.error('Erreur retrait page:', error)
      toast.error('Erreur lors du retrait de la page')
    }
  }

  const handleDeletePage = async (pageSlug: string) => {
    if (!authService.isSuperAdmin()) {
      toast.error('Seuls les administrateurs peuvent supprimer des pages')
      return
    }
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement la page "${pageSlug}" ?\n\nCette action est irréversible et la page sera supprimée de tous les projets.`)) {
      return
    }
    
    try {
      const settingsResponse = await api.get('/system-settings/')
      const settings = settingsResponse.data
      const publicPages = settings.public_pages || {}
      
      // Supprimer la page
      delete publicPages[pageSlug]
      
      // Sauvegarder
      await api.patch('/system-settings/', { public_pages: publicPages })
      
      toast.success(`Page "${pageSlug}" supprimée !`)
      loadAvailablePages()
      loadProject()
    } catch (error: any) {
      console.error('Erreur suppression page:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression de la page')
    }
  }

  const handleDuplicatePage = async (pageSlug: string) => {
    try {
      const settingsResponse = await api.get('/system-settings/')
      const settings = settingsResponse.data
      const publicPages = settings.public_pages || {}
      
      if (!publicPages[pageSlug]) {
        toast.error('Page introuvable')
        return
      }
      
      // Trouver un nouveau slug disponible
      let newSlug = `${pageSlug}-copie`
      let counter = 1
      while (publicPages[newSlug]) {
        newSlug = `${pageSlug}-copie-${counter}`
        counter++
      }
      
      // Dupliquer la page
      const originalPage = publicPages[pageSlug]
      publicPages[newSlug] = {
        ...originalPage,
        title: `${originalPage.title} (Copie)`,
      }
      
      // Sauvegarder
      await api.patch('/system-settings/', { public_pages: publicPages })
      
      toast.success(`Page dupliquée : "${newSlug}"`)
      loadAvailablePages()
      
      // Ajouter automatiquement la page dupliquée au projet actuel
      await projectService.addPage(projectId, newSlug, 'public')
      toast.success('Page dupliquée ajoutée au projet !')
      loadProject()
    } catch (error: any) {
      console.error('Erreur duplication page:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la duplication de la page')
    }
  }

  const handleToggleActive = async (page: ProjectPage) => {
    try {
      await projectService.updatePage(projectId, page.id, { is_active: !page.is_active })
      toast.success(`Page ${!page.is_active ? 'affichée' : 'masquée'} dans le projet`)
      loadProject()
    } catch (error: any) {
      console.error('Erreur mise à jour page:', error)
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleTogglePublished = async (pageSlug: string, currentStatus: boolean) => {
    try {
      const settingsResponse = await api.get('/system-settings/')
      const settings = settingsResponse.data
      const publicPages = settings.public_pages || {}
      
      if (pageSlug === 'home') {
        toast.info('La page d\'accueil est toujours publiée')
        return
      }
      
      if (publicPages[pageSlug]) {
        publicPages[pageSlug].is_active = !currentStatus
        await api.patch('/system-settings/', { public_pages: publicPages })
        toast.success(`Page ${!currentStatus ? 'publiée' : 'dépubliée'}`)
        loadAvailablePages()
        loadProject()
      }
    } catch (error: any) {
      console.error('Erreur toggle published:', error)
      toast.error('Erreur lors de la modification')
    }
  }

  // Fonction générique pour afficher l'aperçu d'une page par son slug
  const handlePreviewPage = async (pageSlug: string, pageType: 'public' | 'tenant' = 'public') => {
    try {
      setLoadingPreview(true)
      
      // Charger les données de la page
      if (pageType === 'public') {
        const settingsResponse = await api.get('/system-settings/')
        const settings = settingsResponse.data
        
        let pageData: any = null
        
        // Vérifier si c'est la homepage
        if (pageSlug === 'home') {
          const homepageBlocks = settings.public_homepage_blocks
          pageData = {
            title: 'Page d\'accueil',
            blocks: Array.isArray(homepageBlocks) ? homepageBlocks : [],
          }
        } else {
          // Chercher dans public_pages
          const publicPages = settings.public_pages || {}
          if (publicPages[pageSlug]) {
            const pageBlocks = publicPages[pageSlug].blocks
            pageData = {
              title: publicPages[pageSlug].title || pageSlug,
              blocks: Array.isArray(pageBlocks) ? pageBlocks : [],
            }
          }
        }
        
        if (pageData) {
          setPreviewPage({
            slug: pageSlug,
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

  const handleEditProject = () => {
    if (!project.pages || project.pages.length === 0) {
      toast.error('Ce projet n\'a pas encore de pages. Ajoutez d\'abord une page au projet.')
      return
    }
    
    // Trouver la première page active, sinon la première page
    const firstActivePage = project.pages.find((p: ProjectPage) => p.is_active) || project.pages[0]
    
    if (firstActivePage.page_type === 'public') {
      navigate(`/admin/pages-public/${firstActivePage.page_slug}/edit`)
    } else {
      toast.info('L\'édition des pages tenant n\'est pas encore disponible')
    }
  }

  return (
    <AdminLayout
      title={project.name}
      subtitle={`Gérer les pages du projet ${project.slug}`}
      headerActions={
        <button
          onClick={handleEditProject}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Éditer le projet
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
                Statut du Projet
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
                title={
                  project.status === 'active' 
                    ? 'Le projet est en ligne et accessible' 
                    : project.status === 'inactive'
                    ? 'Le projet est temporairement désactivé (non accessible)'
                    : 'Le projet est archivé (conservé mais non accessible)'
                }
              >
                <option value="active">🟢 En ligne - Site accessible</option>
                <option value="inactive">🟡 Hors ligne - Site non accessible</option>
                <option value="archived">🔴 Archivé - Projet conservé mais non accessible</option>
              </select>
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-700 dark:text-gray-300">💡 Explication :</strong>
                  <br />
                  <span className="text-green-700 dark:text-green-300">🟢 En ligne</span> = Le site est accessible et fonctionne normalement
                  <br />
                  <span className="text-yellow-700 dark:text-yellow-300">🟡 Hors ligne</span> = Le site est temporairement désactivé (maintenance, pause, etc.)
                  <br />
                  <span className="text-red-700 dark:text-red-300">🔴 Archivé</span> = Le projet est conservé mais plus accessible (ancien projet, terminé, etc.)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gestion des Pages - Deux Sections */}
        <div className="space-y-6">
          {/* Section 1: Pages liées au projet */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Pages liées au projet
                  {project.pages && project.pages.length > 0 && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                      {project.pages.length}
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Pages actuellement liées à ce projet et affichées sur le site
                </p>
              </div>
              <div className="flex items-center gap-2">
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
                    Nettoyer
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
                      
                      toast.success(`Page "${newPageTitle}" créée ! Vous pouvez maintenant l'ajouter au projet si nécessaire.`)
                      
                      // Recharger les pages disponibles
                      loadAvailablePages()
                      
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
                  Page
                </button>
              </div>
            </div>
            
            {/* Liste des pages liées */}
            {project.pages && project.pages.length > 0 ? (
              <div className="space-y-2">
                {project.pages.map((projectPage: ProjectPage) => {
                  const page = publicPages.find((p: any) => p.slug === projectPage.page_slug)
                  if (!page) return null
                  
                  const isPublished = page.is_active !== false
                  
                  // Fonction pour naviguer vers l'édition de la page
                  const handlePageClick = () => {
                    if (page.slug === 'home') {
                      navigate('/admin/homepage')
                    } else {
                      navigate(`/admin/pages-public/${page.slug}/edit`)
                    }
                  }
                  
                  return (
                    <div
                      key={projectPage.id}
                      onClick={handlePageClick}
                      className="flex items-center justify-between p-3 sm:p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer transition-all group"
                      title="Double-cliquer pour éditer"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Toggle Publié */}
                        <div onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-1">
                          <ToggleSwitch
                            checked={isPublished}
                            onChange={() => handleTogglePublished(page.slug, isPublished)}
                            size="sm"
                            color="green"
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Publié</span>
                        </div>
                        
                        {/* Toggle Visible */}
                        <div onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-1">
                          <ToggleSwitch
                            checked={projectPage.is_active !== false}
                            onChange={() => handleToggleActive(projectPage)}
                            size="sm"
                            color="blue"
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Visible</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-gray-900 dark:text-gray-100 break-words">{page.title}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">({page.slug})</span>
                            
                            {/* Indicateur autres projets */}
                            {page.otherProjects && page.otherProjects.length > 0 && (
                              <div className="group relative">
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full text-xs font-medium cursor-help">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  <span>{page.otherProjects.length} autre{page.otherProjects.length > 1 ? 's' : ''}</span>
                                </div>
                                {/* Tooltip avec liste des projets */}
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-64">
                                  <div className="bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-lg p-3 border border-gray-700">
                                    <div className="font-semibold mb-2">Aussi dans :</div>
                                    <ul className="space-y-1">
                                      {page.otherProjects.map((p: any) => (
                                        <li key={p.id} className="text-gray-300 dark:text-gray-400">
                                          • {p.name} (ID: {p.id})
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Badge Publié */}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              isPublished
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {isPublished ? 'Publiée' : 'Non publiée'}
                            </span>
                            
                            {/* Badge Visible */}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              projectPage.is_active !== false
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {projectPage.is_active !== false ? 'Visible' : 'Masquée'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewPage(page.slug, 'public')
                          }}
                          className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium transition-colors flex items-center gap-1.5"
                          title="Aperçu de la page"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="hidden sm:inline">Aperçu</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(`/${page.slug === 'home' ? '' : page.slug}`, '_blank')
                          }}
                          className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition-colors flex items-center gap-1.5"
                          title="Voir la page en public"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span className="hidden sm:inline">Voir</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePageClick()
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
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemovePage(projectPage.id)
                          }}
                          className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium transition-colors flex items-center gap-1.5"
                          title="Retirer cette page du projet (la page existe toujours)"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="hidden sm:inline">Retirer</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Aucune page liée à ce projet
              </p>
            )}
          </div>
          
          {/* Section 2: Pages disponibles (non liées) */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Pages disponibles
                    {publicPages.filter((p: any) => {
                      const isNotLinked = !project.pages?.find((pp: ProjectPage) => pp.page_slug === p.slug && pp.page_type === 'public')
                      const matchesSearch = !searchQuery || 
                        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.slug.toLowerCase().includes(searchQuery.toLowerCase())
                      return isNotLinked && matchesSearch
                    }).length > 0 && (
                      <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                        {publicPages.filter((p: any) => {
                          const isNotLinked = !project.pages?.find((pp: ProjectPage) => pp.page_slug === p.slug && pp.page_type === 'public')
                          const matchesSearch = !searchQuery || 
                            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.slug.toLowerCase().includes(searchQuery.toLowerCase())
                          return isNotLinked && matchesSearch
                        }).length}
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Pages créées dans le système mais non encore liées à ce projet
                  </p>
                </div>
              </div>
              
              {/* Barre de recherche */}
              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher une page (titre ou slug)..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Liste des pages disponibles */}
            {publicPages.filter((p: any) => {
              const isNotLinked = !project.pages?.find((pp: ProjectPage) => pp.page_slug === p.slug && pp.page_type === 'public')
              const matchesSearch = !searchQuery || 
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.slug.toLowerCase().includes(searchQuery.toLowerCase())
              return isNotLinked && matchesSearch
            }).length > 0 ? (
              <div className="space-y-2">
                {publicPages
                  .filter((p: any) => {
                    const isNotLinked = !project.pages?.find((pp: ProjectPage) => pp.page_slug === p.slug && pp.page_type === 'public')
                    const matchesSearch = !searchQuery || 
                      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
                    return isNotLinked && matchesSearch
                  })
                  .map((page: any) => {
                    const isPublished = page.is_active !== false
                    
                    // Fonction pour naviguer vers l'édition de la page
                    const handlePageClick = () => {
                      if (page.slug === 'home') {
                        navigate('/admin/homepage')
                      } else {
                        navigate(`/admin/pages-public/${page.slug}/edit`)
                      }
                    }
                    
                    return (
                      <div
                        key={page.slug}
                        onClick={handlePageClick}
                        className="flex items-center justify-between p-3 sm:p-4 rounded-lg border bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-all group"
                        title="Double-cliquer pour éditer"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Toggle Publié */}
                          <div onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-1">
                            <ToggleSwitch
                              checked={isPublished}
                              onChange={() => handleTogglePublished(page.slug, isPublished)}
                              size="sm"
                              color="green"
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400">Publié</span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-gray-900 dark:text-gray-100 break-words">{page.title}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">({page.slug})</span>
                              
                              {/* Indicateur autres projets */}
                              {page.otherProjects && page.otherProjects.length > 0 && (
                                <div className="group relative">
                                  <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full text-xs font-medium cursor-help">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span>{page.otherProjects.length} autre{page.otherProjects.length > 1 ? 's' : ''}</span>
                                  </div>
                                  {/* Tooltip avec liste des projets */}
                                  <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-64">
                                    <div className="bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg shadow-lg p-3 border border-gray-700">
                                      <div className="font-semibold mb-2">Aussi dans :</div>
                                      <ul className="space-y-1">
                                        {page.otherProjects.map((p: any) => (
                                          <li key={p.id} className="text-gray-300 dark:text-gray-400">
                                            • {p.name} (ID: {p.id})
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Badge Publié */}
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                isPublished
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                              }`}>
                                {isPublished ? 'Publiée' : 'Non publiée'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePreviewPage(page.slug, 'public')
                            }}
                            className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium transition-colors flex items-center gap-1.5"
                            title="Aperçu de la page"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span className="hidden sm:inline">Aperçu</span>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(`/${page.slug === 'home' ? '' : page.slug}`, '_blank')
                            }}
                            className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition-colors flex items-center gap-1.5"
                            title="Voir la page en public"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span className="hidden sm:inline">Voir</span>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePageClick()
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition-colors flex items-center gap-1.5"
                            title="Éditer"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="hidden sm:inline">Éditer</span>
                          </button>
                          
                          {/* Bouton Dupliquer (si la page est dans un autre projet) */}
                          {page.otherProjects && page.otherProjects.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDuplicatePage(page.slug, page.title)
                              }}
                              className="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium transition-colors flex items-center gap-1.5"
                              title="Dupliquer cette page pour ce projet"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <span className="hidden sm:inline">Dupliquer</span>
                            </button>
                          )}
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddPage(page.slug, 'public')
                            }}
                            className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition-colors flex items-center gap-1.5"
                            title="Ajouter cette page au projet"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="hidden sm:inline">Ajouter au projet</span>
                            <span className="sm:hidden">Ajouter</span>
                          </button>
                          
                          {/* Bouton Supprimer (uniquement pour admin) */}
                          {authService.isSuperAdmin() && page.slug !== 'home' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeletePage(page.slug)
                              }}
                              className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium transition-colors flex items-center gap-1.5"
                              title="Supprimer définitivement cette page"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span className="hidden sm:inline">Supprimer</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            ) : searchQuery ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Aucune page disponible ne correspond à votre recherche "{searchQuery}"
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Toutes les pages sont déjà liées à ce projet
              </p>
            )}
          </div>
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

