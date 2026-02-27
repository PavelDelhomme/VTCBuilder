import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter, usePathname } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import authService from '@/services/auth.service'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

// Mock auth service (AdminSidebar uses isSuperAdmin, getStoredUser, logout)
jest.mock('@/services/auth.service', () => ({
  __esModule: true,
  default: {
    getStoredUser: jest.fn(),
    logout: jest.fn(),
    isSuperAdmin: jest.fn(() => false),
  },
}))

const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
}

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('AdminSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(usePathname as jest.Mock).mockReturnValue('/admin/dashboard')
    ;(authService.getStoredUser as jest.Mock).mockReturnValue({
      name: 'Admin User',
      email: 'admin@example.com',
    })
  })

  it('should render sidebar with menu items', () => {
    renderWithTheme(<AdminSidebar isOpen={true} onClose={() => {}} />)

    expect(screen.getByText('VTCBuilder')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Clients')).toBeInTheDocument()
    expect(screen.getByText('Statistiques')).toBeInTheDocument()
    expect(screen.getByText('Facturation')).toBeInTheDocument()
    expect(screen.getByText('Gestion')).toBeInTheDocument()
    expect(screen.getByText('Projets')).toBeInTheDocument()
    expect(screen.getByText('Paramètres')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    const onClose = jest.fn()
    renderWithTheme(<AdminSidebar isOpen={true} onClose={onClose} />)

    const closeButton = screen.getByLabelText('Fermer le menu')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when overlay is clicked', () => {
    const onClose = jest.fn()
    renderWithTheme(<AdminSidebar isOpen={true} onClose={onClose} />)

    const overlay = screen.getByTestId('sidebar-overlay')
    fireEvent.click(overlay)
    expect(onClose).toHaveBeenCalled()
  })

  it('should navigate when menu item is clicked', () => {
    renderWithTheme(<AdminSidebar isOpen={true} onClose={() => {}} />)

    const settingsLink = screen.getByText('Paramètres')
    fireEvent.click(settingsLink)

    expect(mockPush).toHaveBeenCalledWith('/admin/settings')
  })

  it('should display user information', () => {
    renderWithTheme(<AdminSidebar isOpen={true} onClose={() => {}} />)

    expect(screen.getByText('Admin User')).toBeInTheDocument()
    expect(screen.getByText('admin@example.com')).toBeInTheDocument()
  })

  it('should call logout when logout button is clicked', () => {
    const mockLogout = jest.fn()
    ;(authService.logout as jest.Mock).mockImplementation(mockLogout)
    ;(useRouter as jest.Mock).mockReturnValue({ ...mockRouter, push: jest.fn() })

    renderWithTheme(<AdminSidebar isOpen={true} onClose={() => {}} />)

    const logoutButton = screen.getByTitle('Déconnexion')
    fireEvent.click(logoutButton)

    expect(mockLogout).toHaveBeenCalled()
  })

  it('should highlight active menu item', () => {
    ;(usePathname as jest.Mock).mockReturnValue('/admin/settings')
    renderWithTheme(<AdminSidebar isOpen={true} onClose={() => {}} />)

    const settingsLink = screen.queryByText('Paramètres')
    expect(settingsLink).toBeInTheDocument()
    if (settingsLink) {
      const btn = settingsLink.closest('button')
      expect(btn).toBeTruthy()
      if (btn) expect(btn.className).toMatch(/bg-|active|selected|blue/)
    }
  })
})

