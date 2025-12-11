'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import authService from '@/services/auth.service'
import TenantLayout from '@/components/tenant/TenantLayout'
import projectService, { Project, ProjectPage } from '@/services/project.service'
import pageService from '@/services/page.service'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import PageLoader from '@/components/shared/PageLoader'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Bars3Icon } from '@heroicons/react/24/outline'

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = parseInt(params?.id as string)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [publicPages, setPublicPages] = useState<any[]>([])
  const [tenantPages, setTenantPages] = useState<any[]>([])

  useEffect(() => {
    // Allow both super admin and tenant admin to access projects
    // API will filter projects based on user
    if (projectId) {
      loadProject()
    }
  }, [router, projectId])

  // Load available pages when project is loaded
  useEffect(() => {
    if (project) {
      loadAvailablePages()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id, project?.is_system_project, project?.tenant_id])

  const loadProject = async () => {
    try {
      setLoading(true)
      const data = await projectService.getById(projectId)
      setProject(data)
    } catch (error: any) {
      console.error('Erreur chargement projet:', error)
      toast.error('Erreur lors du chargement du projet')
      router.push('/dashboard/projects')
    } finally {
      setLoading(false)
    }
  }

  const loadAvailablePages = async () => {
    try {
      // Only load public pages if this is a system project
      if (project?.is_system_project) {
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
      } else {
        // Clear public pages for non-system projects
        setPublicPages([])
      }
      
      // Load tenant pages if project has a tenant
      if (project?.tenant_id) {
        try {
          const tenantPagesData = await pageService.getAll({ tenant_id: project.tenant_id })
          setTenantPages(tenantPagesData.map((page: any) => ({
            slug: page.slug,
            title: page.title,
            type: 'tenant',
            id: page.id,
          })))
        } catch (error: any) {
          console.error('Erreur chargement pages tenant:', error)
          // If tenant pages can't be loaded, set empty array
          setTenantPages([])
        }
      } else {
        // Clear tenant pages for system projects
        setTenantPages([])
      }
    } catch (error: any) {
      console.error('Erreur chargement pages disponibles:', error)
      // On error, clear both arrays
      setPublicPages([])
      setTenantPages([])
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

  // Organiser les pages hiérarchiquement (pages principales avec leurs sous-pages)
  const organizedPages = useMemo(() => {
    if (!project?.pages) return []
    
    // Trier par order d'abord
    const sortedPages = [...project.pages].sort((a, b) => a.order - b.order)
    
    // Séparer les pages principales et les sous-pages
    const mainPages: (ProjectPage & { subPages?: ProjectPage[] })[] = []
    const subPagesMap = new Map<string, ProjectPage[]>()
    
    sortedPages.forEach(page => {
      const slugParts = page.page_slug.split('/')
      
      if (slugParts.length === 1) {
        // Page principale (ex: "home", "contact")
        mainPages.push({ ...page, subPages: [] })
      } else {
        // Sous-page (ex: "legal/privacy" -> parent: "legal")
        const parentSlug = slugParts[0]
        if (!subPagesMap.has(parentSlug)) {
          subPagesMap.set(parentSlug, [])
        }
        subPagesMap.get(parentSlug)!.push(page)
      }
    })
    
    // Attacher les sous-pages à leurs pages parentes
    mainPages.forEach(mainPage => {
      const subPages = subPagesMap.get(mainPage.page_slug) || []
      if (subPages.length > 0) {
        mainPage.subPages = subPages.sort((a, b) => a.order - b.order)
      }
    })
    
    // Ajouter les pages orphelines (sous-pages dont le parent n'existe pas)
    subPagesMap.forEach((subPages, parentSlug) => {
      if (!mainPages.find(p => p.page_slug === parentSlug)) {
        // Créer une entrée "virtuelle" pour le parent
        mainPages.push({
          id: -1, // ID virtuel
          project: project.id,
          page_slug: parentSlug,
          page_type: 'public' as const,
          order: Math.max(...subPages.map(s => s.order)),
          is_active: true,
          created_at: '',
          updated_at: '',
          subPages: subPages.sort((a, b) => a.order - b.order)
        })
      }
    })
    
    return mainPages.sort((a, b) => a.order - b.order)
  }, [project?.pages])

  // Drag & Drop handlers
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || !project?.pages) return
    
    const activeId = active.id as number
    const overId = over.id as number
    
    if (activeId === overId) return
    
    // Trouver les pages déplacées
    const activePage = project.pages.find(p => p.id === activeId)
    const overPage = project.pages.find(p => p.id === overId)
    
    if (!activePage || !overPage) return
    
    // Calculer le nouvel ordre
    const oldIndex = project.pages.findIndex(p => p.id === activeId)
    const newIndex = project.pages.findIndex(p => p.id === overId)
    
    const reorderedPages = arrayMove(project.pages, oldIndex, newIndex)
    
    // Mettre à jour l'ordre de toutes les pages affectées
    try {
      const updatePromises = reorderedPages.map((page, index) => {
        if (page.order !== index) {
          return projectService.updatePage(projectId, page.id, { order: index })
        }
        return Promise.resolve()
      })
      
      await Promise.all(updatePromises)
      toast.success('Ordre des pages mis à jour !')
      loadProject()
    } catch (error: any) {
      console.error('Erreur mise à jour ordre:', error)
      toast.error('Erreur lors de la mise à jour de l\'ordre')
    }
  }

  if (loading || !project) {
    return (
      <TenantLayout title="Projet" subtitle="Chargement...">
        <PageLoader text="Chargement du projet..." />
      </TenantLayout>
    )
  }

  return (
    <TenantLayout
      title={project.name}
      subtitle={`Gérer les pages du projet ${project.slug}`}
      headerActions={
        <button
          onClick={() => router.push('/dashboard/projects')}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          ← Retour
        </button>
      }
    >
      <div className="space-y-6">
        {/* Project Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          {/* Badges en haut */}
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            {project.is_system_project ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                🌐 Site Public VTCBuilder
              </span>
            ) : project.tenant ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                🏢 {project.tenant.name}
              </span>
            ) : null}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                project.status === 'active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : project.status === 'archived'
                  ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}
            >
              {project.status === 'active' ? 'Actif' : project.status === 'archived' ? 'Archivé' : 'Inactif'}
            </span>
          </div>

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
            {project.tenant && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tenant associé
                </label>
                <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{project.tenant.name}</span>
                    <span className="text-gray-500 dark:text-gray-400 font-mono text-sm">
                      ({project.tenant.slug})
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Slug
              </label>
              <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                <span className="font-mono text-sm text-gray-700 dark:text-gray-300">/{project.slug}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pages in Project */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Pages du Projet</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Glissez-déposez pour réorganiser les pages. Les sous-pages (ex: legal/privacy) sont groupées sous leur page parente.
              </p>
            </div>
          </div>
          
          {project.pages && project.pages.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={project.pages.map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {organizedPages.map((pageGroup) => (
                    <div key={pageGroup.id} className="space-y-1">
                      {/* Page principale */}
                      {pageGroup.id > 0 ? (
                        <SortablePageItem
                          page={pageGroup}
                          onEdit={() => {
                            if (pageGroup.page_type === 'public') {
                              router.push(`/admin/pages-public/edit/${pageGroup.page_slug}`)
                            }
                          }}
                          onRemove={() => handleRemovePage(pageGroup.id)}
                        />
                      ) : (
                        // Page parente virtuelle (orpheline)
                        <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                📁 {pageGroup.page_slug} (parent virtuel)
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Cette page parente n'est pas dans le projet, mais ses sous-pages y sont.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Sous-pages */}
                      {pageGroup.subPages && pageGroup.subPages.length > 0 && (
                        <div className="ml-6 space-y-1 border-l-2 border-gray-300 dark:border-gray-600 pl-4">
                          {pageGroup.subPages.map((subPage) => (
                            <SortablePageItem
                              key={subPage.id}
                              page={subPage}
                              isSubPage={true}
                              onEdit={() => {
                                if (subPage.page_type === 'public') {
                                  router.push(`/admin/pages-public/edit/${subPage.page_slug}`)
                                }
                              }}
                              onRemove={() => handleRemovePage(subPage.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              Aucune page dans ce projet
            </p>
          )}
        </div>

        {/* Available Pages to Add */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Pages Disponibles</h2>
          
          {/* Public Pages - Only for system projects */}
          {project.is_system_project && publicPages.length > 0 && (
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

          {/* Tenant Pages - Only for tenant projects */}
          {!project.is_system_project && project.tenant_id && tenantPages.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pages Tenant ({project.tenant?.name})</h3>
              <div className="space-y-2">
                {tenantPages.map((page) => {
                  const isInProject = project.pages?.some((p: ProjectPage) => p.page_slug === page.slug && p.page_type === 'tenant')
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
                          onClick={() => handleAddPage(page.slug, 'tenant')}
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

          {/* Message when no pages available */}
          {((project.is_system_project && publicPages.length === 0) || 
            (!project.is_system_project && (!project.tenant_id || tenantPages.length === 0))) && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              {project.is_system_project 
                ? 'Aucune page publique disponible'
                : project.tenant_id 
                  ? 'Aucune page tenant disponible. Créez des pages dans la section Pages du dashboard.'
                  : 'Aucune page disponible pour ce projet'}
            </p>
          )}
        </div>
      </div>
    </TenantLayout>
  )
}

// Composant pour une page draggable
function SortablePageItem({ 
  page, 
  isSubPage = false, 
  onEdit, 
  onRemove 
}: { 
  page: ProjectPage
  isSubPage?: boolean
  onEdit: () => void
  onRemove: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Obtenir le titre de la page depuis le slug
  const getPageTitle = (slug: string) => {
    const slugParts = slug.split('/')
    const lastPart = slugParts[slugParts.length - 1]
    
    // Capitaliser et remplacer les tirets/underscores
    return lastPart
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 rounded-lg ${
        isSubPage
          ? 'bg-gray-50 dark:bg-gray-900/50'
          : 'bg-gray-50 dark:bg-gray-900'
      } ${isDragging ? 'shadow-lg z-50' : ''}`}
    >
      <div className="flex items-center gap-3 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <Bars3Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isSubPage && (
              <span className="text-xs text-gray-400 dark:text-gray-500">└─</span>
            )}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {getPageTitle(page.page_slug)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              ({page.page_slug})
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({page.page_type === 'public' ? 'Publique' : 'Tenant'})
            </span>
          </div>
          {isSubPage && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 ml-6">
              Sous-page de {page.page_slug.split('/')[0]}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Éditer
        </button>
        <button
          onClick={onRemove}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Retirer
        </button>
      </div>
    </div>
  )
}

