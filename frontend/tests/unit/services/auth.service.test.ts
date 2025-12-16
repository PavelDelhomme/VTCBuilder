/**
 * Tests unitaires pour le service d'authentification
 */

import authService from '@/services/auth.service'
import api from '@/lib/api'

// Mock de l'API
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
    put: jest.fn(),
    defaults: {
      baseURL: 'http://localhost:9495/api',
    },
  },
}))

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        data: {
          tokens: {
            access: 'access-token',
            refresh: 'refresh-token',
          },
          user: { id: 1, email: 'test@example.com' },
        },
      }
      ;(api.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result).toEqual(mockResponse.data)
      expect(api.post).toHaveBeenCalledWith('/auth/login/', {
        email: 'test@example.com',
        password: 'password123',
      })
      expect(localStorage.getItem('token')).toBe('access-token')
    })

    it('should handle login errors', async () => {
      ;(api.post as jest.Mock).mockRejectedValue(new Error('Invalid credentials'))

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials')
    })
  })

  describe('logout', () => {
    it('should clear tokens and user data', async () => {
      localStorage.setItem('token', 'token')
      localStorage.setItem('refresh_token', 'refresh')
      localStorage.setItem('user', JSON.stringify({ id: 1 }))
      ;(api.post as jest.Mock).mockResolvedValue({ data: {} })

      await authService.logout()

      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })
})

