/**
 * Block Definitions - Source unique de vérité pour les définitions de blocs
 * Ce fichier peut être généré depuis le JSON backend ou chargé dynamiquement
 */

import { BlockType } from '@/services/blocks.service'

/**
 * Charge les définitions de blocs depuis le backend
 * Les blocs sont stockés dans la base de données mais peuvent être préchargés depuis le JSON
 */
export async function loadBlockDefinitions(): Promise<BlockType[]> {
  try {
    // Charger depuis l'API (source de vérité)
    const response = await fetch('/api/blocks/types/')
    if (!response.ok) {
      throw new Error('Failed to load block definitions')
    }
    const data = await response.json()
    return data.results || data
  } catch (error) {
    console.error('Error loading block definitions:', error)
    // Fallback: retourner une liste vide ou des définitions par défaut
    return []
  }
}

/**
 * Filtre les blocs par catégorie
 */
export function filterBlocksByCategory(
  blocks: BlockType[],
  category: 'all' | 'content' | 'layout' | 'media' | 'custom'
): BlockType[] {
  if (category === 'all') {
    return blocks
  }
  return blocks.filter(block => block.category === category)
}

/**
 * Trie les blocs par ordre
 */
export function sortBlocksByOrder(blocks: BlockType[]): BlockType[] {
  return [...blocks].sort((a, b) => (a.order || 0) - (b.order || 0))
}

/**
 * Recherche de blocs par nom, label ou description
 */
export function searchBlocks(
  blocks: BlockType[],
  query: string
): BlockType[] {
  if (!query) {
    return blocks
  }
  
  const lowerQuery = query.toLowerCase()
  return blocks.filter(block =>
    block.name.toLowerCase().includes(lowerQuery) ||
    block.label.toLowerCase().includes(lowerQuery) ||
    (block.description && block.description.toLowerCase().includes(lowerQuery))
  )
}

