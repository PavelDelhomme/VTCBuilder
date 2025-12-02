import { render, screen } from '@testing-library/react'
import ImpersonationBanner from '@/components/admin/ImpersonationBanner'

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
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const authService = require('@/services/auth.service').default
    authService.isImpersonating = jest.fn(() => true)
    authService.getImpersonationInfo = jest.fn(() => ({
      original_user: { email: 'admin@test.com' },
      impersonated_user: { email: 'user@test.com' },
    }))

    render(<ImpersonationBanner />)
    // The banner should be visible when impersonating
    expect(screen.getByText(/impersonation/i)).toBeInTheDocument()
  })
})

