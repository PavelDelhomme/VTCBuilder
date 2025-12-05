import api from '@/lib/api';
import axios from 'axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  company_name?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  tenant_id?: number;
  roles: any[];
  permissions: any[];
}

class AuthService {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login/', credentials);
    if (response.data.tokens?.access) {
      localStorage.setItem('token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async register(data: RegisterData) {
    const response = await api.post('/auth/register/', data);
    if (response.data.tokens?.access) {
      localStorage.setItem('token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async logout() {
    try {
      await api.post('/auth/logout/');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me/');
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  }

  async updateProfile(data: Partial<User>) {
    const response = await api.put('/auth/me/', data);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  }

  async updatePassword(data: { current_password: string; password: string; password_confirmation: string }) {
    const response = await api.put('/auth/password/', data);
    return response.data;
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        return false;
      }

      // Utiliser une instance axios sans intercepteur pour éviter les boucles infinies
      const axiosInstance = axios.create({
        baseURL: api.defaults.baseURL,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await axiosInstance.post('/auth/refresh/', {
        refresh: refreshToken,
      });

      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        if (response.data.refresh) {
          localStorage.setItem('refresh_token', response.data.refresh);
        }
        return true;
      }
      return false;
    } catch (error) {
      // Refresh token invalide ou expiré
      return false;
    }
  }

  async quickReconnect(password: string): Promise<boolean> {
    try {
      const storedUser = this.getStoredUser();
      if (!storedUser?.email) {
        throw new Error('Aucun utilisateur trouvé en mémoire');
      }

      // Utiliser une instance axios sans intercepteur pour éviter les boucles infinies
      const axiosInstance = axios.create({
        baseURL: api.defaults.baseURL,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await axiosInstance.post('/auth/quick-reconnect/', {
        email: storedUser.email,
        password: password,
      });

      if (response.data.tokens?.access) {
        localStorage.setItem('token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return true;
      }
      return false;
    } catch (error: any) {
      throw error;
    }
  }

  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null; // SSR safety
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null; // SSR safety
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false; // SSR safety
    return !!this.getToken();
  }

  isSuperAdmin(): boolean {
    if (typeof window === 'undefined') return false; // SSR safety
    const user = this.getStoredUser();
    if (!user || !user.roles) return false;
    return user.roles.some((role: any) => {
      const roleValue = typeof role === 'string' ? role : role.name || role.role;
      return roleValue === 'super-admin';
    }) || (user as any).role === 'super-admin';
  }

  isTenantAdmin(): boolean {
    if (typeof window === 'undefined') return false; // SSR safety
    const user = this.getStoredUser();
    if (!user || !user.roles) return false;
    return user.roles.some((role: any) => {
      const roleValue = typeof role === 'string' ? role : role.name || role.role;
      return roleValue === 'tenant-admin';
    }) || (user as any).role === 'tenant-admin';
  }
}

export default new AuthService();

