/**
 * Service for managing blocks (BlockType, BlockTemplate)
 */
import api from '@/lib/api';

export interface BlockType {
  id: number;
  name: string;
  label: string;
  icon: string;
  category: 'content' | 'layout' | 'media' | 'custom';
  description?: string;
  schema: Record<string, any>;
  default_styles: Record<string, any>;
  render_template?: Record<string, any>; // Template de rendu JSON pour le bloc
  call_to_action?: Record<string, any>;
  call_to_actions?: CallToAction[];
  call_to_action_ids?: number[];
  available_plans?: number[];
  plan_names?: string[];
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface BlockTemplate {
  id: number;
  tenant?: number;
  name: string;
  description?: string;
  block_type: number;
  block_data: Record<string, any>;
  block_styles: Record<string, any>;
  block_settings: Record<string, any>;
  is_global: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class BlocksService {
  /**
   * Get all active block types
   */
  async getBlockTypes(category?: string): Promise<BlockType[]> {
    try {
      const params = category ? { category } : {};
      const response = await api.get('/blocks/types/', { params });
      // Handle paginated response
      if (response.data && response.data.results) {
        return response.data.results;
      }
      // Handle direct array response
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      console.error('Error fetching block types:', error);
      // Don't throw, return empty array to prevent breaking the editor
      return [];
    }
  }

  /**
   * Get a specific block type
   */
  async getBlockType(id: number): Promise<BlockType | null> {
    try {
      const response = await api.get(`/blocks/types/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching block type ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a new block type (super admin only)
   */
  async createBlockType(data: Partial<BlockType>): Promise<BlockType | null> {
    try {
      const response = await api.post('/blocks/types/', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating block type:', error);
      throw error;
    }
  }

  /**
   * Update a block type (super admin only)
   */
  async updateBlockType(id: number, data: Partial<BlockType>): Promise<BlockType | null> {
    try {
      const response = await api.patch(`/blocks/types/${id}/`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating block type ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a block type (super admin only)
   */
  async deleteBlockType(id: number): Promise<boolean> {
    try {
      await api.delete(`/blocks/types/${id}/`);
      return true;
    } catch (error: any) {
      console.error(`Error deleting block type ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all block templates
   */
  async getBlockTemplates(): Promise<BlockTemplate[]> {
    try {
      const response = await api.get('/blocks/templates/');
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching block templates:', error);
      return [];
    }
  }

  /**
   * Get a specific block template
   */
  async getBlockTemplate(id: number): Promise<BlockTemplate | null> {
    try {
      const response = await api.get(`/blocks/templates/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching block template ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a new block template
   */
  async createBlockTemplate(data: Partial<BlockTemplate>): Promise<BlockTemplate | null> {
    try {
      const response = await api.post('/blocks/templates/', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating block template:', error);
      throw error;
    }
  }

  /**
   * Update a block template
   */
  async updateBlockTemplate(id: number, data: Partial<BlockTemplate>): Promise<BlockTemplate | null> {
    try {
      const response = await api.patch(`/blocks/templates/${id}/`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating block template ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a block template
   */
  async deleteBlockTemplate(id: number): Promise<boolean> {
    try {
      await api.delete(`/blocks/templates/${id}/`);
      return true;
    } catch (error: any) {
      console.error(`Error deleting block template ${id}:`, error);
      return false;
    }
  }
}

export default new BlocksService();

// Call-to-Action Service
export interface CallToAction {
  id: number
  name: string
  label: string
  description?: string
  type: 'button' | 'link' | 'banner' | 'popup' | 'inline' | 'sticky' | 'floating'
  default_text: string
  default_url: string
  styles: Record<string, any>
  config: Record<string, any>
  is_active: boolean
  is_global: boolean
  created_at: string
  updated_at: string
}

class CallToActionService {
  async getAll(): Promise<CallToAction[]> {
    try {
      const response = await api.get('/blocks/call-to-actions/')
      return Array.isArray(response.data) ? response.data : response.data.results || []
    } catch (error: any) {
      console.error('Error fetching call-to-actions:', error)
      return []
    }
  }

  async getById(id: number): Promise<CallToAction | null> {
    try {
      const response = await api.get(`/blocks/call-to-actions/${id}/`)
      return response.data
    } catch (error: any) {
      console.error(`Error fetching call-to-action ${id}:`, error)
      return null
    }
  }

  async create(data: Partial<CallToAction>): Promise<CallToAction | null> {
    try {
      const response = await api.post('/blocks/call-to-actions/', data)
      return response.data
    } catch (error: any) {
      console.error('Error creating call-to-action:', error)
      throw error
    }
  }

  async update(id: number, data: Partial<CallToAction>): Promise<CallToAction | null> {
    try {
      const response = await api.patch(`/blocks/call-to-actions/${id}/`, data)
      return response.data
    } catch (error: any) {
      console.error(`Error updating call-to-action ${id}:`, error)
      throw error
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await api.delete(`/blocks/call-to-actions/${id}/`)
      return true
    } catch (error: any) {
      console.error(`Error deleting call-to-action ${id}:`, error)
      throw error
    }
  }
}

export const callToActionService = new CallToActionService()

