import { render, screen } from '@testing-library/react'
import PublicFooter from '@/components/public/PublicFooter'

describe('PublicFooter', () => {
  it('should render VTCBuilder branding', () => {
    render(<PublicFooter />)

    expect(screen.getByText('VTCBuilder')).toBeInTheDocument()
  })

  it('should render product links', () => {
    render(<PublicFooter />)

    expect(screen.getByText('Tarifs')).toBeInTheDocument()
    expect(screen.getByText('Fonctionnalités')).toBeInTheDocument()
    expect(screen.getByText('Templates')).toBeInTheDocument()
  })

  it('should render support links', () => {
    render(<PublicFooter />)

    expect(screen.getByText('Documentation')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
    expect(screen.getByText('FAQ')).toBeInTheDocument()
  })

  it('should render legal links', () => {
    render(<PublicFooter />)

    expect(screen.getByText('CGV')).toBeInTheDocument()
    expect(screen.getByText('Confidentialité')).toBeInTheDocument()
  })

  it('should render copyright', () => {
    render(<PublicFooter />)

    expect(screen.getByText(/2025 VTCBuilder/i)).toBeInTheDocument()
  })
})

