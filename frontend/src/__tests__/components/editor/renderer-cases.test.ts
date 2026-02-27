/**
 * Tests unitaires pour le registre renderer-cases (getBlockRendererCase)
 * Vérifie que tous les types de blocs connus ont un renderer et que les inconnus retournent null
 */

import { getBlockRendererCase } from '@/components/editor/renderer-cases'

describe('renderer-cases / getBlockRendererCase', () => {
  it('retourne une fonction pour un type connu (booking-form)', () => {
    const fn = getBlockRendererCase('booking-form')
    expect(fn).toBeDefined()
    expect(typeof fn).toBe('function')
  })

  it('retourne une fonction pour les types avec tirets', () => {
    expect(getBlockRendererCase('booking-form')).toBeDefined()
    expect(getBlockRendererCase('form-newsletter')).toBeDefined()
    expect(getBlockRendererCase('contact-buttons')).toBeDefined()
    expect(getBlockRendererCase('pricing-table')).toBeDefined()
    expect(getBlockRendererCase('service-zones')).toBeDefined()
    expect(getBlockRendererCase('vehicle-gallery')).toBeDefined()
  })

  it('normalise les underscores en tirets (booking_form -> booking-form)', () => {
    const fn = getBlockRendererCase('booking_form')
    expect(fn).toBeDefined()
    expect(typeof fn).toBe('function')
  })

  it('normalise la casse (BOOKING-FORM)', () => {
    const fn = getBlockRendererCase('BOOKING-FORM')
    expect(fn).toBeDefined()
    expect(typeof fn).toBe('function')
  })

  it('retourne null pour un type inconnu', () => {
    expect(getBlockRendererCase('type-qui-nexiste-pas')).toBeNull()
    expect(getBlockRendererCase('')).toBeNull()
  })

  const knownTypes = [
    'text',
    'heading',
    'paragraph',
    'button',
    'image',
    'container',
    'section',
    'booking-form',
    'form-newsletter',
    'form-search',
    'form',
    'pricing-table',
    'map',
    'contact-buttons',
    'service-zones',
    'vehicle-gallery',
    'badges',
    'countdown',
    'progress-bar',
    'tabs',
    'modal',
    'icon-box',
    'feature-card',
    'card',
    'rating',
    'breadcrumb',
    'tags',
    'search-bar',
    'pagination',
    'link',
    'chart',
    'calendar',
    'video-embed',
    'team-member',
    'pricing-cards',
  ]

  knownTypes.forEach((blockType) => {
    it(`retourne un renderer pour le type "${blockType}"`, () => {
      const fn = getBlockRendererCase(blockType)
      expect(fn).toBeDefined()
      expect(typeof fn).toBe('function')
    })
  })
})
