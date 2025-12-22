import React from 'react'
import { RendererCaseProps } from './types'

export function renderPricingCards({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const pricingCardsSource = safeBlock.data.source || 'dynamic'
  const pricingCardsPlans = safeBlock.data.plans || []
  
  return (
    <div className="space-y-3">
      <div>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={safeBlock.data.support_dark_mode !== false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, support_dark_mode: e.target.checked } })}
            className="w-3 h-3"
          />
          <span className="text-gray-700 dark:text-gray-300">Support du mode sombre</span>
        </label>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
          Activez cette option pour que le bloc s'adapte automatiquement au mode sombre. Désactivez pour forcer le mode clair.
        </p>
      </div>
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
          Sous-titre (optionnel)
        </label>
        <input
          type="text"
          value={safeBlock.data.subtitle || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, subtitle: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Choisissez le plan adapté à vos besoins"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Style prédéfini
        </label>
        <select
          value={safeBlock.data.style || 'pricing-plans'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, style: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="pricing-plans">Plans tarifaires (avec fonctionnalités)</option>
          <option value="services">Services/Prestations (avec tarifs)</option>
        </select>
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
          Choisissez le style d'affichage : plans tarifaires (pour abonnements) ou services/prestations (pour VTC, etc.)
        </p>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Source des plans
        </label>
        <select
          value={pricingCardsSource}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, source: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="dynamic">API (chargement automatique)</option>
          <option value="manual">Manuel (saisie)</option>
        </select>
      </div>
      <div>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={safeBlock.data.show_discount !== false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_discount: e.target.checked } })}
            className="w-3 h-3"
          />
          <span className="text-gray-700 dark:text-gray-300">Afficher la réduction (si prix annuel disponible)</span>
        </label>
      </div>
      {pricingCardsSource === 'dynamic' ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Endpoint API
            </label>
            <input
              type="text"
              value={safeBlock.data.api_endpoint || '/api/pricing-plans/'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, api_endpoint: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="/api/pricing-plans/"
            />
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
              Les plans seront chargés automatiquement depuis l'API
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Plan "Populaire" (override)
            </label>
            <input
              type="text"
              value={safeBlock.data.featured_plan_override || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, featured_plan_override: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="ID ou slug du plan (ex: 2, starter, business)"
            />
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
              Indiquez l'ID ou le slug du plan qui sera marqué comme "Populaire". Laissez vide pour utiliser le plan marqué comme featured dans l'API.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Plans tarifaires ({pricingCardsPlans.length})
            </label>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pricingCardsPlans.map((plan: any, index: number) => (
                <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Plan {index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={plan.is_featured || false}
                          onChange={(e) => {
                            const newPlans = [...pricingCardsPlans]
                            newPlans[index] = { ...plan, is_featured: e.target.checked }
                            onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                          }}
                          className="w-3 h-3"
                        />
                        <span className="text-gray-600 dark:text-gray-400">Mis en avant</span>
                      </label>
                      <button
                        onClick={() => {
                          const newPlans = pricingCardsPlans.filter((_: any, i: number) => i !== index)
                          onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                        }}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        title="Supprimer ce plan"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={plan.name || ''}
                      onChange={(e) => {
                        const newPlans = [...pricingCardsPlans]
                        newPlans[index] = { ...plan, name: e.target.value }
                        onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                      }}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      placeholder="Nom du plan (ex: Starter)"
                    />
                    <textarea
                      value={plan.description || ''}
                      onChange={(e) => {
                        const newPlans = [...pricingCardsPlans]
                        newPlans[index] = { ...plan, description: e.target.value }
                        onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                      }}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      placeholder="Description du plan"
                      rows={2}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-600 dark:text-gray-400">Prix mensuel (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={plan.price_monthly || ''}
                          onChange={(e) => {
                            const newPlans = [...pricingCardsPlans]
                            newPlans[index] = { ...plan, price_monthly: parseFloat(e.target.value) || 0 }
                            onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                          }}
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                          placeholder="29.99"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-600 dark:text-gray-400">Prix annuel (€) <span className="text-gray-400">(optionnel)</span></label>
                        <input
                          type="number"
                          step="0.01"
                          value={plan.price_yearly || ''}
                          onChange={(e) => {
                            const newPlans = [...pricingCardsPlans]
                            const value = e.target.value
                            newPlans[index] = { ...plan, price_yearly: value ? parseFloat(value) : undefined }
                            onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                          }}
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                          placeholder="299.99 (optionnel)"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      value={plan.badge || ''}
                      onChange={(e) => {
                        const newPlans = [...pricingCardsPlans]
                        newPlans[index] = { ...plan, badge: e.target.value }
                        onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                      }}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      placeholder="Badge (ex: POPULAIRE)"
                    />
                    <div>
                      <label className="text-[10px] text-gray-600 dark:text-gray-400 mb-1 block">Fonctionnalités</label>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {(plan.features || []).map((feature: string, fIndex: number) => (
                          <div key={fIndex} className="flex items-center gap-1">
                            <input
                              type="text"
                              value={feature}
                              onChange={(e) => {
                                const newPlans = [...pricingCardsPlans]
                                const newFeatures = [...(plan.features || [])]
                                newFeatures[fIndex] = e.target.value
                                newPlans[index] = { ...plan, features: newFeatures }
                                onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                              }}
                              className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                              placeholder="Fonctionnalité"
                            />
                            <button
                              onClick={() => {
                                const newPlans = [...pricingCardsPlans]
                                const newFeatures = (plan.features || []).filter((_: string, i: number) => i !== fIndex)
                                newPlans[index] = { ...plan, features: newFeatures }
                                onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                              }}
                              className="px-1.5 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newPlans = [...pricingCardsPlans]
                            const newFeatures = [...(plan.features || []), '']
                            newPlans[index] = { ...plan, features: newFeatures }
                            onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                          }}
                          className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          + Ajouter une fonctionnalité
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-600 dark:text-gray-400">Texte du bouton</label>
                        <input
                          type="text"
                          value={plan.button_text || ''}
                          onChange={(e) => {
                            const newPlans = [...pricingCardsPlans]
                            newPlans[index] = { ...plan, button_text: e.target.value }
                            onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                          }}
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                          placeholder="Choisir ce plan"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-600 dark:text-gray-400">URL du bouton</label>
                        <input
                          type="text"
                          value={plan.button_url || ''}
                          onChange={(e) => {
                            const newPlans = [...pricingCardsPlans]
                            newPlans[index] = { ...plan, button_url: e.target.value }
                            onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                          }}
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                          placeholder="/register?plan=starter"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-600 dark:text-gray-400">Style du bouton</label>
                      <select
                        value={plan.button_style || 'primary'}
                        onChange={(e) => {
                          const newPlans = [...pricingCardsPlans]
                          newPlans[index] = { ...plan, button_style: e.target.value }
                          onUpdate({ data: { ...safeBlock.data, plans: newPlans } })
                        }}
                        className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      >
                        <option value="primary">Principal (bleu)</option>
                        <option value="secondary">Secondaire (gris)</option>
                        <option value="outline">Contour (transparent)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => onUpdate({ 
                data: { 
                  ...safeBlock.data, 
                  plans: [...pricingCardsPlans, { 
                    name: '', 
                    description: '', 
                    price_monthly: 0, 
                    price_yearly: 0,
                    badge: '',
                    is_featured: false,
                    features: [], 
                    button_text: 'Choisir ce plan', 
                    button_url: '/register',
                    button_style: 'primary'
                  }] 
                } 
              })}
              className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
            >
              + Ajouter un plan tarifaire
            </button>
          </div>
        </>
      )}
    </div>
  )
}

