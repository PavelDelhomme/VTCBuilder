'use client'

import React, { useState, useEffect, useCallback, useRef, useMemo, startTransition } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, useDroppable, useDraggable, DragOverlay } from '@dnd-kit/core'
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
import UrlInputWithSuggestions from './UrlInputWithSuggestions'
import PageSelector from './PageSelector'
import ImageSelector from './ImageSelector'
import { useHistory } from '@/hooks/useHistory'
import { useBlockTracking } from '@/hooks/useBlockTracking'

export interface Block {
  id: string
  type: string
  data: Record<string, any>
  styles?: Record<string, any>
  children?: Block[]
  layout?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 // Nombre de colonnes sur 12 (système Bootstrap)
  container?: 'container' | 'container-fluid' | 'none'
  position?: {
    type: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
    top?: string
    right?: string
    bottom?: string
    left?: string
    align?: 'left' | 'center' | 'right' | 'stretch'
    alignTo?: string // ID du bloc de référence pour position relative
  }
  width?: string // Largeur personnalisée (px, %, etc.)
  height?: string // Hauteur personnalisée (px, %, etc.)
  minWidth?: string
  minHeight?: string
  maxWidth?: string
  maxHeight?: string
}


interface BlockEditorProps {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
  availableBlockTypes?: BlockType[]
  onBlockSelect?: (blockId: string | null) => void
  selectedBlockId?: string | null
  showBlocksPalette?: boolean // Afficher ou non la sidebar de blocs (désactivée si popup externe)
  showOnlyPalette?: boolean // Afficher uniquement la palette (pour popup)
}

export default function BlockEditor({ blocks, onChange, availableBlockTypes, onBlockSelect, selectedBlockId: externalSelectedBlockId, showBlocksPalette = true, showOnlyPalette = false }: BlockEditorProps) {
  const [blockTypes, setBlockTypes] = useState<BlockType[]>([])
  const [selectedBlock, setSelectedBlock] = useState<string | null>(externalSelectedBlockId || null)
  
  const [sidebarOpen, setSidebarOpen] = useState(true) // Ouvrir par défaut sur desktop
  const [blocksPaletteOpen, setBlocksPaletteOpen] = useState(true) // Palette de blocs ouverte par défaut
  const [propertiesTab, setPropertiesTab] = useState<'content' | 'layout' | 'style'>('layout') // Layout en premier
  const [categoryFilter, setCategoryFilter] = useState<string>('all') // Filtre par catégorie
  const [searchQuery, setSearchQuery] = useState<string>('') // Recherche par nom
  
  // Synchroniser avec la sélection externe (optimisé pour éviter les conflits)
  useEffect(() => {
    if (externalSelectedBlockId !== undefined && externalSelectedBlockId !== selectedBlock) {
      console.log('[BlockEditor] Synchronisation externe:', externalSelectedBlockId)
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
  
  // Historique avec undo/redo
  const history = useHistory<Block[]>(blocks, 50)
  const isHistoryUpdate = useRef(false)
  const isInternalUpdate = useRef(false) // Pour éviter les boucles infinies
  const onChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastBlocksRef = useRef<string>('') // Pour comparer les blocs (JSON string)
  
  // Tracking des blocs
  const { trackBlockAction } = useBlockTracking()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Synchroniser l'historique avec les blocks externes
  useEffect(() => {
    if (!isHistoryUpdate.current && !isInternalUpdate.current) {
      const blocksJson = JSON.stringify(blocks)
      if (blocksJson !== lastBlocksRef.current) {
        history.reset(blocks)
        lastBlocksRef.current = blocksJson
      }
    }
    isHistoryUpdate.current = false
    isInternalUpdate.current = false
  }, [blocks, history])

  // Synchroniser onChange avec l'historique (avec debounce et protection contre les boucles)
  useEffect(() => {
    const historyJson = JSON.stringify(history.state)
    const blocksJson = JSON.stringify(blocks)
    
    // Ne pas appeler onChange si c'est une mise à jour externe ou si les valeurs sont identiques
    if (historyJson !== blocksJson && historyJson !== lastBlocksRef.current) {
      isInternalUpdate.current = true
      lastBlocksRef.current = historyJson
      
      // Debounce pour éviter trop d'appels (surtout pour les changements de couleur)
      if (onChangeTimeoutRef.current) {
        clearTimeout(onChangeTimeoutRef.current)
      }
      
      onChangeTimeoutRef.current = setTimeout(() => {
        onChange(history.state)
        isInternalUpdate.current = false
      }, 50) // 50ms de debounce pour les mises à jour de style
    }
    
    return () => {
      if (onChangeTimeoutRef.current) {
        clearTimeout(onChangeTimeoutRef.current)
      }
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

  // Les blocs par défaut sont maintenant créés automatiquement par l'API
  // Plus besoin de getDefaultBlockTypes() - l'API crée les blocs si aucun n'existe

  const loadBlockTypes = async () => {
    try {
      // Si des blocs sont fournis via props, les utiliser directement
      if (availableBlockTypes && availableBlockTypes.length > 0) {
        setBlockTypes(availableBlockTypes)
      } else {
        // Sinon, charger depuis l'API (qui créera automatiquement les blocs par défaut si nécessaire)
        try {
          const apiTypes = await blocksService.getBlockTypes()
          if (apiTypes && apiTypes.length > 0) {
            setBlockTypes(apiTypes)
          } else {
            // Si l'API retourne vide (ne devrait pas arriver car l'API crée les blocs automatiquement)
            console.warn('Aucun bloc disponible depuis l\'API')
            setBlockTypes([])
          }
        } catch (apiError: any) {
          // Ne pas logger les erreurs 401 (non authentifié) - c'est normal si l'utilisateur n'est pas connecté
          const isExpectedError = apiError.response?.status === 401 ||
                                 apiError.code === 'ERR_NETWORK' || 
                                 apiError.code === 'ERR_BLOCKED_BY_CLIENT'
          if (!isExpectedError) {
            console.error('Erreur chargement blocs API:', apiError)
          }
          setBlockTypes([])
        }
      }
    } catch (error) {
      console.error('Error loading block types:', error)
      setBlockTypes([])
    }
  }

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

  // Vérifier si un type de bloc est un conteneur (défini avant handleDragEnd car utilisé dedans)
  const isContainerType = useCallback((blockTypeName: string): boolean => {
    const containerTypes = ['container', 'grid-container', 'flex-container', 'flexbox', 'grid', 'stack', 'inline', 'group', 'wrapper', 'section', 'rows']
    return containerTypes.includes(blockTypeName)
  }, [])

  // Vérifier si un conteneur existe dans les blocs (défini avant handleDragEnd car utilisé dedans)
  const hasContainer = useCallback((blocks: Block[]): boolean => {
    const containerTypes = ['container', 'grid-container', 'flex-container', 'flexbox', 'grid', 'stack', 'inline', 'group', 'wrapper', 'section', 'rows']
    for (const block of blocks) {
      if (containerTypes.includes(block.type)) {
        return true
      }
      // Vérifier récursivement dans les enfants
      if (block.children && block.children.length > 0) {
        if (hasContainer(block.children)) {
          return true
        }
      }
    }
    return false
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    // Vérifier si on drop sur une zone de conteneur (peut être un ID de drop zone)
    const overId = String(over.id || '')
    const isContainerDropZone = overId.startsWith('container-drop-')
    const containerId = isContainerDropZone ? overId.replace('container-drop-', '') : (over.data.current?.containerId as string || '')

    // Gérer le drop d'un type de bloc dans un conteneur (nouveau bloc depuis la palette)
    if (active.data.current?.type === 'block-type' && (over.data.current?.type === 'container' || isContainerDropZone)) {
      const blockType = active.data.current.blockType as BlockType
      
      const newChild: Block = {
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: blockType.name,
        data: {},
        layout: 12,
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
      trackBlockAction(blockType.name, 'add')
      return
    }

    // Gérer le déplacement d'un bloc existant dans un conteneur
    if (active.data.current?.type === 'block' && (over.data.current?.type === 'container' || isContainerDropZone)) {
      const blockId = active.id as string
      
      // Ne pas permettre de déplacer un bloc dans lui-même
      if (blockId === containerId) return
      
      // Trouver le bloc à déplacer
      const blockToMove = findBlockInTree(history.state, blockId)
      if (!blockToMove) return
      
      // Vérifier que le conteneur cible n'est pas un enfant du bloc à déplacer (éviter les boucles)
      const isDescendant = (blocks: Block[], targetId: string): boolean => {
        for (const block of blocks) {
          if (block.id === targetId) return true
          if (block.children && block.children.length > 0) {
            if (isDescendant(block.children, targetId)) return true
          }
        }
        return false
      }
      
      if (blockToMove.block.children && isDescendant(blockToMove.block.children, containerId)) {
        // Ne pas permettre de déplacer un conteneur dans un de ses enfants
        return
      }
      
      // Retirer le bloc de sa position actuelle
      let newBlocks = removeBlockFromTree(history.state, blockId)
      
      // Ajouter le bloc dans le conteneur cible
      newBlocks = addBlockToContainer(newBlocks, containerId, blockToMove.block)
      
      history.set(newBlocks, true)
      trackBlockAction(blockToMove.block.type, 'move')
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
        }
      } else {
        // Blocs à des niveaux différents, essayer un réordonnancement simple au niveau racine
        const oldIndex = history.state.findIndex((b: Block) => b.id === active.id)
        const newIndex = history.state.findIndex((b: Block) => b.id === over.id)

        if (oldIndex !== -1 && newIndex !== -1) {
          const newBlocks = arrayMove(history.state, oldIndex, newIndex)
          history.set(newBlocks, true)
        }
      }
    }
  }, [history, trackBlockAction, findBlockInTree, removeBlockFromTree, addBlockToContainer, isContainerType])

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
      layout: 12, // Par défaut, pleine largeur (12/12)
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

  const removeBlock = useCallback((blockId: string) => {
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

  // Debounce pour les mises à jour de style (éviter trop d'entrées dans l'historique)
  const updateBlockTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({})
  
  const updateBlock = useCallback((blockId: string, updates: Partial<Block>, immediate: boolean = false) => {
    const block = history.state.find((b: Block) => b.id === blockId)
    const newBlocks = history.state.map((b: Block) =>
      b.id === blockId ? { ...b, ...updates } : b
    )
    
    // Pour les changements de style (padding, margin, couleur, etc.), utiliser un debounce
    // Pour les changements de contenu (texte, enfants, etc.), mettre à jour immédiatement
    const isStyleUpdate = (updates.styles !== undefined || 
                         updates.layout !== undefined || 
                         updates.container !== undefined ||
                         updates.position !== undefined) &&
                         updates.children === undefined // Les enfants doivent être mis à jour immédiatement
    
    const updateHistory = () => {
      // Si on a fait undo avant (futur non vide), créer une nouvelle branche
      // Le hook useHistory gère déjà cela en effaçant le futur et créant une nouvelle branche
      history.set(newBlocks, true)
      
      // Tracker la modification du bloc
      if (block) {
        trackBlockAction(block.type, 'update')
      }
    }
    
    if (immediate || !isStyleUpdate) {
      // Mise à jour immédiate pour le contenu
      if (updateBlockTimeoutRef.current[blockId]) {
        clearTimeout(updateBlockTimeoutRef.current[blockId])
        delete updateBlockTimeoutRef.current[blockId]
      }
      updateHistory()
    } else {
      // Debounce pour les styles (300ms)
      if (updateBlockTimeoutRef.current[blockId]) {
        clearTimeout(updateBlockTimeoutRef.current[blockId])
      }
      updateBlockTimeoutRef.current[blockId] = setTimeout(() => {
        updateHistory()
        delete updateBlockTimeoutRef.current[blockId]
      }, 300)
    }
  }, [history, trackBlockAction])

  // Gérer l'ouverture des paramètres - afficher dans la sidebar (OPTIMISÉ)
  const handleSelectBlock = useCallback((blockId: string) => {
    // Log pour diagnostic
    console.log('[BlockEditor] handleSelectBlock appelé pour:', blockId, 'à', Date.now())
    
    // Mise à jour immédiate de l'état (synchrone pour la réactivité)
    setSelectedBlock(blockId)
    setSidebarOpen(true)
    
    // Les notifications au parent sont faites dans une transition (non bloquante)
    // via le useEffect ci-dessus
    
    // Log après mise à jour
    console.log('[BlockEditor] État mis à jour:', blockId)
  }, [])

  // Gérer la fermeture des paramètres - revenir aux blocs disponibles
  const handleCloseProperties = useCallback(() => {
    setSelectedBlock(null)
    setPropertiesTab('content') // Réinitialiser l'onglet
  }, [])

  // Mémoriser le bloc sélectionné pour éviter les recherches répétées (OPTIMISATION PERFORMANCE)
  // Utiliser une Map pour des recherches O(1) au lieu de O(n)
  const blocksMap = useMemo(() => {
    const map = new Map<string, Block>()
    history.state.forEach((block: Block) => {
      map.set(block.id, block)
    })
    return map
  }, [history.state])
  
  const blockTypesMap = useMemo(() => {
    const map = new Map<string, BlockType>()
    blockTypes.forEach((bt: BlockType) => {
      map.set(bt.name, bt)
    })
    return map
  }, [blockTypes])
  
  const selectedBlockData = useMemo(() => {
    if (!selectedBlock) return null
    const block = blocksMap.get(selectedBlock)
    if (!block) return null
    const blockType = blockTypesMap.get(block.type)
    return { block, blockType }
  }, [selectedBlock, blocksMap, blockTypesMap])

  return (
    <div className="flex h-full w-full flex-col relative min-h-0 overflow-hidden">
      {/* Toolbar - Enhanced with History Navigation */}
      <div className="flex items-center justify-between px-4 lg:px-6 xl:px-8 py-2.5 lg:py-3 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3 lg:gap-4 flex-wrap">
          {/* Mobile: Menu button */}
          <button
            onClick={() => {
              setSidebarOpen(!sidebarOpen)
              // Fermer les paramètres si on ferme la sidebar
              if (!sidebarOpen) {
                setSelectedBlock(null)
              }
            }}
            className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* History Navigation Buttons - Clear and Prominent */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm p-1">
            <button
              onClick={handleUndo}
              disabled={!history.canUndo}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium ${
                history.canUndo
                  ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                  : 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
              }`}
              title="Annuler (Ctrl+Z)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span className="hidden sm:inline">Annuler</span>
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            <button
              onClick={handleRedo}
              disabled={!history.canRedo}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium ${
                history.canRedo
                  ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                  : 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
              }`}
              title="Refaire (Ctrl+Shift+Z)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
              <span className="hidden sm:inline">Refaire</span>
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
            </svg>
            <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {history.state.length} bloc{history.state.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Export/Import buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const dataStr = JSON.stringify(history.state, null, 2)
                const dataBlob = new Blob([dataStr], { type: 'application/json' })
                const url = URL.createObjectURL(dataBlob)
                const link = document.createElement('a')
                link.href = url
                link.download = `blocks-${new Date().toISOString().split('T')[0]}.json`
                link.click()
                URL.revokeObjectURL(url)
              }}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Exporter les blocs"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <label className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer" title="Importer des blocs">
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      try {
                        const imported = JSON.parse(event.target?.result as string)
                        if (Array.isArray(imported)) {
                          const newBlocks = imported.map((b: Block) => ({
                            ...b,
                            id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                          }))
                          history.set([...history.state, ...newBlocks])
                          onChange([...history.state, ...newBlocks])
                        }
                      } catch (error) {
                        alert('Erreur lors de l\'importation du fichier')
                      }
                    }
                    reader.readAsText(file)
                  }
                }}
              />
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </label>
          </div>
        </div>
      </div>

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
          <div className={`${sidebarOpen ? 'fixed left-0 top-0 h-screen z-50' : 'hidden'} lg:static lg:block w-64 lg:w-72 xl:w-80 2xl:w-96 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out shadow-lg lg:shadow-none flex-shrink-0 flex flex-col lg:h-full relative overflow-hidden`}>
            {/* Afficher le panneau de paramètres si un bloc est sélectionné, sinon la palette de blocs */}
            {selectedBlock ? (
            /* Properties Panel dans la sidebar */
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-2 sm:p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Paramètres du bloc</h3>
                <div className="flex items-center gap-2">
                  {/* Bouton Supprimer */}
                  <button
                    onClick={() => {
                      if (selectedBlock) {
                        removeBlock(selectedBlock)
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
              <div className="flex-1 overflow-y-auto p-2 sm:p-3 min-h-0 pb-4" style={{ maxHeight: '100%', WebkitOverflowScrolling: 'touch', overflowX: 'hidden' }}>
                <div className="min-h-full pb-4">
                {propertiesTab === 'layout' ? (
                  selectedBlockData ? (
                    <BlockLayoutPanel
                      block={selectedBlockData.block}
                      onUpdate={(updates) => updateBlock(selectedBlock, updates)}
                      allBlocks={history.state}
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
                              const newBlock: Block = {
                                ...block,
                                id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                              }
                              const currentIndex = history.state.findIndex((b: Block) => b.id === block.id)
                              const newBlocks = [...history.state]
                              newBlocks.splice(currentIndex + 1, 0, newBlock)
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
                              removeBlock(selectedBlock)
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

              {/* Bouton retour aux blocs */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <button
                  onClick={() => {
                    setSelectedBlock(null)
                    setSidebarOpen(true)
                  }}
                  className="w-full px-4 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Retour aux blocs disponibles
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
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Blocs disponibles</h3>
                  
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
                    const filteredBlockTypes = blockTypes.filter((bt: BlockType) => {
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
                                    <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                                      {blockType.label}
                                    </div>
                                    {blockType.description && (
                                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                        {blockType.description}
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
                                          <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full flex-shrink-0">
                                            ⭐ Premium
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
                                      {!canUse && isPremium && (
                                        <div className="text-xs text-orange-600 dark:text-orange-400 mt-1 hidden sm:block">
                                          Nécessite un abonnement premium
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

        {/* Message si aucun bloc disponible */}
        {blockTypes.length === 0 && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Chargement des blocs...</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Veuillez patienter pendant le chargement des blocs disponibles
            </p>
          </div>
        )}
              </div>
            </>
          )}
        </div>
      )}
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex min-w-0 w-full h-full border-r border-gray-200 dark:border-gray-700">
        {/* Editor Panel */}
        <div className={`flex-1 flex flex-col min-w-0 h-full transition-all duration-300 w-full ${!blocksPaletteOpen ? 'ml-0' : ''}`}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={history.state.map((b: Block) => b.id)} strategy={verticalListSortingStrategy}>
              <div className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 2xl:p-12 overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 max-w-full min-h-0">
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
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-12 gap-4 lg:gap-6 auto-rows-min">
                      {history.state
                        .filter((b: Block) => !b.position || b.position.type === 'static')
                        .map((block: Block) => {
                          // Calculer le span de colonnes basé sur le layout (système 12 colonnes)
                          const layoutCols = block.layout || 12
                          const colSpan = layoutCols === 12 ? 'col-span-full' : `col-span-${layoutCols}`
                        
                        return (
                          <div key={block.id} className={colSpan}>
                  <SortableBlock
                    block={block}
                    blockTypes={blockTypes}
                    isSelected={selectedBlock === block.id}
                              onSelect={() => handleSelectBlock(block.id)}
                    onUpdate={(updates) => updateBlock(block.id, updates)}
                    onDelete={() => removeBlock(block.id)}
                              onDuplicate={() => {
                                const newBlock: Block = {
                                  ...block,
                                  id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                }
                                const currentIndex = history.state.findIndex((b: Block) => b.id === block.id)
                                const newBlocks = [...history.state]
                                newBlocks.splice(currentIndex + 1, 0, newBlock)
                                history.set(newBlocks)
                                onChange(newBlocks)
                                trackBlockAction(block.type, 'add')
                              }}
                            />
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
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
  onUpdate,
  onDelete,
  onDuplicate,
}: {
  block: Block
  blockTypes: BlockType[]
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<Block>) => void
  onDelete: () => void
  onDuplicate: () => void
}) {
  // État pour le menu contextuel
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [showMenu, setShowMenu] = useState(false)
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
    opacity: isDragging ? 0.5 : 1,
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
      const clampedIndex = Math.max(0, Math.min(availableLayouts.length - 1, newLayoutIndex))
      const newLayout = availableLayouts[clampedIndex]
      
      if (newLayout !== startLayout) {
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
    
    // Ouvrir les paramètres directement
    onSelect()
  }

  // Gérer le clic droit pour afficher le menu contextuel (optionnel)
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    // Fermer le menu précédent s'il existe
    if (showMenu) {
      closeContextMenu()
      return
    }
    // Ouvrir le menu contextuel
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
        style={style}
        className={`relative w-full mb-4 bg-white dark:bg-gray-800 rounded-xl border-2 ${isSelected ? 'border-blue-500 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800' : 'border-gray-200 dark:border-gray-700'} shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden min-h-[80px] ${isResizing ? 'select-none' : ''} group cursor-pointer`}
        onClick={handleBlockClick}
        onContextMenu={handleContextMenu}
        onMouseDown={(e) => {
          // Empêcher le menu contextuel de se rouvrir après un clic gauche
          if (e.button === 0 && showMenu) {
            // Clic gauche : fermer le menu immédiatement
            closeContextMenu()
            e.stopPropagation()
          }
        }}
      >
      {/* Resize Handles - Only visible when selected */}
      {isSelected && (
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
        className={`flex items-center justify-between ${getPadding()} transition-colors cursor-grab active:cursor-grabbing ${
          isSelected 
            ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-b border-blue-200 dark:border-blue-700' 
            : 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-800'
        }`}
        {...attributes}
        {...listeners}
        onClick={(e) => {
          // Ne pas ouvrir les paramètres si on drag
          if (!isDragging) {
            e.stopPropagation()
            handleBlockClick(e as any)
          }
        }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <div className={`flex-shrink-0 ${getIconContainerSize()} rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-700`}>
            <span className={getIconSize()}>{blockType?.icon || '📦'}</span>
        </div>
          <div className="min-w-0 flex-1">
            <span className={`${getTextSize()} font-semibold text-gray-900 dark:text-gray-100 truncate block`}>{blockType?.label || block.type}</span>
            {blockType?.description && layoutCols > 4 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate block hidden sm:block">{blockType.description}</span>
            )}
          </div>
        </div>
        {/* Indicateur clic pour paramètres - visible au survol */}
        <div className="flex items-center gap-1 flex-shrink-0 z-10 relative opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="text-xs text-gray-400 dark:text-gray-500 px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700" title="Clic droit pour les options du bloc">
            <span className="text-blue-600 dark:text-blue-400">⚙️</span> Clic droit options
          </div>
        </div>
        {/* Aide contextuelle pour drag and drop */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="text-xs text-gray-400 dark:text-gray-500 px-2 py-1 rounded bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700" title="Glissez-déposez ce bloc pour le déplacer ou le mettre dans un conteneur">
            <span className="text-gray-600 dark:text-gray-400">🖱️</span> Glisser-déposer
          </div>
        </div>
      </div>

      {/* Block Content - Simple and Clean */}
      <div className={`${isSmall ? 'p-2 sm:p-3' : 'p-4 sm:p-6'} bg-white dark:bg-gray-800 min-h-[120px]`}>
        {/* Conteneur avec enfants */}
        {(block.type === 'container' || block.type === 'flex-container' || block.type === 'grid-container' || 
          block.type === 'flexbox' || block.type === 'grid' || block.type === 'stack' || 
          block.type === 'inline' || block.type === 'group' || block.type === 'wrapper' || block.type === 'section' || block.type === 'rows') ? (
          <ContainerChildrenRenderer
            block={block}
            blockTypes={blockTypes}
            allBlocks={history.state} // Passer tous les blocs pour permettre de choisir un bloc existant
            onAddChild={(childBlock) => {
              const newChildren = [...(block.children || []), childBlock]
              console.log('Ajout enfant au conteneur:', block.id, childBlock, newChildren)
              onUpdate({ children: newChildren })
            }}
            onUpdateChild={(childId, updates) => {
              const newChildren = (block.children || []).map((child) =>
                child.id === childId ? { ...child, ...updates } : child
              )
              onUpdate({ children: newChildren })
            }}
            onDeleteChild={(childId) => {
              const newChildren = (block.children || []).filter((child) => child.id !== childId)
              onUpdate({ children: newChildren })
            }}
            onSelectChild={(childId) => {
              // TODO: Gérer la sélection des enfants
            }}
          />
        ) : (
          <BlockRenderer block={block} blockType={blockType} onUpdate={onUpdate} />
        )}
      </div>

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
              onDelete()
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
    </div>
    </>
  )
})

// Container Children Renderer - Affiche et gère les enfants d'un conteneur
function ContainerChildrenRenderer({
  block,
  blockTypes,
  onAddChild,
  onUpdateChild,
  onDeleteChild,
  onSelectChild,
  allBlocks, // Tous les blocs de l'éditeur pour permettre de choisir un bloc existant
}: {
  block: Block
  blockTypes: BlockType[]
  onAddChild: (child: Block) => void
  onUpdateChild: (childId: string, updates: Partial<Block>) => void
  onDeleteChild: (childId: string) => void
  onSelectChild: (childId: string) => void
  allBlocks?: Block[] // Tous les blocs disponibles dans l'éditeur
}) {
  const children = block.children || []
  const [showAddMenu, setShowAddMenu] = useState(false)

  const handleAddBlock = useCallback((blockType: BlockType) => {
    const newChild: Block = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: blockType.name,
      data: {},
      layout: block.type === 'grid-container' ? undefined : 12,
    }
    // Ajouter le bloc immédiatement
    onAddChild(newChild)
    // Fermer la popup après l'ajout
    setShowAddMenu(false)
  }, [block.type, onAddChild])

  const handleAddExistingBlock = useCallback((existingBlock: Block) => {
    // Créer une copie du bloc existant avec un nouvel ID
    const copiedBlock: Block = {
      ...existingBlock,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
    onAddChild(copiedBlock)
    setShowAddMenu(false)
  }, [onAddChild])

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
        className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/50 min-h-[120px]"
      >
        <div style={containerStyle} className="w-full h-full">
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
                  <div
                    key={child.id}
                    className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer"
                    onClick={() => onSelectChild(child.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{childBlockType?.icon || '📦'}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {childBlockType?.label || child.type}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteChild(child.id)
                        }}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {childBlockType && (
                      <BlockRenderer 
                        block={{ ...child, data: child.data || {} }} 
                        blockType={childBlockType} 
                        onUpdate={(updates) => onUpdateChild(child.id, updates)} 
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </ContainerDropZone>

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
      {showAddMenu && (
        <BlockPickerModal
          blockTypes={blockTypes.filter((bt) => bt.name !== 'container' && bt.name !== 'flex-container' && bt.name !== 'grid-container')}
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
  children,
  className = '',
}: {
  containerId: string
  onDrop: (blockType: BlockType) => void
  children?: React.ReactNode
  className?: string
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `container-drop-${containerId}`,
    data: {
      type: 'container',
      containerId,
    },
    // Accepter à la fois les block-type (nouveaux blocs) et les block (blocs existants)
    accepts: ['block-type', 'block'],
  })

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 border-solid' : ''} transition-all`}
      title={isOver ? 'Relâchez pour déposer le bloc ici' : 'Glissez un bloc ici pour l\'ajouter au conteneur'}
    >
      {children}
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 dark:bg-blue-900/20 rounded-lg pointer-events-none">
          <div className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
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
          <div className="flex border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6">
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'new'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              ✨ Nouveaux blocs ({blockTypes.length})
            </button>
            <button
              onClick={() => setActiveTab('existing')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'existing'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              📋 Blocs existants ({existingBlocks.length})
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
                      {blocks.map((bt) => (
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
            blockType.category === 'forms' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}>
            {blockType.category || 'custom'}
          </span>
          {blockType.is_premium && (
            <span className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full font-medium">
              ⭐ Premium
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Block Renderer Component
function BlockRenderer({
  block,
  blockType,
  onUpdate,
}: {
  block: Block
  blockType?: BlockType
  onUpdate: (updates: Partial<Block>) => void
}) {
  // S'assurer que block.data existe pour éviter les erreurs
  const safeBlock = { ...block, data: block.data || {} }
  
  // Render based on block type
  switch (safeBlock.type) {
    case 'container':
      return (
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              📦 Conteneur: Ajoutez des blocs enfants pour structurer votre contenu.
            </p>
          </div>
        </div>
      )
    
    case 'flex-container':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Direction
            </label>
            <select
              value={safeBlock.data?.direction || 'row'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, direction: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="row">Horizontal (row)</option>
              <option value="column">Vertical (column)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Wrap
            </label>
            <select
              value={safeBlock.data?.wrap || 'nowrap'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, wrap: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="nowrap">Pas de retour à la ligne</option>
              <option value="wrap">Retour à la ligne</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Espacement (gap)
            </label>
            <input
              type="text"
              value={safeBlock.data?.gap || '1rem'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, gap: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="1rem"
            />
          </div>
        </div>
      )
    
    case 'grid-container':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Colonnes (grid-template-columns)
            </label>
            <input
              type="text"
              value={safeBlock.data?.columns || 'repeat(3, 1fr)'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, columns: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="repeat(3, 1fr)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Exemples: repeat(3, 1fr), 1fr 2fr 1fr, auto auto
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lignes (grid-template-rows)
            </label>
            <input
              type="text"
              value={safeBlock.data?.rows || 'auto'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, rows: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="auto ou repeat(2, 1fr)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Exemples: auto, repeat(2, 1fr), 100px 200px, minmax(100px, auto)
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Espacement (gap)
            </label>
            <input
              type="text"
              value={safeBlock.data?.gap || '1rem'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, gap: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="1rem"
            />
          </div>
        </div>
      )
    
    case 'text':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contenu (éditeur simple)
            </label>
        <textarea
          value={safeBlock.data.content || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdate({ data: { ...safeBlock.data, content: e.target.value } })}
              className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Entrez votre texte..."
          rows={6}
        />
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              💡 Astuce: Utilisez le bloc "Paragraphe" pour un texte long formaté ou le bloc "Ligne" pour un texte court sur une ligne.
            </p>
          </div>
        </div>
      )
    case 'heading':
      const headingLevel = safeBlock.data.level || 'h2'
      const HeadingTag = headingLevel as keyof JSX.IntrinsicElements
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte du titre
            </label>
          <input
            type="text"
            value={safeBlock.data.text || ''}
            onChange={(e) => onUpdate({ data: { ...block.data, text: e.target.value } })}
              className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-lg sm:text-2xl font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Titre..."
          />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Niveau
              </label>
          <select
            value={headingLevel}
            onChange={(e) => onUpdate({ data: { ...block.data, level: e.target.value } })}
                className="w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="h1">H1 (Très grand)</option>
                <option value="h2">H2 (Grand)</option>
                <option value="h3">H3 (Moyen)</option>
                <option value="h4">H4 (Petit)</option>
          </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Alignement
              </label>
              <select
                value={safeBlock.data.align || 'left'}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, align: e.target.value } })}
                className="w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="left">Gauche</option>
                <option value="center">Centre</option>
                <option value="right">Droite</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Couleur du titre
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={safeBlock.data.color || '#000000'}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, color: e.target.value } })}
                className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={safeBlock.data.color || '#000000'}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, color: e.target.value } })}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      )
    case 'image':
      return (
        <div className="space-y-2">
          <input
            type="url"
            value={safeBlock.data.src || ''}
            onChange={(e) => onUpdate({ data: { ...block.data, src: e.target.value } })}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="URL de l'image..."
          />
          <input
            type="text"
            value={safeBlock.data.alt || ''}
            onChange={(e) => onUpdate({ data: { ...block.data, alt: e.target.value } })}
            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="Texte alternatif (alt)..."
          />
          {!safeBlock.data.src && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">Voir la prévisualisation à droite →</p>
          )}
        </div>
      )
    case 'button':
      return (
        <div className="space-y-2">
          <input
            type="text"
            value={safeBlock.data.text || ''}
            onChange={(e) => onUpdate({ data: { ...block.data, text: e.target.value } })}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Texte du bouton..."
          />
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Navigation vers une page
            </label>
            <PageSelector
              value={safeBlock.data.url || ''}
              onChange={(url) => onUpdate({ data: { ...block.data, url } })}
              placeholder="Sélectionner une page..."
              className="text-sm"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              💡 Sélectionnez une page du tenant ou une page publique pour créer un lien de navigation
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Style
              </label>
          <select
            value={safeBlock.data.style || 'primary'}
            onChange={(e) => onUpdate({ data: { ...block.data, style: e.target.value } })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="primary">Primaire</option>
            <option value="secondary">Secondaire</option>
            <option value="outline">Outline</option>
                <option value="ghost">Ghost</option>
                <option value="link">Lien</option>
          </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Taille
              </label>
              <select
                value={safeBlock.data.size || 'md'}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, size: e.target.value } })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="xs">Très petit</option>
                <option value="sm">Petit</option>
                <option value="md">Moyen</option>
                <option value="lg">Grand</option>
                <option value="xl">Très grand</option>
              </select>
          </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Couleur de fond
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={safeBlock.data.bg_color || '#3b82f6'}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, bg_color: e.target.value } })}
                className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={safeBlock.data.bg_color || '#3b82f6'}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, bg_color: e.target.value } })}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="#3b82f6"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Couleur du texte
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={safeBlock.data.text_color || '#ffffff'}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, text_color: e.target.value } })}
                className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={safeBlock.data.text_color || '#ffffff'}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, text_color: e.target.value } })}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="#ffffff"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`button-full-width-${block.id}`}
              checked={safeBlock.data.full_width || false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, full_width: e.target.checked } })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={`button-full-width-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
              Largeur complète
            </label>
          </div>
          {(!safeBlock.data.text || !safeBlock.data.url) && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">Voir la prévisualisation à droite →</p>
          )}
        </div>
      )
    case 'video':
      return (
        <div className="space-y-2">
          <input
            type="url"
            value={safeBlock.data.url || ''}
            onChange={(e) => onUpdate({ data: { ...block.data, url: e.target.value } })}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="URL de la vidéo (YouTube, Vimeo)..."
          />
          {!safeBlock.data.url && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">Voir la prévisualisation à droite →</p>
          )}
        </div>
      )
    case 'spacer':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Direction
            </label>
            <select
              value={safeBlock.data.direction || 'vertical'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, direction: e.target.value } })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="vertical">Vertical (hauteur)</option>
              <option value="horizontal">Horizontal (largeur)</option>
            </select>
          </div>
          {safeBlock.data.direction === 'horizontal' ? (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Largeur (px)
                </label>
                <input
                  type="number"
                  value={safeBlock.data.width || 40}
                  onChange={(e) => onUpdate({ data: { ...safeBlock.data, width: parseInt(e.target.value) || 40 } })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Largeur en pixels..."
                  min={10}
                  max={200}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">Espaceur horizontal de {(safeBlock.data.width || 40)}px</p>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hauteur (px)
                </label>
          <input
            type="number"
            value={safeBlock.data.height || 40}
            onChange={(e) => onUpdate({ data: { ...block.data, height: parseInt(e.target.value) || 40 } })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Hauteur en pixels..."
            min={10}
            max={200}
          />
            </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">Espaceur vertical de {(safeBlock.data.height || 40)}px</p>
            </>
          )}
        </div>
      )
    case 'divider':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Direction
            </label>
            <select
              value={safeBlock.data.direction || 'horizontal'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, direction: e.target.value } })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="horizontal">Horizontal (ligne)</option>
              <option value="vertical">Vertical (colonne)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Style
            </label>
          <select
            value={safeBlock.data.style || 'solid'}
            onChange={(e) => onUpdate({ data: { ...block.data, style: e.target.value } })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="solid">Solide</option>
            <option value="dashed">Tirets</option>
            <option value="dotted">Pointillés</option>
              <option value="double">Double</option>
          </select>
          </div>
          {safeBlock.data.direction === 'horizontal' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Largeur
              </label>
              <select
                value={safeBlock.data.width || 'full'}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, width: e.target.value } })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="full">100%</option>
                <option value="half">50%</option>
                <option value="third">33%</option>
              </select>
            </div>
          )}
          {safeBlock.data.direction === 'vertical' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hauteur
              </label>
              <input
                type="number"
                value={safeBlock.data.height || 100}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, height: parseInt(e.target.value) || 100 } })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Hauteur en pixels..."
                min={20}
                max={500}
              />
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            Séparateur {safeBlock.data.direction === 'horizontal' ? 'horizontal' : 'vertical'} {safeBlock.data.style || 'solid'}
          </p>
        </div>
      )
    case 'alert':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type d'alerte
            </label>
            <select
              value={safeBlock.data.variant || 'info'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, variant: e.target.value } })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="info">Information (Bleu)</option>
              <option value="success">Succès (Vert)</option>
              <option value="warning">Avertissement (Jaune)</option>
              <option value="error">Erreur (Rouge)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre (optionnel)
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Titre de l'alerte..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message
            </label>
            <textarea
              value={safeBlock.data.message || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, message: e.target.value } })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Message de l'alerte..."
              rows={4}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`alert-dismissible-${block.id}`}
              checked={safeBlock.data.dismissible || false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, dismissible: e.target.checked } })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={`alert-dismissible-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
              Permettre la fermeture (bouton X)
            </label>
          </div>
          {(!safeBlock.data.message) && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">Voir la prévisualisation à droite →</p>
          )}
        </div>
      )
    case 'code':
      const commonLanguages = [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'typescript', label: 'TypeScript' },
        { value: 'python', label: 'Python' },
        { value: 'java', label: 'Java' },
        { value: 'cpp', label: 'C++' },
        { value: 'c', label: 'C' },
        { value: 'csharp', label: 'C#' },
        { value: 'php', label: 'PHP' },
        { value: 'ruby', label: 'Ruby' },
        { value: 'go', label: 'Go' },
        { value: 'rust', label: 'Rust' },
        { value: 'html', label: 'HTML' },
        { value: 'css', label: 'CSS' },
        { value: 'scss', label: 'SCSS' },
        { value: 'json', label: 'JSON' },
        { value: 'xml', label: 'XML' },
        { value: 'sql', label: 'SQL' },
        { value: 'bash', label: 'Bash' },
        { value: 'shell', label: 'Shell' },
        { value: 'yaml', label: 'YAML' },
        { value: 'markdown', label: 'Markdown' },
        { value: 'plaintext', label: 'Texte brut' },
      ]
      
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Langage de programmation
            </label>
            <select
              value={safeBlock.data.language || 'plaintext'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, language: e.target.value } })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {commonLanguages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Code source
            </label>
            <textarea
              value={safeBlock.data.code || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, code: e.target.value } })}
              className="w-full p-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
              placeholder="Entrez votre code ici..."
              rows={10}
              spellCheck={false}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`code-line-numbers-${block.id}`}
                checked={safeBlock.data.showLineNumbers || false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, showLineNumbers: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`code-line-numbers-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Afficher les numéros de ligne
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`code-copy-button-${block.id}`}
                checked={safeBlock.data.showCopyButton !== false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, showCopyButton: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`code-copy-button-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Bouton copier
              </label>
            </div>
          </div>
          {(!safeBlock.data.code) && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">Voir la prévisualisation à droite →</p>
          )}
        </div>
      )
    case 'table':
      const rows = safeBlock.data.rows || 3
      const cols = safeBlock.data.columns || 3
      const tableData = safeBlock.data.table_data || Array(rows).fill(null).map(() => Array(cols).fill(''))
      
      const updateCell = (rowIndex: number, colIndex: number, value: string) => {
        const newData = [...tableData]
        if (!newData[rowIndex]) newData[rowIndex] = []
        newData[rowIndex][colIndex] = value
        onUpdate({ data: { ...block.data, table_data: newData } })
      }
      
      const addRow = () => {
        const newData = [...tableData, Array(cols).fill('')]
        onUpdate({ data: { ...block.data, rows: rows + 1, table_data: newData } })
      }
      
      const removeRow = () => {
        if (rows > 1) {
          const newData = tableData.slice(0, -1)
          onUpdate({ data: { ...block.data, rows: rows - 1, table_data: newData } })
        }
      }
      
      const addColumn = () => {
        const newData = tableData.map((row: string[]) => [...row, ''])
        onUpdate({ data: { ...block.data, columns: cols + 1, table_data: newData } })
      }
      
      const removeColumn = () => {
        if (cols > 1) {
          const newData = tableData.map((row: string[]) => row.slice(0, -1))
          onUpdate({ data: { ...block.data, columns: cols - 1, table_data: newData } })
        }
      }
      
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Lignes</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={rows}
                  onChange={(e) => {
                    const newRows = parseInt(e.target.value) || 1
                    const newData = Array(newRows).fill(null).map((_, i) => tableData[i] || Array(cols).fill(''))
                    onUpdate({ data: { ...block.data, rows: newRows, table_data: newData } })
                  }}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  min={1}
                  max={20}
                />
                <button onClick={addRow} className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">+</button>
                <button onClick={removeRow} className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">-</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Colonnes</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={cols}
                  onChange={(e) => {
                    const newCols = parseInt(e.target.value) || 1
                    const newData = tableData.map((row: string[]) => [...row.slice(0, newCols), ...Array(Math.max(0, newCols - row.length)).fill('')])
                    onUpdate({ data: { ...block.data, columns: newCols, table_data: newData } })
                  }}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  min={1}
                  max={20}
                />
                <button onClick={addColumn} className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">+</button>
                <button onClick={removeColumn} className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">-</button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Contenu du tableau</label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 max-h-64 overflow-auto">
              <table className="w-full text-xs">
                <tbody>
                  {tableData.map((row: string[], rowIndex: number) => (
                    <tr key={rowIndex}>
                      {row.map((cell: string, colIndex: number) => (
                        <td key={colIndex} className="p-1 border border-gray-200 dark:border-gray-700">
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                            className="w-full px-1 py-0.5 text-xs border-0 focus:ring-1 focus:ring-blue-500 bg-transparent"
                            placeholder={`Cellule ${rowIndex + 1},${colIndex + 1}`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`table-header-${block.id}`}
              checked={safeBlock.data.has_header || false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, has_header: e.target.checked } })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={`table-header-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
              Première ligne en en-tête
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`table-bordered-${block.id}`}
              checked={safeBlock.data.bordered !== false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, bordered: e.target.checked } })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={`table-bordered-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
              Bordures visibles
            </label>
          </div>
        </div>
      )
    case 'rows':
      const rowCount = safeBlock.data.rows_count || 2
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de lignes
            </label>
            <input
              type="number"
              value={rowCount}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, rows_count: parseInt(e.target.value) || 2 } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              min={1}
              max={10}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            Les lignes peuvent contenir des colonnes ou d'autres blocs
          </p>
        </div>
      )
    case 'paragraph':
      return (
        <div className="space-y-2">
          <textarea
            value={safeBlock.data.content || ''}
            onChange={(e) => onUpdate({ data: { ...block.data, content: e.target.value } })}
            className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Entrez votre paragraphe..."
            rows={6}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            Paragraphe complet avec formatage
          </p>
        </div>
      )
    case 'line':
      return (
        <div className="space-y-2">
          <input
            type="text"
            value={safeBlock.data.text || ''}
            onChange={(e) => onUpdate({ data: { ...block.data, text: e.target.value } })}
            className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Texte sur une ligne..."
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            Texte sur une seule ligne
          </p>
        </div>
      )
    case 'form-newsletter':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Inscrivez-vous à notre newsletter"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={safeBlock.data.description || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, description: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              rows={2}
              placeholder="Recevez nos dernières actualités..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte du bouton
            </label>
            <input
              type="text"
              value={safeBlock.data.button_text || 'S\'inscrire'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_text: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      )
    case 'form-search':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Placeholder
            </label>
            <input
              type="text"
              value={safeBlock.data.placeholder || 'Rechercher...'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, placeholder: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte du bouton
            </label>
            <input
              type="text"
              value={safeBlock.data.button_text || 'Rechercher'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_text: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      )
    case 'form-inscription':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Créer un compte"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`form-inscription-name-${block.id}`}
                checked={safeBlock.data.show_name !== false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_name: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`form-inscription-name-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Champ Nom
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`form-inscription-email-${block.id}`}
                checked={safeBlock.data.show_email !== false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_email: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`form-inscription-email-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Champ Email
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`form-inscription-password-${block.id}`}
                checked={safeBlock.data.show_password !== false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_password: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`form-inscription-password-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Champ Mot de passe
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`form-inscription-phone-${block.id}`}
                checked={safeBlock.data.show_phone || false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_phone: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`form-inscription-phone-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Champ Téléphone
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte du bouton
            </label>
            <input
              type="text"
              value={safeBlock.data.button_text || 'S\'inscrire'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_text: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`form-inscription-captcha-${block.id}`}
              checked={safeBlock.data.enable_captcha || false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, enable_captcha: e.target.checked } })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={`form-inscription-captcha-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
              Activer le captcha
            </label>
          </div>
          {safeBlock.data.enable_captcha && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Thème du captcha
              </label>
              <select
                value={safeBlock.data.captcha_theme || 'light'}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, captcha_theme: e.target.value } })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
              </select>
            </div>
          )}
        </div>
      )
    case 'testimonials':
      const testimonials = safeBlock.data.testimonials || [{ name: '', role: '', content: '', avatar: '' }]
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre de la section
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Témoignages de nos clients"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Témoignages ({testimonials.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {testimonials.map((testimonial: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="text"
                    value={testimonial.name || ''}
                    onChange={(e) => {
                      const newTestimonials = [...testimonials]
                      newTestimonials[index] = { ...testimonial, name: e.target.value }
                      onUpdate({ data: { ...block.data, testimonials: newTestimonials } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Nom"
                  />
                  <input
                    type="text"
                    value={testimonial.role || ''}
                    onChange={(e) => {
                      const newTestimonials = [...testimonials]
                      newTestimonials[index] = { ...testimonial, role: e.target.value }
                      onUpdate({ data: { ...block.data, testimonials: newTestimonials } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Rôle/Poste"
                  />
                  <textarea
                    value={testimonial.content || ''}
                    onChange={(e) => {
                      const newTestimonials = [...testimonials]
                      newTestimonials[index] = { ...testimonial, content: e.target.value }
                      onUpdate({ data: { ...block.data, testimonials: newTestimonials } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Témoignage"
                    rows={2}
                  />
                  <input
                    type="url"
                    value={testimonial.avatar || ''}
                    onChange={(e) => {
                      const newTestimonials = [...testimonials]
                      newTestimonials[index] = { ...testimonial, avatar: e.target.value }
                      onUpdate({ data: { ...block.data, testimonials: newTestimonials } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="URL avatar (optionnel)"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, testimonials: [...testimonials, { name: '', role: '', content: '', avatar: '' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {testimonials.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, testimonials: testimonials.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )
    case 'features-grid':
      const features = safeBlock.data.features || [
        { icon: '🎨', title: 'Site Professionnel', description: 'Designs modernes et responsive. Personnalisez votre site sans coder.' },
        { icon: '📅', title: 'Réservations en Ligne', description: 'Système de réservation complet avec calendrier et notifications.' },
        { icon: '💳', title: 'Paiements Intégrés', description: 'Acceptez les paiements en ligne. Cartes bancaires, virement, tout est possible.' }
      ]
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre de la section
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Tout ce dont vous avez besoin"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de colonnes
            </label>
            <select
              value={safeBlock.data.columns || 3}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, columns: parseInt(e.target.value) } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value={1}>1 colonne</option>
              <option value={2}>2 colonnes</option>
              <option value={3}>3 colonnes</option>
              <option value={4}>4 colonnes</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fonctionnalités ({features.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {features.map((feature: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={feature.icon || ''}
                      onChange={(e) => {
                        const newFeatures = [...features]
                        newFeatures[index] = { ...feature, icon: e.target.value }
                        onUpdate({ data: { ...safeBlock.data, features: newFeatures } })
                      }}
                      className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-center"
                      placeholder="🎨"
                    />
                    <input
                      type="text"
                      value={feature.title || ''}
                      onChange={(e) => {
                        const newFeatures = [...features]
                        newFeatures[index] = { ...feature, title: e.target.value }
                        onUpdate({ data: { ...safeBlock.data, features: newFeatures } })
                      }}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      placeholder="Titre de la fonctionnalité"
                    />
                    <button
                      onClick={() => {
                        const newFeatures = features.filter((_: any, i: number) => i !== index)
                        onUpdate({ data: { ...safeBlock.data, features: newFeatures } })
                      }}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center gap-1"
                      title="Supprimer cette fonctionnalité"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Supprimer
                    </button>
                  </div>
                  <textarea
                    value={feature.description || ''}
                    onChange={(e) => {
                      const newFeatures = [...features]
                      newFeatures[index] = { ...feature, description: e.target.value }
                      onUpdate({ data: { ...safeBlock.data, features: newFeatures } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Description de la fonctionnalité"
                    rows={2}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => onUpdate({ data: { ...safeBlock.data, features: [...features, { icon: '✨', title: '', description: '' }] } })}
              className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              + Ajouter une fonctionnalité
            </button>
          </div>
        </div>
      )
    
    case 'pricing':
      const plans = safeBlock.data.plans || [{ 
        name: '', 
        description: '',
        price_monthly: '', 
        price_yearly: '',
        period: 'monthly',
        badge: '',
        is_featured: false,
        features: [], 
        button_text: '', 
        button_url: '',
        button_style: 'primary'
      }]
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Source des plans
            </label>
            <select
              value={safeBlock.data.source || 'manual'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, source: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="manual">Manuel (saisie)</option>
              <option value="dynamic">API (chargement automatique)</option>
              <option value="api">API (chargement automatique)</option>
            </select>
          </div>
          {safeBlock.data.source === 'dynamic' || safeBlock.data.source === 'api' ? (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Endpoint API
              </label>
              <input
                type="text"
                value={safeBlock.data.api_endpoint || '/api/billing/pricing-plans/'}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, api_endpoint: e.target.value } })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="/api/billing/pricing-plans/"
              />
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                Les plans seront chargés automatiquement depuis l'API
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Titre de la section
                </label>
                <input
                  type="text"
                  value={safeBlock.data.title || ''}
                  onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Tarifs Transparents"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plans tarifaires ({plans.length})
                </label>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {plans.map((plan: any, planIndex: number) => (
                    <div key={planIndex} className="p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Plan {planIndex + 1}
                        </span>
                        <button
                          onClick={() => {
                            const newPlans = plans.filter((_: any, i: number) => i !== planIndex)
                            onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                          }}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center gap-1"
                          title="Supprimer ce plan"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Supprimer
                        </button>
                      </div>
                      
                      {/* Nom du plan */}
                      <div className="mb-2">
                        <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Nom du plan
                        </label>
                        <input
                          type="text"
                          value={plan.name || ''}
                          onChange={(e) => {
                            const newPlans = [...plans]
                            newPlans[planIndex] = { ...plan, name: e.target.value }
                            onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                          }}
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                          placeholder="Starter, Pro, Enterprise..."
                        />
                      </div>

                      {/* Description */}
                      <div className="mb-2">
                        <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={plan.description || ''}
                          onChange={(e) => {
                            const newPlans = [...plans]
                            newPlans[planIndex] = { ...plan, description: e.target.value }
                            onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                          }}
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                          placeholder="Description courte du plan"
                        />
                      </div>

                      {/* Prix */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Prix mensuel (€)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={plan.price_monthly || ''}
                            onChange={(e) => {
                              const newPlans = [...plans]
                              newPlans[planIndex] = { ...plan, price_monthly: e.target.value }
                              onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                            placeholder="29.99"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Prix annuel (€)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={plan.price_yearly || ''}
                            onChange={(e) => {
                              const newPlans = [...plans]
                              newPlans[planIndex] = { ...plan, price_yearly: e.target.value }
                              onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                            placeholder="299.99"
                          />
                        </div>
                      </div>

                      {/* Badge et Featured */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Badge (optionnel)
                          </label>
                          <input
                            type="text"
                            value={plan.badge || ''}
                            onChange={(e) => {
                              const newPlans = [...plans]
                              newPlans[planIndex] = { ...plan, badge: e.target.value }
                              onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                            placeholder="POPULAIRE, RECOMMANDÉ..."
                          />
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-1 text-[10px] text-gray-600 dark:text-gray-400">
                            <input
                              type="checkbox"
                              checked={plan.is_featured || false}
                              onChange={(e) => {
                                const newPlans = [...plans]
                                newPlans[planIndex] = { ...plan, is_featured: e.target.checked }
                                onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                              }}
                              className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            Plan mis en avant
                          </label>
                        </div>
                      </div>

                      {/* Fonctionnalités */}
                      <div className="mb-2">
                        <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Fonctionnalités ({(plan.features || []).length})
                        </label>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {(plan.features || []).map((feature: string, featureIndex: number) => (
                            <div key={featureIndex} className="flex items-center gap-1">
                              <input
                                type="text"
                                value={feature}
                                onChange={(e) => {
                                  const newPlans = [...plans]
                                  const newFeatures = [...(plan.features || [])]
                                  newFeatures[featureIndex] = e.target.value
                                  newPlans[planIndex] = { ...plan, features: newFeatures }
                                  onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                                }}
                                className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                                placeholder="Fonctionnalité"
                              />
                              <button
                                onClick={() => {
                                  const newPlans = [...plans]
                                  const newFeatures = (plan.features || []).filter((_: string, i: number) => i !== featureIndex)
                                  newPlans[planIndex] = { ...plan, features: newFeatures }
                                  onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                                }}
                                className="px-1.5 py-1 text-[10px] bg-red-500 text-white rounded hover:bg-red-600"
                                title="Supprimer"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            const newPlans = [...plans]
                            const newFeatures = [...(plan.features || []), '']
                            newPlans[planIndex] = { ...plan, features: newFeatures }
                            onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                          }}
                          className="mt-1 px-2 py-1 text-[10px] bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          + Ajouter fonctionnalité
                        </button>
                      </div>

                      {/* Bouton d'action */}
                      <div className="grid grid-cols-3 gap-1">
                        <div className="col-span-2">
                          <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Texte bouton
                          </label>
                          <input
                            type="text"
                            value={plan.button_text || ''}
                            onChange={(e) => {
                              const newPlans = [...plans]
                              newPlans[planIndex] = { ...plan, button_text: e.target.value }
                              onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                            }}
                            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                            placeholder="Choisir ce plan"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Style
                          </label>
                          <select
                            value={plan.button_style || 'primary'}
                            onChange={(e) => {
                              const newPlans = [...plans]
                              newPlans[planIndex] = { ...plan, button_style: e.target.value }
                              onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                            }}
                            className="w-full px-1 py-1 text-[10px] border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                          >
                            <option value="primary">Primaire</option>
                            <option value="secondary">Secondaire</option>
                            <option value="outline">Contour</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-1">
                        <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">
                          URL bouton
                        </label>
                        <UrlInputWithSuggestions
                          value={plan.button_url || ''}
                          onChange={(url) => {
                            const newPlans = [...plans]
                            newPlans[planIndex] = { ...plan, button_url: url }
                            onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                          }}
                          placeholder="/register?plan=starter"
                          className="text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => onUpdate({ 
                    data: { 
                      ...safeBlock.data, 
                      plans: [...plans, { 
                        name: '', 
                        description: '',
                        price_monthly: '', 
                        price_yearly: '',
                        period: 'monthly',
                        badge: '',
                        is_featured: false,
                        features: [], 
                        button_text: 'Choisir ce plan', 
                        button_url: '',
                        button_style: 'primary'
                      }] 
                    } 
                  })}
                  className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  + Ajouter un plan tarifaire
                </button>
              </div>
            </>
          )}
        </div>
      )
    case 'timeline':
      const events = safeBlock.data.events || [{ date: '', title: '', description: '' }]
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre de la section
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Notre histoire"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Événements ({events.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {events.map((event: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="text"
                    value={event.date || ''}
                    onChange={(e) => {
                      const newEvents = [...events]
                      newEvents[index] = { ...event, date: e.target.value }
                      onUpdate({ data: { ...block.data, events: newEvents } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Date (ex: 2024)"
                  />
                  <input
                    type="text"
                    value={event.title || ''}
                    onChange={(e) => {
                      const newEvents = [...events]
                      newEvents[index] = { ...event, title: e.target.value }
                      onUpdate({ data: { ...block.data, events: newEvents } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Titre"
                  />
                  <textarea
                    value={event.description || ''}
                    onChange={(e) => {
                      const newEvents = [...events]
                      newEvents[index] = { ...event, description: e.target.value }
                      onUpdate({ data: { ...block.data, events: newEvents } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Description"
                    rows={2}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, events: [...events, { date: '', title: '', description: '' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {events.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, events: events.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )
    case 'accordion':
      const items = safeBlock.data.items || [{ title: '', content: '' }]
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre de la section
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Questions fréquentes"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Éléments ({items.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {items.map((item: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => {
                      const newItems = [...items]
                      newItems[index] = { ...item, title: e.target.value }
                      onUpdate({ data: { ...block.data, items: newItems } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Titre"
                  />
                  <textarea
                    value={item.content || ''}
                    onChange={(e) => {
                      const newItems = [...items]
                      newItems[index] = { ...item, content: e.target.value }
                      onUpdate({ data: { ...block.data, items: newItems } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Contenu"
                    rows={2}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, items: [...items, { title: '', content: '' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {items.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, items: items.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )
    case 'stats':
      const stats = safeBlock.data.stats || [{ label: '', value: '', icon: '' }]
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre de la section
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Nos statistiques"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Statistiques ({stats.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.map((stat: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="text"
                    value={stat.value || ''}
                    onChange={(e) => {
                      const newStats = [...stats]
                      newStats[index] = { ...stat, value: e.target.value }
                      onUpdate({ data: { ...block.data, stats: newStats } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Valeur (ex: 1000+)"
                  />
                  <input
                    type="text"
                    value={stat.label || ''}
                    onChange={(e) => {
                      const newStats = [...stats]
                      newStats[index] = { ...stat, label: e.target.value }
                      onUpdate({ data: { ...block.data, stats: newStats } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Label (ex: Clients satisfaits)"
                  />
                  <input
                    type="text"
                    value={stat.icon || ''}
                    onChange={(e) => {
                      const newStats = [...stats]
                      newStats[index] = { ...stat, icon: e.target.value }
                      onUpdate({ data: { ...block.data, stats: newStats } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Icône emoji (ex: 👥)"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, stats: [...stats, { label: '', value: '', icon: '' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {stats.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, stats: stats.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )
    case 'social-links':
      const links = safeBlock.data.links || [{ platform: '', url: '', icon: '' }]
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre de la section
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Suivez-nous"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Liens sociaux ({links.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {links.map((link: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="text"
                    value={link.platform || ''}
                    onChange={(e) => {
                      const newLinks = [...links]
                      newLinks[index] = { ...link, platform: e.target.value }
                      onUpdate({ data: { ...block.data, links: newLinks } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Plateforme (ex: Facebook)"
                  />
                  <UrlInputWithSuggestions
                    value={link.url || ''}
                    onChange={(url) => {
                      const newLinks = [...links]
                      newLinks[index] = { ...link, url }
                      onUpdate({ data: { ...block.data, links: newLinks } })
                    }}
                    placeholder="URL"
                    className="text-xs"
                  />
                  <input
                    type="text"
                    value={link.icon || ''}
                    onChange={(e) => {
                      const newLinks = [...links]
                      newLinks[index] = { ...link, icon: e.target.value }
                      onUpdate({ data: { ...block.data, links: newLinks } })
                    }}
                    className="w-full mt-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Icône emoji (ex: 📘)"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, links: [...links, { platform: '', url: '', icon: '' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {links.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, links: links.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )
    case 'booking-form':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre du formulaire
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Réservez votre course"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`booking-pickup-${block.id}`}
                checked={safeBlock.data.show_pickup !== false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_pickup: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`booking-pickup-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Point de prise en charge
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`booking-dropoff-${block.id}`}
                checked={safeBlock.data.show_dropoff !== false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_dropoff: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`booking-dropoff-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Point de destination
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`booking-date-${block.id}`}
                checked={safeBlock.data.show_date !== false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_date: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`booking-date-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Date et heure
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`booking-passengers-${block.id}`}
                checked={safeBlock.data.show_passengers || false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_passengers: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`booking-passengers-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Nombre de passagers
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`booking-vehicle-${block.id}`}
                checked={safeBlock.data.show_vehicle || false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_vehicle: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`booking-vehicle-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Type de véhicule
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`booking-phone-${block.id}`}
                checked={safeBlock.data.show_phone !== false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_phone: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`booking-phone-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Téléphone
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`booking-notes-${block.id}`}
                checked={safeBlock.data.show_notes || false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_notes: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`booking-notes-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Notes spéciales
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte du bouton
            </label>
            <input
              type="text"
              value={safeBlock.data.button_text || 'Réserver'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_text: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`booking-captcha-${block.id}`}
              checked={safeBlock.data.enable_captcha || false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, enable_captcha: e.target.checked } })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={`booking-captcha-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
              Activer le captcha
            </label>
          </div>
          {safeBlock.data.enable_captcha && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Thème du captcha
              </label>
              <select
                value={safeBlock.data.captcha_theme || 'light'}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, captcha_theme: e.target.value } })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
              </select>
            </div>
          )}
        </div>
      )
    case 'pricing-table':
      const pricingRows = safeBlock.data.rows || [{ route: '', price: '', duration: '' }]
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre de la section
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Nos tarifs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lignes de tarifs ({pricingRows.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pricingRows.map((row: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="text"
                    value={row.route || ''}
                    onChange={(e) => {
                      const newRows = [...pricingRows]
                      newRows[index] = { ...row, route: e.target.value }
                      onUpdate({ data: { ...block.data, rows: newRows } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Trajet (ex: Aéroport → Centre-ville)"
                  />
                  <div className="grid grid-cols-2 gap-1">
                    <input
                      type="text"
                      value={row.price || ''}
                      onChange={(e) => {
                        const newRows = [...pricingRows]
                        newRows[index] = { ...row, price: e.target.value }
                        onUpdate({ data: { ...block.data, rows: newRows } })
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      placeholder="Prix (ex: 45€)"
                    />
                    <input
                      type="text"
                      value={row.duration || ''}
                      onChange={(e) => {
                        const newRows = [...pricingRows]
                        newRows[index] = { ...row, duration: e.target.value }
                        onUpdate({ data: { ...block.data, rows: newRows } })
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      placeholder="Durée (ex: 30 min)"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, rows: [...pricingRows, { route: '', price: '', duration: '' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {pricingRows.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, rows: pricingRows.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )
    case 'service-zones':
      const zones = safeBlock.data.zones || [{ name: '', description: '', icon: '' }]
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre de la section
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Zones de service"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Zones ({zones.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {zones.map((zone: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="text"
                    value={zone.name || ''}
                    onChange={(e) => {
                      const newZones = [...zones]
                      newZones[index] = { ...zone, name: e.target.value }
                      onUpdate({ data: { ...block.data, zones: newZones } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Nom de la zone"
                  />
                  <textarea
                    value={zone.description || ''}
                    onChange={(e) => {
                      const newZones = [...zones]
                      newZones[index] = { ...zone, description: e.target.value }
                      onUpdate({ data: { ...block.data, zones: newZones } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Description"
                    rows={2}
                  />
                  <input
                    type="text"
                    value={zone.icon || ''}
                    onChange={(e) => {
                      const newZones = [...zones]
                      newZones[index] = { ...zone, icon: e.target.value }
                      onUpdate({ data: { ...block.data, zones: newZones } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Icône emoji (ex: 🚗)"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, zones: [...zones, { name: '', description: '', icon: '' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {zones.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, zones: zones.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )
    case 'vehicle-gallery':
      const vehicles = safeBlock.data.vehicles || [{ name: '', image: '', description: '', features: '' }]
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre de la section
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Notre flotte"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Véhicules ({vehicles.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {vehicles.map((vehicle: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="text"
                    value={vehicle.name || ''}
                    onChange={(e) => {
                      const newVehicles = [...vehicles]
                      newVehicles[index] = { ...vehicle, name: e.target.value }
                      onUpdate({ data: { ...block.data, vehicles: newVehicles } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Nom du véhicule"
                  />
                  <input
                    type="url"
                    value={vehicle.image || ''}
                    onChange={(e) => {
                      const newVehicles = [...vehicles]
                      newVehicles[index] = { ...vehicle, image: e.target.value }
                      onUpdate({ data: { ...block.data, vehicles: newVehicles } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="URL image"
                  />
                  <textarea
                    value={vehicle.description || ''}
                    onChange={(e) => {
                      const newVehicles = [...vehicles]
                      newVehicles[index] = { ...vehicle, description: e.target.value }
                      onUpdate({ data: { ...block.data, vehicles: newVehicles } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Description"
                    rows={2}
                  />
                  <input
                    type="text"
                    value={vehicle.features || ''}
                    onChange={(e) => {
                      const newVehicles = [...vehicles]
                      newVehicles[index] = { ...vehicle, features: e.target.value }
                      onUpdate({ data: { ...block.data, vehicles: newVehicles } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Caractéristiques (ex: 4 places, WiFi, Climatisation)"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, vehicles: [...vehicles, { name: '', image: '', description: '', features: '' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {vehicles.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, vehicles: vehicles.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )
    case 'contact-buttons':
      const contacts = safeBlock.data.contacts || [{ type: 'phone', label: '', value: '', icon: '' }]
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre de la section
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Contactez-nous"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contacts ({contacts.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {contacts.map((contact: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <select
                    value={contact.type || 'phone'}
                    onChange={(e) => {
                      const newContacts = [...contacts]
                      newContacts[index] = { ...contact, type: e.target.value }
                      onUpdate({ data: { ...block.data, contacts: newContacts } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  >
                    <option value="phone">Téléphone</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                  <input
                    type="text"
                    value={contact.label || ''}
                    onChange={(e) => {
                      const newContacts = [...contacts]
                      newContacts[index] = { ...contact, label: e.target.value }
                      onUpdate({ data: { ...block.data, contacts: newContacts } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Label (ex: Appelez-nous)"
                  />
                  <input
                    type="text"
                    value={contact.value || ''}
                    onChange={(e) => {
                      const newContacts = [...contacts]
                      newContacts[index] = { ...contact, value: e.target.value }
                      onUpdate({ data: { ...block.data, contacts: newContacts } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Valeur (ex: +33 6 12 34 56 78)"
                  />
                  <input
                    type="text"
                    value={contact.icon || ''}
                    onChange={(e) => {
                      const newContacts = [...contacts]
                      newContacts[index] = { ...contact, icon: e.target.value }
                      onUpdate({ data: { ...block.data, contacts: newContacts } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Icône emoji (ex: 📞)"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, contacts: [...contacts, { type: 'phone', label: '', value: '', icon: '' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {contacts.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, contacts: contacts.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )
    case 'map':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre de la section
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Notre zone de service"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Adresse ou coordonnées
            </label>
            <input
              type="text"
              value={safeBlock.data.address || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, address: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Ex: Paris, France ou 48.8566, 2.3522"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hauteur de la carte (px)
            </label>
            <input
              type="number"
              value={safeBlock.data.height || 400}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, height: parseInt(e.target.value) || 400 } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              min={200}
              max={800}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`map-zoom-${block.id}`}
              checked={safeBlock.data.show_controls || false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_controls: e.target.checked } })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={`map-zoom-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
              Afficher les contrôles (zoom, etc.)
            </label>
          </div>
        </div>
      )
    case 'badges':
      const badges = safeBlock.data.badges || [{ text: '', icon: '', color: 'blue' }]
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre de la section
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Certifications et badges"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Badges ({badges.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {badges.map((badge: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="text"
                    value={badge.text || ''}
                    onChange={(e) => {
                      const newBadges = [...badges]
                      newBadges[index] = { ...badge, text: e.target.value }
                      onUpdate({ data: { ...block.data, badges: newBadges } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Texte du badge"
                  />
                  <div className="grid grid-cols-2 gap-1">
                    <input
                      type="text"
                      value={badge.icon || ''}
                      onChange={(e) => {
                        const newBadges = [...badges]
                        newBadges[index] = { ...badge, icon: e.target.value }
                        onUpdate({ data: { ...block.data, badges: newBadges } })
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      placeholder="Icône emoji"
                    />
                    <select
                      value={badge.color || 'blue'}
                      onChange={(e) => {
                        const newBadges = [...badges]
                        newBadges[index] = { ...badge, color: e.target.value }
                        onUpdate({ data: { ...block.data, badges: newBadges } })
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    >
                      <option value="blue">Bleu</option>
                      <option value="green">Vert</option>
                      <option value="red">Rouge</option>
                      <option value="yellow">Jaune</option>
                      <option value="purple">Violet</option>
                      <option value="gray">Gris</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, badges: [...badges, { text: '', icon: '', color: 'blue' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {badges.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, badges: badges.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )
    case 'form':
      const formFields = safeBlock.data.fields || [
        { type: 'text', label: 'Nom', placeholder: 'Votre nom', required: true },
        { type: 'email', label: 'Email', placeholder: 'votre@email.com', required: true },
        { type: 'textarea', label: 'Message', placeholder: 'Votre message', required: true }
      ]
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre du formulaire
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Formulaire de contact"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte du bouton
            </label>
            <input
              type="text"
              value={safeBlock.data.submit_text || 'Envoyer'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, submit_text: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Champs du formulaire ({formFields.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {formFields.map((field: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <select
                    value={field.type || 'text'}
                    onChange={(e) => {
                      const newFields = [...formFields]
                      newFields[index] = { ...field, type: e.target.value }
                      onUpdate({ data: { ...block.data, fields: newFields } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  >
                    <option value="text">Texte</option>
                    <option value="email">Email</option>
                    <option value="tel">Téléphone</option>
                    <option value="textarea">Zone de texte</option>
                    <option value="number">Nombre</option>
                    <option value="url">URL</option>
                    <option value="date">Date</option>
                  </select>
                  <input
                    type="text"
                    value={field.label || ''}
                    onChange={(e) => {
                      const newFields = [...formFields]
                      newFields[index] = { ...field, label: e.target.value }
                      onUpdate({ data: { ...block.data, fields: newFields } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Label du champ"
                  />
                  <input
                    type="text"
                    value={field.placeholder || ''}
                    onChange={(e) => {
                      const newFields = [...formFields]
                      newFields[index] = { ...field, placeholder: e.target.value }
                      onUpdate({ data: { ...block.data, fields: newFields } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Placeholder"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`field-required-${block.id}-${index}`}
                      checked={field.required || false}
                      onChange={(e) => {
                        const newFields = [...formFields]
                        newFields[index] = { ...field, required: e.target.checked }
                        onUpdate({ data: { ...block.data, fields: newFields } })
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`field-required-${block.id}-${index}`} className="text-xs text-gray-700 dark:text-gray-300">
                      Champ requis
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, fields: [...formFields, { type: 'text', label: '', placeholder: '', required: false }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {formFields.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, fields: formFields.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <input
              type="checkbox"
              id={`form-captcha-${block.id}`}
              checked={safeBlock.data.enable_captcha || false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, enable_captcha: e.target.checked } })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={`form-captcha-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
              Activer le captcha
            </label>
          </div>
          {safeBlock.data.enable_captcha && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Thème du captcha
              </label>
              <select
                value={safeBlock.data.captcha_theme || 'light'}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, captcha_theme: e.target.value } })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
              </select>
            </div>
          )}
        </div>
      )
    case 'columns':
      const columnCount = safeBlock.data.columns_count || 2
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de colonnes
            </label>
            <input
              type="number"
              value={columnCount}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, columns_count: parseInt(e.target.value) || 2 } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              min={2}
              max={6}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Espacement entre colonnes
            </label>
            <select
              value={block.styles?.gap || '1rem'}
              onChange={(e) => onUpdate({ styles: { ...block.styles, gap: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="0.5rem">Très serré</option>
              <option value="1rem">Normal</option>
              <option value="1.5rem">Espacé</option>
              <option value="2rem">Très espacé</option>
            </select>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              💡 Les colonnes peuvent contenir d'autres blocs. Ajoutez des blocs enfants pour remplir chaque colonne.
            </p>
          </div>
        </div>
      )
    case 'hero':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre principal
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Titre Hero"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sous-titre
            </label>
            <textarea
              value={safeBlock.data.subtitle || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, subtitle: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Sous-titre"
              rows={2}
            />
          </div>
          <div>
            <ImageSelector
              value={safeBlock.data.background_image || ''}
              onChange={(url) => onUpdate({ data: { ...safeBlock.data, background_image: url } })}
              label="Image de fond"
              placeholder="Sélectionner ou uploader une image de fond"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Boutons
            </label>
            <div className="space-y-2">
              {(safeBlock.data.buttons || (safeBlock.data.button_text ? [{ text: safeBlock.data.button_text, url: safeBlock.data.button_url, style: 'primary' }] : [])).map((btn: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      value={btn.text || ''}
                      onChange={(e) => {
                        const buttons = safeBlock.data.buttons || []
                        buttons[index] = { ...btn, text: e.target.value }
                        onUpdate({ data: { ...block.data, buttons } })
                      }}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      placeholder="Texte du bouton"
                    />
                    <select
                      value={btn.style || 'primary'}
                      onChange={(e) => {
                        const buttons = safeBlock.data.buttons || []
                        buttons[index] = { ...btn, style: e.target.value }
                        onUpdate({ data: { ...block.data, buttons } })
                      }}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    >
                      <option value="primary">Principal</option>
                      <option value="secondary">Secondaire</option>
                    </select>
                  </div>
                  <PageSelector
                    value={btn.url || ''}
                    onChange={(url) => {
                      const buttons = safeBlock.data.buttons || []
                      buttons[index] = { ...btn, url }
                      onUpdate({ data: { ...block.data, buttons } })
                    }}
                    placeholder="URL du bouton..."
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  />
                  <button
                    onClick={() => {
                      const buttons = safeBlock.data.buttons || []
                      onUpdate({ data: { ...block.data, buttons: buttons.filter((_: any, i: number) => i !== index) } })
                    }}
                    className="mt-2 w-full px-3 py-1.5 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    title="Supprimer ce bouton"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Supprimer ce bouton
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const buttons = safeBlock.data.buttons || []
                  onUpdate({ data: { ...block.data, buttons: [...(buttons || []), { text: '', url: '', style: 'primary' }] } })
                }}
                className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter un bouton
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`hero-overlay-${block.id}`}
              checked={safeBlock.data.overlay || false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, overlay: e.target.checked } })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={`hero-overlay-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
              Overlay sombre sur l'image
            </label>
          </div>
        </div>
      )
    case 'image':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL de l'image
            </label>
            <input
              type="url"
              value={safeBlock.data.url || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, url: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte alternatif
            </label>
            <input
              type="text"
              value={safeBlock.data.alt || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, alt: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Description de l'image"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Légende
            </label>
            <input
              type="text"
              value={safeBlock.data.caption || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, caption: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Légende (optionnel)"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Largeur (%)
              </label>
              <input
                type="number"
                value={safeBlock.data.width || 100}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, width: parseInt(e.target.value) || 100 } })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                min={10}
                max={100}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Alignement
              </label>
              <select
                value={safeBlock.data.align || 'center'}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, align: e.target.value } })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="left">Gauche</option>
                <option value="center">Centre</option>
                <option value="right">Droite</option>
              </select>
            </div>
          </div>
        </div>
      )
    case 'video':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL de la vidéo (YouTube, Vimeo, etc.)
            </label>
            <input
              type="url"
              value={safeBlock.data.url || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, url: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre de la vidéo
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Titre (optionnel)"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Largeur (%)
              </label>
              <input
                type="number"
                value={safeBlock.data.width || 100}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, width: parseInt(e.target.value) || 100 } })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                min={50}
                max={100}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hauteur (px)
              </label>
              <input
                type="number"
                value={safeBlock.data.height || 400}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, height: parseInt(e.target.value) || 400 } })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                min={200}
                max={800}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`video-autoplay-${block.id}`}
              checked={safeBlock.data.autoplay || false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, autoplay: e.target.checked } })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={`video-autoplay-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
              Lecture automatique
            </label>
          </div>
        </div>
      )
    case 'gallery':
      const galleryImages = safeBlock.data.images || []
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de colonnes
            </label>
            <input
              type="number"
              value={safeBlock.data.columns || 3}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, columns: parseInt(e.target.value) || 3 } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              min={1}
              max={6}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Images ({galleryImages.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {galleryImages.map((img: string, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="url"
                    value={img}
                    onChange={(e) => {
                      const newImages = [...galleryImages]
                      newImages[index] = e.target.value
                      onUpdate({ data: { ...block.data, images: newImages } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="URL de l'image"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, images: [...galleryImages, ''] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {galleryImages.length > 0 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, images: galleryImages.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )
    case 'banner':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre de la bannière
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Titre de la bannière"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sous-titre (optionnel)
            </label>
            <input
              type="text"
              value={safeBlock.data.subtitle || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, subtitle: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Sous-titre"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image de fond (URL)
            </label>
            <input
              type="url"
              value={safeBlock.data.background_image || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, background_image: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hauteur minimale (px)
              </label>
              <input
                type="number"
                value={safeBlock.data.min_height || 400}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, min_height: parseInt(e.target.value) || 400 } })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                min={200}
                max={1000}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Alignement du texte
              </label>
              <select
                value={safeBlock.data.text_align || 'center'}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, text_align: e.target.value } })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="left">Gauche</option>
                <option value="center">Centre</option>
                <option value="right">Droite</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`banner-overlay-${block.id}`}
              checked={safeBlock.data.overlay || false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, overlay: e.target.checked } })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={`banner-overlay-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
              Overlay sombre sur l'image
            </label>
          </div>
          {safeBlock.data.button_text && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Texte bouton
                </label>
                <input
                  type="text"
                  value={safeBlock.data.button_text || ''}
                  onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_text: e.target.value } })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL bouton
                </label>
                <UrlInputWithSuggestions
                  value={safeBlock.data.button_url || ''}
                  onChange={(url) => onUpdate({ data: { ...block.data, button_url: url } })}
                  placeholder="URL"
                  className="text-xs"
                />
              </div>
            </div>
          )}
        </div>
      )
    case 'cta-section':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Prêt à démarrer ?"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={safeBlock.data.description || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, description: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              rows={3}
              placeholder="Créez votre site VTC professionnel dès aujourd'hui..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte du bouton
            </label>
            <input
              type="text"
              value={safeBlock.data.button_text || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_text: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="🚀 Créer mon compte gratuitement"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL du bouton
            </label>
            <UrlInputWithSuggestions
              value={safeBlock.data.button_url || ''}
              onChange={(url) => onUpdate({ data: { ...safeBlock.data, button_url: url } })}
              placeholder="/register"
              className="text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Style du bouton
            </label>
            <select
              value={safeBlock.data.button_style || 'light'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_style: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="light">Clair (blanc sur fond coloré)</option>
              <option value="dark">Sombre (gris foncé)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dégradé de fond
            </label>
            <input
              type="text"
              value={safeBlock.data.background_gradient || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, background_gradient: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
              placeholder="linear-gradient(to right, #2563eb, #9333ea)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Exemples: linear-gradient(to right, #2563eb, #9333ea) ou from-blue-600 to-purple-600
            </p>
          </div>
        </div>
      )
    case 'header':
      const headerLinks = safeBlock.data.links || []
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte du logo
            </label>
            <input
              type="text"
              value={safeBlock.data.logo_text || 'VTCBuilder'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, logo_text: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="VTCBuilder"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL du logo (lien)
            </label>
            <input
              type="text"
              value={safeBlock.data.logo_url || '/'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, logo_url: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="/"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image du logo (URL)
            </label>
            <input
              type="text"
              value={safeBlock.data.logo_image || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, logo_image: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Badge (optionnel)
            </label>
            <input
              type="text"
              value={safeBlock.data.badge || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, badge: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Beta"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Header sticky
            </label>
            <input
              type="checkbox"
              checked={safeBlock.data.sticky !== false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, sticky: e.target.checked } })}
              className="w-4 h-4"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Afficher le toggle de thème
            </label>
            <input
              type="checkbox"
              checked={safeBlock.data.show_theme_toggle !== false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_theme_toggle: e.target.checked } })}
              className="w-4 h-4"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Liens de navigation
            </label>
            <div className="space-y-3">
              {headerLinks.map((link: any, index: number) => (
                <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Lien {index + 1}</span>
                    <button
                      onClick={() => {
                        const newLinks = headerLinks.filter((_: any, i: number) => i !== index)
                        onUpdate({ data: { ...block.data, links: newLinks } })
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                      title="Supprimer ce lien"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Supprimer
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={link.label || ''}
                      onChange={(e) => {
                        const newLinks = [...headerLinks]
                        newLinks[index] = { ...link, label: e.target.value }
                        onUpdate({ data: { ...block.data, links: newLinks } })
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      placeholder="Label"
                    />
                    <input
                      type="text"
                      value={link.url || ''}
                      onChange={(e) => {
                        const newLinks = [...headerLinks]
                        newLinks[index] = { ...link, url: e.target.value }
                        onUpdate({ data: { ...block.data, links: newLinks } })
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      placeholder="URL"
                    />
                  </div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2">Personnalisation CSS</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="color"
                      value={link.color || '#374151'}
                      onChange={(e) => {
                        const newLinks = [...headerLinks]
                        newLinks[index] = { ...link, color: e.target.value }
                        onUpdate({ data: { ...block.data, links: newLinks } })
                      }}
                      className="h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                      title="Couleur du texte"
                    />
                    <input
                      type="color"
                      value={link.hover_color || '#111827'}
                      onChange={(e) => {
                        const newLinks = [...headerLinks]
                        newLinks[index] = { ...link, hover_color: e.target.value }
                        onUpdate({ data: { ...block.data, links: newLinks } })
                      }}
                      className="h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                      title="Couleur au survol"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={link.font_size || ''}
                      onChange={(e) => {
                        const newLinks = [...headerLinks]
                        newLinks[index] = { ...link, font_size: e.target.value }
                        onUpdate({ data: { ...block.data, links: newLinks } })
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      placeholder="Taille police (ex: 14px)"
                    />
                    <input
                      type="text"
                      value={link.font_weight || ''}
                      onChange={(e) => {
                        const newLinks = [...headerLinks]
                        newLinks[index] = { ...link, font_weight: e.target.value }
                        onUpdate({ data: { ...block.data, links: newLinks } })
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      placeholder="Poids police (ex: 500)"
                    />
                  </div>
                  <input
                    type="text"
                    value={link.custom_class || ''}
                    onChange={(e) => {
                      const newLinks = [...headerLinks]
                      newLinks[index] = { ...link, custom_class: e.target.value }
                      onUpdate({ data: { ...block.data, links: newLinks } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="Classes CSS personnalisées (optionnel)"
                  />
                </div>
              ))}
              <button
                onClick={() => {
                  const newLinks = [...headerLinks, { label: '', url: '#', color: '#374151', hover_color: '#111827' }]
                  onUpdate({ data: { ...block.data, links: newLinks } })
                }}
                className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
              >
                <span>+</span>
                <span>Ajouter un lien</span>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bouton CTA (optionnel)
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={safeBlock.data.cta_button?.text || ''}
                onChange={(e) => onUpdate({ 
                  data: { 
                    ...block.data, 
                    cta_button: { 
                      ...safeBlock.data.cta_button, 
                      text: e.target.value 
                    } 
                  } 
                })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Texte du bouton"
              />
              <input
                type="text"
                value={safeBlock.data.cta_button?.url || ''}
                onChange={(e) => onUpdate({ 
                  data: { 
                    ...block.data, 
                    cta_button: { 
                      ...safeBlock.data.cta_button, 
                      url: e.target.value 
                    } 
                  } 
                })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="URL du bouton"
              />
              <select
                value={safeBlock.data.cta_button?.style || 'primary'}
                onChange={(e) => onUpdate({ 
                  data: { 
                    ...block.data, 
                    cta_button: { 
                      ...safeBlock.data.cta_button, 
                      style: e.target.value 
                    } 
                  } 
                })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="primary">Primaire</option>
                <option value="secondary">Secondaire</option>
              </select>
            </div>
          </div>
        </div>
      )
    
    case 'footer':
      const footerLinks = safeBlock.data.links || []
      const footerColumns = safeBlock.data.columns || [
        { title: 'Liens rapides', links: [] },
        { title: 'Contact', links: [] },
        { title: 'Réseaux sociaux', links: [] }
      ]
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte du copyright
            </label>
            <input
              type="text"
              value={safeBlock.data.copyright || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, copyright: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="© 2024 Votre Entreprise. Tous droits réservés."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Colonnes du footer ({footerColumns.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {footerColumns.map((column: any, colIndex: number) => (
                <div key={colIndex} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="text"
                    value={column.title || ''}
                    onChange={(e) => {
                      const newColumns = [...footerColumns]
                      newColumns[colIndex] = { ...column, title: e.target.value }
                      onUpdate({ data: { ...block.data, columns: newColumns } })
                    }}
                    className="w-full mb-2 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Titre de la colonne"
                  />
                  <div className="space-y-1">
                    {(column.links || []).map((link: any, linkIndex: number) => (
                      <div key={linkIndex} className="flex gap-1">
                        <UrlInputWithSuggestions
                          value={link.url || ''}
                          onChange={(url) => {
                            const newColumns = [...footerColumns]
                            const newLinks = [...(newColumns[colIndex].links || [])]
                            newLinks[linkIndex] = { ...link, url }
                            newColumns[colIndex] = { ...column, links: newLinks }
                            onUpdate({ data: { ...block.data, columns: newColumns } })
                          }}
                          placeholder="URL"
                          className="text-xs flex-1"
                        />
                        <input
                          type="text"
                          value={link.label || ''}
                          onChange={(e) => {
                            const newColumns = [...footerColumns]
                            const newLinks = [...(newColumns[colIndex].links || [])]
                            newLinks[linkIndex] = { ...link, label: e.target.value }
                            newColumns[colIndex] = { ...column, links: newLinks }
                            onUpdate({ data: { ...block.data, columns: newColumns } })
                          }}
                          className="w-24 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                          placeholder="Label"
                        />
                        <button
                          onClick={() => {
                            const newColumns = [...footerColumns]
                            newColumns[colIndex] = {
                              ...column,
                              links: (column.links || []).filter((_: any, i: number) => i !== linkIndex)
                            }
                            onUpdate({ data: { ...block.data, columns: newColumns } })
                          }}
                          className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center"
                          title="Supprimer ce lien"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newColumns = [...footerColumns]
                        newColumns[colIndex] = {
                          ...column,
                          links: [...(column.links || []), { label: '', url: '' }]
                        }
                        onUpdate({ data: { ...block.data, columns: newColumns } })
                      }}
                      className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      + Ajouter lien
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, columns: [...footerColumns, { title: '', links: [] }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter colonne
              </button>
              {footerColumns.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, columns: footerColumns.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer colonne
                </button>
              )}
            </div>
          </div>
        </div>
      )
    case 'section':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image de fond (URL) - Optionnel
            </label>
            <input
              type="url"
              value={safeBlock.data.background_image || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, background_image: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Position de l'image
              </label>
              <select
                value={safeBlock.data.background_position || 'center'}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, background_position: e.target.value } })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="center">Centre</option>
                <option value="top">Haut</option>
                <option value="bottom">Bas</option>
                <option value="left">Gauche</option>
                <option value="right">Droite</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Taille de l'image
              </label>
              <select
                value={safeBlock.data.background_size || 'cover'}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, background_size: e.target.value } })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="cover">Couvrir</option>
                <option value="contain">Contenir</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`section-overlay-${block.id}`}
              checked={safeBlock.data.overlay || false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, overlay: e.target.checked } })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={`section-overlay-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
              Overlay sombre sur l'image
            </label>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              💡 Cette section peut contenir d'autres blocs. Ajoutez des blocs enfants pour remplir la section.
            </p>
          </div>
        </div>
      )
    case 'carousel':
      const carouselItems = safeBlock.data.items || []
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Éléments du carousel ({carouselItems.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {carouselItems.map((item: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="url"
                    value={item.image || ''}
                    onChange={(e) => {
                      const newItems = [...carouselItems]
                      newItems[index] = { ...item, image: e.target.value }
                      onUpdate({ data: { ...block.data, items: newItems } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="URL de l'image"
                  />
                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => {
                      const newItems = [...carouselItems]
                      newItems[index] = { ...item, title: e.target.value }
                      onUpdate({ data: { ...block.data, items: newItems } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Titre (optionnel)"
                  />
                  <input
                    type="text"
                    value={item.description || ''}
                    onChange={(e) => {
                      const newItems = [...carouselItems]
                      newItems[index] = { ...item, description: e.target.value }
                      onUpdate({ data: { ...block.data, items: newItems } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Description (optionnel)"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, items: [...carouselItems, { image: '', title: '', description: '' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {carouselItems.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, items: carouselItems.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vitesse (ms)
              </label>
              <input
                type="number"
                value={safeBlock.data.autoplay_speed || 3000}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, autoplay_speed: parseInt(e.target.value) || 3000 } })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                min={1000}
                max={10000}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id={`carousel-autoplay-${block.id}`}
                checked={safeBlock.data.autoplay !== false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, autoplay: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`carousel-autoplay-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Lecture automatique
              </label>
            </div>
          </div>
        </div>
      )
    case 'countdown':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date cible
            </label>
            <input
              type="datetime-local"
              value={safeBlock.data.target_date || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, target_date: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre (optionnel)
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Offre se termine dans..."
            />
          </div>
        </div>
      )
    case 'progress-bar':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Label
            </label>
            <input
              type="text"
              value={safeBlock.data.label || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, label: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Compétence"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pourcentage (0-100)
            </label>
            <input
              type="number"
              value={safeBlock.data.percentage || 0}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, percentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              min={0}
              max={100}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Couleur de la barre
            </label>
            <input
              type="color"
              value={safeBlock.data.color || '#3B82F6'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, color: e.target.value } })}
              className="w-full h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
          </div>
        </div>
      )

    case 'quote':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Citation
            </label>
            <textarea
              value={safeBlock.data.text || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, text: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Votre citation..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Auteur
            </label>
            <input
              type="text"
              value={safeBlock.data.author || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, author: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Nom de l'auteur"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Couleur de la bordure
            </label>
            <input
              type="color"
              value={safeBlock.data.color || '#3B82F6'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, color: e.target.value } })}
              className="w-full h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
          </div>
        </div>
      )

    case 'icon-box':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Icône (emoji ou texte)
            </label>
            <input
              type="text"
              value={safeBlock.data.icon || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, icon: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="🎯 ou ⚡"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Titre de la boîte"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={safeBlock.data.description || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, description: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Description..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Couleur de la bordure
            </label>
            <input
              type="color"
              value={safeBlock.data.border_color || '#E5E7EB'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, border_color: e.target.value } })}
              className="w-full h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
          </div>
        </div>
      )

    case 'feature-card':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Icône (emoji)
            </label>
            <input
              type="text"
              value={safeBlock.data.icon || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, icon: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="✨"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Titre de la fonctionnalité"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={safeBlock.data.description || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, description: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Description de la fonctionnalité..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte du lien
            </label>
            <input
              type="text"
              value={safeBlock.data.link_text || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, link_text: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="En savoir plus"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL du lien
            </label>
            <UrlInputWithSuggestions
              value={safeBlock.data.link_url || ''}
              onChange={(url) => onUpdate({ data: { ...block.data, link_url: url } })}
              placeholder="URL ou sélectionner une page..."
              className="text-xs"
            />
          </div>
        </div>
      )

    case 'video-embed':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL de la vidéo (YouTube ou Vimeo)
            </label>
            <input
              type="text"
              value={safeBlock.data.url || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, url: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
              Supporte YouTube et Vimeo
            </p>
          </div>
        </div>
      )

    case 'team-member':
      const socialLinks = safeBlock.data.social_links || [{ url: '', icon: '' }]
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom
            </label>
            <input
              type="text"
              value={safeBlock.data.name || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, name: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Jean Dupont"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rôle
            </label>
            <input
              type="text"
              value={safeBlock.data.role || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, role: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Développeur"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL de l'avatar
            </label>
            <input
              type="text"
              value={safeBlock.data.avatar || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, avatar: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Biographie
            </label>
            <textarea
              value={safeBlock.data.bio || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, bio: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Biographie..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Liens sociaux ({socialLinks.length})
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {socialLinks.map((link: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="text"
                    value={link.url || ''}
                    onChange={(e) => {
                      const newLinks = [...socialLinks]
                      newLinks[index] = { ...link, url: e.target.value }
                      onUpdate({ data: { ...block.data, social_links: newLinks } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="URL"
                  />
                  <input
                    type="text"
                    value={link.icon || ''}
                    onChange={(e) => {
                      const newLinks = [...socialLinks]
                      newLinks[index] = { ...link, icon: e.target.value }
                      onUpdate({ data: { ...block.data, social_links: newLinks } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Icône emoji"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, social_links: [...socialLinks, { url: '', icon: '' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {socialLinks.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, social_links: socialLinks.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )

    case 'logo-grid':
      const logos = safeBlock.data.logos || [{ url: '', alt: '' }]
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre de la section
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Nos partenaires"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de colonnes
            </label>
            <input
              type="number"
              value={safeBlock.data.columns || 4}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, columns: Math.max(1, Math.min(6, parseInt(e.target.value) || 4)) } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              min={1}
              max={6}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Logos ({logos.length})
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {logos.map((logo: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="text"
                    value={logo.url || ''}
                    onChange={(e) => {
                      const newLogos = [...logos]
                      newLogos[index] = { ...logo, url: e.target.value }
                      onUpdate({ data: { ...block.data, logos: newLogos } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="URL du logo"
                  />
                  <input
                    type="text"
                    value={logo.alt || ''}
                    onChange={(e) => {
                      const newLogos = [...logos]
                      newLogos[index] = { ...logo, alt: e.target.value }
                      onUpdate({ data: { ...block.data, logos: newLogos } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Texte alternatif"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, logos: [...logos, { url: '', alt: '' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {logos.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, logos: logos.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )

    case 'card':
      const cards = safeBlock.data.cards || [{ title: '', description: '', image: '', button_text: '', button_url: '' }]
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de colonnes
            </label>
            <select
              value={safeBlock.data.columns || 3}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, columns: parseInt(e.target.value) } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value={1}>1 colonne</option>
              <option value={2}>2 colonnes</option>
              <option value={3}>3 colonnes</option>
              <option value={4}>4 colonnes</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cartes ({cards.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cards.map((card: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="text"
                    value={card.title || ''}
                    onChange={(e) => {
                      const newCards = [...cards]
                      newCards[index] = { ...card, title: e.target.value }
                      onUpdate({ data: { ...block.data, cards: newCards } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Titre"
                  />
                  <textarea
                    value={card.description || ''}
                    onChange={(e) => {
                      const newCards = [...cards]
                      newCards[index] = { ...card, description: e.target.value }
                      onUpdate({ data: { ...block.data, cards: newCards } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Description"
                    rows={2}
                  />
                  <input
                    type="url"
                    value={card.image || ''}
                    onChange={(e) => {
                      const newCards = [...cards]
                      newCards[index] = { ...card, image: e.target.value }
                      onUpdate({ data: { ...block.data, cards: newCards } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="URL image"
                  />
                  <div className="grid grid-cols-2 gap-1">
                    <input
                      type="text"
                      value={card.button_text || ''}
                      onChange={(e) => {
                        const newCards = [...cards]
                        newCards[index] = { ...card, button_text: e.target.value }
                        onUpdate({ data: { ...block.data, cards: newCards } })
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      placeholder="Texte bouton"
                    />
                    <input
                      type="url"
                      value={card.button_url || ''}
                      onChange={(e) => {
                        const newCards = [...cards]
                        newCards[index] = { ...card, button_url: e.target.value }
                        onUpdate({ data: { ...block.data, cards: newCards } })
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      placeholder="URL bouton"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, cards: [...cards, { title: '', description: '', image: '', button_text: '', button_url: '' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter carte
              </button>
              {cards.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, cards: cards.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )

    case 'tabs':
      const tabs = safeBlock.data.tabs || [{ title: 'Onglet 1', content: '' }]
      return (
        <div className="space-y-3">
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-center gap-1">
              <span>⭐</span>
              <span>Fonctionnalité Premium</span>
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Onglets ({tabs.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tabs.map((tab: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="text"
                    value={tab.title || ''}
                    onChange={(e) => {
                      const newTabs = [...tabs]
                      newTabs[index] = { ...tab, title: e.target.value }
                      onUpdate({ data: { ...block.data, tabs: newTabs } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Titre onglet"
                  />
                  <textarea
                    value={tab.content || ''}
                    onChange={(e) => {
                      const newTabs = [...tabs]
                      newTabs[index] = { ...tab, content: e.target.value }
                      onUpdate({ data: { ...block.data, tabs: newTabs } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Contenu"
                    rows={3}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, tabs: [...tabs, { title: `Onglet ${tabs.length + 1}`, content: '' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter onglet
              </button>
              {tabs.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, tabs: tabs.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )

    case 'rating':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Note (1-5)
            </label>
            <input
              type="number"
              value={safeBlock.data.rating || 5}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, rating: Math.max(1, Math.min(5, parseInt(e.target.value) || 5)) } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              min={1}
              max={5}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Taille
            </label>
            <select
              value={safeBlock.data.size || 'medium'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, size: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="small">Petit</option>
              <option value="medium">Moyen</option>
              <option value="large">Grand</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Afficher le texte
            </label>
            <input
              type="checkbox"
              checked={safeBlock.data.show_text !== false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_text: e.target.checked } })}
              className="w-4 h-4"
            />
            {safeBlock.data.show_text !== false && (
              <input
                type="text"
                value={safeBlock.data.text || ''}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, text: e.target.value } })}
                className="w-full mt-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Texte (ex: '4.5 sur 5')"
              />
            )}
          </div>
        </div>
      )

    case 'breadcrumb':
      const breadcrumbItems = safeBlock.data.items || [{ label: 'Accueil', url: '/' }]
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Éléments ({breadcrumbItems.length})
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {breadcrumbItems.map((item: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="text"
                    value={item.label || ''}
                    onChange={(e) => {
                      const newItems = [...breadcrumbItems]
                      newItems[index] = { ...item, label: e.target.value }
                      onUpdate({ data: { ...block.data, items: newItems } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Label"
                  />
                  <UrlInputWithSuggestions
                    value={item.url || ''}
                    onChange={(url) => {
                      const newItems = [...breadcrumbItems]
                      newItems[index] = { ...item, url }
                      onUpdate({ data: { ...block.data, items: newItems } })
                    }}
                    placeholder="URL"
                    className="text-xs"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, items: [...breadcrumbItems, { label: '', url: '' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {breadcrumbItems.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, items: breadcrumbItems.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )

    case 'tags':
      const tags = safeBlock.data.tags || ['Tag 1', 'Tag 2']
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags (séparés par des virgules)
            </label>
            <textarea
              value={tags.join(', ')}
              onChange={(e) => {
                const newTags = e.target.value.split(',').map(t => t.trim()).filter(t => t)
                onUpdate({ data: { ...block.data, tags: newTags } })
              }}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Tag 1, Tag 2, Tag 3..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Style
            </label>
            <select
              value={safeBlock.data.style || 'rounded'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, style: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="rounded">Arrondi</option>
              <option value="square">Carré</option>
              <option value="pill">Pilule</option>
            </select>
          </div>
        </div>
      )

    case 'progress-circle':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pourcentage (0-100)
            </label>
            <input
              type="number"
              value={safeBlock.data.percentage || 75}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, percentage: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              min={0}
              max={100}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Taille
            </label>
            <select
              value={safeBlock.data.size || 'medium'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, size: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="small">Petit (100px)</option>
              <option value="medium">Moyen (150px)</option>
              <option value="large">Grand (200px)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte
            </label>
            <input
              type="text"
              value={safeBlock.data.text || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, text: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Texte sous le cercle"
            />
          </div>
        </div>
      )

    case 'search-bar':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Placeholder
            </label>
            <input
              type="text"
              value={safeBlock.data.placeholder || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, placeholder: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Rechercher..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Action (URL de recherche)
            </label>
            <input
              type="url"
              value={safeBlock.data.action || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, action: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="/search"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Afficher le bouton
            </label>
            <input
              type="checkbox"
              checked={safeBlock.data.show_button !== false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_button: e.target.checked } })}
              className="w-4 h-4"
            />
          </div>
        </div>
      )

    case 'audio-player':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL du fichier audio
            </label>
            <input
              type="url"
              value={safeBlock.data.src || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, src: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Titre de l'audio"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contrôles
            </label>
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={safeBlock.data.controls !== false}
                  onChange={(e) => onUpdate({ data: { ...safeBlock.data, controls: e.target.checked } })}
                  className="w-4 h-4"
                />
                Afficher les contrôles
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={safeBlock.data.autoplay === true}
                  onChange={(e) => onUpdate({ data: { ...safeBlock.data, autoplay: e.target.checked } })}
                  className="w-4 h-4"
                />
                Lecture automatique
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={safeBlock.data.loop === true}
                  onChange={(e) => onUpdate({ data: { ...safeBlock.data, loop: e.target.checked } })}
                  className="w-4 h-4"
                />
                Répéter
              </label>
            </div>
          </div>
        </div>
      )

    case 'modal':
      return (
        <div className="space-y-3">
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-center gap-1">
              <span>⭐</span>
              <span>Fonctionnalité Premium</span>
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre de la modal
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Titre"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contenu
            </label>
            <textarea
              value={safeBlock.data.content || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, content: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Contenu de la modal"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte du bouton déclencheur
            </label>
            <input
              type="text"
              value={safeBlock.data.trigger_text || 'Ouvrir'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, trigger_text: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Ouvrir"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Taille
            </label>
            <select
              value={safeBlock.data.size || 'medium'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, size: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="small">Petit</option>
              <option value="medium">Moyen</option>
              <option value="large">Grand</option>
              <option value="fullscreen">Plein écran</option>
            </select>
          </div>
        </div>
      )

    case 'chart':
      return (
        <div className="space-y-3">
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-center gap-1">
              <span>⭐</span>
              <span>Fonctionnalité Premium</span>
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type de graphique
            </label>
            <select
              value={safeBlock.data.chart_type || 'line'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, chart_type: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="line">Ligne</option>
              <option value="bar">Barres</option>
              <option value="pie">Camembert</option>
              <option value="doughnut">Donut</option>
              <option value="area">Aire</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Titre du graphique"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Données (JSON)
            </label>
            <textarea
              value={safeBlock.data.data || '{"labels": ["Jan", "Feb", "Mar"], "datasets": [{"label": "Ventes", "data": [10, 20, 30]}]}'}
              onChange={(e) => {
                try {
                  JSON.parse(e.target.value)
                  onUpdate({ data: { ...block.data, data: e.target.value } })
                } catch {
                  // Ignore invalid JSON
                }
              }}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
              placeholder='{"labels": [...], "datasets": [...]}'
              rows={6}
            />
            <p className="text-[10px] text-gray-500 mt-1">Format Chart.js JSON</p>
          </div>
        </div>
      )

    case 'calendar':
      return (
        <div className="space-y-3">
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-center gap-1">
              <span>⭐</span>
              <span>Fonctionnalité Premium</span>
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type de calendrier
            </label>
            <select
              value={safeBlock.data.calendar_type || 'month'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, calendar_type: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="month">Mensuel</option>
              <option value="week">Hebdomadaire</option>
              <option value="day">Quotidien</option>
              <option value="agenda">Agenda</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Afficher les événements
            </label>
            <input
              type="checkbox"
              checked={safeBlock.data.show_events !== false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_events: e.target.checked } })}
              className="w-4 h-4"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Événements (JSON)
            </label>
            <textarea
              value={safeBlock.data.events || '[]'}
              onChange={(e) => {
                try {
                  JSON.parse(e.target.value)
                  onUpdate({ data: { ...block.data, events: e.target.value } })
                } catch {
                  // Ignore invalid JSON
                }
              }}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
              placeholder='[{"title": "Événement", "date": "2024-01-15", "time": "10:00"}]'
              rows={4}
            />
          </div>
        </div>
      )

    case 'pagination':
      const totalPages = safeBlock.data.total_pages || 10
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre total de pages
            </label>
            <input
              type="number"
              value={totalPages}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, total_pages: Math.max(1, parseInt(e.target.value) || 1) } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              min={1}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Page actuelle
            </label>
            <input
              type="number"
              value={safeBlock.data.current_page || 1}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, current_page: Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1)) } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              min={1}
              max={totalPages}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Afficher les flèches
            </label>
            <input
              type="checkbox"
              checked={safeBlock.data.show_arrows !== false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_arrows: e.target.checked } })}
              className="w-4 h-4"
            />
          </div>
        </div>
      )

    case 'list':
      const listItems = safeBlock.data.items || ['Item 1', 'Item 2']
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type de liste
            </label>
            <select
              value={safeBlock.data.list_type || 'unordered'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, list_type: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="unordered">Non ordonnée (puces)</option>
              <option value="ordered">Ordonnée (numéros)</option>
              <option value="none">Aucun style</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Éléments (un par ligne)
            </label>
            <textarea
              value={listItems.join('\n')}
              onChange={(e) => {
                const newItems = e.target.value.split('\n').filter(item => item.trim())
                onUpdate({ data: { ...block.data, items: newItems } })
              }}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Item 1&#10;Item 2&#10;Item 3"
              rows={6}
            />
          </div>
        </div>
      )

    case 'link':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte du lien
            </label>
            <input
              type="text"
              value={safeBlock.data.text || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, text: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Texte du lien"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL ou Page
            </label>
            <div className="space-y-2">
              <PageSelector
                value={safeBlock.data.url || ''}
                onChange={(url) => onUpdate({ data: { ...block.data, url } })}
                placeholder="Sélectionner une page..."
                className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Ou saisir une URL personnalisée ci-dessus
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ouvrir dans
            </label>
            <select
              value={safeBlock.data.target || '_self'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, target: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="_self">Même onglet</option>
              <option value="_blank">Nouvel onglet</option>
              <option value="_parent">Page parente</option>
              <option value="_top">Page principale</option>
            </select>
          </div>
        </div>
      )

    case 'rich-text':
      return <RichTextEditorConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'markdown':
      return <MarkdownEditorConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'html-raw':
      return <HtmlRawConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'icon':
      return <IconConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'label':
      return <LabelConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'tooltip':
      return <TooltipConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'popover':
      return <PopoverConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'dropdown':
      return <DropdownConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'categories':
      return <CategoriesConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'author-box':
      return <AuthorBoxConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'related-posts':
      return <RelatedPostsConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'table-of-contents':
      return <TableOfContentsConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'reading-time':
      return <ReadingTimeConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'share-buttons':
      return <ShareButtonsConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'flexbox':
      return <FlexboxConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'grid':
      return <GridConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'stack':
      return <StackConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'inline':
      return <InlineConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'group':
      return <GroupConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'wrapper':
      return <WrapperConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'image-slider':
      return <ImageSliderConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'lightbox':
      return <LightboxConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'vimeo-embed':
      return <VimeoEmbedConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'counter':
      return <CounterConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'card-grid':
      return <CardGridConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'logo-carousel':
      return <LogoCarouselConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'route-calculator':
      return <RouteCalculatorConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'fare-calculator':
      return <FareCalculatorConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'availability-calendar':
      return <AvailabilityCalendarConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'captcha':
      return <CaptchaConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-multi-step':
      return <FormMultiStepConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-conditional':
      return <FormConditionalConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-calculator':
      return <FormCalculatorConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-file-upload':
      return <FormFileUploadConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-payment':
      return <FormPaymentConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-quiz':
      return <FormQuizConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-survey':
      return <FormSurveyConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-poll':
      return <FormPollConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-rsvp':
      return <FormRSVPConfig block={safeBlock} onUpdate={onUpdate} />

    // Blocs VTC
    case 'driver-profile':
      return <DriverProfileConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'email-button':
      return <EmailButtonConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'sms-button':
      return <SMSButtonConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'vehicle-comparison':
      return <VehicleComparisonConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'service-packages':
      return <ServicePackagesConfig block={safeBlock} onUpdate={onUpdate} />
    
    // Blocs E-commerce
    case 'product-gallery':
      return <ProductGalleryConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'product-details':
      return <ProductDetailsConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'add-to-cart':
      return <AddToCartConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'buy-now':
      return <BuyNowConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'trust-badges':
      return <TrustBadgesConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'payment-methods':
      return <PaymentMethodsConfig block={safeBlock} onUpdate={onUpdate} />

    default:
      return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Bloc {block.type}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Configuration à venir</p>
          {blockType?.description && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{blockType.description}</p>
          )}
            </div>
          </div>
        </div>
      )
  }
}

// Block Layout Panel (Alignement et Grille)
function BlockLayoutPanel({
  block,
  onUpdate,
  allBlocks = [],
}: {
  block: Block
  onUpdate: (updates: Partial<Block>) => void
  allBlocks?: Block[]
}) {
  // S'assurer que block.data existe pour éviter les erreurs
  const safeBlock = { ...block, data: block.data || {} }
  
  return (
    <div className="space-y-4 min-h-0">
      {/* Configuration spécifique pour les conteneurs flex et grille */}
      {(block.type === 'grid-container' || block.type === 'flex-container' || block.type === 'columns') && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-3 uppercase tracking-wider">
            {block.type === 'grid-container' && 'Configuration de la grille'}
            {block.type === 'flex-container' && 'Configuration Flexbox'}
            {block.type === 'columns' && 'Configuration Colonnes'}
          </h4>
          <div className="space-y-3">
            {block.type === 'grid-container' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Colonnes (grid-template-columns)
                  </label>
                  <input
                    type="text"
                    value={safeBlock.data?.columns || 'repeat(3, 1fr)'}
                    onChange={(e) => onUpdate({ data: { ...safeBlock.data, columns: e.target.value } })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="repeat(3, 1fr)"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Exemples: repeat(3, 1fr), 1fr 2fr 1fr, auto auto, 200px 1fr
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Lignes (grid-template-rows)
                  </label>
                  <input
                    type="text"
                    value={safeBlock.data?.rows || 'auto'}
                    onChange={(e) => onUpdate({ data: { ...safeBlock.data, rows: e.target.value } })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="auto ou repeat(2, 1fr)"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Exemples: auto, repeat(2, 1fr), 100px 200px, minmax(100px, auto)
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Espacement (gap)
                  </label>
                  <input
                    type="text"
                    value={safeBlock.data?.gap || '1rem'}
                    onChange={(e) => onUpdate({ data: { ...safeBlock.data, gap: e.target.value } })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1rem"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Exemples: 1rem, 20px, 1rem 2rem (row-gap column-gap)
                  </p>
                </div>
              </>
            )}
            {block.type === 'flex-container' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Direction
                  </label>
                  <select
                    value={safeBlock.data?.direction || 'row'}
                    onChange={(e) => onUpdate({ data: { ...safeBlock.data, direction: e.target.value } })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="row">Horizontal (row)</option>
                    <option value="column">Vertical (column)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Wrap
                  </label>
                  <select
                    value={safeBlock.data?.wrap || 'nowrap'}
                    onChange={(e) => onUpdate({ data: { ...safeBlock.data, wrap: e.target.value } })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="nowrap">Pas de retour à la ligne</option>
                    <option value="wrap">Retour à la ligne</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Espacement (gap)
                  </label>
                  <input
                    type="text"
                    value={safeBlock.data?.gap || '1rem'}
                    onChange={(e) => onUpdate({ data: { ...safeBlock.data, gap: e.target.value } })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1rem"
                  />
                </div>
              </>
            )}
            {block.type === 'columns' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre de colonnes
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={safeBlock.data?.columns_count || 2}
                    onChange={(e) => onUpdate({ data: { ...safeBlock.data, columns_count: parseInt(e.target.value) || 2 } })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Espacement (gap)
                  </label>
                  <input
                    type="text"
                    value={block.styles?.gap || block.data?.gap || '1rem'}
                    onChange={(e) => onUpdate({ 
                      styles: { ...block.styles, gap: e.target.value },
                      data: { ...block.data, gap: e.target.value }
                    })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1rem"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Configuration Layout (Largeur, Conteneur, Z-index) */}
      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Mise en page du conteneur</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Largeur (colonnes sur 12)
            </label>
            <select
              value={block?.layout || 12}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                onUpdate({ layout: parseInt(e.target.value) as Block['layout'] })
              }}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={12}>12/12 (Pleine largeur)</option>
              <option value={11}>11/12</option>
              <option value={10}>10/12</option>
              <option value={9}>9/12 (3/4)</option>
              <option value={8}>8/12 (2/3)</option>
              <option value={7}>7/12</option>
              <option value={6}>6/12 (1/2)</option>
              <option value={5}>5/12</option>
              <option value={4}>4/12 (1/3)</option>
              <option value={3}>3/12 (1/4)</option>
              <option value={2}>2/12 (1/6)</option>
              <option value={1}>1/12</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Conteneur
            </label>
            <select
              value={block?.container || 'container'}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                onUpdate({ container: e.target.value as Block['container'] })
              }}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="container">Conteneur</option>
              <option value="container-fluid">Fluide</option>
              <option value="none">Aucun</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Z-index
            </label>
            <input
              type="number"
              value={block?.styles?.z_index || 0}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onUpdate({
                  styles: {
                    ...block.styles,
                    z_index: parseInt(e.target.value) || 0,
                  },
                })
              }}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hauteur
            </label>
            <input
              type="text"
              value={block?.height || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onUpdate({ height: e.target.value })
              }}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="auto, 100px, 50vh, 100%"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Exemples: auto, 100px, 50vh, 100%, min-height(200px)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hauteur min
              </label>
              <input
                type="text"
                value={block?.minHeight || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  onUpdate({ minHeight: e.target.value })
                }}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0px"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hauteur max
              </label>
              <input
                type="text"
                value={block?.maxHeight || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  onUpdate({ maxHeight: e.target.value })
                }}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Position et Alignement */}
      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Position et Alignement</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type de position
            </label>
            <select
              value={block?.position?.type || 'static'}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                onUpdate({
                  position: {
                    ...block.position,
                    type: e.target.value as 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky',
                  },
                })
              }}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="static">Statique</option>
              <option value="relative">Relative</option>
              <option value="absolute">Absolue</option>
              <option value="fixed">Fixe</option>
              <option value="sticky">Collant</option>
            </select>
          </div>
          {block?.position?.type !== 'static' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Top
                  </label>
                  <input
                    type="text"
                    value={block?.position?.top || ''}
                    onChange={(e) => {
                      onUpdate({
                        position: {
                          ...block.position,
                          top: e.target.value,
                        },
                      })
                    }}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="0px"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Right
                  </label>
                  <input
                    type="text"
                    value={block?.position?.right || ''}
                    onChange={(e) => {
                      onUpdate({
                        position: {
                          ...block.position,
                          right: e.target.value,
                        },
                      })
                    }}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="0px"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bottom
                  </label>
                  <input
                    type="text"
                    value={block?.position?.bottom || ''}
                    onChange={(e) => {
                      onUpdate({
                        position: {
                          ...block.position,
                          bottom: e.target.value,
                        },
                      })
                    }}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="0px"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Left
                  </label>
                  <input
                    type="text"
                    value={block?.position?.left || ''}
                    onChange={(e) => {
                      onUpdate({
                        position: {
                          ...block.position,
                          left: e.target.value,
                        },
                      })
                    }}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    placeholder="0px"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Block Style Panel (Peinture/Styling)
function BlockStylePanel({
  block,
  onUpdate,
  allBlocks = [],
  blockTypes = [],
}: {
  block: Block
  onUpdate: (updates: Partial<Block>) => void
  allBlocks?: Block[]
  blockTypes?: BlockType[]
}) {
  const updateStyle = (key: string, value: any) => {
    const newStyles = { ...block.styles }
    
    // Si on met à jour background_color, supprimer background si c'est un gradient
    if (key === 'background_color' || key === 'backgroundColor') {
      if (newStyles.background && newStyles.background.includes('gradient')) {
        delete newStyles.background
      }
      // Mettre à jour les deux propriétés pour compatibilité
      newStyles.background_color = value
      newStyles.backgroundColor = value
    } else {
      newStyles[key] = value
    }
    
    onUpdate({
      styles: newStyles,
    })
  }

  const commonColors = [
    { name: 'Blanc', value: '#ffffff', class: 'bg-white' },
    { name: 'Noir', value: '#000000', class: 'bg-black' },
    { name: 'Gris clair', value: '#f3f4f6', class: 'bg-gray-100' },
    { name: 'Gris', value: '#6b7280', class: 'bg-gray-500' },
    { name: 'Gris foncé', value: '#1f2937', class: 'bg-gray-800' },
    { name: 'Bleu', value: '#3b82f6', class: 'bg-blue-500' },
    { name: 'Bleu foncé', value: '#1e40af', class: 'bg-blue-800' },
    { name: 'Vert', value: '#10b981', class: 'bg-green-500' },
    { name: 'Rouge', value: '#ef4444', class: 'bg-red-500' },
    { name: 'Jaune', value: '#f59e0b', class: 'bg-yellow-500' },
    { name: 'Violet', value: '#8b5cf6', class: 'bg-purple-500' },
    { name: 'Rose', value: '#ec4899', class: 'bg-pink-500' },
  ]

  return (
    <div className="space-y-2.5 pb-4">
      {/* Couleur de fond */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Couleur de fond
        </label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="color"
            value={block.styles?.background_color || '#ffffff'}
            onChange={(e) => updateStyle('background_color', e.target.value)}
            className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
          />
          <input
            type="text"
            value={block.styles?.background_color || '#ffffff'}
            onChange={(e) => updateStyle('background_color', e.target.value)}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="#ffffff"
          />
        </div>
        <div className="grid grid-cols-6 gap-1">
          {commonColors.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => updateStyle('background_color', color.value)}
              className={`w-full h-8 rounded border-2 ${
                block.styles?.background_color === color.value
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-300 dark:border-gray-600'
              } ${color.class}`}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Couleur de texte */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Couleur de texte
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={block.styles?.color || '#000000'}
            onChange={(e) => updateStyle('color', e.target.value)}
            className="w-12 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
          />
          <input
            type="text"
            value={block.styles?.color || '#000000'}
            onChange={(e) => updateStyle('color', e.target.value)}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Propriétés avancées - Premium */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Propriétés avancées</span>
          <span className="px-2 py-0.5 text-[10px] font-bold text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 rounded">PREMIUM</span>
        </div>
        
        {/* Z-index */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Z-index (superposition)
          </label>
          <input
            type="number"
            value={block.styles?.z_index || 0}
            onChange={(e) => updateStyle('z_index', parseInt(e.target.value) || 0)}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="0"
          />
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
            Contrôle la superposition des éléments (plus élevé = au-dessus)
          </p>
        </div>

        {/* Position */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type de position
          </label>
          <select
            value={block.position?.type || block.styles?.position || 'static'}
            onChange={(e) => {
              const positionType = e.target.value
              onUpdate({
                position: {
                  ...block.position,
                  type: positionType as 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
                },
                styles: {
                  ...block.styles,
                  position: positionType
                }
              })
            }}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="static">Statique (dans le flux)</option>
            <option value="relative">Relative (par rapport au flux)</option>
            <option value="absolute">Absolue (par rapport au parent)</option>
            <option value="fixed">Fixe (par rapport à la fenêtre)</option>
            <option value="sticky">Sticky (collant au scroll)</option>
          </select>
        </div>

        {/* Alignement */}
        {(block.position?.type === 'relative' || block.position?.type === 'absolute' || block.styles?.position === 'relative' || block.styles?.position === 'absolute') && (
          <>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Alignement horizontal
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { value: 'left', icon: '←', label: 'Gauche' },
                  { value: 'center', icon: '↔', label: 'Centre' },
                  { value: 'right', icon: '→', label: 'Droite' },
                  { value: 'stretch', icon: '↔', label: 'Étirer' }
                ].map((align) => (
                  <button
                    key={align.value}
                    type="button"
                    onClick={() => onUpdate({
                      position: {
                        type: block.position?.type || 'static',
                        ...block.position,
                        align: align.value as 'left' | 'center' | 'right' | 'stretch'
                      }
                    })}
                    className={`px-2 py-1.5 text-xs rounded border transition-all ${
                      (block.position?.align || 'left') === align.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                    }`}
                    title={align.label}
                  >
                    <span className="text-sm">{align.icon}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Coordonnées pour position absolute */}
            {block.position?.type === 'absolute' && (
              <div className="mb-3 space-y-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Position (px ou %)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Top</label>
                    <input
                      type="text"
                      value={block.position?.top || ''}
                      onChange={(e) => onUpdate({
                        position: {
                          type: block.position?.type || 'absolute',
                          ...block.position,
                          top: e.target.value
                        },
                        styles: {
                          ...block.styles,
                          top: e.target.value
                        }
                      })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="0px"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Right</label>
                    <input
                      type="text"
                      value={block.position?.right || ''}
                      onChange={(e) => onUpdate({
                        position: {
                          type: block.position?.type || 'absolute',
                          ...block.position,
                          right: e.target.value
                        },
                        styles: {
                          ...block.styles,
                          right: e.target.value
                        }
                      })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="0px"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Bottom</label>
                    <input
                      type="text"
                      value={block.position?.bottom || ''}
                      onChange={(e) => onUpdate({
                        position: {
                          type: block.position?.type || 'absolute',
                          ...block.position,
                          bottom: e.target.value
                        },
                        styles: {
                          ...block.styles,
                          bottom: e.target.value
                        }
                      })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="0px"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Left</label>
                    <input
                      type="text"
                      value={block.position?.left || ''}
                      onChange={(e) => onUpdate({
                        position: {
                          type: block.position?.type || 'absolute',
                          ...block.position,
                          left: e.target.value
                        },
                        styles: {
                          ...block.styles,
                          left: e.target.value
                        }
                      })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="0px"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bloc de référence pour position relative */}
            {block.position?.type === 'relative' && (
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Aligner par rapport à un autre bloc (optionnel)
                </label>
                <select
                  value={block.position?.alignTo || ''}
                  onChange={(e) => onUpdate({
                    position: {
                      type: block.position?.type || 'relative',
                      ...block.position,
                      alignTo: e.target.value || undefined
                    }
                  })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Aucun (alignement normal)</option>
                  {/* Les options seront remplies dynamiquement avec les autres blocs */}
                </select>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  Choisissez un bloc pour aligner celui-ci par rapport à lui
                </p>
              </div>
            )}
          </>
        )}

        {/* Overflow */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Overflow (débordement)
          </label>
          <select
            value={block.styles?.overflow || 'visible'}
            onChange={(e) => updateStyle('overflow', e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="visible">Visible</option>
            <option value="hidden">Caché</option>
            <option value="scroll">Défilement</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        {/* Opacité */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Opacité (0-1)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={block.styles?.opacity || 1}
            onChange={(e) => updateStyle('opacity', parseFloat(e.target.value) || 1)}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Transform */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rotation (degrés)
          </label>
          <input
            type="number"
            value={block.styles?.transform_rotate || 0}
            onChange={(e) => {
              const rotate = parseInt(e.target.value) || 0
              updateStyle('transform', `rotate(${rotate}deg)`)
              updateStyle('transform_rotate', rotate)
            }}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="0"
          />
        </div>
      </div>

      {/* Padding */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Espacement interne (Padding)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Vertical</label>
            <input
              type="text"
              value={block.styles?.padding_vertical || ''}
              onChange={(e) => updateStyle('padding_vertical', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="1rem"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Horizontal</label>
            <input
              type="text"
              value={block.styles?.padding_horizontal || ''}
              onChange={(e) => updateStyle('padding_horizontal', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="1rem"
            />
          </div>
        </div>
        <div className="mt-2 flex gap-1">
          {['0', '0.5rem', '1rem', '2rem', '3rem', '4rem'].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => {
                updateStyle('padding_vertical', val)
                updateStyle('padding_horizontal', val)
              }}
              className={`flex-1 px-2 py-1 text-[10px] rounded border ${
                block.styles?.padding_vertical === val && block.styles?.padding_horizontal === val
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Margin */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Espacement externe (Margin)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Vertical</label>
            <input
              type="text"
              value={block.styles?.margin_vertical || ''}
              onChange={(e) => updateStyle('margin_vertical', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Horizontal</label>
            <input
              type="text"
              value={block.styles?.margin_horizontal || ''}
              onChange={(e) => updateStyle('margin_horizontal', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Bordures */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Bordures
        </label>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Largeur</label>
              <select
                value={block.styles?.border_width || '0'}
                onChange={(e) => updateStyle('border_width', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="0">Aucune</option>
                <option value="1px">1px</option>
                <option value="2px">2px</option>
                <option value="4px">4px</option>
                <option value="8px">8px</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Style</label>
              <select
                value={block.styles?.border_style || 'solid'}
                onChange={(e) => updateStyle('border_style', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="solid">Solide</option>
                <option value="dashed">Tirets</option>
                <option value="dotted">Pointillés</option>
                <option value="double">Double</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Couleur</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={block.styles?.border_color || '#e5e7eb'}
                onChange={(e) => updateStyle('border_color', e.target.value)}
                className="w-10 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={block.styles?.border_color || '#e5e7eb'}
                onChange={(e) => updateStyle('border_color', e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="#e5e7eb"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 block">Rayon (Border radius)</label>
            <select
              value={block.styles?.border_radius || '0'}
              onChange={(e) => updateStyle('border_radius', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="0">Aucun</option>
              <option value="0.25rem">Petit (0.25rem)</option>
              <option value="0.5rem">Moyen (0.5rem)</option>
              <option value="1rem">Grand (1rem)</option>
              <option value="1.5rem">Très grand (1.5rem)</option>
              <option value="9999px">Rond</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ombres */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Ombres
        </label>
        <select
          value={block.styles?.box_shadow || 'none'}
          onChange={(e) => updateStyle('box_shadow', e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="none">Aucune</option>
          <option value="sm">Petite (sm)</option>
          <option value="md">Moyenne (md)</option>
          <option value="lg">Grande (lg)</option>
          <option value="xl">Très grande (xl)</option>
          <option value="2xl">Énorme (2xl)</option>
        </select>
      </div>

      {/* Alignement du texte */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Alignement du texte
        </label>
        <div className="flex gap-1">
          {[
            { value: 'left', icon: '⬅️', label: 'Gauche' },
            { value: 'center', icon: '↔️', label: 'Centre' },
            { value: 'right', icon: '➡️', label: 'Droite' },
            { value: 'justify', icon: '↔️', label: 'Justifié' },
          ].map((align) => (
            <button
              key={align.value}
              type="button"
              onClick={() => updateStyle('text_align', align.value)}
              className={`flex-1 px-2 py-2 text-xs rounded border ${
                block.styles?.text_align === align.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
              title={align.label}
            >
              {align.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Block Properties Panel
function BlockPropertiesPanel({
  block,
  blockType,
  onUpdate,
}: {
  block: Block
  blockType?: BlockType
  onUpdate: (updates: Partial<Block>) => void
}) {
  // S'assurer que block.data existe pour éviter les erreurs
  const safeBlock = { ...block, data: block.data || {} }
  
  if (!blockType) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">Type de bloc non trouvé</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
        <div className="text-sm text-gray-900 dark:text-gray-100">{blockType.label}</div>
      </div>

      {/* Render properties based on block schema */}
      {blockType.schema && Object.keys(blockType.schema).length > 0 && (
        <div className="space-y-3">
          {Object.entries(blockType.schema).map(([key, schema]) => {
            const schemaObj = schema as any
            return (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {schemaObj.label || key}
              </label>
                {schemaObj.type === 'text' && (
                <input
                  type="text"
                  value={safeBlock.data[key] || ''}
                  onChange={(e) =>
                    onUpdate({
                      data: { ...block.data, [key]: e.target.value },
                    })
                  }
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
                {schemaObj.type === 'textarea' && (
                <textarea
                  value={safeBlock.data[key] || ''}
                  onChange={(e) =>
                    onUpdate({
                      data: { ...block.data, [key]: e.target.value },
                    })
                  }
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              )}
                {schemaObj.type === 'number' && (
                <input
                  type="number"
                  value={safeBlock.data[key] || ''}
                  onChange={(e) =>
                    onUpdate({
                      data: { ...block.data, [key]: parseFloat(e.target.value) || 0 },
                    })
                  }
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
                {(schemaObj.type === 'url' || 
                  (schemaObj.type === 'text' && (key.toLowerCase().includes('url') || key.toLowerCase().includes('link') || key.toLowerCase().includes('href')))) && (
                  <UrlInputWithSuggestions
                    value={safeBlock.data[key] || ''}
                    onChange={(url) =>
                      onUpdate({
                        data: { ...block.data, [key]: url },
                      })
                    }
                    placeholder={schemaObj.placeholder || 'URL ou sélectionner une page...'}
                    className="text-sm"
                />
              )}
            </div>
          )
          })}
        </div>
      )}
    </div>
  )
}

