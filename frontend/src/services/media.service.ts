import api from '@/lib/api';

export interface Media {
  id: number;
  tenant_id?: number;
  name: string;
  file_name: string;
  mime_type: string;
  path: string;
  disk: string;
  size: number;
  collection: 'images' | 'documents' | 'videos' | 'audio' | 'other';
  alt_text?: string;
  order: number;
  metadata?: Record<string, any>;
  url?: string;
  created_at: string;
  updated_at: string;
}

class MediaService {
  async getAll(params?: { 
    collection?: string;
    search?: string;
  }) {
    const response = await api.get('/media/', { params });
    // Handle paginated response
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && typeof response.data === 'object' && 'results' in response.data) {
      return response.data.results || [];
    }
    return [];
  }

  async getById(id: number) {
    const response = await api.get(`/media/${id}/`);
    return response.data;
  }

  async upload(file: File, metadata?: { alt_text?: string; collection?: string }) {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata?.alt_text) {
      formData.append('alt_text', metadata.alt_text);
    }
    if (metadata?.collection) {
      formData.append('collection', metadata.collection);
    }

    // Ne pas définir Content-Type manuellement - le navigateur le fera automatiquement avec le boundary
    const response = await api.post('/media/upload/', formData);
    return response.data;
  }

  async update(id: number, data: Partial<Media>) {
    const response = await api.patch(`/media/${id}/`, data);
    return response.data;
  }

  async delete(id: number) {
    const response = await api.delete(`/media/${id}/`);
    return response.data;
  }

  async getImages() {
    const response = await api.get('/media/images/');
    return response.data;
  }
}

export default new MediaService();

