export interface Block {
  id: string
  type: string
  data: Record<string, any>
  styles?: Record<string, any>
  children?: Block[]
  layout?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 // Nombre de colonnes sur 12 (système Bootstrap)
  container?: 'container' | 'container-fluid' | 'none'
  position?: {
    type: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
    top?: string
    right?: string
    bottom?: string
    left?: string
    align?: 'left' | 'center' | 'right' | 'stretch'
    alignTo?: string // ID du bloc de référence pour position relative
  }
  width?: string // Largeur personnalisée (px, %, etc.)
  height?: string // Hauteur personnalisée (px, %, etc.)
  minWidth?: string
  minHeight?: string
  maxWidth?: string
  maxHeight?: string
}
