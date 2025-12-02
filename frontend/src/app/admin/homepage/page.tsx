'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/admin/AdminLayout'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import BlockEditor, { Block } from '@/components/editor/BlockEditor'
import BlockPreview from '@/components/editor/BlockPreview'
import blocksService, { BlockType } from '@/services/blocks.service'
import PageLoader from '@/components/shared/PageLoader'
import { useAutoSave } from '@/hooks/useAutoSave'

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
        api_endpoint: '/api/billing/pricing-plans/',
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
        subtitle: 'Créez votre site VTC professionnel dès aujourd\'hui. Essai gratuit de 14 jours.',
        button_text: '🚀 Créer mon compte gratuitement',
        button_url: '/register',
        background_type: 'gradient',
        background_gradient: 'from-blue-600 to-purple-600',
      },
      styles: {
        background_color: 'transparent',
        color: '#ffffff',
        text_align: 'center',
        padding_top: '5rem',
        padding_bottom: '5rem',
      },
      layout: 12,
      container: 'container',
    },
  ]
}

export default function HomepageEditorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [blockTypes, setBlockTypes] = useState<BlockType[]>([])
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [showPreview, setShowPreview] = useState(true)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [showSeoExpanded, setShowSeoExpanded] = useState(false)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
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

  // Sauvegarde automatique
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
    onSave: async (data) => {
      await api.patch('/system-settings/', {
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
  }, [router])

  const loadData = async () => {
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
      setBlockTypes(blockTypesData)
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
      toast.success(pageStatus === 'published' ? 'Page publiée avec succès !' : 'Brouillon sauvegardé avec succès !')
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }, [blocks, metaTitle, metaDescription, ogTitle, ogDescription, ogImage, twitterCardType, twitterImage, metaKeywords, canonicalUrl, robots, pageStatus, updateLastSaved])

  if (loading) {
    return (
      <AdminLayout title="Éditeur Site Publique" subtitle="Chargement...">
        <PageLoader />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Éditeur Site Publique"
      subtitle="Créez et personnalisez votre site public avec l'éditeur de blocs complet"
      headerActions={
        <div className="flex gap-2 flex-wrap">
          {/* Preview Toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              showPreview 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {showPreview ? 'Masquer' : 'Afficher'} Prévisualisation
          </button>

          {/* Preview Mode Selector */}
          {showPreview && (
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
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
                className={`px-3 py-1 rounded text-sm transition-colors ${
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
                className={`px-3 py-1 rounded text-sm transition-colors ${
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
            onClick={() => window.open('/', '_blank')}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Voir le site
          </button>

          {/* Auto-save indicator */}
          {isAutoSaving ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
              <span>Sauvegarde...</span>
            </div>
          ) : lastSaved ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Sauvegardé {lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ) : null}

          {/* Status Selector */}
          <select
            value={pageStatus}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPageStatus(e.target.value as 'draft' | 'published')}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="draft">📝 Brouillon</option>
            <option value="published">✅ Publié</option>
          </select>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || isAutoSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {pageStatus === 'draft' ? 'Sauvegarder brouillon' : 'Publier'}
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="flex flex-col h-[calc(100vh-180px)]">
        {/* Page Selector - Quick Navigation */}
        <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Page:</span>
            <select
              value="home"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                if (e.target.value !== 'home') {
                  router.push(`/admin/pages-public/${e.target.value}/edit`)
                }
              }}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="home">Page d'accueil</option>
              <option value="docs">Documentation</option>
              <option value="contact">Contact</option>
              <option value="faq">FAQ</option>
            </select>
            <button
              onClick={() => router.push('/admin/pages-public')}
              className="ml-auto px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Gérer toutes les pages →
            </button>
          </div>
        </div>
        {/* SEO Settings Bar - Expandable */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <button
              onClick={() => setShowSeoExpanded(!showSeoExpanded)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="font-semibold text-gray-900 dark:text-gray-100">Paramètres SEO</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({metaTitle.length}/60 caractères)
                </span>
              </div>
              <svg className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${showSeoExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {showSeoExpanded && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
              {/* Basic SEO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="meta_title" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Titre SEO <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="meta_title"
                    type="text"
                    value={metaTitle}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMetaTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Titre pour les moteurs de recherche (50-60 caractères)"
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500 mt-1">{metaTitle.length}/60 caractères</p>
                </div>
                <div>
                  <label htmlFor="meta_description" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description SEO
                  </label>
                  <textarea
                    id="meta_description"
                    value={metaDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMetaDescription(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Description pour les moteurs de recherche (150-160 caractères)"
                    rows={2}
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">{metaDescription.length}/160 caractères</p>
                </div>
              </div>

              {/* Open Graph */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Open Graph (Réseaux sociaux)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      OG Title
                    </label>
                    <input
                      type="text"
                      value={ogTitle || metaTitle}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOgTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg"
                      placeholder="Titre pour Facebook, LinkedIn..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      OG Image URL
                    </label>
                    <input
                      type="url"
                      value={ogImage || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOgImage(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      OG Description
                    </label>
                    <textarea
                      value={ogDescription || metaDescription}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOgDescription(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg"
                      placeholder="Description pour les réseaux sociaux"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Twitter Cards */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Twitter Cards</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type de carte
                    </label>
                    <select
                      value={twitterCardType || 'summary'}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTwitterCardType(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg"
                    >
                      <option value="summary">Summary</option>
                      <option value="summary_large_image">Summary Large Image</option>
                      <option value="app">App</option>
                      <option value="player">Player</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Twitter Image URL
                    </label>
                    <input
                      type="url"
                      value={twitterImage || ogImage || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTwitterImage(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* Additional Meta */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Méta tags supplémentaires</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mots-clés (séparés par des virgules)
                    </label>
                    <input
                      type="text"
                      value={metaKeywords || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMetaKeywords(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg"
                      placeholder="vtc, chauffeur, transport..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      value={canonicalUrl || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCanonicalUrl(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Robots (indexation)
                    </label>
                    <select
                      value={robots || 'index, follow'}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRobots(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg"
                    >
                      <option value="index, follow">Indexer et suivre</option>
                      <option value="noindex, follow">Ne pas indexer, suivre</option>
                      <option value="index, nofollow">Indexer, ne pas suivre</option>
                      <option value="noindex, nofollow">Ne pas indexer, ne pas suivre</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Editor Area - Preview as Main Editing Space */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Block Palette */}
          <div className="w-64 lg:w-72 xl:w-80 border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <BlockEditor 
                blocks={blocks}
                onChange={setBlocks}
                availableBlockTypes={blockTypes.length > 0 ? blockTypes : undefined}
                onBlockSelect={setSelectedBlockId}
                selectedBlockId={selectedBlockId}
              />
            </div>
          </div>

          {/* Preview Section - Main Editing Space */}
          <div className="flex-1 border-l border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
            <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Édition en direct
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={previewMode}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPreviewMode(e.target.value as 'desktop' | 'tablet' | 'mobile')}
                  className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <option value="desktop">💻 Desktop</option>
                  <option value="tablet">📱 Tablette</option>
                  <option value="mobile">📱 Mobile</option>
                </select>
              </div>
            </div>
            <div className="flex-1 overflow-hidden relative bg-gray-100 dark:bg-gray-900 p-4">
              {/* Device Frame */}
              <div className={`h-full mx-auto transition-all duration-300 ${
                previewMode === 'desktop' 
                  ? 'w-full max-w-full' 
                  : previewMode === 'tablet' 
                  ? 'w-full max-w-[768px]' 
                  : 'w-full max-w-[375px]'
              }`}>
                {/* Device Frame Border */}
                <div className={`h-full bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden ${
                  previewMode === 'desktop' 
                    ? 'border-0' 
                    : previewMode === 'tablet' 
                    ? 'border-8 border-gray-800 dark:border-gray-700 rounded-t-3xl' 
                    : 'border-8 border-gray-800 dark:border-gray-700 rounded-[2.5rem]'
                }`}>
                  {/* Device Notch (Mobile) */}
                  {previewMode === 'mobile' && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 dark:bg-gray-700 rounded-b-2xl z-10"></div>
                  )}
                  {/* Preview Content - Editable */}
                  <div className={`h-full overflow-auto ${
                    previewMode === 'tablet' ? 'px-4' : previewMode === 'mobile' ? 'px-2' : ''
                  }`}>
                    <div className={`min-h-full ${
                      previewMode === 'tablet' ? 'max-w-[768px] mx-auto' : 
                      previewMode === 'mobile' ? 'max-w-[375px] mx-auto' : 
                      'w-full'
                    }`}>
                      <BlockPreview 
                        blocks={blocks} 
                        blockTypes={blockTypes}
                        isEditable={true}
                        isInteractive={true}
                        selectedBlockId={selectedBlockId}
                        onBlockSelect={setSelectedBlockId}
                        onBlockDoubleClick={(blockId) => {
                          setSelectedBlockId(blockId)
                          // Le BlockEditor ouvrira automatiquement le panneau de paramètres
                        }}
                        onBlocksChange={setBlocks}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
