'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams, usePathname } from 'next/navigation'
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
  const { saveEditorState } = useReconnect()
  const pageSlug = params?.slug as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [blockTypes, setBlockTypes] = useState<BlockType[]>([])
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [showPreview, setShowPreview] = useState(true)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [availablePages, setAvailablePages] = useState<Array<{ slug: string; title: string }>>([])
  const [headerVisible, setHeaderVisible] = useState(true)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [inspectorMode, setInspectorMode] = useState(false)
  const [blocksPaletteOpen, setBlocksPaletteOpen] = useState(false) // Popup des blocs disponibles fermée par défaut
  const [propertiesModalOpen, setPropertiesModalOpen] = useState(false)
  const [modalBlockId, setModalBlockId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ blockId: string; position: { x: number; y: number } } | null>(null)
  const [copiedBlock, setCopiedBlock] = useState<Block | null>(null)

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
      console.error('Erreur sauvegarde:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }, [blocks, metaTitle, metaDescription, status, handleSave, updateLastSaved])

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
      
      // Load block types and page data in parallel
      const [blockTypesData, settingsResponse] = await Promise.all([
        blocksService.getBlockTypes(),
        api.get('/system-settings/')
      ])
      
      setBlockTypes(blockTypesData)
      const data = settingsResponse.data
      
      // Load available pages for navigation
      const pagesList: Array<{ slug: string; title: string }> = []
      if (data.public_homepage_blocks !== undefined) {
        pagesList.push({ slug: 'home', title: 'Page d\'accueil' })
      }
      const otherPages = data.public_pages || {}
      Object.entries(otherPages).forEach(([slug, pageData]: [string, any]) => {
        pagesList.push({
          slug,
          title: pageData.title || PAGE_TITLES[slug] || slug.charAt(0).toUpperCase() + slug.slice(1),
        })
      })
      setAvailablePages(pagesList)
      
      // Load page data based on slug
      if (pageSlug === 'home') {
        // Charger les blocs existants, ou créer des blocs par défaut si aucun n'existe
        // pour reproduire la page actuelle affichée sur localhost:9494/
        let homepageBlocks = data.public_homepage_blocks || []
        
        // Si aucun bloc n'existe, créer des blocs par défaut correspondant à la page actuelle
        // Structure complète avec conteneurs : Container > Grid > Header, Hero, Features, Pricing, CTA, Footer
        if (homepageBlocks.length === 0) {
          const now = Date.now()
          
          // Créer les blocs de contenu
          const headerBlock = {
            id: `header-${now}`,
            type: 'header',
            data: {
              logo_text: 'VTCBuilder',
              badge: 'Beta',
              logo_url: '/',
              show_theme_toggle: true,
              sticky: true,
              links: [
                { label: 'Tarifs', url: '/#pricing' },
                { label: 'Fonctionnalités', url: '/features' },
                { label: 'Templates', url: '/templates' }
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
          
          const heroBlock = {
            id: `hero-${now}`,
            type: 'hero',
            data: {
              title: 'Le WordPress des Chauffeurs VTC',
              subtitle: 'Créez votre site VTC professionnel en quelques minutes. Gestion complète, réservations, paiements, tout inclus.',
              buttons: [
                { text: '🚀 Démarrer gratuitement', url: '/register', style: 'primary' },
                { text: 'Voir les tarifs', url: '#pricing', style: 'secondary' }
              ],
              background_image: '',
              background_gradient: 'from-blue-500 via-purple-600 to-pink-500'
            },
            styles: {
              padding: 'py-20 lg:py-32',
              textAlign: 'center',
              color: '#ffffff'
            }
          }
          
          const featuresBlock = {
            id: `features-${now}`,
            type: 'features-grid',
            data: {
              title: 'Tout ce dont vous avez besoin',
              subtitle: '',
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
              padding: 'py-20',
              backgroundColor: 'bg-white dark:bg-gray-800'
            }
          }
          
          const pricingBlock = {
            id: `pricing-${now}`,
            type: 'pricing',
            data: {
              title: 'Tarifs Transparents',
              subtitle: 'Choisissez le plan adapté à vos besoins. Pas d\'engagement, changez de plan à tout moment.',
              source: 'api',
              api_endpoint: '/api/billing/pricing-plans/',
              columns: 3
            },
            styles: {
              padding: 'py-20',
              backgroundColor: 'bg-gray-50 dark:bg-gray-900'
            }
          }
          
          const ctaBlock = {
            id: `cta-${now}`,
            type: 'cta-section',
            data: {
              title: 'Prêt à démarrer ?',
              subtitle: 'Créez votre site VTC professionnel dès aujourd\'hui. Essai gratuit de 14 jours.',
              button_text: '🚀 Créer mon compte gratuitement',
              button_url: '/register',
              background_gradient: 'from-blue-600 to-purple-600'
            },
            styles: {
              padding: 'py-20',
              textAlign: 'center'
            }
          }
          
          const footerBlock = {
            id: `footer-${now}`,
            type: 'footer',
            data: {
              columns: [
                {
                  title: 'VTCBuilder',
                  links: [],
                  description: 'La plateforme SaaS complète pour créer et gérer votre site VTC professionnel.'
                },
                {
                  title: 'Produit',
                  links: [
                    { label: 'Tarifs', url: '/#pricing' },
                    { label: 'Fonctionnalités', url: '/features' },
                    { label: 'Templates', url: '/templates' }
                  ]
                },
                {
                  title: 'Support',
                  links: [
                    { label: 'Documentation', url: '/docs' },
                    { label: 'Contact', url: '/contact' },
                    { label: 'FAQ', url: '/faq' }
                  ]
                },
                {
                  title: 'Légal',
                  links: [
                    { label: 'CGV', url: '/legal/terms' },
                    { label: 'Confidentialité', url: '/legal/privacy' }
                  ]
                }
              ],
              copyright: `© ${new Date().getFullYear()} VTCBuilder. Tous droits réservés.`,
              additional_text: 'vtcbuilder.com - Développé avec ❤️ en France'
            },
            styles: {
              backgroundColor: 'bg-gray-900',
              color: 'text-white',
              padding: 'py-12'
            }
          }
          
          // Créer la structure avec conteneurs
          // Container principal > Grid Container > Blocs de contenu
          const gridContainer = {
            id: `grid-container-${now}`,
            type: 'grid-container',
            data: {
              columns: 1,  // 1 colonne pour empiler verticalement les blocs
              gap: 'gap-6',  // Espacement entre les blocs
              template_columns: '1fr',  // Template CSS Grid
              auto_rows: 'auto'  // Hauteur automatique pour les lignes
            },
            styles: {
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1.5rem'
            },
            children: [headerBlock, heroBlock, featuresBlock, pricingBlock, ctaBlock, footerBlock]
          }
          
          const mainContainer = {
            id: `container-${now}`,
            type: 'container',
            data: {
              max_width: 'max-w-7xl',
              padding: 'px-4 sm:px-6 lg:px-8',
              margin: 'mx-auto'
            },
            styles: {
              maxWidth: '80rem',  // max-w-7xl
              margin: '0 auto',
              padding: '0 1rem'
            },
            children: [gridContainer]
          }
          
          homepageBlocks = [mainContainer]
        } else {
          // Si des blocs existent, s'assurer qu'ils ont la structure correcte (data au lieu de properties)
          homepageBlocks = homepageBlocks.map((block: any) => {
            // Convertir l'ancienne structure (properties) vers la nouvelle (data)
            if (block.properties && !block.data) {
              return {
                ...block,
                data: block.properties,
                styles: block.styles || {}
              }
            }
            // S'assurer que le bloc hero a la couleur blanche si elle n'est pas définie
            if (block.type === 'hero' && (!block.styles || !block.styles.color)) {
              return {
                ...block,
                styles: {
                  ...block.styles,
                  color: '#ffffff'
                }
              }
            }
            return block
          })
        }
        
        console.log('Blocs chargés pour la page d\'accueil:', homepageBlocks.length, homepageBlocks)
        setBlocks(homepageBlocks)
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
            console.error('Erreur sauvegarde structure par défaut:', error)
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
      console.error('Erreur chargement:', error)
      toast.error('Erreur lors du chargement des données')
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

  // Restaurer l'état après reconnexion
  useEffect(() => {
    const handleReconnectSuccess = () => {
      if (pathname) {
        const restored = restoreEditorStateAfterReconnect(pathname)
        if (restored) {
          if (restored.blocks) setBlocks(restored.blocks)
          if (restored.metaTitle) setMetaTitle(restored.metaTitle)
          if (restored.metaDescription) setMetaDescription(restored.metaDescription)
          if (restored.status) setStatus(restored.status)
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
      title={`Éditer ${PAGE_TITLES[pageSlug] || pageSlug}`}
      subtitle={`Créez et personnalisez la page ${pageSlug === 'home' ? 'd\'accueil' : pageSlug} avec l'éditeur de blocs complet`}
      hideHeader={!headerVisible}
      saveStatus={
        <div className="flex items-center gap-2">
          {isAutoSaving ? (
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs sm:text-sm whitespace-nowrap">
              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent flex-shrink-0"></div>
              <span className="hidden sm:inline">Sauvegarde...</span>
              <span className="sm:hidden">...</span>
            </div>
          ) : lastSaved ? (
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-xs sm:text-sm whitespace-nowrap">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="hidden sm:inline">Sauvegardé {lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="sm:hidden">{lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ) : null}
          {/* Header Toggle - À côté de l'indicateur de sauvegarde */}
          <button
            onClick={() => setHeaderVisible(!headerVisible)}
            className="p-2 rounded-lg transition-colors flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            title={headerVisible ? 'Masquer la barre supérieure' : 'Afficher la barre supérieure'}
          >
            {headerVisible ? (
              <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
      }
      headerActions={
        <div className="flex flex-row gap-2 sm:gap-3 flex-wrap items-center w-full">
          {/* Page Selector - Isolated for better readability */}
          {availablePages.length > 1 && (
            <div className="flex items-center gap-2 pr-2 sm:pr-3 border-r border-gray-300 dark:border-gray-600">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                Page:
              </label>
              <select
                value={pageSlug}
                onChange={(e) => {
                  router.push(`/admin/pages-public/${e.target.value}/edit`)
                }}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm font-medium min-w-[150px] sm:min-w-[180px]"
              >
                {availablePages.map((page) => (
                  <option key={page.slug} value={page.slug}>
                    {page.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Inspector Mode Toggle - Only when preview is visible */}
          {showPreview && (
            <button
              onClick={() => setInspectorMode(!inspectorMode)}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                inspectorMode 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title="Mode Inspecteur (comme DevTools)"
            >
              <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">{inspectorMode ? 'Désactiver' : 'Activer'} Inspecteur</span>
              <span className="sm:hidden">🔍</span>
            </button>
          )}

          {/* Preview Toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              showPreview 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="hidden sm:inline">{showPreview ? 'Masquer' : 'Afficher'} Prévisualisation</span>
            <span className="sm:hidden">{showPreview ? 'Masquer' : 'Afficher'}</span>
          </button>

          {/* Preview Mode Selector */}
          {showPreview && (
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`px-2 sm:px-3 py-1 rounded text-sm transition-colors ${
                  previewMode === 'desktop'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
                title="Desktop"
              >
                💻
              </button>
              <button
                onClick={() => setPreviewMode('tablet')}
                className={`px-2 sm:px-3 py-1 rounded text-sm transition-colors ${
                  previewMode === 'tablet'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
                title="Tablette"
              >
                📱
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`px-2 sm:px-3 py-1 rounded text-sm transition-colors ${
                  previewMode === 'mobile'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
                title="Mobile"
              >
                📱
              </button>
            </div>
          )}

          {/* External Preview */}
          <button
            onClick={() => window.open(`/${pageSlug === 'home' ? '' : pageSlug}`, '_blank')}
            className="px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="hidden sm:inline">Ouvrir dans un nouvel onglet</span>
            <span className="sm:hidden">Ouvrir</span>
          </button>

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
                
                // Naviguer vers l'éditeur de la nouvelle page
                router.push(`/admin/pages-public/${newSlug}/edit`)
              } catch (error) {
                console.error('Erreur création nouvelle page:', error)
                toast.error('Erreur lors de la création de la nouvelle page')
              }
            }}
            className="p-2 sm:p-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            title="Créer une nouvelle page"
          >
            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <svg className="h-4 w-4 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>

          {/* Blocs Disponibles Button */}
          <button
            onClick={() => setBlocksPaletteOpen(!blocksPaletteOpen)}
            className={`px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              blocksPaletteOpen 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title="Blocs disponibles"
          >
            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
            </svg>
            <span className="hidden sm:inline">Blocs</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleManualSave}
            disabled={saving || isAutoSaving}
            className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white flex-shrink-0"></div>
                <span className="hidden sm:inline">Sauvegarde...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Sauvegarder</span>
              </>
            )}
          </button>

          {/* Close Button */}
          <button
            onClick={() => router.push('/admin/projects/1')}
            className="p-2 sm:p-2.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
            title="Quitter l'éditeur"
          >
            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    >
      {/* Bouton flottant pour réafficher la barre quand elle est masquée */}
      {!headerVisible && (
        <button
          onClick={() => setHeaderVisible(true)}
          className="fixed top-4 right-4 z-50 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg transition-all flex items-center gap-2 group"
          title="Afficher la barre supérieure"
        >
          <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span className="hidden sm:inline">Afficher Barre</span>
          <span className="sm:hidden">↑</span>
        </button>
      )}

      <div className="flex flex-col h-full min-h-0 overflow-hidden">
        {/* SEO Settings Bar */}
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
              Titre SEO
            </label>
            <input
              id="meta_title"
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Titre pour les moteurs de recherche"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="meta_description" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description SEO
            </label>
            <input
              id="meta_description"
              type="text"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Description pour les moteurs de recherche"
            />
          </div>
        </div>

        {/* Main Editor Area with Split View - 1/3 éditeur, 2/3 prévisualisation */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Editor Section - Toujours 1/3 */}
          <div className={`${showPreview ? 'w-1/3' : 'w-full'} border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col transition-all duration-300 min-h-0`}>
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
                availableBlockTypes={blockTypes.length > 0 ? blockTypes : undefined}
                selectedBlockId={selectedBlockId}
                onBlockSelect={setSelectedBlockId}
                showBlocksPalette={false} // Désactiver la sidebar de blocs (popup externe)
              />
            </div>
            </div>
          </div>

          {/* Preview Section - Toujours 2/3 */}
          {showPreview && (
            <div className={`w-2/3 border-l border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col transition-all duration-300 ${
              previewMode === 'tablet' ? 'max-w-2xl mx-auto' : previewMode === 'mobile' ? 'max-w-md mx-auto' : ''
            }`}>
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
            // Trouver le bloc dans l'arbre
            const findBlock = (blocks: Block[], id: string): Block | null => {
              for (const block of blocks) {
                if (block.id === id) return block
                if (block.children) {
                  const found = findBlock(block.children, id)
                  if (found) return found
                }
              }
              return null
            }
            return findBlock(blocks, modalBlockId)
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
    </AdminLayout>
  )
}

