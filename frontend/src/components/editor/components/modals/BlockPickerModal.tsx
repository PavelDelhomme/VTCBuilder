'use client'

/**
 * Modal pour choisir un bloc (nouveau ou existant)
 */

import React, { useState, useMemo, useEffect } from 'react'
import { Block } from '../../types'
import { BlockType } from '@/services/blocks.service'
import { DraggableBlockItem } from '../drag-drop/DraggableBlockItem'
import { useFeatures } from '@/contexts/FeaturesContext'
import authService from '@/services/auth.service'
import billingService, { PricingPlan } from '@/services/billing.service'

interface BlockPickerModalProps {
  blockTypes: BlockType[]
  existingBlocks?: Block[]
  onSelectNew?: (blockType: BlockType) => void
  onSelectExisting?: (block: Block) => void
  onClose: () => void
  blockTypesForExisting?: BlockType[]
}

export function BlockPickerModal({
  blockTypes,
  existingBlocks = [],
  onSelectNew,
  onSelectExisting,
  onClose,
  blockTypesForExisting = [],
}: BlockPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'new' | 'existing'>('new')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [pricingFilter, setPricingFilter] = useState<'all' | 'free' | 'premium'>('all')
  const [planFilter, setPlanFilter] = useState<number | 'all'>('all')
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const { canUseBlockType } = useFeatures()
  const isSuperAdmin = authService.isSuperAdmin()

  // Charger les forfaits
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const plans = await billingService.getPricingPlans()
        setPricingPlans(plans)
      } catch (error) {
        console.warn('Erreur chargement forfaits:', error)
      }
    }
    loadPlans()
  }, [])

  // Filtrer les blocs selon la recherche, catégorie, prix et forfait
  const filteredBlockTypes = useMemo(() => {
    let filtered = blockTypes

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((bt) => {
        const name = (bt.name || '').toLowerCase()
        const label = (bt.label || '').toLowerCase()
        const description = (bt.description || '').toLowerCase()
        const category = (bt.category || '').toLowerCase()
        return name.includes(query) || label.includes(query) || description.includes(query) || category.includes(query)
      })
    }

    // Filtre par catégorie
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((bt) => bt.category === categoryFilter)
    }

    // Filtre par gratuit/payant
    if (pricingFilter !== 'all') {
      filtered = filtered.filter((bt) => {
        const isPremium = (bt as any).is_premium || (bt.available_plans && bt.available_plans.length > 0)
        if (pricingFilter === 'free') {
          return !isPremium
        } else if (pricingFilter === 'premium') {
          return isPremium
        }
        return true
      })
    }

    // Filtre par forfait
    if (planFilter !== 'all') {
      filtered = filtered.filter((bt) => {
        if (!bt.available_plans || bt.available_plans.length === 0) {
          // Bloc gratuit disponible pour tous
          return planFilter === 'all' || pricingFilter === 'free'
        }
        return bt.available_plans.includes(planFilter as number)
      })
    }

    // Filtrer selon les permissions (sauf pour les super admins)
    if (!isSuperAdmin) {
      filtered = filtered.filter((bt) => {
        const isPremium = (bt as any).is_premium || (bt.available_plans && bt.available_plans.length > 0)
        return canUseBlockType(bt.name, isPremium)
      })
    }

    return filtered
  }, [blockTypes, searchQuery, categoryFilter, pricingFilter, planFilter, canUseBlockType, isSuperAdmin])
  
  // Grouper les blocs filtrés par catégorie
  const groupedBlocks = useMemo(() => {
    const groups: Record<string, BlockType[]> = {}
    filteredBlockTypes.forEach((bt) => {
      const category = bt.category || 'Autres'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(bt)
    })
    return groups
  }, [filteredBlockTypes])

  // Obtenir les catégories uniques
  const categories = useMemo(() => {
    const cats = new Set<string>()
    blockTypes.forEach((bt) => {
      if (bt.category) {
        cats.add(bt.category)
      }
    })
    return Array.from(cats).sort()
  }, [blockTypes])

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            Choisir un bloc
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Onglets pour choisir entre nouveaux blocs et blocs existants */}
        {existingBlocks.length > 0 && (
          <div className="flex border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 gap-1">
            <button
              onClick={() => setActiveTab('new')}
              className={`px-3 py-3 text-sm font-medium border-b-2 transition-colors relative group ${
                activeTab === 'new'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title={`Nouveaux blocs (${blockTypes.length})`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                Nouveaux blocs ({blockTypes.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab('existing')}
              className={`px-3 py-3 text-sm font-medium border-b-2 transition-colors relative group ${
                activeTab === 'existing'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title={`Blocs existants (${existingBlocks.length})`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                Blocs existants ({existingBlocks.length})
              </span>
            </button>
          </div>
        )}

        {/* Barre de recherche et filtres */}
        <div className="px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un bloc..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-2">
            {/* Filtre par catégorie */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'layout' ? 'Mise en page' : cat === 'content' ? 'Contenu' : cat === 'media' ? 'Média' : cat === 'custom' ? 'Personnalisé' : cat}
                </option>
              ))}
            </select>

            {/* Filtre gratuit/payant */}
            <select
              value={pricingFilter}
              onChange={(e) => setPricingFilter(e.target.value as 'all' | 'free' | 'premium')}
              className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les blocs</option>
              <option value="free">Gratuit</option>
              <option value="premium">Premium</option>
            </select>

            {/* Filtre par forfait */}
            {pricingPlans.length > 0 && (
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les forfaits</option>
                {pricingPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            )}

            {/* Bouton réinitialiser les filtres */}
            {(categoryFilter !== 'all' || pricingFilter !== 'all' || planFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setCategoryFilter('all')
                  setPricingFilter('all')
                  setPlanFilter('all')
                  setSearchQuery('')
                }}
                className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'new' ? (
            // Onglet nouveaux blocs
            Object.keys(groupedBlocks).length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Aucun bloc trouvé
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Essayez avec d'autres mots-clés
                </p>
              </div>
            ) : (
              <>
                {Object.entries(groupedBlocks).map(([category, blocks]) => (
                  <div key={category} className="mb-6">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-md inline-block">
                      {category}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {(blocks as BlockType[]).map((bt) => (
                        <DraggableBlockItem
                          key={bt.name}
                          blockType={bt}
                          onSelect={() => {
                            if (onSelectNew) onSelectNew(bt)
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )
          ) : (
            // Onglet blocs existants
            existingBlocks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📦</div>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Aucun bloc existant disponible
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Créez d'abord des blocs dans l'éditeur
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {existingBlocks.map((existingBlock) => {
                  const blockType = blockTypesForExisting.find(bt => bt.name === existingBlock.type)
                  return (
                    <button
                      key={existingBlock.id}
                      onClick={() => {
                        if (onSelectExisting) {
                          onSelectExisting(existingBlock)
                          onClose() // Fermer le modal après sélection
                        }
                      }}
                      className="w-full p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-600 hover:shadow-lg transition-all text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center text-2xl">
                          {blockType?.icon || '📦'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {blockType?.label || existingBlock.type}
                            </span>
                            <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
                              Existant
                            </span>
                          </div>
                          {blockType?.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                              {blockType.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                            <span>ID: {existingBlock.id.substring(0, 8)}...</span>
                            {existingBlock.data && Object.keys(existingBlock.data).length > 0 && (
                              <span>• {Object.keys(existingBlock.data).length} propriété(s)</span>
                            )}
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

