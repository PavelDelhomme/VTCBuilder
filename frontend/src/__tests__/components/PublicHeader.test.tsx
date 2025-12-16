import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import PublicHeader from '@/components/public/PublicHeader'
import authService from '@/services/auth.service'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Mock auth service
jest.mock('@/services/auth.service', () => ({
  __esModule: true,
  default: {
    isAuthenticated: jest.fn(() => false),
    isSuperAdmin: jest.fn(() => false),
  },
}))

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('PublicHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render VTCBuilder logo', async () => {
    renderWithTheme(<PublicHeader />)

    await waitFor(() => {
      expect(screen.getByText('VTCBuilder')).toBeInTheDocument()
    })
  })

  it('should show login link when not authenticated', async () => {
    ;(authService.isAuthenticated as jest.Mock).mockReturnValue(false)

    renderWithTheme(<PublicHeader />)

    await waitFor(() => {
      expect(screen.getByText('Connexion')).toBeInTheDocument()
    })
  })

  it('should show dashboard link when authenticated as regular user', async () => {
    ;(authService.isAuthenticated as jest.Mock).mockReturnValue(true)
    ;(authService.isSuperAdmin as jest.Mock).mockReturnValue(false)

    renderWithTheme(<PublicHeader />)

    await waitFor(() => {
      expect(screen.getByText('Mon Dashboard')).toBeInTheDocument()
    })
  })

  it('should show admin link when authenticated as super admin', async () => {
    ;(authService.isAuthenticated as jest.Mock).mockReturnValue(true)
    ;(authService.isSuperAdmin as jest.Mock).mockReturnValue(true)

    renderWithTheme(<PublicHeader />)

    await waitFor(() => {
      expect(screen.getByText('Administration')).toBeInTheDocument()
    })
  })
})

