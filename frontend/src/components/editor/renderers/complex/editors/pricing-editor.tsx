'use client'

import React from 'react'
import { Block } from '../../../types'
import { BlockType } from '@/services/blocks.service'
import { CollapsibleSection } from '../../../CollapsibleSection'
import UrlInputWithSuggestions from '../../../ui/UrlInputWithSuggestions'

interface ComplexRendererProps {
  block: Block
  blockType?: BlockType
  onUpdate: (updates: Partial<Block>) => void
}

export function renderPricing({ block, onUpdate }: ComplexRendererProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const defaultPlans = [
    {
      name: 'Starter',
      description: 'Pour débuter',
      price_monthly: '29',
      price_yearly: '290',
      period: 'monthly',
      badge: '',
      is_featured: false,
      features: ['Site professionnel', 'Réservations', 'Paiements', 'Support email'],
      button_text: 'Choisir ce plan',
      button_url: '/register?plan=starter',
      button_style: 'primary'
    },
    {
      name: 'Pro',
      description: 'Pour les professionnels',
      price_monthly: '79',
      price_yearly: '790',
      period: 'monthly',
      badge: 'POPULAIRE',
      is_featured: true,
      features: ['Tout Starter', 'Analytics avancés', 'Support prioritaire', 'Personnalisation avancée'],
      button_text: 'Choisir ce plan',
      button_url: '/register?plan=pro',
      button_style: 'primary'
    },
    {
      name: 'Enterprise',
      description: 'Pour les grandes entreprises',
      price_monthly: '199',
      price_yearly: '1990',
      period: 'monthly',
      badge: '',
      is_featured: false,
      features: ['Tout Pro', 'Multi-sites', 'API personnalisée', 'Support dédié'],
      button_text: 'Nous contacter',
      button_url: '/contact',
      button_style: 'secondary'
    }
  ]
  const plans = safeBlock.data.plans && safeBlock.data.plans.length > 0
    ? safeBlock.data.plans
    : defaultPlans

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre de la section
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Nos tarifs"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Sous-titre de la section
        </label>
        <textarea
          value={safeBlock.data.subtitle || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, subtitle: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          rows={2}
          placeholder="Choisissez le plan qui vous convient"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Option de période (mensuel/annuel)
        </label>
        <select
          value={safeBlock.data.period_option || 'both'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, period_option: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="both">Mensuel et Annuel</option>
          <option value="monthly">Mensuel seulement</option>
          <option value="yearly">Annuel seulement</option>
        </select>
      </div>
      <CollapsibleSection title="Plans tarifaires" count={plans.length} defaultCollapsed={false}>
        <div className="space-y-3">
          {plans.map((plan: any, index: number) => (
            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Plan {index + 1}</span>
                <button
                  onClick={() => {
                    const newPlans = plans.filter((_: any, i: number) => i !== index)
                    onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                  title="Supprimer ce plan"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              </div>
              <input
                type="text"
                value={plan.name || ''}
                onChange={(e) => {
                  const newPlans = [...plans]
                  newPlans[index] = { ...plan, name: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-2"
                placeholder="Nom du plan (ex: Starter)"
              />
              <textarea
                value={plan.description || ''}
                onChange={(e) => {
                  const newPlans = [...plans]
                  newPlans[index] = { ...plan, description: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-2"
                rows={2}
                placeholder="Description du plan"
              />
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  value={plan.price_monthly || ''}
                  onChange={(e) => {
                    const newPlans = [...plans]
                    newPlans[index] = { ...plan, price_monthly: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Prix mensuel (ex: 29)"
                />
                <input
                  type="text"
                  value={plan.price_yearly || ''}
                  onChange={(e) => {
                    const newPlans = [...plans]
                    newPlans[index] = { ...plan, price_yearly: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Prix annuel (ex: 290)"
                />
              </div>
              <input
                type="text"
                value={plan.badge || ''}
                onChange={(e) => {
                  const newPlans = [...plans]
                  newPlans[index] = { ...plan, badge: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-2"
                placeholder="Badge (ex: POPULAIRE)"
              />
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={plan.is_featured || false}
                  onChange={(e) => {
                    const newPlans = [...plans]
                    newPlans[index] = { ...plan, is_featured: e.target.checked }
                    onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                  }}
                  className="w-4 h-4"
                />
                <label className="text-xs text-gray-700 dark:text-gray-300">Mettre en avant</label>
              </div>
              <CollapsibleSection title="Fonctionnalités du plan" count={plan.features?.length || 0} defaultCollapsed={true}>
                <div className="space-y-1">
                  {(plan.features || []).map((feature: string, featureIndex: number) => (
                    <div key={featureIndex} className="flex gap-1">
                      <input
                        type="text"
                        value={feature || ''}
                        onChange={(e) => {
                          const newPlans = [...plans]
                          const newFeatures = [...(newPlans[index].features || [])]
                          newFeatures[featureIndex] = e.target.value
                          newPlans[index] = { ...plan, features: newFeatures }
                          onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                        }}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                        placeholder="Fonctionnalité"
                      />
                      <button
                        onClick={() => {
                          const newPlans = [...plans]
                          newPlans[index] = {
                            ...plan,
                            features: (plan.features || []).filter((_: string, i: number) => i !== featureIndex)
                          }
                          onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                        }}
                        className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center"
                        title="Supprimer cette fonctionnalité"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newPlans = [...plans]
                      newPlans[index] = {
                        ...plan,
                        features: [...(plan.features || []), '']
                      }
                      onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                    }}
                    className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    + Ajouter fonctionnalité
                  </button>
                </div>
              </CollapsibleSection>
              <input
                type="text"
                value={plan.button_text || ''}
                onChange={(e) => {
                  const newPlans = [...plans]
                  newPlans[index] = { ...plan, button_text: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-2"
                placeholder="Texte du bouton (ex: Choisir ce plan)"
              />
              <UrlInputWithSuggestions
                value={plan.button_url || ''}
                onChange={(url) => {
                  const newPlans = [...plans]
                  newPlans[index] = { ...plan, button_url: url }
                  onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                }}
                placeholder="URL du bouton..."
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 mb-2"
              />
              <select
                value={plan.button_style || 'primary'}
                onChange={(e) => {
                  const newPlans = [...plans]
                  newPlans[index] = { ...plan, button_style: e.target.value }
                  onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                }}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="primary">Primaire</option>
                <option value="secondary">Secondaire</option>
              </select>
            </div>
          ))}
          <button
            onClick={() => onUpdate({ data: { ...safeBlock.data, plans: [...plans, { name: '', description: '', price_monthly: '', price_yearly: '', period: 'monthly', badge: '', is_featured: false, features: [], button_text: '', button_url: '', button_style: 'primary' }] } })}
            className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            + Ajouter un plan
          </button>
        </div>
      </CollapsibleSection>
    </div>
  )
}

