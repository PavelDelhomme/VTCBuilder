import { render, screen } from '@testing-library/react'
import React from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import AdminLayout from '@/components/admin/AdminLayout'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn(), refresh: jest.fn() })),
  usePathname: jest.fn(() => '/admin/dashboard'),
}))

// Mock AdminSidebar (relative path so it matches AdminLayout's './AdminSidebar' resolve)
jest.mock('../../components/admin/AdminSidebar', () => ({
  __esModule: true,
  default: function MockAdminSidebar() {
    return <div data-testid="admin-sidebar">AdminSidebar</div>
  },
}))

jest.mock('../../components/admin/ImpersonationBanner', () => ({
  __esModule: true,
  default: function MockImpersonationBanner() {
    return <div data-testid="impersonation-banner">ImpersonationBanner</div>
  },
}))

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>)

describe('AdminLayout', () => {
  it('should render with title', () => {
    renderWithTheme(
      <AdminLayout title="Test Title">
        <div>Content</div>
      </AdminLayout>
    )

    expect(screen.getAllByText('Test Title').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should render with subtitle', () => {
    renderWithTheme(
      <AdminLayout title="Test Title" subtitle="Test Subtitle">
        <div>Content</div>
      </AdminLayout>
    )

    expect(screen.getAllByText('Test Title').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Test Subtitle').length).toBeGreaterThanOrEqual(1)
  })

  it('should render header actions', () => {
    renderWithTheme(
      <AdminLayout
        title="Test Title"
        headerActions={<button>Action Button</button>}
      >
        <div>Content</div>
      </AdminLayout>
    )

    expect(screen.getByText('Action Button')).toBeInTheDocument()
  })

  it('should render sidebar', () => {
    renderWithTheme(
      <AdminLayout title="Test Title">
        <div>Content</div>
      </AdminLayout>
    )

    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument()
  })
})

