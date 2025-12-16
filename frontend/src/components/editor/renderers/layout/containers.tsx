/**
 * Renderer pour les blocs conteneurs (flexbox, grid, stack, inline, group, wrapper)
 */

import React from 'react'
import { RendererProps } from '../types'

export const renderContainer = ({ block, wrapperStyles }: RendererProps): React.ReactElement => {
  return (
    <div style={wrapperStyles} className="mb-6">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        {block.type === 'flexbox' && '📐 Flexbox Container'}
        {block.type === 'grid' && '⚏ Grid Container'}
        {block.type === 'stack' && '📚 Stack Container'}
        {block.type === 'inline' && '➡️ Inline Container'}
        {block.type === 'group' && '👥 Group Container'}
        {block.type === 'wrapper' && '📦 Wrapper Container'}
      </div>
      {/* Les enfants seront rendus par le composant parent */}
    </div>
  )
}

