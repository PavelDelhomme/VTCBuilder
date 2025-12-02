'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/admin/AdminLayout'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import PageLoader from '@/components/shared/PageLoader'

interface PublicPage {
  id: string
  slug: string
  title: string
  description?: string
  blocks: any[]
  meta_title?: string
  meta_description?: string
  is_active: boolean
  order: number
}

const DEFAULT_PUBLIC_PAGES: Omit<PublicPage, 'id'>[] = [
  {
    slug: 'home',
    title: 'Page d\'accueil',
    description: 'Page principale du site public VTCBuilder',
    blocks: [],
    is_active: true,
    order: 1,
  },
  {
    slug: 'docs',
    title: 'Documentation',
    description: 'Page de documentation et guides',
    blocks: [],
    is_active: true,
    order: 2,
  },
  {
    slug: 'contact',
    title: 'Contact',
    description: 'Page de contact avec formulaire',
    blocks: [],
    is_active: true,
    order: 3,
  },
  {
    slug: 'faq',
    title: 'FAQ',
    description: 'Questions fréquemment posées',
    blocks: [],
    is_active: true,
    order: 4,
  },
  {
    slug: 'legal/terms',
    title: 'Conditions Générales de Vente',
    description: 'CGV de VTCBuilder',
    blocks: [],
    is_active: true,
    order: 5,
  },
  {
    slug: 'legal/privacy',
    title: 'Politique de Confidentialité',
    description: 'Politique de confidentialité de VTCBuilder',
    blocks: [],
    is_active: true,
    order: 6,
  },
]

export default function PublicPagesManagement() {
  const router = useRouter()
  const [pages, setPages] = useState<PublicPage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authService.isSuperAdmin()) {
      router.push('/dashboard')
      return
    }
    loadPages()
  }, [router])

  const loadPages = async () => {
    try {
      setLoading(true)
      const response = await api.get('/system-settings/')
      const data = response.data

      // Récupérer les pages publiques depuis les settings
      const publicPages: PublicPage[] = []
      
      // Page d'accueil
      if (data.public_homepage_blocks !== undefined) {
        publicPages.push({
          id: 'home',
          slug: 'home',
          title: 'Page d\'accueil',
          description: 'Page principale du site public VTCBuilder',
          blocks: data.public_homepage_blocks || [],
          meta_title: data.public_homepage_meta_title,
          meta_description: data.public_homepage_meta_description,
          is_active: true,
          order: 1,
        })
      }

      // Autres pages (docs, contact, faq)
      const otherPages = data.public_pages || {}
      Object.entries(otherPages).forEach(([slug, pageData]: [string, any]) => {
        publicPages.push({
          id: slug,
          slug,
          title: pageData.title || slug.charAt(0).toUpperCase() + slug.slice(1),
          description: pageData.description,
          blocks: pageData.blocks || [],
          meta_title: pageData.meta_title,
          meta_description: pageData.meta_description,
          is_active: pageData.is_active !== false,
          order: pageData.order || 999,
        })
      })

      // Si aucune page n'existe, initialiser avec les pages par défaut
      if (publicPages.length === 0) {
        setPages(DEFAULT_PUBLIC_PAGES.map((page, index) => ({
          ...page,
          id: page.slug,
        })))
      } else {
        setPages(publicPages.sort((a, b) => a.order - b.order))
      }
    } catch (error: any) {
      console.error('Erreur chargement pages publiques:', error)
      toast.error('Erreur lors du chargement des pages')
      // Initialiser avec les pages par défaut en cas d'erreur
      setPages(DEFAULT_PUBLIC_PAGES.map((page, index) => ({
        ...page,
        id: page.slug,
      })))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (pageSlug: string) => {
    router.push(`/admin/pages-public/${pageSlug}/edit`)
  }

  const handleToggleActive = async (pageSlug: string, currentStatus: boolean) => {
    try {
      // TODO: Implémenter l'API pour activer/désactiver une page
      toast.success(`Page ${currentStatus ? 'désactivée' : 'activée'}`)
      loadPages()
    } catch (error: any) {
      toast.error('Erreur lors de la modification')
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Pages Publiques" subtitle="Gestion des pages du site public">
        <PageLoader text="Chargement des pages..." />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      title="Pages Publiques"
      subtitle="Gérez les pages de votre site public avec l'éditeur WordPress-like"
    >
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Éditeur WordPress-like
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Modifiez vos pages publiques avec l'éditeur de blocs. Ajoutez, réorganisez et personnalisez votre contenu sans coder.
              </p>
            </div>
          </div>
        </div>

        {/* Pages List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <div
              key={page.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {page.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      /{page.slug}
                    </p>
                    {page.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {page.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        page.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {page.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span>
                    {page.blocks?.length || 0} bloc{page.blocks?.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => window.open(`/${page.slug === 'home' ? '' : page.slug}`, '_blank')}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Voir la page"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(page.slug)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    ✏️ Éditer
                  </button>
                  <button
                    onClick={() => handleToggleActive(page.slug, page.is_active)}
                    className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                      page.is_active
                        ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 hover:bg-green-200'
                    }`}
                    title={page.is_active ? 'Désactiver' : 'Activer'}
                  >
                    {page.is_active ? '⏸️' : '▶️'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {pages.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Aucune page publique</h3>
            <p className="text-gray-500 dark:text-gray-400">Les pages publiques seront créées automatiquement.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

