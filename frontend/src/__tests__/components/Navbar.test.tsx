import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import authService from '@/services/auth.service'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock auth service
jest.mock('@/services/auth.service', () => ({
  __esModule: true,
  default: {
    getStoredUser: jest.fn(() => ({ name: 'Test User', email: 'test@test.com' })),
    logout: jest.fn(),
  },
}))

const mockPush = jest.fn()
const mockRouter = {
  push: mockPush,
}

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('should render title', () => {
    renderWithTheme(<Navbar title="Test Title" />)

    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('should render subtitle', () => {
    renderWithTheme(<Navbar title="Test Title" subtitle="Test Subtitle" />)

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
  })

  it('should display user name', () => {
    renderWithTheme(<Navbar title="Test Title" />)

    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  it('should call logout and navigate when logout button is clicked', () => {
    const mockLogout = jest.fn()
    ;(authService.logout as jest.Mock).mockImplementation(mockLogout)

    renderWithTheme(<Navbar title="Test Title" />)

    const logoutButton = screen.getByText('Déconnexion')
    fireEvent.click(logoutButton)

    expect(mockLogout).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})

