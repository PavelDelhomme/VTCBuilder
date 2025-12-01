'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import authService from '@/services/auth.service'
import billingService, { PricingPlan } from '@/services/billing.service'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import { isTenantSubdomain } from '@/lib/tenant-utils'
import pageService, { Page } from '@/services/page.service'
import settingsService, { SystemSettings } from '@/services/settings.service'
import MaintenancePage from '@/components/MaintenancePage'
import { useTheme } from '@/contexts/ThemeContext'
import BlockPreview from '@/components/editor/BlockPreview'

export default function HomePage() {
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [isTenantDomain, setIsTenantDomain] = useState(false)
  const [tenantPage, setTenantPage] = useState<Page | null>(null)
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null)
  const [checkingMaintenance, setCheckingMaintenance] = useState(true)
  // VTCBuilder landing page (for localhost:9494)
  // Vérifier si on doit utiliser les blocs de l'éditeur ou l'ancienne version
  const [useBlocks, setUseBlocks] = useState(false)
  const [homepageBlocks, setHomepageBlocks] = useState<any[]>([])
  const [homepageStatus, setHomepageStatus] = useState<string>('draft')

  useEffect(() => {
    // Check maintenance mode first (only for public homepage, not tenant domains)
    if (!isTenantSubdomain()) {
      checkMaintenanceMode()
    } else {
      setIsTenantDomain(true)
      loadTenantHomePage()
    }
  }, [])

  // Charger les blocs de la homepage publique (pour localhost:9494)
  useEffect(() => {
    const checkBlocks = async () => {
      try {
        const settings = await settingsService.getSettings()
        if (settings.public_homepage_blocks && settings.public_homepage_blocks.length > 0) {
          setHomepageBlocks(settings.public_homepage_blocks)
          setHomepageStatus(settings.public_homepage_status || 'draft')
          // Utiliser les blocs seulement si publié
          setUseBlocks(settings.public_homepage_status === 'published')
        } else {
          // Si pas de blocs, ne pas utiliser l'éditeur
          setUseBlocks(false)
        }
      } catch (error) {
        console.error('Erreur chargement blocs homepage:', error)
        setUseBlocks(false)
      }
    }
    if (!isTenantSubdomain() && !isTenantDomain) {
      checkBlocks()
    }
  }, [isTenantDomain])

  const checkMaintenanceMode = async () => {
    try {
      const settings = await settingsService.getSettings()
      setSystemSettings(settings)
      
      // If maintenance mode is enabled, don't load other content
      if (settings.maintenance_mode) {
        setLoading(false)
        setCheckingMaintenance(false)
        return
      }
      
      // If not in maintenance, load pricing plans
      loadPricingPlans()
    } catch (error) {
      console.error('Erreur vérification mode maintenance:', error)
      // Continue loading if error
      loadPricingPlans()
    } finally {
      setCheckingMaintenance(false)
    }
  }

  const loadTenantHomePage = async () => {
    try {
      setLoading(true)
      // Load published pages and find homepage
      const pages = await pageService.getAll({ status: 'published' })
      const homePage = pages.find((p: Page) => p.is_homepage || p.slug === 'home') || pages[0]
      setTenantPage(homePage || null)
    } catch (error) {
      console.error('Erreur chargement page tenant:', error)
      setTenantPage(null)
    } finally {
      setLoading(false)
    }
  }

  const loadPricingPlans = async () => {
    try {
      const plans = await billingService.getPricingPlans()
      setPricingPlans(Array.isArray(plans) ? plans : [])
    } catch (error) {
      console.error('Erreur chargement plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)
  }

  // Show loading while checking maintenance mode
  if (!isTenantDomain && checkingMaintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  // Check maintenance mode before showing landing page
  // Allow admins to bypass maintenance mode
  const isAdmin = authService.isSuperAdmin()
  const isMaintenanceMode = systemSettings?.maintenance_mode && !isAdmin

  // Show maintenance page if maintenance mode is enabled (and user is not admin)
  if (!isTenantDomain && isMaintenanceMode) {
    return (
      <MaintenancePage
        message={systemSettings?.maintenance_message || 'Le site est actuellement en maintenance. Nous serons de retour très bientôt !'}
        siteName={systemSettings?.site_name || 'VTCBuilder'}
      />
    )
  }

  // If on tenant subdomain, show tenant public site
  if (isTenantDomain) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement du site...</p>
          </div>
        </div>
      )
    }

    if (!tenantPage) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-md w-full mx-auto px-6 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 lg:p-12">
              {/* Construction Icon */}
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full">
                  <svg 
                    className="w-12 h-12 text-blue-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                    />
                  </svg>
                </div>
              </div>
              
              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Site en Construction
              </h1>
              
              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 mb-2 text-lg">
                Notre site est actuellement en cours de développement.
              </p>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
                Revenez bientôt pour découvrir notre nouveau site web !
              </p>
              
              {/* Divider */}
              <div className="w-20 h-1 bg-blue-500 mx-auto mb-8 rounded-full"></div>
              
              {/* Actions */}
              <div className="space-y-3">
                <a
                  href="/login"
                  className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  🔐 Se connecter pour accéder à l'administration
                </a>
                <a
                  href="/admin"
                  className="block w-full bg-white dark:bg-gray-800 border-2 border-gray-300 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 dark:bg-gray-900 transition-colors"
                >
                  Accéder à l'administration (si connecté)
                </a>
              </div>
              
              {/* Progress indicator */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Render tenant public homepage
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800">
        {/* Simple header for tenant public site */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{tenantPage.title}</h1>
              <nav className="hidden md:flex items-center space-x-6">
                <a href="/" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-gray-100">Accueil</a>
                <a href="/book" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-gray-100">Réserver</a>
                <a href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-gray-100">Contact</a>
                <a href="/admin" className="text-blue-600 hover:text-blue-800 font-medium">Administration</a>
              </nav>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <article>
            {tenantPage.content && (
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: tenantPage.content }}
              />
            )}
          </article>
        </main>

        {/* Simple footer */}
        <footer className="bg-gray-900 text-white py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; {new Date().getFullYear()} Tous droits réservés.</p>
          </div>
        </footer>
      </div>
    )
  }
  
  // Si on utilise les blocs et que la page est publiée, afficher avec BlockPreview
  if (useBlocks && homepageStatus === 'published' && homepageBlocks.length > 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <PublicHeader showThemeToggle={true} />
        <BlockPreview blocks={homepageBlocks} blockTypes={[]} />
        <PublicFooter />
      </div>
    )
  }
  
  // Sinon, utiliser l'ancienne version (backup)
  return <PublicHomePageContent pricingPlans={pricingPlans} loading={loading} />
}

function PublicHomePageContent({ pricingPlans, loading }: { pricingPlans: PricingPlan[]; loading: boolean }) {
  const { resolvedTheme, toggleTheme } = useTheme()
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      resolvedTheme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500'
    }`}>
      {/* Header */}
      <PublicHeader showThemeToggle={true} />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 text-center">
        <h1 className={`text-4xl md:text-6xl font-extrabold mb-6 ${
          resolvedTheme === 'dark' ? 'text-white' : 'text-white'
        }`}>
          Le WordPress des Chauffeurs VTC
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
          Créez votre site VTC professionnel en quelques minutes. Gestion complète, réservations, paiements, tout inclus.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-xl ${
              resolvedTheme === 'dark'
                ? 'bg-white text-gray-900 hover:bg-gray-100'
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
          >
            🚀 Démarrer gratuitement
          </Link>
          <Link
            href="#pricing"
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-colors ${
              resolvedTheme === 'dark'
                ? 'bg-gray-800/80 backdrop-blur-md text-white hover:bg-gray-800 border border-gray-700'
                : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border border-white/30'
            }`}
          >
            Voir les tarifs
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
            Tout ce dont vous avez besoin
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎨',
                title: 'Site Professionnel',
                description: 'Designs modernes et responsive. Personnalisez votre site sans coder.',
              },
              {
                icon: '📅',
                title: 'Réservations en Ligne',
                description: 'Système de réservation complet avec calendrier et notifications.',
              },
              {
                icon: '💳',
                title: 'Paiements Intégrés',
                description: 'Acceptez les paiements en ligne. Cartes bancaires, virement, tout est possible.',
              },
              {
                icon: '📱',
                title: 'Mobile First',
                description: 'Votre site s\'adapte automatiquement aux smartphones et tablettes.',
              },
              {
                icon: '📊',
                title: 'Analytics Inclus',
                description: 'Suivez vos performances, réservations, revenus en temps réel.',
              },
              {
                icon: '🔒',
                title: 'Sécurisé & Rapide',
                description: 'Hébergement sécurisé, sauvegardes automatiques, SSL inclus.',
              },
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
            Tarifs Transparents
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Choisissez le plan adapté à vos besoins. Pas d'engagement, changez de plan à tout moment.
          </p>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans
                .filter(plan => plan.is_active)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 relative ${
                    plan.is_featured ? 'ring-4 ring-blue-500 scale-105' : ''
                  }`}
                >
                  {plan.is_featured && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                        POPULAIRE
                      </span>
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
                      {formatPrice(plan.price_monthly)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">/mois</span>
                    {plan.price_yearly && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        ou {formatPrice(plan.price_yearly)}/an (-{Math.round((1 - (plan.price_yearly / (plan.price_monthly * 12))) * 100)}%)
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">{plan.max_sites} site{plan.max_sites > 1 ? 's' : ''}</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">{plan.max_users} utilisateur{plan.max_users > 1 ? 's' : ''} max</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">{plan.max_storage_gb} GB de stockage</span>
                    </li>
                    {plan.features && plan.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/register?plan=${plan.slug}`}
                    className={`block w-full text-center py-3 rounded-lg font-bold transition-colors ${
                      plan.is_featured
                        ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    Choisir {plan.name}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à démarrer ?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Créez votre site VTC professionnel dès aujourd'hui. Essai gratuit de 14 jours.
          </p>
          <Link
            href="/register"
            className={`inline-block px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-xl ${
              resolvedTheme === 'dark'
                ? 'bg-white text-gray-900 hover:bg-gray-100'
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
          >
            🚀 Créer mon compte gratuitement
          </Link>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  )
}
