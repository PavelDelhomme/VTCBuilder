/**
 * Utilitaires pour manipuler l'arbre de blocs
 */

import { Block } from '../../types'

/**
 * Trouve un bloc dans l'arbre de blocs (récursif)
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
      if (found) {
        return found
      }
    }
  }
  return null
}

/**
 * Retire un bloc de l'arbre de blocs
 */
export function removeBlockFromTree(blocks: Block[], blockId: string): Block[] {
  return blocks
    .filter((block) => block.id !== blockId)
    .map((block) => ({
      ...block,
      children: block.children ? removeBlockFromTree(block.children, blockId) : [],
    }))
}

/**
 * Ajoute un bloc enfant à un conteneur
 */
export function addBlockToContainer(
  blocks: Block[],
  containerId: string,
  childBlock: Block
): Block[] {
  return blocks.map((block) => {
    if (block.id === containerId) {
      return {
        ...block,
        children: [...(block.children || []), childBlock],
      }
    }
    if (block.children && block.children.length > 0) {
      return {
        ...block,
        children: addBlockToContainer(block.children, containerId, childBlock),
      }
    }
    return block
  })
}

/**
 * Vérifie si un bloc est dans un conteneur (récursif)
 */
export function isBlockInContainer(block: Block, containerId: string): boolean {
  if (block.id === containerId) {
    return true
  }
  if (block.children && block.children.length > 0) {
    return block.children.some((child) => isBlockInContainer(child, containerId))
  }
  return false
}

/**
 * Trouve le parent d'un bloc dans l'arbre
 */
export function findBlockParent(
  blocks: Block[],
  searchId: string,
  parentId?: string
): string | null {
  for (const block of blocks) {
    if (block.id === searchId) {
      return parentId || null
    }
    if (block.children && block.children.length > 0) {
      const found = findBlockParent(block.children, searchId, block.id)
      if (found !== null) {
        return found
      }
    }
  }
  return null
}

/**
 * Vérifie si un bloc est un descendant d'un autre bloc
 */
export function isDescendant(blocks: Block[], targetId: string): boolean {
  for (const block of blocks) {
    if (block.id === targetId) {
      return true
    }
    if (block.children && block.children.length > 0) {
      if (isDescendant(block.children, targetId)) {
        return true
      }
    }
  }
  return false
}

/**
 * Trouve un bloc et son parent dans l'arbre
 */
export function findBlockAndParent(
  blocks: Block[],
  targetId: string,
  parent: Block | null = null
): { block: Block | null; parent: Block | null; parentChildren: Block[] | null } {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].id === targetId) {
      return {
        block: blocks[i],
        parent,
        parentChildren: parent ? parent.children || null : blocks,
      }
    }
    if (blocks[i].children && blocks[i].children.length > 0) {
      const found = findBlockAndParent(blocks[i].children, targetId, blocks[i])
      if (found.block) {
        return found
      }
    }
  }
  return { block: null, parent: null, parentChildren: null }
}

/**
 * Clone profond d'un bloc
 */
export function deepCloneBlock(block: Block): Block {
  return {
    ...block,
    children: block.children ? block.children.map(deepCloneBlock) : [],
  }
}

