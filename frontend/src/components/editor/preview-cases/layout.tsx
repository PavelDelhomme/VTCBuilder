import React from 'react'
import { PreviewCaseProps } from './types'
import { BlockPreviewRenderer } from '../BlockPreview'
import { Block } from '../types'
import { BlockType } from '@/services/blocks.service'

// Blocs de mise en page : container, flex-container, grid-container, columns, rows, section, header, footer, flexbox, grid, stack, inline, group, wrapper

export function renderContainer(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles, contentStyles, blockTypes } = props
  const isDark = theme === 'dark'
  // Container should render its children, not just show placeholder text
  // Le container doit respecter la largeur définie par layout (colonnes)
  // Note: Le layoutWidth sera appliqué par le wrapper final, donc ici on ne l'applique pas
  return (
    <div 
      data-block-id={block.id}
      style={{
        ...wrapperStyles,
        ...contentStyles,
        minHeight: block.minHeight || 'auto',
        height: block.height || 'auto',
        maxHeight: block.maxHeight || 'none',
        backgroundColor: isDark ? (block.styles?.background_color || '#1f2937') : (block.styles?.background_color || 'transparent'),
        color: isDark ? '#f9fafb' : '#111827',
      }}
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
  return (
    <div 
      style={{ 
        ...contentStyles, 
        display: 'flex', 
        flexDirection: block.data?.direction || 'row', 
        gap: block.data?.gap || '1rem', 
        flexWrap: block.data?.wrap || 'nowrap',
        minHeight: block.minHeight || '200px',
        height: block.height || 'auto',
        maxHeight: block.maxHeight || 'none',
        borderColor: isDark ? '#4b5563' : '#d1d5db',
        borderWidth: '2px',
        borderStyle: 'dashed',
      }} 
      className="p-6 rounded-lg"
    >
      <div 
        className="text-center flex-1"
        style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
      >
        <div className="text-2xl mb-2">📐</div>
        <div className="text-sm font-semibold">Flex Container</div>
        <div className="text-xs mt-1">Direction: {block.data?.direction || 'row'}</div>
        {block.children && block.children.length > 0 && (
          <div className="mt-4 space-y-2">
            {block.children.map((child: Block, idx: number) => (
              <div 
                key={idx} 
                className="p-2 rounded text-xs"
                style={{
                  backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                  color: isDark ? '#d1d5db' : '#374151'
                }}
              >
                <BlockPreviewRenderer
                  block={child}
                  blockType={blockTypes?.find((bt: BlockType) => bt.name === child.type)}
                  blockTypes={blockTypes}
                  theme={theme}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function renderGridContainer(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', contentStyles, blockTypes } = props
  const isDark = theme === 'dark'
  const gridColumns = block.data?.columns || 'repeat(3, 1fr)'
  const gridRows = block.data?.rows || 'auto'
  const gridGap = block.data?.gap || '1rem'
  return (
    <div 
      style={{
        ...contentStyles,
        display: 'grid',
        gridTemplateColumns: gridColumns,
        gridTemplateRows: gridRows,
        gap: gridGap,
        minHeight: block.minHeight || '200px',
        height: block.height || 'auto',
        maxHeight: block.maxHeight || 'none',
        borderColor: isDark ? '#4b5563' : '#d1d5db',
        borderWidth: '2px',
        borderStyle: 'dashed',
        backgroundColor: isDark ? (block.styles?.background_color || '#1f2937') : (block.styles?.background_color || '#f9fafb'),
        color: isDark ? '#f9fafb' : '#111827',
      }} 
      className="p-6 rounded-lg"
    >
      <div 
        className="text-center"
        style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
      >
        <div className="text-2xl mb-2">⚏</div>
        <div className="text-sm font-semibold">Grille</div>
        <div className="text-xs mt-1">Columns: {gridColumns}</div>
        <div className="text-xs mt-1">Rows: {gridRows}</div>
        {block.children && block.children.length > 0 && (
          <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: gridColumns, gridTemplateRows: gridRows }}>
            {block.children.map((child: Block, idx: number) => (
              <div 
                key={idx} 
                className="p-2 rounded text-xs"
                style={{
                  backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                  color: isDark ? '#d1d5db' : '#374151'
                }}
              >
                <BlockPreviewRenderer
                  block={child}
                  blockType={blockTypes?.find((bt: BlockType) => bt.name === child.type)}
                  blockTypes={blockTypes}
                  theme={theme}
                />
              </div>
            ))}
          </div>
        )}
      </div>
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
  return (
    <div
      data-block-id={block.id}
      style={{
        ...contentStyles,
        backgroundImage: block.data.background_image ? `url(${block.data.background_image})` : undefined,
        backgroundSize: block.data.background_size || 'cover',
        backgroundPosition: block.data.background_position || 'center',
        position: 'relative',
        // Ne pas utiliser padding shorthand si on a des propriétés individuelles
        ...(block.styles?.padding && !block.styles?.padding_top && !block.styles?.padding_bottom && !block.styles?.padding_left && !block.styles?.padding_right
          ? { padding: block.styles.padding }
          : {
              paddingTop: block.styles?.padding_top || block.styles?.padding_vertical || '2rem',
              paddingRight: block.styles?.padding_right || block.styles?.padding_horizontal || '2rem',
              paddingBottom: block.styles?.padding_bottom || block.styles?.padding_vertical || '2rem',
              paddingLeft: block.styles?.padding_left || block.styles?.padding_horizontal || '2rem',
            }),
        minHeight: block.styles?.min_height || 'auto',
      }}
      className="mb-6 rounded-lg"
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
  const { block, theme = 'light', wrapperStyles, contentStyles, blockTypes } = props
  const isDark = theme === 'dark'
  // Header est similaire à container mais avec un style spécifique
  return (
    <header 
      data-block-id={block.id}
      style={{
        ...wrapperStyles,
        ...contentStyles,
        backgroundColor: isDark ? (block.styles?.background_color || '#1f2937') : (block.styles?.background_color || '#ffffff'),
        color: isDark ? '#f9fafb' : '#111827',
        borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        padding: block.styles?.padding || '1rem 2rem',
      }}
      className="mb-6"
    >
      {block.children && block.children.length > 0 ? (
        <div className="flex items-center justify-between">
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
        <div 
          className="p-4 border-2 border-dashed rounded text-center"
          style={{
            borderColor: isDark ? '#4b5563' : '#d1d5db',
            color: isDark ? '#9ca3af' : '#6b7280',
          }}
        >
          <div className="text-sm">Empty header - Add blocks here</div>
        </div>
      )}
    </header>
  )
}

export function renderFooter(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles, contentStyles, blockTypes } = props
  const isDark = theme === 'dark'
  // Footer est similaire à container mais avec un style spécifique
  return (
    <footer 
      data-block-id={block.id}
      style={{
        ...wrapperStyles,
        ...contentStyles,
        backgroundColor: isDark ? (block.styles?.background_color || '#1f2937') : (block.styles?.background_color || '#f9fafb'),
        color: isDark ? '#9ca3af' : '#6b7280',
        borderTop: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        padding: block.styles?.padding || '2rem',
      }}
      className="mt-6"
    >
      {block.children && block.children.length > 0 ? (
        <div>
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
        <div 
          className="p-4 border-2 border-dashed rounded text-center"
          style={{
            borderColor: isDark ? '#4b5563' : '#d1d5db',
            color: isDark ? '#9ca3af' : '#6b7280',
          }}
        >
          <div className="text-sm">Empty footer - Add blocks here</div>
        </div>
      )}
    </footer>
  )
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

