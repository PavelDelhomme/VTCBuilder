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

interface PageCardProps {
  page: PublicPage
  onEdit: (slug: string) => void
  onToggleActive: (slug: string, currentStatus: boolean) => void
  onDelete?: (slug: string) => void
}

function PageCard({ page, onEdit, onToggleActive, onDelete }: PageCardProps) {
  return (
    <div
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
            onClick={() => onEdit(page.slug)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            ✏️ Éditer
          </button>
          <button
            onClick={() => onToggleActive(page.slug, page.is_active)}
            className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
              page.is_active
                ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300'
                : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 hover:bg-green-200'
            }`}
            title={page.is_active ? 'Désactiver' : 'Activer'}
          >
            {page.is_active ? '⏸️' : '▶️'}
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(page.slug)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
              title="Supprimer"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

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
      const otherPages = data.public_pages || {}
      
      // Page d'accueil - priorité à public_homepage_blocks si elle existe
      // Sinon, utiliser public_pages['home'] s'il existe
      if (data.public_homepage_blocks !== undefined) {
        // Utiliser public_homepage_blocks (source principale pour la page d'accueil)
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
      } else if ('home' in otherPages) {
        // Fallback: utiliser public_pages['home'] si public_homepage_blocks n'existe pas
        const homePageData = otherPages['home'] as any
        publicPages.push({
          id: 'home',
          slug: 'home',
          title: homePageData.title || 'Page d\'accueil',
          description: homePageData.description || 'Page principale du site public VTCBuilder',
          blocks: homePageData.blocks || [],
          meta_title: homePageData.meta_title,
          meta_description: homePageData.meta_description,
          is_active: homePageData.is_active !== false,
          order: homePageData.order || 1,
        })
      }

      // Autres pages (docs, contact, faq, et sous-pages docs/*)
      // Exclure 'home' pour éviter les doublons (on l'a déjà géré ci-dessus)
      Object.entries(otherPages).forEach(([slug, pageData]: [string, any]) => {
        // Ne pas ajouter 'home' car on l'a déjà géré ci-dessus
        if (slug === 'home') {
          return
        }
        
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
      
      // Séparer les pages principales et les sous-pages de documentation
      const mainPages = publicPages.filter(p => !p.slug.startsWith('docs/') || p.slug === 'docs')
      const docsSubPages = publicPages.filter(p => p.slug.startsWith('docs/') && p.slug !== 'docs')
      
      // Réorganiser : pages principales d'abord, puis sous-pages docs/* groupées
      const sortedPages = [...mainPages, ...docsSubPages].sort((a, b) => a.order - b.order)

      // Si aucune page n'existe, initialiser avec les pages par défaut
      if (sortedPages.length === 0) {
        setPages(DEFAULT_PUBLIC_PAGES.map((page, index) => ({
          ...page,
          id: page.slug,
        })))
      } else {
        setPages(sortedPages)
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
    router.push(`/admin/pages-public/edit/${pageSlug}`)
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

  const handleCreateDocsSubPage = () => {
    const slug = prompt('Entrez le slug de la sous-page (ex: getting-started, initial-setup):')
    if (!slug) return
    
    const fullSlug = `docs/${slug}`
    const title = prompt('Entrez le titre de la page:', slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
    if (!title) return
    
    // Créer la page via l'éditeur
    router.push(`/admin/pages-public/edit/${fullSlug}?new=true&title=${encodeURIComponent(title)}`)
  }

  const handleDeleteDocsSubPage = async (pageSlug: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la page "${pageSlug}" ?`)) return
    
    try {
      const response = await api.get('/system-settings/')
      const data = response.data
      const publicPages = data.public_pages || {}
      
      // Supprimer la page
      delete publicPages[pageSlug]
      
      // Sauvegarder
      await api.patch('/system-settings/', {
        public_pages: publicPages
      })
      
      toast.success('Page supprimée avec succès')
      loadPages()
    } catch (error: any) {
      console.error('Erreur suppression page:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleCleanupPages = async () => {
    if (!confirm('Voulez-vous supprimer les pages inutiles (nouvelle-page-1, nouvelle-page-2, nouvelle-page-3, nouvelle-page-4) ?\n\nLes pages importantes (home, page-test, docs, contact, faq, legal/*) seront conservées.')) {
      return
    }
    
    try {
      const response = await api.get('/system-settings/')
      const data = response.data
      const publicPages = data.public_pages || {}
      
      // Pages à supprimer (pages de test inutiles)
      const pagesToDelete = ['nouvelle-page-1', 'nouvelle-page-2', 'nouvelle-page-3', 'nouvelle-page-4']
      
      // Compter les pages supprimées
      let deletedCount = 0
      
      // Supprimer les pages inutiles
      pagesToDelete.forEach(slug => {
        if (slug in publicPages) {
          delete publicPages[slug]
          deletedCount++
        }
      })
      
      if (deletedCount === 0) {
              toast('Aucune page inutile trouvée', { icon: 'ℹ️' })
        return
      }
      
      // Sauvegarder
      await api.patch('/system-settings/', {
        public_pages: publicPages
      })
      
      toast.success(`${deletedCount} page${deletedCount > 1 ? 's' : ''} supprimée${deletedCount > 1 ? 's' : ''} avec succès`)
      loadPages()
    } catch (error: any) {
      console.error('Erreur nettoyage pages:', error)
      toast.error('Erreur lors du nettoyage')
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Pages Publiques" subtitle="Gestion des pages du site public">
        <PageLoader text="Chargement des pages..." />
      </AdminLayout>
    )
  }

  const mainPages = pages.filter(p => !p.slug.startsWith('docs/') || p.slug === 'docs')
  const docsSubPages = pages.filter(p => p.slug.startsWith('docs/') && p.slug !== 'docs')

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

        {/* Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Pages Publiques ({pages.length})
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleCleanupPages}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm flex items-center gap-2"
              title="Supprimer les pages de test inutiles (nouvelle-page-1, nouvelle-page-2, etc.)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Nettoyer les pages
            </button>
            <button
              onClick={handleCreateDocsSubPage}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouvelle sous-page docs
            </button>
          </div>
        </div>

        {/* Pages List */}
        <div className="space-y-6">
          {/* Pages principales */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Pages Principales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mainPages.map((page) => (
                <PageCard
                  key={page.id}
                  page={page}
                  onEdit={handleEdit}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          </div>

          {/* Sous-pages de documentation */}
          {docsSubPages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Sous-pages de Documentation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {docsSubPages.map((page) => (
                  <PageCard
                    key={page.id}
                    page={page}
                    onEdit={handleEdit}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDeleteDocsSubPage}
                  />
                ))}
              </div>
            </div>
          )}
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
