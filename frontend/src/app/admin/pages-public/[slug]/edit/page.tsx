'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/admin/AdminLayout'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import BlockEditor, { Block } from '@/components/editor/BlockEditor'
import BlockPreview from '@/components/editor/BlockPreview'
import blocksService, { BlockType } from '@/services/blocks.service'
import PageLoader from '@/components/shared/PageLoader'
import { useAutoSave } from '@/hooks/useAutoSave'

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

  // Sauvegarde automatique
  const { isSaving: isAutoSaving, lastSaved, updateLastSaved } = useAutoSave({
    data: { blocks, metaTitle, metaDescription, status },
    onSave: async (data) => {
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
    },
    debounceMs: 2000,
    enabled: true,
  })

  useEffect(() => {
    if (!authService.isSuperAdmin()) {
      router.push('/dashboard')
      return
    }
    loadData()
  }, [router, pageSlug])

  const loadData = async () => {
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
        // Structure complète : Header, Hero, Features, Pricing, CTA, Footer
        if (homepageBlocks.length === 0) {
          const now = Date.now()
          homepageBlocks = [
            // Header - Reproduit exactement PublicHeader
            {
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
            },
            {
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
                textAlign: 'center'
              }
            },
            {
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
            },
            {
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
            },
            {
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
            },
            // Footer - Reproduit exactement PublicFooter
            {
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
          ]
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
  }

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const settingsData: any = {}
      
      if (pageSlug === 'home') {
        // Sauvegarder les blocs
        settingsData.public_homepage_blocks = blocks
        // Ne publier que si le statut est explicitement 'published'
        // Sinon, garder en mode brouillon pour ne pas affecter la page publiée
        if (status === 'published') {
          settingsData.public_homepage_status = 'published'
        } else {
          settingsData.public_homepage_status = 'draft'
        }
        settingsData.public_homepage_meta_title = metaTitle
        settingsData.public_homepage_meta_description = metaDescription
      } else {
        // Get existing public pages
        const currentSettings = await api.get('/system-settings/')
        const publicPages = currentSettings.data.public_pages || {}
        
        // Update the specific page
        publicPages[pageSlug] = {
          ...publicPages[pageSlug],
          title: PAGE_TITLES[pageSlug] || pageSlug,
          blocks,
          meta_title: metaTitle,
          meta_description: metaDescription,
          is_active: publicPages[pageSlug]?.is_active !== false,
        }
        
        settingsData.public_pages = publicPages
      }
      
      await api.patch('/system-settings/', settingsData)
      // Mettre à jour le timestamp de dernière sauvegarde
      updateLastSaved()
      toast.success('Page sauvegardée avec succès !')
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }, [blocks, metaTitle, metaDescription, status, pageSlug, updateLastSaved])

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
                await handleSave()
                
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

          {/* Save Button */}
          <button
            onClick={handleSave}
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

        {/* Main Editor Area with Split View */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Editor Section */}
          <div className={`${showPreview ? 'w-1/2' : 'w-full'} border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col transition-all duration-300 min-h-0`}>
            <div className="flex-1 overflow-hidden min-h-0 h-full">
              <BlockEditor 
                blocks={blocks}
                onChange={setBlocks}
                availableBlockTypes={blockTypes.length > 0 ? blockTypes : undefined}
              />
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className={`w-1/2 border-l border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col transition-all duration-300 ${
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
                      <BlockPreview blocks={blocks} blockTypes={blockTypes} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

