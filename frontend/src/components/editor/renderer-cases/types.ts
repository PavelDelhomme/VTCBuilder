import React from 'react'
import { Block } from '../types'
import { BlockType } from '@/services/blocks.service'

export interface RendererCaseProps {
  block: Block
  blockType?: BlockType
  onUpdate: (updates: Partial<Block>) => void
}

export type RendererCaseFunction = (props: RendererCaseProps) => React.ReactElement | null

