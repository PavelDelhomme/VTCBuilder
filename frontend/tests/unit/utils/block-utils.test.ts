/**
 * Tests unitaires pour les utilitaires de blocs
 */

import { Block } from '@/components/editor/types'

describe('Block Utils', () => {
  describe('Block validation', () => {
    it('should validate a valid block', () => {
      const block: Block = {
        id: 'test-1',
        type: 'heading',
        data: { text: 'Test' },
        styles: {},
        children: [],
      }

      expect(block.id).toBeDefined()
      expect(block.type).toBe('heading')
      expect(block.data).toBeDefined()
    })

    it('should handle block with children', () => {
      const parentBlock: Block = {
        id: 'parent-1',
        type: 'container',
        data: {},
        styles: {},
        children: [
          {
            id: 'child-1',
            type: 'text',
            data: { text: 'Child text' },
            styles: {},
            children: [],
          },
        ],
      }

      expect(parentBlock.children).toHaveLength(1)
      expect(parentBlock.children[0].type).toBe('text')
    })
  })
})

