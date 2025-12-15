import api from '@/lib/api';

export interface Template {
  id: number;
  name: string;
  slug: string;
  description?: string;
  preview_image?: string; // URL de l'image de prévisualisation uploadée
  structure?: Record<string, any>;
  default_settings?: Record<string, any>;
  html_content?: string;
  css_content?: string;
  variables?: Record<string, { type: string; default: string; description: string }>;
  category: 'vtc' | 'business' | 'minimal' | 'modern' | 'classic';
  is_premium: boolean;
  price: number;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

class TemplateService {
  async getAll(params?: { category?: string; is_premium?: boolean }) {
    try {
      const response = await api.get('/templates/', { params });
      // Handle paginated response
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && typeof response.data === 'object' && 'results' in response.data) {
        return response.data.results || [];
      }
      return [];
    } catch (error: any) {
      // Retourner un tableau vide en cas d'error (500, etc.)
      if (error.response?.status === 404 || error.response?.status === 500 || error.code === 'ERR_FAILED') {
        return [];
      }
      throw error;
    }
  }

  async getById(id: number) {
    const response = await api.get(`/templates/${id}/`);
    return response.data;
  }

  async useTemplate(id: number) {
    const response = await api.post(`/templates/${id}/use_template/`);
    return response.data;
  }

  async getFree() {
    const response = await api.get('/templates/free/');
    return response.data;
  }

  async create(data: Partial<Template> | FormData) {
    // Si c'est FormData, ne pas définir Content-Type (laisser le navigateur le faire)
    const config = data instanceof FormData 
      ? {} 
      : {};
    const response = await api.post('/templates/', data, config);
    return response.data;
  }

  async update(id: number, data: Partial<Template> | FormData) {
    // Si c'est FormData, ne pas définir Content-Type (laisser le navigateur le faire)
    const config = data instanceof FormData 
      ? {} 
      : {};
    const response = await api.patch(`/templates/${id}/`, data, config);
    return response.data;
  }

  async delete(id: number) {
    const response = await api.delete(`/templates/${id}/`);
    return response.data;
  }

  async uploadHtmlFile(file: File) {
    const formData = new FormData();
    formData.append('html_file', file);
    const response = await api.post('/templates/upload_html/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadCssFile(file: File) {
    const formData = new FormData();
    formData.append('css_file', file);
    const response = await api.post('/templates/upload_css/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async render(id: number, context: Record<string, any> = {}, blocks: Record<string, string> = {}) {
    const response = await api.post(`/templates/${id}/render/`, {
      context,
      blocks,
    });
    return response.data;
  }

  async getVariables(id: number) {
    const response = await api.get(`/templates/${id}/variables/`);
    return response.data;
  }
}

export default new TemplateService();

