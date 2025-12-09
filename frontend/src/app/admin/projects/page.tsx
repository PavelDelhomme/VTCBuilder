'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/admin/AdminLayout'
import projectService, { Project } from '@/services/project.service'
import toast from 'react-hot-toast'
import PageLoader from '@/components/shared/PageLoader'
import { useNavigationLoading } from '@/hooks/useNavigationLoading'
import ToggleSwitch from '@/components/shared/ToggleSwitch'

// Composant ProjectCard
interface ProjectCardProps {
  project: Project
  onToggleStatus: (project: Project) => void
  onDelete: (id: number) => void
  onOpen: () => void
  isNavigating: boolean
}

// Composant ProjectCard avec toggle switch intégré dans le badge
function ProjectCard({ project, onToggleStatus, onDelete, onOpen, isNavigating }: ProjectCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              {project.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              /{project.slug}
            </p>
            {project.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 ${
                project.status === 'active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : project.status === 'archived'
                  ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              <div 
                className="relative z-10 flex-shrink-0" 
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
                style={{ pointerEvents: 'auto' }}
              >
                <ToggleSwitch
                  checked={project.status === 'active'}
                  onChange={() => {
                    onToggleStatus(project)
                  }}
                  size="sm"
                  color={project.status === 'active' ? 'green' : 'gray'}
                />
              </div>
              <span className="select-none pointer-events-none">
                {project.status === 'active' ? 'En ligne' : project.status === 'archived' ? 'Archivé' : 'Hors ligne'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {project.is_system_project ? (
            <div className="space-y-1">
              <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded text-xs font-medium">
                🔧 Projet Système
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                Pages publiques de VTCBuilder (marketing, CGV, etc.)
              </p>
            </div>
          ) : project.tenant ? (
            <div className="space-y-1">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">👤 Client:</span> {project.tenant.name}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                Projet principal du client (créé automatiquement)
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              Projet sans client assigné
            </p>
          )}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <div className="flex flex-col gap-0.5">
              <span>
                {project.pages_count || 0} page{project.pages_count !== 1 ? 's' : ''} liée{project.pages_count !== 1 ? 's' : ''}
              </span>
              {project.is_system_project && project.available_pages_count !== null && project.available_pages_count !== undefined && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {project.available_pages_count} page{project.available_pages_count !== 1 ? 's' : ''} disponible{project.available_pages_count !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onOpen}
            disabled={isNavigating}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isNavigating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Chargement...</span>
              </>
            ) : (
              <>📁 Ouvrir</>
            )}
          </button>
          {!project.is_system_project && (
            <button
              onClick={() => onDelete(project.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
              title="Mettre à la corbeille"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  )
}


export default function ProjectsManagement() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [trashProjects, setTrashProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showTrash, setShowTrash] = useState(false)
  const { isNavigating, navigate } = useNavigationLoading()

  useEffect(() => {
    // Vérifier l'authentification avant de charger
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    // Allow both super admin and tenant admin to access projects
    loadProjects()
  }, [router])

  const loadProjects = async () => {
    // Ne pas charger si pas authentifié
    if (!authService.isAuthenticated()) {
      return
    }
    
    try {
      setLoading(true)
      const data = await projectService.getAll(false)
      setProjects(data)
    } catch (error: any) {
      // Gérer les erreurs d'authentification
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        router.push('/login')
        return
      }
      
      const isExpectedError = error.code === 'ERR_NETWORK' || 
                             error.code === 'ERR_BLOCKED_BY_CLIENT'
      if (!isExpectedError) {
        console.error('Erreur chargement projets:', error)
        toast.error('Erreur lors du chargement des projets')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadTrash = async () => {
    try {
      const data = await projectService.getAll(true)
      setTrashProjects(data.filter(p => p.is_deleted))
    } catch (error: any) {
      console.error('Erreur chargement corbeille:', error)
      toast.error('Erreur lors du chargement de la corbeille')
    }
  }

  const handleCreateProject = async () => {
    // Vérifier l'authentification avant de créer
    if (!authService.isAuthenticated()) {
      toast.error('Vous devez être connecté pour créer un projet')
      router.push('/login')
      return
    }

    try {
      // Créer un projet système par défaut pour les pages publiques
      const project = await projectService.create({
        name: `Projet ${projects.length + 1}`,
        is_system_project: true,
        status: 'active',
      })
      toast.success('Projet créé avec succès !')
      navigate(`/admin/projects/${project.id}`)
    } catch (error: any) {
      // Gérer les erreurs d'authentification
      if (error.response?.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.')
        localStorage.removeItem('token')
        router.push('/login')
        return
      }
      
      // Ne pas logger les erreurs réseau attendues
      const isExpectedError = error.code === 'ERR_NETWORK' || 
                             error.code === 'ERR_BLOCKED_BY_CLIENT'
      if (!isExpectedError) {
        console.error('Erreur création projet:', error)
      }
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Erreur lors de la création du projet'
      toast.error(errorMessage)
    }
  }

  const handleDelete = async (id: number) => {
    // Empêcher la suppression des projets système
    const project = projects.find(p => p.id === id)
    if (project?.is_system_project) {
      toast.error('Les projets système ne peuvent pas être supprimés')
      return
    }
    
    if (!confirm('Êtes-vous sûr de vouloir déplacer ce projet dans la corbeille ?')) {
      return
    }
    try {
      await projectService.delete(id)
      toast.success('Projet déplacé dans la corbeille !')
      // Mise à jour optimiste : retirer le projet de la liste
      setProjects(prevProjects => prevProjects.filter(p => p.id !== id))
    } catch (error: any) {
      console.error('Erreur suppression projet:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleRestore = async (id: number) => {
    try {
      await projectService.restore(id)
      toast.success('Projet restauré avec succès !')
      loadProjects()
    } catch (error: any) {
      console.error('Erreur restauration projet:', error)
      toast.error('Erreur lors de la restauration')
    }
  }

  const handlePermanentDelete = async (id: number) => {
    // Empêcher la suppression définitive des projets système
    const project = trashProjects.find(p => p.id === id)
    if (project?.is_system_project) {
      toast.error('Les projets système ne peuvent pas être supprimés')
      return
    }
    
    if (!confirm('⚠️ ATTENTION : Cette action est irréversible !\n\nÊtes-vous sûr de vouloir supprimer définitivement ce projet ?')) {
      return
    }
    try {
      await projectService.permanentDelete(id)
      toast.success('Projet supprimé définitivement !')
      loadTrash()
    } catch (error: any) {
      console.error('Erreur suppression définitive:', error)
      toast.error('Erreur lors de la suppression définitive')
    }
  }

  const handleToggleStatus = async (project: Project) => {
    const newStatus = project.status === 'active' ? 'inactive' : 'active'
    try {
      // Mise à jour optimiste : mettre à jour l'état local immédiatement
      setProjects(prevProjects => 
        prevProjects.map(p => 
          p.id === project.id ? { ...p, status: newStatus } : p
        )
      )
      
      // Ensuite mettre à jour sur le serveur
      await projectService.update(project.id, { status: newStatus })
      toast.success(`Projet ${newStatus === 'active' ? 'mis en ligne' : 'mis hors ligne'} !`)
      
      // Pas besoin de recharger toute la liste, on a déjà mis à jour l'état local
    } catch (error: any) {
      console.error('Erreur changement statut:', error)
      // En cas d'erreur, restaurer l'état précédent
      setProjects(prevProjects => 
        prevProjects.map(p => 
          p.id === project.id ? { ...p, status: project.status } : p
        )
      )
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  // Grouper les projets par catégorie
  const groupedProjects = useMemo(() => {
    const systemProjects = projects.filter(p => p.is_system_project)
    const tenantProjects = projects.filter(p => !p.is_system_project && p.tenant)
    const orphanProjects = projects.filter(p => !p.is_system_project && !p.tenant)
    
    // Grouper les projets tenant par tenant
    const projectsByTenant = tenantProjects.reduce((acc, project) => {
      const tenantId = project.tenant!.id
      if (!acc[tenantId]) {
        acc[tenantId] = {
          tenant: project.tenant!,
          projects: []
        }
      }
      acc[tenantId].projects.push(project)
      return acc
    }, {} as Record<number, { tenant: { id: number; name: string; slug: string }; projects: Project[] }>)

    return {
      system: systemProjects,
      tenants: Object.values(projectsByTenant),
      orphan: orphanProjects
    }
  }, [projects])

  if (loading || isNavigating) {
    return (
      <AdminLayout title="Projets" subtitle="Gestion des projets et sites">
        <PageLoader text={isNavigating ? "Chargement..." : "Chargement des projets..."} />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Projets"
      subtitle="Gérez vos projets et sites web - Groupez vos pages par projet"
      headerActions={
        authService.isSuperAdmin() && (
          <button
            onClick={handleCreateProject}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau Projet
          </button>
        )
      }
    >
      <div className="w-full h-full min-h-0 flex flex-col overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="flex-1 min-h-0 overflow-y-auto pb-6">
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Système de Projets
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Organisez vos pages en projets/sites. Chaque projet peut contenir plusieurs pages (publiques ou tenant). 
                Similaire à WordPress multisite, chaque projet est comme un site indépendant.
              </p>
            </div>
          </div>
        </div>

        {/* Projects List - Grouped by Category */}
        <div className="space-y-8">
          {/* Projets Système */}
          {groupedProjects.system.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">🔧 Projets Système</h2>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                  {groupedProjects.system.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedProjects.system.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                    onOpen={() => navigate(`/admin/projects/${project.id}`)}
                    isNavigating={isNavigating}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Projets par Tenant */}
          {groupedProjects.tenants.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">👤 Projets Clients</h2>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                  {groupedProjects.tenants.reduce((sum, group) => sum + group.projects.length, 0)}
                </span>
              </div>
              <div className="space-y-6">
                {groupedProjects.tenants.map((group) => (
                  <div key={group.tenant.id} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <span>👤</span>
                      {group.tenant.name}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        ({group.projects.length} projet{group.projects.length > 1 ? 's' : ''})
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.projects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          onToggleStatus={handleToggleStatus}
                          onDelete={handleDelete}
                          onOpen={() => navigate(`/admin/projects/${project.id}`)}
                          isNavigating={isNavigating}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projets Orphelins */}
          {groupedProjects.orphan.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">📦 Autres Projets</h2>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                  {groupedProjects.orphan.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedProjects.orphan.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                    onOpen={() => navigate(`/admin/projects/${project.id}`)}
                    isNavigating={isNavigating}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section Corbeille */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">🗑️ Corbeille</h2>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                {trashProjects.length}
              </span>
            </div>
            <button
              onClick={() => {
                setShowTrash(!showTrash)
                if (!showTrash) {
                  loadTrash()
                }
              }}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {showTrash ? 'Masquer' : 'Afficher'} la corbeille
            </button>
          </div>
          
          {showTrash && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              {trashProjects.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">La corbeille est vide</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trashProjects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden opacity-75"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                              {project.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              /{project.slug}
                            </p>
                            {project.deleted_at && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Supprimé le {new Date(project.deleted_at).toLocaleDateString('fr-FR')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRestore(project.id)}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                          >
                            ♻️ Restaurer
                          </button>
                          {!project.is_system_project && (
                            <button
                              onClick={() => handlePermanentDelete(project.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                            >
                              🗑️ Supprimer
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Empty State */}
        {projects.length === 0 && !showTrash && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Aucun projet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Créez votre premier projet pour organiser vos pages.</p>
            <button
              onClick={handleCreateProject}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer un projet
            </button>
          </div>
        )}
      </div>
        </div>
      </div>
    </AdminLayout>
  )
}

