/**
 * Tests d'intégration pour l'éditeur
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import BlockEditor from '@/components/editor/BlockEditor'
import { mockBlocks } from '../fixtures/blocks'
import { ThemeProvider } from '@/contexts/ThemeContext'

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('BlockEditor Integration', () => {
  it('should render editor with blocks', () => {
    const onBlocksChange = jest.fn()
    
    renderWithTheme(
      <BlockEditor
        blocks={mockBlocks}
        onChange={onBlocksChange}
        availableBlockTypes={[]}
      />
    )

    // Vérifier que les blocs sont rendus
    expect(screen.getByText('Test Heading')).toBeInTheDocument()
    expect(screen.getByText('Test text content')).toBeInTheDocument()
  })

  it('should handle block selection', () => {
    const onBlockSelect = jest.fn()
    
    renderWithTheme(
      <BlockEditor
        blocks={mockBlocks}
        onChange={jest.fn()}
        onBlockSelect={onBlockSelect}
        availableBlockTypes={[]}
      />
    )

    // Simuler la sélection d'un bloc
    // (nécessite une implémentation spécifique selon votre composant)
  })
})

