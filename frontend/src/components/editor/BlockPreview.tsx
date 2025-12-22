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
  const getBlockContentOld = (): React.ReactElement => {
    // Ce code est conservé temporairement pour référence mais n'est plus utilisé
    switch (block.type) {
    case 'heading': {
      const headingLevel = block.data.level || 'h2'
      const HeadingTag = headingLevel === 'h1' ? 'h1' :
                        headingLevel === 'h2' ? 'h2' :
                        headingLevel === 'h3' ? 'h3' :
                        headingLevel === 'h4' ? 'h4' : 'h2'
      // Prioriser block.styles.text_align (panneau Style) puis block.data.align (panneau Contenu) puis contentStyles.textAlign
      const headingAlign = block.styles?.text_align || block.data.align || contentStyles.textAlign || 'left'
      // Prioriser block.styles.color (défini dans le panneau Style) puis block.data.color (défini dans le panneau Contenu)
      // Appliquer la couleur même en mode sombre si elle est explicitement définie
      const headingColor = block.styles?.color || block.data.color || (theme === 'dark' ? undefined : contentStyles.color)
      return (
        <div className="mb-6" style={{ textAlign: headingAlign, width: '100%' }}>
          {HeadingTag === 'h1' && <h1 className="font-bold" style={{
            ...contentStyles,
            fontSize: block.styles?.font_size || '2rem',
            fontWeight: block.styles?.font_weight || 'bold',
            marginBottom: block.styles?.margin_bottom || '1rem',
            color: headingColor,
            textAlign: headingAlign,
            display: 'block',
            width: '100%'
          }}>
            {block.data.text || 'Title'}
          </h1>}
          {HeadingTag === 'h2' && (
            <h2 className="font-bold" style={{
              ...contentStyles,
              fontSize: block.styles?.font_size || '2rem',
              fontWeight: block.styles?.font_weight || 'bold',
              marginBottom: block.styles?.margin_bottom || '1rem',
              color: headingColor,
              textAlign: headingAlign,
              display: 'block',
              width: '100%'
            }}>
              {block.data.text || 'Title'}
            </h2>
          )}
          {HeadingTag === 'h3' && (
            <h3 className="font-bold" style={{
              ...contentStyles,
              fontSize: block.styles?.font_size || '2rem',
              fontWeight: block.styles?.font_weight || 'bold',
              marginBottom: block.styles?.margin_bottom || '1rem',
              color: headingColor,
              textAlign: headingAlign,
              display: 'block',
              width: '100%'
            }}>
              {block.data.text || 'Title'}
            </h3>
          )}
          {HeadingTag === 'h4' && (
            <h4 className="font-bold" style={{
              ...contentStyles,
              fontSize: block.styles?.font_size || '2rem',
              fontWeight: block.styles?.font_weight || 'bold',
              marginBottom: block.styles?.margin_bottom || '1rem',
              color: headingColor,
              textAlign: headingAlign,
              display: 'block',
              width: '100%'
            }}>
              {block.data.text || 'Title'}
            </h4>
          )}
        </div>
      )
    }

    case 'text': {
      const isDark = theme === 'dark'
      // Prioriser block.styles.text_align (panneau Style) puis block.data.align (panneau Contenu) puis contentStyles.textAlign
      const textAlign = block.styles?.text_align || block.data.align || contentStyles.textAlign || 'left'
      // Prioriser block.styles.color (défini dans le panneau Style) puis block.data.color (défini dans le panneau Contenu)
      const content = block.data.content || ''
      const isEmpty = !content.trim()
      const displayContent = isEmpty ? 'Entrez votre texte' : content.replace(/\n/g, '<br />')
      const textColor = isEmpty
        ? (isDark ? '#6b7280' : '#9ca3af')
        : (block.styles?.color || block.data.color || (isDark ? '#d1d5db' : (contentStyles.color || '#111827')))
      return (
        <div className="mb-6 prose max-w-none" style={{ 
          textAlign: textAlign,
          width: '100%',
          color: isDark ? '#d1d5db' : undefined
        }}>
          <div 
            dangerouslySetInnerHTML={{ 
              __html: displayContent
            }}
            style={{
              ...contentStyles,
              fontSize: block.styles?.font_size || '1rem',
              lineHeight: block.styles?.line_height || '1.6',
              color: textColor,
              textAlign: textAlign,
              display: 'block',
              width: '100%',
              fontStyle: isEmpty ? 'italic' : 'normal',
            }}
          />
        </div>
      )
    }

    case 'image': {
      const isDark = theme === 'dark'
      if (!block.data.url && !block.data.src) {
        return (
          <div 
            className="mb-6 p-8 border-2 border-dashed rounded text-center"
            style={{
              borderColor: isDark ? '#4b5563' : '#d1d5db',
              color: isDark ? '#9ca3af' : '#9ca3af'
            }}
          >
            Image not configured
          </div>
        )
      }
      const imageUrl = block.data.url || block.data.src
      // Prioriser block.styles.text_align (panneau Style) puis block.data.align (panneau Contenu) puis contentStyles.textAlign
      const imageAlign = block.styles?.text_align || block.data.align || contentStyles.textAlign || 'center'
      return (
        <div className="mb-6" style={{ width: '100%' }}>
          <div style={{ textAlign: imageAlign, width: '100%' }}>
            <img
              src={imageUrl}
              alt={block.data.alt || ''}
              className="rounded-lg shadow-md"
              loading="lazy"
              decoding="async"
              style={{
                width: block.data.width ? `${block.data.width}%` : '100%',
                maxWidth: '100%',
                height: 'auto',
                display: 'inline-block',
              }}
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage not available%3C/text%3E%3C/svg%3E'
              }}
            />
          </div>
          {block.data.caption && (
            <p 
              className="text-sm italic mt-2 text-center"
              style={{ color: theme === 'dark' ? '#9ca3af' : '#4b5563' }}
            >
              {block.data.caption}
            </p>
          )}
        </div>
      )
    }

    case 'button': {
      const buttonSizeClass = block.data.size === 'xs' ? 'px-2 py-1 text-xs' :
                              block.data.size === 'sm' ? 'px-3 py-1.5 text-sm' :
                              block.data.size === 'lg' ? 'px-8 py-4 text-lg' :
                              block.data.size === 'xl' ? 'px-10 py-5 text-xl' :
                              'px-6 py-3'
      
      const buttonStyleClass = block.data.style === 'primary' 
        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
        : block.data.style === 'secondary'
        ? 'bg-gray-600 hover:bg-gray-700 text-white'
        : block.data.style === 'ghost'
        ? `bg-transparent ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`
        : block.data.style === 'link'
        ? 'bg-transparent text-blue-600 hover:underline'
        : `border-2 border-blue-600 text-blue-600 ${theme === 'dark' ? 'hover:bg-blue-900' : 'hover:bg-blue-50'}`
      
      // Prioriser block.styles.text_align (panneau Style) puis block.data.align (panneau Contenu) puis contentStyles.textAlign
      const buttonAlign = block.styles?.text_align || block.data.align || contentStyles.textAlign || 'left'
      
      return (
        <div className="mb-6" style={{ textAlign: buttonAlign, width: '100%' }}>
          <a
            href={block.data.url || '#'}
            className={`${block.data.full_width ? 'w-full block text-center' : 'inline-block'} ${buttonSizeClass} rounded-lg font-medium transition-colors ${buttonStyleClass}`}
            style={{
              ...contentStyles,
              // Ne pas utiliser padding shorthand si on a des propriétés individuelles
              ...(block.styles?.padding && !block.styles?.padding_top && !block.styles?.padding_bottom && !block.styles?.padding_left && !block.styles?.padding_right
                ? { padding: block.styles.padding }
                : {}),
              borderRadius: contentStyles.borderRadius || block.styles?.border_radius || '0.5rem',
              backgroundColor: block.data.bg_color || contentStyles.backgroundColor || undefined,
              color: theme === 'dark' ? undefined : (block.data.text_color || contentStyles.color || undefined),
              textAlign: buttonAlign,
            }}
          >
            {block.data.text || 'Bouton'}
          </a>
        </div>
      )
    }

    case 'video': {
      const isDark = theme === 'dark'
      if (!block.data.url) {
        return (
          <div 
            style={{
              ...wrapperStyles,
              borderColor: isDark ? '#4b5563' : '#d1d5db',
              color: isDark ? '#9ca3af' : '#9ca3af'
            }} 
            className="mb-6 p-8 border-2 border-dashed rounded text-center"
          >
            Video not configured
          </div>
        )
      }
      const videoWidth = block.data.width || 100
      const videoHeight = block.data.height || 400
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.title && (
            <h3 
              className="text-lg font-semibold mb-2"
              style={{ color: isDark ? '#f9fafb' : '#111827' }}
            >
              {block.data.title}
            </h3>
          )}
          <div 
            className="rounded-lg overflow-hidden mx-auto"
            style={{
              width: `${videoWidth}%`,
              height: `${videoHeight}px`,
              maxWidth: '100%',
              backgroundColor: isDark ? '#1f2937' : '#f3f4f6'
            }}
          >
            <iframe
              src={block.data.url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )
    }

    case 'spacer': {
      const spacerDirection = block.data.direction || 'vertical'
      if (spacerDirection === 'horizontal') {
        return (
          <div 
            style={{ 
              ...wrapperStyles,
              width: `${block.data.width || 40}px`,
              height: '1px',
              display: 'inline-block',
              verticalAlign: 'middle'
            }} 
            className="mb-6"
          />
        )
      }
      return (
        <div 
          style={{ 
            ...contentStyles,
            height: `${block.data.height || 40}px`,
            display: 'block'
          }} 
          className="mb-6"
        />
      )
    }

    case 'divider': {
      const dividerDirection = block.data.direction || 'horizontal'
      const dividerStyle = block.data.style === 'solid' ? 'solid' : 
                          block.data.style === 'dashed' ? 'dashed' : 
                          block.data.style === 'dotted' ? 'dotted' : 
                          block.data.style === 'double' ? 'double' : 'solid'
      
      if (dividerDirection === 'vertical') {
        const dividerHeight = block.data.height || 100
        return (
          <div style={wrapperStyles} className="mb-6 flex items-center justify-center">
            <div 
              className="border-l-2"
              style={{ 
                borderStyle: dividerStyle,
                height: `${dividerHeight}px`,
                margin: block.styles?.margin || '0 1rem',
                borderColor: theme === 'dark' ? '#4b5563' : '#9ca3af'
              }}
            />
          </div>
        )
      }
      
      // Horizontal divider
      const dividerWidth = block.data.width === 'full' ? '100%' : 
                          block.data.width === 'half' ? '50%' : 
                          block.data.width === 'third' ? '33%' : '100%'
      return (
        <div style={wrapperStyles} className="mb-6 flex justify-center">
          <div 
            style={{ 
              borderStyle: dividerStyle,
              borderColor: theme === 'dark' ? '#4b5563' : '#9ca3af',
              width: dividerWidth,
              margin: block.styles?.margin || '2rem 0'
            }}
          />
        </div>
      )
    }

    case 'alert': {
      const variant = block.data.variant || 'info'
      const variantStyles = {
        info: {
          bg: theme === 'dark' ? '#1e3a5f' : '#dbeafe',
          border: theme === 'dark' ? '#1e40af' : '#93c5fd',
          text: theme === 'dark' ? '#bfdbfe' : '#1e40af',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          ),
        },
        success: {
          bg: theme === 'dark' ? '#1e3a2e' : '#d1fae5',
          border: theme === 'dark' ? '#166534' : '#6ee7b7',
          text: theme === 'dark' ? '#86efac' : '#166534',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
        },
        warning: {
          bg: theme === 'dark' ? '#422006' : '#fef3c7',
          border: theme === 'dark' ? '#854d0e' : '#fde047',
          text: theme === 'dark' ? '#fde047' : '#854d0e',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ),
        },
        error: {
          bg: theme === 'dark' ? '#7f1d1d' : '#fee2e2',
          border: theme === 'dark' ? '#991b1b' : '#fca5a5',
          text: theme === 'dark' ? '#fca5a5' : '#991b1b',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ),
        },
      }
      const style = variantStyles[variant as keyof typeof variantStyles] || variantStyles.info
      
      return (
        <div style={wrapperStyles} className="mb-6">
          <div 
            className="border-l-4 rounded-lg p-4"
            style={{
              backgroundColor: style.bg as string,
              borderColor: style.border as string,
              color: style.text as string
            }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {style.icon}
              </div>
              <div className="ml-3 flex-1">
                {block.data.title && (
                  <h3 className="text-sm font-semibold mb-1">
                    {block.data.title}
                  </h3>
                )}
                {block.data.message ? (
                  <p className="text-sm">{block.data.message}</p>
                ) : (
                  <p className="text-sm italic opacity-75">No message configured</p>
                )}
              </div>
              {block.data.dismissible && (
                <div className="ml-4 flex-shrink-0">
                  <button
                    type="button"
                    className={`inline-flex ${style.text} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent rounded-md`}
                    aria-label="Fermer"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    case 'code': {
      const code = block.data.code || ''
      const language = block.data.language || 'plaintext'
      const showLineNumbers = block.data.showLineNumbers || false
      const showCopyButton = block.data.showCopyButton !== false
      
      // Fonction pour copier le code
      const handleCopyCode = async () => {
        try {
          await navigator.clipboard.writeText(code)
          // Afficher un feedback visuel temporaire
          const button = document.activeElement as HTMLElement
          if (button) {
            const originalText = button.textContent
            button.textContent = '✓ Copié!'
            button.classList.add('text-green-400')
            setTimeout(() => {
              button.textContent = originalText
              button.classList.remove('text-green-400')
            }, 2000)
          }
        } catch (err) {
          console.error('Error copying code:', err)
        }
      }
      
      // Fonction pour obtenir le nom du langage pour affichage
      const getLanguageLabel = (lang: string) => {
        const labels: Record<string, string> = {
          javascript: 'JavaScript',
          typescript: 'TypeScript',
          python: 'Python',
          java: 'Java',
          cpp: 'C++',
          c: 'C',
          csharp: 'C#',
          php: 'PHP',
          ruby: 'Ruby',
          go: 'Go',
          rust: 'Rust',
          html: 'HTML',
          css: 'CSS',
          scss: 'SCSS',
          json: 'JSON',
          xml: 'XML',
          sql: 'SQL',
          bash: 'Bash',
          shell: 'Shell',
          yaml: 'YAML',
          markdown: 'Markdown',
          plaintext: 'Texte brut',
        }
        return labels[lang] || lang
      }
      
      const isDark = theme === 'dark'
      return (
        <div style={wrapperStyles} className="mb-6">
          <div 
            className="rounded-lg overflow-hidden border"
            style={{
              backgroundColor: isDark ? '#030712' : '#111827',
              borderColor: isDark ? '#1f2937' : '#374151',
            }}
          >
            {/* Header avec langage et bouton copier */}
            <div 
              className="flex items-center justify-between px-4 py-2 border-b"
              style={{
                backgroundColor: isDark ? '#111827' : '#1f2937',
                borderColor: isDark ? '#1f2937' : '#374151',
              }}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span 
                  className="text-xs font-medium"
                  style={{ color: isDark ? '#9ca3af' : '#d1d5db' }}
                >
                  {getLanguageLabel(language)}
                </span>
              </div>
              {showCopyButton && code && (
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors rounded"
                  style={{
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? '#1f2937' : '#374151'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                  title="Copier le code"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copier
                </button>
              )}
            </div>
            
            {/* Code content */}
            <div className="relative">
              <pre className={`m-0 p-4 overflow-x-auto text-sm font-mono ${showLineNumbers ? 'pl-12' : ''}`}>
                {code ? (
                  <code 
                    className={showLineNumbers ? 'block' : ''}
                    style={{ color: isDark ? '#e5e7eb' : '#f3f4f6' }}
                  >
                    {showLineNumbers ? (
                      code.split('\n').map((line: string, index: number) => (
                        <div key={index} className="flex">
                          <span 
                            className="inline-block w-8 text-right pr-4 select-none"
                            style={{ color: isDark ? '#4b5563' : '#6b7280' }}
                          >
                            {index + 1}
                          </span>
                          <span className="flex-1">{line || ' '}</span>
                        </div>
                      ))
                    ) : (
                      code
                    )}
                  </code>
                ) : (
                  <span 
                    className="italic"
                    style={{ color: isDark ? '#4b5563' : '#6b7280' }}
                  >
                    No code configured
                  </span>
                )}
              </pre>
            </div>
          </div>
        </div>
      )
    }

    case 'container': {
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
            (() => {
              const isDark = theme === 'dark'
              return (
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
              )
            })()
          )}
        </div>
      )
    }
    
    case 'flex-container': {
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
                {block.children.map((child: any, idx: number) => {
                  const isDark = theme === 'dark'
                  return (
                    <div 
                      key={idx} 
                      className="p-2 rounded text-xs"
                      style={{
                        backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                        color: isDark ? '#d1d5db' : '#374151'
                      }}
                    >
                      Bloc {idx + 1}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )
    }
    
    case 'grid-container': {
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
                {block.children.map((child: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="p-2 rounded text-xs"
                    style={{
                      backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                      color: isDark ? '#d1d5db' : '#374151'
                    }}
                  >
                    Bloc {idx + 1}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }
    
    case 'columns': {
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

    case 'rows': {
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
          }          )}
        </div>
      )
    }

    case 'table': {
      const tableRows = block.data.rows || 3
      const tableCols = block.data.columns || 3
      const tableData = block.data.table_data || Array(tableRows).fill(null).map(() => Array(tableCols).fill(''))
      const hasHeader = block.data.has_header || false
      const bordered = block.data.bordered !== false
      
      const isDark = theme === 'dark'
      return (
        <div style={wrapperStyles} className="mb-6 overflow-x-auto">
          <table 
            className="w-full"
            style={{
              border: bordered ? `1px solid ${isDark ? '#4b5563' : '#d1d5db'}` : undefined
            }}
          >
            {hasHeader && tableData.length > 0 && (
              <thead>
                <tr style={{ backgroundColor: isDark ? '#1f2937' : '#f3f4f6' }}>
                  {tableData[0].map((cell: string, colIndex: number) => (
                    <th 
                      key={colIndex} 
                      className={`px-4 py-2 text-left font-semibold ${bordered ? 'border' : ''}`}
                      style={{
                        color: isDark ? '#f3f4f6' : '#111827',
                        borderColor: bordered ? (isDark ? '#4b5563' : '#d1d5db') : undefined
                      }}
                    >
                      {cell || `En-tête ${colIndex + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {(hasHeader ? tableData.slice(1) : tableData).map((row: string[], rowIndex: number) => (
                <tr 
                  key={rowIndex}
                  style={{
                    backgroundColor: 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? '#1f2937' : '#f9fafb'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {row.map((cell: string, colIndex: number) => (
                    <td 
                      key={colIndex} 
                      className={`px-4 py-2 ${bordered ? 'border' : ''}`}
                      style={{
                        color: isDark ? '#d1d5db' : '#374151',
                        borderColor: bordered ? (isDark ? '#4b5563' : '#d1d5db') : undefined
                      }}
                    >
                      {cell || `Cellule ${rowIndex + 1},${colIndex + 1}`}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    case 'paragraph': {
      const isDark = theme === 'dark'
      // Prioriser block.styles.text_align (panneau Style) puis block.data.align (panneau Contenu) puis contentStyles.textAlign
      const paragraphAlign = block.styles?.text_align || block.data.align || contentStyles.textAlign || 'left'
      // Prioriser block.styles.color (défini dans le panneau Style) puis block.data.color (défini dans le panneau Contenu)
      const paragraphColor = block.styles?.color || block.data.color || (isDark ? '#d1d5db' : (contentStyles.color || '#374151'))
      return (
        <div style={{ ...wrapperStyles, width: '100%' }} className="mb-6">
          <p 
            className="text-base leading-relaxed whitespace-pre-wrap"
            style={{ 
              ...contentStyles,
              color: paragraphColor,
              textAlign: paragraphAlign,
              display: 'block',
              width: '100%'
            }}
          >
            {block.data.content || 'Empty paragraph'}
          </p>
        </div>
      )
    }

    case 'line': {
      const isDark = theme === 'dark'
      // Prioriser block.styles.text_align (panneau Style) puis block.data.align (panneau Contenu) puis contentStyles.textAlign
      const lineAlign = block.styles?.text_align || block.data.align || contentStyles.textAlign || 'left'
      // Prioriser block.styles.color (défini dans le panneau Style) puis block.data.color (défini dans le panneau Contenu)
      const lineColor = block.styles?.color || block.data.color || (isDark ? '#d1d5db' : (contentStyles.color || '#374151'))
      return (
        <div style={{ ...wrapperStyles, width: '100%' }} className="mb-6">
          <span 
            className="text-base"
            style={{ 
              ...contentStyles,
              color: lineColor,
              textAlign: lineAlign,
              display: 'block',
              width: '100%'
            }}
          >
            {block.data.text || 'Single line text'}
          </span>
        </div>
      )
    }

    case 'form-newsletter': {
      const isDark = theme === 'dark'
      return (
        <div 
          style={{
            ...wrapperStyles,
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderColor: isDark ? '#374151' : '#e5e7eb'
          }} 
          className="mb-6 p-6 rounded-lg shadow-md border"
        >
          {block.data.title && (
            <h3 
              className="text-xl font-bold mb-2"
              style={{ color: isDark ? '#f3f4f6' : '#111827' }}
            >
              {block.data.title}
            </h3>
          )}
          {block.data.description && (
            <p 
              className="text-sm mb-4"
              style={{ color: isDark ? '#9ca3af' : '#4b5563' }}
            >
              {block.data.description}
            </p>
          )}
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Votre email"
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{
                borderColor: isDark ? '#4b5563' : '#d1d5db',
                backgroundColor: isDark ? '#374151' : '#ffffff',
                color: isDark ? '#f3f4f6' : '#111827'
              }}
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {block.data.button_text || 'S\'inscrire'}
            </button>
          </form>
        </div>
      )
    }

    case 'form-search': {
      const isDark = theme === 'dark'
      return (
        <div style={wrapperStyles} className="mb-6">
          <form className="flex gap-2">
            <input
              type="search"
              placeholder={block.data.placeholder || 'Rechercher...'}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{
                borderColor: isDark ? '#4b5563' : '#d1d5db',
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                color: isDark ? '#f3f4f6' : '#111827'
              }}
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {block.data.button_text || 'Rechercher'}
            </button>
          </form>
        </div>
      )
    }

    case 'form-inscription': {
      const isDark = theme === 'dark'
      return (
        <div 
          style={{
            ...wrapperStyles,
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderColor: isDark ? '#374151' : '#e5e7eb'
          }} 
          className="mb-6 p-6 rounded-lg shadow-md border"
        >
          {block.data.title && (
            <h3 
              className="text-xl font-bold mb-4"
              style={{ color: isDark ? '#f3f4f6' : '#111827' }}
            >
              {block.data.title}
            </h3>
          )}
          <form className="space-y-4">
            {block.data.show_name !== false && (
              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ color: isDark ? '#d1d5db' : '#374151' }}
                >
                  Nom complet
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{
                    borderColor: isDark ? '#4b5563' : '#d1d5db',
                    backgroundColor: isDark ? '#374151' : '#ffffff',
                    color: isDark ? '#f3f4f6' : '#111827'
                  }}
                />
              </div>
            )}
            {block.data.show_email !== false && (
              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ color: isDark ? '#d1d5db' : '#374151' }}
                >
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{
                    borderColor: isDark ? '#4b5563' : '#d1d5db',
                    backgroundColor: isDark ? '#374151' : '#ffffff',
                    color: isDark ? '#f3f4f6' : '#111827'
                  }}
                />
              </div>
            )}
            {block.data.show_password !== false && (
              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ color: isDark ? '#d1d5db' : '#374151' }}
                >
                  Mot de passe
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{
                    borderColor: isDark ? '#4b5563' : '#d1d5db',
                    backgroundColor: isDark ? '#374151' : '#ffffff',
                    color: isDark ? '#f3f4f6' : '#111827'
                  }}
                />
              </div>
            )}
            {block.data.show_phone && (
              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ color: isDark ? '#d1d5db' : '#374151' }}
                >
                  Téléphone
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{
                    borderColor: isDark ? '#4b5563' : '#d1d5db',
                    backgroundColor: isDark ? '#374151' : '#ffffff',
                    color: isDark ? '#f3f4f6' : '#111827'
                  }}
                />
              </div>
            )}
            {block.data.enable_captcha && (
              <div className="mt-4">
                <Captcha
                  onVerify={(isValid) => {
                    // La validation est gérée par le composant Captcha lui-même
                  }}
                  theme={block.data.captcha_theme || 'light'}
                />
              </div>
            )}
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {block.data.button_text || 'S\'inscrire'}
            </button>
          </form>
        </div>
      )
    }

    case 'testimonials': {
      const testimonials = block.data.testimonials || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.title && (
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
              {block.data.title}
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial: any, index: number) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                {testimonial.avatar && (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                  "{testimonial.content || 'Témoignage...'}"
                </p>
                <div className="text-center">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {testimonial.name || 'Nom'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role || 'Rôle'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    case 'pricing': {
      const PricingPreview = () => {
        const [plans, setPlans] = useState<any[]>(block.data.plans || [])
        const [loading, setLoading] = useState(false)
        
        useEffect(() => {
          // Vérifier si le chargement API est autorisé
          // Uniquement pour les super admins dans le projet public
          if (block.data.source === 'dynamic' || block.data.source === 'api') {
            try {
              const isSuperAdmin = authService.isSuperAdmin()
              const isPublicProject = typeof window !== 'undefined' && window.location.pathname.includes('/admin/pages-public/edit/')
              
              // Si l'utilisateur n'est pas super admin OU pas dans le projet public, ne pas charger depuis l'API
              if (!isSuperAdmin || !isPublicProject) {
                console.warn('Chargement API pricing désactivé: nécessite super admin dans le projet public')
                setPlans(block.data.plans || [])
                return
              }
            } catch (e) {
              // Si erreur lors de la vérification, ne pas charger depuis l'API
              console.warn('Erreur lors de la vérification des permissions pour pricing API:', e)
              setPlans(block.data.plans || [])
              return
            }
          }
          
          if (block.data.source === 'dynamic' || block.data.source === 'api') {
            setLoading(true)
            const apiUrl = block.data.api_endpoint || '/api/pricing-plans/'
            // Use absolute URL for API calls
            const fullUrl = apiUrl.startsWith('http') ? apiUrl : `${window.location.origin}${apiUrl}`
            fetch(fullUrl, {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              credentials: 'include',
            })
              .then(async res => {
                if (!res.ok) {
                  // Si c'est une erreur 401/403, ne pas essayer de parser en JSON
                  if (res.status === 401 || res.status === 403) {
                    const text = await res.text()
                    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
                      throw new Error('Authentification requise')
                    }
                  }
                  throw new Error(`HTTP error! status: ${res.status}`)
                }
                const contentType = res.headers.get('content-type') || ''
                // Vérifier que c'est bien du JSON
                if (!contentType.includes('application/json')) {
                  const text = await res.text()
                  // Si c'est du HTML, c'est probablement une page de login ou d'erreur
                  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
                    throw new Error('Réponse HTML reçue au lieu de JSON (authentification requise?)')
                  }
                  throw new Error(`Response is not JSON (Content-Type: ${contentType})`)
                }
                return res.json()
              })
              .then(data => {
                const plansData = Array.isArray(data) ? data : (data.results || data.plans || [])
                setPlans(plansData.filter((p: any) => p.is_active).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)))
              })
              .catch(err => {
                // Ne logger l'error que si ce n'est pas une erreur d'authentification attendue
                if (!err.message.includes('Authentification requise') && !err.message.includes('Réponse HTML')) {
                  console.error('Error loading plans:', err)
                }
                setPlans([])
              })
              .finally(() => setLoading(false))
          }
        }, [block.data.source, block.data.api_endpoint])
        
        const formatPrice = (price: number) => {
          return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)
        }
        
        return (
          <div style={wrapperStyles} className="mb-6">
            {block.data.show_title !== false && block.data.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
                {block.data.title}
              </h2>
            )}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : plans.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full min-w-0 overflow-hidden">
                {plans.map((plan: any, index: number) => {
                  // Calculer le prix pour l'affichage
                  const priceMonthly = parseFloat(plan.price_monthly || plan.price || 0)
                  const priceYearly = plan.price_yearly ? parseFloat(plan.price_yearly) : null
                  
                  // Déterminer le style du bouton
                  const buttonStyle = plan.button_style || (plan.is_featured ? 'primary' : 'secondary')
                  const buttonStylesMap: Record<string, string> = {
                    primary: 'bg-blue-600 text-white hover:bg-blue-700',
                    secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600',
                    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900'
                  }
                  const buttonClasses = buttonStylesMap[buttonStyle] || buttonStylesMap.primary
                  
                  // URL du bouton
                  const buttonUrl = plan.button_url || `/register?plan=${plan.slug || plan.id || index}`
                  const buttonText = plan.button_text || `Choisir ${plan.name || 'ce plan'}`
                  
                  return (
                    <div
                      key={plan.id || index}
                      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 relative min-w-0 overflow-hidden ${
                        plan.is_featured ? 'ring-2 sm:ring-4 ring-blue-500 sm:scale-105' : ''
                      }`}
                    >
                      {/* Badge personnalisé ou POPULAIRE par défaut si featured */}
                      {(plan.badge || plan.is_featured) && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                            {plan.badge || 'POPULAIRE'}
                          </span>
                        </div>
                      )}
                      
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {plan.name || `Plan ${index + 1}`}
                      </h3>
                      
                      {plan.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>
                      )}
                      
                      <div className="mb-6">
                        {priceMonthly > 0 ? (
                          <>
                            <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
                              {formatPrice(priceMonthly)}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">/mois</span>
                            {priceYearly && priceYearly > 0 && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                ou {formatPrice(priceYearly)}/an 
                                {block.data?.show_discount !== false && priceMonthly > 0 && priceYearly < (priceMonthly * 12) && (
                                  <span className="ml-1 text-green-600 dark:text-green-400 font-semibold">
                                    (-{Math.round((1 - (priceYearly / (priceMonthly * 12))) * 100)}%)
                                  </span>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                            Gratuit
                          </span>
                        )}
                      </div>
                      
                      <ul className="space-y-3 mb-8">
                        {/* Fonctionnalités personnalisées */}
                        {plan.features && plan.features.length > 0 ? (
                          plan.features.map((feature: string, i: number) => (
                            feature && (
                              <li key={i} className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                              </li>
                            )
                          ))
                        ) : (
                          // Default features if none are defined (for API compatibility)
                          <>
                            {plan.max_sites && (
                              <li className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                <span className="text-gray-700 dark:text-gray-300">{plan.max_sites} site{(plan.max_sites || 1) > 1 ? 's' : ''}</span>
                              </li>
                            )}
                            {plan.max_users && (
                              <li className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                <span className="text-gray-700 dark:text-gray-300">{plan.max_users} utilisateur{(plan.max_users || 1) > 1 ? 's' : ''} max</span>
                              </li>
                            )}
                            {plan.max_storage_gb && (
                              <li className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                <span className="text-gray-700 dark:text-gray-300">{plan.max_storage_gb} GB de stockage</span>
                              </li>
                            )}
                          </>
                        )}
                      </ul>
                      
                      {buttonText && buttonUrl && (
                        <a
                          href={buttonUrl}
                          className={`block w-full text-center py-3 rounded-lg font-bold transition-colors ${buttonClasses}`}
                        >
                          {buttonText}
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                No pricing plan available
              </div>
            )}
          </div>
        )
      }
      return <PricingPreview />
    }

    case 'pricing_cards': {
      // pricing_cards est un alias pour pricing avec show_plans: true par défaut
      const pricingCardsBlock = {
        ...block,
        data: {
          ...block.data,
          source: block.data.source || 'dynamic',
          show_plans: block.data.show_plans !== undefined ? block.data.show_plans : true,
          show_title: block.data.show_title !== undefined ? block.data.show_title : true,
        }
      }
      // Capturer les variables du scope parent
      const currentTheme = theme
      const currentWrapperStyles = wrapperStyles
      // Utiliser le même rendu que 'pricing' mais avec un style spécifique
      const PricingCardsPreview = () => {
        const [plans, setPlans] = useState<any[]>((pricingCardsBlock.data as any)?.plans || [])
        const [loading, setLoading] = useState(false)
        
        useEffect(() => {
          // Toujours charger les plans pour pricing_cards (show_plans est true par défaut)
          // Charger si show_plans n'est pas explicitement false
          const shouldLoad = pricingCardsBlock.data.show_plans !== false
          if (shouldLoad) {
            setLoading(true)
            // Utiliser l'URL correcte de l'API
            const apiUrl = (pricingCardsBlock.data as any)?.api_endpoint || '/api/pricing-plans/'
            // Construire l'URL complète en utilisant l'origine du backend
            const backendUrl = typeof window !== 'undefined' 
              ? (window.location.origin.includes('localhost') ? 'http://localhost:9495' : window.location.origin)
              : 'http://localhost:9495'
            const fullUrl = apiUrl.startsWith('http') ? apiUrl : `${backendUrl}${apiUrl}`
            
            fetch(fullUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              credentials: 'include',
            })
              .then(async res => {
                if (!res.ok) {
                  // Pour les erreurs 401/403, ne pas bloquer - l'API peut être publique
                  if (res.status === 401 || res.status === 403) {
                    const text = await res.text()
                    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
                      // Essayer quand même de parser si c'est du JSON
                      try {
                        return await res.json()
                      } catch {
                        throw new Error('Authentification requise')
                      }
                    }
                  }
                  if (res.status === 404) {
                    throw new Error('Endpoint non trouvé')
                  }
                  throw new Error(`HTTP error! status: ${res.status}`)
                }
                const contentType = res.headers.get('content-type') || ''
                if (!contentType.includes('application/json')) {
                  const text = await res.text()
                  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
                    throw new Error('Réponse HTML reçue au lieu de JSON')
                  }
                  throw new Error(`Response is not JSON (Content-Type: ${contentType})`)
                }
                return res.json()
              })
              .then(data => {
                // Gérer différents formats de réponse
                let plansData: any[] = []
                if (Array.isArray(data)) {
                  plansData = data
                } else if (data.results && Array.isArray(data.results)) {
                  plansData = data.results
                } else if (data.plans && Array.isArray(data.plans)) {
                  plansData = data.plans
                } else if (data.data && Array.isArray(data.data)) {
                  plansData = data.data
                }
                
                // Filtrer et trier les plans
                let filteredPlans = plansData
                  .filter((p: any) => p.is_active !== false) // Inclure si is_active n'est pas défini ou est true
                  .sort((a: any, b: any) => {
                    // Trier par order, puis par prix
                    const orderA = a.order !== undefined ? a.order : 999
                    const orderB = b.order !== undefined ? b.order : 999
                    if (orderA !== orderB) return orderA - orderB
                    const priceA = parseFloat(a.price_monthly || a.price || 0)
                    const priceB = parseFloat(b.price_monthly || b.price || 0)
                    return priceA - priceB
                  })
                
                // Appliquer l'override du plan "featured" si défini
                const featuredOverride = (pricingCardsBlock.data as any)?.featured_plan_override
                if (featuredOverride) {
                  // Réinitialiser tous les plans à is_featured = false
                  filteredPlans = filteredPlans.map((p: any) => ({ ...p, is_featured: false }))
                  
                  // Trouver le plan correspondant à l'override (par ID ou slug)
                  const overridePlan = filteredPlans.find((p: any) => {
                    const overrideValue = featuredOverride.toString().toLowerCase()
                    const planId = p.id?.toString().toLowerCase()
                    const planSlug = p.slug?.toLowerCase()
                    return planId === overrideValue || planSlug === overrideValue
                  })
                  
                  // Marquer le plan trouvé comme featured
                  if (overridePlan) {
                    filteredPlans = filteredPlans.map((p: any) => 
                      p.id === overridePlan.id ? { ...p, is_featured: true } : p
                    )
                  }
                }
                
                setPlans(filteredPlans)
              })
              .catch(err => {
                console.error('Error loading pricing plans:', err)
                setPlans([])
              })
              .finally(() => setLoading(false))
          }
        }, [pricingCardsBlock.data.source, (pricingCardsBlock.data as any)?.api_endpoint, pricingCardsBlock.data.show_plans, (pricingCardsBlock.data as any)?.featured_plan_override])
        
        const formatPrice = (price: number) => {
          return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)
        }
        
        const isDark = currentTheme === 'dark'
        
        return (
          <div 
            style={{
              ...currentWrapperStyles,
              backgroundColor: isDark ? '#111827' : '#f9fafb',
              color: isDark ? '#f9fafb' : '#111827'
            }} 
            className={`mb-6 py-12 px-4 sm:px-6 lg:px-8 overflow-visible ${isDark ? 'dark' : ''}`}
          >
            {pricingCardsBlock.data.show_title !== false && (pricingCardsBlock.data as any)?.title && (
              <div className="text-center mb-4">
                <h2 
                  className="text-3xl md:text-4xl font-bold text-center mb-4"
                  style={{ color: isDark ? '#f9fafb' : '#111827' }}
                >
                  {(pricingCardsBlock.data as any).title}
                </h2>
                {(pricingCardsBlock.data as any)?.subtitle && (
                  <p 
                    className="text-center mb-12 max-w-2xl mx-auto"
                    style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
                  >
                    {(pricingCardsBlock.data as any).subtitle}
                  </p>
                )}
              </div>
            )}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : plans.length > 0 ? (
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full min-w-0 overflow-visible">
                  {plans.map((plan: any, index: number) => {
                    // Gérer les prix qui peuvent être des strings (Decimal en Python) ou des nombres
                    const priceMonthly = typeof plan.price_monthly === 'string' 
                      ? parseFloat(plan.price_monthly.replace(',', '.')) 
                      : parseFloat(plan.price_monthly || plan.price || 0)
                    const priceYearly = plan.price_yearly 
                      ? (typeof plan.price_yearly === 'string' 
                          ? parseFloat(plan.price_yearly.replace(',', '.')) 
                          : parseFloat(plan.price_yearly))
                      : null
                    
                    const buttonStyle = plan.button_style || (plan.is_featured ? 'primary' : 'secondary')
                    // Styles de bouton basés sur le thème
                    const getButtonStyle = (style: string) => {
                      if (style === 'primary') {
                        return {
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          border: 'none'
                        }
                      } else if (style === 'secondary') {
                        return {
                          backgroundColor: isDark ? '#374151' : '#e5e7eb',
                          color: isDark ? '#ffffff' : '#111827',
                          border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`
                        }
                      } else { // outline
                        return {
                          backgroundColor: 'transparent',
                          color: '#2563eb',
                          border: '2px solid #2563eb'
                        }
                      }
                    }
                    const buttonStyleObj = getButtonStyle(buttonStyle)
                    
                    const buttonUrl = plan.button_url || `/register?plan=${plan.slug || plan.id || index}`
                    const buttonText = plan.button_text || `Choisir ${plan.name || 'ce plan'}`
                    
                    return (
                      <div
                        key={plan.id || index}
                        className={`rounded-xl shadow-lg relative min-w-0 overflow-visible flex flex-col ${
                          plan.is_featured 
                            ? 'ring-4 ring-blue-500 scale-105 sm:scale-110 z-10 shadow-2xl p-6 sm:p-8 lg:p-10' 
                            : 'p-4 sm:p-6 lg:p-8 shadow-md hover:shadow-lg transition-shadow'
                        } ${(plan.badge || plan.is_featured) ? 'pt-10 sm:pt-12 lg:pt-14' : ''} min-h-[500px] sm:min-h-[550px]`}
                        style={{
                          backgroundColor: isDark ? '#1f2937' : '#ffffff',
                          color: isDark ? '#f9fafb' : '#111827'
                        }}
                      >
                        {(plan.badge || plan.is_featured) && (
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                            <span className={`text-white px-5 py-2 rounded-full text-sm sm:text-base font-bold shadow-xl ${
                              plan.is_featured ? 'bg-blue-600' : 'bg-blue-500'
                            }`}>
                              {plan.badge || 'POPULAIRE'}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex-grow flex flex-col">
                          <h3 
                            className={`font-bold mb-2 ${
                              plan.is_featured ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
                            }`}
                            style={{ color: isDark ? '#f9fafb' : '#111827' }}
                          >
                            {plan.name || `Plan ${index + 1}`}
                          </h3>
                          
                          {plan.description && (
                            <p 
                              className={`mb-6 ${
                                plan.is_featured ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
                              }`}
                              style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
                            >
                              {plan.description}
                            </p>
                          )}
                        
                        <div className={`mb-6 ${plan.is_featured ? 'mb-8' : ''}`}>
                          {priceMonthly > 0 ? (
                            <>
                              <span 
                                className={`font-extrabold ${
                                  plan.is_featured ? 'text-5xl sm:text-6xl' : 'text-4xl sm:text-5xl'
                                }`}
                                style={{ color: isDark ? '#f9fafb' : '#111827' }}
                              >
                                {formatPrice(priceMonthly)}
                              </span>
                              <span 
                                className={plan.is_featured ? 'text-lg' : 'text-base'}
                                style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
                              >
                                /mois
                              </span>
                              {priceYearly && priceYearly > 0 && (
                                <div 
                                  className="text-sm mt-1"
                                  style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                                >
                                  ou {formatPrice(priceYearly)}/an 
                                  {block.data?.show_discount !== false && priceMonthly > 0 && priceYearly < (priceMonthly * 12) && (
                                    <span 
                                      className="ml-1 font-semibold"
                                      style={{ color: isDark ? '#34d399' : '#059669' }}
                                    >
                                      (économisez {Math.round((1 - (priceYearly / (priceMonthly * 12))) * 100)}%)
                                    </span>
                                  )}
                                </div>
                              )}
                            </>
                          ) : (
                            <span 
                              className="text-2xl font-bold"
                              style={{ color: isDark ? '#9ca3af' : '#4b5563' }}
                            >
                              Gratuit
                            </span>
                          )}
                        </div>
                        
                        <ul className={`space-y-3 mb-8 flex-grow ${plan.is_featured ? 'space-y-4' : ''}`}>
                          {/* Afficher les features du plan si disponibles */}
                          {plan.features && Array.isArray(plan.features) && plan.features.length > 0 ? (
                            plan.features.map((feature: string, i: number) => (
                              feature && (
                                <li key={i} className="flex items-start">
                                  <span className="text-green-500 mr-2 mt-0.5 flex-shrink-0">✓</span>
                                  <span 
                                    className="text-sm"
                                    style={{ color: isDark ? '#d1d5db' : '#374151' }}
                                  >
                                    {feature}
                                  </span>
                                </li>
                              )
                            ))
                          ) : (
                            /* Fallback: afficher max_sites, max_users, max_storage_gb si pas de features */
                            <>
                              {plan.max_sites !== undefined && plan.max_sites !== null && (
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span style={{ color: isDark ? '#d1d5db' : '#374151' }}>
                                    {plan.max_sites} site{(plan.max_sites || 1) > 1 ? 's' : ''}
                                  </span>
                                </li>
                              )}
                              {plan.max_users !== undefined && plan.max_users !== null && (
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span style={{ color: isDark ? '#d1d5db' : '#374151' }}>
                                    {plan.max_users} utilisateur{(plan.max_users || 1) > 1 ? 's' : ''} max
                                  </span>
                                </li>
                              )}
                              {plan.max_storage_gb !== undefined && plan.max_storage_gb !== null && (
                                <li className="flex items-center">
                                  <span className="text-green-500 mr-2">✓</span>
                                  <span style={{ color: isDark ? '#d1d5db' : '#374151' }}>
                                    {plan.max_storage_gb} GB de stockage
                                  </span>
                                </li>
                              )}
                            </>
                          )}
                        </ul>
                        
                        </div>
                        
                        {buttonText && buttonUrl && (
                          <a
                            href={buttonUrl}
                            className={`block w-full text-center rounded-lg font-bold transition-all hover:scale-105 ${
                              plan.is_featured 
                                ? 'py-4 text-lg shadow-lg' 
                                : 'py-3 text-base'
                            }`}
                            style={buttonStyleObj}
                            onMouseEnter={(e) => {
                              if (buttonStyle === 'primary') {
                                e.currentTarget.style.backgroundColor = '#1d4ed8'
                              } else if (buttonStyle === 'secondary') {
                                e.currentTarget.style.backgroundColor = isDark ? '#4b5563' : '#d1d5db'
                              } else {
                                e.currentTarget.style.backgroundColor = isDark ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.05)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              Object.assign(e.currentTarget.style, buttonStyleObj)
                            }}
                          >
                            {buttonText}
                          </a>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                No pricing plan available
              </div>
            )}
          </div>
        )
      }
      return <PricingCardsPreview />
    }

    case 'timeline': {
      const events = block.data.events || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.title && (
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
              {block.data.title}
            </h2>
          )}
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600 transform md:-translate-x-1/2"></div>
            {events.map((event: any, index: number) => (
              <div key={index} className="relative mb-8 md:flex md:items-center">
                <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8 md:ml-auto'}`}>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">
                      {event.date || 'Date'}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {event.title || 'Title'}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {event.description || 'Description'}
                    </p>
                  </div>
                </div>
                <div className="absolute left-4 md:left-1/2 w-8 h-8 bg-blue-600 rounded-full border-4 border-white dark:border-gray-800 transform md:-translate-x-1/2 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pl-8' : 'md:pr-8 md:text-right'}`}></div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    case 'accordion': {
      return renderAccordion({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'stats': {
      const stats = block.data.stats || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.title && (
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
              {block.data.title}
            </h2>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat: any, index: number) => (
              <div key={index} className="text-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                {stat.icon && (
                  <div className="text-4xl mb-2">{stat.icon}</div>
                )}
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.value || '0'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label || 'Label'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
      }

    case 'social-links': {
      const socialLinks = block.data.links || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.title && (
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
              {block.data.title}
            </h2>
          )}
          <div className="flex flex-wrap justify-center gap-4">
            {socialLinks.map((link: any, index: number) => (
              <a
                key={index}
                href={link.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {link.icon && <span className="text-xl">{link.icon}</span>}
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {link.platform || 'Plateforme'}
                </span>
              </a>
            ))}
          </div>
        </div>
      )
      }

    case 'booking-form': {
      return renderBookingForm({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'pricing-table': {
      return renderPricingTable({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'service-zones': {
      return renderServiceZones({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'vehicle-gallery': {
      return renderVehicleGallery({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'contact-buttons': {
      return renderContactButtons({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'map': {
      return renderMap({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'badges': {
      return renderBadges({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'gallery': {
      const images = block.data.images || []
      const galleryColumns = block.data.columns || 3
      return (
        <div style={wrapperStyles} className="mb-6">
          <div 
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${galleryColumns}, 1fr)`,
            }}
          >
            {images.length > 0 ? (
              images.map((img: string, i: number) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                  <img
                    src={img}
                    alt={`Image ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage%3C/text%3E%3C/svg%3E'
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
                No images in gallery
              </div>
            )}
          </div>
        </div>
      )
    }

    case 'form': {
      return renderForm({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'accordion': {
      return renderAccordion({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'tabs': {
      return renderTabs({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'hero': {
      return renderHero({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'features-grid':
    case 'features_grid': { // Alias pour compatibilité
      return renderFeaturesGrid({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'features-grid-old': {
      const features = block.data.features || []
      const columns = block.data.columns || 3
      const isDark = theme === 'dark'
      // Déterminer les classes de grille en fonction du nombre de colonnes avec responsive amélioré
      const gridClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      }[columns] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      
      return (
        <div 
          style={{
            ...wrapperStyles,
            backgroundColor: isDark ? '#111827' : (block.styles?.background_color || 'transparent'),
            // En mode clair, utiliser un fond transparent pour laisser voir le dégradé des cartes
            color: isDark ? '#f9fafb' : '#111827'
          }} 
          className="mb-6 w-full min-w-0 overflow-hidden"
        >
          {block.data.title && (
            <h2 
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 px-4"
              style={{ color: isDark ? '#f9fafb' : '#111827' }}
            >
              {block.data.title}
            </h2>
          )}
          <div className={`grid ${gridClasses} gap-4 sm:gap-6 lg:gap-8 w-full min-w-0`}>
            {features.length > 0 ? (
              features.map((feature: any, i: number) => {
                // Style sympa avec gradient et ombre comme le Hero
                // En mode clair, utiliser un dégradé similaire au Hero (bleu-violet-rose)
                const cardStyle: React.CSSProperties = {
                  background: isDark 
                    ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
                    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 50%, rgba(236, 72, 153, 0.05) 100%)',
                  borderColor: isDark ? '#374151' : 'rgba(59, 130, 246, 0.2)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  boxShadow: isDark 
                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
                    : '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(147, 51, 234, 0.08)',
                  transition: 'all 0.3s ease',
                }
                
                return (
                  <div 
                    key={i} 
                    className="text-center p-4 sm:p-6 rounded-xl hover:shadow-xl hover:scale-105 transition-all min-w-0 overflow-hidden relative group"
                    style={cardStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = isDark
                        ? '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
                        : '0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -2px rgba(147, 51, 234, 0.15)'
                      // Renforcer le gradient au survol en mode clair
                      if (!isDark) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)'
                        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = cardStyle.boxShadow as string
                      e.currentTarget.style.background = cardStyle.background as string
                      e.currentTarget.style.borderColor = cardStyle.borderColor as string
                    }}
                  >
                    {/* Effet de brillance au survol - Dégradé similaire au Hero */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity rounded-xl"
                      style={{
                        background: isDark
                          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)'
                          : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 50%, rgba(236, 72, 153, 0.15) 100%)'
                      }}
                    />
                    <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 relative z-10 transform group-hover:scale-110 transition-transform">
                      {feature.icon || '✨'}
                    </div>
                    <h3 
                      className="text-lg sm:text-xl font-bold mb-2 break-words relative z-10"
                      style={{ color: isDark ? '#f9fafb' : '#111827' }}
                    >
                      {feature.title || `Fonctionnalité ${i + 1}`}
                    </h3>
                    <p 
                      className="text-sm sm:text-base break-words relative z-10"
                      style={{ color: isDark ? '#d1d5db' : '#4b5563' }}
                    >
                      {feature.description || 'Description...'}
                    </p>
                  </div>
                )
              })
            ) : (
              <div 
                className="col-span-full text-center py-8 border-2 border-dashed rounded"
                style={{
                  color: isDark ? '#9ca3af' : '#9ca3af',
                  borderColor: isDark ? '#4b5563' : '#d1d5db'
                }}
              >
                No features
              </div>
            )}
          </div>
        </div>
      )
    }

    case 'cta':
    case 'cta-section':
    case 'cta_section': { // Alias pour compatibilité
      return renderCTASection({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'cta-section-old': {
      // Fonction pour convertir le gradient Tailwind en CSS
      const getGradientFromTailwindCTA = (gradient: string) => {
        if (!gradient) return 'linear-gradient(to right, #2563eb, #9333ea)'
        
        const fromMatch = gradient.match(/from-(\w+)-(\d+)/)
        const viaMatch = gradient.match(/via-(\w+)-(\d+)/)
        const toMatch = gradient.match(/to-(\w+)-(\d+)/)
        
        const colorMap: Record<string, Record<string, string>> = {
          blue: { '600': '#2563eb', '500': '#3b82f6' },
          purple: { '600': '#9333ea', '500': '#a855f7' },
          pink: { '500': '#ec4899', '600': '#db2777' },
        }
        
        const fromColor = fromMatch ? (colorMap[fromMatch[1]]?.[fromMatch[2]] || '#2563eb') : '#2563eb'
        const viaColor = viaMatch ? (colorMap[viaMatch[1]]?.[viaMatch[2]] || '#9333ea') : null
        const toColor = toMatch ? (colorMap[toMatch[1]]?.[toMatch[2]] || '#9333ea') : '#9333ea'
        
        if (viaColor) {
          return `linear-gradient(to right, ${fromColor} 0%, ${viaColor} 50%, ${toColor} 100%)`
        }
        return `linear-gradient(to right, ${fromColor} 0%, ${toColor} 100%)`
      }
      
      // Déterminer le style d'arrière-plan
      const ctaPreviewBackgroundType = block.data?.background_type || 'gradient'
      let backgroundStyle: React.CSSProperties = {}
      
      if (ctaPreviewBackgroundType === 'image' && block.data?.background_image) {
        backgroundStyle = {
          backgroundImage: block.data.background_overlay 
            ? `url(${block.data.background_image}), ${block.data.background_overlay}`
            : `url(${block.data.background_image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }
        if (block.data.background_image_opacity !== undefined) {
          backgroundStyle.opacity = block.data.background_image_opacity
        }
      } else if (ctaPreviewBackgroundType === 'solid') {
        backgroundStyle.backgroundColor = block.data?.background_color || '#2563eb'
      } else {
        // Gradient par défaut - convertir depuis Tailwind si nécessaire
        const gradientValue = block.data?.background_gradient
        if (gradientValue && (gradientValue.includes('from-') || gradientValue.includes('to-'))) {
          backgroundStyle.background = getGradientFromTailwindCTA(gradientValue)
        } else {
          backgroundStyle.background = gradientValue || 'linear-gradient(to right, #2563eb, #9333ea)'
        }
      }

      // Utiliser button_link ou button_url (compatibilité)
      const buttonUrl = block.data?.button_url || block.data?.button_link
      const buttonText = block.data?.button_text

      return (
        <div
          style={{
            // Copier contentStyles sans les propriétés de padding pour éviter les conflits
            ...Object.fromEntries(
              Object.entries(contentStyles).filter(([key]) => 
                !['padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'].includes(key)
              )
            ),
            ...backgroundStyle,
            // Ne pas utiliser padding shorthand si on a des propriétés individuelles
            ...(block.styles?.padding && !block.styles?.padding_top && !block.styles?.padding_bottom && !block.styles?.padding_left && !block.styles?.padding_right
              ? { padding: block.styles.padding }
              : {
                  paddingTop: block.styles?.padding_top || block.styles?.padding_vertical || '6rem',
                  paddingRight: block.styles?.padding_right || block.styles?.padding_horizontal || '2rem',
                  paddingBottom: block.styles?.padding_bottom || block.styles?.padding_vertical || '6rem',
                  paddingLeft: block.styles?.padding_left || block.styles?.padding_horizontal || '2rem',
                }),
          }}
          className="mb-6 rounded-lg"
        >
          <div className="max-w-4xl mx-auto text-center">
            {block.data.title && (
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                {block.data.title}
              </h2>
            )}
            {(block.data.description || block.data.subtitle) && (
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
                {block.data.description || block.data.subtitle}
              </p>
            )}
            {buttonText && buttonUrl && (
              <a
                href={buttonUrl}
                className={`inline-block px-10 py-4 sm:px-12 sm:py-5 rounded-lg font-bold text-lg sm:text-xl transition-all shadow-xl hover:scale-105 ${
                  block.data.button_style === 'dark'
                    ? 'bg-white text-gray-900 hover:bg-gray-100'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                {buttonText}
              </a>
            )}
          </div>
        </div>
      )
    }

    case 'contact-form': {
      return renderContactForm({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'faq':
    case 'faq-section': {
      const faqItems = block.data?.items || []
      return (
        <FAQSectionPreview 
          title={block.data?.title}
          items={faqItems}
          wrapperStyles={wrapperStyles}
          theme={theme}
        />
      )
    }

    case 'banner': {
      return (
        <div
          style={{
            // Copier wrapperStyles sans les propriétés de padding pour éviter les conflits
            ...Object.fromEntries(
              Object.entries(wrapperStyles).filter(([key]) => 
                !['padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'].includes(key)
              )
            ),
            backgroundImage: block.data.background_image ? `url(${block.data.background_image})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: `${block.data.min_height || 400}px`,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: block.data.text_align === 'left' ? 'flex-start' : block.data.text_align === 'right' ? 'flex-end' : 'center',
            // Ne pas utiliser padding shorthand si on a des propriétés individuelles
            ...(block.styles?.padding && !block.styles?.padding_top && !block.styles?.padding_bottom && !block.styles?.padding_left && !block.styles?.padding_right
              ? { padding: block.styles.padding }
              : {
                  paddingTop: block.styles?.padding_top || block.styles?.padding_vertical || '4rem',
                  paddingRight: block.styles?.padding_right || block.styles?.padding_horizontal || '2rem',
                  paddingBottom: block.styles?.padding_bottom || block.styles?.padding_vertical || '4rem',
                  paddingLeft: block.styles?.padding_left || block.styles?.padding_horizontal || '2rem',
                }),
          }}
          className="mb-6 rounded-lg overflow-hidden"
        >
          {block.data.overlay && (
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          )}
          <div className="relative z-10 text-white w-full">
            {block.data.title && (
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{block.data.title}</h1>
            )}
            {block.data.subtitle && (
              <p className="text-xl mb-6">{block.data.subtitle}</p>
            )}
            {block.data.button_text && block.data.button_url && (
              <a
                href={block.data.button_url}
                className="inline-block px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                {block.data.button_text}
              </a>
            )}
          </div>
        </div>
      )
    }

    case 'header': {
      return renderHeader({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'footer': {
      return renderFooter({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'section': {
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

    case 'carousel': {
      return renderCarousel({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'countdown': {
      return renderCountdown({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'progress-bar': {
      return renderProgressBar({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'quote': {
      return (
        <div style={wrapperStyles} className="mb-6">
          <blockquote 
            className={`border-l-4 ${block.data.color || 'border-blue-500'} pl-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-r-lg`}
            style={contentStyles}
          >
            <p className={`text-lg italic text-gray-800 dark:text-gray-200 mb-2`}>
              "{block.data.text || 'Citation...'}"
            </p>
            {block.data.author && (
              <footer className="text-sm text-gray-600 dark:text-gray-400">
                — {block.data.author}
              </footer>
            )}
          </blockquote>
        </div>
      )
    }

    case 'icon-box': {
      return (
        <div style={wrapperStyles} className="mb-6">
          <div 
            className={`p-6 rounded-lg border-2 ${block.data.border_color || 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-center`}
            style={contentStyles}
          >
            {block.data.icon && (
              <div className="text-5xl mb-4">{block.data.icon}</div>
            )}
            {block.data.title && (
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {block.data.title}
              </h3>
            )}
            {block.data.description && (
              <p className="text-gray-600 dark:text-gray-400">
                {block.data.description}
              </p>
            )}
          </div>
        </div>
      )
    }

    case 'feature-card': {
      return (
        <div style={wrapperStyles} className="mb-6">
          <div 
            className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow"
            style={contentStyles}
          >
            {block.data.icon && (
              <div className="text-5xl mb-4">{block.data.icon}</div>
            )}
            {block.data.title && (
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {block.data.title}
              </h3>
            )}
            {block.data.description && (
              <p className="text-gray-600 dark:text-gray-400">
                {block.data.description}
              </p>
            )}
            {block.data.link_url && block.data.link_text && (
              <a 
                href={block.data.link_url}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium mt-4 inline-block"
              >
                {block.data.link_text} →
              </a>
            )}
          </div>
        </div>
      )
    }

    case 'video-embed': {
      const videoUrl = block.data.url || ''
      const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')
      const isVimeo = videoUrl.includes('vimeo.com')
      
      let embedUrl = ''
      if (isYouTube) {
        const youtubeId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
        if (youtubeId) embedUrl = `https://www.youtube.com/embed/${youtubeId}`
      } else if (isVimeo) {
        const vimeoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1]
        if (vimeoId) embedUrl = `https://player.vimeo.com/video/${vimeoId}`
      }
      
      return (
        <div style={wrapperStyles} className="mb-6">
          {embedUrl ? (
            <div className="relative w-full" style={{ paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src={embedUrl}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : videoUrl ? (
            <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded text-center text-gray-400">
              Video URL not supported. Use YouTube or Vimeo.
            </div>
          ) : (
            <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded text-center text-gray-400">
              No video configured
            </div>
          )}
        </div>
      )
    }

    case 'team-member': {
      return (
        <div style={wrapperStyles} className="mb-6">
          <div 
            className="text-center p-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            style={contentStyles}
          >
            {block.data.avatar && (
              <img
                src={block.data.avatar}
                alt={block.data.name || 'Membre'}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96"%3E%3Crect fill="%23ddd" width="96" height="96" rx="48"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="32" dy="33" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E?%3C/text%3E%3C/svg%3E'
                }}
              />
            )}
            {block.data.name && (
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {block.data.name}
              </h3>
            )}
            {block.data.role && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                {block.data.role}
              </p>
            )}
            {block.data.bio && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {block.data.bio}
              </p>
            )}
            {block.data.social_links && Array.isArray(block.data.social_links) && block.data.social_links.length > 0 && (
              <div className="flex justify-center gap-3">
                {block.data.social_links.map((link: any, i: number) => (
                  <a
                    key={i}
                    href={link.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.icon || '🔗'}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    case 'logo-grid': {
      return renderLogoGrid({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'card': {
      const cards = block.data.cards || []
      const cardColumns = block.data.columns || 3
      const gridColsClass = cardColumns === 1 ? 'md:grid-cols-1' : cardColumns === 2 ? 'md:grid-cols-2' : cardColumns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'
      return (
        <div style={wrapperStyles} className="mb-6">
          <div className={`grid grid-cols-1 ${gridColsClass} gap-6`}>
            {cards.length > 0 ? (
              cards.map((card: any, index: number) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                  {card.image && (
                    <img
                      src={card.image}
                      alt={card.title || `Card ${index + 1}`}
                      className="w-full h-48 object-cover"
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  )}
                  <div className="p-6">
                    {card.title && (
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{card.title}</h3>
                    )}
                    {card.description && (
                      <p className="text-gray-700 dark:text-gray-300 mb-4">{card.description}</p>
                    )}
                    {card.button_text && card.button_url && (
                      <a
                        href={card.button_url}
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {card.button_text}
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
                No card configured
              </div>
            )}
          </div>
        </div>
      )
    }

    case 'tabs-old': {
      const tabs = block.data.tabs || []
      // Utiliser un composant séparé pour gérer l'état
      const TabsPreview = () => {
        const [activeTab, setActiveTab] = useState(0)
        return (
          <div style={wrapperStyles} className="mb-6">
            {tabs.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                  {tabs.map((tab: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setActiveTab(index)}
                      className={`px-6 py-3 font-medium text-sm transition-colors ${
                        activeTab === index
                          ? 'bg-white dark:bg-gray-900 text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      {tab.title || `Onglet ${index + 1}`}
                    </button>
                  ))}
                </div>
                <div className="p-6">
                  <p className="text-gray-700 dark:text-gray-300">{tabs[activeTab]?.content || 'Contenu...'}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
                No tabs configured
              </div>
            )}
          </div>
        )
      }
      return <TabsPreview />
    }

    case 'rating': {
      const rating = block.data.rating || 5
      const ratingSize = block.data.size || 'medium'
      const sizeClass = ratingSize === 'small' ? 'text-lg' : ratingSize === 'large' ? 'text-3xl' : 'text-2xl'
      return (
        <div style={wrapperStyles} className="mb-6 text-center">
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className={sizeClass}>
                {star <= rating ? '⭐' : '☆'}
              </span>
            ))}
          </div>
          {block.data.show_text !== false && block.data.text && (
            <p className="mt-2 text-gray-700 dark:text-gray-300">{block.data.text}</p>
          )}
        </div>
      )
    }

    case 'breadcrumb': {
      const breadcrumbItems = block.data.items || []
      return (
        <div style={wrapperStyles} className="mb-6">
          <nav className="flex items-center space-x-2 text-sm">
            {breadcrumbItems.map((item: any, index: number) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-gray-400">/</span>}
                {index === breadcrumbItems.length - 1 ? (
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{item.label || `Item ${index + 1}`}</span>
                ) : (
                  <a
                    href={item.url || '#'}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    {item.label || `Item ${index + 1}`}
                  </a>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      )
    }

    case 'tags': {
      const tags = block.data.tags || []
      const tagStyle = block.data.style || 'rounded'
      const tagClass = tagStyle === 'square' ? 'rounded-none' : tagStyle === 'pill' ? 'rounded-full' : 'rounded'
      return (
        <div style={wrapperStyles} className="mb-6">
          <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? (
              tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className={`px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium ${tagClass}`}
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-gray-400">No tag</span>
            )}
          </div>
        </div>
      )
    }

    case 'progress-circle': {
      const progressPercentage = block.data.percentage || 75
      const circleSize = block.data.size || 'medium'
      const sizeMap: { [key: string]: { size: string; stroke: string } } = {
        small: { size: '100', stroke: '8' },
        medium: { size: '150', stroke: '10' },
        large: { size: '200', stroke: '12' },
      }
      const { size: svgSize, stroke: strokeWidth } = sizeMap[circleSize]
      const radius = (parseInt(svgSize) - parseInt(strokeWidth)) / 2
      const circumference = 2 * Math.PI * radius
      const offset = circumference - (progressPercentage / 100) * circumference
      return (
        <div style={wrapperStyles} className="mb-6 flex flex-col items-center">
          <div className="relative" style={{ width: `${svgSize}px`, height: `${svgSize}px` }}>
            <svg width={svgSize} height={svgSize} className="transform -rotate-90">
              <circle
                cx={parseInt(svgSize) / 2}
                cy={parseInt(svgSize) / 2}
                r={radius}
                stroke="#e5e7eb"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <circle
                cx={parseInt(svgSize) / 2}
                cy={parseInt(svgSize) / 2}
                r={radius}
                stroke="#3b82f6"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{progressPercentage}%</span>
            </div>
          </div>
          {block.data.text && (
            <p className="mt-4 text-gray-700 dark:text-gray-300">{block.data.text}</p>
          )}
        </div>
      )
    }

    case 'search-bar': {
      return (
        <div style={wrapperStyles} className="mb-6">
          <form
            action={block.data.action || '#'}
            method="get"
            className="flex gap-2"
          >
            <input
              type="search"
              placeholder={block.data.placeholder || 'Rechercher...'}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {block.data.show_button !== false && (
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Rechercher
              </button>
            )}
          </form>
        </div>
      )
    }

    case 'audio-player': {
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.src ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              {block.data.title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {block.data.title}
                </h3>
              )}
              <audio
                controls={block.data.controls !== false}
                autoPlay={block.data.autoplay === true}
                loop={block.data.loop === true}
                className="w-full"
              >
                <source src={block.data.src} />
                Your browser does not support the audio element.
              </audio>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
              No audio file configured
            </div>
          )}
        </div>
      )
    }

    case 'modal': {
      const ModalPreview = () => {
        const [isOpen, setIsOpen] = useState(false)
        const sizeClass = block.data.size === 'small' ? 'max-w-md' : block.data.size === 'large' ? 'max-w-4xl' : block.data.size === 'fullscreen' ? 'max-w-full h-full' : 'max-w-2xl'
        return (
          <div style={wrapperStyles} className="mb-6">
            <button
              onClick={() => setIsOpen(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {block.data.trigger_text || 'Ouvrir'}
            </button>
            {isOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setIsOpen(false)}>
                <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl ${sizeClass} w-full m-4`} onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{block.data.title || 'Modal'}</h3>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-6 text-gray-700 dark:text-gray-300">
                    {block.data.content || 'Modal content...'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      }
      return <ModalPreview />
    }

    case 'chart': {
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data.title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {block.data.title}
            </h3>
          )}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded">
              Graphique {block.data.chart_type || 'line'} - Prévisualisation (nécessite Chart.js)
            </div>
            <p className="text-xs text-gray-500 mt-2">Type: {block.data.chart_type || 'line'}</p>
          </div>
        </div>
      )
    }

    case 'calendar': {
      return (
        <div style={wrapperStyles} className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="h-96 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 rounded">
              Calendrier {block.data.calendar_type || 'month'} - Prévisualisation (nécessite bibliothèque calendrier)
            </div>
            {block.data.show_events !== false && (
              <p className="text-xs text-gray-500 mt-2">Événements activés</p>
            )}
          </div>
        </div>
      )
    }

    case 'pagination': {
      const currentPage = block.data.current_page || 1
      const totalPages = block.data.total_pages || 10
      const showArrows = block.data.show_arrows !== false
      return (
        <div style={wrapperStyles} className="mb-6">
          <nav className="flex items-center justify-center gap-2">
            {showArrows && (
              <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50" disabled={currentPage === 1}>
                ‹
              </button>
            )}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              return (
                <button
                  key={i}
                  className={`px-3 py-2 border rounded-lg ${
                    pageNum === currentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            {showArrows && (
              <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50" disabled={currentPage === totalPages}>
                ›
              </button>
            )}
          </nav>
        </div>
      )
    }

    case 'list': {
      const listItems = block.data.items || []
      const ListTag = block.data.list_type === 'ordered' ? 'ol' : 'ul'
      const listClass = block.data.list_type === 'none' ? 'list-none' : block.data.list_type === 'ordered' ? 'list-decimal' : 'list-disc'
      return (
        <div style={wrapperStyles} className="mb-6">
          {React.createElement(
            ListTag,
            { className: `${listClass} space-y-2 pl-6` },
            listItems.map((item: string, index: number) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">{item}</li>
            ))
          )}
        </div>
      )
    }

    case 'link': {
      return (
        <div style={wrapperStyles} className="mb-6">
          <a
            href={block.data.url || '#'}
            target={block.data.target || '_self'}
            rel={block.data.target === '_blank' ? 'noopener noreferrer' : undefined}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {block.data.text || 'Lien'}
          </a>
        </div>
      )
      }

    case 'rich-text': {
      return (
        <div style={wrapperStyles} className="mb-6" dangerouslySetInnerHTML={{ __html: block.data?.html || '' }} />
      )
    }

    case 'markdown': {
      // Note: Pour un vrai rendu Markdown, il faudrait une bibliothèque comme react-markdown
      return (
        <div style={wrapperStyles} className="mb-6 prose dark:prose-invert max-w-none">
          <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{block.data?.markdown || ''}</pre>
        </div>
      )
      }

    case 'html-raw': {
      return (
        <div style={wrapperStyles} className="mb-6" dangerouslySetInnerHTML={{ __html: block.data?.html || '' }} />
      )
    }

    case 'icon': {
      const iconSize = block.data?.size === 'sm' ? 'text-2xl' : block.data?.size === 'lg' ? 'text-5xl' : block.data?.size === 'xl' ? 'text-6xl' : 'text-4xl'
      return (
        <div style={wrapperStyles} className="mb-6 flex items-center justify-center">
          <span className={iconSize} style={{ color: block.data?.color || undefined }}>
            {block.data?.icon || '⭐'}
          </span>
        </div>
      )
    }

    case 'label': {
      return (
        <div style={wrapperStyles} className="mb-6">
          <label htmlFor={block.data?.for || undefined} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {block.data?.text || 'Label'}
          </label>
        </div>
      )
    }

    case 'tooltip': {
      return (
        <div style={wrapperStyles} className="mb-6">
          <span
            className="text-blue-600 dark:text-blue-400 underline cursor-help"
            title={block.data?.tooltip || ''}
          >
            {block.data?.text || 'Survolez-moi'}
          </span>
        </div>
      )
    }

    case 'popover': {
      return (
        <div style={wrapperStyles} className="mb-6">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {block.data?.trigger || 'Cliquez ici'}
          </button>
          {/* Note: Le popover nécessiterait une bibliothèque comme Radix UI pour un vrai rendu */}
        </div>
      )
    }

    case 'dropdown': {
      return (
        <div style={wrapperStyles} className="mb-6">
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
            {(block.data?.items || []).map((item: any, index: number) => (
              <option key={index} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>
      )
    }

    case 'categories': {
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data?.title && <h3 className="text-lg font-semibold mb-3">{block.data.title}</h3>}
          <div className="flex flex-wrap gap-2">
            {(block.data?.categories || []).map((cat: any, index: number) => (
              <a key={index} href={`/category/${cat.slug}`} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700">
                {cat.name}
              </a>
            ))}
          </div>
        </div>
      )
    }

    case 'author-box': {
      return (
        <div style={wrapperStyles} className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            {block.data?.avatar && (
              <img src={block.data.avatar} alt={block.data?.name || ''} className="w-16 h-16 rounded-full" />
            )}
            <div>
              {block.data?.name && <h4 className="font-semibold text-gray-900 dark:text-gray-100">{block.data.name}</h4>}
              {block.data?.bio && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{block.data.bio}</p>}
              {block.data?.url && (
                <a href={block.data.url} className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
                  Voir le profil →
                </a>
              )}
            </div>
          </div>
        </div>
      )
    }

    case 'related-posts': {
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data?.title && <h3 className="text-lg font-semibold mb-3">{block.data.title}</h3>}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            💡 {block.data?.count || 3} articles liés seront chargés automatiquement
          </div>
        </div>
      )
    }

    case 'table-of-contents': {
      return (
        <div style={wrapperStyles} className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-3">{block.data?.title || 'Table des matières'}</h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            💡 Table of contents will be automatically generated from page titles
          </div>
        </div>
      )
    }

    case 'reading-time': {
      return (
        <div style={wrapperStyles} className="mb-6">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {block.data?.prefix || 'Temps de lecture:'} <strong>5 min</strong>
          </span>
        </div>
      )
    }

    case 'share-buttons': {
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data?.title && <h3 className="text-sm font-semibold mb-2">{block.data.title}</h3>}
          <div className="flex gap-2">
            {(block.data?.platforms || []).map((platform: string) => (
              <button key={platform} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700 capitalize">
                {platform}
              </button>
            ))}
          </div>
        </div>
      )
      }

    case 'flexbox':
    case 'grid':
    case 'stack':
    case 'inline':
    case 'group':
    case 'wrapper': {
      return renderContainer({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'image-slider': {
      return renderImageSlider({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'lightbox': {
      return renderLightbox({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'vimeo-embed': {
      const vimeoId = block.data?.vimeoId || (block.data?.url ? block.data.url.match(/vimeo\.com\/(\d+)/)?.[1] : '')
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data?.title && <h3 className="text-lg font-semibold mb-3">{block.data.title}</h3>}
          {vimeoId ? (
            <div className="relative" style={{ paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
              <iframe
                src={`https://player.vimeo.com/video/${vimeoId}`}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center text-gray-400">
              ID Vimeo requis
            </div>
          )}
        </div>
      )
    }

    case 'counter': {
      return (
        <div style={wrapperStyles} className="mb-6 text-center">
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            {block.data?.prefix || ''}{block.data?.value || 0}{block.data?.suffix || ''}
          </div>
          {block.data?.label && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">{block.data.label}</div>
          )}
        </div>
      )
    }

    case 'card-grid': {
      const gridCards = block.data?.cards || []
      const gridColumns = block.data?.columns || 3
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data?.title && <h3 className="text-lg font-semibold mb-4">{block.data.title}</h3>}
          <div className={`grid grid-cols-1 md:grid-cols-${gridColumns} gap-4`}>
            {gridCards.map((card: any, index: number) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {card.image && (
                  <img src={card.image} alt={card.title || ''} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  {card.title && <h4 className="font-semibold mb-2">{card.title}</h4>}
                  {card.description && <p className="text-sm text-gray-600 dark:text-gray-400">{card.description}</p>}
                  {card.link && (
                    <a href={card.link} className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-2 inline-block">
                      En savoir plus →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          {gridCards.length === 0 && (
            <div className="text-center py-8 text-gray-400">No cards</div>
          )}
        </div>
      )
    }

    case 'logo-carousel': {
      const carouselLogos = block.data?.logos || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data?.title && <h3 className="text-lg font-semibold mb-4">{block.data.title}</h3>}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {carouselLogos.map((logo: any, index: number) => (
              <div key={index} className="flex-shrink-0 w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center p-4">
                {logo.url ? (
                  <img src={logo.url} alt={logo.name || ''} className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="text-gray-400 text-xs text-center">{logo.name || `Logo ${index + 1}`}</div>
                )}
              </div>
            ))}
          </div>
          {carouselLogos.length === 0 && (
            <div className="text-center py-8 text-gray-400">No logo</div>
          )}
        </div>
      )
      }

    case 'route-calculator': {
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data?.title && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {block.data.title}
            </h2>
          )}
          {block.data?.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {block.data.description}
            </p>
          )}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Point de départ
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Adresse de départ"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Point d'arrivée
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Adresse de destination"
                  readOnly
                />
              </div>
              <button
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                disabled
              >
                Calculer l'itinéraire
              </button>
              {block.data?.show_map !== false && (
                <div className="mt-4 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Carte (nécessite une clé API)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    case 'fare-calculator': {
      return renderFareCalculator({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'availability-calendar': {
      return renderAvailabilityCalendar({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }

    case 'form-multi-step': {
      return renderFormMultiStep({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }
    
    case 'form-conditional': {
      return renderFormConditional({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }
    
    case 'form-calculator': {
      return renderFormCalculator({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }
    
    case 'form-file-upload': {
      return (
        <div style={wrapperStyles} className="mb-6">
          <form className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {block.data.title && (
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{block.data.title}</h3>
            )}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Glissez vos fichiers ici ou cliquez pour sélectionner
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Taille max: {block.data.max_file_size || 10} MB
              </p>
              {block.data.allowed_types && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Types: {block.data.allowed_types.join(', ')}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              disabled
            >
              Téléverser
            </button>
          </form>
        </div>
      )
    }
    
    case 'form-payment': {
      return renderFormPayment({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles })
    }
    
    case 'form-quiz': {
      const questions = block.data.questions || []
      const [currentQuestion, setCurrentQuestion] = useState(0)
      const [answers, setAnswers] = useState<Record<number, any>>({})
      const [showResults, setShowResults] = useState(false)
      const [score, setScore] = useState(0)
      
      const handleAnswer = (questionIndex: number, answerIndex: number) => {
        const newAnswers = { ...answers, [questionIndex]: answerIndex }
        setAnswers(newAnswers)
      }
      
      const submitQuiz = () => {
        let correct = 0
        questions.forEach((q: any, index: number) => {
          if (answers[index] === q.correct_answer) correct++
        })
        setScore(correct)
        setShowResults(true)
      }
      
      if (showResults && block.data.show_results !== false) {
        return (
          <div style={wrapperStyles} className="mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Résultats</h3>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {score} / {questions.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round((score / questions.length) * 100)}% de bonnes réponses
              </p>
            </div>
          </div>
        )
      }
      
      if (questions.length === 0) {
        return (
          <div style={wrapperStyles} className="mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">No questions configured</p>
            </div>
          </div>
        )
      }
      
      const question = questions[currentQuestion]
      
      return (
        <div style={wrapperStyles} className="mb-6">
          <form className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {block.data.title && (
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{block.data.title}</h3>
            )}
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Question {currentQuestion + 1} sur {questions.length}
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {question.question || 'Question'}
              </h4>
              {question.type === 'text' ? (
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  disabled
                />
              ) : (
                <div className="space-y-2">
                  {(question.answers || []).map((answer: string, aIndex: number) => (
                    <label
                      key={aIndex}
                      className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        answers[currentQuestion] === aIndex
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                    >
                      <input
                        type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                        name={`question-${currentQuestion}`}
                        checked={answers[currentQuestion] === aIndex}
                        onChange={() => handleAnswer(currentQuestion, aIndex)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{answer}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              {currentQuestion < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Suivant
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submitQuiz}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Terminer
                </button>
              )}
            </div>
          </form>
        </div>
      )
    }
    
    case 'form-survey': {
      const questions = block.data.questions || []
      
      return (
        <div style={wrapperStyles} className="mb-6">
          <form className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {block.data.title && (
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{block.data.title}</h3>
            )}
            {block.data.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{block.data.description}</p>
            )}
            <div className="space-y-6">
              {questions.map((q: any, index: number) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {q.question || 'Question'}
                    {q.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {q.type === 'textarea' ? (
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      rows={4}
                      disabled
                    />
                  ) : q.type === 'radio' ? (
                    <div className="space-y-2">
                      {['Option 1', 'Option 2', 'Option 3'].map((opt, oIndex) => (
                        <label key={oIndex} className="flex items-center gap-2">
                          <input type="radio" name={`survey-${index}`} disabled className="w-4 h-4" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : q.type === 'checkbox' ? (
                    <div className="space-y-2">
                      {['Option 1', 'Option 2', 'Option 3'].map((opt, oIndex) => (
                        <label key={oIndex} className="flex items-center gap-2">
                          <input type="checkbox" disabled className="w-4 h-4" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : q.type === 'scale' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">1</span>
                      <input type="range" min="1" max="10" defaultValue="5" disabled className="flex-1" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">10</span>
                    </div>
                  ) : q.type === 'rating' ? (
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" disabled className="text-2xl text-gray-300 dark:text-gray-600">
                          ⭐
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type={q.type || 'text'}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      disabled
                    />
                  )}
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              disabled
            >
              Envoyer le sondage
            </button>
          </form>
        </div>
      )
    }
    
    case 'form-poll': {
      const options = block.data.options || []
      const [selected, setSelected] = useState<number[]>([])
      const [voted, setVoted] = useState(false)
      const [results, setResults] = useState<Record<number, number>>({})
      
      const handleVote = () => {
        if (selected.length === 0) return
        const newResults: Record<number, number> = {}
        options.forEach((_: string, index: number) => {
          newResults[index] = selected.includes(index) ? 50 : Math.random() * 30
        })
        setResults(newResults)
        setVoted(true)
      }
      
      return (
        <div style={wrapperStyles} className="mb-6">
          <form className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {block.data.question || 'Question'}
            </h3>
            {!voted ? (
              <div className="space-y-3">
                {options.map((option: string, index: number) => (
                  <label
                    key={index}
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      selected.includes(index)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    <input
                      type={block.data.allow_multiple ? 'checkbox' : 'radio'}
                      name="poll"
                      checked={selected.includes(index)}
                      onChange={(e) => {
                        if (block.data.allow_multiple) {
                          setSelected(e.target.checked
                            ? [...selected, index]
                            : selected.filter(i => i !== index)
                          )
                        } else {
                          setSelected([index])
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{option}</span>
                  </label>
                ))}
                <button
                  type="button"
                  onClick={handleVote}
                  disabled={selected.length === 0}
                  className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Voter
                </button>
              </div>
            ) : block.data.show_results !== false ? (
              <div className="space-y-3">
                {options.map((option: string, index: number) => {
                  const percentage = results[index] || 0
                  return (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{percentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Merci pour votre vote !</p>
              </div>
            )}
          </form>
        </div>
      )
    }
    
    case 'form-rsvp': {
      const [response, setResponse] = useState<'yes' | 'no' | null>(null)
      
      return (
        <div style={wrapperStyles} className="mb-6">
          <form className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {block.data.event_title || 'Événement'}
            </h3>
            {block.data.event_date && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                📅 {new Date(block.data.event_date).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            )}
            {block.data.event_location && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                📍 {block.data.event_location}
              </p>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmez votre présence <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className={`flex-1 p-4 border-2 rounded-lg cursor-pointer text-center transition-colors ${
                    response === 'yes'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700'
                  }`}>
                    <input
                      type="radio"
                      name="rsvp"
                      checked={response === 'yes'}
                      onChange={() => setResponse('yes')}
                      className="sr-only"
                    />
                    <span className="text-lg">✅</span>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">Je serai présent(e)</p>
                  </label>
                  <label className={`flex-1 p-4 border-2 rounded-lg cursor-pointer text-center transition-colors ${
                    response === 'no'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-700'
                  }`}>
                    <input
                      type="radio"
                      name="rsvp"
                      checked={response === 'no'}
                      onChange={() => setResponse('no')}
                      className="sr-only"
                    />
                    <span className="text-lg">❌</span>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">Je ne pourrai pas venir</p>
                  </label>
                </div>
              </div>
              {block.data.show_guests && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre d'invités
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    disabled
                  />
                </div>
              )}
              {block.data.show_dietary && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Restrictions alimentaires
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={2}
                    placeholder="Végétarien, allergies, etc."
                    disabled
                  />
                </div>
              )}
              {block.data.show_message && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message (optionnel)
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={3}
                    disabled
                  />
                </div>
              )}
            </div>
            <button
              type="submit"
              className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              disabled
            >
              Confirmer
            </button>
          </form>
        </div>
      )
    }

    case 'captcha': {
      return (
        <div style={wrapperStyles} className="mb-6">
          <Captcha
            onVerify={(isValid) => {
              // La validation est gérée par le composant Captcha lui-même
            }}
            theme={block.data.theme || 'light'}
          className={block.data.className || ''}
        />
      </div>
    )
    }

    // Blocs VTC
    case 'driver-profile': {
      return (
        <div style={wrapperStyles} className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              {block.data?.photo_url && (
                <img
                  src={block.data.photo_url}
                  alt={block.data.name || 'Chauffeur'}
                  className="w-20 h-20 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {block.data?.name || 'Nom du chauffeur'}
                </h3>
                {block.data?.rating && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{block.data.rating}</span>
                    {block.data?.reviews_count && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({block.data.reviews_count} avis)
                      </span>
                    )}
                  </div>
                )}
                {block.data?.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{block.data.description}</p>
                )}
                {block.data?.experience_years && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {block.data.experience_years} ans d'expérience
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    case 'email-button': {
      return (
        <div style={wrapperStyles} className="mb-6">
          <a
            href={`mailto:${block.data?.email || ''}${block.data?.subject ? `?subject=${encodeURIComponent(block.data.subject)}` : ''}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {block.data?.button_text || 'Envoyer un email'}
          </a>
        </div>
      )
    }

    case 'sms-button': {
      return (
        <div style={wrapperStyles} className="mb-6">
          <a
            href={`sms:${block.data?.phone || ''}${block.data?.default_message ? `?body=${encodeURIComponent(block.data.default_message)}` : ''}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {block.data?.button_text || 'Envoyer un SMS'}
          </a>
        </div>
      )
    }

    case 'vehicle-comparison': {
      const comparisonVehicles = block.data?.vehicles || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data?.title && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {block.data.title}
            </h2>
          )}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600">Caractéristique</th>
                  {comparisonVehicles.map((vehicle: any, index: number) => (
                    <th key={index} className="p-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600">
                      {vehicle.name || `Véhicule ${index + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">Places</td>
                  {comparisonVehicles.map((vehicle: any, index: number) => (
                    <td key={index} className="p-3 text-center text-sm text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600">
                      {vehicle.seats || 4}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">Prix</td>
                  {comparisonVehicles.map((vehicle: any, index: number) => (
                    <td key={index} className="p-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600">
                      {vehicle.price || 0} €
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    case 'service-packages': {
      const packages = block.data?.packages || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data?.title && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {block.data.title}
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pkg: any, index: number) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {pkg.name || `Forfait ${index + 1}`}
                </h3>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                  {pkg.price || 0} €
                </div>
                {pkg.features && pkg.features.length > 0 && (
                  <ul className="space-y-2">
                    {pkg.features.map((feature: string, fIndex: number) => (
                      <li key={fIndex} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-green-500">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )
      }

    // Blocs E-commerce
    case 'product-gallery': {
      const productImages = block.data?.images || []
      const displayMode = block.data?.display_mode || 'grid'
      return (
        <div style={wrapperStyles} className="mb-6">
          {productImages.length > 0 ? (
            displayMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {productImages.map((img: string, index: number) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Produit ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            ) : (
              <div className="relative">
                <img
                  src={productImages[0]}
                  alt="Produit"
                  className="w-full h-64 object-cover rounded-lg"
                />
                {block.data?.show_thumbnails && productImages.length > 1 && (
                  <div className="mt-4 flex gap-2">
                    {productImages.slice(1, 5).map((img: string, index: number) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Miniature ${index + 1}`}
                        className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-75"
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="text-center py-8 text-gray-400">Aucune image</div>
          )}
        </div>
      )
    }

    case 'product-details': {
      return (
        <div style={wrapperStyles} className="mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {block.data?.name || 'Nom du produit'}
            </h2>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
              {block.data?.price || 0} {block.data?.currency || 'EUR'}
            </div>
            {block.data?.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">{block.data.description}</p>
            )}
            <div className="flex items-center gap-4">
              {block.data?.in_stock ? (
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                  En stock ({block.data?.stock || 0} disponibles)
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-medium">
                  Rupture de stock
                </span>
              )}
            </div>
          </div>
        </div>
      )
      }

    case 'add-to-cart': {
      return (
        <div style={wrapperStyles} className="mb-6">
          <div className="flex items-center gap-4">
            {block.data?.show_quantity && (
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">-</button>
                <input
                  type="number"
                  min="1"
                  defaultValue="1"
                  className="w-16 px-2 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                />
                <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">+</button>
              </div>
            )}
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {block.data?.button_text || 'Ajouter au panier'}
            </button>
          </div>
        </div>
      )
      }

    case 'buy-now': {
      return (
        <div style={wrapperStyles} className="mb-6">
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {block.data?.button_text || 'Acheter maintenant'}
          </button>
        </div>
      )
      }

    case 'trust-badges': {
      const trustBadges = block.data?.badges || []
      const layout = block.data?.layout || 'horizontal'
      return (
        <div style={wrapperStyles} className="mb-6">
          {trustBadges.length > 0 ? (
            <div className={`flex ${layout === 'vertical' ? 'flex-col' : layout === 'grid' ? 'flex-wrap' : 'flex-row'} gap-4`}>
              {trustBadges.map((badge: any, index: number) => (
                <div key={index} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <span className="text-xl">{badge.icon || '✅'}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{badge.text || ''}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400">Aucun badge configuré</div>
          )}
        </div>
      )
      }

    case 'payment-methods': {
      const methods = block.data?.methods || []
      return (
        <div style={wrapperStyles} className="mb-6">
          {block.data?.title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {block.data.title}
            </h3>
          )}
          {methods.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {methods.map((method: any, index: number) => (
                <div key={index} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <span className="text-xl">{method.icon || '💳'}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{method.name || ''}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400">No method configured</div>
          )}
        </div>
      )
      }

    default:
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
  }

  const content = getBlockContent()

  // Utiliser les fonctions utilitaires importées

  // Wrap content with layout and container
  // IMPORTANT: Le layoutWidth (colonnes) doit être appliqué au container, pas à l'intérieur
  // Le container respecte la largeur définie par les colonnes
  const finalContainerClass = getContainerClass(block.container, layoutCols)
  
  return (
    <div 
      className={`${finalContainerClass} ${layoutWidth !== 'w-full' ? layoutWidth : ''} mb-6 ${getHoverAnimationClass(block)} ${getAlignmentClasses(block)}`} 
      style={{
        ...wrapperStyles,
        // Si container est 'container' et layout < 12, centrer le contenu
        ...(block.container === 'container' && layoutCols < 12 ? { marginLeft: 'auto', marginRight: 'auto' } : {}),
        // Appliquer la largeur max si container est défini et layout < 12
        ...(block.container === 'container' && layoutCols < 12 ? { maxWidth: '1280px' } : {}),
      }}
    >
      {content}
    </div>
  )
}

