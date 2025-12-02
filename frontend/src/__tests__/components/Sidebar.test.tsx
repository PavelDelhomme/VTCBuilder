import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '@/components/tenant/Sidebar'
import authService from '@/services/auth.service'
import tenantService from '@/services/tenant.service'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

// Mock services
jest.mock('@/services/auth.service', () => ({
  __esModule: true,
  default: {
    getStoredUser: jest.fn(() => ({ id: 1, email: 'test@test.com', tenant_id: 1 })),
    logout: jest.fn(),
  },
}))

jest.mock('@/services/tenant.service', () => ({
  __esModule: true,
  default: {
    getById: jest.fn(),
  },
}))

jest.mock('@/lib/tenant-features', () => ({
  isFeatureEnabled: jest.fn((featureId, enabledFeatures) => {
    return enabledFeatures.includes(featureId)
  }),
}))

const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
}

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(usePathname as jest.Mock).mockReturnValue('/dashboard')
    ;(tenantService.getById as jest.Mock).mockResolvedValue({
      settings: { enabled_features: ['pages', 'services'] },
    })
  })

  it('should render sidebar with menu items', async () => {
    render(<Sidebar isOpen={true} onClose={() => {}} />)

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  it('should call onClose when close button is clicked', () => {
    const onClose = jest.fn()
    render(<Sidebar isOpen={true} onClose={onClose} />)

    const closeButton = screen.getByLabelText('Fermer le menu')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should navigate when menu item is clicked', async () => {
    render(<Sidebar isOpen={true} onClose={() => {}} />)

    await waitFor(() => {
      const dashboardLink = screen.getByText('Dashboard')
      fireEvent.click(dashboardLink)
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should display user information', () => {
    render(<Sidebar isOpen={true} onClose={() => {}} />)
    expect(screen.getByText('test@test.com')).toBeInTheDocument()
  })

  it('should call logout when logout button is clicked', () => {
    const mockLogout = jest.fn()
    ;(authService.logout as jest.Mock).mockImplementation(mockLogout)

    render(<Sidebar isOpen={true} onClose={() => {}} />)

    // Find logout button by title
    const logoutButton = screen.getByTitle('Déconnexion')
    fireEvent.click(logoutButton)

    expect(mockLogout).toHaveBeenCalled()
  })
})

