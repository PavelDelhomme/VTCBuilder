import React, { useState, useEffect } from 'react'
import { PreviewCaseProps } from './types'
import authService from '@/services/auth.service'
import { renderHero as renderHeroFromPreview } from '../renderers/complex/preview'
import { renderFeaturesGrid as renderFeaturesGridFromPreview } from '../renderers/complex/preview'
import { renderCTASection as renderCTASectionFromComplex } from '../renderers/complex/cta-section'
// FAQSectionPreview sera importé depuis BlockPreview ou créé localement

// Blocs complexes : hero, features-grid, cta, testimonials, pricing, timeline, stats, social-links, faq, banner, contact-form

export function renderHeroBase(props: PreviewCaseProps): React.ReactElement | null {
  return renderHeroFromPreview(props)
}

export function renderFeaturesGridBase(props: PreviewCaseProps): React.ReactElement | null {
  return renderFeaturesGridFromPreview(props)
}

export function renderCTASectionBase(props: PreviewCaseProps): React.ReactElement | null {
  // Convertir PreviewCaseProps en RendererProps
  const rendererProps = {
    block: props.block,
    blockType: props.blockType,
    blockTypes: props.blockTypes,
    theme: props.theme || 'light',
    wrapperStyles: props.wrapperStyles || {},
    contentStyles: props.contentStyles || {},
  }
  return renderCTASectionFromComplex(rendererProps)
}

export function renderTestimonials(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const testimonials = block.data.testimonials || []
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data.title && (
        <h2 className={`text-3xl font-bold text-center ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-8`}>
          {block.data.title}
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial: any, index: number) => (
          <div key={index} className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            {testimonial.avatar && (
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                loading="lazy"
                decoding="async"
              />
            )}
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4 italic`}>
              "{testimonial.content || 'Témoignage...'}"
            </p>
            <div className="text-center">
              <p className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                {testimonial.name || 'Nom'}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {testimonial.role || 'Rôle'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function renderPricing(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const PricingPreview = () => {
    const [plans, setPlans] = useState<any[]>(block.data.plans || [])
    const [loading, setLoading] = useState(false)
    const isDark = theme === 'dark'
    
    useEffect(() => {
      // Si source est 'api' ou 'dynamic', récupérer depuis l'API
      if (block.data.source === 'api' || block.data.source === 'dynamic') {
        setLoading(true)
        const apiUrl = block.data.api_endpoint || '/api/billing/pricing-plans/'
        const fullUrl = apiUrl.startsWith('http') ? apiUrl : `${window.location.origin}${apiUrl}`
        fetch(fullUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        })
          .then(async res => {
            if (!res.ok) {
              if (res.status === 401 || res.status === 403) {
                // Si non autorisé, utiliser les plans par défaut
                setPlans(block.data.plans || [])
                return
              }
              throw new Error(`HTTP error! status: ${res.status}`)
            }
            const data = await res.json()
            // Convertir les plans de l'API au format attendu
            const formattedPlans = Array.isArray(data) ? data : (data.results || [])
            setPlans(formattedPlans.map((plan: any) => ({
              name: plan.name,
              description: plan.description,
              price_monthly: plan.price_monthly,
              price_yearly: plan.price_yearly,
              currency: plan.currency || 'EUR',
              badge: plan.is_featured ? 'POPULAIRE' : '',
              is_featured: plan.is_featured,
              features: plan.features || [],
              button_text: 'Choisir ce plan',
              button_url: `/register?plan=${plan.slug || plan.id}`,
              button_style: plan.is_featured ? 'primary' : 'secondary'
            })))
          })
          .catch((error) => {
            console.warn('Erreur lors du chargement des plans depuis l\'API:', error)
            // En cas d'erreur, utiliser les plans par défaut
            setPlans(block.data.plans || [])
          })
          .finally(() => {
            setLoading(false)
          })
      } else {
        // Si source n'est pas 'api', utiliser les plans définis manuellement
        setPlans(block.data.plans || [])
      }
    }, [block.data.source, block.data.api_endpoint, block.data.plans])
    
    if (loading) {
      return (
        <div style={wrapperStyles} className="mb-6">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 text-center`}>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Chargement...</p>
          </div>
        </div>
      )
    }
    
    return (
      <div style={wrapperStyles} className="mb-6">
        {block.data.title && (
          <h2 className={`text-3xl font-bold text-center ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-8`}>
            {block.data.title}
          </h2>
        )}
        {plans.length > 0 ? (
          <div className={`grid grid-cols-1 md:grid-cols-${Math.min(plans.length, 4)} gap-6 px-4 sm:px-6 lg:px-8`}>
            {plans.map((plan: any, index: number) => {
              const isFeatured = plan.featured || block.data.featured_plan_override === index
              return (
                <div
                  key={index}
                  className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg border-2 ${isFeatured ? 'border-blue-500' : isDark ? 'border-gray-700' : 'border-gray-200'} p-6 relative ${isFeatured ? 'transform scale-105' : ''}`}
                >
                  {isFeatured && (
                    <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-lg text-xs font-bold">
                      Populaire
                    </div>
                  )}
                  {plan.name && (
                    <h3 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                      {plan.name}
                    </h3>
                  )}
                  <div className={`text-4xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'} mb-4`}>
                    {plan.price || 0} {plan.currency || '€'}
                  </div>
                  {plan.description && (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                      {plan.description}
                    </p>
                  )}
                  {plan.features && plan.features.length > 0 && (
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature: string, fIndex: number) => (
                        <li key={fIndex} className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span className="text-green-500">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  {plan.button_text && (
                    <button className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                      isFeatured
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : isDark ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}>
                      {plan.button_text}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
            No pricing plan available
          </div>
        )}
      </div>
    )
  }
  return <PricingPreview />
}

export function renderPricingCards(props: PreviewCaseProps): React.ReactElement | null {
  return renderPricing(props)
}

export function renderTimeline(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const events = block.data.events || []
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data.title && (
        <h2 className={`text-3xl font-bold text-center ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-8`}>
          {block.data.title}
        </h2>
      )}
      <div className="relative">
        <div className={`absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 ${isDark ? 'bg-gray-600' : 'bg-gray-300'} transform md:-translate-x-1/2`}></div>
        {events.map((event: any, index: number) => (
          <div key={index} className="relative mb-8 md:flex md:items-center">
            <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8 md:ml-auto'}`}>
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-md border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className={`text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'} mb-1`}>
                  {event.date || 'Date'}
                </div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                  {event.title || 'Title'}
                </h3>
                <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  {event.description || 'Description'}
                </p>
              </div>
            </div>
            <div className={`absolute left-4 md:left-1/2 w-8 h-8 bg-blue-600 rounded-full border-4 ${isDark ? 'border-gray-800' : 'border-white'} transform md:-translate-x-1/2 flex items-center justify-center`}>
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pl-8' : 'md:pr-8 md:text-right'}`}></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function renderStats(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const stats = block.data.stats || []
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data.title && (
        <h2 className={`text-3xl font-bold text-center ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-8`}>
          {block.data.title}
        </h2>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat: any, index: number) => (
          <div key={index} className={`text-center ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            {stat.icon && (
              <div className="text-4xl mb-2">{stat.icon}</div>
            )}
            <div className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'} mb-2`}>
              {stat.value || '0'}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {stat.label || 'Label'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function renderSocialLinks(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const socialLinks = block.data.links || []
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data.title && (
        <h2 className={`text-2xl font-bold text-center ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
          {block.data.title}
        </h2>
      )}
      <div className="flex flex-wrap justify-center gap-4">
        {socialLinks.map((link: any, index: number) => (
          <a
            key={index}
            href={link.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg transition-colors`}
          >
            {link.icon && <span className="text-xl">{link.icon}</span>}
            <span className={`${isDark ? 'text-gray-100' : 'text-gray-900'} font-medium`}>
              {link.platform || 'Plateforme'}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}

export function renderFAQ(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const faqItems = block.data?.items || []
  const FAQSectionPreview = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null)
    const isDark = theme === 'dark'
    
    return (
      <div style={wrapperStyles} className="mb-6">
        {block.data?.title && (
          <h2 
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ color: isDark ? '#f9fafb' : '#111827' }}
          >
            {block.data.title}
          </h2>
        )}
        <div className="space-y-4 max-w-4xl mx-auto">
          {faqItems.length > 0 ? (
            faqItems.map((item: any, i: number) => (
              <div
                key={i}
                className="rounded-xl shadow-lg overflow-hidden"
                style={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff'
                }}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors"
                  style={{
                    backgroundColor: openIndex === i ? (isDark ? '#374151' : '#f9fafb') : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (openIndex !== i) {
                      e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#f9fafb'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (openIndex !== i) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <span 
                    className="font-semibold pr-8"
                    style={{ color: isDark ? '#f9fafb' : '#111827' }}
                  >
                    {item.question || `Question ${i + 1}`}
                  </span>
                  <span className="text-blue-600 text-xl flex-shrink-0">
                    {openIndex === i ? '−' : '+'}
                  </span>
                </button>
                {openIndex === i && (
                  <div 
                    className="px-6 pb-5 border-t"
                    style={{
                      color: isDark ? '#9ca3af' : '#4b5563',
                      borderColor: isDark ? '#374151' : '#e5e7eb'
                    }}
                  >
                    <p className="pt-4">{item.answer || 'Réponse...'}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div 
              className="text-center py-8 border-2 border-dashed rounded"
              style={{
                color: isDark ? '#9ca3af' : '#9ca3af',
                borderColor: isDark ? '#4b5563' : '#d1d5db'
              }}
            >
              No FAQ questions
            </div>
          )}
        </div>
      </div>
    )
  }
  return <FAQSectionPreview />
}

export function renderBanner(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  return (
    <div
      style={{
        ...Object.fromEntries(
          Object.entries(wrapperStyles).filter(([key]) => 
            !['padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'].includes(key)
          )
        ),
        backgroundImage: block.data.background_image ? `url(${block.data.background_image})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: `${block.data.min_height || 400}px`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: block.data.text_align === 'left' ? 'flex-start' : block.data.text_align === 'right' ? 'flex-end' : 'center',
        ...(block.styles?.padding && !block.styles?.padding_top && !block.styles?.padding_bottom && !block.styles?.padding_left && !block.styles?.padding_right
          ? { padding: block.styles.padding }
          : {
              paddingTop: block.styles?.padding_top || block.styles?.padding_vertical || '4rem',
              paddingRight: block.styles?.padding_right || block.styles?.padding_horizontal || '2rem',
              paddingBottom: block.styles?.padding_bottom || block.styles?.padding_vertical || '4rem',
              paddingLeft: block.styles?.padding_left || block.styles?.padding_horizontal || '2rem',
            }),
      }}
      className="mb-6 rounded-lg overflow-hidden"
    >
      {block.data.overlay && (
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      )}
      <div className="relative z-10 text-white w-full">
        {block.data.title && (
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{block.data.title}</h1>
        )}
        {block.data.subtitle && (
          <p className="text-xl mb-6">{block.data.subtitle}</p>
        )}
        {block.data.button_text && block.data.button_url && (
          <a
            href={block.data.button_url}
            className="inline-block px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            {block.data.button_text}
          </a>
        )}
      </div>
    </div>
  )
}

export function renderContactFormBase(props: PreviewCaseProps): React.ReactElement | null {
  if (renderContactForm) {
    return renderContactForm(props)
  }
  return (
    <div style={props.wrapperStyles} className="mb-6 p-6 border-2 border-dashed rounded">
      <p className="text-gray-500">Contact form renderer not available</p>
    </div>
  )
}

// Export map
export const complexCases: Record<string, (props: PreviewCaseProps) => React.ReactElement | null> = {
  'hero': renderHeroBase,
  'features-grid': renderFeaturesGridBase,
  'features_grid': renderFeaturesGridBase, // Alias
  'cta': renderCTASectionBase,
  'cta-section': renderCTASectionBase,
  'cta_section': renderCTASectionBase, // Alias
  'testimonials': renderTestimonials,
  'pricing': renderPricing,
  'pricing_cards': renderPricingCards,
  'timeline': renderTimeline,
  'stats': renderStats,
  'social-links': renderSocialLinks,
  'faq': renderFAQ,
  'faq-section': renderFAQ,
  'banner': renderBanner,
  'contact-form': renderContactFormBase,
}

