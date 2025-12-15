'use client'

import { useState, useEffect, useRef } from 'react'
import mediaService, { Media } from '@/services/media.service'
import toast from 'react-hot-toast'

interface ImageSelectorProps {
  value: string
  onChange: (url: string) => void
  label?: string
  placeholder?: string
  className?: string
  projectId?: number | null // ID du projet pour filtrer les images (null = toutes, 0 = sans projet)
}

export default function ImageSelector({
  value,
  onChange,
  label = 'Image',
  placeholder = 'Sélectionner ou uploader une image',
  className = '',
  projectId,
}: ImageSelectorProps) {
  const [images, setImages] = useState<Media[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterProject, setFilterProject] = useState<number | null | 'all'>(projectId !== undefined ? projectId : 'all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showModal) {
      loadImages()
    }
  }, [showModal, filterProject])

  const loadImages = async () => {
    try {
      setLoading(true)
      // Si filterProject est 'all', charger toutes les images
      // Sinon, filtrer par projet (null pour sans projet, number pour un projet spécifique)
      const projectFilter = filterProject === 'all' ? undefined : (filterProject === null ? 0 : filterProject)
      const allImages = await mediaService.getImages(projectFilter)
      setImages(Array.isArray(allImages) ? allImages : [])
    } catch (error: any) {
      console.error('Error chargement images:', error)
      // Ne pas afficher d'error si c'est une erreur attendue (401, etc.)
      if (error.response?.status !== 401 && error.code !== 'ERR_NETWORK') {
        toast.error('Error lors du chargement des images')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image')
      return
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('L\'image est trop volumineuse (max 10MB)')
      return
    }

    try {
      setUploading(true)
      // Déterminer le project_id à utiliser
      // Si projectId est fourni en prop, l'utiliser
      // Sinon, utiliser le filtre actuel (mais pas 'all')
      const uploadProjectId = projectId !== undefined 
        ? projectId 
        : (filterProject !== 'all' ? filterProject : null)
      
      const uploaded = await mediaService.upload(file, {
        alt_text: file.name,
        collection: 'images',
        project_id: uploadProjectId,
      })
      
      if (uploaded.url) {
        onChange(uploaded.url)
        toast.success('Image uploadée avec succès !')
        setShowModal(false)
        // Recharger la liste des images
        await loadImages()
      } else {
        toast.error('Error lors de l\'upload de l\'image')
      }
    } catch (error: any) {
      console.error('Error upload image:', error)
      toast.error(error.response?.data?.error || 'Error lors de l\'upload de l\'image')
    } finally {
      setUploading(false)
      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Grouper les images par projet pour l'affichage
  const imagesByProject = images.reduce((acc, img) => {
    const projectKey = img.project ? `project-${img.project}` : 'no-project'
    if (!acc[projectKey]) {
      acc[projectKey] = {
        projectId: img.project || null,
        projectName: img.project_name || 'Sans projet (Globales)',
        images: []
      }
    }
    acc[projectKey].images.push(img)
    return acc
  }, {} as Record<string, { projectId: number | null; projectName: string; images: Media[] }>)

  const filteredImagesByProject = Object.entries(imagesByProject).reduce((acc, [key, group]) => {
    const filtered = group.images.filter((img) =>
      img.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.alt_text?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    if (filtered.length > 0) {
      acc[key] = { ...group, images: filtered }
    }
    return acc
  }, {} as Record<string, { projectId: number | null; projectName: string; images: Media[] }>)

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      
      {/* Aperçu de l'image actuelle */}
      {value && (
        <div className="relative w-full h-32 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={value}
            alt="Aperçu"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Afficher un placeholder si l'image ne charge pas
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E'
            }}
          />
          <button
            onClick={() => onChange('')}
            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            title="Supprimer l'image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex-1 px-3 py-2 text-xs font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {value ? 'Changer' : 'Sélectionner'}
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 text-xs font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Upload...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Uploader</span>
            </>
          )}
        </button>
      </div>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Modal de sélection d'image */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Sélectionner une image</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une image..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Images Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : Object.keys(filteredImagesByProject).length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'Aucune image trouvée' : 'Aucune image disponible. Uploader une image pour commencer.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(filteredImagesByProject).map(([key, group]) => (
                    <div key={key}>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 px-2">
                        📁 {group.projectName} ({group.images.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {group.images.map((image) => (
                          <button
                            key={image.id}
                            onClick={() => {
                              onChange(image.url || '')
                              setShowModal(false)
                              toast.success('Image sélectionnée')
                            }}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              value === image.url
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                            }`}
                          >
                            <img
                              src={image.url}
                              alt={image.alt_text || image.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E'
                              }}
                            />
                            {value === image.url && (
                              <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                              {image.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Upload...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Uploader une nouvelle image</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

