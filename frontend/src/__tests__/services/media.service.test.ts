import mediaService from '@/services/media.service'
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

describe('MediaService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all media files', async () => {
      const mockMedia = [
        { id: 1, name: 'image1.jpg', file_name: 'image1.jpg' },
        { id: 2, name: 'image2.png', file_name: 'image2.png' },
      ]
      ;(api.get as jest.Mock).mockResolvedValue({ data: mockMedia })

      const result = await mediaService.getAll()

      expect(api.get).toHaveBeenCalledWith('/media/', { params: undefined })
      expect(result).toEqual(mockMedia)
    })

    it('should handle paginated response', async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, name: 'image.jpg' }],
        },
      }
      ;(api.get as jest.Mock).mockResolvedValue(mockResponse)

      const result = await mediaService.getAll()

      expect(result).toEqual(mockResponse.data.results)
    })

    it('should pass query parameters', async () => {
      ;(api.get as jest.Mock).mockResolvedValue({ data: [] })

      await mediaService.getAll({ collection: 'images', search: 'test' })

      expect(api.get).toHaveBeenCalledWith('/media/', {
        params: { collection: 'images', search: 'test' },
      })
    })
  })

  describe('getById', () => {
    it('should fetch media by id', async () => {
      const mockMedia = { id: 1, name: 'test.jpg' }
      ;(api.get as jest.Mock).mockResolvedValue({ data: mockMedia })

      const result = await mediaService.getById(1)

      expect(api.get).toHaveBeenCalledWith('/media/1/')
      expect(result).toEqual(mockMedia)
    })
  })

  describe('upload', () => {
    it('should upload a file', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const metadata = { alt_text: 'Test image', collection: 'images' }
      
      ;(api.post as jest.Mock).mockResolvedValue({ data: { id: 1, name: 'test.jpg' } })

      const result = await mediaService.upload(file, metadata)

      expect(api.post).toHaveBeenCalledWith(
        '/media/upload/',
        expect.any(FormData)
      )
      expect(result.id).toBe(1)
    })
  })

  describe('update', () => {
    it('should update media', async () => {
      const updates = { alt_text: 'Updated alt text' }
      const mockResponse = { data: { id: 1, ...updates } }
      ;(api.patch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await mediaService.update(1, updates)

      expect(api.patch).toHaveBeenCalledWith('/media/1/', updates)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('delete', () => {
    it('should delete media', async () => {
      ;(api.delete as jest.Mock).mockResolvedValue({ data: {} })

      await mediaService.delete(1)

      expect(api.delete).toHaveBeenCalledWith('/media/1/')
    })
  })

  describe('getImages', () => {
    it('should fetch images only', async () => {
      const mockImages = [{ id: 1, name: 'image.jpg', collection: 'images' }]
      ;(api.get as jest.Mock).mockResolvedValue({ data: mockImages })

      const result = await mediaService.getImages()

      expect(api.get).toHaveBeenCalledWith('/media/images/')
      expect(result).toEqual(mockImages)
    })
  })
})

