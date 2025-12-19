'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams, usePathname, useSearchParams } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/admin/AdminLayout'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import BlockEditor from '@/components/editor/BlockEditor'
import { Block } from '@/components/editor/types'
import BlockPreview from '@/components/editor/BlockPreview'
import BlocksPalettePopup from '@/components/editor/BlocksPalettePopup'
import BlockPropertiesModal from '@/components/editor/BlockPropertiesModal'
import BlockContextMenu from '@/components/editor/BlockContextMenu'
import blocksService, { BlockType } from '@/services/blocks.service'
import PageLoader from '@/components/shared/PageLoader'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useReconnect } from '@/contexts/ReconnectContext'
import { restoreEditorStateAfterReconnect } from '@/hooks/useEditorStatePersistence'
import { useConfirm } from '@/hooks/useConfirm'
import { useTheme } from '@/contexts/ThemeContext'
import SubscriptionInfo from '@/components/editor/SubscriptionInfo'
import { findBlockInTree, duplicateBlockInTree, removeBlockFromTree } from '@/lib/block-utils'
import billingService from '@/services/billing.service'
import projectService from '@/services/project.service'

const PAGE_TITLES: Record<string, string> = {
  home: 'Page d\'accueil',
  docs: 'Documentation',
  contact: 'Contact',
  faq: 'FAQ',
  'legal/terms': 'Conditions Générales de Vente',
  'legal/privacy': 'Politique de Confidentialité',
}

export default function EditPublicPage() {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { saveEditorState } = useReconnect()
  const { confirm, ConfirmDialog } = useConfirm()
  // Handle catch-all route: slug can be a string or array of strings
  const slugParam = params?.slug
  const pageSlug = Array.isArray(slugParam) ? slugParam.join('/') : (slugParam as string || '')
  const projectId = searchParams?.get('projectId')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [blockTypes, setBlockTypes] = useState<BlockType[]>([])
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [showPreview, setShowPreview] = useState(true)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const { resolvedTheme } = useTheme()
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>(resolvedTheme || 'light') // Thème de la prévisualisation, synchronisé avec le thème global
  const [availablePages, setAvailablePages] = useState<Array<{ slug: string; title: string; isSubPage?: boolean; parentSlug?: string }>>([])
  const [currentPageSubPages, setCurrentPageSubPages] = useState<Array<{ slug: string; title: string }>>([])
  const [headerVisible, setHeaderVisible] = useState(true)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [inspectorMode, setInspectorMode] = useState(false)
  const [blocksPaletteOpen, setBlocksPaletteOpen] = useState(false) // Popup des blocs disponibles fermée par défaut
  const [propertiesModalOpen, setPropertiesModalOpen] = useState(false)
  const [modalBlockId, setModalBlockId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ blockId: string; position: { x: number; y: number } } | null>(null)
  const [copiedBlock, setCopiedBlock] = useState<Block | null>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [showSeoExpanded, setShowSeoExpanded] = useState(false) // État pour afficher/masquer les paramètres SEO
  const [showMoreMenu, setShowMoreMenu] = useState(false) // État pour le menu "Plus d'options"
  const [subscription, setSubscription] = useState<any>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)
  const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('palette-collapsed')
      return saved === 'true'
    }
    return false
  }) // État de la palette (réduite ou non)
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-width')
      if (saved) return parseInt(saved, 10)
    }
    return 300 // Largeur par défaut de la sidebar
  })
  const [isResizingSidebar, setIsResizingSidebar] = useState(false)
  
  // État pour le redimensionnement des panneaux
  const [editorWidth, setEditorWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('editor-panel-width')
      return saved ? parseFloat(saved) : 33.33 // 1/3 par défaut
    }
    return 33.33
  })
  const [isResizing, setIsResizing] = useState(false)

  // Fonction de sauvegarde (mémorisée pour éviter les re-renders)
  const handleSave = useCallback(async (data: { blocks: Block[]; metaTitle: string; metaDescription: string; status: 'draft' | 'published' }) => {
    const settingsData: any = {}
    
    if (pageSlug === 'home') {
      // Sauvegarder les blocs en mode brouillon
      // Ne pas modifier le statut publié sauf si l'utilisateur clique explicitement sur "Publier"
      settingsData.public_homepage_blocks = data.blocks
      // Ne sauvegarder le statut que s'il est explicitement changé à 'published'
      // Sinon, garder 'draft' pour ne pas affecter la page publiée
      if (data.status === 'published') {
        settingsData.public_homepage_status = 'published'
      } else {
        // En mode brouillon, sauvegarder les blocs mais ne pas changer le statut publié
        // Cela permet de modifier sans affecter la page publique
        settingsData.public_homepage_status = 'draft'
      }
      settingsData.public_homepage_meta_title = data.metaTitle
      settingsData.public_homepage_meta_description = data.metaDescription
    } else {
      const currentSettings = await api.get('/system-settings/')
      const publicPages = currentSettings.data.public_pages || {}
      
      publicPages[pageSlug] = {
        ...publicPages[pageSlug],
        title: PAGE_TITLES[pageSlug] || pageSlug,
        blocks: data.blocks,
        meta_title: data.metaTitle,
        meta_description: data.metaDescription,
        is_active: publicPages[pageSlug]?.is_active !== false,
      }
      
      settingsData.public_pages = publicPages
    }
    
    await api.patch('/system-settings/', settingsData)
  }, [pageSlug])

  // Sauvegarde automatique
  const { isSaving: isAutoSaving, lastSaved, updateLastSaved } = useAutoSave({
    data: { blocks, metaTitle, metaDescription, status },
    onSave: handleSave,
    debounceMs: 2000,
    enabled: true,
  })

  // Sauvegarde manuelle (définie avant le useEffect qui l'utilise)
  const handleManualSave = useCallback(async () => {
    setSaving(true)
    try {
      await handleSave({ blocks, metaTitle, metaDescription, status })
      // Mettre à jour le timestamp de dernière sauvegarde
      updateLastSaved()
      toast.success('Page sauvegardée avec succès !')
    } catch (error: any) {
      console.error('Error sauvegarde:', error)
      toast.error(error.response?.data?.error || 'Error lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }, [blocks, metaTitle, metaDescription, status, handleSave, updateLastSaved])

  // Raccourci clavier Ctrl+S pour sauvegarder
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (!saving) {
          handleManualSave()
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleManualSave, saving])

  // Points d'ancrage (snap points) pour le redimensionnement
  // Inclut: 1/4, 1/3, 2/5, 1/2, 3/5, 2/3, 3/4
  const SNAP_POINTS = [25, 33.33, 40, 50, 60, 66.67, 75] // Pourcentages
  const SNAP_THRESHOLD = 5 // Distance en % pour déclencher le snap (augmenté pour plus de facilité)
  const [snappedPoint, setSnappedPoint] = useState<number | null>(null) // Point actuellement aimanté

  // Fonction pour trouver le point d'ancrage le plus proche
  const findNearestSnapPoint = useCallback((width: number): { point: number | null; distance: number } => {
    let nearestPoint: number | null = null
    let minDistance = Infinity

    for (const snapPoint of SNAP_POINTS) {
      const distance = Math.abs(width - snapPoint)
      if (distance < SNAP_THRESHOLD && distance < minDistance) {
        minDistance = distance
        nearestPoint = snapPoint
      }
    }

    return { point: nearestPoint, distance: minDistance }
  }, [])

  // Gestion du redimensionnement des panneaux avec snap
  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      
      const container = document.querySelector('.flex-1.flex.overflow-hidden.min-h-0')
      if (!container) return
      
      const containerRect = container.getBoundingClientRect()
      let newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
      
      // Limiter entre 20% et 80%
      newWidth = Math.max(20, Math.min(80, newWidth))
      
      // Vérifier si on est proche d'un point d'ancrage (aimantation)
      const { point: snapPoint, distance } = findNearestSnapPoint(newWidth)
      if (snapPoint !== null) {
        // Aimantation active : forcer le snap
        newWidth = snapPoint
        setSnappedPoint(snapPoint)
      } else {
        // Pas de snap, réinitialiser l'indicateur
        setSnappedPoint(null)
      }
      
      setEditorWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      
      // Vérifier le snap final au relâchement
      const { point: finalSnapPoint } = findNearestSnapPoint(editorWidth)
      if (finalSnapPoint !== null) {
        setEditorWidth(finalSnapPoint)
        setSnappedPoint(finalSnapPoint)
      } else {
        setSnappedPoint(null)
      }
      
      // Sauvegarder dans localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('editor-panel-width', editorWidth.toString())
      }
      
      // Réinitialiser l'indicateur après un court délai
      setTimeout(() => setSnappedPoint(null), 300)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, editorWidth, findNearestSnapPoint])

  // Raccourcis clavier pour navigation entre blocs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si on est dans un input, textarea, ou select
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable) {
        return
      }

      // Escape : désélectionner le bloc
      if (e.key === 'Escape') {
        setSelectedBlockId(null)
        setPropertiesModalOpen(false)
        setContextMenu(null)
      }

      // Flèches haut/bas : naviguer entre les blocs
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        const flatBlocks: Block[] = []
        const flattenBlocks = (blocs: Block[]) => {
          blocs.forEach(block => {
            flatBlocks.push(block)
            if (block.children && block.children.length > 0) {
              flattenBlocks(block.children)
            }
          })
        }
        flattenBlocks(blocks)

        if (flatBlocks.length === 0) return

        const currentIndex = selectedBlockId 
          ? flatBlocks.findIndex(b => b.id === selectedBlockId)
          : -1

        let newIndex: number
        if (e.key === 'ArrowUp') {
          newIndex = currentIndex > 0 ? currentIndex - 1 : flatBlocks.length - 1
        } else {
          newIndex = currentIndex < flatBlocks.length - 1 ? currentIndex + 1 : 0
        }

        setSelectedBlockId(flatBlocks[newIndex].id)
      }

      // Ctrl/Cmd + S : sauvegarder manuellement
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleManualSave()
      }

      // Ctrl/Cmd + Z : undo (géré par BlockEditor)
      // Ctrl/Cmd + Shift + Z : redo (géré par BlockEditor)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [blocks, selectedBlockId, handleManualSave])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Check if this is a new page
      const isNew = searchParams?.get('new') === 'true'
      const newTitle = searchParams?.get('title') || ''
      
      // Load block types and page data in parallel
      const [blockTypesData, settingsResponse] = await Promise.all([
        blocksService.getBlockTypes(),
        api.get('/system-settings/')
      ])
      
      console.log('📦 Blocs chargés:', {
        count: blockTypesData?.length || 0,
        blockTypes: blockTypesData,
        isArray: Array.isArray(blockTypesData)
      })
      
      // S'assurer que blockTypesData est un tableau
      const validBlockTypes = Array.isArray(blockTypesData) ? blockTypesData : (blockTypesData?.results || [])
      setBlockTypes(validBlockTypes)
      
      console.log('✅ Blocs définis dans le state:', {
        count: validBlockTypes.length,
        blockTypes: validBlockTypes
      })
      const data = settingsResponse.data
      
      // Load available pages for navigation - Si projectId est présent, charger les pages du projet
      const pagesList: Array<{ slug: string; title: string; isSubPage?: boolean; parentSlug?: string }> = []
      const subPagesMap = new Map<string, Array<{ slug: string; title: string }>>()
      
      if (projectId) {
        // Charger les pages du projet depuis l'API
        try {
          const project = await projectService.getById(projectId)
          if (project && project.pages) {
            // Organiser les pages par hiérarchie
            const projectPages = project.pages.filter((p: any) => p.page_type === 'public')
            
            // Trier par slug pour avoir un ordre cohérent
            projectPages.sort((a: any, b: any) => a.page_slug.localeCompare(b.page_slug))
            
            // Séparer les pages principales et sous-pages
            const mainPages = projectPages.filter((p: any) => !p.page_slug.includes('/'))
            const subPages = projectPages.filter((p: any) => p.page_slug.includes('/'))
            
            // Ajouter les pages principales
            mainPages.forEach((page: any) => {
              const pageData = data.public_pages?.[page.page_slug] || {}
              const title = pageData.title || PAGE_TITLES[page.page_slug] || page.page_slug.charAt(0).toUpperCase() + page.page_slug.slice(1)
              pagesList.push({ slug: page.page_slug, title })
            })
            
            // Ajouter les sous-pages
            subPages.forEach((page: any) => {
              const pageData = data.public_pages?.[page.page_slug] || {}
              const title = pageData.title || page.page_slug.split('/').pop() || page.page_slug
              const parentSlug = page.page_slug.split('/')[0]
              
              if (!subPagesMap.has(parentSlug)) {
                subPagesMap.set(parentSlug, [])
              }
              subPagesMap.get(parentSlug)!.push({ slug: page.page_slug, title })
            })
          }
        } catch (error) {
          console.warn('Error loading project pages:', error)
          // Fallback vers le chargement depuis system-settings
        }
      }
      
      // Si aucune page n'a été chargée depuis le projet, charger depuis system-settings
      if (pagesList.length === 0) {
        // Page d'accueil
        if (data.public_homepage_blocks !== undefined) {
          pagesList.push({ slug: 'home', title: 'Page d\'accueil' })
        }
        
        // Autres pages
        const otherPages = data.public_pages || {}
        Object.entries(otherPages).forEach(([slug, pageData]: [string, any]) => {
          const slugParts = slug.split('/')
          const title = pageData.title || PAGE_TITLES[slug] || slug.charAt(0).toUpperCase() + slug.slice(1)
          
          if (slugParts.length === 1) {
            // Page principale
            pagesList.push({ slug, title })
          } else {
            // Sous-page
            const parentSlug = slugParts[0]
            if (!subPagesMap.has(parentSlug)) {
              subPagesMap.set(parentSlug, [])
            }
            subPagesMap.get(parentSlug)!.push({ slug, title })
          }
        })
      } else {
        // Si on a chargé depuis le projet, s'assurer que la page d'accueil est incluse si elle existe
        const hasHome = pagesList.some(p => p.slug === 'home')
        if (!hasHome && data.public_homepage_blocks !== undefined) {
          pagesList.unshift({ slug: 'home', title: 'Page d\'accueil' })
        }
      }
      
      // Trier les pages principales par ordre
      pagesList.sort((a, b) => {
        // Home en premier
        if (a.slug === 'home') return -1
        if (b.slug === 'home') return 1
        return a.slug.localeCompare(b.slug)
      })
      
      // Ajouter les sous-pages après leurs pages parentes
      const finalPagesList: Array<{ slug: string; title: string; isSubPage?: boolean; parentSlug?: string }> = []
      pagesList.forEach(page => {
        finalPagesList.push(page)
        // Ajouter les sous-pages de cette page
        const subPages = subPagesMap.get(page.slug) || []
        subPages.forEach(subPage => {
          finalPagesList.push({
            ...subPage,
            isSubPage: true,
            parentSlug: page.slug
          })
        })
      })
      
      // Vérifier que la page actuelle est bien dans la liste
      // Si ce n'est pas le cas (par exemple après création), l'ajouter
      const currentPageExists = finalPagesList.some(p => p.slug === pageSlug)
      if (!currentPageExists && pageSlug !== 'home') {
        const publicPages = data.public_pages || {}
        if (publicPages[pageSlug]) {
          const pageData = publicPages[pageSlug]
          const title = pageData.title || PAGE_TITLES[pageSlug] || pageSlug.charAt(0).toUpperCase() + pageSlug.slice(1)
          finalPagesList.push({
            slug: pageSlug,
            title: title,
            isSubPage: false,
          })
        }
      }
      
      setAvailablePages(finalPagesList)
      
      // Trouver les sous-pages de la page actuelle
      const subPages = finalPagesList.filter(p => p.isSubPage && p.parentSlug === pageSlug)
      setCurrentPageSubPages(subPages)
      
      // If this is a new page, initialize it
      if (isNew && pageSlug !== 'home') {
        const publicPages = data.public_pages || {}
        if (!publicPages[pageSlug]) {
          // Create new page entry
          publicPages[pageSlug] = {
            title: newTitle || pageSlug.split('/').pop()?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || pageSlug,
            description: '',
            blocks: [],
            meta_title: newTitle || pageSlug,
            meta_description: '',
            is_active: true,
            order: 999,
          }
          
          // Save the new page
          await api.patch('/system-settings/', {
            public_pages: publicPages
          })
          
          // Set initial values
          setMetaTitle(publicPages[pageSlug].meta_title)
          setMetaDescription(publicPages[pageSlug].meta_description)
          setBlocks([])
          setStatus('draft')
          
          // Remove new=true from URL
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.delete('new')
          newUrl.searchParams.delete('title')
          window.history.replaceState({}, '', newUrl.toString())
          
          toast.success('Nouvelle page créée !')
          setLoading(false)
          return
        }
      }
      
      // Load page data based on slug
      if (pageSlug === 'home') {
        // Charger les blocs existants, ou créer des blocs par défaut si aucun n'existe
        // pour reproduire la page actuelle affichée sur localhost:9494/
        let homepageBlocks = data.public_homepage_blocks || []
        
        console.log('Chargement page d\'accueil:', {
          hasBlocks: homepageBlocks.length > 0,
          blocksCount: homepageBlocks.length,
          blocks: homepageBlocks,
          public_homepage_blocks: data.public_homepage_blocks
        })
        
        // FORCER la création d'une structure minimale propre : Container > Header uniquement
        // On nettoie TOUJOURS pour avoir une base propre, même si des blocs existent
        console.log('🔧 Nettoyage et création d\'une structure minimale (Container + Header)')
        const now = Date.now()
        
        // Créer uniquement le header avec navigation
        const headerBlock = {
          id: `header-${now}`,
          type: 'header',
          layout: 12,
          data: {
            logo_text: 'VTCBuilder',
            badge: 'Beta',
            logo_url: '/',
            show_theme_toggle: true,
            sticky: true,
            links: [
              { label: 'Tarifs', url: '/#pricing' },
              { label: 'Fonctionnalités', url: '/features' },
              { label: 'Templates', url: '/templates' },
              { label: 'Documentation', url: '/docs' },
              { label: 'Contact', url: '/contact' }
            ],
            cta_button: {
              text: 'Créer un compte',
              url: '/register',
              style: 'primary'
            }
          },
          styles: {
            position: 'sticky',
            top: '0',
            z_index: '50',
            backgroundColor: 'bg-white/95 dark:bg-gray-900/90',
            backdrop_blur: true
          }
        }
        
        // Créer le bloc hero avec le contenu exact de localhost:9494
        const heroBlock = {
          id: `hero-${now}`,
          type: 'hero',
          layout: 12,
          data: {
            title: 'Le WordPress des Chauffeurs VTC',
            subtitle: 'Créez votre site VTC professionnel en quelques minutes. Gestion complète, réservations, paiements, tout inclus.',
            primary_button_text: '🚀 Démarrer gratuitement',
            primary_button_link: '/register',
            secondary_button_text: 'Voir les tarifs',
            secondary_button_link: '#pricing'
          },
          styles: {}
        }
        
        // Créer la section Features avec le contenu exact de localhost:9494
        const featuresBlock = {
          id: `features-${now}`,
          type: 'features-grid',
          layout: 12,
          data: {
            title: 'Tout ce dont vous avez besoin',
            columns: 3,
            features: [
              {
                icon: '🎨',
                title: 'Site Professionnel',
                description: 'Designs modernes et responsive. Personnalisez votre site sans coder.'
              },
              {
                icon: '📅',
                title: 'Réservations en Ligne',
                description: 'Système de réservation complet avec calendrier et notifications.'
              },
              {
                icon: '💳',
                title: 'Paiements Intégrés',
                description: 'Acceptez les paiements en ligne. Cartes bancaires, virement, tout est possible.'
              },
              {
                icon: '📱',
                title: 'Mobile First',
                description: 'Votre site s\'adapte automatiquement aux smartphones et tablettes.'
              },
              {
                icon: '📊',
                title: 'Analytics Inclus',
                description: 'Suivez vos performances, réservations, revenus en temps réel.'
              },
              {
                icon: '🔒',
                title: 'Sécurisé & Rapide',
                description: 'Hébergement sécurisé, sauvegardes automatiques, SSL inclus.'
              }
            ]
          },
          styles: {
            background_color: 'transparent'
          }
        }
        
        // Créer un conteneur avec le header uniquement
        const mainContainer = {
          id: `container-${now}`,
          type: 'container',
          layout: 12,
          data: {
            max_width: 'max-w-7xl',
            padding: 'px-4 sm:px-6 lg:px-8',
            margin: 'mx-auto'
          },
          styles: {
            maxWidth: '80rem',
            margin: '0 auto',
            padding: '0 1rem'
          },
          children: [headerBlock]
        }
        
        // Créer le bloc pricing (tarifs transparents)
        const pricingBlock = {
          id: `pricing-${now}`,
          type: 'pricing',
          layout: 12,
          data: {
            title: 'Tarifs Transparents',
            subtitle: 'Choisissez le plan adapté à vos besoins. Pas d\'engagement, changez de plan à tout moment.',
            source: 'api',
            api_endpoint: '/api/billing/pricing-plans/',
            show_title: true,
            columns: 3
          },
          styles: {
            background_color: 'bg-gray-50 dark:bg-gray-900',
            padding: 'py-20'
          }
        }
        
        // Créer le bloc CTA "Prêt à démarrer"
        const ctaBlock = {
          id: `cta-${now}`,
          type: 'cta',
          layout: 12,
          data: {
            title: 'Prêt à démarrer ?',
            subtitle: 'Créez votre site VTC professionnel dès aujourd\'hui. Essai gratuit de 14 jours.',
            button_text: '🚀 Créer mon compte gratuitement',
            button_link: '/register',
            button_style: 'primary',
            background_type: 'gradient',
            background_gradient: 'from-blue-600 to-purple-600'
          },
          styles: {
            padding: 'py-20',
            text_align: 'center'
          }
        }
        
        // Créer le bloc footer
        const footerBlock = {
          id: `footer-${now}`,
          type: 'footer',
          layout: 12,
          data: {
            copyright_text: `© ${new Date().getFullYear()} VTCBuilder. Tous droits réservés.`,
            links: [
              { label: 'Tarifs', url: '/#pricing' },
              { label: 'Fonctionnalités', url: '/features' },
              { label: 'Templates', url: '/templates' },
              { label: 'Documentation', url: '/docs' },
              { label: 'Contact', url: '/contact' },
              { label: 'FAQ', url: '/faq' }
            ],
            legal_links: [
              { label: 'CGV', url: '/legal/terms' },
              { label: 'Confidentialité', url: '/legal/privacy' }
            ],
            show_social_links: false
          },
          styles: {
            background_color: 'bg-gray-100 dark:bg-gray-900',
            padding: 'py-12'
          }
        }
        
        // Hero, Features, Pricing, CTA et Footer en dehors du container pour avoir le fond gradient complet
        homepageBlocks = [mainContainer, heroBlock, featuresBlock, pricingBlock, ctaBlock, footerBlock]
        
        // Sauvegarder immédiatement les blocs par défaut
        try {
          const saveResponse = await api.patch('/system-settings/', {
            public_homepage_blocks: homepageBlocks
          })
          console.log('✅ Blocs par défaut sauvegardés avec succès:', {
            blocks: homepageBlocks,
            response: saveResponse.data
          })
          toast.success('Structure minimale créée avec succès!')
        } catch (error: any) {
          console.error('❌ Erreur lors de la sauvegarde des blocs par défaut:', error)
          toast.error(`Erreur lors de la sauvegarde: ${error.response?.data?.error || error.message}`)
        }
        
        console.log('📦 Blocs chargés pour la page d\'accueil:', {
          count: homepageBlocks.length,
          blocks: homepageBlocks,
          firstBlock: homepageBlocks[0],
          hasChildren: homepageBlocks[0]?.children?.length > 0,
          firstBlockType: homepageBlocks[0]?.type,
          firstBlockChildren: homepageBlocks[0]?.children
        })
        
        setBlocks(homepageBlocks)
        console.log('✅ Blocs définis dans l\'état:', homepageBlocks.length, 'bloc(s)')
        // Toujours charger en mode 'draft' pour ne pas modifier la page publiée
        // L'utilisateur devra explicitement publier pour que les changements soient visibles
        setStatus('draft')
        setMetaTitle(data.public_homepage_meta_title || 'VTCBuilder - Le WordPress des chauffeurs VTC')
        setMetaDescription(data.public_homepage_meta_description || 'Plateforme complète pour créer et gérer votre site VTC professionnel')
      } else {
        // Load other public pages
        const publicPages = data.public_pages || {}
        let pageData = publicPages[pageSlug] || {}
        
        // Si la page n'existe pas, créer une structure par défaut selon le type de page
        if (!pageData.blocks || pageData.blocks.length === 0) {
          const now = Date.now()
          
          if (pageSlug === 'docs') {
            // Page de documentation avec structure par défaut
            pageData = {
              ...pageData,
              blocks: [
                {
                  id: `docs-hero-${now}`,
                  type: 'heading',
                  data: {
                    text: 'Documentation VTCBuilder',
                    level: 1
                  },
                  styles: {
                    padding: 'py-8',
                    textAlign: 'center'
                  }
                },
                {
                  id: `docs-intro-${now}`,
                  type: 'text',
                  data: {
                    content: 'Bienvenue dans la documentation de VTCBuilder. Découvrez comment utiliser toutes les fonctionnalités de la plateforme pour créer et gérer votre site VTC professionnel.'
                  },
                  styles: {
                    padding: 'pb-6'
                  }
                },
                {
                  id: `docs-content-${now}`,
                  type: 'rich-text',
                  data: {
                    content: '<h2>Guide de démarrage</h2><p>Commencez par créer votre compte et configurer votre premier site.</p><h2>Fonctionnalités</h2><p>Explorez toutes les fonctionnalités disponibles pour votre site VTC.</p>'
                  },
                  styles: {
                    padding: 'py-6'
                  }
                }
              ]
            }
          } else if (pageSlug === 'contact') {
            // Page de contact avec formulaire
            pageData = {
              ...pageData,
              blocks: [
                {
                  id: `contact-hero-${now}`,
                  type: 'heading',
                  data: {
                    text: 'Contactez-nous',
                    level: 1
                  },
                  styles: {
                    padding: 'py-8',
                    textAlign: 'center'
                  }
                },
                {
                  id: `contact-form-${now}`,
                  type: 'contact-form',
                  data: {
                    title: 'Envoyez-nous un message',
                    fields: ['name', 'email', 'message']
                  },
                  styles: {
                    padding: 'py-6'
                  }
                }
              ]
            }
          } else {
            // Pages génériques avec structure de base
            pageData = {
              ...pageData,
              blocks: [
                {
                  id: `page-heading-${now}`,
                  type: 'heading',
                  data: {
                    text: PAGE_TITLES[pageSlug] || pageSlug.charAt(0).toUpperCase() + pageSlug.slice(1),
                    level: 1
                  },
                  styles: {
                    padding: 'py-8',
                    textAlign: 'center'
                  }
                },
                {
                  id: `page-content-${now}`,
                  type: 'text',
                  data: {
                    content: `Contenu de la page ${PAGE_TITLES[pageSlug] || pageSlug}.`
                  },
                  styles: {
                    padding: 'py-6'
                  }
                }
              ]
            }
          }
          
          // Sauvegarder la structure par défaut
          try {
            const updatedPages = { ...publicPages, [pageSlug]: pageData }
            await api.patch('/system-settings/', { public_pages: updatedPages })
          } catch (error) {
            console.error('Error sauvegarde structure par défaut:', error)
          }
        } else {
          // Convertir l'ancienne structure si nécessaire
          pageData.blocks = pageData.blocks.map((block: any) => {
            if (block.properties && !block.data) {
              return {
                ...block,
                data: block.properties,
                styles: block.styles || {}
              }
            }
            return block
          })
        }
        
        setBlocks(pageData.blocks || [])
        setMetaTitle(pageData.meta_title || `${PAGE_TITLES[pageSlug] || pageSlug} - VTCBuilder`)
        setMetaDescription(pageData.meta_description || '')
      }
    } catch (error: any) {
      console.error('Error chargement:', error)
      toast.error('Error lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }, [pageSlug])

  // Sauvegarder l'état de l'éditeur pour la reconnexion
  useEffect(() => {
    if (pathname) {
      saveEditorState({
        blocks,
        metaTitle,
        metaDescription,
        status,
      })
    }
  }, [blocks, metaTitle, metaDescription, status, pathname, saveEditorState])

  // Synchroniser le thème de prévisualisation avec le thème global
  useEffect(() => {
    if (resolvedTheme) {
      setPreviewTheme(resolvedTheme)
    }
  }, [resolvedTheme])

  // Restaurer l'état après reconnexion
  useEffect(() => {
    const handleReconnectSuccess = () => {
      if (pathname) {
        const restored = restoreEditorStateAfterReconnect(pathname)
        if (restored) {
          if (restored.blocks) setBlocks(restored.blocks)
          if (restored.metaTitle) setMetaTitle(restored.metaTitle)
          if (restored.metaDescription) setMetaDescription(restored.metaDescription)
          if (restored.status && (restored.status === 'draft' || restored.status === 'published')) {
            setStatus(restored.status)
          }
          toast.success('Vos modifications ont été restaurées')
        }
      }
    }

    window.addEventListener('reconnect-success', handleReconnectSuccess)
    return () => {
      window.removeEventListener('reconnect-success', handleReconnectSuccess)
    }
  }, [pathname])

  useEffect(() => {
    if (!authService.isSuperAdmin()) {
      router.push('/dashboard')
      return
    }
    loadData()
    
    // Charger l'abonnement pour afficher le badge
    const loadSubscription = async () => {
      try {
        if (authService.isSuperAdmin()) {
          setSubscription({ plan: { name: 'Super Admin' }, status: 'active' })
          setSubscriptionLoading(false)
          return
        }
        const sub = await billingService.getCurrentSubscription()
        setSubscription(sub)
      } catch (error) {
        // Pas d'abonnement ou erreur
        setSubscription(null)
      } finally {
        setSubscriptionLoading(false)
      }
    }
    
    loadSubscription()
  }, [router, pageSlug, loadData])

  // Fonction pour ajouter un bloc depuis la popup
  const handleAddBlock = useCallback((blockType: BlockType) => {
    // Vérifier si c'est un conteneur
    const isContainerType = (name: string): boolean => {
      const containerTypes = ['container', 'grid-container', 'flex-container', 'flexbox', 'grid', 'stack', 'inline', 'group', 'wrapper', 'section', 'rows']
      return containerTypes.includes(name)
    }

    // Vérifier si un conteneur existe
    const hasContainer = (blocks: Block[]): boolean => {
      const containerTypes = ['container', 'grid-container', 'flex-container', 'flexbox', 'grid', 'stack', 'inline', 'group', 'wrapper', 'section', 'rows']
      for (const block of blocks) {
        if (containerTypes.includes(block.type)) {
          return true
        }
        if (block.children && block.children.length > 0) {
          if (hasContainer(block.children)) {
            return true
          }
        }
      }
      return false
    }

    // Si ce n'est pas un conteneur et qu'aucun conteneur n'existe, empêcher l'ajout
    if (!isContainerType(blockType.name) && !hasContainer(blocks)) {
      toast.error('⚠️ Vous devez d\'abord ajouter un conteneur (Container, Grid, Flex, etc.) avant d\'ajouter des blocs de contenu.')
      return
    }

    const newBlock: Block = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: blockType.name,
      data: {},
      styles: blockType.default_styles || {},
      layout: 12,
      container: 'container',
    }

    // Si c'est un conteneur, initialiser avec un tableau d'enfants vide
    if (isContainerType(blockType.name)) {
      newBlock.children = []
    }

    setBlocks([...blocks, newBlock])
    setSelectedBlockId(newBlock.id)
    toast.success(`Bloc "${blockType.label || blockType.name}" ajouté`)
  }, [blocks])

  if (loading) {
    return (
      <AdminLayout title={`Éditer ${PAGE_TITLES[pageSlug] || pageSlug}`} subtitle="Chargement...">
        <PageLoader />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title={
        <div className="flex items-center gap-3 flex-wrap">
          <span>Éditer {PAGE_TITLES[pageSlug] || pageSlug}</span>
          <span className="px-2.5 py-1 text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full border border-purple-300 dark:border-purple-700">
            {pageSlug === 'home' ? 'Mode Projet' : 'Page Publique'}
          </span>
          {!subscriptionLoading && subscription && (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
              authService.isSuperAdmin()
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700'
                : subscription.status === 'active'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
                : subscription.status === 'trial'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'
            }`}>
              {authService.isSuperAdmin() ? '👑 Super Admin' : subscription.plan?.name || 'Aucun plan'}
            </span>
          )}
        </div>
      }
      subtitle={
        <div className="flex flex-col gap-1">
          <span>Éditeur pour les pages publiques (public_pages[{pageSlug}])</span>
        </div>
      }
      hideHeader={!headerVisible}
      projectBackButton={
        projectId ? (
          <button
            onClick={() => {
              // projectId peut être un slug ou un ID numérique
              router.push(`/admin/projects/${projectId}`)
            }}
            className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
            title="Retourner à la page de détail du projet"
          >
            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        ) : undefined
      }
      saveStatus={
        <div className="flex items-center gap-2">
          {isAutoSaving ? (
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs sm:text-sm whitespace-nowrap">
              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent flex-shrink-0"></div>
              <span className="hidden lg:inline">Sauvegarde...</span>
            </div>
          ) : lastSaved ? (
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-xs sm:text-sm whitespace-nowrap">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="hidden lg:inline">Sauvegardé {lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="lg:hidden">{lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ) : null}
        </div>
      }
      headerActions={
        <div className="flex flex-row gap-2 flex-wrap items-center w-full py-1">
          {/* Header Toggle - En premier pour être toujours visible */}
          <button
            onClick={() => setHeaderVisible(!headerVisible)}
            className="p-2.5 rounded-lg transition-colors flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
            title={headerVisible ? 'Masquer la barre' : 'Afficher la barre'}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {headerVisible ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              )}
            </svg>
          </button>
          {/* Page Selector - Compact version, visible on medium screens and up */}
          {availablePages.length > 0 && (
            <div className="hidden md:flex items-center gap-2 pr-2 border-r border-gray-300 dark:border-gray-600">
              <select
                value={pageSlug || ''}
                onChange={(e) => {
                  const slug = e.target.value
                  const url = projectId 
                    ? `/admin/pages-public/edit/${slug}?projectId=${projectId}`
                    : `/admin/pages-public/edit/${slug}`
                  router.push(url)
                }}
                className="px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-xs sm:text-sm font-medium min-w-[120px] sm:min-w-[150px]"
                title="Sélectionner une page"
              >
                {availablePages.map((page) => (
                  <option key={page.slug} value={page.slug}>
                    {page.isSubPage ? `  └─ ${page.title}` : page.title}
                  </option>
                ))}
                {/* S'assurer que la page actuelle est toujours dans la liste, même si elle vient d'être créée */}
                {!availablePages.some(p => p.slug === pageSlug) && pageSlug && pageSlug !== 'home' && (
                  <option value={pageSlug}>
                    {pageSlug.includes('nouvelle-page') ? `Nouvelle page` : pageSlug}
                  </option>
                )}
              </select>
            </div>
          )}

          {/* Afficher les sous-pages de la page actuelle - Compact version */}
          {currentPageSubPages.length > 0 && (
            <div className="hidden md:flex items-center gap-1 pr-2 border-r border-gray-300 dark:border-gray-600">
              {currentPageSubPages.map((subPage) => (
                <button
                  key={subPage.slug}
                  onClick={() => {
                    const url = projectId 
                      ? `/admin/pages-public/edit/${subPage.slug}?projectId=${projectId}`
                      : `/admin/pages-public/edit/${subPage.slug}`
                    router.push(url)
                  }}
                  className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  title={`Éditer ${subPage.title}`}
                >
                  {subPage.title}
                </button>
              ))}
            </div>
          )}

          {/* Inspector Mode Toggle - Only when preview is visible - Hidden on small screens */}
          {showPreview && (
            <button
              onClick={() => setInspectorMode(!inspectorMode)}
              className={`hidden lg:flex p-2.5 rounded-lg transition-colors items-center justify-center ${
                inspectorMode 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title="Mode Inspecteur (comme DevTools)"
            >
              <svg className="h-6 w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}

          {/* Preview Toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`p-2.5 rounded-lg transition-colors flex items-center justify-center ${
              showPreview 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
            title={showPreview ? 'Masquer Prévisualisation' : 'Afficher Prévisualisation'}
          >
            <svg className="h-6 w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          {/* Preview Mode Selector */}
          {showPreview && (
            <div className="flex gap-1 items-center bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2.5 rounded-lg transition-colors flex items-center justify-center ${
                  previewMode === 'desktop'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
                title="Desktop"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => setPreviewMode('tablet')}
                className={`p-2.5 rounded-lg transition-colors flex items-center justify-center ${
                  previewMode === 'tablet'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
                title="Tablette"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2.5 rounded-lg transition-colors flex items-center justify-center ${
                  previewMode === 'mobile'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
                title="Mobile"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </button>
              {/* Toggle Theme pour la prévisualisation */}
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
              <button
                onClick={() => setPreviewTheme(previewTheme === 'light' ? 'dark' : 'light')}
                className={`p-2.5 rounded-lg transition-colors flex items-center justify-center ${
                  previewTheme === 'dark'
                    ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
                title={previewTheme === 'light' ? 'Mode sombre (prévisualisation)' : 'Mode clair (prévisualisation)'}
              >
                {previewTheme === 'dark' ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
            </div>
          )}

          {/* External Preview */}
          <button
            onClick={() => window.open(`/${pageSlug === 'home' ? '' : pageSlug}`, '_blank')}
            className="p-2.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
            title="Ouvrir dans un nouvel onglet"
          >
            <svg className="h-6 w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>

          {/* More Options Menu - 3 points verticaux */}
          <div className="relative more-options-menu">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMoreMenu(!showMoreMenu)
              }}
              className="p-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
              title="Plus d'options"
            >
              <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            {showMoreMenu && (
              <>
                {/* Overlay pour fermer le menu en cliquant ailleurs */}
                <div 
                  className="fixed inset-0 z-[10000]" 
                  onClick={() => setShowMoreMenu(false)}
                />
                {/* Menu dropdown */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[10001] py-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowSeoExpanded(!showSeoExpanded)
                      setShowMoreMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {showSeoExpanded ? 'Masquer les paramètres SEO' : 'Afficher les paramètres SEO'}
                  </button>
                  {/* Statut de la page (pour la page d'accueil) */}
                  {pageSlug === 'home' && (
                    <>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Statut
                      </div>
                      <div className="px-4 py-2">
                        <select
                          value={status}
                          onChange={(e) => {
                            setStatus(e.target.value as 'draft' | 'published')
                            setShowMoreMenu(false)
                          }}
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="draft">📝 Brouillon</option>
                          <option value="published">✅ Publié</option>
                        </select>
                      </div>
                    </>
                  )}
                  {availablePages.length > 0 && (
                    <>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Pages disponibles
                      </div>
                      {availablePages.map((page) => (
                        <button
                          key={page.slug}
                          onClick={(e) => {
                            e.stopPropagation()
                            const url = projectId 
                              ? `/admin/pages-public/edit/${page.slug}?projectId=${projectId}`
                              : `/admin/pages-public/edit/${page.slug}`
                            router.push(url)
                            setShowMoreMenu(false)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {page.isSubPage ? `  └─ ${page.title}` : page.title}
                        </button>
                      ))}
                    </>
                  )}
                  {currentPageSubPages.length > 0 && (
                    <>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Sous-pages
                      </div>
                      {currentPageSubPages.map((subPage) => (
                        <button
                          key={subPage.slug}
                          onClick={(e) => {
                            e.stopPropagation()
                            const url = projectId 
                              ? `/admin/pages-public/edit/${subPage.slug}?projectId=${projectId}`
                              : `/admin/pages-public/edit/${subPage.slug}`
                            router.push(url)
                            setShowMoreMenu(false)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {subPage.title}
                        </button>
                      ))}
                    </>
                  )}
                  {/* Option pour gérer les pages */}
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push('/admin/projects')
                      setShowMoreMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Gérer les pages
                  </button>
                </div>
              </>
            )}
          </div>

          {/* New Page Button */}
          <button
            onClick={async () => {
              // Sauvegarder la page actuelle avant de créer une nouvelle
              try {
                await handleManualSave()
                
                // Récupérer les pages existantes pour trouver le prochain numéro
                const currentSettings = await api.get('/system-settings/')
                const publicPages = currentSettings.data.public_pages || {}
                
                // Trouver le prochain numéro disponible
                let pageNumber = 1
                let newSlug = `nouvelle-page-${pageNumber}`
                while (publicPages[newSlug]) {
                  pageNumber++
                  newSlug = `nouvelle-page-${pageNumber}`
                }
                
                // Créer la nouvelle page avec un nom automatique
                const newPageTitle = `Nouvelle page ${pageNumber}`
                publicPages[newSlug] = {
                  title: newPageTitle,
                  blocks: [],
                  meta_title: '',
                  meta_description: '',
                  is_active: true,
                  order: Object.keys(publicPages).length + 1,
                }
                
                // Sauvegarder la nouvelle page
                await api.patch('/system-settings/', { public_pages: publicPages })
                toast.success(`Page "${newPageTitle}" créée avec succès !`)
                
                // Naviguer vers l'éditeur de la nouvelle page avec projectId si présent
                const url = projectId 
                  ? `/admin/pages-public/edit/${newSlug}?projectId=${projectId}`
                  : `/admin/pages-public/edit/${newSlug}`
                
                // Naviguer vers la nouvelle page
                router.push(url)
                
                // Recharger les données après la navigation pour mettre à jour le dropdown
                // Utiliser un petit délai pour s'assurer que la navigation est terminée
                setTimeout(() => {
                  loadData()
                }, 200)
              } catch (error) {
                console.error('Error création nouvelle page:', error)
                toast.error('Error lors de la création de la nouvelle page')
              }
            }}
            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            title="Créer une nouvelle page"
          >
            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Undo Button - Icon only */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).__blockEditorUndo) {
                (window as any).__blockEditorUndo()
              }
            }}
            disabled={!canUndo}
            className={`p-2.5 rounded-lg transition-colors flex items-center justify-center ${
              canUndo
                ? 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
            title="Annuler (Ctrl+Z)"
          >
            <svg className="h-6 w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>

          {/* Redo Button - Icon only */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).__blockEditorRedo) {
                (window as any).__blockEditorRedo()
              }
            }}
            disabled={!canRedo}
            className={`p-2.5 rounded-lg transition-colors flex items-center justify-center ${
              canRedo
                ? 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
            title="Rétablir (Ctrl+Shift+Z)"
          >
            <svg className="h-6 w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>

          {/* Subscription Info - Afficher l'abonnement et les fonctionnalités */}
          <SubscriptionInfo />

          {/* Blocs Disponibles Button - Icon only */}
          <button
            onClick={() => {
              setIsPaletteCollapsed(!isPaletteCollapsed)
              if (typeof window !== 'undefined') {
                localStorage.setItem('palette-collapsed', String(isPaletteCollapsed))
              }
            }}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
              !isPaletteCollapsed 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title={isPaletteCollapsed ? 'Afficher la palette de blocs' : 'Masquer la palette de blocs'}
          >
            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
            </svg>
          </button>

          {/* SEO Settings Button - Icon + Text - Toujours visible */}
          <button
            onClick={() => setShowSeoExpanded(!showSeoExpanded)}
            className={`p-2.5 rounded-lg transition-colors flex items-center gap-2 ${
              showSeoExpanded
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title={showSeoExpanded ? 'Masquer les paramètres SEO' : 'Afficher les paramètres SEO'}
          >
            <svg className="h-6 w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-sm font-medium">SEO</span>
          </button>

          {/* Save Button - Icon only */}
          <button
            onClick={handleManualSave}
            disabled={saving || isAutoSaving}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
            title={saving ? 'Sauvegarde en cours...' : 'Sauvegarder'}
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white flex-shrink-0"></div>
            ) : (
              <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          {/* Close Button */}
          <button
            onClick={async () => {
              if (projectId) {
                // Si projectId est fourni, l'utiliser directement (peut être un slug ou un ID)
                router.push(`/admin/projects/${projectId}`)
              } else {
                // Sinon, charger le projet système
                try {
                  const systemProject = await projectService.getSystemProject()
                  if (systemProject) {
                    router.push(`/admin/projects/${systemProject.slug}`)
                  } else {
                    router.push('/admin/projects')
                  }
                } catch (error) {
                  router.push('/admin/projects')
                }
              }
            }}
            className="p-2 sm:p-2.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
            title="Retourner au projet"
          >
            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    >
      {/* Barre d'actions minimale quand la barre est masquée */}
      {!headerVisible && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 flex-wrap justify-end">
          {/* Bouton Afficher Barre - Icon only */}
          <button
            onClick={() => setHeaderVisible(true)}
            className="p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            title="Afficher la barre supérieure"
          >
            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Bouton Sauvegarder - Icon only */}
          <button
            onClick={handleManualSave}
            disabled={saving || isAutoSaving}
            className="p-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center"
            title="Sauvegarder"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white flex-shrink-0"></div>
            ) : (
              <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          
          {/* Bouton Blocs Disponibles - Icon only */}
          <button
            onClick={() => {
              setIsPaletteCollapsed(!isPaletteCollapsed)
              if (typeof window !== 'undefined') {
                localStorage.setItem('palette-collapsed', String(isPaletteCollapsed))
              }
            }}
            className={`p-2 rounded-lg shadow-lg transition-colors flex items-center justify-center ${
              !isPaletteCollapsed 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-700 dark:bg-gray-800 text-white hover:bg-gray-600 dark:hover:bg-gray-700'
            }`}
            title={isPaletteCollapsed ? 'Afficher la palette de blocs' : 'Masquer la palette de blocs'}
          >
            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
            </svg>
          </button>
          
          {/* Bouton Nouvelle Page - Icon only */}
          <button
            onClick={async () => {
              try {
                // Sauvegarder la page actuelle avant de créer une nouvelle
                if (blocks.length > 0) {
                  await handleManualSave()
                }
                
                const newPageSlug = prompt('Entrez le slug de la nouvelle page (ex: ma-nouvelle-page):')
                if (!newPageSlug) return
                
                // Sauvegarder la nouvelle page
                const currentSettings = await api.get('/system-settings/')
                const publicPages = currentSettings.data.public_pages || {}
                
                publicPages[newPageSlug] = {
                  title: newPageSlug.charAt(0).toUpperCase() + newPageSlug.slice(1).replace(/-/g, ' '),
                  blocks: [],
                  meta_title: '',
                  meta_description: '',
                  is_active: true,
                }
                
                await api.patch('/system-settings/', { public_pages: publicPages })
                toast.success('Nouvelle page créée !')
                router.push(`/admin/pages-public/edit/${newPageSlug}`)
              } catch (error: any) {
                console.error('Error création page:', error)
                toast.error('Error lors de la création de la page')
              }
            }}
            className="p-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
            title="Créer une nouvelle page"
          >
            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex flex-col h-full min-h-0 overflow-hidden">
        {/* SEO Settings Bar - Affichage conditionnel */}
        {showSeoExpanded && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex gap-3 sm:gap-4 items-center flex-wrap flex-shrink-0">
            {pageSlug === 'home' && (
              <div className="min-w-[150px]">
                <label htmlFor="status" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Statut
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                  className="w-full px-3 py-1.5 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                </select>
              </div>
            )}
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="meta_title" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Titre SEO ({metaTitle.length}/60 caractères)
              </label>
              <input
                id="meta_title"
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Titre pour les moteurs de recherche"
                maxLength={60}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="meta_description" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description SEO ({metaDescription.length}/160 caractères)
              </label>
              <input
                id="meta_description"
                type="text"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Description pour les moteurs de recherche"
                maxLength={160}
              />
            </div>
          </div>
        )}

        {/* Main Editor Area with Split View - Redimensionnable */}
        <div className="flex-1 flex overflow-hidden min-h-0 relative" style={{ height: 'calc(100vh - 120px)', minHeight: '700px' }}>
          {/* Sidebar - Palette de blocs */}
          {!isPaletteCollapsed ? (
            <>
              <div 
                className="border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col flex-shrink-0 bg-white dark:bg-gray-800"
                style={{ width: `${sidebarWidth}px`, minWidth: '200px', maxWidth: '400px' }}
              >
                <div className="flex-1 overflow-hidden flex flex-col">
                  <BlockEditor 
                    blocks={blocks}
                    onChange={setBlocks}
                    availableBlockTypes={blockTypes}
                    onBlockSelect={setSelectedBlockId}
                    selectedBlockId={selectedBlockId}
                    showBlocksPalette={true}
                    showOnlyPalette={true} // Toujours afficher uniquement la palette
                    onPaletteToggle={() => {
                      setIsPaletteCollapsed(true)
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('palette-collapsed', 'true')
                      }
                    }}
                    onUndoRedoChange={(canUndo, canRedo) => {
                      setCanUndo(canUndo)
                      setCanRedo(canRedo)
                    }}
                  />
                </div>
              </div>
              
              {/* Resize Handle pour la sidebar */}
              <div
                onMouseDown={(e) => {
                  setIsResizingSidebar(true)
                  const startX = e.clientX
                  const startWidth = sidebarWidth
                  
                  const handleMouseMove = (e: MouseEvent) => {
                    const diff = e.clientX - startX
                    const newWidth = Math.max(200, Math.min(400, startWidth + diff))
                    setSidebarWidth(newWidth)
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('sidebar-width', String(newWidth))
                    }
                  }
                  
                  const handleMouseUp = () => {
                    setIsResizingSidebar(false)
                    document.removeEventListener('mousemove', handleMouseMove)
                    document.removeEventListener('mouseup', handleMouseUp)
                  }
                  
                  document.addEventListener('mousemove', handleMouseMove)
                  document.addEventListener('mouseup', handleMouseUp)
                }}
                className={`w-2 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-600 cursor-col-resize flex-shrink-0 transition-colors ${
                  isResizingSidebar ? 'bg-blue-500 dark:bg-blue-600' : ''
                }`}
                style={{ userSelect: 'none' }}
                title="Redimensionner la palette"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-1 h-16 bg-gray-400 dark:bg-gray-500 rounded"></div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-4 gap-2 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0" style={{ width: '60px' }}>
              <button
                onClick={() => {
                  setIsPaletteCollapsed(false)
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('palette-collapsed', 'false')
                  }
                }}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Afficher la palette de blocs"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Editor Section - Largeur dynamique */}
          <div 
            className="border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col min-h-0 transition-none"
            style={{ 
              width: showPreview ? `${editorWidth}%` : '100%',
              minWidth: showPreview ? '200px' : '0',
              maxWidth: showPreview ? '80%' : '100%'
            }}
          >
            <div className="flex-1 overflow-hidden min-h-0 h-full">
            <div className="relative h-full">
              {/* Indicateur de raccourcis clavier */}
              <div className="absolute top-2 right-2 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 text-xs opacity-0 hover:opacity-100 transition-opacity group">
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Raccourcis</span>
                </div>
                <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 min-w-[200px] hidden group-hover:block">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Flèches ↑↓</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">Naviguer entre blocs</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Escape</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">Désélectionner</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Ctrl/Cmd + S</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">Sauvegarder</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Double-clic</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">Modifier bloc</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Clic droit</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">Menu contextuel</span>
                    </div>
                  </div>
                </div>
              </div>

              <BlockEditor 
                blocks={blocks}
                onChange={setBlocks}
                availableBlockTypes={blockTypes}
                selectedBlockId={selectedBlockId}
                onBlockSelect={setSelectedBlockId}
                showBlocksPalette={false} // Désactiver la sidebar de blocs (popup externe)
                onUndoRedoChange={(canUndo, canRedo) => {
                  setCanUndo(canUndo)
                  setCanRedo(canRedo)
                }}
              />
            </div>
            </div>
          </div>

          {/* Resizer - Barre de redimensionnement avec indicateurs de snap */}
          {showPreview && (
            <div
              className={`w-1 cursor-col-resize transition-all relative z-10 flex-shrink-0 group ${
                snappedPoint !== null
                  ? 'bg-blue-500 dark:bg-blue-600 shadow-lg shadow-blue-500/50'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-600'
              }`}
              onMouseDown={(e) => {
                e.preventDefault()
                setIsResizing(true)
                setSnappedPoint(null) // Réinitialiser au début du drag
              }}
              style={{ cursor: 'col-resize' }}
              title="Redimensionner (points d'ancrage: 25%, 33% (1/3), 40%, 50%, 60%, 67% (2/3), 75%)"
            >
              <div className={`absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 transition-all ${
                snappedPoint !== null
                  ? 'bg-blue-400 dark:bg-blue-500'
                  : 'bg-transparent hover:bg-blue-500 dark:hover:bg-blue-600'
              }`} />
              
              {/* Indicateur visuel du point aimanté pendant le drag */}
              {snappedPoint !== null && isResizing && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg whitespace-nowrap animate-pulse z-20">
                  🧲 Aimanté à {snappedPoint}%
                </div>
              )}
              
              {/* Indicateurs visuels des points d'ancrage au survol */}
              <div className="absolute inset-y-0 left-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="flex flex-col h-full justify-around text-xs text-gray-500 dark:text-gray-400">
                  {SNAP_POINTS.map((point) => {
                    const isActive = Math.abs(editorWidth - point) < 1
                    const isSnapped = snappedPoint === point
                    return (
                      <div
                        key={point}
                        className={`px-2 py-1 rounded transition-all ${
                          isSnapped
                            ? 'bg-blue-500 text-white font-semibold scale-110 shadow-lg'
                            : isActive
                            ? 'bg-blue-400 dark:bg-blue-500 text-white font-semibold'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                      >
                        {point}% {isSnapped && '🧲'}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Preview Section - Largeur dynamique */}
          {showPreview && (
            <div 
              className="border-l border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col min-h-0 transition-none"
              style={{ 
                width: `${100 - editorWidth}%`,
                minWidth: '200px'
              }}
            >
              <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Prévisualisation en direct
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {previewMode === 'desktop' ? '💻 Desktop' : previewMode === 'tablet' ? '📱 Tablette' : '📱 Mobile'}
                </span>
              </div>
              <div className="flex-1 overflow-hidden relative">
                <div className={`absolute inset-0 overflow-auto ${
                  previewMode === 'tablet' ? 'px-4' : previewMode === 'mobile' ? 'px-2' : ''
                }`}>
                  <div className={`h-full ${
                    previewMode === 'tablet' ? 'max-w-[768px] mx-auto' : 
                    previewMode === 'mobile' ? 'max-w-[375px] mx-auto' : 
                    'w-full'
                  }`}>
                    {/* Utiliser uniquement les blocs - pas de composants statiques */}
                    <div className="min-h-screen bg-white dark:bg-gray-900">
                      <BlockPreview 
                        blocks={blocks} 
                        blockTypes={blockTypes}
                        selectedBlockId={selectedBlockId}
                        onBlockSelect={setSelectedBlockId}
                        theme={previewTheme}
                        onBlockDoubleClick={(blockId) => {
                          setModalBlockId(blockId)
                          setPropertiesModalOpen(true)
                        }}
                        onBlockRightClick={(blockId, position) => {
                          setContextMenu({ blockId, position })
                        }}
                        isEditable={true}
                        onNavigate={(url) => {
                          router.push(url)
                        }}
                        inspectorMode={inspectorMode}
                        onInspectorModeChange={setInspectorMode}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de modification de bloc */}
      {modalBlockId && (
        <BlockPropertiesModal
          isOpen={propertiesModalOpen}
          onClose={() => {
            setPropertiesModalOpen(false)
            setModalBlockId(null)
          }}
          onEditChild={(childBlockId) => {
            setModalBlockId(childBlockId)
            setPropertiesModalOpen(true)
          }}
          block={(() => {
            const result = findBlockInTree(blocks, modalBlockId)
            return result ? result.block : null
          })()}
          blockTypes={blockTypes}
          allBlocks={blocks}
          onUpdate={(updates) => {
            // Mettre à jour le bloc dans l'arbre
            const updateBlock = (blocks: Block[], id: string, updates: Partial<Block>): Block[] => {
              return blocks.map(block => {
                if (block.id === id) {
                  return { ...block, ...updates }
                }
                if (block.children) {
                  return {
                    ...block,
                    children: updateBlock(block.children, id, updates),
                  }
                }
                return block
              })
            }
            setBlocks(updateBlock(blocks, modalBlockId, updates))
          }}
          onDelete={(blockId) => {
            // Supprimer le bloc de l'arbre
            const removeBlock = (blocks: Block[], id: string): Block[] => {
              return blocks
                .filter(block => block.id !== id)
                .map(block => {
                  if (block.children) {
                    return {
                      ...block,
                      children: removeBlock(block.children, id),
                    }
                  }
                  return block
                })
            }
            setBlocks(removeBlock(blocks, blockId))
            setPropertiesModalOpen(false)
            setModalBlockId(null)
          }}
          onDuplicate={(block) => {
            // Dupliquer le bloc
            const newBlock: Block = {
              ...block,
              id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              children: block.children
                ? block.children.map((child, idx) => ({
                    ...child,
                    id: `block-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
                  }))
                : undefined,
            }
            
            // Trouver la position du bloc original et insérer après
            const findAndInsert = (blocks: Block[], id: string, newBlock: Block): Block[] => {
              for (let i = 0; i < blocks.length; i++) {
                if (blocks[i].id === id) {
                  const newBlocks = [...blocks]
                  newBlocks.splice(i + 1, 0, newBlock)
                  return newBlocks
                }
                if (blocks[i].children) {
                  const updated = findAndInsert(blocks[i].children, id, newBlock)
                  if (updated !== blocks[i].children) {
                    return blocks.map((b, idx) => 
                      idx === i ? { ...b, children: updated } : b
                    )
                  }
                }
              }
              return blocks
            }
            
            setBlocks(findAndInsert(blocks, block.id, newBlock))
            setPropertiesModalOpen(false)
            setModalBlockId(null)
          }}
        />
      )}

      {/* Popup Blocs Disponibles */}
      <BlocksPalettePopup
        isOpen={blocksPaletteOpen}
        onClose={() => setBlocksPaletteOpen(false)}
        onAddBlock={handleAddBlock}
        currentBlocks={blocks}
        blockTypes={blockTypes}
      />

      {/* Menu contextuel pour la prévisualisation */}
      {contextMenu && (() => {
        const blockResult = findBlockInTree(blocks, contextMenu.blockId)
        if (!blockResult) return null
        const block = blockResult.block
        return (
          <BlockContextMenu
            isOpen={true}
            position={contextMenu.position}
            block={block}
            onClose={() => setContextMenu(null)}
            onEdit={() => {
              setModalBlockId(contextMenu.blockId)
              setPropertiesModalOpen(true)
              setContextMenu(null)
            }}
            onDuplicate={() => {
              const blockToDuplicateResult = findBlockInTree(blocks, contextMenu.blockId)
              if (blockToDuplicateResult) {
                const blockToDuplicate = blockToDuplicateResult.block
                const newId = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                
                // Dupliquer le bloc avec ses enfants
                const duplicatedBlock: Block = {
                  ...blockToDuplicate,
                  id: newId,
                  children: blockToDuplicate.children
                    ? blockToDuplicate.children.map((child, idx) => ({
                        ...child,
                        id: `${newId}-child-${idx}-${Date.now()}`,
                      }))
                    : undefined,
                }
                
                // Insérer le bloc dupliqué après l'original dans l'arbre
                const insertAfter = (blocks: Block[], targetId: string, newBlock: Block): Block[] => {
                  for (let i = 0; i < blocks.length; i++) {
                    if (blocks[i].id === targetId) {
                      const newBlocks = [...blocks]
                      newBlocks.splice(i + 1, 0, newBlock)
                      return newBlocks
                    }
                    if (blocks[i].children) {
                      const updated = insertAfter(blocks[i].children, targetId, newBlock)
                      if (updated !== blocks[i].children) {
                        return blocks.map((b, idx) => idx === i ? { ...b, children: updated } : b)
                      }
                    }
                  }
                  return blocks
                }
                
                const finalBlocks = insertAfter(blocks, contextMenu.blockId, duplicatedBlock)
                setBlocks(finalBlocks)
                handleSave({ blocks: finalBlocks, metaTitle, metaDescription, status })
              }
              setContextMenu(null)
            }}
            onDelete={async () => {
              const confirmed = await confirm({
                title: 'Supprimer le bloc',
                message: 'Êtes-vous sûr de vouloir supprimer ce bloc ? Cette action est irréversible.',
                confirmText: 'Supprimer',
                cancelText: 'Annuler',
                variant: 'danger',
              })
              if (confirmed) {
                const newBlocks = removeBlockFromTree(blocks, contextMenu.blockId)
                setBlocks(newBlocks)
                handleSave({ blocks: newBlocks, metaTitle, metaDescription, status })
                setSelectedBlockId(null)
                setContextMenu(null)
              }
            }}
          />
        )
      })()}

      {/* Modal de confirmation */}
      <ConfirmDialog />
    </AdminLayout>
  )
}

