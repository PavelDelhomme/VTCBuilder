import pageService from '@/services/page.service'
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

describe('PageService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all pages', async () => {
      const mockPages = [
        { id: 1, title: 'Page 1', slug: 'page-1' },
        { id: 2, title: 'Page 2', slug: 'page-2' },
      ]
      ;(api.get as jest.Mock).mockResolvedValue({ data: mockPages })

      const result = await pageService.getAll()

      expect(api.get).toHaveBeenCalledWith('/pages/', { params: undefined })
      expect(result).toEqual(mockPages)
    })

    it('should handle paginated response', async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, title: 'Page 1' }],
          count: 1,
        },
      }
      ;(api.get as jest.Mock).mockResolvedValue(mockResponse)

      const result = await pageService.getAll()

      expect(result).toEqual(mockResponse.data.results)
    })

    it('should pass query parameters', async () => {
      ;(api.get as jest.Mock).mockResolvedValue({ data: [] })

      await pageService.getAll({ status: 'published', tenant_id: 1 })

      expect(api.get).toHaveBeenCalledWith('/pages/', {
        params: { status: 'published', tenant_id: 1 },
      })
    })
  })

  describe('getById', () => {
    it('should fetch page by id', async () => {
      const mockPage = { id: 1, title: 'Test Page' }
      ;(api.get as jest.Mock).mockResolvedValue({ data: mockPage })

      const result = await pageService.getById(1)

      expect(api.get).toHaveBeenCalledWith('/pages/1/', { params: {} })
      expect(result).toEqual(mockPage)
    })
  })

  describe('create', () => {
    it('should create a new page', async () => {
      const newPage = { title: 'New Page', slug: 'new-page', content: 'Content' }
      const mockResponse = { data: { id: 1, ...newPage } }
      ;(api.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await pageService.create(newPage)

      expect(api.post).toHaveBeenCalledWith('/pages/', newPage)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('update', () => {
    it('should update page', async () => {
      const updates = { title: 'Updated Page' }
      const mockResponse = { data: { id: 1, ...updates } }
      ;(api.patch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await pageService.update(1, updates)

      expect(api.patch).toHaveBeenCalledWith('/pages/1/', updates)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('delete', () => {
    it('should delete page', async () => {
      ;(api.delete as jest.Mock).mockResolvedValue({ data: {} })

      await pageService.delete(1)

      expect(api.delete).toHaveBeenCalledWith('/pages/1/')
    })
  })

  describe('publish', () => {
    it('should publish page', async () => {
      ;(api.post as jest.Mock).mockResolvedValue({ data: { status: 'published' } })

      const result = await pageService.publish(1)

      expect(api.post).toHaveBeenCalledWith('/pages/1/publish/')
      expect(result.status).toBe('published')
    })
  })

  describe('duplicate', () => {
    it('should duplicate page', async () => {
      const mockDuplicated = { id: 2, title: 'Page 1 (Copy)' }
      ;(api.post as jest.Mock).mockResolvedValue({ data: mockDuplicated })

      const result = await pageService.duplicate(1)

      expect(api.post).toHaveBeenCalledWith('/pages/1/duplicate/')
      expect(result).toEqual(mockDuplicated)
    })
  })
})

