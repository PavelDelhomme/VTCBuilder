import { render, screen } from '@testing-library/react'
import React from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import TenantLayout from '@/components/tenant/TenantLayout'

// Mock Sidebar and ImpersonationBanner
jest.mock('@/components/tenant/Sidebar', () => {
  return function MockSidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    return <div data-testid="sidebar">Sidebar</div>
  }
})

jest.mock('@/components/admin/ImpersonationBanner', () => ({
  __esModule: true,
  default: function MockImpersonationBanner() {
    return <div data-testid="impersonation-banner">ImpersonationBanner</div>
  },
}))

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>)

describe('TenantLayout', () => {
  it('should render with title', () => {
    renderWithTheme(
      <TenantLayout title="Test Title">
        <div>Content</div>
      </TenantLayout>
    )

    expect(screen.getAllByText('Test Title').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should render with subtitle', () => {
    renderWithTheme(
      <TenantLayout title="Test Title" subtitle="Test Subtitle">
        <div>Content</div>
      </TenantLayout>
    )

    expect(screen.getAllByText('Test Title').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Test Subtitle').length).toBeGreaterThanOrEqual(1)
  })

  it('should render header actions', () => {
    renderWithTheme(
      <TenantLayout
        title="Test Title"
        headerActions={<button>Action Button</button>}
      >
        <div>Content</div>
      </TenantLayout>
    )

    expect(screen.getByText('Action Button')).toBeInTheDocument()
  })

  it('should render sidebar', () => {
    renderWithTheme(
      <TenantLayout title="Test Title">
        <div>Content</div>
      </TenantLayout>
    )

    expect(screen.getAllByTestId('sidebar').length).toBeGreaterThanOrEqual(1)
  })

  it('should render impersonation banner', () => {
    renderWithTheme(
      <TenantLayout title="Test Title">
        <div>Content</div>
      </TenantLayout>
    )

    expect(screen.getByTestId('impersonation-banner')).toBeInTheDocument()
  })
})

