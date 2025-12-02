/**
 * BACKUP - Page d'accueil publique VTCBuilder
 * 
 * Ce fichier contient une sauvegarde complète du code de la page d'accueil
 * publique (landing page) tel qu'il était avant l'intégration du builder.
 * 
 * Date de sauvegarde: 2024
 * 
 * Pour restaurer cette version:
 * 1. Copier le contenu de PublicHomePageContent dans page.tsx
 * 2. Modifier la condition dans HomePage() pour utiliser cette version
 */

import Link from 'next/link'
import { useTheme } from '@/contexts/theme-context'
import PublicHeader from '@/components/public/PublicHeader'
import PublicFooter from '@/components/public/PublicFooter'
import billingService, { PricingPlan } from '@/services/billing.service'

export function PublicHomePageContent({ pricingPlans, loading }: { pricingPlans: PricingPlan[]; loading: boolean }) {
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

