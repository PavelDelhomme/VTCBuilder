/**
 * Tests unitaires complets pour les formulaires VTC (vtc-forms)
 * Couvre renderBookingForm et l'export vtcFormsCases
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderBookingForm, vtcFormsCases } from '@/components/editor/renderer-cases/vtc-forms'
import { Block } from '@/components/editor/types'

const createMockBlock = (overrides: Partial<Block> = {}): Block => ({
  id: 'booking-1',
  type: 'booking-form',
  data: {},
  styles: {},
  children: [],
  ...overrides,
})

describe('vtc-forms', () => {
  describe('renderBookingForm', () => {
    it('affiche le formulaire avec titre, champs et bouton', () => {
      const onUpdate = jest.fn()
      const block = createMockBlock()

      render(renderBookingForm({ block, onUpdate }))

      expect(screen.getByLabelText(/Titre du formulaire/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Réservez votre course/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Point de prise en charge/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Point de destination/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Date et heure/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Téléphone/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Texte du bouton/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Activer le captcha/i)).toBeInTheDocument()
    })

    it('utilise les valeurs par défaut du bloc (title, button_text)', () => {
      const onUpdate = jest.fn()
      const block = createMockBlock({
        data: { title: 'Mon formulaire', button_text: 'Réserver une course' },
      })

      render(renderBookingForm({ block, onUpdate }))

      const titleInput = screen.getByLabelText(/Titre du formulaire/i)
      const buttonTextInput = screen.getByLabelText(/Texte du bouton/i)
      expect(titleInput).toHaveValue('Mon formulaire')
      expect(buttonTextInput).toHaveValue('Réserver une course')
    })

    it('appelle onUpdate quand on change le titre', async () => {
      const onUpdate = jest.fn()
      const block = createMockBlock()

      render(renderBookingForm({ block, onUpdate }))
      const input = screen.getByLabelText(/Titre du formulaire/i)
      fireEvent.change(input, { target: { value: 'Nouveau titre' } })

      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ title: 'Nouveau titre' }) })
      )
    })

    it('appelle onUpdate quand on change le texte du bouton', async () => {
      const onUpdate = jest.fn()
      const block = createMockBlock({ data: { button_text: 'Réserver' } })

      render(renderBookingForm({ block, onUpdate }))
      const input = screen.getByLabelText(/Texte du bouton/i)
      fireEvent.change(input, { target: { value: 'Valider' } })

      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ button_text: 'Valider' }) })
      )
    })

    it('checkboxes point de prise en charge / destination / date cochés par défaut', () => {
      const onUpdate = jest.fn()
      const block = createMockBlock()

      render(renderBookingForm({ block, onUpdate }))

      expect(screen.getByLabelText(/Point de prise en charge/i)).toBeChecked()
      expect(screen.getByLabelText(/Point de destination/i)).toBeChecked()
      expect(screen.getByLabelText(/Date et heure/i)).toBeChecked()
      expect(screen.getByLabelText(/Téléphone/i)).toBeChecked()
    })

    it('checkboxes passagers / véhicule / notes / captcha décochés par défaut', () => {
      const onUpdate = jest.fn()
      const block = createMockBlock()

      render(renderBookingForm({ block, onUpdate }))

      expect(screen.getByLabelText(/Nombre de passagers/i)).not.toBeChecked()
      expect(screen.getByLabelText(/Type de véhicule/i)).not.toBeChecked()
      expect(screen.getByLabelText(/Notes spéciales/i)).not.toBeChecked()
      expect(screen.getByLabelText(/Activer le captcha/i)).not.toBeChecked()
    })

    it('appelle onUpdate quand on coche/décoche une option', async () => {
      const user = userEvent.setup()
      const onUpdate = jest.fn()
      const block = createMockBlock()

      render(renderBookingForm({ block, onUpdate }))
      const pickupCheckbox = screen.getByLabelText(/Point de prise en charge/i)
      await user.click(pickupCheckbox)

      expect(onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ show_pickup: false }) })
      )
    })

    it('affiche le sélecteur thème captcha quand captcha activé', () => {
      const onUpdate = jest.fn()
      const block = createMockBlock({ data: { enable_captcha: true } })

      render(renderBookingForm({ block, onUpdate }))

      expect(screen.getByLabelText(/Thème du captcha/i)).toBeInTheDocument()
      expect(screen.getByRole('combobox', { name: /Thème du captcha/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Clair' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Sombre' })).toBeInTheDocument()
    })

    it('n\'affiche pas le thème captcha quand captcha désactivé', () => {
      const onUpdate = jest.fn()
      const block = createMockBlock({ data: { enable_captcha: false } })

      render(renderBookingForm({ block, onUpdate }))

      expect(screen.queryByLabelText(/Thème du captcha/i)).not.toBeInTheDocument()
    })

    it('gère block.data undefined (safeBlock)', () => {
      const onUpdate = jest.fn()
      const block = createMockBlock({ data: undefined as unknown as Record<string, unknown> })

      expect(() => render(renderBookingForm({ block, onUpdate }))).not.toThrow()
      expect(screen.getByLabelText(/Titre du formulaire/i)).toHaveValue('')
    })

    it('utilise button_text par défaut "Réserver" si non fourni', () => {
      const onUpdate = jest.fn()
      const block = createMockBlock({ data: {} })

      render(renderBookingForm({ block, onUpdate }))
      expect(screen.getByLabelText(/Texte du bouton/i)).toHaveValue('Réserver')
    })
  })

  describe('vtcFormsCases', () => {
    it('expose booking-form comme clé', () => {
      expect(vtcFormsCases['booking-form']).toBe(renderBookingForm)
    })

    it('booking-form rend un élément valide', () => {
      const onUpdate = jest.fn()
      const block = createMockBlock()
      const result = vtcFormsCases['booking-form']({ block, onUpdate })
      const { container } = render(result)
      expect(container.firstChild).toBeInTheDocument()
    })
  })
})
