/**
 * Fixtures de test pour les blocs
 */

import { Block } from '@/components/editor/types'

export const mockHeadingBlock: Block = {
  id: 'heading-1',
  type: 'heading',
  data: {
    text: 'Test Heading',
    level: 1,
  },
  styles: {},
  children: [],
}

export const mockTextBlock: Block = {
  id: 'text-1',
  type: 'text',
  data: {
    text: 'Test text content',
    content: 'Test text content',
  },
  styles: {},
  children: [],
}

export const mockButtonBlock: Block = {
  id: 'button-1',
  type: 'button',
  data: {
    text: 'Click me',
    url: '/test',
    style: 'primary',
  },
  styles: {},
  children: [],
}

export const mockContainerBlock: Block = {
  id: 'container-1',
  type: 'container',
  data: {},
  styles: {},
  children: [mockHeadingBlock, mockTextBlock],
}

export const mockBlocks: Block[] = [
  mockHeadingBlock,
  mockTextBlock,
  mockButtonBlock,
]

export const mockBookingFormBlock: Block = {
  id: 'booking-1',
  type: 'booking-form',
  data: {
    title: 'Réservez votre course',
    button_text: 'Réserver',
    show_pickup: true,
    show_dropoff: true,
    show_date: true,
    show_phone: true,
  },
  styles: {},
  children: [],
}

export const mockBlocksWithBooking: Block[] = [
  mockHeadingBlock,
  mockTextBlock,
  mockBookingFormBlock,
]

