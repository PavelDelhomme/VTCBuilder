'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/AdminLayout'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import BlockEditor, { Block } from '@/components/editor/BlockEditor'
import BlockPreview from '@/components/editor/BlockPreview'
import blocksService, { BlockType } from '@/services/blocks.service'
import PageLoader from '@/components/PageLoader'
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

  // Sauvegarde automatique
  const { isSaving: isAutoSaving, lastSaved, updateLastSaved } = useAutoSave({
    data: { blocks, metaTitle, metaDescription, status },
    onSave: async (data) => {
      const settingsData: any = {}
      
      if (pageSlug === 'home') {
        settingsData.public_homepage_blocks = data.blocks
        settingsData.public_homepage_status = data.status
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
      
      // Load page data based on slug
      if (pageSlug === 'home') {
        setBlocks(data.public_homepage_blocks || [])
        setStatus(data.public_homepage_status || 'draft')
        setMetaTitle(data.public_homepage_meta_title || 'VTCBuilder - Le WordPress des chauffeurs VTC')
        setMetaDescription(data.public_homepage_meta_description || 'Plateforme complète pour créer et gérer votre site VTC professionnel')
      } else {
        // Load other public pages
        const publicPages = data.public_pages || {}
        const pageData = publicPages[pageSlug] || {}
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
        settingsData.public_homepage_blocks = blocks
        settingsData.public_homepage_status = status
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
            onClick={() => window.open(`/${pageSlug === 'home' ? '' : pageSlug}`, '_blank')}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Ouvrir dans un nouvel onglet
          </button>

          {/* New Page Button */}
          <button
            onClick={async () => {
              // Sauvegarder la page actuelle avant de créer une nouvelle
              try {
                await handleSave()
                // Créer une nouvelle page avec un slug unique
                const newSlug = prompt('Entrez le slug de la nouvelle page (ex: ma-nouvelle-page):')
                if (newSlug && newSlug.trim()) {
                  const slug = newSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')
                  // Naviguer vers l'éditeur de la nouvelle page
                  router.push(`/admin/pages-public/${slug}/edit`)
                }
              } catch (error) {
                toast.error('Erreur lors de la sauvegarde')
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle page
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
                Sauvegarder
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="flex flex-col h-[calc(100vh-180px)]">
        {/* SEO Settings Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex gap-4 items-center flex-wrap">
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
        <div className="flex-1 flex overflow-hidden">
          {/* Editor Section */}
          <div className={`${showPreview ? 'w-1/2' : 'w-full'} border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col transition-all duration-300`}>
            <div className="flex-1 overflow-hidden">
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
                    <BlockPreview blocks={blocks} blockTypes={blockTypes} />
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

