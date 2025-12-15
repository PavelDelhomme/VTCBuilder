import api from '@/lib/api';

export interface PricingPlan {
  id: number;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  price_yearly?: number;
  currency: string;
  max_sites: number;
  max_users: number;
  max_storage_gb: number;
  features: string[];
  is_active: boolean;
  is_featured: boolean;
  order: number;
}

export interface Subscription {
  id: number;
  tenant: any;
  plan: PricingPlan;
  status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
  billing_cycle: 'monthly' | 'yearly';
  trial_start?: string;
  trial_end?: string;
  current_period_start: string;
  current_period_end: string;
  cancelled_at?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  // Detailed stats
  invoices_count?: number;
  unpaid_invoices_count?: number;
  total_invoiced?: number;
  total_paid?: number;
  unpaid_amount?: number;
  last_invoice_date?: string;
  last_payment_date?: string;
}

export interface Invoice {
  id: number;
  subscription: Subscription;
  tenant: any;
  invoice_number: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  issue_date: string;
  due_date: string;
  paid_at?: string;
  stripe_invoice_id?: string;
  pdf_url?: string;
}

export interface Payment {
  id: number;
  invoice: Invoice;
  tenant: any;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  method: 'card' | 'bank_transfer' | 'paypal' | 'other';
  stripe_payment_intent_id?: string;
  paid_at?: string;
  created_at?: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  method_type: 'card' | 'bank_transfer' | 'paypal' | 'stripe' | 'check' | 'cash' | 'other';
  description?: string;
  is_active: boolean;
  is_enabled: boolean;
  requires_validation: boolean;
  settings: Record<string, any>;
  icon?: string;
  order: number;
  fee_percentage: number;
  fee_fixed: number;
  min_amount?: number;
  max_amount?: number;
  created_at: string;
  updated_at: string;
}

class BillingService {
  // Pricing Plans
  async getPricingPlans() {
    try {
      const response = await api.get('/pricing-plans/', {
        validateStatus: (status) => status < 500 // Accepter 401, 404, etc. sans erreur
      });
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error: any) {
      // Retourner un tableau vide en cas d'erreur (401, 404, 500, CORS, etc.)
      // Ne pas logger les erreurs 401/404 (normal si non connecté)
      if (error.response?.status === 401 || error.response?.status === 404 || error.response?.status === 500 || error.code === 'ERR_FAILED' || error.silent) {
        return [];
      }
      throw error;
    }
  }

  async getPricingPlan(id: number) {
    const response = await api.get(`/pricing-plans/${id}/`);
    return response.data;
  }

  async createPricingPlan(data: Partial<PricingPlan>) {
    const response = await api.post('/pricing-plans/', data);
    return response.data;
  }

  async updatePricingPlan(id: number, data: Partial<PricingPlan>) {
    const response = await api.put(`/pricing-plans/${id}/`, data);
    return response.data;
  }

  async deletePricingPlan(id: number) {
    const response = await api.delete(`/pricing-plans/${id}/`);
    return response.data;
  }

  async movePlanUp(id: number) {
    const response = await api.post(`/pricing-plans/${id}/move_up/`);
    return response.data;
  }

  async movePlanDown(id: number) {
    const response = await api.post(`/pricing-plans/${id}/move_down/`);
    return response.data;
  }

  // Subscriptions
  async getSubscriptions(params?: {
    tenant_id?: string;
    status?: string;
    plan_id?: string;
    billing_cycle?: string;
    order_by?: string;
    ordering?: 'asc' | 'desc';
  }) {
    const response = await api.get('/subscriptions/', { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  }

  async getCurrentSubscription(): Promise<Subscription | null> {
    try {
      // Récupérer l'abonnement actif du tenant courant
      const subscriptions = await this.getSubscriptions({ status: 'active' });
      if (subscriptions.length > 0) {
        return subscriptions[0] as Subscription;
      }
      // Si pas d'abonnement actif, chercher un trial
      const trialSubscriptions = await this.getSubscriptions({ status: 'trial' });
      if (trialSubscriptions.length > 0) {
        return trialSubscriptions[0] as Subscription;
      }
      return null;
    } catch (error: any) {
      // Erreur silencieuse si pas d'abonnement
      if (error.response?.status === 401 || error.response?.status === 404 || error.silent) {
        return null;
      }
      throw error;
    }
  }

  async getSubscription(id: number) {
    const response = await api.get(`/subscriptions/${id}/`);
    return response.data;
  }

  async getSubscriptionDetails(id: number) {
    const response = await api.get(`/subscriptions/${id}/details/`);
    return response.data;
  }

  async getTenantsWithoutSubscription() {
    const response = await api.get('/subscriptions/tenants_without_subscription/');
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  }

  async createSubscription(data: Partial<Subscription>) {
    const response = await api.post('/subscriptions/', data);
    return response.data;
  }

  async cancelSubscription(id: number) {
    const response = await api.post(`/subscriptions/${id}/cancel/`);
    return response.data;
  }

  async reactivateSubscription(id: number) {
    const response = await api.post(`/subscriptions/${id}/reactivate/`);
    return response.data;
  }

  async activateSubscription(id: number) {
    const response = await api.post(`/subscriptions/${id}/activate/`);
    return response.data;
  }

  async suspendSubscription(id: number) {
    const response = await api.post(`/subscriptions/${id}/suspend/`);
    return response.data;
  }

  async updateSubscriptionPlan(id: number, planId: number) {
    const response = await api.post(`/subscriptions/${id}/update_plan/`, { plan_id: planId });
    return response.data;
  }

  async updateSubscriptionStatus(id: number, status: string) {
    const response = await api.post(`/subscriptions/${id}/update_status/`, { status });
    return response.data;
  }

  // Invoices
  async getInvoices(params?: { 
    tenant_id?: string; 
    status?: string; 
    date_from?: string; 
    date_to?: string;
    order_by?: string;
    ordering?: 'asc' | 'desc';
  }) {
    const response = await api.get('/invoices/', { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  }

  async getInvoice(id: number) {
    const response = await api.get(`/invoices/${id}/`);
    return response.data;
  }

  async markInvoicePaid(id: number) {
    const response = await api.post(`/invoices/${id}/mark_paid/`);
    return response.data;
  }

  async sendInvoiceReminder(id: number) {
    const response = await api.post(`/invoices/${id}/send_reminder/`);
    return response.data;
  }

  async generateInvoice(subscriptionId: number) {
    const response = await api.post(`/invoices/generate/`, { subscription_id: subscriptionId });
    return response.data;
  }

  async downloadInvoicePdf(id: number, templateId?: number) {
    // Get token for authentication
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const apiUrl = typeof window !== 'undefined' 
      ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9495')
      : 'http://localhost:9495';
    
    let url = `${apiUrl}/api/invoices/${id}/download_pdf/`;
    if (templateId) {
      url += `?template_id=${templateId}`;
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors du téléchargement');
    }
    
    return response.blob();
  }

  // Invoice Templates
  async getInvoiceTemplates() {
    const response = await api.get('/invoice-templates/');
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  }

  async getInvoiceTemplate(id: number) {
    const response = await api.get(`/invoice-templates/${id}/`);
    return response.data;
  }

  async createInvoiceTemplate(data: Partial<any>) {
    const response = await api.post('/invoice-templates/', data);
    return response.data;
  }

  async updateInvoiceTemplate(id: number, data: Partial<any>) {
    const response = await api.put(`/invoice-templates/${id}/`, data);
    return response.data;
  }

  async deleteInvoiceTemplate(id: number) {
    const response = await api.delete(`/invoice-templates/${id}/`);
    return response.data;
  }

  async setDefaultInvoiceTemplate(id: number) {
    const response = await api.post(`/invoice-templates/${id}/set_default/`);
    return response.data;
  }

  async previewInvoiceTemplate(id: number) {
    const response = await api.get(`/invoice-templates/${id}/preview/`);
    return response.data;
  }

  // Payments
  async getPayments(params?: {
    tenant_id?: string;
    status?: string;
    payment_method?: string;
    date_from?: string;
    date_to?: string;
    order_by?: string;
    ordering?: 'asc' | 'desc';
  }) {
    const response = await api.get('/payments/', { params });
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  }

  async getPayment(id: number) {
    const response = await api.get(`/payments/${id}/`);
    return response.data;
  }

  // Stats (super admin only)
  async getBillingStats() {
    const response = await api.get('/billing/stats/');
    return response.data;
  }

  // Unpaid items (super admin only)
  async getUnpaidItems(): Promise<any> {
    try {
      const response = await api.get('/billing/unpaid-items/');
      return response.data;
    } catch (error: any) {
      // Retourner une structure vide si l'endpoint n'est pas disponible
      if (error.response?.status === 404) {
        return {
          past_due_subscriptions: [],
          unpaid_invoices: [],
          overdue_invoices: [],
          stats: {
            past_due_count: 0,
            unpaid_invoices_count: 0,
            overdue_invoices_count: 0,
            total_unpaid_amount: 0,
            total_overdue_amount: 0,
          }
        };
      }
      throw error;
    }
  }

  // Payment Methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await api.get('/payment-methods/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error: any) {
      // Retourner un tableau vide si l'endpoint n'est pas disponible (404)
      // Ne pas logger l'erreur car c'est attendu si le backend n'est pas redémarré
      if (error.response?.status === 404 || error.code === 'ERR_FAILED') {
        // Optionnel: Logger seulement en mode développement
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Endpoint /api/payment-methods/ non disponible (404). Veuillez redémarrer le backend Django.');
        }
        return [];
      }
      // Logger seulement les autres erreurs
      console.error('Erreur lors de la récupération des méthodes de paiement:', error);
      throw error;
    }
  }

  async getPaymentMethod(id: number) {
    const response = await api.get(`/payment-methods/${id}/`);
    return response.data;
  }

  async createPaymentMethod(data: Partial<PaymentMethod>) {
    const response = await api.post('/payment-methods/', data);
    return response.data;
  }

  async updatePaymentMethod(id: number, data: Partial<PaymentMethod>) {
    const response = await api.put(`/payment-methods/${id}/`, data);
    return response.data;
  }

  async deletePaymentMethod(id: number) {
    const response = await api.delete(`/payment-methods/${id}/`);
    return response.data;
  }

  async togglePaymentMethodEnabled(id: number) {
    const response = await api.post(`/payment-methods/${id}/toggle_enabled/`);
    return response.data;
  }
}

export default new BillingService();

