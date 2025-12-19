'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/admin/AdminLayout'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import BlockEditor from '@/components/editor/BlockEditor'
import { Block } from '@/components/editor/types'
import BlockPreview from '@/components/editor/BlockPreview'
import blocksService, { BlockType } from '@/services/blocks.service'
import PageLoader from '@/components/shared/PageLoader'
import { useAutoSave } from '@/hooks/useAutoSave'

// Composant pour gérer le redimensionnement de l'éditeur
function EditorResizableLayout({ children }: { children: (props: {
  sidebarWidth: number
  setSidebarWidth: (width: number) => void
  isResizing: boolean
  startResize: (e: React.MouseEvent) => void
}) => React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('editor-sidebar-width')
      if (saved) return parseInt(saved, 10)
    }
    return 400 // Largeur par défaut plus grande
  })
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('editor-sidebar-width', sidebarWidth.toString())
    }
  }, [sidebarWidth])

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = moveEvent.clientX
      const minWidth = 300
      const maxWidth = window.innerWidth * 0.5 // Maximum 50% de la largeur
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      setSidebarWidth(clampedWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [setSidebarWidth])

  return (
    <>
      {children({ sidebarWidth, setSidebarWidth, isResizing, startResize })}
      {isResizing && (
        <div className="fixed inset-0 z-50 cursor-col-resize" style={{ userSelect: 'none' }} />
      )}
    </>
  )
}

interface PublicHomepageData {
  public_homepage_blocks: Block[]
  public_homepage_meta_title: string
  public_homepage_meta_description: string
}

// Fonction pour créer les blocs par défaut de la homepage
function createDefaultHomepageBlocks(): Block[] {
  const now = Date.now()
  return [
    // Hero Section
    {
      id: `block-${now}-1`,
      type: 'hero',
      data: {
        title: 'Le WordPress des Chauffeurs VTC',
        subtitle: 'Créez votre site VTC professionnel en quelques minutes. Gestion complète, réservations, paiements, tout inclus.',
        buttons: [
          { text: '🚀 Démarrer gratuitement', url: '/register', style: 'primary' },
          { text: 'Voir les tarifs', url: '#pricing', style: 'secondary' }
        ],
        background_type: 'gradient',
        background_gradient: 'from-blue-500 via-purple-600 to-pink-500',
      },
      styles: {
        background_color: 'transparent',
        color: '#ffffff',
        text_align: 'center',
        padding_top: '5rem',
        padding_bottom: '8rem',
      },
      layout: 12,
      container: 'container',
    },
    // Features Section
    {
      id: `block-${now}-2`,
      type: 'heading',
      data: {
        text: 'Tout ce dont vous avez besoin',
        level: 'h2',
        align: 'center',
      },
      styles: {
        color: '#111827',
        text_align: 'center',
        margin_bottom: '3rem',
      },
      layout: 12,
      container: 'container',
    },
    {
      id: `block-${now}-3`,
      type: 'icon-box',
      data: {
        items: [
          {
            icon: '🎨',
            title: 'Site Professionnel',
            description: 'Designs modernes et responsive. Personnalisez votre site sans coder.',
          },
          {
            icon: '📅',
            title: 'Réservations en Ligne',
            description: 'Système de réservation complet avec calendrier et notifications.',
          },
          {
            icon: '💳',
            title: 'Paiements Intégrés',
            description: 'Acceptez les paiements en ligne. Cartes bancaires, virement, tout est possible.',
          },
          {
            icon: '📱',
            title: 'Mobile First',
            description: 'Votre site s\'adapte automatiquement aux smartphones et tablettes.',
          },
          {
            icon: '📊',
            title: 'Analytics Inclus',
            description: 'Suivez vos performances, réservations, revenus en temps réel.',
          },
          {
            icon: '🔒',
            title: 'Sécurisé & Rapide',
            description: 'Hébergement sécurisé, sauvegardes automatiques, SSL inclus.',
          },
        ],
        columns: 3,
      },
      styles: {
        background_color: '#ffffff',
        padding_top: '5rem',
        padding_bottom: '5rem',
      },
      layout: 12,
      container: 'container',
    },
    // Pricing Section
    {
      id: `block-${now}-4`,
      type: 'heading',
      data: {
        text: 'Tarifs Transparents',
        level: 'h2',
        align: 'center',
      },
      styles: {
        color: '#111827',
        text_align: 'center',
        margin_bottom: '1rem',
      },
      layout: 12,
      container: 'container',
    },
    {
      id: `block-${now}-5`,
      type: 'text',
      data: {
        content: 'Choisissez le plan adapté à vos besoins. Pas d\'engagement, changez de plan à tout moment.',
      },
      styles: {
        color: '#6b7280',
        text_align: 'center',
        margin_bottom: '3rem',
      },
      layout: 12,
      container: 'container',
    },
    {
      id: `block-${now}-6`,
      type: 'pricing',
      data: {
        title: '',
        show_title: false,
        source: 'dynamic',
        api_endpoint: '/api/pricing-plans/',
      },
      styles: {
        background_color: '#f9fafb',
        padding_top: '5rem',
        padding_bottom: '5rem',
      },
      layout: 12,
      container: 'container',
    },
    // CTA Section
    {
      id: `block-${now}-7`,
      type: 'cta-section',
      data: {
        title: 'Prêt à démarrer ?',
        description: 'Créez votre site VTC professionnel dès aujourd\'hui. Essai gratuit de 14 jours.',
        button_text: '🚀 Créer mon compte gratuitement',
        button_url: '/register',
        background_type: 'gradient',
        background_gradient: 'from-blue-600 to-purple-600',
      },
      styles: {
        background_color: 'transparent',
        color: '#ffffff',
        text_align: 'center',
        padding_top: '6rem',
        padding_bottom: '6rem',
      },
      layout: 12,
      container: 'container',
    },
    // Footer
    {
      id: `block-${now}-8`,
      type: 'footer',
      data: {
        columns: [
          {
            title: 'VTCBuilder',
            description: 'La plateforme SaaS complète pour créer et gérer votre site VTC professionnel.',
            links: [],
          },
          {
            title: 'Produit',
            links: [
              { label: 'Tarifs', url: '/#pricing' },
              { label: 'Fonctionnalités', url: '/features' },
              { label: 'Templates', url: '/templates' },
            ],
          },
          {
            title: 'Support',
            links: [
              { label: 'Documentation', url: '/docs' },
              { label: 'Contact', url: '/contact' },
              { label: 'FAQ', url: '/faq' },
            ],
          },
          {
            title: 'Légal',
            links: [
              { label: 'CGV', url: '/legal/terms' },
              { label: 'Confidentialité', url: '/legal/privacy' },
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} VTCBuilder. Tous droits réservés.`,
        additional_text: 'vtcbuilder.com - Développé avec ❤️ en France',
      },
      styles: {
        background_color: '#f3f4f6',
        padding_top: '3rem',
        padding_bottom: '2rem',
      },
      layout: 12,
      container: 'container',
    },
  ]
}

export default function HomepageEditorPage() {
  const router = useRouter()
  
  // Supprimer complètement l'error 403 de la console pour /system-settings/
  // Utiliser useRef pour stocker la fonction originale et éviter les re-renders
  const originalErrorRef = useRef<typeof console.error | null>(null)
  const isSetupRef = useRef(false)
  
  useEffect(() => {
    // Ne configurer qu'une seule fois
    if (isSetupRef.current) {
      return
    }
    
    // Stocker la fonction originale une seule fois
    if (!originalErrorRef.current) {
      originalErrorRef.current = console.error.bind(console)
    }
    
    // Créer une nouvelle fonction qui filtre les erreurs
    const filteredError = (...args: any[]) => {
      // Filtrer les erreurs 403 pour /system-settings/
      const errorString = args.join(' ')
      if (errorString.includes('403') && errorString.includes('/system-settings/')) {
        return // Ne pas logger cette erreur
      }
      // Appeler la fonction originale
      if (originalErrorRef.current) {
        originalErrorRef.current.apply(console, args)
      }
    }
    
    // Remplacer console.error
    console.error = filteredError
    isSetupRef.current = true
    
    return () => {
      // Restaurer la fonction originale au démontage
      if (originalErrorRef.current) {
        console.error = originalErrorRef.current
        isSetupRef.current = false
      }
    }
  }, []) // Dépendances vides - ne s'exécute qu'une fois
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [blockTypes, setBlockTypes] = useState<BlockType[]>([])
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [showPreview, setShowPreview] = useState(true)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [showSeoModal, setShowSeoModal] = useState(false)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [availablePages, setAvailablePages] = useState<Array<{ slug: string; title: string }>>([])
  const [headerVisible, setHeaderVisible] = useState(true)
  const [inspectorMode, setInspectorMode] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  // SEO avancé
  const [ogTitle, setOgTitle] = useState('')
  const [ogDescription, setOgDescription] = useState('')
  const [ogImage, setOgImage] = useState('')
  const [twitterCardType, setTwitterCardType] = useState('summary')
  const [twitterImage, setTwitterImage] = useState('')
  const [metaKeywords, setMetaKeywords] = useState('')
  const [canonicalUrl, setCanonicalUrl] = useState('')
  const [robots, setRobots] = useState('index, follow')
  const [pageStatus, setPageStatus] = useState<'draft' | 'published'>('draft')
  const [editorWidth, setEditorWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('editor-width')
      if (saved) return parseInt(saved, 10)
    }
    return 600 // Largeur par défaut plus grande pour la zone de placement
  })
  const [isResizingEditor, setIsResizingEditor] = useState(false)
  const [previewLinksEnabled, setPreviewLinksEnabled] = useState(false) // Par défaut, les liens sont désactivés
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light') // Thème de la prévisualisation uniquement
  const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('palette-collapsed')
      return saved === 'true'
    }
    return false
  }) // État de la palette (réduite ou non)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  // État initial pour détecter les changements
  const initialDataRef = useRef<{
    blocks: Block[]
    metaTitle: string
    metaDescription: string
    ogTitle: string
    ogDescription: string
    ogImage: string
    twitterCardType: string
    twitterImage: string
    metaKeywords: string
    canonicalUrl: string
    robots: string
    pageStatus: 'draft' | 'published'
  } | null>(null)
  
  // Fonction pour comparer l'état actuel avec l'état initial
  const hasChanges = useCallback(() => {
    if (!initialDataRef.current) return false
    
    const current = {
      blocks,
      metaTitle,
      metaDescription,
      ogTitle,
      ogDescription,
      ogImage,
      twitterCardType,
      twitterImage,
      metaKeywords,
      canonicalUrl,
      robots,
      pageStatus,
    }
    
    const initial = initialDataRef.current
    
    // Comparer les blocs (comparaison profonde)
    if (JSON.stringify(current.blocks) !== JSON.stringify(initial.blocks)) {
      return true
    }
    
    // Comparer les autres champs
    return (
      current.metaTitle !== initial.metaTitle ||
      current.metaDescription !== initial.metaDescription ||
      current.ogTitle !== initial.ogTitle ||
      current.ogDescription !== initial.ogDescription ||
      current.ogImage !== initial.ogImage ||
      current.twitterCardType !== initial.twitterCardType ||
      current.twitterImage !== initial.twitterImage ||
      current.metaKeywords !== initial.metaKeywords ||
      current.canonicalUrl !== initial.canonicalUrl ||
      current.robots !== initial.robots ||
      current.pageStatus !== initial.pageStatus
    )
  }, [blocks, metaTitle, metaDescription, ogTitle, ogDescription, ogImage, twitterCardType, twitterImage, metaKeywords, canonicalUrl, robots, pageStatus])

  // Fonction pour charger les données
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Load homepage data and block types in parallel
      const [homepageResponse, blockTypesData] = await Promise.all([
        api.get('/system-settings/'),
        blocksService.getBlockTypes()
      ])
      
      const data = homepageResponse.data
      
      // Charger les blocs existants ou créer depuis le backup
      if (data.public_homepage_blocks && data.public_homepage_blocks.length > 0) {
        setBlocks(data.public_homepage_blocks)
      } else if (!data.public_homepage_blocks_initialized) {
        // Créer les blocs par défaut depuis le backup
        const defaultBlocks = createDefaultHomepageBlocks()
        setBlocks(defaultBlocks)
        // Sauvegarder les blocs par défaut et marquer comme initialisé
        await api.patch('/system-settings/', {
          public_homepage_blocks: defaultBlocks,
          public_homepage_blocks_initialized: true,
        })
      } else {
        setBlocks([])
      }
      
      setMetaTitle(data.public_homepage_meta_title || 'VTCBuilder - Le WordPress des chauffeurs VTC')
      setMetaDescription(data.public_homepage_meta_description || 'Plateforme complète pour créer et gérer votre site VTC professionnel')
      setOgTitle(data.public_homepage_og_title || '')
      setOgDescription(data.public_homepage_og_description || '')
      setOgImage(data.public_homepage_og_image || '')
      setTwitterCardType(data.public_homepage_twitter_card_type || 'summary')
      setTwitterImage(data.public_homepage_twitter_image || '')
      setMetaKeywords(data.public_homepage_meta_keywords || '')
      setCanonicalUrl(data.public_homepage_canonical_url || '')
      setRobots(data.public_homepage_robots || 'index, follow')
      setPageStatus(data.public_homepage_status || 'draft')
      
      // Sauvegarder l'état initial après le chargement pour détecter les changements
      const loadedBlocks = data.public_homepage_blocks && data.public_homepage_blocks.length > 0
        ? data.public_homepage_blocks
        : (!data.public_homepage_blocks_initialized ? createDefaultHomepageBlocks() : [])
      
      initialDataRef.current = {
        blocks: JSON.parse(JSON.stringify(loadedBlocks)), // Deep copy
        metaTitle: data.public_homepage_meta_title || 'VTCBuilder - Le WordPress des chauffeurs VTC',
        metaDescription: data.public_homepage_meta_description || 'Plateforme complète pour créer et gérer votre site VTC professionnel',
        ogTitle: data.public_homepage_og_title || '',
        ogDescription: data.public_homepage_og_description || '',
        ogImage: data.public_homepage_og_image || '',
        twitterCardType: data.public_homepage_twitter_card_type || 'summary',
        twitterImage: data.public_homepage_twitter_image || '',
        metaKeywords: data.public_homepage_meta_keywords || '',
        canonicalUrl: data.public_homepage_canonical_url || '',
        robots: data.public_homepage_robots || 'index, follow',
        pageStatus: data.public_homepage_status || 'draft',
      }
      
      // PHASE DE VALIDATION : Ne garder que quelques blocs pour tester étape par étape
      // Étape 1 : Blocs de mise en page de base (1-3 blocs max)
      // Pour activer les phases, définir NEXT_PUBLIC_BLOCK_VALIDATION_PHASE dans frontend/.env.local
      // Voir PHASES_VALIDATION.md pour la documentation complète
      const validationPhase = typeof window !== 'undefined' 
        ? (window as any).__BLOCK_VALIDATION_PHASE__ || process.env.NEXT_PUBLIC_BLOCK_VALIDATION_PHASE || '1'
        : process.env.NEXT_PUBLIC_BLOCK_VALIDATION_PHASE || '1'
      let filteredBlockTypes = blockTypesData
      
      // Filtrer uniquement les blocs actifs
      filteredBlockTypes = filteredBlockTypes.filter(bt => bt.is_active)
      
      if (validationPhase === '1') {
        // Phase 1 : Seulement les blocs de mise en page de base
        filteredBlockTypes = filteredBlockTypes.filter(bt => 
          ['heading', 'text', 'container'].includes(bt.name)
        )
      } else if (validationPhase === '2') {
        // Phase 2 : Ajouter un bloc conteneur
        filteredBlockTypes = filteredBlockTypes.filter(bt => 
          ['heading', 'text', 'container', 'columns'].includes(bt.name)
        )
      } else if (validationPhase === '3') {
        // Phase 3 : Ajouter des blocs de contenu avancés
        filteredBlockTypes = filteredBlockTypes.filter(bt => 
          ['heading', 'text', 'container', 'columns', 'paragraph', 'button', 'image', 'line'].includes(bt.name)
        )
      }
      // Phase 4+ : Tous les blocs actifs (pas de filtre supplémentaire)
      
      setBlockTypes(filteredBlockTypes)
      
      // Charger les pages publiques disponibles
      const allPages: Array<{ slug: string; title: string }> = []
      const existingSlugs = new Set<string>()
      
      // Homepage - toujours ajouter en premier si elle existe
      if (data.public_homepage_blocks !== undefined) {
        allPages.push({
          slug: 'home',
          title: 'Page d\'accueil',
        })
        existingSlugs.add('home')
      }
      
      // Autres pages publiques (public_pages est un objet, pas un tableau)
      if (data.public_pages && typeof data.public_pages === 'object' && !Array.isArray(data.public_pages)) {
        Object.entries(data.public_pages).forEach(([slug, pageData]: [string, any]) => {
          // Éviter les doublons (home et autres)
          if (!existingSlugs.has(slug)) {
            // Utiliser le titre depuis pageData si disponible, sinon générer depuis le slug
            const title = pageData?.title || slug
              .split('/')
              .map(part => part.charAt(0).toUpperCase() + part.slice(1))
              .join(' / ')
            allPages.push({ slug, title })
            existingSlugs.add(slug)
          }
        })
      }
      
      setAvailablePages(allPages)
    } catch (error: any) {
      console.error('Error chargement:', error)
      toast.error('Error lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fonction de sauvegarde automatique
  const handleAutoSave = useCallback(async (data: any) => {
    // Vérifier si l'utilisateur est super admin avant de sauvegarder
    if (!authService.isSuperAdmin()) {
      // Ne pas sauvegarder si l'utilisateur n'est pas super admin
      // Ne pas logger pour éviter de polluer la console
      return
    }
    
    // Vérifier que le token est présent
    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('Token manquant pour la sauvegarde automatique')
      return
    }
    
    try {
      const response = await api.patch('/system-settings/', {
        public_homepage_blocks: data.blocks,
        public_homepage_meta_title: data.metaTitle,
        public_homepage_meta_description: data.metaDescription,
        public_homepage_og_title: data.ogTitle,
        public_homepage_og_description: data.ogDescription,
        public_homepage_og_image: data.ogImage,
        public_homepage_twitter_card_type: data.twitterCardType,
        public_homepage_twitter_image: data.twitterImage,
        public_homepage_meta_keywords: data.metaKeywords,
        public_homepage_canonical_url: data.canonicalUrl,
        public_homepage_robots: data.robots,
        public_homepage_status: data.pageStatus,
      })
      // Si la réponse est un 403 silencieux, ne rien faire
      if (response.status === 403) {
        return
      }
    } catch (error: any) {
      // Ne pas logger les erreurs 403 ou les erreurs de cancellation - c'est normal si l'utilisateur n'est pas super admin
      // L'intercepteur devrait déjà les gérer silencieusement, mais on s'assure ici aussi
      if (error.response?.status === 403 || error.status === 403 || (error.__CANCEL__ && error.message?.includes('Not super admin'))) {
        // Retourner silencieusement sans logger
        return
      }
      // Pour les autres erreurs, les logger
      console.error('Error lors de la sauvegarde automatique:', error)
    }
  }, [])

  // Sauvegarde automatique - Désactivée si l'utilisateur n'est pas super admin
  const { isSaving: isAutoSaving, lastSaved, updateLastSaved } = useAutoSave({
    data: { 
      blocks, 
      metaTitle, 
      metaDescription,
      ogTitle,
      ogDescription,
      ogImage,
      twitterCardType,
      twitterImage,
      metaKeywords,
      canonicalUrl,
      robots,
      pageStatus,
    },
    onSave: handleAutoSave,
    debounceMs: 2000,
    enabled: authService.isSuperAdmin(), // Désactiver complètement si l'utilisateur n'est pas super admin
  })

  useEffect(() => {
    if (!authService.isSuperAdmin()) {
      router.push('/dashboard')
      return
    }
    loadData()
  }, [router, loadData])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await api.patch('/system-settings/', {
        public_homepage_blocks: blocks,
        public_homepage_meta_title: metaTitle,
        public_homepage_meta_description: metaDescription,
        public_homepage_og_title: ogTitle,
        public_homepage_og_description: ogDescription,
        public_homepage_og_image: ogImage,
        public_homepage_twitter_card_type: twitterCardType,
        public_homepage_twitter_image: twitterImage,
        public_homepage_meta_keywords: metaKeywords,
        public_homepage_canonical_url: canonicalUrl,
        public_homepage_robots: robots,
        public_homepage_status: pageStatus,
        public_homepage_published_at: pageStatus === 'published' ? new Date().toISOString() : null,
      })
      // Mettre à jour le timestamp de dernière sauvegarde
      updateLastSaved()
      
      // Mettre à jour l'état initial après sauvegarde pour réinitialiser la détection de changements
      initialDataRef.current = {
        blocks: JSON.parse(JSON.stringify(blocks)), // Deep copy
        metaTitle,
        metaDescription,
        ogTitle,
        ogDescription,
        ogImage,
        twitterCardType,
        twitterImage,
        metaKeywords,
        canonicalUrl,
        robots,
        pageStatus,
      }
      
      toast.success(pageStatus === 'published' ? 'Page publiée avec succès !' : 'Brouillon sauvegardé avec succès !')
    } catch (error: any) {
      console.error('Error sauvegarde:', error)
      toast.error(error.response?.data?.error || 'Error lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }, [blocks, metaTitle, metaDescription, ogTitle, ogDescription, ogImage, twitterCardType, twitterImage, metaKeywords, canonicalUrl, robots, pageStatus, updateLastSaved])

  // Gestion du raccourci clavier Ctrl+S (ou Cmd+S sur Mac) pour sauvegarder
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S (Windows/Linux) ou Cmd+S (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault() // Empêcher le comportement par défaut (sauvegarde de la page)
        
        // Ne pas sauvegarder si on est déjà en train de sauvegarder
        if (saving || isAutoSaving) {
          return
        }
        
        // Sauvegarder seulement s'il y a des changements
        if (hasChanges()) {
          handleSave()
        } else {
          toast('Aucune modification à sauvegarder', { icon: 'ℹ️' })
        }
      }
    }

    // Ajouter l'écouteur d'événements au niveau du document
    // Cela fonctionne même si l'utilisateur est en train d'éditer un champ de formulaire ou un bloc
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleSave, saving, isAutoSaving, hasChanges])

  if (loading) {
    return (
      <AdminLayout title="Éditeur Site Publique" subtitle="Chargement...">
        <PageLoader />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title={
        <div className="flex items-center gap-3">
          <span>Éditeur Page d'Accueil Publique</span>
          <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full border border-blue-300 dark:border-blue-700">
            Mode Direct
          </span>
        </div>
      }
      subtitle={
        <div className="flex flex-col gap-1">
          <span>Éditeur dédié pour la page d'accueil publique (public_homepage_blocks)</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ⚠️ Différent de l'éditeur de pages publiques générique
          </span>
        </div>
      }
      hideHeader={!headerVisible}
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
            onClick={() => window.open('/', '_blank')}
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
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowMoreMenu(false)}
                />
                {/* Menu dropdown */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowSeoModal(true)
                      setShowMoreMenu(false)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Paramètres SEO
                  </button>
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
                            router.push(`/admin/pages-public/edit/${page.slug}`)
                            setShowMoreMenu(false)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {page.title}
                        </button>
                      ))}
                    </>
                  )}
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
                    Gérer les projets
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
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
    >
      {/* Panneau d'information pour distinguer cet éditeur */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Éditeur dédié - Page d'Accueil Publique
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Cet éditeur modifie directement <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/40 rounded text-xs">public_homepage_blocks</code> dans les paramètres système. 
              C'est l'éditeur principal pour la page d'accueil publique du site.
            </p>
          </div>
        </div>
      </div>
      
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
            onClick={handleSave}
            disabled={saving || isAutoSaving || !hasChanges()}
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
          
          {/* Bouton Toggle Palette - Icon only */}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex flex-col h-[calc(100vh-240px)]">
        {/* Main Editor Area - 3 colonnes : Palette | Éditeur | Prévisualisation */}
        <EditorResizableLayout>
          {({ sidebarWidth, setSidebarWidth, isResizing, startResize }) => {
            const startResizeEditor = (e: React.MouseEvent) => {
              setIsResizingEditor(true)
              const startX = e.clientX
              const startWidth = editorWidth

              const handleMouseMove = (e: MouseEvent) => {
                const diff = e.clientX - startX
                const newWidth = Math.max(400, Math.min(800, startWidth + diff))
                setEditorWidth(newWidth)
                if (typeof window !== 'undefined') {
                  localStorage.setItem('editor-width', newWidth.toString())
                }
              }

              const handleMouseUp = () => {
                setIsResizingEditor(false)
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
              }

              document.addEventListener('mousemove', handleMouseMove)
              document.addEventListener('mouseup', handleMouseUp)
            }

            return (
            <div className="flex-1 flex overflow-hidden">
              {/* Colonne 1 - Palette de blocs */}
              <div 
                className="border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col flex-shrink-0 bg-white dark:bg-gray-900 transition-all duration-300"
                style={{ 
                  width: isPaletteCollapsed ? '48px' : `${sidebarWidth}px`, 
                  minWidth: isPaletteCollapsed ? '48px' : '300px', 
                  maxWidth: isPaletteCollapsed ? '48px' : '40%' 
                }}
              >
                {isPaletteCollapsed ? (
                  // Palette réduite - juste une icône
                  <div className="flex flex-col items-center py-4 gap-2">
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
                ) : (
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <BlockEditor 
                      blocks={blocks}
                      onChange={setBlocks}
                      availableBlockTypes={blockTypes.length > 0 ? blockTypes : undefined}
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
                )}
              </div>

              {/* Resize Handle 1 - Entre Palette et Éditeur */}
              {!isPaletteCollapsed && (
                <div
                  onMouseDown={startResize}
                  className={`w-2 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-600 cursor-col-resize flex-shrink-0 transition-colors ${
                    isResizing ? 'bg-blue-500 dark:bg-blue-600' : ''
                  }`}
                  style={{ userSelect: 'none' }}
                  title="Redimensionner la palette"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-1 h-16 bg-gray-400 dark:bg-gray-500 rounded"></div>
                  </div>
                </div>
              )}

              {/* Colonne 2 - Zone de placement des blocs (zone centrale principale) */}
              <div 
                className="border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col flex-shrink-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
                style={{ width: `${editorWidth}px`, minWidth: '500px', maxWidth: '60%' }}
              >
                <div className="bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      📝 Zone de placement des blocs
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      Glissez-déposez les blocs ici
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <BlockEditor 
                    blocks={blocks}
                    onChange={setBlocks}
                    availableBlockTypes={blockTypes.length > 0 ? blockTypes : undefined}
                    onBlockSelect={setSelectedBlockId}
                    selectedBlockId={selectedBlockId}
                    showBlocksPalette={false} // Masquer la palette (déjà dans la colonne 1)
                    onUndoRedoChange={(canUndo, canRedo) => {
                      setCanUndo(canUndo)
                      setCanRedo(canRedo)
                    }}
                  />
                </div>
              </div>

              {/* Resize Handle 2 - Entre Éditeur et Prévisualisation */}
              <div
                onMouseDown={startResizeEditor}
                className={`w-2 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 dark:hover:bg-blue-600 cursor-col-resize flex-shrink-0 transition-colors ${
                  isResizingEditor ? 'bg-blue-500 dark:bg-blue-600' : ''
                }`}
                style={{ userSelect: 'none' }}
                title="Redimensionner l'éditeur"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-1 h-16 bg-gray-400 dark:bg-gray-500 rounded"></div>
                </div>
              </div>

              {/* Colonne 3 - Prévisualisation (toujours visible) */}
              {/* Wrapper isolé pour empêcher le thème global d'affecter la prévisualisation */}
              <div className="flex-1 overflow-hidden flex flex-col" style={{ 
                backgroundColor: previewTheme === 'dark' ? '#111827' : '#ffffff',
                color: previewTheme === 'dark' ? '#f9fafb' : '#111827'
              }}>
                <div 
                  className="border-b-2 px-4 py-3 flex items-center justify-between shadow-sm"
                  style={{
                    backgroundColor: previewTheme === 'dark' ? '#1f2937' : '#ffffff',
                    borderColor: previewTheme === 'dark' ? '#374151' : '#e5e7eb'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span 
                      className="text-sm font-semibold"
                      style={{ color: previewTheme === 'dark' ? '#f9fafb' : '#111827' }}
                    >
                      ✨ Édition en direct
                    </span>
                    {selectedBlockId && (
                      <span 
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: previewTheme === 'dark' ? 'rgba(30, 58, 138, 0.2)' : '#dbeafe',
                          color: previewTheme === 'dark' ? '#93c5fd' : '#1e40af'
                        }}
                      >
                        Bloc sélectionné
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Les contrôles ont été déplacés vers la barre d'outils principale */}
                  </div>
                </div>
                <div 
                  className="flex-1 overflow-hidden relative p-4"
                  style={{
                    backgroundColor: previewTheme === 'dark' ? '#111827' : '#ffffff'
                  }}
                >
                  {/* Device Frame */}
                  <div className={`h-full mx-auto transition-all duration-300 ${
                    previewMode === 'desktop' 
                      ? 'w-full max-w-full' 
                      : previewMode === 'tablet' 
                      ? 'w-full max-w-[768px]' 
                      : 'w-full max-w-[375px]'
                  }`}>
                    {/* Device Frame Border */}
                    <div 
                      className="h-full rounded-lg shadow-2xl overflow-hidden"
                      style={{
                        backgroundColor: previewTheme === 'dark' ? '#1f2937' : '#ffffff',
                        ...(previewMode !== 'desktop' && {
                          borderWidth: '32px',
                          borderStyle: 'solid',
                          borderColor: previewTheme === 'dark' ? '#374151' : '#d1d5db',
                          ...(previewMode === 'tablet' ? { borderRadius: '1.5rem 1.5rem 0 0' } : { borderRadius: '2.5rem' })
                        })
                      }}
                    >
                      {/* Device Notch (Mobile) */}
                      {previewMode === 'mobile' && (
                        <div 
                          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 rounded-b-2xl z-10"
                          style={{
                            backgroundColor: previewTheme === 'dark' ? '#374151' : '#d1d5db'
                          }}
                        ></div>
                      )}
                      {/* Preview Content - Editable */}
                      <div className={`h-full overflow-auto ${
                        previewMode === 'tablet' ? 'px-4' : previewMode === 'mobile' ? 'px-2' : ''
                      }`}>
                        {/* Isoler le thème de la prévisualisation de l'éditeur */}
                        {/* Utiliser un wrapper avec data-theme pour forcer le thème indépendamment de l'éditeur */}
                        <div 
                          className={`min-h-full ${
                            previewMode === 'tablet' ? 'max-w-[768px] mx-auto' : 
                            previewMode === 'mobile' ? 'max-w-[375px] mx-auto' : 
                            'w-full'
                          }`}
                          data-preview-theme={previewTheme}
                        >
                          {/* Wrapper avec classe dark conditionnelle - isolé de l'éditeur */}
                          {/* Ce div force le thème uniquement pour son contenu */}
                          {/* Utiliser un contexte isolé pour le thème de la prévisualisation */}
                          {/* Le thème est contrôlé uniquement par previewTheme, indépendamment de l'éditeur */}
                          {/* Important: La classe 'dark' ici force le thème sombre uniquement pour ce conteneur */}
                          <div 
                            className={`${previewTheme === 'dark' ? 'dark' : ''} min-h-full`}
                            data-preview-theme-isolated={previewTheme}
                            style={{
                              // Forcer le colorScheme pour isoler le thème
                              colorScheme: previewTheme === 'dark' ? 'dark' : 'light',
                              // Forcer le background pour que le thème soit visible
                              backgroundColor: previewTheme === 'dark' ? '#111827' : '#ffffff',
                              color: previewTheme === 'dark' ? '#f9fafb' : '#111827',
                            }}
                            // Forcer le thème sur tous les enfants via CSS
                            data-theme={previewTheme}
                          >
                            <BlockPreview 
                              blocks={blocks} 
                              blockTypes={blockTypes}
                              isEditable={false} // Désactiver l'édition dans la prévisualisation
                              isInteractive={previewLinksEnabled} // Activer/désactiver les interactions selon le toggle
                              selectedBlockId={selectedBlockId}
                              onBlockSelect={setSelectedBlockId}
                              theme={previewTheme} // Passer le thème à BlockPreview
                              onBlockDoubleClick={(blockId) => {
                                setSelectedBlockId(blockId)
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )
          }}
        </EditorResizableLayout>
      </div>

      {/* Modal SEO */}
      {showSeoModal && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[10000]"
            onClick={() => setShowSeoModal(false)}
          />
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Paramètres SEO</h2>
                <button
                  onClick={() => setShowSeoModal(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Basic SEO */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">SEO de base</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="modal_meta_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Titre SEO <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="modal_meta_title"
                        type="text"
                        value={metaTitle}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMetaTitle(e.target.value)}
                        className="w-full px-3 py-2 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Titre pour les moteurs de recherche (50-60 caractères)"
                        maxLength={60}
                      />
                      <p className="text-xs text-gray-500 mt-1">{metaTitle.length}/60 caractères</p>
                    </div>
                    <div>
                      <label htmlFor="modal_meta_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description SEO
                      </label>
                      <textarea
                        id="modal_meta_description"
                        value={metaDescription}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMetaDescription(e.target.value)}
                        className="w-full px-3 py-2 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Description pour les moteurs de recherche (150-160 caractères)"
                        rows={3}
                        maxLength={160}
                      />
                      <p className="text-xs text-gray-500 mt-1">{metaDescription.length}/160 caractères</p>
                    </div>
                  </div>
                </div>

                {/* Open Graph */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Open Graph (Réseaux sociaux)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        OG Title
                      </label>
                      <input
                        type="text"
                        value={ogTitle || metaTitle}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOgTitle(e.target.value)}
                        className="w-full px-3 py-2 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg"
                        placeholder="Titre pour Facebook, LinkedIn..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        OG Image URL
                      </label>
                      <input
                        type="url"
                        value={ogImage || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOgImage(e.target.value)}
                        className="w-full px-3 py-2 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        OG Description
                      </label>
                      <textarea
                        value={ogDescription || metaDescription}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOgDescription(e.target.value)}
                        className="w-full px-3 py-2 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg"
                        placeholder="Description pour les réseaux sociaux"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Twitter Cards */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Twitter Cards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type de carte
                      </label>
                      <select
                        value={twitterCardType || 'summary'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTwitterCardType(e.target.value)}
                        className="w-full px-3 py-2 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg"
                      >
                        <option value="summary">Summary</option>
                        <option value="summary_large_image">Summary Large Image</option>
                        <option value="app">App</option>
                        <option value="player">Player</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Twitter Image URL
                      </label>
                      <input
                        type="url"
                        value={twitterImage || ogImage || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTwitterImage(e.target.value)}
                        className="w-full px-3 py-2 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Meta */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Méta tags supplémentaires</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mots-clés (séparés par des virgules)
                      </label>
                      <input
                        type="text"
                        value={metaKeywords || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMetaKeywords(e.target.value)}
                        className="w-full px-3 py-2 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg"
                        placeholder="vtc, chauffeur, transport..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Canonical URL
                      </label>
                      <input
                        type="url"
                        value={canonicalUrl || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCanonicalUrl(e.target.value)}
                        className="w-full px-3 py-2 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Robots (indexation)
                      </label>
                      <select
                        value={robots || 'index, follow'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRobots(e.target.value)}
                        className="w-full px-3 py-2 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg"
                      >
                        <option value="index, follow">Indexer et suivre</option>
                        <option value="noindex, follow">Ne pas indexer, suivre</option>
                        <option value="index, nofollow">Indexer, ne pas suivre</option>
                        <option value="noindex, nofollow">Ne pas indexer, ne pas suivre</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setShowSeoModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
