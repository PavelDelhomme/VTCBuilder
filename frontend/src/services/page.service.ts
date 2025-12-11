import api from '@/lib/api';

export interface Page {
  id: number;
  tenant_id: number;
  title: string;
  slug: string;
  content?: string;
  blocks?: any[];
  meta_title?: string;
  meta_description?: string;
  featured_image?: string;
  status: 'draft' | 'published' | 'scheduled';
  published_at?: string;
  order: number;
  is_homepage: boolean;
  created_at: string;
  updated_at: string;
}

class PageService {
  async getAll(params?: { status?: string; tenant_id?: number }) {
    const response = await api.get('/pages/', { params });
    // Handle paginated response
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && typeof response.data === 'object' && 'results' in response.data) {
      return response.data.results || [];
    }
    return [];
  }

  async getById(id: number, tenantId?: number) {
    const params = tenantId ? { tenant_id: tenantId } : {}
    const response = await api.get(`/pages/${id}/`, { params });
    return response.data;
  }

  async create(data: Partial<Page>) {
    const response = await api.post('/pages/', data);
    return response.data;
  }

  async update(id: number, data: Partial<Page>) {
    const response = await api.patch(`/pages/${id}/`, data);
    return response.data;
  }

  async delete(id: number) {
    const response = await api.delete(`/pages/${id}/`);
    return response.data;
  }

  async publish(id: number) {
    const response = await api.post(`/pages/${id}/publish/`);
    return response.data;
  }

  async duplicate(id: number) {
    const response = await api.post(`/pages/${id}/duplicate/`);
    return response.data;
  }
}

export default new PageService();

