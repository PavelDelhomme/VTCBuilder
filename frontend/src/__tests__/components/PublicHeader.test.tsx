import { render, screen, waitFor } from '@testing-library/react'
import PublicHeader from '@/components/public/PublicHeader'
import authService from '@/services/auth.service'

// Mock auth service
jest.mock('@/services/auth.service', () => ({
  __esModule: true,
  default: {
    isAuthenticated: jest.fn(() => false),
    isSuperAdmin: jest.fn(() => false),
  },
}))

describe('PublicHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render VTCBuilder logo', async () => {
    render(<PublicHeader />)

    await waitFor(() => {
      expect(screen.getByText('VTCBuilder')).toBeInTheDocument()
    })
  })

  it('should show login link when not authenticated', async () => {
    ;(authService.isAuthenticated as jest.Mock).mockReturnValue(false)

    render(<PublicHeader />)

    await waitFor(() => {
      expect(screen.getByText('Connexion')).toBeInTheDocument()
    })
  })

  it('should show dashboard link when authenticated as regular user', async () => {
    ;(authService.isAuthenticated as jest.Mock).mockReturnValue(true)
    ;(authService.isSuperAdmin as jest.Mock).mockReturnValue(false)

    render(<PublicHeader />)

    await waitFor(() => {
      expect(screen.getByText('Mon Dashboard')).toBeInTheDocument()
    })
  })

  it('should show admin link when authenticated as super admin', async () => {
    ;(authService.isAuthenticated as jest.Mock).mockReturnValue(true)
    ;(authService.isSuperAdmin as jest.Mock).mockReturnValue(true)

    render(<PublicHeader />)

    await waitFor(() => {
      expect(screen.getByText('Administration')).toBeInTheDocument()
    })
  })
})

