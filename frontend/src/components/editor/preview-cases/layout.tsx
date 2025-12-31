import React from 'react'
import { PreviewCaseProps } from './types'
import { BlockPreviewRenderer } from '../BlockPreview'
import { Block } from '../types'
import { BlockType } from '@/services/blocks.service'
import { renderHeader as renderHeaderFromLayout } from '../renderers/layout/header'
import { renderFooter as renderFooterFromLayout } from '../renderers/layout/footer'

// Blocs de mise en page : container, flex-container, grid-container, columns, rows, section, header, footer, flexbox, grid, stack, inline, group, wrapper

export function renderContainer(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles, contentStyles, blockTypes } = props
  const isDark = theme === 'dark'
  // Container should render its children, not just show placeholder text
  // Le container doit respecter la largeur définie par layout (colonnes)
  // Note: Le layoutWidth sera appliqué par le wrapper final, donc ici on ne l'applique pas
  
  // Gérer les gradients correctement
  const backgroundStyle = block.styles?.background_gradient 
    ? { background: block.styles.background_gradient }
    : block.styles?.background && block.styles?.background.includes('gradient')
    ? { background: block.styles.background }
    : block.styles?.background_color
    ? { backgroundColor: block.styles.background_color }
    : isDark 
    ? { backgroundColor: '#1f2937' }
    : { backgroundColor: 'transparent' }
  
  return (
    <div 
      data-block-id={block.id}
      style={{
        ...wrapperStyles,
        ...contentStyles,
        ...backgroundStyle,
        minHeight: block.minHeight || (block.children && block.children.length > 0 ? 'auto' : '200px'),
        height: block.height || 'auto',
        maxHeight: block.maxHeight || 'none',
        width: '100%',
        color: isDark ? '#f9fafb' : '#111827',
      }}
      className="w-full"
    >
      {block.children && block.children.length > 0 ? (
        // Render children blocks recursively
        <div className="space-y-0">
          {block.children.map((childBlock: Block, idx: number) => (
            <div key={childBlock.id || idx} data-block-id={childBlock.id} data-child-block-id={childBlock.id}>
              <BlockPreviewRenderer
                block={childBlock}
                blockType={blockTypes?.find((bt: BlockType) => bt.name === childBlock.type)}
                blockTypes={blockTypes}
                theme={theme}
              />
            </div>
          ))}
        </div>
      ) : (
        // Empty container placeholder
        <div 
          className="p-6 border-2 border-dashed rounded-lg text-center"
          style={{
            borderColor: isDark ? '#4b5563' : '#d1d5db',
            color: isDark ? '#9ca3af' : '#6b7280',
            backgroundColor: isDark ? '#1f2937' : '#f9fafb',
          }}
        >
          <div className="text-2xl mb-2">📦</div>
          <div className="text-sm font-semibold">Empty container</div>
          <div className="text-xs mt-1">Add blocks to this container</div>
        </div>
      )}
    </div>
  )
}

export function renderFlexContainer(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', contentStyles, blockTypes } = props
  const isDark = theme === 'dark'
  const hasChildren = block.children && block.children.length > 0
  
  // Convertir gap en valeur CSS valide
  let flexGap = block.data?.gap || '1rem'
  if (typeof flexGap === 'string' && flexGap.startsWith('gap-')) {
    const gapMap: Record<string, string> = {
      'gap-0': '0',
      'gap-1': '0.25rem',
      'gap-2': '0.5rem',
      'gap-3': '0.75rem',
      'gap-4': '1rem',
      'gap-6': '1.5rem',
      'gap-8': '2rem',
      'gap-12': '3rem',
      'gap-16': '4rem',
    }
    flexGap = gapMap[flexGap] || '1rem'
  }
  
  return (
    <div 
      data-block-id={block.id}
      style={{ 
        ...contentStyles, 
        display: 'flex', 
        flexDirection: block.data?.direction || 'row', 
        gap: flexGap,
        justifyContent: block.data?.justify || 'flex-start',
        alignItems: block.data?.align || 'stretch',
        flexWrap: block.data?.wrap || 'nowrap',
        minHeight: hasChildren ? 'auto' : (block.minHeight || '200px'),
        height: block.height || 'auto',
        maxHeight: block.maxHeight || 'none',
        border: hasChildren ? '2px dashed transparent' : `2px dashed ${isDark ? '#4b5563' : '#d1d5db'}`,
        borderRadius: '0.5rem',
        padding: hasChildren ? '0' : '1.5rem',
        backgroundColor: hasChildren ? 'transparent' : (isDark ? 'rgba(31, 41, 55, 0.3)' : 'rgba(249, 250, 251, 0.5)'),
        position: 'relative',
      }} 
      className="mb-6 relative group"
    >
      {/* Badge indicateur de flex - visible en haut à droite */}
      {hasChildren && (
        <div 
          className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium z-10"
          style={{
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.15)',
            color: isDark ? '#93c5fd' : '#2563eb',
            border: `1px solid ${isDark ? '#3b82f6' : '#3b82f6'}`,
            backdropFilter: 'blur(4px)',
          }}
          title={`Flex ${block.data?.direction || 'row'}`}
        >
          <span className="mr-1">📐</span>
          <span className="font-semibold">Flex</span>
        </div>
      )}
      
      {hasChildren ? (
        block.children.map((child: Block, idx: number) => (
          <div key={child.id || idx} data-block-id={child.id} data-child-block-id={child.id} style={{ flex: '1 1 auto' }}>
            <BlockPreviewRenderer
              block={child}
              blockType={blockTypes?.find((bt: BlockType) => bt.name === child.type)}
              blockTypes={blockTypes}
              theme={theme}
            />
          </div>
        ))
      ) : (
        <div 
          className="text-center flex-1 flex flex-col items-center justify-center"
          style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
        >
          <div className="text-2xl mb-2">📐</div>
          <div className="text-sm font-semibold">Flex Container</div>
          <div className="text-xs mt-1">Direction: {block.data?.direction || 'row'}</div>
          <div className="text-xs mt-2 text-gray-400">Ajoutez des blocs dans ce conteneur Flex</div>
        </div>
      )}
    </div>
  )
}

export function renderGridContainer(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', contentStyles, blockTypes } = props
  const isDark = theme === 'dark'
  
  // Convertir le nombre de colonnes en format CSS grid
  const columnsCount = typeof block.data?.columns === 'number' ? block.data.columns : 
                       typeof block.data?.columns === 'string' && !isNaN(Number(block.data.columns)) ? Number(block.data.columns) : 2
  const gridColumns = typeof block.data?.columns === 'string' && block.data.columns.includes('repeat') 
    ? block.data.columns 
    : `repeat(${columnsCount}, 1fr)`
  const gridRows = block.data?.rows || 'auto'
  // Convertir gap en valeur CSS valide (supprimer les classes Tailwind comme 'gap-12')
  let gridGap = block.data?.gap || block.styles?.gap || '1rem'
  if (typeof gridGap === 'string' && gridGap.startsWith('gap-')) {
    // Convertir les classes Tailwind gap en valeurs CSS
    const gapMap: Record<string, string> = {
      'gap-0': '0',
      'gap-1': '0.25rem',
      'gap-2': '0.5rem',
      'gap-3': '0.75rem',
      'gap-4': '1rem',
      'gap-6': '1.5rem',
      'gap-8': '2rem',
      'gap-12': '3rem',
      'gap-16': '4rem',
    }
    gridGap = gapMap[gridGap] || '1rem'
  }
  const hasChildren = block.children && block.children.length > 0
  
  return (
    <div 
      data-block-id={block.id}
      className="mb-6 relative group"
      style={{
        ...contentStyles,
        display: 'grid',
        gridTemplateColumns: gridColumns,
        gridTemplateRows: gridRows,
        gap: gridGap,
        minHeight: block.minHeight || (hasChildren ? 'auto' : '200px'),
        height: block.height || 'auto',
        maxHeight: block.maxHeight || 'none',
        ...(block.styles?.padding ? { padding: block.styles.padding } : {}),
        position: 'relative',
        border: hasChildren ? '2px dashed transparent' : `2px dashed ${isDark ? '#4b5563' : '#d1d5db'}`,
        borderRadius: '0.5rem',
        backgroundColor: hasChildren ? 'transparent' : (isDark ? 'rgba(31, 41, 55, 0.3)' : 'rgba(249, 250, 251, 0.5)'),
      }}
    >
      {/* Badge indicateur de grille - visible en haut à droite */}
      <div 
        className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium z-10"
        style={{
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.15)',
          color: isDark ? '#93c5fd' : '#2563eb',
          border: `1px solid ${isDark ? '#3b82f6' : '#3b82f6'}`,
          backdropFilter: 'blur(4px)',
        }}
        title={`Grille avec ${columnsCount} colonnes`}
      >
        <span className="mr-1">⚏</span>
        <span className="font-semibold">Grille</span>
        <span className="ml-1 opacity-75">({columnsCount})</span>
      </div>
      
      {/* Indicateur visuel de grille - visible seulement si vide */}
      {!hasChildren && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            zIndex: 0,
          }}
        >
          <div className="text-4xl mb-2" style={{ color: isDark ? '#6b7280' : '#9ca3af' }}>⚏</div>
          <div className="text-sm font-semibold mb-1" style={{ color: isDark ? '#d1d5db' : '#374151' }}>
            Grille ({columnsCount} colonnes)
          </div>
          <div className="text-xs" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
            Ajoutez des blocs dans cette grille
          </div>
        </div>
      )}
      
      {/* Affichage des blocs enfants */}
      {hasChildren ? (
        block.children.map((child: Block, idx: number) => (
          <div 
            key={child.id || idx} 
            data-block-id={child.id}
            data-child-block-id={child.id}
            className="relative"
            style={{
              minHeight: '100px',
              zIndex: 1,
            }}
          >
            <BlockPreviewRenderer
              block={child}
              blockType={blockTypes?.find((bt: BlockType) => bt.name === child.type)}
              blockTypes={blockTypes}
              theme={theme}
            />
          </div>
        ))
      ) : null}
    </div>
  )
}

export function renderColumns(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', contentStyles, blockTypes } = props
  const columnCount = block.data.columns_count || 2
  return (
    <div 
      data-block-id={block.id}
      style={{
        ...contentStyles,
        display: 'grid',
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
        gap: block.styles?.gap || '1rem',
      }}
      className="mb-6"
    >
      {block.children && block.children.length > 0 ? (
        block.children.map((childBlock: Block, i: number) => (
          <div key={childBlock.id || i} data-block-id={childBlock.id} data-child-block-id={childBlock.id} className="min-h-[100px]">
            <BlockPreviewRenderer
              block={childBlock}
              blockType={blockTypes?.find((bt: BlockType) => bt.name === childBlock.type)}
              blockTypes={blockTypes}
              theme={theme}
            />
          </div>
        ))
      ) : (
        Array.from({ length: columnCount }).map((_, i) => {
          const isDark = theme === 'dark'
          return (
            <div 
              key={i} 
              className="p-4 rounded border-2 border-dashed min-h-[100px] flex items-center justify-center"
              style={{
                backgroundColor: isDark ? '#1f2937' : '#f9fafb',
                borderColor: isDark ? '#374151' : '#d1d5db',
              }}
            >
              <span 
                className="text-sm"
                style={{ color: isDark ? '#6b7280' : '#9ca3af' }}
              >
                Column {i + 1}
              </span>
            </div>
          )
        })
      )}
    </div>
  )
}

export function renderRows(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const rowCount = block.data.rows_count || 2
  return (
    <div style={wrapperStyles} className="mb-6 space-y-4">
      {Array.from({ length: rowCount }).map((_, i) => {
        const isDark = theme === 'dark'
        return (
          <div 
            key={i} 
            className="p-4 rounded border"
            style={{
              backgroundColor: isDark ? '#1f2937' : '#f9fafb',
              borderColor: isDark ? '#374151' : '#e5e7eb',
              color: isDark ? '#d1d5db' : '#374151',
            }}
          >
            Row {i + 1} - Columns can be added here
          </div>
        )
      })}
    </div>
  )
}

export function renderSection(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', contentStyles, blockTypes } = props
  const isDark = theme === 'dark'
  
  // Appliquer les styles de background depuis data ou styles
  const backgroundColor = block.data?.background || block.styles?.background_color || block.styles?.backgroundColor
  const backgroundClass = block.data?.background && typeof block.data.background === 'string' && block.data.background.startsWith('bg-') 
    ? block.data.background 
    : undefined
  
  return (
    <div
      data-block-id={block.id}
      className={`mb-6 ${block.data?.rounded || 'rounded-lg'} ${block.data?.shadow || ''} ${backgroundClass || ''}`}
      style={{
        ...contentStyles,
        backgroundColor: backgroundColor && !backgroundClass ? backgroundColor : undefined,
        backgroundImage: block.data.background_image ? `url(${block.data.background_image})` : undefined,
        backgroundSize: block.data.background_size || 'cover',
        backgroundPosition: block.data.background_position || 'center',
        position: 'relative',
        // Ne pas utiliser padding shorthand si on a des propriétés individuelles
        ...(block.styles?.padding && !block.styles?.padding_top && !block.styles?.padding_bottom && !block.styles?.padding_left && !block.styles?.padding_right
          ? { padding: block.styles.padding }
          : {
              paddingTop: block.styles?.padding_top || block.styles?.padding_vertical || (block.data?.padding ? undefined : '2rem'),
              paddingRight: block.styles?.padding_right || block.styles?.padding_horizontal || (block.data?.padding ? undefined : '2rem'),
              paddingBottom: block.styles?.padding_bottom || block.styles?.padding_vertical || (block.data?.padding ? undefined : '2rem'),
              paddingLeft: block.styles?.padding_left || block.styles?.padding_horizontal || (block.data?.padding ? undefined : '2rem'),
            }),
        // Appliquer le padding depuis data si présent
        ...(block.data?.padding && typeof block.data.padding === 'string' ? {} : {}),
        minHeight: block.styles?.min_height || 'auto',
        boxShadow: block.data?.shadow === 'shadow-lg' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : undefined,
      }}
    >
      {block.data.overlay && block.data.background_image && (
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg"></div>
      )}
      <div className="relative z-10">
        {block.children && block.children.length > 0 ? (
          block.children.map((childBlock: Block, i: number) => (
            <div key={childBlock.id || i} data-block-id={childBlock.id} data-child-block-id={childBlock.id}>
              <BlockPreviewRenderer
                block={childBlock}
                blockType={blockTypes?.find((bt: BlockType) => bt.name === childBlock.type)}
                blockTypes={blockTypes}
                theme={theme}
              />
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded">
            Ajoutez des blocs dans cette section
          </div>
        )}
      </div>
    </div>
  )
}

export function renderHeader(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles, contentStyles } = props
  // Utiliser le renderer depuis renderers/layout/header.tsx qui affiche le header avec ses données
  return renderHeaderFromLayout({ block, wrapperStyles, contentStyles, theme })
}

export function renderFooter(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles, contentStyles = {} } = props
  // Utiliser le renderer depuis renderers/layout/footer.tsx qui affiche le footer avec ses données
  return renderFooterFromLayout({ block, wrapperStyles, contentStyles, theme })
}

// flexbox, grid, stack, inline, group, wrapper utilisent tous renderContainer
export function renderFlexbox(props: PreviewCaseProps): React.ReactElement | null {
  return renderContainer(props)
}

export function renderGrid(props: PreviewCaseProps): React.ReactElement | null {
  return renderContainer(props)
}

export function renderStack(props: PreviewCaseProps): React.ReactElement | null {
  return renderContainer(props)
}

export function renderInline(props: PreviewCaseProps): React.ReactElement | null {
  return renderContainer(props)
}

export function renderGroup(props: PreviewCaseProps): React.ReactElement | null {
  return renderContainer(props)
}

export function renderWrapper(props: PreviewCaseProps): React.ReactElement | null {
  return renderContainer(props)
}

// Export map
export const layoutCases: Record<string, (props: PreviewCaseProps) => React.ReactElement | null> = {
  'container': renderContainer,
  'flex-container': renderFlexContainer,
  'grid-container': renderGridContainer,
  'columns': renderColumns,
  'rows': renderRows,
  'section': renderSection,
  'header': renderHeader,
  'footer': renderFooter,
  'flexbox': renderFlexbox,
  'grid': renderGrid,
  'stack': renderStack,
  'inline': renderInline,
  'group': renderGroup,
  'wrapper': renderWrapper,
}

