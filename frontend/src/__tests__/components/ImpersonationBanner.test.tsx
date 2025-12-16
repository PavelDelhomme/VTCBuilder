import { render, screen } from '@testing-library/react'
import ImpersonationBanner from '@/components/admin/ImpersonationBanner'
import authService from '@/services/auth.service'

// Mock authService
jest.mock('@/services/auth.service', () => ({
  __esModule: true,
  default: {
    isImpersonating: jest.fn(() => false),
    getImpersonationInfo: jest.fn(() => null),
  },
}))

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))

describe('ImpersonationBanner', () => {
  it('should not render when not impersonating', () => {
    render(<ImpersonationBanner />)
    expect(screen.queryByText(/impersonation/i)).not.toBeInTheDocument()
  })

  it('should render when impersonating', () => {
    ;(authService.isImpersonating as jest.Mock).mockReturnValue(true)
    ;(authService.getImpersonationInfo as jest.Mock).mockReturnValue({
      original_user: { email: 'admin@test.com' },
      impersonated_user: { email: 'user@test.com' },
    })

    render(<ImpersonationBanner />)
    // The banner should be visible when impersonating
    expect(screen.getByText(/impersonation/i)).toBeInTheDocument()
  })
})

