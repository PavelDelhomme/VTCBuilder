'use client'

import { useEffect, useState } from 'react'
import pageService, { Page } from '@/services/page.service'
import projectService, { Project } from '@/services/project.service'
import ResponsiveTable from '@/components/shared/ResponsiveTable'
import toast from 'react-hot-toast'
import { getTenantSlug } from '@/lib/tenant-utils'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

interface TenantSiteTabProps {
  tenantId: number
  tenantName: string
  tenantSlug: string
}

export default function TenantSiteTab({ tenantId, tenantName, tenantSlug }: TenantSiteTabProps) {
  const [pages, setPages] = useState<Page[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingProjects, setLoadingProjects] = useState(true)
  const tenantDomain = `${tenantSlug}.localhost:9494`

  useEffect(() => {
    loadPages()
    loadProjects()
  }, [tenantId])

  const loadProjects = async () => {
    try {
      setLoadingProjects(true)
      const allProjects = await projectService.getAll()
      // Filtrer les projets de ce tenant (vérifier tenant_id ou tenant.id)
      const tenantProjects = allProjects.filter(p => {
        const projectTenantId = p.tenant_id || (p.tenant?.id)
        return projectTenantId === tenantId
      })
      setProjects(tenantProjects)
      if (tenantProjects.length > 0 && !selectedProject) {
        setSelectedProject(tenantProjects[0])
      }
    } catch (error) {
      console.error('Error chargement projets:', error)
      toast.error('Error lors du chargement des projets')
      setProjects([])
    } finally {
      setLoadingProjects(false)
    }
  }

  const loadPages = async () => {
    try {
      setLoading(true)
      // Super admin: load pages for specific tenant via tenant_id parameter
      const data = await pageService.getAll({ tenant_id: tenantId })
      const pagesArray = Array.isArray(data) ? data : (data?.results || data?.data || [])
      setPages(pagesArray)
    } catch (error) {
      console.error('Error chargement pages:', error)
      toast.error('Error lors du chargement des pages')
      setPages([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePage = () => {
    window.open(`http://${tenantDomain}/dashboard/pages/new`, '_blank')
  }

  const handleViewSite = () => {
    window.open(`http://${tenantDomain}`, '_blank')
  }

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: string } = {
      draft: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
    }
    return badges[status] || 'bg-gray-100 dark:bg-gray-900 text-gray-800'
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement des pages...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden w-full">
      {/* Projects Section */}
      {loadingProjects ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
          <LoadingSpinner text="Chargement des projets..." />
        </div>
      ) : projects.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 overflow-x-hidden">
          <div className="flex flex-col gap-3 sm:gap-4 mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              Projets du tenant ({projects.length})
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 sm:-mx-0 px-4 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors whitespace-nowrap flex-shrink-0 text-sm ${
                    selectedProject?.id === project.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {project.name}
                </button>
              ))}
            </div>
          </div>

          {selectedProject && (
            <div className="mt-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-base sm:text-md font-semibold text-gray-900 dark:text-gray-100 break-words">
                    {selectedProject.name}
                  </h4>
                  {selectedProject.description && (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
                      {selectedProject.description}
                    </p>
                  )}
                  {selectedProject.domain && (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 break-all">
                      Domaine: <span className="font-mono text-xs">{selectedProject.domain}</span>
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                  <a
                    href={`http://${tenantDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span className="hidden sm:inline">Voir le site</span>
                    <span className="sm:hidden">Voir</span>
                  </a>
                  <a
                    href={`http://${tenantDomain}/dashboard/projects/${selectedProject.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="hidden sm:inline">Gérer le projet</span>
                    <span className="sm:hidden">Gérer</span>
                  </a>
                </div>
              </div>

              {/* Preview iframe */}
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                <div className="bg-gray-200 dark:bg-gray-800 px-2 sm:px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-mono truncate flex-1 mx-2 text-center">
                    {tenantDomain}
                  </div>
                  <div className="w-8 sm:w-16"></div>
                </div>
                <iframe
                  src={`http://${tenantDomain}`}
                  className="w-full h-64 sm:h-96 border-0"
                  title={`Preview ${selectedProject.name}`}
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
              </div>

              {selectedProject.pages && selectedProject.pages.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Pages du projet ({selectedProject.pages.length})
                  </h5>
                  <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
                    {selectedProject.pages.map((projectPage) => (
                      <a
                        key={projectPage.id}
                        href={`http://${tenantDomain}/${projectPage.page_slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0"
                      >
                        /{projectPage.page_slug}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Aucun projet trouvé pour ce tenant
            </p>
            <a
              href={`http://${tenantDomain}/dashboard/projects`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Créer un projet →
            </a>
          </div>
        </div>
      )}

      {/* Site Info */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4 mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 break-words">Site Web de {tenantName}</h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">
              URL publique: <a href={`http://${tenantDomain}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-mono break-all text-xs">{tenantDomain}</a>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <button
              onClick={handleViewSite}
              className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="hidden sm:inline">Voir le site</span>
              <span className="sm:hidden">Voir</span>
            </button>
            <button
              onClick={handleCreatePage}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Nouvelle page</span>
              <span className="sm:hidden">Nouvelle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pages List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 overflow-x-auto">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Pages du site</h3>
        {pages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Aucune page trouvée pour ce tenant</p>
            <button
              onClick={handleCreatePage}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Créer une page →
            </button>
          </div>
        ) : (
          <ResponsiveTable
            headers={['Titre', 'Slug', 'Statut', 'Homepage', 'Créé le', 'Actions']}
            emptyMessage="Aucune page"
          >
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50 dark:bg-gray-900">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{page.title}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">/{page.slug}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(page.status)}`}>
                    {page.status === 'draft' ? 'Brouillon' : page.status === 'published' ? 'Publié' : 'Programmé'}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {page.is_homepage ? (
                    <span className="text-blue-600 font-semibold">✓ Oui</span>
                  ) : (
                    <span className="text-gray-400">Non</span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {page.created_at ? (() => {
                    try {
                      const date = new Date(page.created_at)
                      return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('fr-FR')
                    } catch {
                      return '-'
                    }
                  })() : '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    <a
                      href={`http://${tenantDomain}/dashboard/pages/${page.id}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-xs font-medium shadow-sm hover:shadow-md"
                      title="Éditer la page"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Éditer
                    </a>
                    {page.status === 'published' && (
                      <a
                        href={`http://${tenantDomain}/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 text-xs font-medium shadow-sm hover:shadow-md"
                        title="Voir la page"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Voir
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </ResponsiveTable>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6">
        <h4 className="text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-200 mb-3">💡 Accès rapide</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <a
            href={`http://${tenantDomain}/dashboard`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow border border-blue-200 dark:border-blue-700"
          >
            <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">📊 Dashboard Tenant</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Gérer le site complet</div>
          </a>
          <a
            href={`http://${tenantDomain}/dashboard/pages`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow border border-blue-200 dark:border-blue-700"
          >
            <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">📄 Gestion des Pages</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Créer et éditer les pages</div>
          </a>
        </div>
      </div>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

