import settingsService from '@/services/settings.service'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}))

describe('SettingsService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getSettings', () => {
    it('should fetch settings', async () => {
      const mockSettings = {
        id: 1,
        site_name: 'VTCBuilder',
        site_url: 'http://localhost:9494',
        contact_email: 'contact@vtcbuilder.com',
      }
      ;(api.get as jest.Mock).mockResolvedValue({ data: mockSettings })

      const result = await settingsService.getSettings()

      expect(api.get).toHaveBeenCalledWith('/system-settings/', expect.objectContaining({
        validateStatus: expect.any(Function)
      }))
      expect(result).toEqual(mockSettings)
    })

    it('should return default settings on 404', async () => {
      const error = { response: { status: 404 } }
      ;(api.get as jest.Mock).mockRejectedValue(error)

      const result = await settingsService.getSettings()

      expect(result.site_name).toBe('VTCBuilder')
      expect(result.site_url).toBe('http://localhost:9494')
      expect(result.contact_email).toBe('contact@vtcbuilder.com')
    })
  })

  describe('updateSettings', () => {
    it('should update settings', async () => {
      const updates = { site_name: 'Updated Name' }
      const mockResponse = { data: { id: 1, ...updates } }
      ;(api.patch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await settingsService.updateSettings(updates)

      expect(api.patch).toHaveBeenCalledWith('/system-settings/', updates)
      expect(result).toEqual(mockResponse.data)
    })

    it('should create settings if update returns 404', async () => {
      const updates = { site_name: 'New Settings' }
      const patchError = { response: { status: 404 } }
      const mockResponse = { data: { id: 1, ...updates } }
      
      ;(api.patch as jest.Mock).mockRejectedValue(patchError)
      ;(api.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await settingsService.updateSettings(updates)

      expect(api.patch).toHaveBeenCalledWith('/system-settings/', updates)
      expect(api.post).toHaveBeenCalledWith('/system-settings/', updates)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('testEmail', () => {
    it('should test email sending', async () => {
      const mockResponse = {
        data: { status: 'success', message: 'Email sent' },
      }
      ;(api.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await settingsService.testEmail('test@example.com')

      expect(api.post).toHaveBeenCalledWith('/system-settings/test_email/', {
        email: 'test@example.com',
      })
      expect(result.status).toBe('success')
      expect(result.message).toBe('Email sent')
    })
  })
})

