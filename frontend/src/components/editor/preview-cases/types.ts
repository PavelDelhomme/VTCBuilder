import React from 'react'
import { Block } from '../types'
import { BlockType } from '@/services/blocks.service'

export interface PreviewCaseProps {
  block: Block
  blockType?: BlockType
  blockTypes?: BlockType[]
  theme?: 'light' | 'dark'
  wrapperStyles: React.CSSProperties
  contentStyles: React.CSSProperties
}

export type PreviewCaseFunction = (props: PreviewCaseProps) => React.ReactElement | null

