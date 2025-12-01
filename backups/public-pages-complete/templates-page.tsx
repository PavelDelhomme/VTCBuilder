'use client'

import { useEffect, useState } from 'react'
import PublicLayout from '@/components/PublicLayout'
import templateService from '@/services/template.service'
import type { Template } from '@/services/template.service'
import Link from 'next/link'

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all')

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const data = await templateService.getAll()
      setTemplates(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erreur chargement templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTemplates = templates.filter(template => {
    if (filter === 'free') return !template.is_premium
    if (filter === 'premium') return template.is_premium
    return true
  })

  return (
    <PublicLayout
      title="Templates"
      description="Choisissez parmi nos templates professionnels pour créer votre site VTC"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilter('free')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filter === 'free'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
            }`}
          >
            Gratuits
          </button>
          <button
            onClick={() => setFilter('premium')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              filter === 'premium'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
            }`}
          >
            Premium
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">Aucun template disponible pour le moment.</p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Revenez bientôt pour découvrir nos nouveaux designs !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {template.preview_image ? (
                  <img
                    src={template.preview_image}
                    alt={template.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-6xl">🎨</span>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{template.name}</h3>
                    {template.is_premium && (
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {template.category && (
                        <span className="bg-gray-100 dark:bg-gray-900 px-3 py-1 rounded-full">
                          {template.category}
                        </span>
                      )}
                    </div>
                    {template.usage_count !== undefined && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {template.usage_count} utilisations
                      </div>
                    )}
                  </div>
                  <Link
                    href="/register"
                    className="mt-4 block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Utiliser ce template
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-20 bg-blue-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Comment choisir votre template ?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Templates Gratuits</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Parfaits pour démarrer. Tous les templates de base sont disponibles gratuitement avec tous les plans.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Templates Premium</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Designs professionnels avancés avec plus d'options de personnalisation. Disponibles avec les plans Business et Entreprise.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

