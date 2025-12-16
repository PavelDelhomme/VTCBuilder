import templateService from '@/services/template.service'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('TemplateService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all templates', async () => {
      const mockTemplates = [
        { id: 1, name: 'Template 1', slug: 'template-1' },
        { id: 2, name: 'Template 2', slug: 'template-2' },
      ]
      ;(api.get as jest.Mock).mockResolvedValue({ data: mockTemplates })

      const result = await templateService.getAll()

      expect(api.get).toHaveBeenCalledWith('/templates/', { params: undefined })
      expect(result).toEqual(mockTemplates)
    })

    it('should handle paginated response', async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, name: 'Template 1' }],
        },
      }
      ;(api.get as jest.Mock).mockResolvedValue(mockResponse)

      const result = await templateService.getAll()

      expect(result).toEqual(mockResponse.data.results)
    })

    it('should return empty array on 404/500 errors', async () => {
      const error = { response: { status: 404 } }
      ;(api.get as jest.Mock).mockRejectedValue(error)

      const result = await templateService.getAll()

      expect(result).toEqual([])
    })

    it('should pass query parameters', async () => {
      ;(api.get as jest.Mock).mockResolvedValue({ data: [] })

      await templateService.getAll({ category: 'vtc', is_premium: false })

      expect(api.get).toHaveBeenCalledWith('/templates/', {
        params: { category: 'vtc', is_premium: false },
      })
    })
  })

  describe('getById', () => {
    it('should fetch template by id', async () => {
      const mockTemplate = { id: 1, name: 'Test Template' }
      ;(api.get as jest.Mock).mockResolvedValue({ data: mockTemplate })

      const result = await templateService.getById(1)

      expect(api.get).toHaveBeenCalledWith('/templates/1/')
      expect(result).toEqual(mockTemplate)
    })
  })

  describe('create', () => {
    it('should create a new template', async () => {
      const newTemplate = { name: 'New Template', slug: 'new-template' }
      const mockResponse = { data: { id: 1, ...newTemplate } }
      ;(api.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await templateService.create(newTemplate)

      expect(api.post).toHaveBeenCalledWith('/templates/', newTemplate, {})
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('update', () => {
    it('should update template', async () => {
      const updates = { name: 'Updated Template' }
      const mockResponse = { data: { id: 1, ...updates } }
      ;(api.patch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await templateService.update(1, updates)

      expect(api.patch).toHaveBeenCalledWith('/templates/1/', updates, {})
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('delete', () => {
    it('should delete template', async () => {
      ;(api.delete as jest.Mock).mockResolvedValue({ data: {} })

      await templateService.delete(1)

      expect(api.delete).toHaveBeenCalledWith('/templates/1/')
    })
  })

  describe('useTemplate', () => {
    it('should use template', async () => {
      ;(api.post as jest.Mock).mockResolvedValue({ data: { success: true } })

      const result = await templateService.useTemplate(1)

      expect(api.post).toHaveBeenCalledWith('/templates/1/use_template/')
      expect(result.success).toBe(true)
    })
  })

  describe('getFree', () => {
    it('should fetch free templates', async () => {
      const mockTemplates = [{ id: 1, name: 'Free Template', is_premium: false }]
      ;(api.get as jest.Mock).mockResolvedValue({ data: mockTemplates })

      const result = await templateService.getFree()

      expect(api.get).toHaveBeenCalledWith('/templates/free/')
      expect(result).toEqual(mockTemplates)
    })
  })

  describe('uploadHtmlFile', () => {
    it('should upload HTML file', async () => {
      const file = new File(['<html></html>'], 'test.html', { type: 'text/html' })
      const formData = new FormData()
      formData.append('html_file', file)
      
      ;(api.post as jest.Mock).mockResolvedValue({ data: { success: true } })

      const result = await templateService.uploadHtmlFile(file)

      expect(api.post).toHaveBeenCalledWith(
        '/templates/upload_html/',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      expect(result.success).toBe(true)
    })
  })

  describe('uploadCssFile', () => {
    it('should upload CSS file', async () => {
      const file = new File(['body {}'], 'test.css', { type: 'text/css' })
      
      ;(api.post as jest.Mock).mockResolvedValue({ data: { success: true } })

      const result = await templateService.uploadCssFile(file)

      expect(api.post).toHaveBeenCalledWith(
        '/templates/upload_css/',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      expect(result.success).toBe(true)
    })
  })
})

