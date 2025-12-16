import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import MobileHeader from '@/components/shared/MobileHeader'
import { ThemeProvider } from '@/contexts/ThemeContext'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('MobileHeader', () => {
  it('should render with title', () => {
    const onMenuClick = jest.fn()
    renderWithTheme(<MobileHeader title="Test Title" onMenuClick={onMenuClick} />)

    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('should render with subtitle', () => {
    const onMenuClick = jest.fn()
    renderWithTheme(
      <MobileHeader title="Test Title" subtitle="Test Subtitle" onMenuClick={onMenuClick} />
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
  })

  it('should call onMenuClick when menu button is clicked', () => {
    const onMenuClick = jest.fn()
    renderWithTheme(<MobileHeader title="Test Title" onMenuClick={onMenuClick} />)

    const menuButton = screen.getByLabelText(/menu/i)
    fireEvent.click(menuButton)

    expect(onMenuClick).toHaveBeenCalledTimes(1)
  })
})

