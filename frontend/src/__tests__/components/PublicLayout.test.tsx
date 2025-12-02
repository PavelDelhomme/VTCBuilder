import { render, screen } from '@testing-library/react'
import PublicLayout from '@/components/public/PublicLayout'

// Mock PublicHeader and PublicFooter
jest.mock('@/components/PublicHeader', () => {
  return function MockPublicHeader() {
    return <header data-testid="public-header">PublicHeader</header>
  }
})

jest.mock('@/components/PublicFooter', () => {
  return function MockPublicFooter() {
    return <footer data-testid="public-footer">PublicFooter</footer>
  }
})

describe('PublicLayout', () => {
  it('should render children', () => {
    render(
      <PublicLayout>
        <div>Test Content</div>
      </PublicLayout>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should render with title', () => {
    render(
      <PublicLayout title="Page Title">
        <div>Content</div>
      </PublicLayout>
    )

    expect(screen.getByText('Page Title')).toBeInTheDocument()
  })

  it('should render with description', () => {
    render(
      <PublicLayout title="Page Title" description="Page description">
        <div>Content</div>
      </PublicLayout>
    )

    expect(screen.getByText('Page description')).toBeInTheDocument()
  })

  it('should render PublicHeader', () => {
    render(
      <PublicLayout>
        <div>Content</div>
      </PublicLayout>
    )

    expect(screen.getByTestId('public-header')).toBeInTheDocument()
  })

  it('should render PublicFooter', () => {
    render(
      <PublicLayout>
        <div>Content</div>
      </PublicLayout>
    )

    expect(screen.getByTestId('public-footer')).toBeInTheDocument()
  })
})

