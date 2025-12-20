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
  const dragStartEventRef = useRef<MouseEvent | null>(null)
  
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
        offsetX: offsetX,  // Offset du clic par rapport au bloc (viewport)
        offsetY: offsetY,  // Offset du clic par rapport au bloc (viewport)
      }
    } else {
      // Fallback si pas d'événement de souris - centrer le bloc
      dragStartPositionRef.current = { 
        blockX: 0,
        blockY: 0,
        offsetX: 0,
        offsetY: 0,
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

    // Gérer le drop d'un type de bloc dans un conteneur (nouveau bloc depuis la palette)
    // Utiliser uniquement la zone de drop pour éviter les conflits
    if (active.data.current?.type === 'block-type' && isContainerDropZone) {
      const blockType = active.data.current.blockType as BlockType
      
      const newChild: Block = {
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: blockType.name,
        data: {},
        layout: 3, // Par défaut, 3 colonnes sur 12 (1/4 de la largeur)
        children: isContainerType(blockType.name) ? [] : undefined,
      }
      
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
        newChild.layout = undefined
      }
      
      const newBlocks = addBlockToContainer(history.state, containerId, newChild)
      history.set(newBlocks, true)
      onChange(newBlocks)
      trackBlockAction(blockType.name, 'add')
      return
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
                      const matchesCategory = categoryFilter === 'all' || bt.category === categoryFilter
                      const matchesSearch = !searchQuery || 
                        bt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        bt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (bt.description && bt.description.toLowerCase().includes(searchQuery.toLowerCase()))
                      return matchesCategory && matchesSearch
                    })

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
                            
                            return (
                              <button
                                key={blockType.id}
                                onClick={() => {
                                  if (canAdd) {
                                    addBlock(blockType)
                                    setSidebarOpen(false)
                                  }
                                }}
                                disabled={!canAdd}
                                className={`w-full p-3 rounded-lg border transition-all text-left group ${
                                  canAdd
                                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-[0.98]'
                                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                                }`}
                                title={!canAdd && !isContainer && !hasContainerInBlocks ? '⚠️ Ajoutez d\'abord un conteneur (Container, Grid, Flex, etc.)' : ''}
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
                                
                                return (
                                  <button
                                    key={`${blockType.name}-${blockType.id}`}
                                    onClick={() => {
                                      if (canAdd) {
                                        addBlock(blockType)
                                        setSidebarOpen(false)
                                      }
                                    }}
                                    disabled={!canAdd}
                                    className={`w-full px-3 sm:px-4 py-3 text-left bg-white dark:bg-gray-800 border-2 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                                      canAdd
                                        ? 'border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md cursor-pointer group'
                                        : 'border-gray-100 dark:border-gray-800 opacity-60 cursor-not-allowed'
                                    }`}
                                    title={
                                      !canAdd && !isContainer && !hasContainerInBlocks 
                                        ? '⚠️ Ajoutez d\'abord un conteneur (Container, Grid, Flex, etc.) dans la catégorie "Mise en page"' 
                                        : !canUse && isPremium 
                                          ? 'Bloc premium - Nécessite un abonnement supérieur' 
                                          : ''
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
        <div className={`flex-1 flex flex-col min-w-0 h-full transition-all duration-300 w-full ${!blocksPaletteOpen ? 'ml-0' : ''}`} style={{ position: 'relative' }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={history.state.map((b: Block) => b.id)} strategy={verticalListSortingStrategy}>
              <div 
                className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 2xl:p-12 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 max-w-full min-h-0"
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
                  <div ref={blockListRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-12 gap-4 lg:gap-6 auto-rows-min">
                      {history.state
                        .filter((b: Block) => !b.position || b.position.type === 'static')
                        .map((block: Block) => {
                          // Calculer le span de colonnes basé sur le layout (système 12 colonnes)
                          const layoutCols = block.layout || 12
                          const colSpan = layoutCols === 12 ? 'col-span-full' : `col-span-${layoutCols}`
                        
                        return (
                          <div 
                            key={block.id} 
                            className={colSpan}
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
                      // Capturer l'événement de clic initial pour calculer l'offset
                      dragStartEventRef.current = e.nativeEvent as MouseEvent
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
                  // dnd-kit positionne le DragOverlay à la position de la souris
                  // Le DragOverlay est positionné de manière à ce que son coin supérieur gauche
                  // soit à la position de la souris. Pour que le point de clic reste exactement
                  // sous le curseur, on doit soustraire l'offset du clic
                  const offsetX = dragStartPositionRef.current?.offsetX ?? 0
                  const offsetY = dragStartPositionRef.current?.offsetY ?? 0
                  
                  return (
                    <div 
                      className="bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-xl shadow-2xl pointer-events-none"
                      style={{
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        maxWidth: '280px',
                        minWidth: '200px',
                        opacity: 1,
                        // Positionner le bloc pour que le point de clic reste exactement sous le curseur
                        // dnd-kit positionne le DragOverlay à la position de la souris (coin supérieur gauche)
                        // On soustrait l'offset pour que le point de clic reste aligné avec le curseur
                        // Utiliser Math.round pour éviter les problèmes de rendu avec les décimales
                        transform: `translate(-${Math.round(offsetX)}px, -${Math.round(offsetY)}px)`,
                        willChange: 'transform',
                        // Le DragOverlay de dnd-kit est déjà en position fixed
                        // On utilise juste le transform pour ajuster la position relative au curseur
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

// Sortable Block Component - Optimisé avec React.memo pour éviter les re-renders inutiles
const SortableBlock = React.memo(function SortableBlock({
  block,
  blockTypes,
  isSelected,
  onSelect,
  onSelectChild,
  onUpdate,
  onDelete,
  onDuplicate,
  isCollapsed,
  onToggleCollapse,
  onMove,
  allBlocks,
  findBlockInTree,
  selectedBlockId,
  onDragStartCapture,
  isChildBlock = false, // Nouveau prop pour indiquer si c'est un bloc enfant
}: {
  block: Block
  blockTypes: BlockType[]
  isSelected: boolean
  onSelect: () => void
  onSelectChild?: (childId: string) => void
  onUpdate: (updates: Partial<Block>) => void
  onDelete: () => void
  onDuplicate: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  onMove?: (blockId: string, targetContainerId: string | 'root') => void
  allBlocks?: Block[]
  findBlockInTree?: (blocks: Block[], blockId: string) => { block: Block; parent: Block[] | null; index: number } | null
  selectedBlockId?: string | null
  onDragStartCapture?: (e: React.PointerEvent) => void
  isChildBlock?: boolean // Nouveau prop
}) {
  // État pour le menu contextuel
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  // Utiliser l'état passé en prop ou un état local par défaut
  const isExpanded = isCollapsed !== undefined ? !isCollapsed : true
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: block.id,
    data: {
      type: 'block',
      block: block,
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.3 : 1, // Plus transparent pendant le drag pour voir le DragOverlay
  }

  const blockType = blockTypes.find(bt => bt.name === block.type)

  // Calculer les tailles basées sur le nombre de colonnes (sur 12)
  const layoutCols = typeof block.layout === 'number' ? block.layout : 12
  const isSmall = layoutCols <= 4 // 1-4 colonnes = petit
  const isMedium = layoutCols > 4 && layoutCols <= 8 // 5-8 colonnes = moyen
  const isLarge = layoutCols > 8 // 9-12 colonnes = grand

  // Gestion du redimensionnement
  const [isResizing, setIsResizing] = useState(false)
  const blockRef = useRef<HTMLDivElement>(null)

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>, direction: string) => {
    e.stopPropagation()
    e.preventDefault()
    setIsResizing(true)
    
    const startX = e.clientX
    const startLayout = block.layout || 12
    const containerWidth = blockRef.current?.parentElement?.offsetWidth || 1200
    const colWidth = containerWidth / 12 // Largeur d'une colonne

    // Paliers de colonnes disponibles (1-12)
    const availableLayouts: (1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12)[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!blockRef.current || !blockRef.current.parentElement) return
      
      const deltaX = moveEvent.clientX - startX
      const currentContainerWidth = blockRef.current.parentElement.offsetWidth
      const currentColWidth = currentContainerWidth / 12
      
      // Calculer le nombre de colonnes basé sur le delta
      const deltaCols = Math.round(deltaX / currentColWidth)
      const newLayoutIndex = availableLayouts.indexOf(startLayout) + (direction.includes('right') ? deltaCols : -deltaCols)
      // Limiter à minimum 2 colonnes (pour une largeur minimale d'environ 200px sur un conteneur de 1200px)
      const minCols = 2
      const clampedIndex = Math.max(availableLayouts.indexOf(minCols as any), Math.min(availableLayouts.length - 1, newLayoutIndex))
      const newLayout = availableLayouts[clampedIndex]
      
      // Vérifier aussi que la largeur calculée ne soit pas inférieure à 200px
      const calculatedWidth = (newLayout / 12) * currentContainerWidth
      if (calculatedWidth < 200 && newLayout < minCols) {
        return // Ne pas permettre la réduction en dessous de 200px
      }
      
      // Ne mettre à jour que si la valeur a vraiment changé pour éviter les boucles
      if (newLayout !== startLayout && newLayout !== block.layout) {
        onUpdate({ layout: newLayout })
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Déterminer la taille du texte selon la largeur du bloc
  const getTextSize = () => {
    if (isSmall) return 'text-xs'
    if (isMedium) return 'text-xs sm:text-sm'
    return 'text-sm sm:text-base'
  }

  // Déterminer la taille de l'icône selon la largeur du bloc
  const getIconSize = () => {
    if (isSmall) return 'text-sm'
    if (isMedium) return 'text-base sm:text-lg'
    return 'text-lg sm:text-xl'
  }

  // Déterminer le padding selon la largeur du bloc
  const getPadding = () => {
    if (isSmall) return 'p-2'
    if (isMedium) return 'p-2 sm:p-3'
    return 'p-3 sm:p-4'
  }

  // Déterminer la taille de l'icône container
  const getIconContainerSize = () => {
    if (isSmall) return 'w-6 h-6 sm:w-7 sm:h-7'
    if (isMedium) return 'w-7 h-7 sm:w-8 sm:h-8'
    return 'w-8 h-8 sm:w-10 sm:h-10'
  }

  // Déterminer la taille des boutons
  const getButtonSize = () => {
    if (isSmall) return 'p-1.5'
    if (isMedium) return 'p-1.5 sm:p-2'
    return 'p-2'
  }

  const getButtonIconSize = () => {
    if (isSmall) return 'w-3 h-3 sm:w-4 sm:h-4'
    if (isMedium) return 'w-3.5 h-3.5 sm:w-4 sm:h-4'
    return 'w-4 h-4 sm:w-5 sm:h-5'
  }

  // Gérer le clic sur le bloc pour ouvrir les paramètres directement
  const handleBlockClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Toujours fermer le menu contextuel d'abord si ouvert
    if (showMenu) {
      closeContextMenu()
      e.stopPropagation()
      e.preventDefault()
      // Ne pas ouvrir les paramètres immédiatement après fermeture du menu
      return
    }
    
    // Ignorer si on clique sur les handles de redimensionnement
    if ((e.target as HTMLElement).closest('[class*="cursor-nwse-resize"], [class*="cursor-nesw-resize"], [class*="cursor-ew-resize"]')) {
      return
    }
    
    // Ignorer si on clique sur le menu contextuel
    if ((e.target as HTMLElement).closest('[data-context-menu]')) {
      return
    }
    
    // Ignorer si on clique sur le bouton collapse
    if ((e.target as HTMLElement).closest('[data-collapse-button]')) {
      return
    }
    
    // Vérifier si on clique sur un enfant dans un conteneur
    // Les enfants sont dans des divs avec data-child-block-id
    const childElement = (e.target as HTMLElement).closest('[data-child-block-id]')
    if (childElement) {
      // Si onSelectChild est disponible, l'utiliser
      if (onSelectChild) {
        const childId = childElement.getAttribute('data-child-block-id')
        if (childId) {
          e.stopPropagation()
          e.preventDefault()
          onSelectChild(childId)
          return
        }
      }
      // Sinon, arrêter la propagation pour ne pas sélectionner le conteneur
      e.stopPropagation()
      return
    }
    
    // Vérifier aussi si on clique dans le contenu d'un enfant (même si pas directement sur data-child-block-id)
    // Cela peut arriver si on clique sur BlockRenderer à l'intérieur d'un enfant
    const clickedInChildContent = (e.target as HTMLElement).closest('[data-child-block-id]')
    if (clickedInChildContent) {
      e.stopPropagation()
      return
    }
    
    // Ouvrir les paramètres directement
    onSelect()
  }

  // Gérer le double-clic pour ouvrir les paramètres
  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Vérifier si on double-clique sur un enfant dans un conteneur
    const childElement = (e.target as HTMLElement).closest('[data-child-block-id]')
    if (childElement && onSelectChild) {
      const childId = childElement.getAttribute('data-child-block-id')
      if (childId) {
        e.stopPropagation()
        e.preventDefault()
        // Sélectionner l'enfant et ouvrir les paramètres
        onSelectChild(childId)
        return
      }
    }
    
    e.stopPropagation()
    e.preventDefault()
    // Ouvrir les paramètres en sélectionnant le bloc
    onSelect()
    onSelect()
  }

  // Gérer le clic droit pour afficher le menu contextuel
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    // Vérifier si on fait un clic droit sur un enfant dans ContainerChildrenRenderer
    // Les enfants dans ContainerChildrenRenderer ont data-child-block-id directement sur leur div
    // Vérifier récursivement pour gérer les blocs imbriqués (texte dans conteneur dans conteneur)
    let currentElement: HTMLElement | null = e.target as HTMLElement
    let childElement: HTMLElement | null = null
    let childId: string | null = null
    
    // Chercher récursivement un élément avec data-child-block-id
    while (currentElement && currentElement !== e.currentTarget) {
      if (currentElement.hasAttribute('data-child-block-id')) {
        childElement = currentElement
        childId = currentElement.getAttribute('data-child-block-id')
        break
      }
      currentElement = currentElement.parentElement
    }
    
    // Si on a trouvé un enfant, ne pas afficher le menu du parent
    if (childElement && childId && onSelectChild) {
      e.preventDefault()
      e.stopPropagation()
      // Ne pas afficher le menu du parent - l'enfant gère son propre menu
      // L'enfant va gérer son propre onContextMenu qui sélectionnera l'enfant et ouvrira son menu
      return
    }
    
    // Sinon, afficher le menu contextuel du bloc parent
    e.preventDefault()
    e.stopPropagation()
    // Fermer le menu précédent immédiatement
    if (showMenu) {
      closeContextMenu()
    }
    // Ouvrir le menu contextuel immédiatement
    setContextMenu({ x: e.clientX, y: e.clientY })
    setShowMenu(true)
  }

  // Fermer le menu contextuel
  const closeContextMenu = () => {
    setContextMenu(null)
    setShowMenu(false)
  }

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    if (showMenu) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        // Ne pas fermer si on clique sur le menu lui-même
        if (target.closest('[data-context-menu]')) {
          return
        }
        // Fermer le menu
        closeContextMenu()
      }
      
      // Utiliser capture phase pour intercepter avant les autres handlers
      document.addEventListener('click', handleClickOutside, true)
      document.addEventListener('contextmenu', handleClickOutside, true)
      
      return () => {
        document.removeEventListener('click', handleClickOutside, true)
        document.removeEventListener('contextmenu', handleClickOutside, true)
      }
    }
  }, [showMenu])

  return (
    <>
      <div
        ref={(node) => {
          setNodeRef(node)
          if (node && blockRef) {
            (blockRef as React.MutableRefObject<HTMLDivElement | null>).current = node
          }
        }}
        data-block-id={block.id}
        className={`relative w-full mb-4 bg-white dark:bg-gray-800 rounded-xl border-2 ${isSelected ? 'border-blue-500 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800' : 'border-gray-200 dark:border-gray-700'} shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden min-h-[80px] min-w-[200px] ${isResizing ? 'select-none' : ''} group cursor-move`}
        style={{
          ...style,
          minWidth: '200px',
          minHeight: '80px',
        }}
        {...attributes}
        {...(listeners ? {
          ...listeners,
          onPointerDown: (e: React.PointerEvent) => {
            // Sélectionner le bloc automatiquement quand on commence à le glisser
            if (!isSelected) {
              onSelect()
            }
            // Capturer l'événement de clic initial pour calculer l'offset
            if (onDragStartCapture) {
              onDragStartCapture(e)
            }
            if (listeners.onPointerDown) {
              listeners.onPointerDown(e)
            }
          },
        } : {})}
        onClick={handleBlockClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => {
          // Vérifier d'abord si on clique sur un enfant AVANT d'afficher le menu du parent
          // Chercher récursivement pour gérer les blocs profondément imbriqués
          let currentElement: HTMLElement | null = e.target as HTMLElement
          let childElement: HTMLElement | null = null
          
          // Chercher récursivement un élément avec data-child-block-id
          while (currentElement && currentElement !== e.currentTarget) {
            if (currentElement.hasAttribute('data-child-block-id')) {
              childElement = currentElement
              break
            }
            currentElement = currentElement.parentElement
          }
          
          if (childElement) {
            // Si c'est un enfant, ne pas afficher le menu du parent
            // L'enfant gère son propre menu contextuel
            e.preventDefault()
            e.stopPropagation()
            return
          }
          // Sinon, appeler le handler normal
          handleContextMenu(e)
        }}
        onMouseDown={(e) => {
          // Empêcher le menu contextuel de se rouvrir après un clic gauche
          if (e.button === 0 && showMenu) {
            // Clic gauche : fermer le menu immédiatement
            closeContextMenu()
            e.stopPropagation()
          }
        }}
      >
      {/* Resize Handles - Désactivé : le resize se fait via les paramètres pour éviter les conflits */}
      {false && isSelected && !isChildBlock && (
        <>
          {/* Corner handles */}
          <div
            className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize bg-blue-500 border-2 border-white dark:border-gray-800 rounded-br-lg z-20 hover:bg-blue-600"
            onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => handleResizeStart(e, 'left')}
            title="Redimensionner"
          />
          <div
            className="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize bg-blue-500 border-2 border-white dark:border-gray-800 rounded-bl-lg z-20 hover:bg-blue-600"
            onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => handleResizeStart(e, 'right')}
            title="Redimensionner"
          />
          {/* Edge handles */}
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-8 cursor-ew-resize bg-blue-500 border-2 border-white dark:border-gray-800 rounded-r-lg z-20 hover:bg-blue-600"
            onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => handleResizeStart(e, 'left')}
            title="Redimensionner"
          />
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-8 cursor-ew-resize bg-blue-500 border-2 border-white dark:border-gray-800 rounded-l-lg z-20 hover:bg-blue-600"
            onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => handleResizeStart(e, 'right')}
            title="Redimensionner"
          />
        </>
      )}
      {/* Block Header - Modern Design */}
      <div
        className={`flex items-center justify-between ${getPadding()} transition-colors ${
          isSelected 
            ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-b border-blue-200 dark:border-blue-700' 
            : 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-800'
        }`}
        onClick={(e) => {
          // Ne pas ouvrir les paramètres si on drag ou si on clique sur le bouton collapse
          if (!isDragging && !(e.target as HTMLElement).closest('[data-collapse-button]')) {
            e.stopPropagation()
            handleBlockClick(e as any)
          }
        }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <button
            data-collapse-button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              if (onToggleCollapse) {
                onToggleCollapse()
              }
            }}
            onMouseDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            onPointerDown={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            className="flex-shrink-0 p-2.5 sm:p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 transition-colors cursor-pointer touch-manipulation z-10 relative"
            title={isExpanded ? "Masquer les propriétés" : "Afficher les propriétés"}
          >
            <svg 
              className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-300 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div 
            className={`flex-shrink-0 ${getIconContainerSize()} rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-700`}
            {...(!isSelected ? { ...attributes, ...listeners } : {})}
            onClick={(e) => {
              // Si le bloc est sélectionné, les listeners sont sur le bloc principal
              if (isSelected) {
                e.stopPropagation()
              }
            }}
          >
            <span className={getIconSize()}>{blockType?.icon || '📦'}</span>
          </div>
          <div className="min-w-0 flex-1">
            <span className={`${getTextSize()} font-semibold text-gray-900 dark:text-gray-100 truncate block`}>{blockType?.label || block.type}</span>
            {blockType?.description && layoutCols > 4 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate block hidden sm:block">{blockType.description}</span>
            )}
          </div>
        </div>
        {/* Indicateur clic pour paramètres et bouton Supprimer - visible au survol */}
        <div className="flex items-center gap-2 flex-shrink-0 z-10 relative opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="text-xs text-gray-400 dark:text-gray-500 px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700" title="Clic droit pour ouvrir les paramètres du bloc">
            <span className="text-blue-600 dark:text-blue-400">⚙️</span> Clic droit paramètres
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${blockType?.label || block.type}" ?`)) {
                onDelete()
              }
            }}
            className="p-1.5 sm:p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            title="Supprimer le bloc"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        {/* Aide contextuelle pour drag and drop - visible quand sélectionné */}
        {isSelected && (
          <div className="absolute top-2 right-2 opacity-100 transition-opacity z-10">
            <div className="text-xs text-blue-600 dark:text-blue-400 px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700" title="Glissez-déposez ce bloc pour le déplacer ou le mettre dans un conteneur">
              <span className="text-blue-600 dark:text-blue-400">🖱️</span> Glisser pour déplacer
            </div>
          </div>
        )}
      </div>

      {/* Block Content - Simple and Clean */}
      {isExpanded ? (
        <div 
          className={`${isSmall ? 'p-2 sm:p-3' : 'p-4 sm:p-6'} bg-white dark:bg-gray-800 min-h-[120px]`}
          onClick={(e) => {
            // Empêcher la sélection du conteneur si on clique dans le contenu
            // Sauf si on clique directement sur le conteneur (pas sur un enfant)
            const target = e.target as HTMLElement
            if (target.closest('[data-child-block-id]')) {
              e.stopPropagation()
            }
          }}
        >
          {/* Conteneur avec enfants */}
          {(block.type === 'container' || block.type === 'flex-container' || block.type === 'grid-container' || 
            block.type === 'flexbox' || block.type === 'grid' || block.type === 'stack' || 
            block.type === 'inline' || block.type === 'group' || block.type === 'wrapper' || block.type === 'section' || block.type === 'rows') ? (
            <ContainerChildrenRenderer
              block={block}
              blockTypes={blockTypes}
              allBlocks={allBlocks || []} // Passer tous les blocs pour permettre de choisir un bloc existant
              onAddChild={(childBlock) => {
                const newChildren = [...(block.children || []), childBlock]
                onUpdate({ children: newChildren })
              }}
              onUpdateChild={(childId, updates) => {
                const newChildren = (block.children || []).map((child) =>
                  child.id === childId ? { ...child, ...updates } : child
                )
                onUpdate({ children: newChildren })
              }}
              onDeleteChild={(childId) => {
                const childToDelete = (block.children || []).find(c => c.id === childId)
                const childBlockType = blockTypes.find(bt => bt.name === childToDelete?.type)
                const childLabel = childBlockType?.label || childToDelete?.type || 'ce bloc'
                
                if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${childLabel}" ?\n\nCette action est irréversible et supprimera également tous les blocs enfants s'il s'agit d'un conteneur.`)) {
                  const newChildren = (block.children || []).filter((child) => child.id !== childId)
                  onUpdate({ children: newChildren })
                }
              }}
              onSelectChild={(childId) => {
                // Utiliser onSelectChild du parent pour gérer la sélection
                if (onSelectChild) {
                  onSelectChild(childId)
                }
              }}
              onSelectContainer={() => {
                // Sélectionner le conteneur parent
                onSelect()
              }}
              selectedBlockId={selectedBlockId}
              onMoveChild={(childId, targetContainerId) => {
                // Trouver l'enfant à déplacer
                const children = block.children || []
                const childToMove = children.find(c => c.id === childId)
                if (!childToMove) return
                
                // Retirer l'enfant du conteneur actuel
                const newChildren = children.filter(c => c.id !== childId)
                onUpdate({ children: newChildren })
                
                // Utiliser onMove du parent pour gérer le déplacement
                if (onMove) {
                  onMove(childId, targetContainerId)
                }
              }}
              onMoveBlockToContainer={(blockId) => {
                // Utiliser onMove du parent pour gérer le déplacement vers ce conteneur
                if (onMove) {
                  onMove(blockId, block.id)
                }
              }}
              findBlockInTree={findBlockInTree}
            />
          ) : (
            <BlockRenderer block={block} blockType={blockType} onUpdate={onUpdate} />
          )}
        </div>
      ) : (
        // Vue réduite : afficher uniquement un indicateur compact
        <div className={`${isSmall ? 'p-2' : 'p-3'} bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700`}>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400 italic">
              Bloc réduit - Cliquez sur la flèche pour développer
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (onToggleCollapse) {
                  onToggleCollapse()
                }
              }}
              className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              title="Développer le bloc"
            >
              Développer
            </button>
          </div>
        </div>
      )}

      {/* Menu contextuel */}
      {contextMenu && showMenu && (
        <div
          data-context-menu
          className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 min-w-[180px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => {
            e.stopPropagation()
            // Ne pas fermer le menu si on clique dedans
          }}
          onMouseDown={(e) => {
            e.stopPropagation()
            // Empêcher la propagation pour éviter que le clic ne déclenche handleBlockClick
          }}
          onContextMenu={(e) => {
            e.stopPropagation()
            e.preventDefault()
            // Empêcher l'ouverture d'un nouveau menu contextuel si on fait un clic droit dans le menu
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSelect()
              closeContextMenu()
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Paramètres
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              // Sélectionner le bloc d'abord pour afficher ses paramètres
              onSelect()
              // Fermer le menu après un court délai pour permettre la sélection
              setTimeout(() => {
                closeContextMenu()
              }, 100)
              // Le bloc est maintenant sélectionné et draggable
              // L'utilisateur peut maintenant glisser le bloc vers n'importe quel conteneur
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
            title="Sélectionner le bloc et le rendre déplaçable (glisser pour déplacer)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
            Déplacer (glisser le bloc)
          </button>
          {onToggleCollapse && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleCollapse()
                closeContextMenu()
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isExpanded ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                )}
              </svg>
              {isExpanded ? 'Réduire' : 'Étendre'}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
              closeContextMenu()
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Dupliquer
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              const blockType = blockTypes.find(bt => bt.name === block.type)
              const blockLabel = blockType?.label || block.type || 'ce bloc'
              if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${blockLabel}" ?\n\nCette action est irréversible et supprimera également tous les blocs enfants s'il s'agit d'un conteneur.`)) {
                onDelete()
                closeContextMenu()
              }
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Supprimer
          </button>
        </div>
      )}

    </div>
    </>
  )
})

// Container Children Renderer - Affiche et gère les enfants d'un conteneur
// Composant séparé pour chaque enfant draggable (pour respecter les règles des Hooks React)
function DraggableChildBlock({
  child,
  childBlockType,
  blockTypes,
  selectedBlockId,
  onSelectChild,
  onUpdateChild,
  onDeleteChild,
  onMoveChild,
  findBlockInTree,
  allBlocks,
  showMenu,
  setShowMenu,
  contextMenu,
  setContextMenu,
  closeContextMenu,
  toggleChildCollapse,
  collapsedChildren,
}: {
  child: Block
  childBlockType?: BlockType
  blockTypes: BlockType[]
  selectedBlockId?: string | null
  onSelectChild: (childId: string) => void
  onUpdateChild: (childId: string, updates: Partial<Block>) => void
  onDeleteChild: (childId: string) => void
  onMoveChild?: (childId: string, targetContainerId: string | 'root') => void
  findBlockInTree?: (blocks: Block[], blockId: string) => { block: Block; parent: Block[] | null; index: number } | null
  allBlocks?: Block[]
  showMenu: boolean
  setShowMenu: (show: boolean) => void
  contextMenu: { x: number; y: number; childId?: string } | null
  setContextMenu: (menu: { x: number; y: number; childId?: string } | null) => void
  closeContextMenu: () => void
  toggleChildCollapse: (childId: string) => void
  collapsedChildren: Set<string>
}) {
  // Utiliser useDraggable au niveau du composant (pas dans une boucle)
  const { attributes: childAttributes, listeners: childListeners, setNodeRef: setChildNodeRef, transform: childTransform, isDragging: isChildDragging } = useDraggable({
    id: child.id,
    data: {
      type: 'block',
      block: child,
    }
  })
  
  const childStyle = {
    transform: CSS.Transform.toString(childTransform),
    opacity: isChildDragging ? 0.3 : 1,
  }
  
  return (
    <div
      ref={setChildNodeRef}
      style={childStyle}
      data-child-block-id={child.id}
      className={`bg-white dark:bg-gray-800 rounded-lg border transition-colors overflow-hidden group relative ${
        selectedBlockId === child.id
          ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-300 dark:ring-blue-600 shadow-md cursor-move'
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer'
      }`}
      {...(selectedBlockId === child.id ? { ...childAttributes, ...childListeners } : {
        ...childAttributes,
        ...childListeners,
        onPointerDown: (e: React.PointerEvent) => {
          // Sélectionner l'enfant automatiquement quand on commence à le glisser
          if (selectedBlockId !== child.id) {
            onSelectChild(child.id)
          }
          if (childListeners.onPointerDown) {
            childListeners.onPointerDown(e)
          }
        }
      })}
      onClick={(e) => {
        e.stopPropagation()
        onSelectChild(child.id)
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (showMenu) {
          closeContextMenu()
        }
        onSelectChild(child.id)
        setContextMenu({ x: e.clientX, y: e.clientY, childId: child.id })
        setShowMenu(true)
      }}
    >
      {/* Header du bloc enfant */}
      <div className={`flex items-center justify-between p-3 border-b relative transition-colors ${
        selectedBlockId === child.id
          ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-700'
          : 'border-gray-200 dark:border-gray-700'
      }`}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleChildCollapse(child.id)
            }}
            className="flex-shrink-0 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={collapsedChildren.has(child.id) ? "Développer" : "Réduire"}
          >
            <svg 
              className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform duration-200 ${collapsedChildren.has(child.id) ? '' : 'rotate-90'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <span className="text-lg flex-shrink-0">{childBlockType?.icon || '📦'}</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {childBlockType?.label || child.type}
          </span>
        </div>
        {/* Bouton Supprimer et indicateur drag - visible au survol */}
        <div className="flex items-center gap-2 flex-shrink-0 z-10 relative opacity-0 group-hover:opacity-100 transition-opacity">
          {selectedBlockId === child.id && (
            <div className="text-xs text-blue-600 dark:text-blue-400 px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700" title="Glisser pour déplacer">
              <span className="text-blue-600 dark:text-blue-400">🖱️</span> Glisser
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              const childLabel = childBlockType?.label || child.type || 'ce bloc'
              if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${childLabel}" ?\n\nCette action est irréversible et supprimera également tous les blocs enfants s'il s'agit d'un conteneur.`)) {
                onDeleteChild(child.id)
              }
            }}
            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex-shrink-0"
            title="Supprimer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      {/* Contenu du bloc enfant */}
      {!collapsedChildren.has(child.id) && childBlockType && (
        <div 
          className="p-3"
          data-child-block-id={child.id}
          onClick={(e) => {
            e.stopPropagation()
            onSelectChild(child.id)
          }}
          onDoubleClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onSelectChild(child.id)
          }}
          onContextMenu={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (showMenu) {
              closeContextMenu()
            }
            onSelectChild(child.id)
            setContextMenu({ x: e.clientX, y: e.clientY, childId: child.id })
            setShowMenu(true)
          }}
          onMouseDown={(e) => {
            e.stopPropagation()
          }}
        >
          {/* Si l'enfant est un conteneur, utiliser ContainerChildrenRenderer */}
          {(child.type === 'container' || child.type === 'flex-container' || child.type === 'grid-container' || 
            child.type === 'flexbox' || child.type === 'grid' || child.type === 'stack' || 
            child.type === 'inline' || child.type === 'group' || child.type === 'wrapper' || child.type === 'section' || child.type === 'rows') ? (
            <ContainerChildrenRenderer
              block={child}
              blockTypes={blockTypes}
              allBlocks={allBlocks}
              onAddChild={(newChildBlock) => {
                const newChildren = [...(child.children || []), newChildBlock]
                onUpdateChild(child.id, { children: newChildren })
              }}
              onUpdateChild={(grandChildId, updates) => {
                const newChildren = (child.children || []).map((grandChild) =>
                  grandChild.id === grandChildId ? { ...grandChild, ...updates } : grandChild
                )
                onUpdateChild(child.id, { children: newChildren })
              }}
              onDeleteChild={(grandChildId) => {
                const newChildren = (child.children || []).filter((grandChild) => grandChild.id !== grandChildId)
                onUpdateChild(child.id, { children: newChildren })
              }}
              onSelectChild={(grandChildId) => {
                onSelectChild(grandChildId)
              }}
              onSelectContainer={() => {
                // Sélectionner le conteneur enfant (qui est lui-même un conteneur)
                onSelectChild(child.id)
              }}
              selectedBlockId={selectedBlockId}
              onMoveChild={(grandChildId, targetContainerId) => {
                const newChildren = (child.children || []).filter((grandChild) => grandChild.id !== grandChildId)
                onUpdateChild(child.id, { children: newChildren })
                if (onMoveChild) {
                  onMoveChild(grandChildId, targetContainerId)
                }
              }}
              onMoveBlockToContainer={(blockId) => {
                // Pour les conteneurs imbriqués, déplacer vers ce conteneur (child.id)
                if (onMoveChild && findBlockInTree && allBlocks) {
                  const blockInfo = findBlockInTree(allBlocks, blockId)
                  if (blockInfo && blockInfo.block) {
                    // Retirer le bloc de sa position actuelle et l'ajouter dans ce conteneur
                    onMoveChild(blockId, child.id)
                  }
                }
              }}
              findBlockInTree={findBlockInTree}
            />
          ) : (
            <div 
              data-child-block-id={child.id}
              onClick={(e) => {
                e.stopPropagation()
                onSelectChild(child.id)
              }}
              onContextMenu={(e) => {
                e.preventDefault()
                e.stopPropagation()
                // Fermer tout menu précédent
                if (showMenu) {
                  closeContextMenu()
                }
                // Sélectionner l'enfant et ouvrir ses paramètres
                onSelectChild(child.id)
                // Ouvrir le menu contextuel de l'enfant
                setContextMenu({ x: e.clientX, y: e.clientY, childId: child.id })
                setShowMenu(true)
              }}
            >
              <BlockRenderer 
                block={{ ...child, data: child.data || {} }} 
                blockType={childBlockType} 
                onUpdate={(updates) => onUpdateChild(child.id, updates)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ContainerChildrenRenderer({
  block,
  blockTypes,
  onAddChild,
  onUpdateChild,
  onDeleteChild,
  onSelectChild,
  onSelectContainer, // Fonction pour sélectionner le conteneur parent
  allBlocks, // Tous les blocs de l'éditeur pour permettre de choisir un bloc existant
  selectedBlockId, // ID du bloc actuellement sélectionné
  onMoveChild, // Fonction pour déplacer un enfant vers un autre conteneur
  onMoveBlockToContainer, // Fonction pour déplacer n'importe quel bloc vers ce conteneur
  findBlockInTree, // Fonction pour trouver un bloc dans l'arbre
}: {
  block: Block
  blockTypes: BlockType[]
  onAddChild: (child: Block) => void
  onUpdateChild: (childId: string, updates: Partial<Block>) => void
  onDeleteChild: (childId: string) => void
  onSelectChild: (childId: string) => void
  onSelectContainer?: () => void // Fonction pour sélectionner le conteneur parent
  allBlocks?: Block[] // Tous les blocs disponibles dans l'éditeur
  selectedBlockId?: string | null // ID du bloc actuellement sélectionné
  onMoveChild?: (childId: string, targetContainerId: string | 'root') => void // Fonction pour déplacer un enfant
  onMoveBlockToContainer?: (blockId: string) => void // Fonction pour déplacer n'importe quel bloc vers ce conteneur
  findBlockInTree?: (blocks: Block[], blockId: string) => { block: Block; parent: Block[] | null; index: number } | null // Fonction pour trouver un bloc
}) {
  const children = block.children || []
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [collapsedChildren, setCollapsedChildren] = useState<Set<string>>(new Set())
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; childId: string } | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  
  // Fonction pour vérifier si un bloc est un conteneur
  const isContainerType = useCallback((blockTypeName: string): boolean => {
    const containerTypes = ['container', 'flex-container', 'grid-container', 'flexbox', 'grid', 'stack', 'inline', 'group', 'wrapper', 'section', 'rows', 'columns']
    return containerTypes.includes(blockTypeName)
  }, [])
  
  const toggleChildCollapse = useCallback((childId: string) => {
    setCollapsedChildren(prev => {
      const newSet = new Set(prev)
      if (newSet.has(childId)) {
        newSet.delete(childId)
      } else {
        newSet.add(childId)
      }
      return newSet
    })
  }, [])
  
  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
    setShowMenu(false)
  }, [])
  
  // Fermer le menu si on clique ailleurs (clic gauche ou droit)
  useEffect(() => {
    if (showMenu) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        // Fermer le menu si on clique n'importe où sauf sur le menu lui-même
        if (!target.closest('[data-context-menu]')) {
          closeContextMenu()
        }
      }
      // Écouter les clics gauches et droits
      document.addEventListener('click', handleClickOutside, true)
      document.addEventListener('contextmenu', handleClickOutside, true)
      // Écouter aussi les mousedown pour fermer plus rapidement
      document.addEventListener('mousedown', handleClickOutside, true)
      return () => {
        document.removeEventListener('click', handleClickOutside, true)
        document.removeEventListener('contextmenu', handleClickOutside, true)
        document.removeEventListener('mousedown', handleClickOutside, true)
      }
    }
  }, [showMenu, closeContextMenu])

  const handleAddBlock = useCallback((blockType: BlockType) => {
    // Utiliser startTransition pour optimiser les performances
    startTransition(() => {
      const newChild: Block = {
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: blockType.name,
        data: {},
        layout: block.type === 'grid-container' ? undefined : 3, // Par défaut 3 colonnes
        children: isContainerType(blockType.name) ? [] : undefined,
      }
      // Ajouter le bloc immédiatement
      onAddChild(newChild)
      // Fermer la popup après l'ajout
      setShowAddMenu(false)
    })
  }, [block.type, onAddChild])

  const handleAddExistingBlock = useCallback((existingBlock: Block) => {
    // Si onMoveBlockToContainer est disponible, utiliser cette fonction pour déplacer le bloc
    // Sinon, créer une copie (pour compatibilité)
    if (onMoveBlockToContainer) {
      // Déplacer le bloc existant vers ce conteneur
      onMoveBlockToContainer(existingBlock.id)
      setShowAddMenu(false)
      return
    }
    
    // Fallback : créer une copie si le déplacement n'est pas possible
    // (par exemple si onMoveBlockToContainer n'est pas disponible)
    const deepCloneBlock = (bloc: Block, baseId: string): Block => {
      const newId = bloc === existingBlock 
        ? baseId 
        : `${baseId}-child-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const cloned: Block = {
        ...bloc,
        id: newId,
        data: bloc.data ? { ...bloc.data } : {},
        styles: bloc.styles ? { ...bloc.styles } : {},
      }
      
      // Cloner récursivement les enfants avec de nouveaux IDs
      if (bloc.children && bloc.children.length > 0) {
        cloned.children = bloc.children.map((child, idx) => 
          deepCloneBlock(child, `${baseId}-child-${idx}`)
        )
      }
      
      return cloned
    }
    
    const newId = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const copiedBlock = deepCloneBlock(existingBlock, newId)
    
    // Ajouter le bloc cloné dans le conteneur
    onAddChild(copiedBlock)
    setShowAddMenu(false)
  }, [onAddChild, onMoveBlockToContainer])

  const containerStyle: React.CSSProperties = {
    minHeight: '120px',
    ...(block.type === 'flex-container' && {
      display: 'flex',
      flexDirection: block.data?.direction || 'row',
      flexWrap: block.data?.wrap || 'nowrap',
      gap: block.data?.gap || '1rem',
    }),
    ...(block.type === 'grid-container' && {
      display: 'grid',
      gridTemplateColumns: block.data?.columns || 'repeat(3, 1fr)',
      gridTemplateRows: block.data?.rows || 'auto',
      gap: block.data?.gap || '1rem',
    }),
  }

  return (
    <div className="space-y-3">
      {/* Zone de conteneur avec style approprié et zone de drop */}
      <ContainerDropZone
        containerId={block.id}
        onDrop={handleAddBlock}
        onSelectContainer={onSelectContainer}
        className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/50 min-h-[120px]"
      >
        <div 
          style={containerStyle} 
          className="w-full h-full"
          onClick={(e) => {
            // Si on clique directement sur la zone de conteneur (pas sur un enfant), sélectionner le conteneur
            const target = e.target as HTMLElement
            // Vérifier si le clic est sur un enfant (data-child-block-id) ou sur un élément interactif
            const clickedOnChild = target.closest('[data-child-block-id]')
            const clickedOnInteractive = target.closest('button, input, textarea, select, a, [role="button"]')
            
            // Si on n'a pas cliqué sur un enfant ou un élément interactif, sélectionner le conteneur
            if (!clickedOnChild && !clickedOnInteractive && onSelectContainer) {
              e.stopPropagation()
              onSelectContainer()
            }
          }}
        >
          {children.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-2xl mb-2">📦</div>
              <p className="text-sm font-medium mb-1">Conteneur vide</p>
              <p className="text-xs mb-2">Glissez un bloc ici ou cliquez sur "Ajouter un bloc"</p>
              <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  💡 <strong>Astuce:</strong> Vous pouvez glisser des blocs existants depuis l'éditeur dans ce conteneur
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {children.map((child) => {
                const childBlockType = blockTypes.find((bt) => bt.name === child.type)
                return (
                  <DraggableChildBlock
                    key={child.id}
                    child={child}
                    childBlockType={childBlockType}
                    blockTypes={blockTypes}
                    selectedBlockId={selectedBlockId}
                    onSelectChild={onSelectChild}
                    onUpdateChild={onUpdateChild}
                    onDeleteChild={onDeleteChild}
                    onMoveChild={onMoveChild}
                    findBlockInTree={findBlockInTree}
                    allBlocks={allBlocks}
                    showMenu={showMenu}
                    setShowMenu={setShowMenu}
                    contextMenu={contextMenu}
                    setContextMenu={setContextMenu}
                    closeContextMenu={closeContextMenu}
                    toggleChildCollapse={toggleChildCollapse}
                    collapsedChildren={collapsedChildren}
                  />
                )
              })}
            </div>
          )}
        </div>
      </ContainerDropZone>

      {/* Menu contextuel pour les enfants */}
      {contextMenu && showMenu && (
        <div
          data-context-menu
          className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 min-w-[180px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => {
            e.stopPropagation()
          }}
          onMouseDown={(e) => {
            e.stopPropagation()
          }}
          onContextMenu={(e) => {
            e.stopPropagation()
            e.preventDefault()
            // Empêcher l'ouverture d'un nouveau menu contextuel si on fait un clic droit dans le menu
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              if (contextMenu.childId) {
                // Sélectionner l'enfant et ouvrir les paramètres immédiatement
                onSelectChild(contextMenu.childId)
                closeContextMenu()
              } else {
                closeContextMenu()
              }
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Paramètres
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (contextMenu.childId) {
                // Sélectionner l'enfant d'abord pour afficher ses paramètres
                onSelectChild(contextMenu.childId)
                // Fermer le menu après un court délai pour permettre la sélection
                setTimeout(() => {
                  closeContextMenu()
                }, 100)
                // L'enfant est maintenant sélectionné et draggable
                // L'utilisateur peut maintenant glisser le bloc vers n'importe quel conteneur
              }
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
            title="Sélectionner le bloc et le rendre déplaçable (glisser pour déplacer)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
            Déplacer (glisser le bloc)
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (contextMenu.childId) {
                toggleChildCollapse(contextMenu.childId)
              }
              closeContextMenu()
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {contextMenu.childId && collapsedChildren.has(contextMenu.childId) ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              )}
            </svg>
            {contextMenu.childId && collapsedChildren.has(contextMenu.childId) ? 'Étendre' : 'Réduire'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (contextMenu.childId) {
                const child = children.find(c => c.id === contextMenu.childId)
                if (child) {
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
                  
                  const newChild = duplicateBlockRecursive(child)
                  const childIndex = children.findIndex(c => c.id === contextMenu.childId)
                  const newChildren = [...children]
                  newChildren.splice(childIndex + 1, 0, newChild)
                  onAddChild(newChild)
                }
              }
              closeContextMenu()
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Dupliquer
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (contextMenu.childId && onMoveChild) {
                // Retirer le bloc du conteneur et le placer à la racine (après le conteneur)
                onMoveChild(contextMenu.childId, 'root')
              }
              closeContextMenu()
            }}
            className="w-full px-4 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retirer du conteneur
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (contextMenu.childId) {
                if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bloc ?')) {
                  onDeleteChild(contextMenu.childId)
                }
              }
              closeContextMenu()
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Supprimer
          </button>
        </div>
      )}


      {/* Bouton pour ajouter un bloc */}
      <button
        onClick={() => setShowAddMenu(true)}
        className="w-full px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2"
        title="Cliquez pour ouvrir la liste des blocs disponibles, ou glissez un bloc existant dans la zone ci-dessus"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span className="text-sm font-medium">Ajouter un bloc</span>
      </button>
      {/* Aide contextuelle */}
      <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <strong>💡 Comment utiliser:</strong>
        </p>
        <ul className="text-xs text-gray-500 dark:text-gray-500 mt-1 space-y-0.5 list-disc list-inside">
          <li>Cliquez sur "Ajouter un bloc" pour choisir un nouveau bloc</li>
          <li>Glissez un bloc existant depuis l'éditeur dans la zone ci-dessus</li>
          <li>Appuyez sur <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Échap</kbd> pour désélectionner</li>
        </ul>
      </div>

      {/* Popup modale pour la liste des blocs */}
      {/* Permettre tous les blocs, y compris les conteneurs imbriqués */}
      {showAddMenu && (
        <BlockPickerModal
          blockTypes={blockTypes}
          existingBlocks={Array.isArray(allBlocks) ? allBlocks.filter(b => b.id !== block.id && !isBlockInContainer(b, block.id)) : []}
          onSelectNew={(blockType) => {
            handleAddBlock(blockType)
          }}
          onSelectExisting={(existingBlock) => {
            handleAddExistingBlock(existingBlock)
          }}
          onClose={() => setShowAddMenu(false)}
          blockTypesForExisting={blockTypes}
        />
      )}
    </div>
  )
}

// Container Drop Zone - Zone de drop pour les conteneurs
function ContainerDropZone({
  containerId,
  onDrop,
  onSelectContainer,
  children,
  className = '',
}: {
  containerId: string
  onDrop: (blockType: BlockType) => void
  onSelectContainer?: () => void
  children?: React.ReactNode
  className?: string
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `container-drop-${containerId}`,
    data: {
      type: 'container',
      containerId,
    },
  })

  // Vérifier si cette zone est survolée (via hoveredDropZone du parent)
  const dropZoneId = `container-drop-${containerId}`
  const isHovered = isOver

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isHovered ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 border-solid ring-2 ring-blue-300 dark:ring-blue-600' : 'border-dashed'} transition-all duration-200 relative`}
      title={isHovered ? 'Relâchez pour déposer le bloc ici' : 'Glissez un bloc ici pour l\'ajouter au conteneur'}
      onClick={(e) => {
        // Si on clique directement sur la zone de drop (pas sur un enfant), sélectionner le conteneur
        const target = e.target as HTMLElement
        const clickedOnChild = target.closest('[data-child-block-id]')
        const clickedOnInteractive = target.closest('button, input, textarea, select, a, [role="button"]')
        
        // Si on n'a pas cliqué sur un enfant ou un élément interactif, sélectionner le conteneur
        if (!clickedOnChild && !clickedOnInteractive && onSelectContainer) {
          e.stopPropagation()
          onSelectContainer()
        }
      }}
    >
      {children}
      {isHovered && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20 dark:bg-blue-900/30 rounded-lg pointer-events-none z-10 animate-pulse">
          <div className="bg-blue-500 dark:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-xl text-sm font-semibold flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Déposer ici
          </div>
        </div>
      )}
    </div>
  )
}

// Fonction utilitaire pour vérifier si un bloc est dans un conteneur
function isBlockInContainer(block: Block, containerId: string): boolean {
  if (block.id === containerId) return true
  if (block.children) {
    for (const child of block.children) {
      if (isBlockInContainer(child, containerId)) return true
    }
  }
  return false
}

// Block Picker Modal - Popup pour choisir un bloc (nouveau ou existant)
function BlockPickerModal({
  blockTypes,
  existingBlocks = [],
  onSelectNew,
  onSelectExisting,
  onClose,
  blockTypesForExisting = [],
}: {
  blockTypes: BlockType[]
  existingBlocks?: Block[]
  onSelectNew?: (blockType: BlockType) => void
  onSelectExisting?: (block: Block) => void
  onClose: () => void
  blockTypesForExisting?: BlockType[]
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'new' | 'existing'>('new')
  
  // Filtrer les blocs selon la recherche
  const filteredBlockTypes = useMemo(() => {
    if (!searchQuery.trim()) {
      return blockTypes
    }
    const query = searchQuery.toLowerCase()
    return blockTypes.filter((bt) => {
      const name = (bt.name || '').toLowerCase()
      const label = (bt.label || '').toLowerCase()
      const description = (bt.description || '').toLowerCase()
      const category = (bt.category || '').toLowerCase()
      return name.includes(query) || label.includes(query) || description.includes(query) || category.includes(query)
    })
  }, [blockTypes, searchQuery])
  
  // Grouper les blocs filtrés par catégorie
  const groupedBlocks = useMemo(() => {
    const groups: Record<string, BlockType[]> = {}
    filteredBlockTypes.forEach((bt) => {
      const category = bt.category || 'Autres'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(bt)
    })
    return groups
  }, [filteredBlockTypes])

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            Choisir un bloc
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Onglets pour choisir entre nouveaux blocs et blocs existants */}
        {existingBlocks.length > 0 && (
          <div className="flex border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 gap-1">
            <button
              onClick={() => setActiveTab('new')}
              className={`px-3 py-3 text-sm font-medium border-b-2 transition-colors relative group ${
                activeTab === 'new'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title={`Nouveaux blocs (${blockTypes.length})`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                Nouveaux blocs ({blockTypes.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('existing')}
              className={`px-3 py-3 text-sm font-medium border-b-2 transition-colors relative group ${
                activeTab === 'existing'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title={`Blocs existants (${existingBlocks.length})`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                Blocs existants ({existingBlocks.length})
              </span>
            </button>
          </div>
        )}

        {/* Barre de recherche */}
        <div className="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="relative">
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'new' ? (
            // Onglet nouveaux blocs
            Object.keys(groupedBlocks).length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Aucun bloc trouvé
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Essayez avec d'autres mots-clés
                </p>
              </div>
            ) : (
              <>
                {Object.entries(groupedBlocks).map(([category, blocks]) => (
                  <div key={category} className="mb-6">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-md inline-block">
                      {category}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {(blocks as BlockType[]).map((bt) => (
                        <DraggableBlockItem
                          key={bt.name}
                          blockType={bt}
                          onSelect={() => {
                            if (onSelectNew) onSelectNew(bt)
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )
          ) : (
            // Onglet blocs existants
            existingBlocks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📦</div>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Aucun bloc existant disponible
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Créez d'abord des blocs dans l'éditeur
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {existingBlocks.map((existingBlock) => {
                  const blockType = blockTypesForExisting.find(bt => bt.name === existingBlock.type)
                  return (
                    <button
                      key={existingBlock.id}
                      onClick={() => {
                        if (onSelectExisting) {
                          onSelectExisting(existingBlock)
                          onClose() // Fermer le modal après sélection
                        }
                      }}
                      className="w-full p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-600 hover:shadow-lg transition-all text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center text-2xl">
                          {blockType?.icon || '📦'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {blockType?.label || existingBlock.type}
                            </span>
                            <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
                              Existant
                            </span>
                          </div>
                          {blockType?.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                              {blockType.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                            <span>ID: {existingBlock.id.substring(0, 8)}...</span>
                            {existingBlock.data && Object.keys(existingBlock.data).length > 0 && (
                              <span>• {Object.keys(existingBlock.data).length} propriété(s)</span>
                            )}
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

// Draggable Block Item - Bloc draggable dans la popup
function DraggableBlockItem({
  blockType,
  onSelect,
}: {
  blockType: BlockType
  onSelect: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `block-type-${blockType.name}`,
    data: {
      type: 'block-type',
      blockType,
    },
  })

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined

  const categoryColors: Record<string, string> = {
    'layout': 'from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30',
    'content': 'from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30',
    'media': 'from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30',
    'forms': 'from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30',
    'custom': 'from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30',
  }

  const categoryColor = categoryColors[blockType.category || 'custom'] || 'from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onSelect}
      className={`p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-600 hover:shadow-lg transition-all cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
      title={`${blockType.label || blockType.name} - ${blockType.description || 'Cliquez pour ajouter'}`}
    >
      <div className="text-center">
        <div className={`w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br ${categoryColor} flex items-center justify-center text-3xl shadow-sm`}>
          {blockType.icon || '📦'}
        </div>
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {blockType.label || blockType.name}
        </div>
        {blockType.description && (
          <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
            {blockType.description}
          </div>
        )}
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
            blockType.category === 'layout' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
            blockType.category === 'content' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
            blockType.category === 'media' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}>
            {blockType.category || 'custom'}
          </span>
          {(blockType as any).is_premium && (
            <span className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full font-medium">
              ⭐ Premium
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Block Renderer Component is now in BlockRenderer.tsx
