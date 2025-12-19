'use client'

import React from 'react'
import { Block } from './types'
import { BlockType } from '@/services/blocks.service'
import { CollapsibleSection } from './CollapsibleSection'
import UrlInputWithSuggestions from './ui/UrlInputWithSuggestions'
import PageSelector from './ui/PageSelector'
import ImageSelector from './ui/ImageSelector'
import {
  RichTextEditorConfig,
  MarkdownEditorConfig,
  HtmlRawConfig,
  IconConfig,
  LabelConfig,
  TooltipConfig,
  PopoverConfig,
  DropdownConfig,
  CategoriesConfig,
  AuthorBoxConfig,
  RelatedPostsConfig,
  TableOfContentsConfig,
  ReadingTimeConfig,
  ShareButtonsConfig,
  FlexboxConfig,
  GridConfig,
  StackConfig,
  InlineConfig,
  GroupConfig,
  WrapperConfig,
  ImageSliderConfig,
  LightboxConfig,
  VimeoEmbedConfig,
  CounterConfig,
  CardGridConfig,
  LogoCarouselConfig,
  RouteCalculatorConfig,
  FareCalculatorConfig,
  AvailabilityCalendarConfig,
  CaptchaConfig,
  FormMultiStepConfig,
  FormConditionalConfig,
  FormCalculatorConfig,
  FormFileUploadConfig,
  FormPaymentConfig,
  FormQuizConfig,
  FormSurveyConfig,
  FormPollConfig,
  FormRSVPConfig,
} from './blocks-implementations'
import {
  DriverProfileConfig,
  EmailButtonConfig,
  SMSButtonConfig,
  ProductGalleryConfig,
  ProductDetailsConfig,
  AddToCartConfig,
  BuyNowConfig,
  VehicleComparisonConfig,
  ServicePackagesConfig,
  TrustBadgesConfig,
  PaymentMethodsConfig,
} from './blocks-vtc-ecommerce'
import {
  renderContainer,
  renderFlexContainer,
  renderGridContainer,
  renderColumns,
  renderRows,
  renderSection,
} from './renderers/layout'
import {
  renderText,
  renderHeading,
  renderParagraph,
  renderLine,
  renderButton,
  renderLink,
  renderList,
  renderAlert,
  renderCode,
  renderTable,
  renderQuote,
  renderSpacer,
  renderDivider,
} from './renderers/content'
import {
  renderImage,
  renderVideo,
  renderGallery,
  renderBanner,
  renderCarousel,
  renderAudioPlayer,
  renderLogoGrid,
} from './renderers/media'
import {
  renderHero,
  renderHeader,
  renderFooter,
  renderFeaturesGrid,
  renderPricing,
  renderCTASection,
  renderTestimonials,
  renderTimeline,
  renderAccordion,
  renderStats,
  renderSocialLinks,
  renderFAQ,
  renderContactForm,
} from './renderers/complex/ComplexRenderers'

export function BlockRenderer({
  block,
  blockType,
  onUpdate,
}: {
  block: Block
  blockType?: BlockType
  onUpdate: (updates: Partial<Block>) => void
}) {
  // Protection complète : s'assurer que block et block.data existent
  if (!block) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
        <p className="text-sm font-semibold">Erreur : Bloc non défini</p>
      </div>
    )
  }
  
  const safeBlock = { 
    ...block, 
    data: block.data || {},
    styles: block.styles || {},
    type: block.type || 'text'
  }
  
  // Render based on block type
  switch (safeBlock.type) {
    case 'container':
      return renderContainer({ block, onUpdate })
    
    case 'flex-container':
      return renderFlexContainer({ block, onUpdate })
    
    case 'grid-container':
      return renderGridContainer({ block, onUpdate })
    
    case 'text':
      return renderText({ block, onUpdate })
    case 'heading':
      return renderHeading({ block, onUpdate })
    case 'image':
      return renderImage({ block, onUpdate })
    case 'button':
      return renderButton({ block, onUpdate })
    case 'video':
      return renderVideo({ block, onUpdate })
    case 'spacer':
      return renderSpacer({ block, onUpdate })
    case 'divider':
      return renderDivider({ block, onUpdate })
    case 'alert':
      return renderAlert({ block, onUpdate })
    case 'code':
      return renderCode({ block, onUpdate })
    case 'table':
      return renderTable({ block, onUpdate })
    case 'rows':
      return renderRows({ block, onUpdate })
    case 'paragraph':
      return renderParagraph({ block, onUpdate })
    case 'line':
      return renderLine({ block, onUpdate })
    case 'form-newsletter':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Inscrivez-vous à notre newsletter"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={safeBlock.data.description || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, description: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              rows={2}
              placeholder="Recevez nos dernières actualités..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte du bouton
            </label>
            <input
              type="text"
              value={safeBlock.data.button_text || 'S\'inscrire'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_text: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      )
    case 'form-search':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Placeholder
            </label>
            <input
              type="text"
              value={safeBlock.data.placeholder || 'Rechercher...'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, placeholder: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte du bouton
            </label>
            <input
              type="text"
              value={safeBlock.data.button_text || 'Rechercher'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_text: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      )
    case 'form-inscription':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Créer un compte"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`form-inscription-name-${block.id}`}
                checked={safeBlock.data.show_name !== false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_name: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`form-inscription-name-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Champ Nom
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`form-inscription-email-${block.id}`}
                checked={safeBlock.data.show_email !== false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_email: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`form-inscription-email-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Champ Email
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`form-inscription-password-${block.id}`}
                checked={safeBlock.data.show_password !== false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_password: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`form-inscription-password-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Champ Mot de passe
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`form-inscription-phone-${block.id}`}
                checked={safeBlock.data.show_phone || false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_phone: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`form-inscription-phone-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Champ Téléphone
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte du bouton
            </label>
            <input
              type="text"
              value={safeBlock.data.button_text || 'S\'inscrire'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_text: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`form-inscription-captcha-${block.id}`}
              checked={safeBlock.data.enable_captcha || false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, enable_captcha: e.target.checked } })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={`form-inscription-captcha-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
              Activer le captcha
            </label>
          </div>
          {safeBlock.data.enable_captcha && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Thème du captcha
              </label>
              <select
                value={safeBlock.data.captcha_theme || 'light'}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, captcha_theme: e.target.value } })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
              </select>
            </div>
          )}
        </div>
      )
    case 'testimonials':
      return renderTestimonials({ block, onUpdate })
    case 'features-grid':
    case 'features_grid': // Alias pour compatibilité
      return renderFeaturesGrid({ block, onUpdate })
    
    case 'pricing_cards':
    case 'pricing-cards':
      // Configuration pour pricing_cards - similaire à features_grid mais pour les plans tarifaires
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
    
    case 'pricing':
      return renderPricing({ block, onUpdate })
    case 'timeline':
      return renderTimeline({ block, onUpdate })
    case 'accordion':
      return renderAccordion({ block, onUpdate })
    case 'faq':
    case 'faq-section':
      return renderFAQ({ block, onUpdate })
    case 'stats':
      return renderStats({ block, onUpdate })
    case 'social-links':
      return renderSocialLinks({ block, onUpdate })
    case 'booking-form':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre du formulaire
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Réservez votre course"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`booking-pickup-${block.id}`}
                checked={safeBlock.data.show_pickup !== false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_pickup: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`booking-pickup-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Point de prise en charge
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`booking-dropoff-${block.id}`}
                checked={safeBlock.data.show_dropoff !== false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_dropoff: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`booking-dropoff-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Point de destination
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`booking-date-${block.id}`}
                checked={safeBlock.data.show_date !== false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_date: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`booking-date-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Date et heure
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`booking-passengers-${block.id}`}
                checked={safeBlock.data.show_passengers || false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_passengers: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`booking-passengers-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Nombre de passagers
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`booking-vehicle-${block.id}`}
                checked={safeBlock.data.show_vehicle || false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_vehicle: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`booking-vehicle-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Type de véhicule
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`booking-phone-${block.id}`}
                checked={safeBlock.data.show_phone !== false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_phone: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`booking-phone-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Téléphone
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`booking-notes-${block.id}`}
                checked={safeBlock.data.show_notes || false}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_notes: e.target.checked } })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`booking-notes-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
                Notes spéciales
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte du bouton
            </label>
            <input
              type="text"
              value={safeBlock.data.button_text || 'Réserver'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_text: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`booking-captcha-${block.id}`}
              checked={safeBlock.data.enable_captcha || false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, enable_captcha: e.target.checked } })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={`booking-captcha-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
              Activer le captcha
            </label>
          </div>
          {safeBlock.data.enable_captcha && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Thème du captcha
              </label>
              <select
                value={safeBlock.data.captcha_theme || 'light'}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, captcha_theme: e.target.value } })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
              </select>
            </div>
          )}
        </div>
      )
    case 'pricing-table':
      const pricingRows = safeBlock.data.rows || [{ route: '', price: '', duration: '' }]
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
              Lignes de tarifs ({pricingRows.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pricingRows.map((row: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="text"
                    value={row.route || ''}
                    onChange={(e) => {
                      const newRows = [...pricingRows]
                      newRows[index] = { ...row, route: e.target.value }
                      onUpdate({ data: { ...block.data, rows: newRows } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Trajet (ex: Aéroport → Centre-ville)"
                  />
                  <div className="grid grid-cols-2 gap-1">
                    <input
                      type="text"
                      value={row.price || ''}
                      onChange={(e) => {
                        const newRows = [...pricingRows]
                        newRows[index] = { ...row, price: e.target.value }
                        onUpdate({ data: { ...block.data, rows: newRows } })
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      placeholder="Prix (ex: 45€)"
                    />
                    <input
                      type="text"
                      value={row.duration || ''}
                      onChange={(e) => {
                        const newRows = [...pricingRows]
                        newRows[index] = { ...row, duration: e.target.value }
                        onUpdate({ data: { ...block.data, rows: newRows } })
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      placeholder="Durée (ex: 30 min)"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, rows: [...pricingRows, { route: '', price: '', duration: '' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {pricingRows.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, rows: pricingRows.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )
    case 'service-zones':
      const zones = safeBlock.data.zones || [{ name: '', description: '', icon: '' }]
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
              placeholder="Zones de service"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Zones ({zones.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {zones.map((zone: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="text"
                    value={zone.name || ''}
                    onChange={(e) => {
                      const newZones = [...zones]
                      newZones[index] = { ...zone, name: e.target.value }
                      onUpdate({ data: { ...block.data, zones: newZones } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Nom de la zone"
                  />
                  <textarea
                    value={zone.description || ''}
                    onChange={(e) => {
                      const newZones = [...zones]
                      newZones[index] = { ...zone, description: e.target.value }
                      onUpdate({ data: { ...block.data, zones: newZones } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Description"
                    rows={2}
                  />
                  <input
                    type="text"
                    value={zone.icon || ''}
                    onChange={(e) => {
                      const newZones = [...zones]
                      newZones[index] = { ...zone, icon: e.target.value }
                      onUpdate({ data: { ...block.data, zones: newZones } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Icône emoji (ex: 🚗)"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, zones: [...zones, { name: '', description: '', icon: '' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {zones.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, zones: zones.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )
    case 'vehicle-gallery':
      const vehicles = safeBlock.data.vehicles || [{ name: '', image: '', description: '', features: '' }]
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
              placeholder="Notre flotte"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Véhicules ({vehicles.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {vehicles.map((vehicle: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="text"
                    value={vehicle.name || ''}
                    onChange={(e) => {
                      const newVehicles = [...vehicles]
                      newVehicles[index] = { ...vehicle, name: e.target.value }
                      onUpdate({ data: { ...block.data, vehicles: newVehicles } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Nom du véhicule"
                  />
                  <input
                    type="url"
                    value={vehicle.image || ''}
                    onChange={(e) => {
                      const newVehicles = [...vehicles]
                      newVehicles[index] = { ...vehicle, image: e.target.value }
                      onUpdate({ data: { ...block.data, vehicles: newVehicles } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="URL image"
                  />
                  <textarea
                    value={vehicle.description || ''}
                    onChange={(e) => {
                      const newVehicles = [...vehicles]
                      newVehicles[index] = { ...vehicle, description: e.target.value }
                      onUpdate({ data: { ...block.data, vehicles: newVehicles } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Description"
                    rows={2}
                  />
                  <input
                    type="text"
                    value={vehicle.features || ''}
                    onChange={(e) => {
                      const newVehicles = [...vehicles]
                      newVehicles[index] = { ...vehicle, features: e.target.value }
                      onUpdate({ data: { ...block.data, vehicles: newVehicles } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Caractéristiques (ex: 4 places, WiFi, Climatisation)"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, vehicles: [...vehicles, { name: '', image: '', description: '', features: '' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {vehicles.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, vehicles: vehicles.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )
    case 'contact-buttons':
      const contacts = safeBlock.data.contacts || [{ type: 'phone', label: '', value: '', icon: '' }]
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
              placeholder="Contactez-nous"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contacts ({contacts.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {contacts.map((contact: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <select
                    value={contact.type || 'phone'}
                    onChange={(e) => {
                      const newContacts = [...contacts]
                      newContacts[index] = { ...contact, type: e.target.value }
                      onUpdate({ data: { ...block.data, contacts: newContacts } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  >
                    <option value="phone">Téléphone</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                  <input
                    type="text"
                    value={contact.label || ''}
                    onChange={(e) => {
                      const newContacts = [...contacts]
                      newContacts[index] = { ...contact, label: e.target.value }
                      onUpdate({ data: { ...block.data, contacts: newContacts } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Label (ex: Appelez-nous)"
                  />
                  <input
                    type="text"
                    value={contact.value || ''}
                    onChange={(e) => {
                      const newContacts = [...contacts]
                      newContacts[index] = { ...contact, value: e.target.value }
                      onUpdate({ data: { ...block.data, contacts: newContacts } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Valeur (ex: +33 6 12 34 56 78)"
                  />
                  <input
                    type="text"
                    value={contact.icon || ''}
                    onChange={(e) => {
                      const newContacts = [...contacts]
                      newContacts[index] = { ...contact, icon: e.target.value }
                      onUpdate({ data: { ...block.data, contacts: newContacts } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Icône emoji (ex: 📞)"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, contacts: [...contacts, { type: 'phone', label: '', value: '', icon: '' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {contacts.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, contacts: contacts.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )
    case 'map':
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
              placeholder="Notre zone de service"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Adresse ou coordonnées
            </label>
            <input
              type="text"
              value={safeBlock.data.address || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, address: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Ex: Paris, France ou 48.8566, 2.3522"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hauteur de la carte (px)
            </label>
            <input
              type="number"
              value={safeBlock.data.height || 400}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, height: parseInt(e.target.value) || 400 } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              min={200}
              max={800}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`map-zoom-${block.id}`}
              checked={safeBlock.data.show_controls || false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_controls: e.target.checked } })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={`map-zoom-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
              Afficher les contrôles (zoom, etc.)
            </label>
          </div>
        </div>
      )
    case 'badges':
      const badges = safeBlock.data.badges || [{ text: '', icon: '', color: 'blue' }]
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
              placeholder="Certifications et badges"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Badges ({badges.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {badges.map((badge: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="text"
                    value={badge.text || ''}
                    onChange={(e) => {
                      const newBadges = [...badges]
                      newBadges[index] = { ...badge, text: e.target.value }
                      onUpdate({ data: { ...block.data, badges: newBadges } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Texte du badge"
                  />
                  <div className="grid grid-cols-2 gap-1">
                    <input
                      type="text"
                      value={badge.icon || ''}
                      onChange={(e) => {
                        const newBadges = [...badges]
                        newBadges[index] = { ...badge, icon: e.target.value }
                        onUpdate({ data: { ...block.data, badges: newBadges } })
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      placeholder="Icône emoji"
                    />
                    <select
                      value={badge.color || 'blue'}
                      onChange={(e) => {
                        const newBadges = [...badges]
                        newBadges[index] = { ...badge, color: e.target.value }
                        onUpdate({ data: { ...block.data, badges: newBadges } })
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    >
                      <option value="blue">Bleu</option>
                      <option value="green">Vert</option>
                      <option value="red">Rouge</option>
                      <option value="yellow">Jaune</option>
                      <option value="purple">Violet</option>
                      <option value="gray">Gris</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, badges: [...badges, { text: '', icon: '', color: 'blue' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {badges.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, badges: badges.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )
    case 'form':
      const formFields = safeBlock.data.fields || [
        { type: 'text', label: 'Nom', placeholder: 'Votre nom', required: true },
        { type: 'email', label: 'Email', placeholder: 'votre@email.com', required: true },
        { type: 'textarea', label: 'Message', placeholder: 'Votre message', required: true }
      ]
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre du formulaire
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Formulaire de contact"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte du bouton
            </label>
            <input
              type="text"
              value={safeBlock.data.submit_text || 'Envoyer'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, submit_text: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Champs du formulaire ({formFields.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {formFields.map((field: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <select
                    value={field.type || 'text'}
                    onChange={(e) => {
                      const newFields = [...formFields]
                      newFields[index] = { ...field, type: e.target.value }
                      onUpdate({ data: { ...block.data, fields: newFields } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                  >
                    <option value="text">Texte</option>
                    <option value="email">Email</option>
                    <option value="tel">Téléphone</option>
                    <option value="textarea">Zone de texte</option>
                    <option value="number">Nombre</option>
                    <option value="url">URL</option>
                    <option value="date">Date</option>
                  </select>
                  <input
                    type="text"
                    value={field.label || ''}
                    onChange={(e) => {
                      const newFields = [...formFields]
                      newFields[index] = { ...field, label: e.target.value }
                      onUpdate({ data: { ...block.data, fields: newFields } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Label du champ"
                  />
                  <input
                    type="text"
                    value={field.placeholder || ''}
                    onChange={(e) => {
                      const newFields = [...formFields]
                      newFields[index] = { ...field, placeholder: e.target.value }
                      onUpdate({ data: { ...block.data, fields: newFields } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Placeholder"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`field-required-${block.id}-${index}`}
                      checked={field.required || false}
                      onChange={(e) => {
                        const newFields = [...formFields]
                        newFields[index] = { ...field, required: e.target.checked }
                        onUpdate({ data: { ...block.data, fields: newFields } })
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`field-required-${block.id}-${index}`} className="text-xs text-gray-700 dark:text-gray-300">
                      Champ requis
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, fields: [...formFields, { type: 'text', label: '', placeholder: '', required: false }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {formFields.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, fields: formFields.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <input
              type="checkbox"
              id={`form-captcha-${block.id}`}
              checked={safeBlock.data.enable_captcha || false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, enable_captcha: e.target.checked } })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={`form-captcha-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
              Activer le captcha
            </label>
          </div>
          {safeBlock.data.enable_captcha && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Thème du captcha
              </label>
              <select
                value={safeBlock.data.captcha_theme || 'light'}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, captcha_theme: e.target.value } })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="light">Clair</option>
                <option value="dark">Sombre</option>
              </select>
            </div>
          )}
        </div>
      )
    case 'columns':
      return renderColumns({ block, onUpdate })
    case 'hero':
      return renderHero({ block, onUpdate })
    case 'gallery':
      return renderGallery({ block, onUpdate })
    case 'banner':
      return renderBanner({ block, onUpdate })
    case 'cta-section':
    case 'cta_section':
      return renderCTASection({ block, onUpdate })
    case 'contact-form':
    case 'contact_form':
      return renderContactForm({ block, onUpdate })
    case 'header':
      return renderHeader({ block, onUpdate })
    
    case 'footer':
      return renderFooter({ block, onUpdate })
    case 'section':
      return renderSection({ block, onUpdate })
    case 'carousel':
      return renderCarousel({ block, onUpdate })
    case 'countdown':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date cible
            </label>
            <input
              type="datetime-local"
              value={safeBlock.data.target_date || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, target_date: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre (optionnel)
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Offre se termine dans..."
            />
          </div>
        </div>
      )
    case 'progress-bar':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Label
            </label>
            <input
              type="text"
              value={safeBlock.data.label || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, label: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Compétence"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pourcentage (0-100)
            </label>
            <input
              type="number"
              value={safeBlock.data.percentage || 0}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, percentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              min={0}
              max={100}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Couleur de la barre
            </label>
            <input
              type="color"
              value={safeBlock.data.color || '#3B82F6'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, color: e.target.value } })}
              className="w-full h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
          </div>
        </div>
      )

    case 'quote':
      return renderQuote({ block, onUpdate })

    case 'icon-box':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Icône (emoji ou texte)
            </label>
            <input
              type="text"
              value={safeBlock.data.icon || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, icon: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="🎯 ou ⚡"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Titre de la boîte"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={safeBlock.data.description || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, description: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Description..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Couleur de la bordure
            </label>
            <input
              type="color"
              value={safeBlock.data.border_color || '#E5E7EB'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, border_color: e.target.value } })}
              className="w-full h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
          </div>
        </div>
      )

    case 'feature-card':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Icône (emoji)
            </label>
            <input
              type="text"
              value={safeBlock.data.icon || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, icon: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="✨"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Titre de la fonctionnalité"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={safeBlock.data.description || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, description: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Description de la fonctionnalité..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte du lien
            </label>
            <input
              type="text"
              value={safeBlock.data.link_text || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, link_text: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="En savoir plus"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL du lien
            </label>
            <UrlInputWithSuggestions
              value={safeBlock.data.link_url || ''}
              onChange={(url) => onUpdate({ data: { ...block.data, link_url: url } })}
              placeholder="URL ou sélectionner une page..."
              className="text-xs"
            />
          </div>
        </div>
      )

    case 'video-embed':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL de la vidéo (YouTube ou Vimeo)
            </label>
            <input
              type="text"
              value={safeBlock.data.url || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, url: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
              Supporte YouTube et Vimeo
            </p>
          </div>
        </div>
      )

    case 'team-member':
      const socialLinks = safeBlock.data.social_links || [{ url: '', icon: '' }]
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom
            </label>
            <input
              type="text"
              value={safeBlock.data.name || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, name: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Jean Dupont"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rôle
            </label>
            <input
              type="text"
              value={safeBlock.data.role || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, role: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Développeur"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL de l'avatar
            </label>
            <input
              type="text"
              value={safeBlock.data.avatar || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, avatar: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Biographie
            </label>
            <textarea
              value={safeBlock.data.bio || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, bio: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Biographie..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Liens sociaux ({socialLinks.length})
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {socialLinks.map((link: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="text"
                    value={link.url || ''}
                    onChange={(e) => {
                      const newLinks = [...socialLinks]
                      newLinks[index] = { ...link, url: e.target.value }
                      onUpdate({ data: { ...block.data, social_links: newLinks } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="URL"
                  />
                  <input
                    type="text"
                    value={link.icon || ''}
                    onChange={(e) => {
                      const newLinks = [...socialLinks]
                      newLinks[index] = { ...link, icon: e.target.value }
                      onUpdate({ data: { ...block.data, social_links: newLinks } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Icône emoji"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, social_links: [...socialLinks, { url: '', icon: '' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {socialLinks.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, social_links: socialLinks.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )

    case 'logo-grid':
      return renderLogoGrid({ block, onUpdate })

    case 'card':
      const cards = safeBlock.data.cards || [{ title: '', description: '', image: '', button_text: '', button_url: '' }]
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de colonnes
            </label>
            <select
              value={safeBlock.data.columns || 3}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, columns: parseInt(e.target.value) } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value={1}>1 colonne</option>
              <option value={2}>2 colonnes</option>
              <option value={3}>3 colonnes</option>
              <option value={4}>4 colonnes</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cartes ({cards.length})
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cards.map((card: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="text"
                    value={card.title || ''}
                    onChange={(e) => {
                      const newCards = [...cards]
                      newCards[index] = { ...card, title: e.target.value }
                      onUpdate({ data: { ...block.data, cards: newCards } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Titre"
                  />
                  <textarea
                    value={card.description || ''}
                    onChange={(e) => {
                      const newCards = [...cards]
                      newCards[index] = { ...card, description: e.target.value }
                      onUpdate({ data: { ...block.data, cards: newCards } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Description"
                    rows={2}
                  />
                  <input
                    type="url"
                    value={card.image || ''}
                    onChange={(e) => {
                      const newCards = [...cards]
                      newCards[index] = { ...card, image: e.target.value }
                      onUpdate({ data: { ...block.data, cards: newCards } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="URL image"
                  />
                  <div className="grid grid-cols-2 gap-1">
                    <input
                      type="text"
                      value={card.button_text || ''}
                      onChange={(e) => {
                        const newCards = [...cards]
                        newCards[index] = { ...card, button_text: e.target.value }
                        onUpdate({ data: { ...block.data, cards: newCards } })
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      placeholder="Texte bouton"
                    />
                    <input
                      type="url"
                      value={card.button_url || ''}
                      onChange={(e) => {
                        const newCards = [...cards]
                        newCards[index] = { ...card, button_url: e.target.value }
                        onUpdate({ data: { ...block.data, cards: newCards } })
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                      placeholder="URL bouton"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, cards: [...cards, { title: '', description: '', image: '', button_text: '', button_url: '' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter carte
              </button>
              {cards.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, cards: cards.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )

    case 'tabs':
      const tabs = safeBlock.data.tabs || [{ title: 'Onglet 1', content: '' }]
      return (
        <div className="space-y-3">
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-center gap-1">
              <span>⭐</span>
              <span>Fonctionnalité Premium</span>
            </p>
          </div>
          <CollapsibleSection title="Onglets" count={tabs.length} defaultCollapsed={false}>
            <div className="space-y-3">
              {tabs.map((tab: any, index: number) => (
                <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Onglet {index + 1}</span>
                    <button
                      onClick={() => {
                        const newTabs = tabs.filter((_: any, i: number) => i !== index)
                        onUpdate({ data: { ...safeBlock.data, tabs: newTabs } })
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                      title="Supprimer cet onglet"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Supprimer
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Titre de l'onglet
                    </label>
                    <input
                      type="text"
                      value={tab.title || ''}
                      onChange={(e) => {
                        const newTabs = [...tabs]
                        newTabs[index] = { ...tab, title: e.target.value }
                        onUpdate({ data: { ...safeBlock.data, tabs: newTabs } })
                      }}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="Titre onglet"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contenu de l'onglet
                    </label>
                    <textarea
                      value={tab.content || ''}
                      onChange={(e) => {
                        const newTabs = [...tabs]
                        newTabs[index] = { ...tab, content: e.target.value }
                        onUpdate({ data: { ...safeBlock.data, tabs: newTabs } })
                      }}
                      className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="Contenu de l'onglet"
                      rows={4}
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  const newTabs = [...tabs, { title: `Onglet ${tabs.length + 1}`, content: '' }]
                  onUpdate({ data: { ...safeBlock.data, tabs: newTabs } })
                }}
                className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
              >
                <span>+</span>
                <span>Ajouter un onglet</span>
              </button>
            </div>
          </CollapsibleSection>
        </div>
      )
          </div>
        </div>
      )

    case 'rating':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Note (1-5)
            </label>
            <input
              type="number"
              value={safeBlock.data.rating || 5}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, rating: Math.max(1, Math.min(5, parseInt(e.target.value) || 5)) } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              min={1}
              max={5}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Taille
            </label>
            <select
              value={safeBlock.data.size || 'medium'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, size: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="small">Petit</option>
              <option value="medium">Moyen</option>
              <option value="large">Grand</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Afficher le texte
            </label>
            <input
              type="checkbox"
              checked={safeBlock.data.show_text !== false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_text: e.target.checked } })}
              className="w-4 h-4"
            />
            {safeBlock.data.show_text !== false && (
              <input
                type="text"
                value={safeBlock.data.text || ''}
                onChange={(e) => onUpdate({ data: { ...safeBlock.data, text: e.target.value } })}
                className="w-full mt-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                placeholder="Texte (ex: '4.5 sur 5')"
              />
            )}
          </div>
        </div>
      )

    case 'breadcrumb':
      const breadcrumbItems = safeBlock.data.items || [{ label: 'Accueil', url: '/' }]
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Éléments ({breadcrumbItems.length})
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {breadcrumbItems.map((item: any, index: number) => (
                <div key={index} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                  <input
                    type="text"
                    value={item.label || ''}
                    onChange={(e) => {
                      const newItems = [...breadcrumbItems]
                      newItems[index] = { ...item, label: e.target.value }
                      onUpdate({ data: { ...block.data, items: newItems } })
                    }}
                    className="w-full mb-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                    placeholder="Label"
                  />
                  <UrlInputWithSuggestions
                    value={item.url || ''}
                    onChange={(url) => {
                      const newItems = [...breadcrumbItems]
                      newItems[index] = { ...item, url }
                      onUpdate({ data: { ...block.data, items: newItems } })
                    }}
                    placeholder="URL"
                    className="text-xs"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onUpdate({ data: { ...block.data, items: [...breadcrumbItems, { label: '', url: '' }] } })}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Ajouter
              </button>
              {breadcrumbItems.length > 1 && (
                <button
                  onClick={() => onUpdate({ data: { ...block.data, items: breadcrumbItems.slice(0, -1) } })}
                  className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                >
                  - Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )

    case 'tags':
      const tags = safeBlock.data.tags || ['Tag 1', 'Tag 2']
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags (séparés par des virgules)
            </label>
            <textarea
              value={tags.join(', ')}
              onChange={(e) => {
                const newTags = e.target.value.split(',').map(t => t.trim()).filter(t => t)
                onUpdate({ data: { ...block.data, tags: newTags } })
              }}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Tag 1, Tag 2, Tag 3..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Style
            </label>
            <select
              value={safeBlock.data.style || 'rounded'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, style: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="rounded">Arrondi</option>
              <option value="square">Carré</option>
              <option value="pill">Pilule</option>
            </select>
          </div>
        </div>
      )

    case 'progress-circle':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pourcentage (0-100)
            </label>
            <input
              type="number"
              value={safeBlock.data.percentage || 75}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, percentage: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              min={0}
              max={100}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Taille
            </label>
            <select
              value={safeBlock.data.size || 'medium'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, size: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="small">Petit (100px)</option>
              <option value="medium">Moyen (150px)</option>
              <option value="large">Grand (200px)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte
            </label>
            <input
              type="text"
              value={safeBlock.data.text || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, text: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Texte sous le cercle"
            />
          </div>
        </div>
      )

    case 'search-bar':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Placeholder
            </label>
            <input
              type="text"
              value={safeBlock.data.placeholder || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, placeholder: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Rechercher..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Action (URL de recherche)
            </label>
            <input
              type="url"
              value={safeBlock.data.action || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, action: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="/search"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Afficher le bouton
            </label>
            <input
              type="checkbox"
              checked={safeBlock.data.show_button !== false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_button: e.target.checked } })}
              className="w-4 h-4"
            />
          </div>
        </div>
      )

    case 'audio-player':
      return renderAudioPlayer({ block, onUpdate })

    case 'modal':
      return (
        <div className="space-y-3">
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-center gap-1">
              <span>⭐</span>
              <span>Fonctionnalité Premium</span>
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre de la modal
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Titre"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contenu
            </label>
            <textarea
              value={safeBlock.data.content || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, content: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Contenu de la modal"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte du bouton déclencheur
            </label>
            <input
              type="text"
              value={safeBlock.data.trigger_text || 'Ouvrir'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, trigger_text: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Ouvrir"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Taille
            </label>
            <select
              value={safeBlock.data.size || 'medium'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, size: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="small">Petit</option>
              <option value="medium">Moyen</option>
              <option value="large">Grand</option>
              <option value="fullscreen">Plein écran</option>
            </select>
          </div>
        </div>
      )

    case 'chart':
      return (
        <div className="space-y-3">
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-center gap-1">
              <span>⭐</span>
              <span>Fonctionnalité Premium</span>
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type de graphique
            </label>
            <select
              value={safeBlock.data.chart_type || 'line'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, chart_type: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="line">Ligne</option>
              <option value="bar">Barres</option>
              <option value="pie">Camembert</option>
              <option value="doughnut">Donut</option>
              <option value="area">Aire</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={safeBlock.data.title || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Titre du graphique"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Données (JSON)
            </label>
            <textarea
              value={safeBlock.data.data || '{"labels": ["Jan", "Feb", "Mar"], "datasets": [{"label": "Ventes", "data": [10, 20, 30]}]}'}
              onChange={(e) => {
                try {
                  JSON.parse(e.target.value)
                  onUpdate({ data: { ...block.data, data: e.target.value } })
                } catch {
                  // Ignore invalid JSON
                }
              }}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
              placeholder='{"labels": [...], "datasets": [...]}'
              rows={6}
            />
            <p className="text-[10px] text-gray-500 mt-1">Format Chart.js JSON</p>
          </div>
        </div>
      )

    case 'calendar':
      return (
        <div className="space-y-3">
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 flex items-center gap-1">
              <span>⭐</span>
              <span>Fonctionnalité Premium</span>
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type de calendrier
            </label>
            <select
              value={safeBlock.data.calendar_type || 'month'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, calendar_type: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="month">Mensuel</option>
              <option value="week">Hebdomadaire</option>
              <option value="day">Quotidien</option>
              <option value="agenda">Agenda</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Afficher les événements
            </label>
            <input
              type="checkbox"
              checked={safeBlock.data.show_events !== false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_events: e.target.checked } })}
              className="w-4 h-4"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Événements (JSON)
            </label>
            <textarea
              value={safeBlock.data.events || '[]'}
              onChange={(e) => {
                try {
                  JSON.parse(e.target.value)
                  onUpdate({ data: { ...block.data, events: e.target.value } })
                } catch {
                  // Ignore invalid JSON
                }
              }}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
              placeholder='[{"title": "Événement", "date": "2024-01-15", "time": "10:00"}]'
              rows={4}
            />
          </div>
        </div>
      )

    case 'pagination':
      const totalPages = safeBlock.data.total_pages || 10
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre total de pages
            </label>
            <input
              type="number"
              value={totalPages}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, total_pages: Math.max(1, parseInt(e.target.value) || 1) } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              min={1}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Page actuelle
            </label>
            <input
              type="number"
              value={safeBlock.data.current_page || 1}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, current_page: Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1)) } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              min={1}
              max={totalPages}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Afficher les flèches
            </label>
            <input
              type="checkbox"
              checked={safeBlock.data.show_arrows !== false}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_arrows: e.target.checked } })}
              className="w-4 h-4"
            />
          </div>
        </div>
      )

    case 'list':
      return renderList({ block, onUpdate })

    case 'link':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Texte du lien
            </label>
            <input
              type="text"
              value={safeBlock.data.text || ''}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, text: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Texte du lien"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL ou Page
            </label>
            <div className="space-y-2">
              <PageSelector
                value={safeBlock.data.url || ''}
                onChange={(url) => onUpdate({ data: { ...block.data, url } })}
                placeholder="Sélectionner une page..."
                className="w-full px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Ou saisir une URL personnalisée ci-dessus
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ouvrir dans
            </label>
            <select
              value={safeBlock.data.target || '_self'}
              onChange={(e) => onUpdate({ data: { ...safeBlock.data, target: e.target.value } })}
              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="_self">Même onglet</option>
              <option value="_blank">Nouvel onglet</option>
              <option value="_parent">Page parente</option>
              <option value="_top">Page principale</option>
            </select>
          </div>
        </div>
      )

    case 'rich-text':
      return <RichTextEditorConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'markdown':
      return <MarkdownEditorConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'html-raw':
      return <HtmlRawConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'icon':
      return <IconConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'label':
      return <LabelConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'tooltip':
      return <TooltipConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'popover':
      return <PopoverConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'dropdown':
      return <DropdownConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'categories':
      return <CategoriesConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'author-box':
      return <AuthorBoxConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'related-posts':
      return <RelatedPostsConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'table-of-contents':
      return <TableOfContentsConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'reading-time':
      return <ReadingTimeConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'share-buttons':
      return <ShareButtonsConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'flexbox':
      return <FlexboxConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'grid':
      return <GridConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'stack':
      return <StackConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'inline':
      return <InlineConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'group':
      return <GroupConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'wrapper':
      return <WrapperConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'image-slider':
      return <ImageSliderConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'lightbox':
      return <LightboxConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'vimeo-embed':
      return <VimeoEmbedConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'counter':
      return <CounterConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'card-grid':
      return <CardGridConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'logo-carousel':
      return <LogoCarouselConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'route-calculator':
      return <RouteCalculatorConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'fare-calculator':
      return <FareCalculatorConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'availability-calendar':
      return <AvailabilityCalendarConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'captcha':
      return <CaptchaConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-multi-step':
      return <FormMultiStepConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-conditional':
      return <FormConditionalConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-calculator':
      return <FormCalculatorConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-file-upload':
      return <FormFileUploadConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-payment':
      return <FormPaymentConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-quiz':
      return <FormQuizConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-survey':
      return <FormSurveyConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-poll':
      return <FormPollConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-rsvp':
      return <FormRSVPConfig block={safeBlock} onUpdate={onUpdate} />

    // Blocs VTC
    case 'driver-profile':
      return <DriverProfileConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'email-button':
      return <EmailButtonConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'sms-button':
      return <SMSButtonConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'vehicle-comparison':
      return <VehicleComparisonConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'service-packages':
      return <ServicePackagesConfig block={safeBlock} onUpdate={onUpdate} />
    
    // Blocs E-commerce
    case 'product-gallery':
      return <ProductGalleryConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'product-details':
      return <ProductDetailsConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'add-to-cart':
      return <AddToCartConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'buy-now':
      return <BuyNowConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'trust-badges':
      return <TrustBadgesConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'payment-methods':
      return <PaymentMethodsConfig block={safeBlock} onUpdate={onUpdate} />

    default:
      return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Bloc {block.type}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Configuration à venir</p>
          {blockType?.description && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{blockType.description}</p>
          )}
            </div>
          </div>
        </div>
      )
  }
}
