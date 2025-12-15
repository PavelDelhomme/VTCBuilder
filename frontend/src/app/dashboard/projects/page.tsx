'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import TenantLayout from '@/components/tenant/TenantLayout'
import projectService, { Project } from '@/services/project.service'
import toast from 'react-hot-toast'
import PageLoader from '@/components/shared/PageLoader'

export default function ProjectsManagement() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Allow both super admin and tenant admin to access projects
    // No need to check permissions - API will filter projects based on user
    loadProjects()
  }, [router])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await projectService.getAll()
      setProjects(data)
    } catch (error: any) {
      console.error('Error chargement projets:', error)
      toast.error('Error lors du chargement des projets')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async () => {
    try {
      // Créer un projet système par défaut pour les pages publiques
      const project = await projectService.create({
        name: `Projet ${projects.length + 1}`,
        is_system_project: true,
        status: 'active',
      })
      toast.success('Projet créé avec succès !')
      router.push(`/dashboard/projects/${project.id}`)
    } catch (error: any) {
      console.error('Error création projet:', error)
      toast.error('Error lors de la création du projet')
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
      console.error('Error suppression projet:', error)
      toast.error('Error lors de la suppression')
    }
  }

  if (loading) {
    return (
      <TenantLayout title="Projets" subtitle="Gestion des projets et sites">
        <PageLoader text="Chargement des projets..." />
      </TenantLayout>
    )
  }

  return (
    <TenantLayout
      title="Projets"
      subtitle="Gérez vos projets et sites web - Groupez vos pages par projet"
      headerActions={
        <button
          onClick={handleCreateProject}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau Projet
        </button>
      }
    >
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
                {/* Header avec badges */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {/* Badge Tenant ou Système en premier */}
                    <div className="flex items-center gap-2 mb-2">
                      {project.is_system_project ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          🌐 Site Public VTCBuilder
                        </span>
                      ) : project.tenant ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          🏢 {project.tenant.name}
                        </span>
                      ) : null}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                    
                    {/* Nom du projet */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {project.name}
                    </h3>
                    
                    {/* Slug et description */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <span className="font-mono">/{project.slug}</span>
                    </p>
                    {project.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Informations supplémentaires */}
                <div className="space-y-2 mb-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  {project.tenant && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Tenant:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {project.tenant.name}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500 font-mono text-xs">
                        ({project.tenant.slug})
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium">{project.pages_count || 0}</span>
                    <span>page{project.pages_count !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    📁 Ouvrir
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
    </TenantLayout>
  )
}

