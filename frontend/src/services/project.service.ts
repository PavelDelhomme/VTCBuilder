/**
 * Service for managing projects
 */
import api from '@/lib/api'

export interface Project {
  id: number
  name: string
  slug: string
  description?: string
  tenant?: {
    id: number
    name: string
    slug: string
  } | null
  tenant_id?: number | null
  tenant_domain?: string | null
  is_system_project: boolean
  status: 'active' | 'inactive' | 'archived'
  domain?: string
  metadata?: Record<string, any>
  is_deleted?: boolean
  deleted_at?: string | null
  pages_count?: number
  available_pages_count?: number | null
  pages?: ProjectPage[]
  created_at: string
  updated_at: string
}

export interface ProjectPage {
  id: number
  project: number
  page_slug: string
  page_type: 'public' | 'tenant'
  order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

const projectService = {
  /**
   * Get all projects
   */
  async getAll(includeDeleted: boolean = false): Promise<Project[]> {
    const response = await api.get('/projects/', {
      params: { include_deleted: includeDeleted }
    })
    return Array.isArray(response.data) ? response.data : response.data.results || []
  },

  /**
   * Get a project by ID
   */
  async getById(id: number): Promise<Project> {
    const response = await api.get(`/projects/${id}/`)
    return response.data
  },

  /**
   * Create a new project
   */
  async create(data: Partial<Project>): Promise<Project> {
    const response = await api.post('/projects/', data)
    return response.data
  },

  /**
   * Update a project
   */
  async update(id: number, data: Partial<Project>): Promise<Project> {
    const response = await api.patch(`/projects/${id}/`, data)
    return response.data
  },

  /**
   * Delete a project
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/projects/${id}/`)
  },

  /**
   * Add a page to a project
   */
  async addPage(projectId: number, pageSlug: string, pageType: 'public' | 'tenant' = 'public', order: number = 0): Promise<ProjectPage> {
    const response = await api.post(`/projects/${projectId}/add_page/`, {
      page_slug: pageSlug,
      page_type: pageType,
      order,
    })
    return response.data
  },

  /**
   * Remove a page from a project
   */
  async removePage(projectId: number, pageId: number): Promise<void> {
    // Pass page_id in URL path for better compatibility
    await api.delete(`/projects/${projectId}/remove_page/${pageId}/`)
  },

  /**
   * Update a project page (e.g., toggle is_active)
   */
  async updatePage(projectId: number, pageId: number, data: Partial<ProjectPage>): Promise<ProjectPage> {
    const response = await api.patch(`/projects/${projectId}/pages/${pageId}/`, data)
    return response.data
  },

  /**
   * Get system project (for public pages)
   */
  async getSystemProject(): Promise<Project | null> {
    try {
      const projects = await this.getAll()
      return projects.find(p => p.is_system_project) || null
    } catch (error) {
      console.error('Erreur récupération projet système:', error)
      return null
    }
  },

  /**
   * Get project by tenant slug
   */
  async getProjectByTenantSlug(tenantSlug: string): Promise<Project | null> {
    try {
      const projects = await this.getAll()
      return projects.find(p => p.tenant?.slug === tenantSlug) || null
    } catch (error) {
      console.error('Erreur récupération projet tenant:', error)
      return null
    }
  },

  /**
   * Restore a deleted project from trash
   */
  async restore(id: number): Promise<Project> {
    const response = await api.post(`/projects/${id}/restore/`)
    return response.data
  },

  /**
   * Permanently delete a project (only if in trash)
   */
  async permanentDelete(id: number): Promise<void> {
    await api.delete(`/projects/${id}/permanent_delete/`)
  },
}

export default projectService

