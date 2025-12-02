'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import TenantLayout from '@/components/tenant/TenantLayout'
import pageService, { Page } from '@/services/page.service'
import toast from 'react-hot-toast'

export default function EditPage() {
  const router = useRouter()
  const params = useParams()
  const pageId = params?.id ? parseInt(params.id as string) : null
  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft')
  const [isHomepage, setIsHomepage] = useState(false)

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
      const data = await pageService.getById(pageId!)
      setPage(data)
      setTitle(data.title || '')
      setContent(data.content || '')
      setMetaTitle(data.meta_title || '')
      setMetaDescription(data.meta_description || '')
      setStatus(data.status || 'draft')
      setIsHomepage(data.is_homepage || false)
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
        content,
        meta_title: metaTitle,
        meta_description: metaDescription,
        status,
        is_homepage: isHomepage,
      })
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
      <TenantLayout title="Éditer la page">
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
      title="Éditer la page"
      subtitle={page.title}
      headerActions={
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/pages')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900"
          >
            Retour
          </button>
          <button
            onClick={() => router.push(`/dashboard/pages/${pageId}/edit-visual`)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            🎨 Mode Visuel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        {/* Editor Toolbar */}
        <div className="border-b border-gray-200 p-4 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  document.execCommand('bold', false)
                }}
                className="p-2 hover:bg-gray-200 rounded"
                title="Gras"
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => document.execCommand('italic', false)}
                className="p-2 hover:bg-gray-200 rounded"
                title="Italique"
              >
                <em>I</em>
              </button>
              <button
                type="button"
                onClick={() => document.execCommand('underline', false)}
                className="p-2 hover:bg-gray-200 rounded"
                title="Souligné"
              >
                <u>U</u>
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button
                type="button"
                onClick={() => document.execCommand('formatBlock', false, 'h2')}
                className="p-2 hover:bg-gray-200 rounded text-sm"
                title="Titre 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => document.execCommand('formatBlock', false, 'h3')}
                className="p-2 hover:bg-gray-200 rounded text-sm"
                title="Titre 3"
              >
                H3
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button
                type="button"
                onClick={() => document.execCommand('insertUnorderedList', false)}
                className="p-2 hover:bg-gray-200 rounded"
                title="Liste à puces"
              >
                •
              </button>
              <button
                type="button"
                onClick={() => document.execCommand('insertOrderedList', false)}
                className="p-2 hover:bg-gray-200 rounded"
                title="Liste numérotée"
              >
                1.
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button
                type="button"
                onClick={() => {
                  const url = prompt('URL du lien:')
                  if (url) document.execCommand('createLink', false, url)
                }}
                className="p-2 hover:bg-gray-200 rounded"
                title="Lien"
              >
                🔗
              </button>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {status === 'published' ? '✅ Publié' : '📝 Brouillon'}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Titre de la page *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-2xl font-bold"
              placeholder="Titre de la page"
            />
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contenu
            </label>
            <div
              contentEditable
              suppressContentEditableWarning
              className="min-h-[400px] w-full px-4 py-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent prose max-w-none"
              style={{ whiteSpace: 'pre-wrap' }}
              onInput={(e) => {
                setContent(e.currentTarget.innerHTML)
              }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Utilisez la barre d'outils ci-dessus pour formater votre contenu
            </p>
          </div>

          {/* SEO Settings */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Réglages SEO</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Titre SEO
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Titre pour les moteurs de recherche"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description SEO
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description pour les moteurs de recherche"
                />
              </div>
            </div>
          </div>

          {/* Page Settings */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Réglages de la page</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Statut
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'scheduled')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label htmlFor="is_homepage" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  Définir comme page d'accueil
                </label>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Slug: <span className="font-mono">/{page.slug}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TenantLayout>
  )
}

