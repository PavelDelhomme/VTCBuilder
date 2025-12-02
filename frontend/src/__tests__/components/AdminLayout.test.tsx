import { render, screen } from '@testing-library/react'
import AdminLayout from '@/components/admin/AdminLayout'

// Mock AdminSidebar
jest.mock('@/components/AdminSidebar', () => {
  return function MockAdminSidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
    return <div data-testid="admin-sidebar">AdminSidebar</div>
  }
})

describe('AdminLayout', () => {
  it('should render with title', () => {
    render(
      <AdminLayout title="Test Title">
        <div>Content</div>
      </AdminLayout>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should render with subtitle', () => {
    render(
      <AdminLayout title="Test Title" subtitle="Test Subtitle">
        <div>Content</div>
      </AdminLayout>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
  })

  it('should render header actions', () => {
    render(
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
    render(
      <AdminLayout title="Test Title">
        <div>Content</div>
      </AdminLayout>
    )

    expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument()
  })
})

