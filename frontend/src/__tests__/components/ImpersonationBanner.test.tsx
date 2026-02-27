import { render, screen } from '@testing-library/react'
import ImpersonationBanner from '@/components/admin/ImpersonationBanner'
import authService from '@/services/auth.service'
import userService from '@/services/user.service'

// Mock authService (component uses isAuthenticated)
jest.mock('@/services/auth.service', () => ({
  __esModule: true,
  default: {
    isAuthenticated: jest.fn(() => false),
  },
}))

// Mock userService for checkImpersonationStatus
jest.mock('@/services/user.service', () => ({
  __esModule: true,
  default: {
    getImpersonationStatus: jest.fn(() => Promise.resolve({ is_impersonating: false })),
    stopImpersonating: jest.fn(),
  },
}))

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), refresh: jest.fn() })),
}))

jest.mock('react-hot-toast', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

describe('ImpersonationBanner', () => {
  it('should not render when not impersonating', async () => {
    render(<ImpersonationBanner />)
    await new Promise((r) => setTimeout(r, 100))
    expect(screen.queryByText(/Impersonnification|impersonation/i)).not.toBeInTheDocument()
  })

  it('should render when impersonating', async () => {
    ;(authService.isAuthenticated as jest.Mock).mockReturnValue(true)
    ;(userService.getImpersonationStatus as jest.Mock).mockResolvedValue({
      is_impersonating: true,
      target_user: { email: 'user@test.com' },
      original_admin: { email: 'admin@test.com' },
    })

    render(<ImpersonationBanner />)
    await screen.findByText(/Arrêter/, {}, { timeout: 5000 })
    expect(screen.getByText(/user@test\.com/)).toBeInTheDocument()
  })
})

