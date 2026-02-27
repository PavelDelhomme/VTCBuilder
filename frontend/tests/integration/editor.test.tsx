/**
 * Tests d'intégration pour l'éditeur
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import BlockEditor from '@/components/editor/BlockEditor'
import { mockBlocks } from '../fixtures/blocks'
import { ThemeProvider } from '@/contexts/ThemeContext'

jest.mock('@/contexts/FeaturesContext', () => ({
  useFeatures: () => ({
    features: null,
    loading: false,
    hasFeature: () => true,
    canUseBlockType: () => true,
    refreshFeatures: jest.fn(),
  }),
}))

jest.mock('@/hooks/useHistory', () => ({
  useHistory: (initialState: unknown) => ({
    state: initialState,
    set: jest.fn(),
    undo: jest.fn(),
    redo: jest.fn(),
    canUndo: false,
    canRedo: false,
    clear: jest.fn(),
  }),
}))

jest.mock('@/hooks/useBlockTracking', () => ({
  useBlockTracking: () => ({ trackBlockAction: jest.fn() }),
}))

jest.mock('@/services/blocks.service', () => ({
  __esModule: true,
  default: { getBlockTypes: jest.fn().mockResolvedValue([]) },
}))

jest.mock('@/services/auth.service', () => ({
  __esModule: true,
  default: { isSuperAdmin: jest.fn().mockReturnValue(false), getToken: jest.fn().mockReturnValue(null) },
}))

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

    expect(screen.getByDisplayValue('Test Heading')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test text content')).toBeInTheDocument()
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

    expect(screen.getByDisplayValue('Test Heading')).toBeInTheDocument()
  })
})

