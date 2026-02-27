/**
 * Tests du BlockRenderer : rendu par type, bloc null, type inconnu
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { BlockRenderer } from '@/components/editor/BlockRenderer'
import { Block } from '@/components/editor/types'

const createBlock = (type: string, data: Record<string, unknown> = {}): Block => ({
  id: `block-${type}`,
  type,
  data,
  styles: {},
  children: [],
})

describe('BlockRenderer', () => {
  it('affiche une erreur quand block est null/undefined', () => {
    const onUpdate = jest.fn()
    const { container } = render(
      <BlockRenderer block={null as unknown as Block} onUpdate={onUpdate} />
    )
    expect(screen.getByText(/Erreur : Bloc non défini/i)).toBeInTheDocument()
  })

  it('rend un bloc text avec son contenu', () => {
    const onUpdate = jest.fn()
    const block = createBlock('text', { content: 'Hello world' })
    render(<BlockRenderer block={block} onUpdate={onUpdate} />)
    expect(screen.getByDisplayValue('Hello world')).toBeInTheDocument()
  })

  it('rend un bloc heading avec niveau et texte', () => {
    const onUpdate = jest.fn()
    const block = createBlock('heading', { text: 'Mon titre', level: 1 })
    render(<BlockRenderer block={block} onUpdate={onUpdate} />)
    expect(screen.getByDisplayValue('Mon titre')).toBeInTheDocument()
  })

  it('rend le formulaire de réservation (booking-form)', () => {
    const onUpdate = jest.fn()
    const block = createBlock('booking-form', { title: 'Réservez' })
    render(<BlockRenderer block={block} onUpdate={onUpdate} />)
    expect(screen.getByLabelText(/Titre du formulaire/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('Réservez')).toBeInTheDocument()
  })

  it('rend le fallback "Configuration à venir" pour un type inconnu', () => {
    const onUpdate = jest.fn()
    const block = createBlock('type-inconnu-xyz')
    render(<BlockRenderer block={block} onUpdate={onUpdate} />)
    expect(screen.getByText(/Bloc type-inconnu-xyz/i)).toBeInTheDocument()
    expect(screen.getByText(/Configuration à venir/i)).toBeInTheDocument()
  })

  it('gère un bloc sans data (safeBlock)', () => {
    const onUpdate = jest.fn()
    const block = createBlock('text') as Block
    ;(block as { data?: unknown }).data = undefined
    expect(() =>
      render(<BlockRenderer block={block} onUpdate={onUpdate} />)
    ).not.toThrow()
  })

  it('normalise le type avec underscores (booking_form)', () => {
    const onUpdate = jest.fn()
    const block = createBlock('booking_form', { title: 'Test' })
    render(<BlockRenderer block={block} onUpdate={onUpdate} />)
    expect(screen.getByLabelText(/Titre du formulaire/i)).toBeInTheDocument()
  })
})
