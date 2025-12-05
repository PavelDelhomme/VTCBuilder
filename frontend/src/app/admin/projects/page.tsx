'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/admin/AdminLayout'
import projectService, { Project } from '@/services/project.service'
import toast from 'react-hot-toast'
import PageLoader from '@/components/shared/PageLoader'
import { useNavigationLoading } from '@/hooks/useNavigationLoading'

export default function ProjectsManagement() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
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
      const data = await projectService.getAll()
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      return
    }
    try {
      await projectService.delete(id)
      toast.success('Projet supprimé avec succès !')
      loadProjects()
    } catch (error: any) {
      console.error('Erreur suppression projet:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

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
      <div className="w-full h-full min-h-0 flex flex-col overflow-hidden">
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

        {/* Projects List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
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
                    {project.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : project.status === 'archived'
                          ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}
                    >
                      {project.status === 'active' ? '🟢 En ligne' : project.status === 'archived' ? '🔴 Archivé' : '🟡 Hors ligne'}
                    </span>
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
                    {project.pages_count || 0} page{project.pages_count !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/admin/projects/${project.id}`)}
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
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
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

