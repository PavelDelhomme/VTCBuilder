import { render, screen, fireEvent } from '@testing-library/react'
import TenantLayout from '@/components/tenant/TenantLayout'

// Mock Sidebar and ImpersonationBanner
jest.mock('@/components/tenant/Sidebar', () => {
  return function MockSidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    return <div data-testid="sidebar">Sidebar</div>
  }
})

jest.mock('@/components/ImpersonationBanner', () => {
  return function MockImpersonationBanner() {
    return <div data-testid="impersonation-banner">ImpersonationBanner</div>
  }
})

describe('TenantLayout', () => {
  it('should render with title', () => {
    render(
      <TenantLayout title="Test Title">
        <div>Content</div>
      </TenantLayout>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should render with subtitle', () => {
    render(
      <TenantLayout title="Test Title" subtitle="Test Subtitle">
        <div>Content</div>
      </TenantLayout>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
  })

  it('should render header actions', () => {
    render(
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
    render(
      <TenantLayout title="Test Title">
        <div>Content</div>
      </TenantLayout>
    )

    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })

  it('should render impersonation banner', () => {
    render(
      <TenantLayout title="Test Title">
        <div>Content</div>
      </TenantLayout>
    )

    expect(screen.getByTestId('impersonation-banner')).toBeInTheDocument()
  })
})

