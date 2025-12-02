import api from '@/lib/api';

export interface User {
  id: number;
  email: string;
  name: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role: string;
  status: string;
  tenant?: { id: number; name: string };
  tenant_id?: number;
  tenant_name?: string;
  avatar?: string;
  phone?: string;
  created_at: string;
}

class UserService {
  async getAll(params?: {
    search?: string;
    status?: string;
    role?: string;
    tenant_id?: number;
  }) {
    const response = await api.get('/users/', { params });
    // Handle paginated response (DRF format) or direct array
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // DRF paginated response has 'results' key
    if (response.data && typeof response.data === 'object' && 'results' in response.data) {
      return response.data.results || [];
    }
    // Fallback to empty array
    return [];
  }

  async getById(id: number) {
    const response = await api.get(`/users/${id}/`);
    return response.data;
  }

  async create(data: Partial<User>) {
    const response = await api.post('/users/', data);
    return response.data;
  }

  async update(id: number, data: Partial<User>) {
    // Use PATCH for partial updates (like password only)
    const response = await api.patch(`/users/${id}/`, data);
    return response.data;
  }

  async delete(id: number) {
    const response = await api.delete(`/users/${id}/`);
    return response.data;
  }

  async activate(id: number) {
    const response = await api.post(`/users/${id}/activate/`);
    return response.data;
  }

  async deactivate(id: number) {
    const response = await api.post(`/users/${id}/deactivate/`);
    return response.data;
  }

  async suspend(id: number) {
    const response = await api.post(`/users/${id}/suspend/`);
    return response.data;
  }

  async sendPasswordReset(id: number) {
    const response = await api.post(`/users/${id}/send_password_reset/`);
    return response.data;
  }

  async impersonate(id: number) {
    const response = await api.post(`/users/${id}/impersonate/`);
    return response.data;
  }

  async stopImpersonating() {
    const response = await api.post(`/users/stop-impersonating/`);
    return response.data;
  }

  async getImpersonationStatus() {
    try {
      const response = await api.get(`/users/impersonation-status/`);
      return response.data;
    } catch (error: any) {
      // If endpoint doesn't exist (404), network error, or blocked, return default status
      const isExpectedError = error.response?.status === 404 || 
                             error.code === 'ERR_NETWORK' || 
                             error.code === 'ERR_BLOCKED_BY_CLIENT' ||
                             error.message?.includes('ERR_BLOCKED_BY_CLIENT') ||
                             error.message?.includes('blocked by client')
      if (isExpectedError) {
        return { is_impersonating: false, impersonating: false };
      }
      throw error;
    }
  }
}

export default new UserService();

