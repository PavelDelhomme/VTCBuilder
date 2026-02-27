import authService from '@/services/auth.service'
import api from '@/lib/api'

// Mock the API module
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear localStorage
    localStorage.clear()
  })

  describe('login', () => {
    it('should login successfully and store tokens', async () => {
      const mockResponse = {
        data: {
          tokens: {
            access: 'access_token',
            refresh: 'refresh_token',
          },
          user: {
            id: 1,
            email: 'test@example.com',
            role: 'super-admin',
          },
        },
      }
      ;(api.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(api.post).toHaveBeenCalledWith('/auth/login/', {
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result).toEqual(mockResponse.data)
      expect(localStorage.getItem('token')).toBe('access_token')
      expect(localStorage.getItem('refresh_token')).toBe('refresh_token')
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

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockResponse = {
        data: {
          access: 'access_token',
          refresh: 'refresh_token',
          user: {
            id: 1,
            email: 'newuser@example.com',
          },
        },
      }
      ;(api.post as jest.Mock).mockResolvedValue(mockResponse)

      const result = await authService.register({
        email: 'newuser@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
      })

      expect(api.post).toHaveBeenCalledWith('/auth/register/', {
        email: 'newuser@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
      })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('logout', () => {
    it('should clear tokens and user data', async () => {
      localStorage.setItem('token', 'access_token')
      localStorage.setItem('refresh_token', 'refresh_token')
      localStorage.setItem('user', JSON.stringify({ id: 1 }))
      ;(api.post as jest.Mock).mockResolvedValue({})

      await authService.logout()

      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  describe('getStoredUser', () => {
    it('should return stored user from localStorage', () => {
      const user = { id: 1, email: 'test@example.com' }
      localStorage.setItem('user', JSON.stringify(user))

      const storedUser = authService.getStoredUser()

      expect(storedUser).toEqual(user)
    })

    it('should return null if no user stored', () => {
      expect(authService.getStoredUser()).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('should return true if token exists', () => {
      localStorage.setItem('token', 'access_token')
      expect(authService.isAuthenticated()).toBe(true)
    })

    it('should return false if no token', () => {
      expect(authService.isAuthenticated()).toBe(false)
    })
  })

  describe('isSuperAdmin', () => {
    it('should return true if user is super admin', () => {
      const user = { id: 1, role: 'super-admin' }
      localStorage.setItem('user', JSON.stringify(user))
      expect(authService.isSuperAdmin()).toBe(true)
    })

    it('should return false if user is not super admin', () => {
      const user = { id: 1, role: 'tenant-admin' }
      localStorage.setItem('user', JSON.stringify(user))
      expect(authService.isSuperAdmin()).toBe(false)
    })
  })

  describe('isTenantAdmin', () => {
    it('should return true if user is tenant admin', () => {
      const user = { id: 1, role: 'tenant-admin' }
      localStorage.setItem('user', JSON.stringify(user))
      expect(authService.isTenantAdmin()).toBe(true)
    })

    it('should return false if user is not tenant admin', () => {
      const user = { id: 1, role: 'operator' }
      localStorage.setItem('user', JSON.stringify(user))
      expect(authService.isTenantAdmin()).toBe(false)
    })
  })
})

