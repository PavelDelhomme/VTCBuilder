'use client'

import { useEffect, useState } from 'react'
import TenantLayout from '@/components/tenant/TenantLayout'
import templateService, { Template } from '@/services/template.service'
import toast from 'react-hot-toast'

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState<number | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadTemplates()
  }, [filter])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (filter !== 'all') {
        if (filter === 'free') {
          params.is_premium = false
        } else if (filter === 'premium') {
          params.is_premium = true
        } else {
          params.category = filter
        }
      }
      const data = await templateService.getAll(params)
      setTemplates(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error chargement templates:', error)
      toast.error('Error lors du chargement des templates')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyTemplate = async (templateId: number) => {
    setApplying(templateId)
    try {
      await templateService.useTemplate(templateId)
      toast.success('Template appliqué avec succès !')
      loadTemplates()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error lors de l\'application')
    } finally {
      setApplying(null)
    }
  }

  const getCategoryBadge = (category: string) => {
    const badges: Record<string, string> = {
      vtc: 'bg-blue-100 text-blue-800',
      business: 'bg-purple-100 text-purple-800',
      classic: 'bg-green-100 text-green-800',
      minimal: 'bg-gray-100 dark:bg-gray-900 text-gray-800',
      modern: 'bg-indigo-100 text-indigo-800',
    }
    return badges[category] || 'bg-gray-100 dark:bg-gray-900 text-gray-800'
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)
  }

  if (loading) {
    return (
      <TenantLayout title="Templates" subtitle="Choisissez le design de votre site">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        </div>
      </TenantLayout>
    )
  }

  return (
    <TenantLayout 
      title="Templates" 
      subtitle="Choisissez le design de votre site VTC"
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter('free')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'free'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              Gratuits
            </button>
            <button
              onClick={() => setFilter('premium')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'premium'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              Premium
            </button>
            {['vtc', 'business', 'minimal', 'modern', 'classic'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                  filter === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Aucun template disponible</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter !== 'all' ? 'Essayez de modifier vos filtres' : 'Aucun template trouvé'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                {/* Preview Image */}
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                  {template.preview_image ? (
                    <img 
                      src={template.preview_image} 
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                      {template.name}
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex gap-2 flex-wrap">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getCategoryBadge(template.category)}`}>
                      {template.category}
                    </span>
                    {template.is_premium && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
                        ⭐ {formatPrice(template.price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {template.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 min-h-[40px]">
                    {template.description || 'Aucune description'}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApplyTemplate(template.id)}
                      disabled={applying === template.id}
                      className="flex-1 btn btn-primary"
                    >
                      {applying === template.id ? 'Application...' : template.is_premium ? 'Acheter' : 'Appliquer'}
                    </button>
                    {template.preview_image && (
                      <a
                        href={template.preview_image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                        title="Aperçu"
                      >
                        👁️
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TenantLayout>
  )
}

