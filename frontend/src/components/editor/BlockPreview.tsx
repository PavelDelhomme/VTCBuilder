'use client'

import React, { useState, useEffect, memo } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Block } from './types'
import blocksService, { BlockType } from '@/services/blocks.service'
import { renderBlockFromTemplate } from '@/lib/block-renderer'
import Captcha from '@/components/shared/Captcha'
import { renderHeading, renderText, renderImage, renderButton } from './renderers/basic'
import { renderHero, renderFeaturesGrid, renderCTASection, renderContactForm } from './renderers/complex'
import { renderBookingForm, renderPricingTable, renderServiceZones, renderVehicleGallery, renderContactButtons, renderMap, renderFareCalculator, renderAvailabilityCalendar } from './renderers/vtc'
import { renderForm, renderFormMultiStep, renderFormConditional, renderFormCalculator, renderFormPayment } from './renderers/forms'
import { renderAccordion, renderTabs, renderCountdown, renderProgressBar } from './renderers/interactive'
import { renderHeader } from './renderers/layout/header'
import { renderFooter } from './renderers/layout/footer'
import { renderContainer } from './renderers/layout/containers'
import { getBlockPreviewCase } from './preview-cases'
import { renderCarousel } from './renderers/media/carousel'
import { renderLogoGrid } from './renderers/media/logo-grid'
import { renderImageSlider } from './renderers/media/image-slider'
import { renderLightbox } from './renderers/media/lightbox'
import { renderBadges } from './renderers/data'
import authService from '@/services/auth.service'
import { SortablePreviewBlock } from './components/SortablePreviewBlock'
import { FAQSectionPreview } from './components/FAQSectionPreview'
import { getHoverAnimationClass, getAlignmentClasses, getLayoutWidth, getContainerClass } from './utils/blockPreviewUtils'
import { getWrapperStyles, getContentStyles } from './utils/blockStylesUtils'

interface BlockPreviewProps {
  blocks: Block[]
  blockTypes: BlockType[]
  onBlocksChange?: (blocks: Block[]) => void
  onBlockSelect?: (blockId: string | null) => void
  onBlockDoubleClick?: (blockId: string) => void
  onBlockRightClick?: (blockId: string, position: { x: number; y: number }) => void
  selectedBlockId?: string | null
  isInteractive?: boolean
  isEditable?: boolean
  onNavigate?: (url: string) => void // Callback pour navigation dans l'éditeur
  inspectorMode?: boolean // Mode inspecteur activé
  onInspectorModeChange?: (enabled: boolean) => void // Callback pour activer/désactiver le mode inspecteur
  theme?: 'light' | 'dark' // Thème de la prévisualisation
}

function BlockPreview({ 
  blocks, 
  blockTypes, 
  onBlocksChange,
  onBlockSelect,
  onBlockDoubleClick,
  onBlockRightClick,
  selectedBlockId,
  isInteractive = false,
  isEditable = false,
  onNavigate,
  inspectorMode = false,
  onInspectorModeChange,
  theme = 'light'
}: BlockPreviewProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setIsDragging(true)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setIsDragging(false)
    setActiveId(null)

    if (over && active.id !== over.id && onBlocksChange) {
      const oldIndex = blocks.findIndex(b => b.id === active.id)
      const newIndex = blocks.findIndex(b => b.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newBlocks = arrayMove(blocks, oldIndex, newIndex)
        onBlocksChange(newBlocks)
      }
    }
  }

  const handleBlockClick = (blockId: string) => {
    if (onBlockSelect && !isDragging && !inspectorMode) {
      onBlockSelect(blockId === selectedBlockId ? null : blockId)
    }
  }

  const handleBlockDoubleClick = (blockId: string) => {
    if (onBlockDoubleClick && !isDragging && !inspectorMode) {
      onBlockDoubleClick(blockId)
    }
  }

  const handleBlockRightClick = (blockId: string, event: React.MouseEvent) => {
    if (onBlockRightClick && !isDragging && !inspectorMode && isEditable) {
      event.preventDefault()
      event.stopPropagation()
      onBlockRightClick(blockId, { x: event.clientX, y: event.clientY })
    }
  }

  // Intercepter les clics sur les liens pour navigation dans l'éditeur
  useEffect(() => {
    if (!onNavigate) return

    const handleLinkClick = (e: MouseEvent) => {
      // Ne pas intercepter si les liens sont désactivés
      if (!isInteractive) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      
      // Ne pas intercepter en mode inspecteur
      if (inspectorMode) return

      const target = e.target as HTMLElement
      const link = target.closest('a') as HTMLAnchorElement
      
      if (link && link.href) {
        try {
          const url = new URL(link.href)
          const pathname = url.pathname
          
          // Ne pas intercepter les liens externes, les liens avec target="_blank", ou les ancres (#)
          if (link.target === '_blank' || 
              url.origin !== window.location.origin ||
              pathname.startsWith('http') ||
              (pathname === '' && url.hash)) {
            return
          }
          
          // Intercepter uniquement les liens vers des pages publiques de l'éditeur
          // Ne pas intercepter les liens vers des pages publiées accessibles sur localhost
          const isPublicPage = pathname === '/' || 
                              pathname.startsWith('/docs') || 
                              pathname.startsWith('/contact') || 
                              pathname.startsWith('/faq') ||
                              pathname.startsWith('/legal/') ||
                              pathname.startsWith('/features') ||
                              pathname.startsWith('/templates') ||
                              pathname.startsWith('/register') ||
                              pathname.startsWith('/login')
          
          if (isPublicPage) {
            e.preventDefault()
            e.stopPropagation()
            
            // Extraire le slug de la page
            let pageSlug = 'home'
            if (pathname === '/' || pathname === '') {
              pageSlug = 'home'
            } else if (pathname.startsWith('/admin/pages-public/')) {
              const match = pathname.match(/\/admin\/pages-public\/([^\/]+)/)
              if (match) pageSlug = match[1]
            } else {
              // Extraire le slug depuis le pathname (ex: /docs -> docs, /legal/terms -> legal/terms)
              pageSlug = pathname.replace(/^\//, '').split('#')[0] || 'home'
              // Gérer les sous-pages comme legal/terms
              if (pageSlug.includes('/')) {
                // Garder le chemin complet pour les sous-pages
                pageSlug = pageSlug
              }
            }
            
            onNavigate(`/admin/pages-public/edit/${pageSlug}`)
          }
        } catch (err) {
          // Si l'URL n'est pas valide, laisser le comportement par défaut
          console.warn('URL invalide:', link.href)
        }
      }
    }

    const previewContainer = document.querySelector('.block-preview-container')
    if (previewContainer) {
      previewContainer.addEventListener('click', handleLinkClick, true) // Use capture phase
      
      // Désactiver les liens via CSS si isInteractive est false
      if (!isInteractive) {
        const links = previewContainer.querySelectorAll('a')
        links.forEach(link => {
          link.style.pointerEvents = 'none'
          link.style.cursor = 'default'
        })
      } else {
        const links = previewContainer.querySelectorAll('a')
        links.forEach(link => {
          link.style.pointerEvents = 'auto'
          link.style.cursor = 'pointer'
        })
      }
      
      return () => {
        previewContainer.removeEventListener('click', handleLinkClick, true)
      }
    }
  }, [onNavigate, inspectorMode, isInteractive])

  // Highlight selected block even when nested in containers
  useEffect(() => {
    if (!selectedBlockId) {
      // Nettoyer tous les highlights si aucun bloc n'est sélectionné
      const allHighlighted = document.querySelectorAll('[data-block-id].block-selected-highlight, [data-child-block-id].block-selected-highlight')
      allHighlighted.forEach((el) => {
        el.classList.remove('block-selected-highlight')
        ;(el as HTMLElement).style.outline = ''
        ;(el as HTMLElement).style.outlineOffset = ''
      })
      return
    }

    // Trouver le bloc sélectionné dans le DOM (peut être dans un conteneur imbriqué)
    const findAndHighlightBlock = () => {
      // Chercher par data-block-id
      let blockElement = document.querySelector(`[data-block-id="${selectedBlockId}"]`) as HTMLElement
      
      // Si pas trouvé, chercher par data-child-block-id
      if (!blockElement) {
        blockElement = document.querySelector(`[data-child-block-id="${selectedBlockId}"]`) as HTMLElement
      }

      if (blockElement) {
        // Nettoyer tous les highlights précédents
        const allHighlighted = document.querySelectorAll('.block-selected-highlight')
        allHighlighted.forEach((el) => {
          el.classList.remove('block-selected-highlight')
          ;(el as HTMLElement).style.outline = ''
          ;(el as HTMLElement).style.outlineOffset = ''
        })

        // Appliquer le highlight au bloc sélectionné
        blockElement.classList.add('block-selected-highlight')
        blockElement.style.outline = '3px solid #3b82f6'
        blockElement.style.outlineOffset = '4px'
        blockElement.style.zIndex = '9999'
        blockElement.style.position = 'relative'
        
        // Scroll vers le bloc si nécessaire
        blockElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    // Attendre un peu pour que le DOM soit mis à jour
    const timeoutId = setTimeout(findAndHighlightBlock, 100)
    
    return () => {
      clearTimeout(timeoutId)
      // Nettoyer au démontage
      const allHighlighted = document.querySelectorAll('.block-selected-highlight')
      allHighlighted.forEach((el) => {
        el.classList.remove('block-selected-highlight')
        ;(el as HTMLElement).style.outline = ''
        ;(el as HTMLElement).style.outlineOffset = ''
      })
    }
  }, [selectedBlockId])

  // Inspector mode: detect hovered elements
  useEffect(() => {
    if (!inspectorMode || !onBlockSelect) {
      // Nettoyer les outlines quand le mode inspecteur est désactivé
      if (hoveredElement) {
        hoveredElement.style.outline = ''
        hoveredElement.style.outlineOffset = ''
        setHoveredElement(null)
      }
      return
    }

    let currentHovered: HTMLElement | null = null

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      // Prioriser le hover sur un enfant si on survole un élément avec data-child-block-id
      const childElement = target.closest('[data-child-block-id]') as HTMLElement
      if (childElement) {
        const childId = childElement.getAttribute('data-child-block-id')
        if (childId && childId !== selectedBlockId && childElement !== currentHovered) {
          // Nettoyer le hover précédent
          if (currentHovered && currentHovered.getAttribute('data-block-id') !== selectedBlockId) {
            currentHovered.style.outline = ''
            currentHovered.style.outlineOffset = ''
            currentHovered.style.cursor = ''
          }
          childElement.style.outline = '2px dashed #3b82f6'
          childElement.style.outlineOffset = '2px'
          childElement.style.cursor = 'pointer'
          currentHovered = childElement
          setHoveredElement(childElement)
          return
        }
      }
      
      // Sinon, trouver le bloc le plus proche
      const blockElement = target.closest('[data-block-id]') as HTMLElement
      
      if (blockElement && blockElement !== currentHovered) {
        // Vérifier si on survole un enfant plus proche dans le DOM
        const allBlockElements = target.closest('.block-preview-container')?.querySelectorAll('[data-block-id]')
        let elementToHighlight: HTMLElement = blockElement
        
        if (allBlockElements) {
          let closestChild: HTMLElement | null = null
          let closestDistance = Infinity
          
          allBlockElements.forEach((el) => {
            const elBlockId = el.getAttribute('data-block-id')
            if (elBlockId && el.contains(target) && el !== blockElement) {
              // Calculer la distance dans le DOM
              let distance = 0
              let current: HTMLElement | null = target as HTMLElement
              while (current && current !== el && distance < 20) {
                current = current.parentElement
                distance++
              }
              if (distance < closestDistance) {
                closestDistance = distance
                closestChild = el as HTMLElement
              }
            }
          })
          
          if (closestChild && closestChild.getAttribute('data-block-id') !== selectedBlockId) {
            elementToHighlight = closestChild
          }
        }
        
        // Nettoyer le hover précédent
        if (currentHovered && currentHovered.getAttribute('data-block-id') !== selectedBlockId) {
          currentHovered.style.outline = ''
          currentHovered.style.outlineOffset = ''
          currentHovered.style.cursor = ''
        }
        
        // Ajouter le hover au nouvel élément
        currentHovered = elementToHighlight
        setHoveredElement(elementToHighlight)
        if (elementToHighlight.getAttribute('data-block-id') !== selectedBlockId) {
          elementToHighlight.style.outline = '2px dashed #3b82f6'
          elementToHighlight.style.outlineOffset = '2px'
          elementToHighlight.style.cursor = 'pointer'
        }
      }
    }

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const blockElement = target.closest('[data-block-id]') as HTMLElement
      
      // Vérifier si on sort vraiment du bloc (pas juste d'un enfant)
      if (blockElement && !blockElement.contains(e.relatedTarget as Node)) {
        if (blockElement.getAttribute('data-block-id') !== selectedBlockId) {
          blockElement.style.outline = ''
          blockElement.style.outlineOffset = ''
          blockElement.style.cursor = ''
        }
        if (currentHovered === blockElement) {
          currentHovered = null
          setHoveredElement(null)
        }
      }
    }

    const handleClick = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      const target = e.target as HTMLElement
      
      // Prioriser la sélection d'un enfant si on clique sur un élément avec data-child-block-id
      const childElement = target.closest('[data-child-block-id]') as HTMLElement
      if (childElement) {
        const childId = childElement.getAttribute('data-child-block-id')
        if (childId && onBlockSelect) {
          onBlockSelect(childId === selectedBlockId ? null : childId)
          return
        }
      }
      
      // Sinon, trouver le bloc le plus proche
      let blockElement = target.closest('[data-block-id]') as HTMLElement
      
      // Si on clique sur un enfant d'un conteneur, vérifier s'il y a un bloc enfant plus proche
      if (blockElement) {
        // Vérifier si on a cliqué directement sur un enfant (plus proche dans le DOM)
        const allBlockElements = target.closest('.block-preview-container')?.querySelectorAll('[data-block-id]')
        if (allBlockElements) {
          let closestChild: HTMLElement | null = null
          let closestDistance = Infinity
          
          allBlockElements.forEach((el) => {
            const elBlockId = el.getAttribute('data-block-id')
            if (elBlockId && el.contains(target) && el !== blockElement) {
              // Calculer la distance dans le DOM (nombre d'ancêtres)
              let distance = 0
              let current: HTMLElement | null = target as HTMLElement
              while (current && current !== el && distance < 20) {
                current = current.parentElement
                distance++
              }
              if (distance < closestDistance) {
                closestDistance = distance
                closestChild = el as HTMLElement
              }
            }
          })
          
          if (closestChild) {
            blockElement = closestChild
          }
        }
        
        const blockId = blockElement.getAttribute('data-block-id')
        if (blockId && onBlockSelect) {
          onBlockSelect(blockId === selectedBlockId ? null : blockId)
        }
      }
    }

    const previewContainer = document.querySelector('.block-preview-container')
    if (previewContainer) {
      previewContainer.addEventListener('mouseover', handleMouseOver, true)
      previewContainer.addEventListener('mouseout', handleMouseOut, true)
      previewContainer.addEventListener('click', handleClick, true)
      
      return () => {
        previewContainer.removeEventListener('mouseover', handleMouseOver, true)
        previewContainer.removeEventListener('mouseout', handleMouseOut, true)
        previewContainer.removeEventListener('click', handleClick, true)
        // Nettoyer les outlines
        if (currentHovered && currentHovered.getAttribute('data-block-id') !== selectedBlockId) {
          currentHovered.style.outline = ''
          currentHovered.style.outlineOffset = ''
          currentHovered.style.cursor = ''
        }
      }
    }
  }, [inspectorMode, onBlockSelect, selectedBlockId, hoveredElement])

  const activeBlock = activeId ? blocks.find(b => b.id === activeId) : null

  return (
    <div 
      className="w-full h-full overflow-y-auto flex flex-col block-preview-container"
      style={{
        backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
        color: theme === 'dark' ? '#f9fafb' : '#111827',
      } as React.CSSProperties}
      data-theme-isolated
      data-preview-theme={theme}
    >
      {/* Preview Header - Simulated Browser Bar */}
      <div 
        className="border-b px-4 py-2 flex items-center gap-2 flex-shrink-0"
        style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
        }}
      >
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div 
          className="flex-1 rounded px-3 py-1 text-xs"
          style={{
            backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
            color: theme === 'dark' ? '#9ca3af' : '#4b5563'
          }}
        >
          localhost:9494/
        </div>
        {inspectorMode && (
          <div 
            className="text-xs px-2 font-semibold"
            style={{ color: theme === 'dark' ? '#60a5fa' : '#2563eb' }}
          >
            🔍 Inspector Mode Active - Click on an element to select it
          </div>
        )}
        {isEditable && !inspectorMode && (
          <div 
            className="text-xs px-2"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
          >
            💡 Double-cliquez pour modifier • Clic droit pour menu contextuel
          </div>
        )}
        {isInteractive && !inspectorMode && !isEditable && (
          <div 
            className="text-xs px-2"
            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
          >
            Mode prévisualisation interactive
          </div>
        )}
      </div>

      {/* Preview Content */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-y-auto w-full">
          <div className="p-4 sm:p-6 lg:p-8 w-full max-w-full min-h-0">
            {blocks.length === 0 ? (
              <div className="text-center py-20 lg:py-32">
                <div className="max-w-md mx-auto">
                  <div 
                    className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6'
                    }}
                  >
                    <svg 
                      className="w-10 h-10" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      style={{ color: theme === 'dark' ? '#4b5563' : '#9ca3af' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <p 
                    className="text-lg font-medium mb-2"
                    style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
                  >
                    No content to preview
                  </p>
                  <p 
                    className="text-sm"
                    style={{ color: theme === 'dark' ? '#6b7280' : '#9ca3af' }}
                  >
                    Ajoutez des blocs dans l'éditeur à gauche pour voir la prévisualisation ici
                  </p>
                </div>
              </div>
            ) : (
              <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                {blocks.map((block) => (
                  <div key={block.id}>
                    <SortablePreviewBlock
                      block={block}
                      blockType={blockTypes.find((bt: BlockType) => bt.name === block.type)}
                      blockTypes={blockTypes}
                      theme={theme}
                      isSelected={selectedBlockId === block.id}
                      isInteractive={isInteractive}
                      isEditable={isEditable}
                      onClick={() => handleBlockClick(block.id)}
                      onDoubleClick={() => handleBlockDoubleClick(block.id)}
                      onRightClick={(e) => handleBlockRightClick(block.id, e)}
                    />
                  </div>
                ))}
              </SortableContext>
            )}
          </div>
        </div>
        <DragOverlay>
          {activeBlock ? (
            <div className="opacity-50">
              <BlockPreviewRenderer
                block={activeBlock}
                blockType={blockTypes.find((bt: BlockType) => bt.name === activeBlock.type)}
                blockTypes={blockTypes}
                theme={theme}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

// Mémoriser le composant pour éviter les re-renders inutiles
const MemoizedBlockPreview = memo(BlockPreview, (prevProps, nextProps) => {
  // Comparaison personnalisée pour éviter les re-renders inutiles
  if (prevProps.blocks.length !== nextProps.blocks.length) return false
  if (prevProps.selectedBlockId !== nextProps.selectedBlockId) return false
  if (prevProps.isEditable !== nextProps.isEditable) return false
  if (prevProps.inspectorMode !== nextProps.inspectorMode) return false
  
  // Comparaison rapide des IDs des blocs
  const prevIds = prevProps.blocks.map(b => b.id).join(',')
  const nextIds = nextProps.blocks.map(b => b.id).join(',')
  if (prevIds !== nextIds) return false
  
  return true // Pas de changement, ne pas re-render
})

export default MemoizedBlockPreview

// Sortable Preview Block Component
// SortablePreviewBlock et FAQSectionPreview sont maintenant dans components/

export function BlockPreviewRenderer({ block, blockType, blockTypes, theme = 'light' }: { block: Block; blockType?: BlockType; blockTypes?: BlockType[]; theme?: 'light' | 'dark' }) {
  // Liste des blocs qui ont un rendu hardcodé et doivent toujours utiliser le switch case
  const blocksWithHardcodedRender = [
    'hero', 'progress-bar', 'cta-section', 'features-grid', 'features_grid', 'pricing', 'pricing_cards', 
    'heading', 'text', 'paragraph', 'image', 'button', 'link', 'list',
    'quote', 'code', 'alert', 'divider', 'spacer', 'container', 'flex-container',
    'grid-container', 'columns', 'section', 'footer', 'header', 'contact-form',
    'faq-section', 'banner', 'tabs', 'accordion', 'carousel', 'modal',
    'table', 'chart', 'stats', 'timeline', 'calendar', 'countdown',
    'form', 'form-newsletter', 'form-search', 'form-inscription', 'form-login',
    'booking-form', 'pricing-card', 'pricing-cards-grid', 'billing-cycle-toggle',
    'rating', 'icon-box', 'card', 'testimonials', 'logo-grid', 'team-member',
    'search-bar', 'docs-grid', 'quick-start-section', 'support-hours', 'trial-info',
    'rich-text', 'markdown', 'html-raw', 'icon', 'label', 'tooltip', 'popover',
    'dropdown', 'categories', 'author-box', 'related-posts', 'table-of-contents',
    'reading-time', 'share-buttons', 'flexbox', 'grid', 'stack', 'inline', 'group',
    'wrapper', 'image-slider', 'lightbox', 'vimeo-embed', 'counter', 'card-grid',
    'logo-carousel', 'progress-circle', 'route-calculator', 'fare-calculator', 'availability-calendar',
    'captcha'
  ]
  
  // Si le bloc a un rendu hardcodé, utiliser directement le switch case
  const shouldUseHardcodedRender = blocksWithHardcodedRender.includes(block.type)
  
  // Try to render using template from database first (only if not hardcoded)
  if (!shouldUseHardcodedRender && blockType?.render_template && Object.keys(blockType.render_template).length > 0) {
    try {
      const rendered = renderBlockFromTemplate(block, blockType, blockTypes)
      if (rendered) {
        // Apply wrapper styles
        // IMPORTANT: Ne jamais utiliser padding shorthand ici pour éviter les conflits
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
        
        const wrapperStyles: React.CSSProperties = {
          position: block.position?.type || block.styles?.position || 'static',
          top: block.position?.top || block.styles?.top,
          right: block.position?.right || block.styles?.right,
          bottom: block.position?.bottom || block.styles?.bottom,
          left: block.position?.left || block.styles?.left,
          zIndex: block.styles?.z_index || block.styles?.zIndex,
          overflow: block.styles?.overflow || 'visible',
          marginTop: block.styles?.margin_vertical || block.styles?.margin_top || block.styles?.marginTop,
          marginBottom: block.styles?.margin_vertical || block.styles?.margin_bottom || block.styles?.marginBottom,
          marginLeft: block.styles?.margin_horizontal || block.styles?.margin_left || block.styles?.marginLeft,
          marginRight: block.styles?.margin_horizontal || block.styles?.margin_right || block.styles?.marginRight,
          // Padding - Utiliser uniquement les propriétés individuelles pour éviter les conflits
          ...(hasIndividualPadding ? {
            ...(paddingTop !== undefined && paddingTop !== null && paddingTop !== '' ? { paddingTop } : {}),
            ...(paddingBottom !== undefined && paddingBottom !== null && paddingBottom !== '' ? { paddingBottom } : {}),
            ...(paddingLeft !== undefined && paddingLeft !== null && paddingLeft !== '' ? { paddingLeft } : {}),
            ...(paddingRight !== undefined && paddingRight !== null && paddingRight !== '' ? { paddingRight } : {}),
          } : block.styles?.padding ? {
            padding: block.styles.padding
          } : {}),
          background: block.styles?.background && block.styles?.background.includes('gradient')
            ? block.styles?.background
            : block.styles?.background_color || block.styles?.backgroundColor || undefined,
          color: block.styles?.color,
          width: block.width,
          height: block.height,
          minWidth: block.minWidth,
          minHeight: block.minHeight,
          maxWidth: block.maxWidth,
          maxHeight: block.maxHeight,
        }
        
        // Get layout and container classes
        const layoutCols = block.layout || 12
        const layoutWidth = 
          layoutCols === 12 ? 'w-full' :
          layoutCols === 11 ? 'w-11/12' :
          layoutCols === 10 ? 'w-5/6' :
          layoutCols === 9 ? 'w-3/4' :
          layoutCols === 8 ? 'w-2/3' :
          layoutCols === 7 ? 'w-7/12' :
          layoutCols === 6 ? 'w-1/2' :
          layoutCols === 5 ? 'w-5/12' :
          layoutCols === 4 ? 'w-1/3' :
          layoutCols === 3 ? 'w-1/4' :
          layoutCols === 2 ? 'w-1/6' :
          layoutCols === 1 ? 'w-[8.333333%]' : 'w-full'
        
        const containerClass = block.container === 'container-fluid' ? 'w-full' :
          block.container === 'none' ? '' : 'max-w-7xl mx-auto'
        
        return (
          <div 
            className={`${containerClass} mb-6`} 
            style={wrapperStyles}
          >
            <div className={layoutWidth}>
              {rendered}
            </div>
          </div>
        )
      }
    } catch (error) {
      console.error('Error rendering block from template:', error)
      // Fall through to default rendering
    }
  }
  
  // Fallback to original switch-based rendering
  // Utiliser les fonctions utilitaires pour calculer les styles
  const wrapperStyles = getWrapperStyles(block, theme)
  const contentStyles = getContentStyles(block, theme)

  // Get layout width (Bootstrap 12-column system)
  const layoutCols = typeof block.layout === 'number' ? block.layout : 12
  const layoutWidth = getLayoutWidth(layoutCols)
  
  // Get container class
  const containerClass = getContainerClass(block.container, layoutCols)

  // Function to render block content (replacing IIFE for better compiler compatibility)
  const getBlockContent = (): React.ReactElement => {
    // Utiliser les cases extraits
    const caseRenderer = getBlockPreviewCase(block.type)
    if (caseRenderer) {
      const result = caseRenderer({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
      if (result) return result
    }
    
    // Fallback pour les cases non encore extraits
    return (
      <div style={wrapperStyles} className="mb-6 p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Block {block.type}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Preview not available</p>
          </div>
        </div>
      </div>
    )
  }
  
  // Ancien switch case supprimé - tous les cases sont maintenant dans preview-cases/
  // La fonction getBlockContentOld a été supprimée car elle contenait des hooks React incorrects

  const content = getBlockContent()

  // Utiliser les fonctions utilitaires importées

  // Wrap content with layout and container
  // IMPORTANT: Le layoutWidth (colonnes) doit être appliqué au container, pas à l'intérieur
  // Le container respecte la largeur définie par les colonnes
  const finalContainerClass = getContainerClass(block.container, layoutCols)
  
  // Gérer les gradients dans wrapperStyles
  const finalWrapperStyles = {
    ...wrapperStyles,
    // Si container est 'container' et layout < 12, centrer le contenu
    ...(block.container === 'container' && layoutCols < 12 ? { marginLeft: 'auto', marginRight: 'auto' } : {}),
    // Appliquer la largeur max si container est défini et layout < 12
    ...(block.container === 'container' && layoutCols < 12 ? { maxWidth: '1280px' } : {}),
    // S'assurer que les gradients s'affichent complètement
    ...(block.styles?.background_gradient ? { 
      background: block.styles.background_gradient,
      minHeight: block.minHeight || (block.children && block.children.length > 0 ? 'auto' : '100%'),
      width: '100%',
    } : {}),
    // S'assurer que les conteneurs avec enfants prennent toute la hauteur nécessaire
    ...(block.children && block.children.length > 0 && !block.minHeight ? {
      minHeight: 'auto',
    } : {}),
  }
  
  return (
    <div 
      className={`${finalContainerClass} ${layoutWidth !== 'w-full' ? layoutWidth : ''} mb-6 ${getHoverAnimationClass(block)} ${getAlignmentClasses(block)}`} 
      style={finalWrapperStyles}
    >
      {content}
    </div>
  )
}

