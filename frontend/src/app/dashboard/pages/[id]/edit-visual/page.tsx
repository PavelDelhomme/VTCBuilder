'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import TenantLayout from '@/components/tenant/TenantLayout'
import pageService, { Page } from '@/services/page.service'
import BlockEditor from '@/components/editor/BlockEditor'
import { Block } from '@/components/editor/types'
import BlockPreview from '@/components/editor/BlockPreview'
import blocksService, { BlockType } from '@/services/blocks.service'
import toast from 'react-hot-toast'
import { useAutoSave } from '@/hooks/useAutoSave'

// Hook pour la largeur du viewport
function useViewportWidth() {
  const [width, setWidth] = useState(0)
  
  useEffect(() => {
    const updateWidth = () => setWidth(window.innerWidth)
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])
  
  return width
}

export default function VisualPageEditor() {
  const router = useRouter()
  const params = useParams()
  const viewportWidth = useViewportWidth()
  const pageId = params?.id ? parseInt(params.id as string) : null
  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [blocks, setBlocks] = useState<Block[]>([])
  const [blockTypes, setBlockTypes] = useState<BlockType[]>([])
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft')
  const [isHomepage, setIsHomepage] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  
  // Calcul de la largeur dynamique
  const editorWidth = viewportWidth >= 1024 ? viewportWidth - 256 : viewportWidth // 256px = 16rem (sidebar)

  // Sauvegarde automatique
  const { isSaving: isAutoSaving, lastSaved, updateLastSaved } = useAutoSave({
    data: { title, blocks, metaTitle, metaDescription, status, isHomepage },
    onSave: async (data) => {
      if (!pageId || !data.title.trim()) return
      await pageService.update(pageId, {
        title: data.title,
        blocks: data.blocks,
        meta_title: data.metaTitle,
        meta_description: data.metaDescription,
        status: data.status,
        is_homepage: data.isHomepage,
      })
    },
    debounceMs: 2000,
    enabled: !!pageId && !!title.trim(),
  })

  useEffect(() => {
    if (pageId) {
      loadPage()
    } else {
      setLoading(false)
    }
  }, [pageId])

  const loadPage = async () => {
    try {
      setLoading(true)
      const [pageData, blockTypesData] = await Promise.all([
        pageService.getById(pageId!),
        blocksService.getBlockTypes()
      ])
      setPage(pageData)
      setTitle(pageData.title || '')
      setBlocks(Array.isArray(pageData.blocks) ? pageData.blocks : [])
      setMetaTitle(pageData.meta_title || '')
      setMetaDescription(pageData.meta_description || '')
      setStatus(pageData.status || 'draft')
      setIsHomepage(pageData.is_homepage || false)
      setBlockTypes(blockTypesData)
    } catch (error) {
      console.error('Erreur chargement page:', error)
      toast.error('Erreur lors du chargement de la page')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Le titre est requis')
      return
    }

    setSaving(true)
    try {
      await pageService.update(pageId!, {
        title,
        blocks,
        meta_title: metaTitle,
        meta_description: metaDescription,
        status,
        is_homepage: isHomepage,
      })
      // Mettre à jour le timestamp de dernière sauvegarde
      updateLastSaved()
      toast.success('Page sauvegardée !')
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    try {
      await pageService.publish(pageId!)
      toast.success('Page publiée !')
      loadPage()
    } catch (error) {
      toast.error('Erreur lors de la publication')
    }
  }

  if (loading) {
    return (
      <TenantLayout title="Éditeur visuel">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        </div>
      </TenantLayout>
    )
  }

  if (!page) {
    return (
      <TenantLayout title="Page non trouvée">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Page non trouvée</p>
        </div>
      </TenantLayout>
    )
  }

  return (
    <TenantLayout
      title="Éditeur visuel"
      subtitle={`Édition de: ${page.title}`}
      headerActions={
        <div className="flex items-center gap-3 flex-wrap">
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

          <button
            onClick={() => router.push('/dashboard/pages')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900"
          >
            Retour
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
                  <button
                    onClick={handleSave}
                    disabled={saving || isAutoSaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
          {status !== 'published' && (
            <button
              onClick={handlePublish}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Publier
            </button>
          )}
        </div>
      }
    >
      <div 
        className="fixed top-[64px] lg:top-[73px] bottom-0 left-0 lg:left-64 right-0 bg-white dark:bg-gray-800 flex flex-col z-10 overflow-hidden" 
        style={{ 
          width: editorWidth > 0 ? `${editorWidth}px` : '100%',
        }}
      >
        {/* Page Title & SEO - Compact Header */}
        <div className="border-b border-gray-200 bg-gray-50 dark:bg-gray-900 flex-shrink-0 w-full">
          <div className="px-4 lg:px-6 xl:px-8 py-3 lg:py-4 w-full">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 text-base sm:text-lg lg:text-xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold bg-white dark:bg-gray-800"
              placeholder="Titre de la page"
            />
          </div>
        </div>

        {/* SEO Panel (Collapsible) - Compact in header */}
        <div className="px-4 lg:px-6 xl:px-8 pb-2 bg-gray-50 dark:bg-gray-900 flex-shrink-0 w-full">
          <details className="cursor-pointer">
            <summary className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">⚙️ Réglages SEO et page</summary>
            <div className="mt-3 pb-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Titre SEO</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  placeholder="Titre pour les moteurs de recherche"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description SEO</label>
                <input
                  type="text"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  placeholder="Description pour les moteurs de recherche"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'scheduled')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                  <option value="scheduled">Programmé</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_homepage"
                  checked={isHomepage}
                  onChange={(e) => setIsHomepage(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_homepage" className="ml-2 block text-xs text-gray-900 dark:text-gray-100">
                  Définir comme page d'accueil
                </label>
              </div>
            </div>
          </details>
        </div>

        {/* Block Editor with Split View */}
        <div className="flex-1 flex overflow-hidden w-full max-w-full">
          {/* Editor Section */}
          <div className={`${showPreview ? 'w-1/2' : 'w-full'} border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col transition-all duration-300`}>
            <div className="flex-1 overflow-hidden">
              <BlockEditor blocks={blocks} onChange={setBlocks} availableBlockTypes={blockTypes} />
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
    </TenantLayout>
  )
}

