'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TenantLayout from '@/components/tenant/TenantLayout'
import pageService from '@/services/page.service'
import type { Page } from '@/services/page.service'
import toast from 'react-hot-toast'
import PageLoader from '@/components/shared/PageLoader'

export default function PagesManagement() {
  const router = useRouter()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPages()
  }, [])

  const loadPages = async () => {
    try {
      const data = await pageService.getAll()
      setPages(data)
    } catch (error) {
      toast.error('Erreur de chargement des pages')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (pageId: number) => {
    try {
      await pageService.publish(pageId)
      toast.success('Page publiée !')
      loadPages()
    } catch (error) {
      toast.error('Erreur lors de la publication')
    }
  }

  const handleDuplicate = async (pageId: number) => {
    try {
      await pageService.duplicate(pageId)
      toast.success('Page dupliquée !')
      loadPages()
    } catch (error) {
      toast.error('Erreur lors de la duplication')
    }
  }

  const handleDelete = async (pageId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) return

    try {
      await pageService.delete(pageId)
      toast.success('Page supprimée !')
      loadPages()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'badge badge-warning',
      published: 'badge badge-success',
      scheduled: 'badge badge-info',
    }
    return badges[status as keyof typeof badges] || 'badge'
  }

  const headerActions = (
    <button
      onClick={() => router.push('/dashboard/pages/new')}
      className="btn btn-primary"
    >
      + Nouvelle Page
    </button>
  )

  if (loading) {
    return (
      <TenantLayout title="Pages" subtitle="Gestion de vos pages">
        <PageLoader text="Chargement des pages..." />
      </TenantLayout>
    )
  }

  return (
    <TenantLayout 
      title="Pages" 
      subtitle="Créez et gérez les pages de votre site"
      headerActions={headerActions}
    >
        {pages.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Aucune page</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Commencez par créer votre première page.</p>
            <button
              onClick={() => router.push('/dashboard/pages/new')}
              className="btn btn-primary"
            >
              + Créer une page
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {pages.map((page) => (
              <div key={page.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{page.title}</h3>
                      <span className={getStatusBadge(page.status)}>
                        {page.status === 'draft' && 'Brouillon'}
                        {page.status === 'published' && 'Publié'}
                        {page.status === 'scheduled' && 'Programmé'}
                      </span>
                      {page.is_homepage && (
                        <span className="badge bg-blue-100 text-blue-800">Homepage</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      /{page.slug}
                    </p>
                    {page.meta_description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{page.meta_description}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {page.status === 'draft' && (
                      <button
                        onClick={() => handlePublish(page.id)}
                        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Publier
                      </button>
                    )}
                    <div className="flex gap-1">
                      <button
                        onClick={() => router.push(`/dashboard/pages/${page.id}/edit`)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        title="Éditer en mode texte"
                      >
                        ✏️ Texte
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/pages/${page.id}/edit-visual`)}
                        className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
                        title="Éditer avec l'éditeur visuel (blocs)"
                      >
                        🎨 Visuel
                      </button>
                    </div>
                    <button
                      onClick={() => handleDuplicate(page.id)}
                      className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Dupliquer
                    </button>
                    <button
                      onClick={() => handleDelete(page.id)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </TenantLayout>
  )
}

