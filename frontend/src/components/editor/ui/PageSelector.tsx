'use client'

import React, { useEffect, useState } from 'react'
import api from '@/lib/api'
import pageService, { Page } from '@/services/page.service'

interface PageSelectorProps {
  value?: string
  onChange: (url: string) => void
  placeholder?: string
  className?: string
}

/**
 * Composant pour sélectionner une page du tenant pour la navigation
 */
export default function PageSelector({ value, onChange, placeholder = 'Sélectionner une page...', className = '' }: PageSelectorProps) {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [publicPages, setPublicPages] = useState<Array<{ slug: string; title: string }>>([])

  useEffect(() => {
    loadPages()
  }, [])

  const loadPages = async () => {
    try {
      setLoading(true)
      
      // Charger les pages du tenant (via l'API /pages/)
      try {
        const tenantPages = await pageService.getAll({ status: 'published' })
        setPages(tenantPages || [])
      } catch (error) {
        console.warn('Impossible de charger les pages du tenant:', error)
      }

      // Charger aussi les pages publiques depuis system-settings
      try {
        const settingsResponse = await api.get('/system-settings/')
        const data = settingsResponse.data
        const publicPagesList: Array<{ slug: string; title: string }> = []

        // Page d'accueil
        if (data.public_homepage_blocks !== undefined) {
          publicPagesList.push({ slug: 'home', title: 'Page d\'accueil' })
        }

        // Autres pages publiques (seulement celles actives)
        const otherPages = data.public_pages || {}
        Object.entries(otherPages).forEach(([slug, pageData]: [string, any]) => {
          if (pageData.is_active !== false) {
            publicPagesList.push({
              slug,
              title: pageData.title || slug.charAt(0).toUpperCase() + slug.slice(1),
            })
          }
        })

        // Trier par ordre si disponible
        publicPagesList.sort((a, b) => {
          const aOrder = otherPages[a.slug]?.order || 999
          const bOrder = otherPages[b.slug]?.order || 999
          return aOrder - bOrder
        })

        setPublicPages(publicPagesList)
      } catch (error) {
        console.warn('Impossible de charger les pages publiques:', error)
      }
    } catch (error) {
      console.error('Error chargement pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value
    if (selectedValue === 'custom') {
      // Permettre de saisir une URL personnalisée
      const customUrl = prompt('Entrez l\'URL personnalisée:', value?.startsWith('http') ? value : '')
      if (customUrl) {
        onChange(customUrl)
      }
    } else if (selectedValue) {
      onChange(selectedValue)
    }
  }

  if (loading) {
    return (
      <select className={className} disabled>
        <option>Chargement...</option>
      </select>
    )
  }

  const allPages = [
    ...pages.map(p => ({ slug: `/${p.slug}`, title: p.title, type: 'tenant' })),
    ...publicPages.map(p => ({ slug: p.slug === 'home' ? '/' : `/${p.slug}`, title: p.title, type: 'public' })),
  ]

  // Détecter le thème depuis le document ou utiliser 'light' par défaut
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  
  return (
    <div className="space-y-2">
      <select
        value={value || ''}
        onChange={handleChange}
        className={className || 'w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}
        style={{
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          color: isDark ? '#f9fafb' : '#111827',
        }}
      >
        <option value="" style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', color: isDark ? '#f9fafb' : '#111827' }}>{placeholder}</option>
        {allPages.length > 0 && (
          <>
            <optgroup label="Pages du tenant" style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', color: isDark ? '#f9fafb' : '#111827' }}>
              {pages.map((page) => (
                <option key={page.id} value={`/${page.slug}`} style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', color: isDark ? '#f9fafb' : '#111827' }}>
                  {page.title} ({page.slug})
                </option>
              ))}
            </optgroup>
            {publicPages.length > 0 && (
              <optgroup label="Pages publiques" style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', color: isDark ? '#f9fafb' : '#111827' }}>
                {publicPages.map((page) => (
                  <option key={page.slug} value={page.slug === 'home' ? '/' : `/${page.slug}`} style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', color: isDark ? '#f9fafb' : '#111827' }}>
                    {page.title}
                  </option>
                ))}
              </optgroup>
            )}
          </>
        )}
        <option value="custom" style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', color: isDark ? '#f9fafb' : '#111827' }}>🔗 URL personnalisée...</option>
      </select>
      {value && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          URL: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-gray-900 dark:text-gray-100">{value}</code>
        </div>
      )}
    </div>
  )
}

