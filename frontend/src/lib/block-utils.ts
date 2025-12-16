import { Block } from '@/components/editor/types'

/**
 * Fonction récursive pour trouver un bloc dans l'arbre
 */
export function findBlockInTree(
  blocks: Block[],
  blockId: string
): { block: Block; parent: Block[] | null; index: number } | null {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].id === blockId) {
      return { block: blocks[i], parent: blocks, index: i }
    }
    if (blocks[i].children && blocks[i].children.length > 0) {
      const found = findBlockInTree(blocks[i].children, blockId)
      if (found) return found
    }
  }
  return null
}

/**
 * Fonction récursive pour mettre à jour un bloc dans l'arbre
 */
export function updateBlockInTree(
  blocks: Block[],
  blockId: string,
  updates: Partial<Block>
): Block[] {
  return blocks.map(block => {
    if (block.id === blockId) {
      return { ...block, ...updates }
    }
    if (block.children && block.children.length > 0) {
      return {
        ...block,
        children: updateBlockInTree(block.children, blockId, updates),
      }
    }
    return block
  })
}

/**
 * Fonction récursive pour supprimer un bloc de l'arbre
 */
export function removeBlockFromTree(blocks: Block[], blockId: string): Block[] {
  return blocks
    .filter(block => block.id !== blockId)
    .map(block => {
      if (block.children && block.children.length > 0) {
        return {
          ...block,
          children: removeBlockFromTree(block.children, blockId),
        }
      }
      return block
    })
}

/**
 * Fonction récursive pour dupliquer un bloc dans l'arbre
 */
export function duplicateBlockInTree(
  blocks: Block[],
  blockId: string,
  newId: string
): Block[] {
  return blocks.map(block => {
    if (block.id === blockId) {
      const duplicated: Block = {
        ...block,
        id: newId,
        children: block.children
          ? block.children.map((child, idx) => ({
              ...child,
              id: `${newId}-child-${idx}-${Date.now()}`,
            }))
          : undefined,
      }
      return block // On retourne le bloc original, la duplication sera gérée par le parent
    }
    if (block.children && block.children.length > 0) {
      return {
        ...block,
        children: duplicateBlockInTree(block.children, blockId, newId),
      }
    }
    return block
  })
}

