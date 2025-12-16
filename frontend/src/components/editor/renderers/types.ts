/**
 * Types partagés pour les renderers de blocs
 */

import { Block } from '../types'
import { BlockType } from '@/services/blocks.service'

export interface RendererProps {
  block: Block
  blockType?: BlockType
  blockTypes?: BlockType[]
  theme?: 'light' | 'dark'
  wrapperStyles: React.CSSProperties
  contentStyles: React.CSSProperties
}

export type BlockRenderer = (props: RendererProps) => React.ReactElement

