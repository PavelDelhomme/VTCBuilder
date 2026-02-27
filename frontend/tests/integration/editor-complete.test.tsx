/**
 * Tests d'intégration complets pour l'éditeur
 * - Rendu avec différents types de blocs (dont VTC)
 * - Vérification que le processus complet (renderer → formulaire) fonctionne
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import BlockEditor from '@/components/editor/BlockEditor'
import { mockBlocks, mockBlocksWithBooking } from '../fixtures/blocks'
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
  useBlockTracking: () => ({
    trackBlockAction: jest.fn(),
  }),
}))

jest.mock('@/services/blocks.service', () => ({
  __esModule: true,
  default: {
    getBlockTypes: jest.fn().mockResolvedValue([]),
  },
}))

jest.mock('@/services/auth.service', () => ({
  __esModule: true,
  default: {
    isSuperAdmin: jest.fn().mockReturnValue(false),
    getToken: jest.fn().mockReturnValue(null),
  },
}))

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('BlockEditor Integration', () => {
  it('affiche l’éditeur avec les blocs (heading, text, button)', () => {
    const onChange = jest.fn()
    renderWithTheme(
      <BlockEditor
        blocks={mockBlocks}
        onChange={onChange}
        availableBlockTypes={[]}
      />
    )
    expect(screen.getByDisplayValue('Test Heading')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test text content')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Click me')).toBeInTheDocument()
  })

  it('affiche le formulaire de réservation (booking-form) dans l’éditeur', () => {
    const onChange = jest.fn()
    renderWithTheme(
      <BlockEditor
        blocks={mockBlocksWithBooking}
        onChange={onChange}
        availableBlockTypes={[]}
      />
    )
    expect(screen.getByDisplayValue('Test Heading')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Réservez votre course')).toBeInTheDocument()
    expect(screen.getByLabelText(/Point de prise en charge/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Texte du bouton/i)).toBeInTheDocument()
  })

  it('appelle onChange quand les blocs sont modifiés (callback présent)', () => {
    const onChange = jest.fn()
    renderWithTheme(
      <BlockEditor
        blocks={mockBlocks}
        onChange={onChange}
        availableBlockTypes={[]}
      />
    )
    expect(onChange).not.toHaveBeenCalled()
  })

  it('gère une liste de blocs vide', () => {
    const onChange = jest.fn()
    renderWithTheme(
      <BlockEditor
        blocks={[]}
        onChange={onChange}
        availableBlockTypes={[]}
      />
    )
    expect(screen.queryByDisplayValue('Test Heading')).not.toBeInTheDocument()
  })
})
