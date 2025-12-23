'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo, startTransition } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverEvent, useDroppable, useDraggable, DragOverlay } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import {
  RichTextEditorConfig,
  MarkdownEditorConfig,
  HtmlRawConfig,
  IconConfig,
  LabelConfig,
  TooltipConfig,
  PopoverConfig,
  DropdownConfig,
  CategoriesConfig,
  AuthorBoxConfig,
  RelatedPostsConfig,
  TableOfContentsConfig,
  ReadingTimeConfig,
  ShareButtonsConfig,
  FlexboxConfig,
  GridConfig,
  StackConfig,
  InlineConfig,
  GroupConfig,
  WrapperConfig,
  ImageSliderConfig,
  LightboxConfig,
  VimeoEmbedConfig,
  CounterConfig,
  CardGridConfig,
  LogoCarouselConfig,
  RouteCalculatorConfig,
  FareCalculatorConfig,
  AvailabilityCalendarConfig,
  CaptchaConfig,
  FormMultiStepConfig,
  FormConditionalConfig,
  FormCalculatorConfig,
  FormFileUploadConfig,
  FormPaymentConfig,
  FormQuizConfig,
  FormSurveyConfig,
  FormPollConfig,
  FormRSVPConfig,
} from './blocks-implementations'
import {
  DriverProfileConfig,
  EmailButtonConfig,
  SMSButtonConfig,
  ProductGalleryConfig,
  ProductDetailsConfig,
  AddToCartConfig,
  BuyNowConfig,
  VehicleComparisonConfig,
  ServicePackagesConfig,
  TrustBadgesConfig,
  PaymentMethodsConfig,
} from './blocks-vtc-ecommerce'
import { CSS } from '@dnd-kit/utilities'
import blocksService, { BlockType } from '@/services/blocks.service'
import { useFeatures } from '@/contexts/FeaturesContext'
import authService from '@/services/auth.service'
import UrlInputWithSuggestions from './ui/UrlInputWithSuggestions'
import PageSelector from './ui/PageSelector'
import ImageSelector from './ui/ImageSelector'
import { useHistory } from '@/hooks/useHistory'
import { useBlockTracking } from '@/hooks/useBlockTracking'
import { quickHash } from '@/lib/memory-utils'
import { Block } from './types'
import { useTheme } from '@/contexts/ThemeContext'
import { CollapsibleSection } from './CollapsibleSection'
import { renderCTASectionEditor } from './renderers/CTAEditor'
import { BlockRenderer } from './BlockRenderer'
import { BlockLayoutPanel } from './panels/BlockLayoutPanel'
import { BlockStylePanel } from './panels/BlockStylePanel'
import { BlockPropertiesPanel } from './panels/BlockPropertiesPanel'
import { RootDropZone } from './components/drag-drop/RootDropZone'
import { ContainerDropZone } from './components/drag-drop/ContainerDropZone'
import { DraggableBlockItem } from './components/drag-drop/DraggableBlockItem'
import { BlockPickerModal } from './components/modals/BlockPickerModal'
import { DraggableChildBlock } from './components/drag-drop/DraggableChildBlock'
import { ContainerChildrenRenderer } from './components/containers/ContainerChildrenRenderer'
import { SortableBlock } from './components/drag-drop/SortableBlock'
import { findBlockInTree, removeBlockFromTree, addBlockToContainer, isBlockInContainer as isBlockInContainerUtil } from './utils/block-editor/block-tree-utils'

// Re-export Block type for backward compatibility
export type { Block }


interface BlockEditorProps {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
  availableBlockTypes?: BlockType[]
  onBlockSelect?: (blockId: string | null) => void
  selectedBlockId?: string | null
  showBlocksPalette?: boolean // Afficher ou non la sidebar de blocs (désactivée si popup externe)
  showOnlyPalette?: boolean // Afficher uniquement la palette (pour popup)
  onPaletteToggle?: () => void // Callback pour masquer/afficher la palette
  onUndoRedoChange?: (canUndo: boolean, canRedo: boolean) => void // Callback pour notifier les changements undo/redo
}

export default function BlockEditor({ blocks, onChange, availableBlockTypes, onBlockSelect, selectedBlockId: externalSelectedBlockId, showBlocksPalette = true, showOnlyPalette = false, onPaletteToggle, onUndoRedoChange }: BlockEditorProps) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const [blockTypes, setBlockTypes] = useState<BlockType[]>([])
  const [selectedBlock, setSelectedBlock] = useState<string | null>(externalSelectedBlockId || null)
  const [activeDragId, setActiveDragId] = useState<string | null>(null) // ID du bloc en cours de drag
  const [hoveredDropZone, setHoveredDropZone] = useState<string | null>(null) // ID de la zone de drop survolée
  // Référence pour stocker la position initiale du drag et l'offset du clic
  const dragStartPositionRef = useRef<{ 
    blockX: number; 
    blockY: number; 
    clickX?: number; 
    clickY?: number;
    offsetX?: number;
    offsetY?: number;
    blockWidth?: number; // Largeur du bloc original pour ajuster le DragOverlay
    blockHeight?: number; // Hauteur du bloc original pour référence
  } | null>(null)
  
  const [sidebarOpen, setSidebarOpen] = useState(true) // Ouvrir par défaut sur desktop
  const [blocksPaletteOpen, setBlocksPaletteOpen] = useState(true) // Palette de blocs ouverte par défaut
  const [propertiesTab, setPropertiesTab] = useState<'content' | 'layout' | 'style'>('layout') // Layout en premier
  const [categoryFilter, setCategoryFilter] = useState<string>('all') // Filtre par catégorie
  const [searchQuery, setSearchQuery] = useState<string>('') // Recherche par nom
  
  
  // État pour les blocs réduits (collapsed) dans l'éditeur
  const [collapsedBlocks, setCollapsedBlocks] = useState<Set<string>>(new Set())
  
  // Ref pour scroller vers le bloc sélectionné
  const blockListRef = useRef<HTMLDivElement>(null)
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  
  // Fonction pour basculer l'état réduit/étendu d'un bloc
  const toggleBlockCollapse = useCallback((blockId: string) => {
    setCollapsedBlocks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(blockId)) {
        newSet.delete(blockId)
      } else {
        newSet.add(blockId)
      }
      return newSet
    })
  }, [])
  
  // Scroller vers le bloc sélectionné dans la liste (mode inspecteur)
  useEffect(() => {
    if (externalSelectedBlockId && blockListRef.current) {
      const blockElement = blockRefs.current.get(externalSelectedBlockId)
      if (blockElement) {
        // Attendre un peu pour que le DOM soit mis à jour
        setTimeout(() => {
          blockElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          })
        }, 100)
      }
    }
  }, [externalSelectedBlockId])
  
  // Synchroniser avec la sélection externe (optimisé pour éviter les conflits)
  useEffect(() => {
    if (externalSelectedBlockId !== undefined && externalSelectedBlockId !== selectedBlock) {
      setSelectedBlock(externalSelectedBlockId)
      if (externalSelectedBlockId) {
        setSidebarOpen(true)
      }
    }
  }, [externalSelectedBlockId]) // Retirer selectedBlock des dépendances pour éviter les boucles
  
  // Notifier le parent quand la sélection change (dans une transition pour ne pas bloquer)
  useEffect(() => {
    if (onBlockSelect) {
      // Utiliser startTransition pour ne pas bloquer le rendu
      startTransition(() => {
        onBlockSelect(selectedBlock)
      })
    }
  }, [selectedBlock, onBlockSelect])
  
  const { canUseBlockType } = useFeatures()
  
  // Fonction pour vérifier si un bloc est un conteneur (définie avant les useEffect qui l'utilisent)
  const isContainerType = useCallback((blockTypeName: string): boolean => {
    const containerTypes = ['container', 'flex-container', 'grid-container', 'flexbox', 'grid', 'stack', 'inline', 'group', 'wrapper', 'section', 'rows', 'columns']
    return containerTypes.includes(blockTypeName)
  }, [])
  
  // Fonction pour vérifier si les blocs contiennent un conteneur (définie avant les useEffect qui l'utilisent)
  const hasContainer = useCallback((blocks: Block[]): boolean => {
    for (const block of blocks) {
      if (isContainerType(block.type)) {
        return true
      }
      if (block.children && block.children.length > 0) {
        if (hasContainer(block.children)) {
          return true
        }
      }
    }
    return false
  }, [isContainerType])
  
  // Historique avec undo/redo (réduit à 20 pour économiser la mémoire)
  const history = useHistory<Block[]>(blocks, 20)
  const isHistoryUpdate = useRef(false)
  const isInternalUpdate = useRef(false) // Pour éviter les boucles infinies
  const onChangeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastBlocksHashRef = useRef<string>('') // Pour comparer les blocs (hash au lieu de JSON string)
  
  // Tracking des blocs
  const { trackBlockAction } = useBlockTracking()

  // Référence pour capturer l'événement de clic initial
  const dragStartEventRef = useRef<{ clientX: number; clientY: number } | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Distance minimale avant d'activer le drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Synchroniser l'historique avec les blocks externes (optimisé avec hash)
  // Et créer un conteneur par défaut si nécessaire
  useEffect(() => {
    if (!isHistoryUpdate.current && !isInternalUpdate.current) {
      const blocksHash = quickHash(blocks)
      const historyHash = quickHash(history.state)
      
      // Ne synchroniser que si les blocs ont vraiment changé ET sont différents de l'historique
      // Cela évite la boucle infinie
      if (blocksHash !== lastBlocksHashRef.current && blocksHash !== historyHash) {
        // Vérifier si on doit ajouter un conteneur par défaut
        let blocksToUse = blocks
        if (blocks.length === 0 || !hasContainer(blocks)) {
          // Créer un conteneur par défaut
          const defaultContainer: Block = {
            id: `block-container-${Date.now()}`,
            type: 'container',
            data: {},
            styles: {},
            layout: 3, // Par défaut, 3 colonnes sur 12 (1/4 de la largeur)
            container: 'container',
            children: []
          }
          blocksToUse = [defaultContainer]
          // Mettre à jour via onChange pour que le parent soit notifié
          isInternalUpdate.current = true
          onChange(blocksToUse)
          isHistoryUpdate.current = true
          history.reset(blocksToUse)
          lastBlocksHashRef.current = quickHash(blocksToUse)
        } else {
          // Seulement reset si vraiment différent
          isHistoryUpdate.current = true
          history.reset(blocks)
          lastBlocksHashRef.current = blocksHash
        }
      }
    }
    // Ne pas réinitialiser les flags ici car ils sont utilisés dans d'autres endroits
  }, [blocks, history, hasContainer, onChange])

  // Synchroniser onChange avec l'historique (avec debounce et protection contre les boucles, optimisé avec hash)
  useEffect(() => {
    const historyHash = quickHash(history.state)
    const blocksHash = quickHash(blocks)
    
    // Ne pas appeler onChange si c'est une mise à jour externe ou si les valeurs sont identiques
    if (historyHash !== blocksHash && historyHash !== lastBlocksHashRef.current) {
      isInternalUpdate.current = true
      lastBlocksHashRef.current = historyHash
      
      // Mise à jour immédiate pour une réactivité maximale
      // Le debounce a été supprimé pour que les modifications soient visibles instantanément
      onChange(history.state)
      isInternalUpdate.current = false
    }
  }, [history.state, onChange])

  useEffect(() => {
    loadBlockTypes()
  }, [])

  const handleUndo = useCallback(() => {
    isHistoryUpdate.current = true
    history.undo()
    // Fermer les paramètres quand on fait undo
    setSelectedBlock(null)
  }, [history])

  const handleRedo = useCallback(() => {
    isHistoryUpdate.current = true
    history.redo()
    // Fermer les paramètres quand on fait redo
    setSelectedBlock(null)
  }, [history])

  // Raccourcis clavier pour undo/redo et Échap pour désélectionner
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ne pas intercepter si on est dans un input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Permettre Échap même dans les inputs pour fermer les modals/popups
        if (e.key === 'Escape') {
          setSelectedBlock(null)
        }
        return
      }

      // Échap pour désélectionner le bloc
      if (e.key === 'Escape') {
        e.preventDefault()
        setSelectedBlock(null)
        return
      }

      // Ctrl+Z ou Cmd+Z pour undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (history.canUndo) {
          handleUndo()
        }
      }
      // Ctrl+Shift+Z ou Cmd+Shift+Z pour redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        if (history.canRedo) {
          handleRedo()
        }
      }
      // Ctrl+Y pour redo (alternative)
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        if (history.canRedo) {
          handleRedo()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [history, handleUndo, handleRedo])

  // Notifier le parent des changements undo/redo
  useEffect(() => {
    if (onUndoRedoChange) {
      onUndoRedoChange(history.canUndo, history.canRedo)
    }
  }, [history.canUndo, history.canRedo, onUndoRedoChange])

  // Exposer les fonctions undo/redo via window pour les boutons dans headerActions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__blockEditorUndo = handleUndo
      ;(window as any).__blockEditorRedo = handleRedo
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__blockEditorUndo
        delete (window as any).__blockEditorRedo
      }
    }
  }, [handleUndo, handleRedo])

  // Les blocs par défaut sont maintenant créés automatiquement par l'API
  // Plus besoin de getDefaultBlockTypes() - l'API crée les blocs si aucun n'existe

  const loadBlockTypes = async () => {
    try {
      console.log('🔄 loadBlockTypes appelé:', {
        availableBlockTypes: availableBlockTypes,
        isArray: Array.isArray(availableBlockTypes),
        length: availableBlockTypes?.length || 0
      })
      
      // Si des blocs sont fournis via props, les utiliser directement (même si vide au début)
      if (availableBlockTypes !== undefined) {
        // Si availableBlockTypes est un tableau (vide ou non), l'utiliser
        if (Array.isArray(availableBlockTypes)) {
          // Filtrer uniquement les blocs actifs (sauf pour les super admins qui voient tout)
          const isSuperAdmin = authService.isSuperAdmin()
          const filteredTypes = isSuperAdmin 
            ? availableBlockTypes 
            : availableBlockTypes.filter((bt: BlockType) => bt.is_active !== false)
          console.log('✅ Utilisation des blocs fournis via props:', filteredTypes.length, `(${availableBlockTypes.length} total, ${isSuperAdmin ? 'super admin' : 'filtrés'})`)
          setBlockTypes(filteredTypes)
          // Si le tableau est vide, essayer de charger depuis l'API en arrière-plan
          if (availableBlockTypes.length === 0) {
            console.log('⚠️ Tableau vide, chargement depuis l\'API en arrière-plan...')
            // Charger depuis l'API en arrière-plan sans bloquer
            blocksService.getBlockTypes()
              .then((apiTypes) => {
                const validTypes = Array.isArray(apiTypes) ? apiTypes : ((apiTypes as any)?.results || [])
                // Filtrer uniquement les blocs actifs (sauf pour les super admins qui voient tout)
                const isSuperAdmin = authService.isSuperAdmin()
                const filteredTypes = isSuperAdmin 
                  ? validTypes 
                  : validTypes.filter((bt: BlockType) => bt.is_active !== false)
                console.log('📦 Blocs chargés depuis l\'API:', filteredTypes.length, `(${validTypes.length} total, ${isSuperAdmin ? 'super admin' : 'filtrés'})`)
                if (filteredTypes.length > 0) {
                  setBlockTypes(filteredTypes)
                }
              })
              .catch((apiError: any) => {
                // Ne pas logger les erreurs 401 (non authentifié) - c'est normal si l'utilisateur n'est pas connecté
                const isExpectedError = apiError.response?.status === 401 ||
                                       apiError.code === 'ERR_NETWORK' || 
                                       apiError.code === 'ERR_BLOCKED_BY_CLIENT'
                if (!isExpectedError) {
                  console.error('❌ Error chargement blocs API:', apiError)
                }
              })
          }
        } else {
          console.log('⚠️ availableBlockTypes n\'est pas un tableau:', typeof availableBlockTypes)
          setBlockTypes([])
        }
      } else {
        // Si availableBlockTypes n'est pas fourni, charger depuis l'API
        console.log('📡 Chargement depuis l\'API (availableBlockTypes non fourni)...')
        try {
          const apiTypes = await blocksService.getBlockTypes()
          const validTypes = Array.isArray(apiTypes) ? apiTypes : ((apiTypes as any)?.results || [])
          // Filtrer uniquement les blocs actifs (sauf pour les super admins qui voient tout)
          const isSuperAdmin = authService.isSuperAdmin()
          const filteredTypes = isSuperAdmin 
            ? validTypes 
            : validTypes.filter((bt: BlockType) => bt.is_active !== false)
          console.log('📦 Blocs chargés depuis l\'API:', filteredTypes.length, `(${validTypes.length} total, ${isSuperAdmin ? 'super admin' : 'filtrés'})`)
          if (filteredTypes && filteredTypes.length > 0) {
            setBlockTypes(filteredTypes)
          } else {
            // Si l'API retourne vide (ne devrait pas arriver car l'API crée les blocs automatiquement)
            console.warn('⚠️ Aucun bloc disponible depuis l\'API')
            setBlockTypes([])
          }
        } catch (apiError: any) {
          // Ne pas logger les erreurs 401 (non authentifié) - c'est normal si l'utilisateur n'est pas connecté
          const isExpectedError = apiError.response?.status === 401 ||
                                 apiError.code === 'ERR_NETWORK' || 
                                 apiError.code === 'ERR_BLOCKED_BY_CLIENT'
          if (!isExpectedError) {
            console.error('Error chargement blocs API:', apiError)
          }
          setBlockTypes([])
        }
      }
    } catch (error) {
      console.error('Error loading block types:', error)
      setBlockTypes([])
    }
  }
  
  // Recharger les blocs si availableBlockTypes change ou au montage
  useEffect(() => {
    console.log('🔄 useEffect déclenché pour loadBlockTypes, availableBlockTypes:', {
      length: availableBlockTypes?.length || 0,
      isArray: Array.isArray(availableBlockTypes),
      availableBlockTypes
    })
    loadBlockTypes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableBlockTypes])
  
  // Aussi mettre à jour blockTypes directement si availableBlockTypes change et n'est pas vide
  useEffect(() => {
    if (availableBlockTypes !== undefined && Array.isArray(availableBlockTypes) && availableBlockTypes.length > 0) {
      console.log('✅ Mise à jour directe de blockTypes depuis availableBlockTypes:', availableBlockTypes.length)
      setBlockTypes(availableBlockTypes)
    }
  }, [availableBlockTypes])

  // Fonction récursive pour trouver un bloc dans l'arbre
  const findBlockInTree = useCallback((blocks: Block[], blockId: string): { block: Block; parent: Block[] | null; index: number } | null => {
    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i].id === blockId) {
        return { block: blocks[i], parent: blocks, index: i }
      }
      if (blocks[i].children && blocks[i].children.length > 0) {
        const found = findBlockInTree(blocks[i].children, blockId)
        if (found) return found
      }
    }
    return null
  }, [])

  // Fonction récursive pour retirer un bloc de l'arbre
  const removeBlockFromTree = useCallback((blocks: Block[], blockId: string): Block[] => {
    return blocks
      .filter(block => block.id !== blockId)
      .map(block => {
        if (block.children && block.children.length > 0) {
          return {
            ...block,
            children: removeBlockFromTree(block.children, blockId)
          }
        }
        return block
      })
  }, [])

  // Fonction récursive pour ajouter un bloc dans un conteneur
  const addBlockToContainer = useCallback((blocks: Block[], containerId: string, childBlock: Block): Block[] => {
    return blocks.map(block => {
      if (block.id === containerId && (block.type === 'container' || block.type === 'flex-container' || block.type === 'grid-container' || block.type === 'flexbox' || block.type === 'grid' || block.type === 'stack' || block.type === 'inline' || block.type === 'group' || block.type === 'wrapper' || block.type === 'section' || block.type === 'rows')) {
        return {
          ...block,
          children: [...(block.children || []), childBlock],
        }
      }
      if (block.children && block.children.length > 0) {
        return {
          ...block,
          children: addBlockToContainer(block.children, containerId, childBlock),
        }
      }
      return block
    })
  }, [])


  const handleDragStart = useCallback((event: DragStartEvent) => {
    const blockId = event.active.id as string
    setActiveDragId(blockId)
    setHoveredDropZone(null) // Réinitialiser la zone survolée
    
    // Stocker la position visuelle exacte du bloc au moment du drag
    // Chercher d'abord dans les enfants
    let blockElement = document.querySelector(`[data-child-block-id="${event.active.id}"]`) as HTMLElement
    if (!blockElement) {
      // Sinon chercher dans les blocs racine
      blockElement = document.querySelector(`[data-block-id="${event.active.id}"]`) as HTMLElement
    }
    const mouseEvent = dragStartEventRef.current
    
    if (blockElement && mouseEvent) {
      // Utiliser getBoundingClientRect pour obtenir la position visuelle exacte (sans scroll)
      const rect = blockElement.getBoundingClientRect()
      
      // Calculer l'offset du clic par rapport au coin supérieur gauche du bloc
      // Cet offset sera utilisé pour positionner le DragOverlay de manière à ce que
      // le point de clic reste exactement sous le curseur
      // Utiliser les coordonnées du viewport directement (getBoundingClientRect retourne déjà les coordonnées du viewport)
      // IMPORTANT: mouseEvent.clientX et mouseEvent.clientY sont les coordonnées du curseur dans le viewport
      // rect.left et rect.top sont les coordonnées du coin supérieur gauche du bloc dans le viewport
      const offsetX = mouseEvent.clientX - rect.left
      const offsetY = mouseEvent.clientY - rect.top
      
      // Prendre en compte le scroll de la page pour un calcul précis
      const scrollX = window.scrollX || window.pageXOffset || 0
      const scrollY = window.scrollY || window.pageYOffset || 0
      
      dragStartPositionRef.current = { 
        blockX: rect.left + scrollX,  // Position X du bloc dans le document
        blockY: rect.top + scrollY,  // Position Y du bloc dans le document
        clickX: mouseEvent.clientX,  // Position X du clic (viewport)
        clickY: mouseEvent.clientY,  // Position Y du clic (viewport)
        // L'offset est calculé par rapport au coin supérieur gauche du bloc
        // dnd-kit positionne le DragOverlay à la position de la souris (mouseEvent.clientX, mouseEvent.clientY)
        // Le DragOverlay est en position fixed, donc ses coordonnées sont relatives au viewport
        // On doit déplacer le DragOverlay de -offsetX et -offsetY pour que le point de clic reste sous le curseur
        // IMPORTANT: L'offset doit être calculé exactement comme la distance entre le coin supérieur gauche du bloc
        // et le point de clic, car dnd-kit positionne le DragOverlay avec son coin supérieur gauche à la position de la souris
        offsetX: offsetX,  // Offset du clic par rapport au bloc (viewport) - utilisé pour le transform
        offsetY: offsetY,  // Offset du clic par rapport au bloc (viewport) - utilisé pour le transform
        blockWidth: rect.width,  // Largeur du bloc original pour référence
        blockHeight: rect.height,  // Hauteur du bloc original pour référence
      }
    } else {
      // Fallback si pas d'événement de souris - centrer le bloc
      dragStartPositionRef.current = { 
        blockX: 0,
        blockY: 0,
        offsetX: 0,
        offsetY: 0,
        blockWidth: 0,
        blockHeight: 0,
      }
    }
    
    // Réinitialiser la référence de l'événement
    dragStartEventRef.current = null
  }, [])

  // Gérer le survol d'une zone de drop pour l'affichage visuel
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event
    if (over) {
      const overId = String(over.id || '')
      // Si c'est une zone de drop de conteneur, la marquer comme survolée
      if (overId.startsWith('container-drop-')) {
        setHoveredDropZone(overId)
      } else if (over.data.current?.type === 'container') {
        // Si c'est un conteneur directement, utiliser son ID
        setHoveredDropZone(`container-drop-${over.id}`)
      } else {
        setHoveredDropZone(null)
      }
    } else {
      setHoveredDropZone(null)
    }
  }, [])

  // Gérer le clic pour déposer le bloc dans la zone surlignée
  useEffect(() => {
    if (!activeDragId || !hoveredDropZone) return

    // Référence pour suivre si le drag est en cours (pour éviter les conflits avec dnd-kit)
    let isDragging = true
    const dragStartTime = Date.now()

    const handleClick = (e: MouseEvent) => {
      // Ne pas déposer si le drag vient de commencer (moins de 100ms) pour éviter les conflits avec dnd-kit
      if (Date.now() - dragStartTime < 100) {
        return
      }

      // Vérifier que le clic n'est pas sur un élément interactif
      const target = e.target as HTMLElement
      const clickedOnInteractive = target.closest('button, input, textarea, select, a, [role="button"], [data-context-menu]')
      
      if (clickedOnInteractive) {
        return // Ne pas déposer si on clique sur un élément interactif
      }

      // Vérifier que le clic est bien sur la zone de drop surlignée ou à proximité
      const dropZoneElement = document.querySelector(`[id="${hoveredDropZone}"]`) || 
                             document.querySelector(`[data-container-id="${hoveredDropZone.replace('container-drop-', '')}"]`)
      
      if (!dropZoneElement) {
        return
      }

      // Extraire l'ID du conteneur depuis la zone de drop surlignée
      const containerId = hoveredDropZone.replace('container-drop-', '')
      
      if (!containerId) return

      // Trouver le bloc à déplacer
      const blockToMoveResult = findBlockInTree(history.state, activeDragId)
      if (!blockToMoveResult) {
        setActiveDragId(null)
        setHoveredDropZone(null)
        return
      }
      const blockToMove = blockToMoveResult.block

      // Vérifier que le conteneur cible n'est pas le bloc lui-même
      if (activeDragId === containerId) {
        setActiveDragId(null)
        setHoveredDropZone(null)
        return
      }

      // Vérifier que le conteneur cible n'est pas un descendant du bloc à déplacer
      const isDescendant = (blocks: Block[], targetId: string): boolean => {
        for (const block of blocks) {
          if (block.id === targetId) return true
          if (block.children && block.children.length > 0) {
            if (isDescendant(block.children, targetId)) return true
          }
        }
        return false
      }

      if (blockToMove.children && blockToMove.children.length > 0) {
        if (isDescendant(blockToMove.children, containerId)) {
          setActiveDragId(null)
          setHoveredDropZone(null)
          return
        }
      }

      // Retirer le bloc de sa position actuelle
      let newBlocks = removeBlockFromTree(history.state, activeDragId)
      
      // Ajouter le bloc dans le conteneur cible
      newBlocks = addBlockToContainer(newBlocks, containerId, blockToMove)
      
      history.set(newBlocks, true)
      onChange(newBlocks)
      trackBlockAction(blockToMove.type, 'update')
      
      // Réinitialiser les états
      setActiveDragId(null)
      setHoveredDropZone(null)
      isDragging = false
      
      // Empêcher le comportement par défaut
      e.preventDefault()
      e.stopPropagation()
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => {
      document.removeEventListener('click', handleClick, { capture: true })
    }
  }, [activeDragId, hoveredDropZone, history.state, onChange, trackBlockAction, findBlockInTree, removeBlockFromTree, addBlockToContainer])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    const blockId = active.id as string
    
    // Réinitialiser la zone de drop survolée
    setHoveredDropZone(null)
    
    if (!over) {
      // Si on lâche sans cible, garder la sélection et réinitialiser le drag
      setActiveDragId(null)
      // S'assurer que le bloc reste sélectionné
      if (blockId) {
        setSelectedBlock(blockId)
        setSidebarOpen(true)
      }
      return
    }
    
    // Garder la sélection du bloc après le drag pour que les paramètres restent affichés
    // Ne pas réinitialiser activeDragId immédiatement pour garder la sélection visible

    // Vérifier si on drop sur une zone de conteneur (peut être un ID de drop zone)
    const overId = String(over.id || '')
    const isContainerDropZone = overId.startsWith('container-drop-')
    let containerId = isContainerDropZone ? overId.replace('container-drop-', '') : ''
    
    // Si ce n'est pas une zone de drop mais que c'est un conteneur, utiliser son ID directement
    if (!containerId && over.data.current?.type === 'container') {
      containerId = over.data.current.containerId as string || String(over.id)
    }
    
    // Si toujours pas d'ID, essayer de trouver l'ID du conteneur depuis les données
    if (!containerId && over.data.current?.containerId) {
      containerId = String(over.data.current.containerId)
    }
    
    // Vérifier si le bloc cible est un conteneur
    const isTargetContainer = containerId && (() => {
      const findContainer = (blocks: Block[]): Block | null => {
        for (const block of blocks) {
          if (block.id === containerId) {
            const containerTypes = ['container', 'flex-container', 'grid-container', 'flexbox', 'grid', 'stack', 'inline', 'group', 'wrapper', 'section', 'rows']
            if (containerTypes.includes(block.type)) return block
          }
          if (block.children) {
            const found = findContainer(block.children)
            if (found) return found
          }
        }
        return null
      }
      return findContainer(history.state) !== null
    })()
    
    // Si on drop sur un bloc conteneur directement (pas sa zone de drop), permettre le drop si c'est un conteneur
    // Sinon, ignorer pour éviter de remplacer le conteneur
    if (active.data.current?.type === 'block' && over.data.current?.type === 'container' && !isContainerDropZone && !isTargetContainer) {
      return
    }

    // Gérer le drop d'un type de bloc (nouveau bloc depuis la palette)
    if (active.data.current?.type === 'block-type') {
      const blockType = active.data.current.blockType as BlockType
      
      const newBlock: Block = {
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: blockType.name,
        data: {},
        layout: 12, // Par défaut, pleine largeur à la racine
        children: isContainerType(blockType.name) ? [] : undefined,
      }
      
      // Si on drop sur la racine
      if (overId === 'root-drop-zone' || over.data.current?.type === 'root') {
        // Ajouter le bloc à la racine
        const newBlocks = [...history.state, newBlock]
        history.set(newBlocks, true)
        onChange(newBlocks)
        trackBlockAction(blockType.name, 'add')
        setActiveDragId(null)
        return
      }
      
      // Si on drop dans un conteneur
      if (isContainerDropZone) {
        // Trouver le conteneur pour déterminer le layout
        const findContainer = (blocks: Block[]): Block | null => {
          for (const block of blocks) {
            if (block.id === containerId) {
              return block
            }
            if (block.children) {
              const found = findContainer(block.children)
              if (found) return found
            }
          }
          return null
        }
        
        const container = findContainer(history.state)
        if (container && container.type === 'grid-container') {
          newBlock.layout = undefined
        } else {
          newBlock.layout = 3 // Par défaut, 3 colonnes sur 12 (1/4 de la largeur) dans un conteneur
        }
        
        const newBlocks = addBlockToContainer(history.state, containerId, newBlock)
        history.set(newBlocks, true)
        onChange(newBlocks)
        trackBlockAction(blockType.name, 'add')
        setActiveDragId(null)
        return
      }
    }

    // Gérer le déplacement d'un bloc existant dans un conteneur
    // IMPORTANT: Utiliser uniquement la zone de drop (container-drop-*) pour éviter de remplacer le conteneur
    // OU accepter le drop directement sur un conteneur si containerId est défini
    if (active.data.current?.type === 'block' && (isContainerDropZone || containerId)) {
      const blockId = active.id as string
      
      // Si containerId n'est pas défini mais qu'on est sur une zone de drop, l'extraire
      if (!containerId && isContainerDropZone) {
        containerId = overId.replace('container-drop-', '')
      }
      
      // Si toujours pas d'ID, essayer depuis les données de la zone de drop
      if (!containerId && over.data.current?.containerId) {
        containerId = String(over.data.current.containerId)
      }
      
      // Si toujours pas d'ID et qu'on est sur une zone de drop, réessayer avec l'ID complet
      if (!containerId && isContainerDropZone && overId.startsWith('container-drop-')) {
        containerId = overId.replace('container-drop-', '')
      }
      
      // Si toujours pas d'ID, utiliser l'ID de over directement si c'est un conteneur
      if (!containerId && over.id && !isContainerDropZone) {
        const overBlockId = String(over.id)
        const findContainer = (blocks: Block[]): Block | null => {
          for (const block of blocks) {
            if (block.id === overBlockId) {
              const containerTypes = ['container', 'flex-container', 'grid-container', 'flexbox', 'grid', 'stack', 'inline', 'group', 'wrapper', 'section', 'rows']
              if (containerTypes.includes(block.type)) return block
            }
            if (block.children) {
              const found = findContainer(block.children)
              if (found) return found
            }
          }
          return null
        }
        const containerBlock = findContainer(history.state)
        if (containerBlock) {
          containerId = containerBlock.id
        }
      }
      
      if (!containerId) {
        console.warn('Impossible de trouver le containerId pour le déplacement du bloc', { blockId, overId, isContainerDropZone, overData: over.data.current })
        return
      }
      
      // Ne pas permettre de déplacer un bloc dans lui-même
      if (blockId === containerId) {
        return
      }
      
      // Trouver le bloc à déplacer
      const blockToMoveResult = findBlockInTree(history.state, blockId)
      if (!blockToMoveResult) {
        return
      }
      const blockToMove = blockToMoveResult.block
      
      // Vérifier que le conteneur cible n'est pas un descendant direct ou indirect du bloc à déplacer (éviter les boucles)
      // IMPORTANT: On vérifie uniquement si le conteneur cible est DANS les enfants du bloc à déplacer
      // Si le conteneur cible est à côté (même niveau ou parent), c'est autorisé
      const isDescendant = (blocks: Block[], targetId: string): boolean => {
        for (const block of blocks) {
          if (block.id === targetId) return true
          if (block.children && block.children.length > 0) {
            if (isDescendant(block.children, targetId)) return true
          }
        }
        return false
      }
      
      // Fonction pour trouver le parent d'un bloc dans l'arbre
      const findBlockParent = (blocks: Block[], searchId: string, parentId?: string): string | null => {
        for (const block of blocks) {
          if (block.id === searchId) {
            return parentId || null
          }
          if (block.children && block.children.length > 0) {
            const found = findBlockParent(block.children, searchId, block.id)
            if (found !== null) return found
          }
        }
        return null
      }
      
      // Vérifier que le conteneur cible n'est pas un descendant du bloc à déplacer
      // Mais seulement si le bloc à déplacer a des enfants (c'est un conteneur)
      if (blockToMove.children && blockToMove.children.length > 0) {
        if (isDescendant(blockToMove.children, containerId)) {
          // Ne pas permettre de déplacer un conteneur dans un de ses descendants directs
          return
        }
      }
      
      // Vérifier que le bloc à déplacer n'est pas un descendant du conteneur cible
      // (éviter de déplacer un bloc dans un de ses ancêtres)
      // MAIS permettre de déplacer un bloc dans son parent direct
      // On vérifie si le conteneur cible est dans la chaîne des parents du bloc à déplacer
      const directParent = findBlockParent(history.state, blockId)
      
      // Si le conteneur cible est le parent direct, permettre le déplacement
      if (directParent === containerId) {
        // C'est le parent direct, on permet le déplacement (pour réorganiser dans le même conteneur)
      } else {
        // Vérifier si le conteneur cible est un ancêtre plus lointain (pas le parent direct)
        let currentParent = directParent
        while (currentParent) {
          if (currentParent === containerId) {
            // C'est un ancêtre plus lointain, empêcher le déplacement
            return
          }
          currentParent = findBlockParent(history.state, currentParent)
        }
      }
      
      // Retirer le bloc de sa position actuelle
      let newBlocks = removeBlockFromTree(history.state, blockId)
      
      // Ajouter le bloc dans le conteneur cible
      newBlocks = addBlockToContainer(newBlocks, containerId, blockToMove)
      
      history.set(newBlocks, true)
      onChange(newBlocks)
      trackBlockAction(blockToMove.type, 'update')
      return
    }
    
    // Si on drop sur un conteneur directement (pas sa zone de drop), essayer quand même
    if (active.data.current?.type === 'block' && over.data.current?.type === 'container' && !isContainerDropZone) {
      const blockId = active.id as string
      const containerId = over.id as string
      
      // Ne pas permettre de déplacer un bloc dans lui-même
      if (blockId === containerId) {
        return
      }
      
      // Trouver le bloc à déplacer
      const blockToMoveResult = findBlockInTree(history.state, blockId)
      if (!blockToMoveResult) {
        return
      }
      const blockToMove = blockToMoveResult.block
      
      // Vérifier que le conteneur cible n'est pas un descendant direct ou indirect du bloc à déplacer (éviter les boucles)
      // IMPORTANT: On vérifie uniquement si le conteneur cible est DANS les enfants du bloc à déplacer
      // Si le conteneur cible est à côté (même niveau ou parent), c'est autorisé
      const isDescendant = (blocks: Block[], targetId: string): boolean => {
        for (const block of blocks) {
          if (block.id === targetId) return true
          if (block.children && block.children.length > 0) {
            if (isDescendant(block.children, targetId)) return true
          }
        }
        return false
      }
      
      // Fonction pour trouver le parent d'un bloc dans l'arbre
      const findBlockParent = (blocks: Block[], searchId: string, parentId?: string): string | null => {
        for (const block of blocks) {
          if (block.id === searchId) {
            return parentId || null
          }
          if (block.children && block.children.length > 0) {
            const found = findBlockParent(block.children, searchId, block.id)
            if (found !== null) return found
          }
        }
        return null
      }
      
      // Vérifier que le conteneur cible n'est pas un descendant du bloc à déplacer
      // Mais seulement si le bloc à déplacer a des enfants (c'est un conteneur)
      if (blockToMove.children && blockToMove.children.length > 0) {
        if (isDescendant(blockToMove.children, containerId)) {
          // Ne pas permettre de déplacer un conteneur dans un de ses descendants directs
          return
        }
      }
      
      // Vérifier que le bloc à déplacer n'est pas un descendant du conteneur cible
      // (éviter de déplacer un bloc dans un de ses ancêtres)
      // MAIS permettre de déplacer un bloc dans son parent direct
      // On vérifie si le conteneur cible est dans la chaîne des parents du bloc à déplacer
      const directParent = findBlockParent(history.state, blockId)
      
      // Si le conteneur cible est le parent direct, permettre le déplacement
      if (directParent === containerId) {
        // C'est le parent direct, on permet le déplacement (pour réorganiser dans le même conteneur)
      } else {
        // Vérifier si le conteneur cible est un ancêtre plus lointain (pas le parent direct)
        let currentParent = directParent
        while (currentParent) {
          if (currentParent === containerId) {
            // C'est un ancêtre plus lointain, empêcher le déplacement
            return
          }
          currentParent = findBlockParent(history.state, currentParent)
        }
      }
      
      // Retirer le bloc de sa position actuelle
      let newBlocks = removeBlockFromTree(history.state, blockId)
      
      // Ajouter le bloc dans le conteneur cible
      newBlocks = addBlockToContainer(newBlocks, containerId, blockToMove)
      
      history.set(newBlocks, true)
      onChange(newBlocks)
      trackBlockAction(blockToMove.type, 'update')
      return
    }

    // Gérer le réordonnancement normal des blocs (même niveau)
    if (over && active.id !== over.id) {
      // Vérifier si les deux blocs sont au même niveau (pas dans des conteneurs différents)
      const activeBlock = findBlockInTree(history.state, active.id as string)
      const overBlock = findBlockInTree(history.state, over.id as string)
      
      if (activeBlock && overBlock && activeBlock.parent === overBlock.parent) {
        // Même parent, on peut réordonner
        const oldIndex = activeBlock.index
        const newIndex = overBlock.index

        if (oldIndex !== -1 && newIndex !== -1 && activeBlock.parent) {
          const newChildren = arrayMove(activeBlock.parent, oldIndex, newIndex)
          // Mettre à jour le parent avec les nouveaux enfants
          const updateParent = (blocks: Block[]): Block[] => {
            return blocks.map(block => {
              if (block.children && block.children === activeBlock.parent) {
                return { ...block, children: newChildren }
              }
              if (block.children) {
                return { ...block, children: updateParent(block.children) }
              }
              return block
            })
          }
          const newBlocks = updateParent(history.state)
          history.set(newBlocks, true)
          onChange(newBlocks)
        }
      } else {
        // Blocs à des niveaux différents, essayer un réordonnancement simple au niveau racine
        const oldIndex = history.state.findIndex((b: Block) => b.id === active.id)
        const newIndex = history.state.findIndex((b: Block) => b.id === over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
          const newBlocks = arrayMove(history.state, oldIndex, newIndex)
          history.set(newBlocks, true)
          onChange(newBlocks)
        }
      }
    }
    
    // Réinitialiser le drag après un court délai pour permettre à l'utilisateur de voir le résultat
    // Mais garder la sélection active pour que les paramètres restent affichés
    setTimeout(() => {
      setActiveDragId(null)
      // S'assurer que le bloc reste sélectionné après le drag
      if (blockId) {
        setSelectedBlock(blockId)
        setSidebarOpen(true)
      }
    }, 100)
  }, [history, trackBlockAction, findBlockInTree, removeBlockFromTree, addBlockToContainer, isContainerType, onChange, setSelectedBlock, setSidebarOpen])

  const addBlock = useCallback((blockType: BlockType) => {
    // Si ce n'est pas un conteneur et qu'aucun conteneur n'existe, empêcher l'ajout
    if (!isContainerType(blockType.name) && !hasContainer(history.state)) {
      alert('⚠️ Vous devez d\'abord ajouter un conteneur (Container, Grid, Flex, etc.) avant d\'ajouter des blocs de contenu.\n\nLes blocs de structure sont disponibles dans la catégorie "Mise en page".')
      return
    }

    const newBlock: Block = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: blockType.name,
      data: {},
      styles: blockType.default_styles || {},
      layout: 3, // Par défaut, 3 colonnes sur 12 (1/4 de la largeur)
      container: 'container',
    }

    // Si c'est un conteneur, initialiser avec un tableau d'enfants vide
    if (isContainerType(blockType.name)) {
      newBlock.children = []
    }

    history.set([...history.state, newBlock], true)
    setSelectedBlock(newBlock.id)
    setSidebarOpen(true) // Ouvrir la sidebar pour afficher les paramètres
    // Tracker l'ajout du bloc
    trackBlockAction(blockType.name, 'add')
  }, [history, trackBlockAction, hasContainer, isContainerType])

  const removeBlock = useCallback((blockId: string, skipConfirmation = false) => {
    // Demander confirmation avant de supprimer
    if (!skipConfirmation) {
      const blockToDelete = findBlockInTree(history.state, blockId)?.block
      const blockType = blockTypes.find(bt => bt.name === blockToDelete?.type)
      const blockLabel = blockType?.label || blockToDelete?.type || 'ce bloc'
      
      if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${blockLabel}" ?\n\nCette action est irréversible et supprimera également tous les blocs enfants s'il s'agit d'un conteneur.`)) {
        return
      }
    }
    
    // Désélectionner immédiatement le bloc si c'était celui sélectionné (optimistic UI)
    if (selectedBlock === blockId) {
      setSelectedBlock(null)
    }
    
    // Trouver le bloc à supprimer pour le tracking
    const blockToDelete = history.state.find((b: Block) => b.id === blockId)
    
    // Suppression immédiate dans l'historique (pas de délai)
    const newBlocks = history.state.filter((b: Block) => b.id !== blockId)
    history.set(newBlocks, true)
    
    // Tracker la suppression de manière asynchrone pour ne pas bloquer l'UI
    if (blockToDelete) {
      // Utiliser requestIdleCallback ou setTimeout pour ne pas bloquer
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          trackBlockAction(blockToDelete.type, 'delete')
        })
      } else {
        setTimeout(() => {
          trackBlockAction(blockToDelete.type, 'delete')
        }, 0)
      }
    }
  }, [history, selectedBlock, trackBlockAction])

  // Raccourci clavier pour supprimer le bloc sélectionné avec Suppr/Backspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ne pas intercepter si on est dans un input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      // Suppr ou Backspace pour supprimer le bloc sélectionné
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlock) {
        e.preventDefault()
        removeBlock(selectedBlock, false) // false = demander confirmation
        setSelectedBlock(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedBlock, removeBlock])

  // Debounce pour les mises à jour de style (éviter trop d'entrées dans l'historique)
  const updateBlockTimeoutRef = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>({})
  
  const updateBlock = useCallback((blockId: string, updates: Partial<Block>, immediate: boolean = false) => {
    // Fonction récursive pour trouver un bloc par son ID dans l'arbre complet
    const findBlockById = (blocks: Block[], id: string): Block | null => {
      for (const b of blocks) {
        if (b.id === id) return b
        if (b.children && b.children.length > 0) {
          const found = findBlockById(b.children, id)
          if (found) return found
        }
      }
      return null
    }
    
    // Fonction récursive pour mettre à jour un bloc par son ID dans l'arbre complet
    const updateBlockInTree = (blocks: Block[]): Block[] => {
      return blocks.map((b: Block) => {
        if (b.id === blockId) {
          // Si on met à jour les children, s'assurer de les fusionner correctement
          if (updates.children !== undefined) {
            return { ...b, ...updates, children: updates.children }
          }
          return { ...b, ...updates }
        }
        if (b.children && b.children.length > 0) {
          return { ...b, children: updateBlockInTree(b.children) }
        }
        return b
      })
    }
    
    const block = findBlockById(history.state, blockId)
    const newBlocks = updateBlockInTree(history.state)
    
    // Toutes les mises à jour sont maintenant immédiates pour que Ctrl+S fonctionne correctement
    // Les styles sont mis à jour immédiatement pour que la prévisualisation soit en temps réel
    const updateHistory = (callOnChangeDirectly: boolean = false) => {
      // Si on a fait undo avant (futur non vide), créer une nouvelle branche
      // Le hook useHistory gère déjà cela en effaçant le futur et créant une nouvelle branche
      history.set(newBlocks, true)
      
      // Pour toutes les mises à jour (data, children, styles), appeler onChange directement
      // pour que la prévisualisation se mette à jour instantanément et que Ctrl+S fonctionne
      if (callOnChangeDirectly) {
        isInternalUpdate.current = true
        onChange(newBlocks)
        isInternalUpdate.current = false
      }
      
      // Tracker la modification du bloc
      if (block) {
        trackBlockAction(block.type, 'update')
      }
    }
    
    // Mise à jour immédiate pour tout (styles, data, children, etc.)
    if (updateBlockTimeoutRef.current[blockId]) {
      clearTimeout(updateBlockTimeoutRef.current[blockId])
      delete updateBlockTimeoutRef.current[blockId]
    }
    // Appeler onChange directement pour toutes les mises à jour
    updateHistory(true)
  }, [history, trackBlockAction])

  // Gérer l'ouverture des paramètres - afficher dans la sidebar (OPTIMISÉ)
  const handleSelectBlock = useCallback((blockId: string) => {
    // Mise à jour immédiate de l'état (synchrone pour la réactivité)
    setSelectedBlock(blockId)
    setSidebarOpen(true)
    
    // Les notifications au parent sont faites dans une transition (non bloquante)
    // via le useEffect ci-dessus
  }, [])

  // Gérer la fermeture des paramètres - revenir aux blocs disponibles
  const handleCloseProperties = useCallback(() => {
    setSelectedBlock(null)
    setPropertiesTab('layout') // Réinitialiser l'onglet à layout (comme défini initialement)
  }, [])

  // Mémoriser le bloc sélectionné pour éviter les recherches répétées (OPTIMISATION PERFORMANCE)
  // Utiliser une Map pour des recherches O(1) au lieu de O(n)
  // Inclure tous les blocs, y compris les enfants dans les conteneurs
  const blocksMap = useMemo(() => {
    const map = new Map<string, Block>()
    const addBlockToMap = (block: Block) => {
      map.set(block.id, block)
      if (block.children && block.children.length > 0) {
        block.children.forEach(child => addBlockToMap(child))
      }
    }
    history.state.forEach((block: Block) => {
      addBlockToMap(block)
    })
    return map
  }, [history.state])
  
  const blockTypesMap = useMemo(() => {
    const map = new Map<string, BlockType>()
    blockTypes.forEach((bt: BlockType) => {
      map.set(bt.name, bt)
    })
    console.log('🗺️ blockTypesMap mis à jour:', {
      total: blockTypes.length,
      mapSize: map.size,
      blockNames: Array.from(map.keys()).slice(0, 10)
    })
    return map
  }, [blockTypes])
  
  const selectedBlockData = useMemo(() => {
    if (!selectedBlock) return null
    const block = blocksMap.get(selectedBlock)
    if (!block) return null
    let blockType = blockTypesMap.get(block.type)
    // Fallback si le type de bloc n'est pas trouvé - créer un BlockType minimal
    if (!blockType) {
      blockType = {
        id: 0,
        name: block.type,
        label: block.type.charAt(0).toUpperCase() + block.type.slice(1).replace(/-/g, ' '),
        icon: '📦',
        category: 'custom',
        description: '',
        schema: {},
        default_styles: {},
        is_active: true,
        order: 0,
        created_at: '',
        updated_at: ''
      } as BlockType
    }
    return { block, blockType }
  }, [selectedBlock, blocksMap, blockTypesMap])

  return (
    <div className="flex h-full w-full flex-col relative min-h-0 overflow-hidden">
      <div className="flex flex-1 overflow-hidden relative w-full h-full min-h-0">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Properties Panel uniquement (blocs disponibles dans popup externe) */}
        {showBlocksPalette && (
          <div className={`${sidebarOpen ? 'fixed left-0 top-0 h-screen z-50' : 'hidden'} lg:static lg:block w-full lg:w-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out shadow-lg lg:shadow-none flex-shrink-0 flex flex-col lg:h-full relative overflow-hidden`}>
            {/* Afficher le panneau de paramètres si un bloc est sélectionné, sinon la palette de blocs */}
            {selectedBlock ? (
            /* Properties Panel dans la sidebar */
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex-1 min-w-0">
                  {selectedBlockData?.blockType ? (
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                      Configuration du bloc {selectedBlockData.blockType.label || selectedBlockData.blockType.name}
                    </h3>
                  ) : (
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Configuration du bloc</h3>
                  )}
                  {selectedBlockData?.blockType?.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {selectedBlockData.blockType.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* Bouton Supprimer */}
                  <button
                    onClick={() => {
                      if (selectedBlock) {
                        removeBlock(selectedBlock, false) // false = demander confirmation
                        setSelectedBlock(null)
                        setSidebarOpen(true)
                      }
                    }}
                    className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                    title="Supprimer le bloc"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  {/* Bouton Fermer */}
                  <button
                    onClick={() => {
                      setSelectedBlock(null)
                      setSidebarOpen(true)
                    }}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    title="Retour aux blocs disponibles"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Tabs pour Mise en page, Style et Contenu (ordre optimisé) */}
              <div className="border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex gap-2 px-2 sm:px-3 overflow-x-auto">
                  <button
                    onClick={() => setPropertiesTab('layout')}
                    className={`px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                      propertiesTab === 'layout'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    📐 Mise en page
                  </button>
                  <button
                    onClick={() => setPropertiesTab('style')}
                    className={`px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                      propertiesTab === 'style'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    🎨 Style
                  </button>
                  <button
                    onClick={() => setPropertiesTab('content')}
                    className={`px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                      propertiesTab === 'content'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    📝 Contenu
                  </button>
                </div>
              </div>

              {/* Properties Content */}
              <div className="flex-1 overflow-y-auto p-2 sm:p-3 min-h-0 pb-4" style={{ maxHeight: '100%', WebkitOverflowScrolling: 'touch', overflowX: 'hidden', scrollbarWidth: 'thin' }}>
                <div className="min-h-full pb-4">
                {propertiesTab === 'layout' ? (
                  selectedBlockData ? (
                    <BlockLayoutPanel
                      block={selectedBlockData.block}
                      onUpdate={(updates) => updateBlock(selectedBlock, updates)}
                      allBlocks={history.state}
                      blockTypes={blockTypes}
                    />
                  ) : null
                ) : propertiesTab === 'style' ? (
                  selectedBlockData ? (
                    <BlockStylePanel
                      block={selectedBlockData.block}
                      onUpdate={(updates) => updateBlock(selectedBlock, updates)}
                      allBlocks={history.state}
                      blockTypes={blockTypes}
                    />
                  ) : null
                ) : propertiesTab === 'content' ? (
                  <>
                    {/* Actions du bloc (Dupliquer, Supprimer) */}
                    <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (selectedBlockData?.block) {
                              const block = selectedBlockData.block
                              
                              // Fonction récursive pour trouver le bloc et son parent dans l'arbre
                              const findBlockAndParent = (blocks: Block[], targetId: string, parent: Block | null = null): { block: Block | null, parent: Block | null, parentChildren: Block[] | null } => {
                                for (let i = 0; i < blocks.length; i++) {
                                  if (blocks[i].id === targetId) {
                                    return { block: blocks[i], parent, parentChildren: parent ? parent.children || [] : blocks }
                                  }
                                  if (blocks[i].children && blocks[i].children.length > 0) {
                                    const found = findBlockAndParent(blocks[i].children, targetId, blocks[i])
                                    if (found.block) return found
                                  }
                                }
                                return { block: null, parent: null, parentChildren: null }
                              }
                              
                              const result = findBlockAndParent(history.state, block.id)
                              
                              if (!result.block) return
                              
                              // Créer une copie profonde du bloc avec un nouvel ID
                              const deepClone = (b: Block): Block => {
                                const cloned: Block = {
                                  ...b,
                                  id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                  children: b.children ? b.children.map(deepClone) : undefined
                                }
                                return cloned
                              }
                              
                              const newBlock = deepClone(result.block)
                              
                              // Fonction récursive pour insérer le bloc dupliqué au même niveau
                              const insertDuplicate = (blocks: Block[]): Block[] => {
                                return blocks.map((b: Block) => {
                                  if (b.id === block.id) {
                                    // Si c'est le bloc à dupliquer, retourner le bloc original
                                    // Le nouveau bloc sera inséré après dans le tableau parent
                                    return b
                                  }
                                  if (b.children && b.children.length > 0) {
                                    return { ...b, children: insertDuplicate(b.children) }
                                  }
                                  return b
                                })
                              }
                              
                              let newBlocks = insertDuplicate(history.state)
                              
                              // Insérer le nouveau bloc après le bloc original
                              if (result.parent && result.parentChildren) {
                                // Le bloc est dans un conteneur
                                const childIndex = result.parentChildren.findIndex((b: Block) => b.id === block.id)
                                if (childIndex !== -1) {
                                  const updateParentChildren = (blocks: Block[]): Block[] => {
                                    return blocks.map((b: Block) => {
                                      if (b.id === result.parent!.id) {
                                        const newChildren = [...(b.children || [])]
                                        newChildren.splice(childIndex + 1, 0, newBlock)
                                        return { ...b, children: newChildren }
                                      }
                                      if (b.children && b.children.length > 0) {
                                        return { ...b, children: updateParentChildren(b.children) }
                                      }
                                      return b
                                    })
                                  }
                                  newBlocks = updateParentChildren(newBlocks)
                                }
                              } else {
                                // Le bloc est à la racine
                                const rootIndex = newBlocks.findIndex((b: Block) => b.id === block.id)
                                if (rootIndex !== -1) {
                                  newBlocks.splice(rootIndex + 1, 0, newBlock)
                                }
                              }
                              
                              history.set(newBlocks)
                              onChange(newBlocks)
                              trackBlockAction(block.type, 'add')
                            }
                          }}
                          className="flex-1 px-3 py-2 text-xs font-medium bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Dupliquer
                        </button>
                        <button
                          onClick={() => {
                            if (selectedBlock) {
                              removeBlock(selectedBlock, false) // false = demander confirmation
                            }
                          }}
                          className="flex-1 px-3 py-2 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Supprimer
                        </button>
                      </div>
                    </div>

                    {/* Propriétés du bloc - Contenu éditable */}
                    {selectedBlockData && (
                      <BlockPropertiesPanel
                        block={selectedBlockData.block}
                        blockType={selectedBlockData.blockType}
                        onUpdate={(updates) => updateBlock(selectedBlock, updates)}
                      />
                    )}
                  </>
                ) : null}
                </div>
              </div>

              {/* Bouton retour aux blocs - Icon only with hover text */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <button
                  onClick={() => {
                    setSelectedBlock(null)
                    setSidebarOpen(true)
                  }}
                  className="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center group relative"
                  title="Retour aux blocs disponibles"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="absolute left-full ml-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                    Retour aux blocs disponibles
                  </span>
                </button>
              </div>
            </>
          ) : (
            /* Block Palette */
            <>
              {/* Mobile: Close button */}
              <div className="flex items-center justify-between lg:hidden pb-3 border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Blocs disponibles</h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className={`flex-1 overflow-y-auto min-h-0 flex flex-col ${!blocksPaletteOpen ? 'hidden' : ''}`} style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', maxHeight: '100%' }}>
                {/* Header avec recherche et filtres - Fixe en haut */}
                <div className="flex-shrink-0 p-4 sm:p-5 lg:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Blocs disponibles</h3>
                    {onPaletteToggle && (
                      <button
                        onClick={onPaletteToggle}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Masquer la palette de blocs"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Barre de recherche */}
                  <div className="relative mb-3">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher un bloc..."
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Filtres par catégorie - Boutons modernes */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setCategoryFilter('all')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        categoryFilter === 'all'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      Tous
                    </button>
                    <button
                      onClick={() => setCategoryFilter('layout')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        categoryFilter === 'layout'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      📐 Structure
                    </button>
                    <button
                      onClick={() => setCategoryFilter('content')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        categoryFilter === 'content'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      📝 Contenu
                    </button>
                    <button
                      onClick={() => setCategoryFilter('media')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        categoryFilter === 'media'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      🖼️ Médias
                    </button>
                    <button
                      onClick={() => setCategoryFilter('custom')}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        categoryFilter === 'custom'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      ⚙️ Personnalisé
                    </button>
                  </div>
                </div>
        
                {/* Liste des blocs - Scrollable en dessous des filtres */}
                <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5 lg:p-6 pt-0 sm:pt-0 lg:pt-0">
                  {/* Message informatif si aucun conteneur */}
                  {!hasContainer(history.state) && (
                    <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                            ⚠️ Aucun conteneur détecté
                          </h4>
                          <p className="text-xs text-yellow-700 dark:text-yellow-300">
                            Vous devez d'abord ajouter un conteneur (Container, Grid, Flex, etc.) dans la catégorie <strong>"Mise en page"</strong> avant de pouvoir ajouter des blocs de contenu.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Affichage des blocs - Recherche ou groupé par catégorie */}
                  {(() => {
                    // Filtrer les blocs selon la recherche et la catégorie
                    // Exclure le header de la liste des blocs disponibles dans l'éditeur
                    const filteredBlockTypes = blockTypes.filter((bt: BlockType) => {
                      // Exclure le header de la liste des blocs disponibles
                      if (bt.name === 'header') {
                        return false
                      }
                      // Filtrer les blocs inactifs (sauf pour les super admins qui voient tout)
                      const isSuperAdmin = authService.isSuperAdmin()
                      if (!isSuperAdmin && bt.is_active === false) {
                        return false
                      }
                      const matchesCategory = categoryFilter === 'all' || bt.category === categoryFilter
                      const matchesSearch = !searchQuery || 
                        bt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        bt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (bt.description && bt.description.toLowerCase().includes(searchQuery.toLowerCase()))
                      return matchesCategory && matchesSearch
                    })
                    
                    // Debug: vérifier pourquoi aucun bloc n'est disponible
                    if (filteredBlockTypes.length === 0 && blockTypes.length > 0) {
                      console.warn('⚠️ Aucun bloc filtré alors que blockTypes contient', blockTypes.length, 'blocs')
                      console.log('Filtres appliqués:', { categoryFilter, searchQuery, blockTypesCount: blockTypes.length })
                    }
                    if (blockTypes.length === 0) {
                      console.warn('⚠️ blockTypes est vide ! Vérifiez le chargement des blocs.')
                    }

                    // Si recherche active, afficher tous les résultats sans groupement
                    if (searchQuery) {
                      const sortedBlocks = filteredBlockTypes.sort((a: BlockType, b: BlockType) => {
                        // Trier par pertinence (nom qui commence par la recherche en premier)
                        const aStarts = a.name.toLowerCase().startsWith(searchQuery.toLowerCase()) || 
                                       a.label.toLowerCase().startsWith(searchQuery.toLowerCase())
                        const bStarts = b.name.toLowerCase().startsWith(searchQuery.toLowerCase()) || 
                                       b.label.toLowerCase().startsWith(searchQuery.toLowerCase())
                        if (aStarts && !bStarts) return -1
                        if (!aStarts && bStarts) return 1
                        return (a.order || 0) - (b.order || 0)
                      })

                      if (sortedBlocks.length === 0) {
                        return (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Aucun bloc trouvé</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Essayez avec d'autres mots-clés</p>
                          </div>
                        )
                      }

                      return (
                        <div className="space-y-2">
                          {sortedBlocks.map((blockType: BlockType) => {
                            const isPremium = !!(blockType.available_plans && blockType.available_plans.length > 0)
                            const isContainer = isContainerType(blockType.name)
                            const hasContainerInBlocks = hasContainer(history.state)
                            const canUse = canUseBlockType(blockType.name, isPremium)
                            const canAdd = canUse && (isContainer || hasContainerInBlocks)
                            
                            // Composant draggable pour les blocs de la palette (version recherche)
                            const DraggableBlockTypeItem = ({ blockType, canAdd, isContainer, hasContainerInBlocks, isPremium }: { blockType: BlockType; canAdd: boolean; isContainer: boolean; hasContainerInBlocks: boolean; isPremium: boolean }) => {
                              const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
                                id: `block-type-${blockType.name}`,
                                data: {
                                  type: 'block-type',
                                  blockType: blockType,
                                },
                              })
                              
                              return (
                                <button
                                  ref={setNodeRef}
                                  {...listeners}
                                  {...attributes}
                                  onClick={() => {
                                    if (canAdd) {
                                      addBlock(blockType)
                                      setSidebarOpen(false)
                                    }
                                  }}
                                  disabled={!canAdd}
                                  className={`w-full p-3 rounded-lg border transition-all text-left group ${
                                    canAdd
                                      ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-[0.98] cursor-grab active:cursor-grabbing'
                                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                                  } ${isDragging ? 'opacity-50' : ''}`}
                                  title={!canAdd && !isContainer && !hasContainerInBlocks ? '⚠️ Ajoutez d\'abord un conteneur (Container, Grid, Flex, etc.)' : 'Glissez-déposez ou cliquez pour ajouter'}
                                >
                                <div className="flex items-center gap-3">
                                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-xl shadow-sm">
                                    {blockType.icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                                        {blockType.label}
                                      </div>
                                      {isPremium && (
                                        <div className="flex items-center gap-1 flex-wrap">
                                          <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full flex-shrink-0" title="Bloc premium">
                                            ⭐ Premium
                                          </span>
                                          {authService.isSuperAdmin() && (
                                            <>
                                              {blockType.plan_names && blockType.plan_names.length > 0 ? (
                                                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex-shrink-0" title={`Plans requis: ${blockType.plan_names.join(', ')}`}>
                                                  {blockType.plan_names.join(', ')}
                                                </span>
                                              ) : (
                                                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full flex-shrink-0" title="Plans non définis">
                                                  Plans non définis
                                                </span>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      )}
                                      {!isPremium && authService.isSuperAdmin() && (
                                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex-shrink-0" title="Bloc gratuit">
                                          🆓 Gratuit
                                        </span>
                                      )}
                                    </div>
                                    {blockType.description && (
                                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                        {blockType.description}
                                      </div>
                                    )}
                                    {authService.isSuperAdmin() && isPremium && (
                                      <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                        ✓ Accès super admin
                                      </div>
                                    )}
                                  </div>
                                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </div>
                              </button>
                            )
                          }
                          
                          return (
                            <div key={blockType.id}>
                              <DraggableBlockTypeItem 
                                blockType={blockType}
                                canAdd={canAdd}
                                isContainer={isContainer}
                                hasContainerInBlocks={hasContainerInBlocks}
                                isPremium={isPremium}
                              />
                            </div>
                          )
                        })}
                        </div>
                      )
                    }

                    // Sinon, afficher groupé par catégorie
                    return ['layout', 'content', 'media', 'custom']
                      .filter(category => categoryFilter === 'all' || category === categoryFilter)
                      .map((category) => {
                        const categoryBlocks = filteredBlockTypes
                          .filter((bt: BlockType) => bt.category === category)
                          .sort((a: BlockType, b: BlockType) => (a.order || 999) - (b.order || 999))
                        if (categoryBlocks.length === 0) return null
                    
                        const categoryLabels: { [key: string]: string } = {
                          content: 'Contenu',
                          layout: 'Mise en page',
                          media: 'Médias',
                          custom: 'Personnalisé'
                        }
                        
                        return (
                          <div key={category} className="mb-6">
                            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-md inline-block">
                              {categoryLabels[category] || category}
                            </h4>
                            <div className="space-y-2.5">
                              {categoryBlocks.map((blockType: BlockType) => {
                                const isPremium = !!(blockType.available_plans && blockType.available_plans.length > 0)
                                const isContainer = isContainerType(blockType.name)
                                const hasContainerInBlocks = hasContainer(history.state)
                                const canUse = canUseBlockType(blockType.name, isPremium)
                                const canAdd = canUse && (isContainer || hasContainerInBlocks)
                                
                                // Composant draggable pour les blocs de la palette (version catégories)
                                const DraggableBlockTypeItemCategory = ({ blockType, canAdd, isContainer, hasContainerInBlocks, canUse, isPremium }: { blockType: BlockType; canAdd: boolean; isContainer: boolean; hasContainerInBlocks: boolean; canUse: boolean; isPremium: boolean }) => {
                                  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
                                    id: `block-type-${blockType.name}`,
                                    data: {
                                      type: 'block-type',
                                      blockType: blockType,
                                    },
                                  })
                                  
                                  return (
                                    <button
                                      ref={setNodeRef}
                                      {...listeners}
                                      {...attributes}
                                      onClick={() => {
                                        if (canAdd) {
                                          addBlock(blockType)
                                          setSidebarOpen(false)
                                        }
                                      }}
                                      disabled={!canAdd}
                                      className={`w-full px-3 sm:px-4 py-3 text-left bg-white dark:bg-gray-800 border-2 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                                        canAdd
                                          ? 'border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md cursor-grab active:cursor-grabbing group'
                                          : 'border-gray-100 dark:border-gray-800 opacity-60 cursor-not-allowed'
                                      } ${isDragging ? 'opacity-50' : ''}`}
                                      title={
                                        !canAdd && !isContainer && !hasContainerInBlocks 
                                          ? '⚠️ Ajoutez d\'abord un conteneur (Container, Grid, Flex, etc.) dans la catégorie "Mise en page"' 
                                          : !canUse && isPremium 
                                            ? 'Bloc premium - Nécessite un abonnement supérieur' 
                                            : 'Glissez-déposez ou cliquez pour ajouter'
                                      }
                                    >
                                    <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br flex items-center justify-center border transition-all ${
                                      canUse
                                        ? 'from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border-gray-200 dark:border-gray-600 group-hover:from-blue-100 group-hover:to-blue-200 dark:group-hover:from-blue-900/30 dark:group-hover:to-blue-800/30'
                                        : 'from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-gray-100 dark:border-gray-700'
                                    }`}>
                                      <span className="text-xl sm:text-2xl">{blockType.icon || '📦'}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <div className={`text-sm sm:text-base font-semibold truncate transition-colors ${
                                          canUse ? 'text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                                        }`}>
                                          {blockType.label}
                                        </div>
                                        {isPremium && (
                                          <div className="flex items-center gap-1 flex-wrap">
                                            <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full flex-shrink-0" title="Bloc premium">
                                              ⭐ Premium
                                            </span>
                                            {authService.isSuperAdmin() && (
                                              <>
                                                {blockType.plan_names && blockType.plan_names.length > 0 ? (
                                                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full flex-shrink-0" title={`Plans requis: ${blockType.plan_names.join(', ')}`}>
                                                    {blockType.plan_names.join(', ')}
                                                  </span>
                                                ) : (
                                                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full flex-shrink-0" title="Plans non définis">
                                                    Plans non définis
                                                  </span>
                                                )}
                                              </>
                                            )}
                                          </div>
                                        )}
                                        {!isPremium && authService.isSuperAdmin() && (
                                          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full flex-shrink-0" title="Bloc gratuit">
                                            🆓 Gratuit
                                          </span>
                                        )}
                                      </div>
                                      {blockType.description && (
                                        <div className={`text-xs line-clamp-1 hidden sm:block mt-0.5 ${
                                          canUse ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'
                                        }`}>
                                          {blockType.description}
                                        </div>
                                      )}
                                      {!canUse && isPremium && !authService.isSuperAdmin() && (
                                        <div className="text-xs text-orange-600 dark:text-orange-400 mt-1 hidden sm:block">
                                          {blockType.plan_names && blockType.plan_names.length > 0 
                                            ? `Nécessite: ${blockType.plan_names.join(', ')}`
                                            : 'Nécessite un abonnement premium'
                                          }
                                        </div>
                                      )}
                                      {authService.isSuperAdmin() && isPremium && (
                                        <div className="text-xs text-green-600 dark:text-green-400 mt-1 hidden sm:block">
                                          ✓ Accès super admin - Tous les blocs disponibles
                                        </div>
                                      )}
                                    </div>
                                    {canUse ? (
                                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                      </svg>
                                    ) : (
                                      <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                      </svg>
                                    )}
                                  </button>
                                )
                              }
                              
                              return (
                                <div key={`${blockType.name}-${blockType.id}`}>
                                  <DraggableBlockTypeItemCategory 
                                    blockType={blockType}
                                    canAdd={canAdd}
                                    isContainer={isContainer}
                                    hasContainerInBlocks={hasContainerInBlocks}
                                    canUse={canUse}
                                    isPremium={isPremium}
                                  />
                                </div>
                              )
                            })}
                            </div>
                          </div>
                        )
                      })
                    })()}
        
        {/* Fallback if no categories */}
        {blockTypes.length > 0 && !blockTypes.some((bt: BlockType) => bt.category) && (
          <div className="space-y-2">
            {blockTypes.map((blockType: BlockType) => (
              <button
                key={`${blockType.name}-${blockType.id}`}
                onClick={() => addBlock(blockType)}
                className="w-full px-3 py-2 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-blue-500 transition flex items-center gap-2"
              >
                <span className="text-xl">{blockType.icon || '📦'}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{blockType.label}</div>
                  {blockType.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">{blockType.description}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Message si aucun bloc disponible - seulement si availableBlockTypes n'est pas fourni ou si on charge depuis l'API */}
        {blockTypes.length === 0 && availableBlockTypes === undefined && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Chargement des blocs...</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Veuillez patienter pendant le chargement des blocs disponibles
            </p>
          </div>
        )}
        
        {/* Message si aucun bloc disponible après chargement - seulement si availableBlockTypes est fourni ET vide */}
        {blockTypes.length === 0 && availableBlockTypes !== undefined && Array.isArray(availableBlockTypes) && availableBlockTypes.length === 0 && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Aucun bloc disponible</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Les blocs seront disponibles une fois chargés depuis le serveur
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Debug: availableBlockTypes={availableBlockTypes?.length || 0}, blockTypes={blockTypes.length}
            </p>
          </div>
        )}
                </div>
              </div>
            </>
          )}
          </div>
        )}

      {/* Main Editor Area - Masquer si showOnlyPalette est true */}
      {!showOnlyPalette && (
      <div className="flex-1 flex min-w-0 w-full h-full border-r border-gray-200 dark:border-gray-700">
        {/* Editor Panel */}
        <div className={`flex-1 flex flex-col min-w-0 h-full transition-all duration-300 w-full ${!blocksPaletteOpen ? 'ml-0' : ''}`} style={{ position: 'relative', overflow: 'hidden' }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={history.state.map((b: Block) => b.id)} strategy={verticalListSortingStrategy}>
              {/* Zone de drop à la racine pour permettre le drop depuis la palette */}
              <RootDropZone>
                <div 
                  className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 2xl:p-12 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 max-w-full min-h-0 h-full"
                  style={{ 
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'thin',
                    maxHeight: '100%',
                  }}
                  onClick={(e) => {
                    // Désélectionner le bloc si on clique en dehors d'un bloc
                    // Vérifier que le clic n'est pas sur un bloc ou un élément enfant d'un bloc
                    const target = e.target as HTMLElement
                    const clickedBlock = target.closest('[data-block-id], [data-block-list-id], [data-child-block-id]')
                    
                    // Si on n'a pas cliqué sur un bloc, désélectionner
                    if (!clickedBlock && selectedBlock) {
                      setSelectedBlock(null)
                    }
                  }}
                >
                {history.state.length === 0 ? (
                  <div className="text-center py-12 lg:py-20">
                      <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-2 text-lg font-semibold">Aucun bloc ajouté</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Cliquez sur un bloc dans la palette à gauche pour commencer
                        </p>
                      </div>
                    </div>
                ) : (
                  <div ref={blockListRef} className="flex flex-col gap-4 lg:gap-6">
                      {history.state
                        .filter((b: Block) => !b.position || b.position.type === 'static')
                        .map((block: Block) => {
                          // La largeur est maintenant gérée directement dans SortableBlock via layoutWidthClass
                          // Chaque bloc prend sa propre ligne et sa largeur est définie par layout
                        
                        return (
                          <div 
                            key={block.id} 
                            className="w-full"
                            ref={(el) => {
                              if (el) {
                                blockRefs.current.set(block.id, el)
                              } else {
                                blockRefs.current.delete(block.id)
                              }
                            }}
                            data-block-list-id={block.id}
                          >
                  <SortableBlock
                    block={block}
                    blockTypes={blockTypes}
                    isSelected={selectedBlock === block.id}
                    onSelect={() => handleSelectBlock(block.id)}
                    isChildBlock={false}
                    onDragStartCapture={(e: React.PointerEvent) => {
                      // Capturer les coordonnées du clic initial pour calculer l'offset
                      // Utiliser directement les coordonnées de l'événement React pour plus de précision
                      dragStartEventRef.current = {
                        clientX: e.clientX,
                        clientY: e.clientY
                      }
                    }}
                    onMove={(blockId, targetContainerId) => {
                      // Déplacer le bloc vers un conteneur ou à la racine
                      const blockToMoveResult = findBlockInTree(history.state, blockId)
                      if (!blockToMoveResult) return
                      const blockToMove = blockToMoveResult.block
                      
                      // Trouver le conteneur parent avant de retirer le bloc
                      let containerParentId: string | null = null
                      if (blockToMoveResult.parent) {
                        // Le bloc est dans un conteneur, trouver l'ID du conteneur parent
                        const findContainerParent = (blocks: Block[], targetId: string, parentId: string | null = null): string | null => {
                          for (const b of blocks) {
                            if (b.id === targetId) {
                              return parentId
                            }
                            if (b.children) {
                              const found = findContainerParent(b.children, targetId, b.id)
                              if (found !== null) return found
                            }
                          }
                          return null
                        }
                        containerParentId = findContainerParent(history.state, blockId)
                      }
                      
                      // Retirer le bloc de sa position actuelle
                      let newBlocks = removeBlockFromTree(history.state, blockId)
                      
                      if (targetContainerId === 'root') {
                        // Si le bloc était dans un conteneur, le placer juste après le conteneur parent
                        if (containerParentId) {
                          const containerIndex = newBlocks.findIndex(b => b.id === containerParentId)
                          if (containerIndex !== -1) {
                            // Insérer le bloc juste après le conteneur
                            newBlocks.splice(containerIndex + 1, 0, blockToMove)
                          } else {
                            // Si le conteneur n'est pas trouvé, ajouter à la fin
                            newBlocks = [...newBlocks, blockToMove]
                          }
                        } else {
                          // Le bloc était à la racine, ajouter à la fin
                          newBlocks = [...newBlocks, blockToMove]
                        }
                      } else {
                        // Ajouter dans le conteneur cible
                        newBlocks = addBlockToContainer(newBlocks, targetContainerId, blockToMove)
                      }
                      
                      history.set(newBlocks, true)
                      onChange(newBlocks)
                      trackBlockAction(blockToMove.type, 'update')
                    }}
                    allBlocks={history.state}
                    findBlockInTree={findBlockInTree}
                    onSelectChild={(childId) => {
                      // Trouver le bloc enfant dans l'arbre et le sélectionner
                      const findBlockById = (blocks: Block[] | undefined, id: string): Block | null => {
                        if (!blocks || !Array.isArray(blocks)) return null
                        for (const b of blocks) {
                          if (b.id === id) return b
                          if (b.children) {
                            const found = findBlockById(b.children, id)
                            if (found) return found
                          }
                        }
                        return null
                      }
                      // Utiliser blocks directement au lieu de history.state pour éviter les erreurs
                      const blocksToSearch = Array.isArray(history.state) ? history.state : blocks
                      const childBlock = findBlockById(blocksToSearch, childId)
                      if (childBlock) {
                        setSelectedBlock(childId)
                        setSidebarOpen(true) // Ouvrir la sidebar pour afficher les paramètres
                        if (onBlockSelect) {
                          onBlockSelect(childId)
                        }
                      }
                    }}
                    onUpdate={(updates) => updateBlock(block.id, updates)}
                    onDelete={() => removeBlock(block.id)}
                    onDuplicate={() => {
                      // Fonction récursive pour dupliquer un bloc et tous ses enfants
                      const duplicateBlockRecursive = (bloc: Block): Block => {
                        const newId = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                        const duplicated: Block = {
                          ...bloc,
                          id: newId,
                        }
                        // Dupliquer récursivement les enfants si le bloc en a
                        if (bloc.children && bloc.children.length > 0) {
                          duplicated.children = bloc.children.map(child => duplicateBlockRecursive(child))
                        }
                        return duplicated
                      }
                      
                      const newBlock = duplicateBlockRecursive(block)
                      const currentIndex = history.state.findIndex((b: Block) => b.id === block.id)
                      const newBlocks = [...history.state]
                      newBlocks.splice(currentIndex + 1, 0, newBlock)
                      history.set(newBlocks)
                      onChange(newBlocks)
                      trackBlockAction(block.type, 'add')
                    }}
                    isCollapsed={collapsedBlocks.has(block.id)}
                    onToggleCollapse={() => toggleBlockCollapse(block.id)}
                  />
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
                </RootDropZone>
            </SortableContext>
            <DragOverlay 
              adjustScale={false} 
              dropAnimation={null}
              style={{
                cursor: 'grabbing',
                zIndex: 99999,
                pointerEvents: 'none',
              }}
            >
              {activeDragId ? (
                (() => {
                  // Trouver le bloc en cours de drag
                  const findBlockById = (blocks: Block[], id: string): Block | null => {
                    for (const block of blocks) {
                      if (block.id === id) return block
                      if (block.children) {
                        const found = findBlockById(block.children, id)
                        if (found) return found
                      }
                    }
                    return null
                  }
                  const draggedBlock = findBlockById(history.state, activeDragId)
                  if (!draggedBlock) return null
                  
                  const blockType = blockTypes.find(bt => bt.name === draggedBlock.type)
                  if (!blockType) return null
                  
                  // Calculer l'offset du clic par rapport au coin supérieur gauche du bloc
                  // dnd-kit positionne le DragOverlay à la position de la souris (mouseEvent.clientX, mouseEvent.clientY)
                  // Le DragOverlay est en position fixed, donc ses coordonnées sont relatives au viewport
                  // Pour que le point de clic reste exactement sous le curseur, on doit déplacer le DragOverlay
                  // de -offsetX et -offsetY (pour que le point de clic qui était à offsetX, offsetY du coin supérieur gauche
                  // soit maintenant à la position du curseur)
                  const offsetX = dragStartPositionRef.current?.offsetX ?? 0
                  const offsetY = dragStartPositionRef.current?.offsetY ?? 0
                  
                  return (
                    <div 
                      className="bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-xl shadow-2xl pointer-events-none"
                      style={{
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        maxWidth: '280px',
                        minWidth: '200px',
                        width: '280px', // Largeur fixe pour éviter les variations
                        opacity: 1,
                        // Positionner le bloc pour que le point de clic reste exactement sous le curseur
                        // dnd-kit positionne le DragOverlay à la position de la souris (coin supérieur gauche du DragOverlay = position souris)
                        // On déplace le DragOverlay de -offsetX et -offsetY pour que le point de clic reste sous le curseur
                        // Utiliser Math.round pour éviter les problèmes de rendu avec les décimales
                        transform: `translate(-${Math.round(offsetX)}px, -${Math.round(offsetY)}px)`,
                        willChange: 'transform',
                        // Le DragOverlay de dnd-kit est déjà en position fixed
                        // On utilise juste le transform pour ajuster la position relative au curseur
                        // transformOrigin: '0 0' signifie que le transform est appliqué depuis le coin supérieur gauche
                        transformOrigin: '0 0',
                      }}
                    >
                      {/* Header du bloc */}
                      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-b border-blue-200 dark:border-blue-700">
                        <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 dark:text-blue-400 text-lg">
                            {blockType.icon || '📦'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                            {blockType.label || draggedBlock.type}
                          </div>
                          {blockType.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {blockType.description}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Aperçu du contenu */}
                      <div className="p-3">
                        {draggedBlock.data && Object.keys(draggedBlock.data).length > 0 ? (
                          <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
                            {draggedBlock.data.text && (
                              <div className="truncate">{draggedBlock.data.text}</div>
                            )}
                            {draggedBlock.data.title && (
                              <div className="font-medium truncate">{draggedBlock.data.title}</div>
                            )}
                            {draggedBlock.data.label && (
                              <div className="truncate">{draggedBlock.data.label}</div>
                            )}
                            {!draggedBlock.data.text && !draggedBlock.data.title && !draggedBlock.data.label && (
                              <div className="text-gray-400 dark:text-gray-500 italic">Contenu du bloc</div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 dark:text-gray-500 italic">
                            Bloc vide
                          </div>
                        )}
                        {draggedBlock.children && draggedBlock.children.length > 0 && (
                          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                            {draggedBlock.children.length} enfant{draggedBlock.children.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      {/* Indicateur de déplacement */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                    </div>
                  )
                })()
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
      )}
    </div>
    </div>
  )
}

// SortableBlock a été extrait dans components/drag-drop/SortableBlock.tsx
// L'ancienne définition a été supprimée (lignes 2410-3161)

// Les composants suivants ont été extraits :

// Les composants DraggableChildBlock, ContainerChildrenRenderer, ContainerDropZone, BlockPickerModal, DraggableBlockItem
// ont été extraits dans des fichiers séparés et sont maintenant importés en haut du fichier.
// Les anciennes définitions ont été supprimées pour éviter la duplication.

// Les fonctions suivantes ont été extraites :
// - SortableBlock -> components/drag-drop/SortableBlock.tsx
// - DraggableChildBlock -> components/drag-drop/DraggableChildBlock.tsx
// - ContainerChildrenRenderer -> components/containers/ContainerChildrenRenderer.tsx
// - ContainerDropZone -> components/drag-drop/ContainerDropZone.tsx
// - BlockPickerModal -> components/modals/BlockPickerModal.tsx
// - DraggableBlockItem -> components/drag-drop/DraggableBlockItem.tsx
// - RootDropZone -> components/drag-drop/RootDropZone.tsx
// - isBlockInContainer, findBlockInTree, etc. -> utils/block-editor/block-tree-utils.ts

// Anciennes définitions supprimées (lignes 3211-4020)
// Toutes les fonctions extraites ont été supprimées et sont maintenant importées en haut du fichier.
