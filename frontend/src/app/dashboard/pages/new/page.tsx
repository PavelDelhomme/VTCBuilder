'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TenantLayout from '@/components/tenant/TenantLayout'
import BlockEditor from '@/components/editor/BlockEditor'
import { Block } from '@/components/editor/types'
import pageService from '@/services/page.service'
import templateService from '@/services/template.service'
import toast from 'react-hot-toast'

// Templates de pages prédéfinis
const PAGE_TEMPLATES = [
  {
    id: 'blank',
    name: 'Page vide',
    description: 'Commencer avec une page vide',
    icon: '📄',
    blocks: []
  },
  {
    id: 'hero',
    name: 'Page avec Hero',
    description: 'Page avec bannière hero et sections',
    icon: '🎯',
    blocks: [
      {
        id: `hero-${Date.now()}`,
        type: 'hero',
        data: {
          title: 'Bienvenue',
          subtitle: 'Ajoutez votre message ici',
          button_text: 'En savoir plus',
          button_url: '#'
        }
      }
    ]
  },
  {
    id: 'about',
    name: 'Page À propos',
    description: 'Page type "À propos" avec titre, texte et image',
    icon: '👥',
    blocks: [
      {
        id: `heading-${Date.now()}`,
        type: 'heading',
        data: {
          text: 'À propos de nous',
          level: 'h1',
          align: 'center'
        }
      },
      {
        id: `text-${Date.now() + 1}`,
        type: 'text',
        data: {
          content: 'Rédigez votre texte ici...'
        }
      }
    ]
  },
  {
    id: 'contact',
    name: 'Page Contact',
    description: 'Page de contact avec formulaire',
    icon: '📧',
    blocks: [
      {
        id: `heading-${Date.now()}`,
        type: 'heading',
        data: {
          text: 'Contactez-nous',
          level: 'h1',
          align: 'center'
        }
      },
      {
        id: `text-${Date.now() + 1}`,
        type: 'text',
        data: {
          content: 'Utilisez le formulaire ci-dessous pour nous contacter.'
        }
      }
    ]
  },
  {
    id: 'services',
    name: 'Page Services',
    description: 'Page de présentation des services',
    icon: '⚙️',
    blocks: [
      {
        id: `heading-${Date.now()}`,
        type: 'heading',
        data: {
          text: 'Nos services',
          level: 'h1',
          align: 'center'
        }
      }
    ]
  }
]

export default function NewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [blocks, setBlocks] = useState<Block[]>([])
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft')
  const [isHomepage, setIsHomepage] = useState(false)

  useEffect(() => {
    setLoading(false)
  }, [])

  const handleTemplateSelect = (templateId: string) => {
    const template = PAGE_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setBlocks(template.blocks.map(block => ({
        ...block,
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      })))
      if (template.id !== 'blank' && !title) {
        setTitle(template.name)
      }
      setShowTemplateSelector(false)
      toast.success(`Template "${template.name}" appliqué`)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Le titre est requis')
      return
    }

    setSaving(true)
    try {
      // Ensure blocks is always an array
      const pageData: any = {
        title: title.trim(),
        blocks: Array.isArray(blocks) ? blocks : [],
        status,
        is_homepage: isHomepage,
      }

      // Only include optional fields if they have values
      if (metaTitle.trim()) {
        pageData.meta_title = metaTitle.trim()
      }
      if (metaDescription.trim()) {
        pageData.meta_description = metaDescription.trim()
      }

      await pageService.create(pageData)
      toast.success('Page créée avec succès !')
      router.push('/dashboard/pages')
    } catch (error: any) {
      console.error('Erreur création page:', error)
      
      // Handle validation errors with details
      if (error.response?.data?.fields) {
        const fields = error.response.data.fields
        const errorMessages = Object.entries(fields)
          .map(([field, messages]: [string, any]) => {
            const msgs = Array.isArray(messages) ? messages : [messages]
            return `${field}: ${msgs.join(', ')}`
          })
          .join('\n')
        toast.error(`Erreurs de validation:\n${errorMessages}`)
      } else if (error.response?.data?.details) {
        const details = Array.isArray(error.response.data.details) 
          ? error.response.data.details 
          : [error.response.data.details]
        toast.error(`Erreurs:\n${details.join('\n')}`)
      } else {
        const errorMessage = error.response?.data?.error || 
                            error.response?.data?.message ||
                            error.message ||
                            'Erreur lors de la création de la page'
        toast.error(errorMessage)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <TenantLayout title="Nouvelle Page">
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
      title="Nouvelle Page"
      subtitle="Créez votre page avec l'éditeur visuel"
      headerActions={
        <div className="flex items-center gap-3">
          {!showTemplateSelector && (
            <button
              onClick={() => {
                setShowTemplateSelector(true)
                setSelectedTemplate(null)
                setBlocks([])
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              Changer de template
            </button>
          )}
          <button
            onClick={() => router.push('/dashboard/pages')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            Annuler
          </button>
          {!showTemplateSelector && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Création...' : 'Créer la page'}
            </button>
          )}
        </div>
      }
    >
      {showTemplateSelector ? (
        /* Template Selector */
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Choisissez un template</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Sélectionnez un template pour démarrer rapidement ou commencez avec une page vide</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PAGE_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`p-6 border-2 rounded-lg transition-all hover:shadow-lg text-left ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <div className="text-4xl mb-3">{template.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-[calc(100vh-200px)] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
          {/* Page Title */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-xl font-bold dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              placeholder="Titre de la page *"
              required
            />
          </div>

          {/* Block Editor */}
          <div className="flex-1 overflow-hidden">
            <BlockEditor blocks={blocks} onChange={setBlocks} />
          </div>
        </div>
      )}

      {!showTemplateSelector && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
          <details className="cursor-pointer">
            <summary className="text-sm font-semibold text-gray-700 dark:text-gray-300">Réglages SEO et page</summary>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Titre SEO</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  placeholder="Titre pour les moteurs de recherche"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description SEO</label>
                <input
                  type="text"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                  placeholder="Description pour les moteurs de recherche"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'scheduled')}
                  className="w-full px-3 py-2 text-sm border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
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
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded"
                />
                <label htmlFor="is_homepage" className="ml-2 block text-xs text-gray-900 dark:text-gray-100">
                  Définir comme page d'accueil
                </label>
              </div>
            </div>
          </details>
        </div>
      )}
    </TenantLayout>
  )
}

