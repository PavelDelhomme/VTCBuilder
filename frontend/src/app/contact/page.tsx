'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import settingsService, { SystemSettings, PublicPageData } from '@/services/settings.service'
import BlockPreview from '@/components/editor/BlockPreview'
import PublicLayout from '@/components/public/PublicLayout'
import { Block } from '@/components/editor/types'

export default function ContactPage() {
  const { resolvedTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [useBlocks, setUseBlocks] = useState(false)
  const [contactBlocks, setContactBlocks] = useState<Block[]>([])
  const [contactStatus, setContactStatus] = useState<'draft' | 'published'>('draft')

  useEffect(() => {
    loadContactPage()
  }, [])

  const loadContactPage = async () => {
    try {
      setLoading(true)
      const settings = await settingsService.getSettings()
      
      // Charger les blocs de la page contact depuis SystemSettings.public_pages['contact']
      const contactPageData = settings.public_pages?.['contact'] as (PublicPageData & { status?: 'draft' | 'published' }) | undefined
      
      if (contactPageData && contactPageData.blocks && contactPageData.blocks.length > 0) {
        setContactBlocks(contactPageData.blocks)
        setContactStatus(contactPageData.status || 'draft')
        setUseBlocks(true)
      } else {
        // Si pas de blocs, utiliser la version par défaut (fallback)
        setUseBlocks(false)
      }
    } catch (error) {
      console.error('Error chargement page contact:', error)
      setUseBlocks(false)
    } finally {
      setLoading(false)
    }
  }

  // Si on utilise les blocs et que la page est publiée, afficher avec BlockPreview
  // La page contact peut être administrée via /admin/pages-public/edit/contact
  // Les blocs contiennent déjà header et footer, donc pas besoin de PublicLayout
  if (useBlocks && contactStatus === 'published' && contactBlocks.length > 0) {
    return (
      <div className="min-h-screen">
        <BlockPreview blocks={contactBlocks} blockTypes={[]} theme={resolvedTheme || 'light'} />
      </div>
    )
  }

  // Sinon, utiliser la version par défaut (fallback) - ancienne version statique
  if (loading) {
    return (
      <PublicLayout title="Contactez-nous" description="Chargement...">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de la page...</p>
          </div>
        </div>
      </PublicLayout>
    )
  }

  // Fallback: ancienne version statique (pour rétrocompatibilité)
  return (
    <PublicLayout
      title="Contactez-nous"
      description="Nous sommes là pour vous aider. Contactez notre équipe support"
    >
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Page de contact</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Cette page n'a pas encore été configurée avec l'éditeur de blocs.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Accédez à <a href="/admin/pages-public/edit/contact" className="text-blue-600 hover:underline">l'éditeur</a> pour créer votre page de contact.
          </p>
        </div>
      </div>
    </PublicLayout>
  )
}

