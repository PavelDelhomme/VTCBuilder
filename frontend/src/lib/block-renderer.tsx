/**
 * Block Renderer - Renders blocks using templates from database
 */
import React from 'react'
import { Block } from '@/components/editor/BlockEditor'
import { BlockType } from '@/services/blocks.service'

interface RenderTemplate {
  type?: string
  component?: string
  props?: Record<string, any>
  children?: any
  content?: string
  level?: string
  [key: string]: any
}

/**
 * Render a block using its render template from the database
 */
export function renderBlockFromTemplate(
  block: Block,
  blockType?: BlockType,
  blockTypes?: BlockType[]
): React.ReactNode {
  // If no blockType or no render_template, use default rendering
  if (!blockType || !blockType.render_template || Object.keys(blockType.render_template).length === 0) {
    return renderDefaultBlock(block, blockType)
  }

  const template = blockType.render_template as RenderTemplate
  return renderFromTemplate(template, block, blockType, blockTypes)
}

/**
 * Render from template structure
 */
function renderFromTemplate(
  template: RenderTemplate,
  block: Block,
  blockType?: BlockType,
  blockTypes?: BlockType[]
): React.ReactNode {
  // Resolve template variables ({{data.field}}, {{styles.field}}, etc.)
  const resolvedProps = resolveTemplateVariables(template.props || {}, block)
  const resolvedChildren = resolveTemplateVariables(template.children, block)
  const resolvedContent = resolveTemplateVariables(template.content, block)
  const componentName = template.component || 'div'

  // Get component class/function
  const Component = getComponent(componentName, template)

  // Handle special cases
  if (template.type === 'component') {
    if (componentName === 'heading') {
      const level = resolveVariable(template.level || 'h2', block) || 'h2'
      const HeadingTag = level as keyof JSX.IntrinsicElements
      return React.createElement(
        HeadingTag,
        { ...resolvedProps, style: mergeStyles(resolvedProps.style, block.styles) },
        resolvedChildren || block.data?.text || 'Titre'
      )
    }

    if (resolvedProps?.dangerouslySetInnerHTML && resolvedContent) {
      return React.createElement(
        Component,
        {
          ...resolvedProps,
          dangerouslySetInnerHTML: { __html: String(resolvedContent).replace(/\n/g, '<br />') },
          style: mergeStyles(resolvedProps.style, block.styles),
        }
      )
    }

    // Handle children blocks recursively
    if (template.children && Array.isArray(template.children)) {
      const children = template.children.map((childTemplate: any, index: number) => {
        if (childTemplate.type === 'block' && block.children) {
          const childBlock = block.children[index]
          if (childBlock) {
            const childBlockType = blockTypes?.find(bt => bt.name === childBlock.type)
            return renderBlockFromTemplate(childBlock, childBlockType, blockTypes)
          }
        }
        return renderFromTemplate(childTemplate, block, blockType, blockTypes)
      })
      return React.createElement(Component, resolvedProps, ...children)
    }

    return React.createElement(
      Component,
      { ...resolvedProps, style: mergeStyles(resolvedProps.style, block.styles) },
      resolvedChildren
    )
  }

  // Fallback to default rendering
  return renderDefaultBlock(block, blockType)
}

/**
 * Resolve template variables like {{data.field}} or {{styles.field}}
 */
function resolveTemplateVariables(value: any, block: Block): any {
  if (typeof value === 'string') {
    return value.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      return resolveVariable(path, block) || match
    })
  }
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return value.map(item => resolveTemplateVariables(item, block))
    }
    const resolved: Record<string, any> = {}
    for (const [key, val] of Object.entries(value)) {
      resolved[key] = resolveTemplateVariables(val, block)
    }
    return resolved
  }
  return value
}

/**
 * Resolve a single variable path like "data.text" or "styles.font_size"
 */
function resolveVariable(path: string, block: Block): any {
  const parts = path.trim().split('.')
  let value: any = block

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part]
    } else {
      return undefined
    }
  }

  return value
}

/**
 * Get React component from name
 */
function getComponent(name: string, template: RenderTemplate): any {
  const components: Record<string, any> = {
    'div': 'div',
    'span': 'span',
    'p': 'p',
    'a': 'a',
    'img': 'img',
    'button': 'button',
    'input': 'input',
    'textarea': 'textarea',
    'select': 'select',
    'ul': 'ul',
    'ol': 'ol',
    'li': 'li',
    'h1': 'h1',
    'h2': 'h2',
    'h3': 'h3',
    'h4': 'h4',
    'h5': 'h5',
    'h6': 'h6',
    'table': 'table',
    'thead': 'thead',
    'tbody': 'tbody',
    'tr': 'tr',
    'td': 'td',
    'th': 'th',
  }

  return components[name] || 'div'
}

/**
 * Merge styles from template and block
 */
function mergeStyles(templateStyles: Record<string, any> = {}, blockStyles: Record<string, any> = {}): React.CSSProperties {
  const merged: React.CSSProperties = { ...templateStyles }

  // Apply block styles
  if (blockStyles) {
    Object.entries(blockStyles).forEach(([key, value]) => {
      const cssKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      merged[cssKey as keyof React.CSSProperties] = value
    })
  }

  return merged
}

/**
 * Default block rendering (fallback)
 */
function renderDefaultBlock(block: Block, blockType?: BlockType): React.ReactNode {
  return (
    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-2xl">{blockType?.icon || '📦'}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Bloc {block.type}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {blockType?.description || 'Configuration à venir'}
          </p>
        </div>
      </div>
    </div>
  )
}

