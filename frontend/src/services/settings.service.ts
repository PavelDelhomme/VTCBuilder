import api from '@/lib/api';

export interface SystemSettings {
  id: number;
  site_name: string;
  site_url: string;
  contact_email: string;
  support_email: string;
  email_host: string;
  email_port: number;
  email_use_tls: boolean;
  email_use_ssl: boolean;
  email_host_user: string;
  email_host_password: string;
  email_from: string;
  default_trial_days: number;
  enable_trial: boolean;
  password_min_length: number;
  require_email_verification: boolean;
  session_timeout_minutes: number;
  max_login_attempts: number;
  lockout_duration_minutes: number;
  default_currency: string;
  tax_rate: number;
  invoice_prefix: string;
  payment_terms_days: number;
  max_file_size_mb: number;
  allowed_file_types: string[];
  enable_email_notifications: boolean;
  notify_on_new_tenant: boolean;
  notify_on_payment_failed: boolean;
  notify_on_subscription_expiring: boolean;
  maintenance_mode: boolean;
  maintenance_mode_type?: 'public_only' | 'platform_except_admin';
  maintenance_message: string;
  public_homepage_blocks?: any[];
  public_homepage_status?: 'draft' | 'published';
  public_homepage_meta_title?: string;
  public_homepage_meta_description?: string;
  stripe_enabled?: boolean;
  stripe_public_key?: string;
  stripe_secret_key?: string;
  stripe_webhook_secret?: string;
  stripe_mode?: 'test' | 'live';
  extra_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

class SettingsService {
  async getSettings(): Promise<SystemSettings> {
    try {
      // For singleton pattern, list endpoint returns the single instance
      const response = await api.get('/system-settings/', {
        validateStatus: (status) => status < 500 // Accepter 401, 404, etc. sans erreur
      });
      return response.data;
    } catch (error: any) {
      // Si 401 ou 404, retourner des settings par défaut
      if (error.response?.status === 401 || error.response?.status === 404) {
        return {
          id: 1,
          site_name: 'VTCBuilder',
          site_url: 'http://localhost:9494',
          contact_email: 'contact@vtcbuilder.com',
          support_email: 'support@vtcbuilder.com',
          email_host: '',
          email_port: 587,
          email_use_tls: true,
          email_use_ssl: false,
          email_host_user: '',
          email_host_password: '',
          email_from: 'noreply@vtcbuilder.com',
          default_trial_days: 14,
          enable_trial: true,
          password_min_length: 8,
          require_email_verification: false,
          session_timeout_minutes: 120,
          max_login_attempts: 5,
          lockout_duration_minutes: 30,
          default_currency: 'EUR',
          tax_rate: 20,
          invoice_prefix: 'INV-',
          payment_terms_days: 30,
          max_file_size_mb: 10,
          allowed_file_types: [],
          enable_email_notifications: true,
          notify_on_new_tenant: true,
          notify_on_payment_failed: true,
          notify_on_subscription_expiring: true,
          maintenance_mode: false,
          maintenance_mode_type: 'public_only',
          maintenance_message: 'Le site est en maintenance.',
          extra_settings: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as SystemSettings;
      }
      throw error;
    }
  }

  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    try {
      // Singleton endpoint - no ID needed, use PATCH on the base endpoint
      const response = await api.patch('/system-settings/', settings);
      return response.data;
    } catch (error: any) {
      // If update fails with 404, try to create with POST
      if (error.response?.status === 404) {
        try {
          const response = await api.post('/system-settings/', settings);
          return response.data;
        } catch (createError: any) {
          console.error('Error creating system settings:', createError)
          throw createError;
        }
      }
      console.error('Error updating system settings:', error)
      throw error;
    }
  }

  async testEmail(recipientEmail: string): Promise<{ status: string; message: string }> {
    const response = await api.post('/system-settings/test_email/', { email: recipientEmail });
    return response.data;
  }

  async testStripe(secretKey?: string): Promise<{ status: string; message: string; account?: any; error?: string }> {
    const response = await api.post('/system-settings/test_stripe/', { secret_key: secretKey });
    return response.data;
  }
}

export default new SettingsService();

