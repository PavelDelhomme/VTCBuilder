/**
 * Tests unitaires pour BlockPreview
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import BlockPreview from '@/components/editor/BlockPreview'
import { Block } from '@/components/editor/types'
import { ThemeProvider } from '@/contexts/ThemeContext'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('BlockPreview', () => {
  const mockBlock: Block = {
    id: 'test-1',
    type: 'heading',
    data: {
      text: 'Test Heading',
      level: 1,
    },
    styles: {},
    children: [],
  }

  const mockBlockTypes = []

  it('should render a heading block', () => {
    renderWithTheme(
      <BlockPreview
        blocks={[mockBlock]}
        blockTypes={mockBlockTypes}
        theme="light"
      />
    )
    expect(screen.getByText('Test Heading')).toBeInTheDocument()
  })

  it('should render multiple blocks', () => {
    const blocks: Block[] = [
      { ...mockBlock, id: '1', type: 'heading', data: { text: 'Heading 1' } },
      { ...mockBlock, id: '2', type: 'text', data: { text: 'Text content' } },
    ]

    renderWithTheme(
      <BlockPreview blocks={blocks} blockTypes={mockBlockTypes} theme="light" />
    )

    expect(screen.getByText('Heading 1')).toBeInTheDocument()
    expect(screen.getByText('Text content')).toBeInTheDocument()
  })

  it('should handle empty blocks array', () => {
    renderWithTheme(
      <BlockPreview blocks={[]} blockTypes={mockBlockTypes} theme="light" />
    )
    // Should render without errors
    expect(screen.queryByText('Test Heading')).not.toBeInTheDocument()
  })
})

