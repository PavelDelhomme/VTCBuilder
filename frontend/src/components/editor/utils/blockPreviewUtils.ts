import { Block } from '../types'

/**
 * Génère les classes CSS pour les animations au survol
 */
export function getHoverAnimationClass(block: Block): string {
  const animation = block.styles?.hover_animation || 'none'
  switch (animation) {
    case 'scale':
      return 'hover:scale-105'
    case 'lift':
      return 'hover:-translate-y-2 hover:shadow-lg'
    case 'fade':
      return 'hover:opacity-80'
    case 'rotate':
      return 'hover:rotate-3'
    case 'glow':
      return 'hover:shadow-2xl hover:shadow-blue-500/50'
    default:
      return ''
  }
}

/**
 * Génère les classes CSS pour l'alignement basé sur le type de position
 */
export function getAlignmentClasses(block: Block): string {
  if (block.position?.type === 'relative' || block.position?.type === 'absolute' || block.position?.type === 'fixed' || block.position?.type === 'sticky') {
    const align = block.position?.align || 'left'
    switch (align) {
      case 'left':
        return 'mr-auto'
      case 'center':
        return 'mx-auto'
      case 'right':
        return 'ml-auto'
      case 'stretch':
        return 'w-full'
      default:
        return ''
    }
  }
  return ''
}

/**
 * Calcule la largeur du layout basée sur le système de colonnes (12 colonnes)
 */
export function getLayoutWidth(layoutCols: number): string {
  return layoutCols === 12 ? 'w-full' :
    layoutCols === 11 ? 'w-[91.666667%]' :
    layoutCols === 10 ? 'w-[83.333333%]' :
    layoutCols === 9 ? 'w-3/4' :
    layoutCols === 8 ? 'w-2/3' :
    layoutCols === 7 ? 'w-[58.333333%]' :
    layoutCols === 6 ? 'w-1/2' :
    layoutCols === 5 ? 'w-[41.666667%]' :
    layoutCols === 4 ? 'w-1/3' :
    layoutCols === 3 ? 'w-1/4' :
    layoutCols === 2 ? 'w-1/6' :
    layoutCols === 1 ? 'w-[8.333333%]' : 'w-full'
}

/**
 * Calcule la classe CSS du container
 */
export function getContainerClass(container: string | undefined, layoutCols: number): string {
  if (container === 'container-fluid') {
    return 'w-full'
  }
  if (container === 'none') {
    return ''
  }
  if (layoutCols === 12) {
    return 'max-w-7xl mx-auto'
  }
  return '' // Si pas pleine largeur, on applique le layoutWidth directement
}

