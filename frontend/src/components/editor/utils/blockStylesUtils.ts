import React from 'react'
import { Block } from '../types'

/**
 * Calcule les styles du wrapper (container) d'un bloc
 */
export function getWrapperStyles(block: Block, theme: 'light' | 'dark' = 'light'): React.CSSProperties {
  // IMPORTANT: Ne jamais utiliser padding shorthand ici pour éviter les conflits avec les propriétés individuelles
  const hasIndividualPadding = !!(block.styles?.padding_top || block.styles?.padding_bottom || 
                                block.styles?.padding_left || block.styles?.padding_right ||
                                block.styles?.padding_vertical || block.styles?.padding_horizontal ||
                                block.styles?.paddingTop || block.styles?.paddingBottom ||
                                block.styles?.paddingLeft || block.styles?.paddingRight ||
                                block.styles?.paddingVertical || block.styles?.paddingHorizontal)
  
  // Calculer les valeurs de padding individuelles
  const paddingTop = block.styles?.padding_vertical || block.styles?.padding_top || block.styles?.paddingVertical
  const paddingBottom = block.styles?.padding_vertical || block.styles?.padding_bottom || block.styles?.paddingBottom
  const paddingLeft = block.styles?.padding_horizontal || block.styles?.padding_left || block.styles?.paddingLeft
  const paddingRight = block.styles?.padding_horizontal || block.styles?.padding_right || block.styles?.paddingRight
  
  return {
    // Position
    position: block.position?.type || block.styles?.position || 'static',
    // Coordonnées de position
    top: block.position?.top || block.styles?.top,
    right: block.position?.right || block.styles?.right,
    bottom: block.position?.bottom || block.styles?.bottom,
    left: block.position?.left || block.styles?.left,
    // Z-index
    zIndex: block.styles?.z_index || block.styles?.zIndex,
    // Overflow
    overflow: block.styles?.overflow || 'visible',
    // Margin (espacement externe)
    marginTop: block.styles?.margin_vertical || block.styles?.margin_top || block.styles?.marginTop,
    marginBottom: block.styles?.margin_vertical || block.styles?.margin_bottom || block.styles?.marginBottom,
    marginLeft: block.styles?.margin_horizontal || block.styles?.margin_left || block.styles?.marginLeft,
    marginRight: block.styles?.margin_horizontal || block.styles?.margin_right || block.styles?.marginRight,
    // Transition
    transition: block.styles?.transition || (block.styles?.transition_duration 
      ? `all ${block.styles?.transition_duration || 300}ms ease-in-out`
      : undefined),
    // Couleur de fond du wrapper (appliquée au conteneur)
    background: block.styles?.background && block.styles?.background.includes('gradient')
      ? block.styles?.background
      : block.styles?.background_color || block.styles?.backgroundColor || undefined,
    // Couleur de texte du wrapper - Ne pas appliquer si le thème est actif pour laisser les classes dark: gérer
    color: theme === 'dark' ? undefined : block.styles?.color,
    // Padding du wrapper - Utiliser uniquement les propriétés individuelles pour éviter les conflits
    // Ne jamais utiliser padding shorthand si on a des propriétés individuelles
    ...(hasIndividualPadding ? {
      ...(paddingTop !== undefined && paddingTop !== null && paddingTop !== '' ? { paddingTop } : {}),
      ...(paddingBottom !== undefined && paddingBottom !== null && paddingBottom !== '' ? { paddingBottom } : {}),
      ...(paddingLeft !== undefined && paddingLeft !== null && paddingLeft !== '' ? { paddingLeft } : {}),
      ...(paddingRight !== undefined && paddingRight !== null && paddingRight !== '' ? { paddingRight } : {}),
    } : block.styles?.padding ? {
      padding: block.styles.padding
    } : {}),
    // Bordures du wrapper
    borderWidth: block.styles?.border_width || block.styles?.borderWidth,
    borderStyle: block.styles?.border_style || block.styles?.borderStyle,
    borderColor: block.styles?.border_color || block.styles?.borderColor,
    borderRadius: block.styles?.border_radius || block.styles?.borderRadius,
    // Box shadow
    boxShadow: block.styles?.box_shadow === 'sm' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' :
               block.styles?.box_shadow === 'md' ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' :
               block.styles?.box_shadow === 'lg' ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' :
               block.styles?.box_shadow === 'xl' ? '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' :
               block.styles?.box_shadow === '2xl' ? '0 25px 50px -12px rgb(0 0 0 / 0.25)' :
               block.styles?.box_shadow === 'none' ? 'none' :
               block.styles?.box_shadow || block.styles?.boxShadow || undefined,
  }
}

/**
 * Calcule les styles du contenu interne d'un bloc
 */
export function getContentStyles(block: Block, theme: 'light' | 'dark' = 'light'): React.CSSProperties {
  return {
    // Couleur de fond - Utiliser background pour tout (évite le conflit avec backgroundColor)
    background: block.styles?.background && block.styles?.background.includes('gradient')
      ? block.styles?.background
      : block.styles?.background_color || block.styles?.backgroundColor || undefined,
    // Couleur de texte - Ne pas appliquer si le thème est actif pour laisser les classes dark: gérer
    color: theme === 'dark' ? undefined : block.styles?.color,
    // Typographie
    fontFamily: block.styles?.font_family || block.styles?.fontFamily || undefined,
    fontSize: block.styles?.font_size || block.styles?.fontSize || undefined,
    fontWeight: block.styles?.font_weight || block.styles?.fontWeight || undefined,
    fontStyle: block.styles?.font_style || block.styles?.fontStyle || undefined,
    lineHeight: block.styles?.line_height || block.styles?.lineHeight || undefined,
    letterSpacing: block.styles?.letter_spacing || block.styles?.letterSpacing || undefined,
    wordSpacing: block.styles?.word_spacing || block.styles?.wordSpacing || undefined,
    textTransform: block.styles?.text_transform || block.styles?.textTransform || undefined,
    textDecoration: block.styles?.text_decoration || block.styles?.textDecoration || undefined,
    textShadow: block.styles?.text_shadow || block.styles?.textShadow || undefined,
    // Opacité
    opacity: block.styles?.opacity !== undefined ? block.styles?.opacity : 1,
    // Transform
    transform: block.styles?.transform,
    // Box shadow (support des nouvelles valeurs)
    boxShadow: block.styles?.box_shadow === 'sm' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' :
               block.styles?.box_shadow === 'md' ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' :
               block.styles?.box_shadow === 'lg' ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' :
               block.styles?.box_shadow === 'xl' ? '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' :
               block.styles?.box_shadow === '2xl' ? '0 25px 50px -12px rgb(0 0 0 / 0.25)' :
               block.styles?.box_shadow === 'none' ? 'none' :
               block.styles?.box_shadow || block.styles?.boxShadow || undefined,
    // Border radius
    borderRadius: block.styles?.border_radius || block.styles?.borderRadius,
    // Backdrop filter
    backdropFilter: block.styles?.backdrop_filter || block.styles?.backdropFilter,
    // Padding (internal spacing of content)
    paddingTop: block.styles?.padding_vertical || block.styles?.padding_top || block.styles?.paddingVertical,
    paddingBottom: block.styles?.padding_vertical || block.styles?.padding_bottom || block.styles?.paddingBottom,
    paddingLeft: block.styles?.padding_horizontal || block.styles?.padding_left || block.styles?.paddingLeft,
    paddingRight: block.styles?.padding_horizontal || block.styles?.padding_right || block.styles?.paddingRight,
    // Bordures
    borderWidth: block.styles?.border_width || block.styles?.borderWidth,
    borderStyle: block.styles?.border_style || block.styles?.borderStyle,
    borderColor: block.styles?.border_color || block.styles?.borderColor,
    // Text alignment
    textAlign: block.styles?.text_align || block.styles?.textAlign || 'left',
  }
}

