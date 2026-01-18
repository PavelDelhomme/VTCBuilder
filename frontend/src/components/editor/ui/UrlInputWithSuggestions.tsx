'use client'

import { useState, useEffect, useRef } from 'react'
import pageService, { Page } from '@/services/page.service'
import api from '@/lib/api'

interface PageSuggestion {
  title: string
  url: string
  type: 'page' | 'public' | 'external'
}

interface UrlInputWithSuggestionsProps {
  value: string
  onChange: (url: string) => void
  placeholder?: string
  className?: string
}

// Cache partagé pour éviter les requêtes multiples
let cachedSuggestions: PageSuggestion[] | null = null
let suggestionsCacheTimestamp = 0
const SUGGESTIONS_CACHE_DURATION = 60000 // 1 minute de cache
let suggestionsLoadingPromise: Promise<void> | null = null

export default function UrlInputWithSuggestions({
  value,
  onChange,
  placeholder = 'URL ou sélectionner une page...',
  className = '',
}: UrlInputWithSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<PageSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    loadSuggestions()
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadSuggestions = async () => {
    // Utiliser le cache si disponible et récent
    const now = Date.now()
    if (cachedSuggestions !== null && (now - suggestionsCacheTimestamp) < SUGGESTIONS_CACHE_DURATION) {
      if (mountedRef.current) {
        setSuggestions(cachedSuggestions)
        setLoading(false)
      }
      return
    }

    // Si une requête est déjà en cours, attendre qu'elle se termine
    if (suggestionsLoadingPromise) {
      try {
        await suggestionsLoadingPromise
        if (mountedRef.current && cachedSuggestions !== null) {
          setSuggestions(cachedSuggestions)
          setLoading(false)
        }
        return
      } catch (error) {
        // Si la requête précédente a échoué, continuer avec une nouvelle
      }
    }

    setLoading(true)
    try {
      // Créer une promesse partagée pour éviter les requêtes multiples simultanées
      suggestionsLoadingPromise = (async () => {
        const allSuggestions: PageSuggestion[] = []

        // Charger les pages du tenant
        try {
          const tenantPages = await pageService.getAll({ status: 'published' })
          tenantPages.forEach((page: Page) => {
            allSuggestions.push({
              title: page.title,
              url: `/${page.slug}`,
              type: 'page',
            })
          })
        } catch (error) {
          console.warn('Error chargement pages tenant:', error)
        }

        // Charger les pages publiques
        try {
          const settingsResponse = await api.get('/system-settings/')
          const publicPages = settingsResponse.data.public_pages || {}
          
          Object.keys(publicPages).forEach((slug) => {
            const page = publicPages[slug]
            if (page?.is_active !== false) {
              allSuggestions.push({
                title: page.title || slug,
                url: `/${slug === 'home' ? '' : slug}`,
                type: 'public',
              })
            }
          })
        } catch (error) {
          console.warn('Error chargement pages publiques:', error)
        }

        // Ajouter des liens externes courants
        allSuggestions.push(
          { title: 'Page d\'accueil', url: '/', type: 'external' },
          { title: 'Contact', url: '/contact', type: 'external' },
          { title: 'FAQ', url: '/faq', type: 'external' },
          { title: 'Documentation', url: '/docs', type: 'external' },
        )

        cachedSuggestions = allSuggestions
        suggestionsCacheTimestamp = Date.now()
      })()

      await suggestionsLoadingPromise
      suggestionsLoadingPromise = null

      if (mountedRef.current) {
        setSuggestions(cachedSuggestions || [])
      }
    } catch (error) {
      console.error('Error chargement suggestions:', error)
      if (mountedRef.current) {
        setSuggestions(cachedSuggestions || [])
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    setShowSuggestions(true)
  }

  const handleInputFocus = () => {
    setShowSuggestions(true)
  }

  const handleSelectSuggestion = (suggestion: PageSuggestion) => {
    onChange(suggestion.url)
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.title.toLowerCase().includes(value.toLowerCase()) ||
    suggestion.url.toLowerCase().includes(value.toLowerCase())
  )

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        className={`w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${className}`}
      />
      
      {showSuggestions && (filteredSuggestions.length > 0 || loading) && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="p-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                Pages disponibles
              </div>
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-between group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {suggestion.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {suggestion.url}
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    {suggestion.type === 'page' && (
                      <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                        Page
                      </span>
                    )}
                    {suggestion.type === 'public' && (
                      <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                        Public
                      </span>
                    )}
                    {suggestion.type === 'external' && (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                        Lien
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

