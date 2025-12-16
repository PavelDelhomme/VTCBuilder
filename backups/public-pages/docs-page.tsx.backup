'use client'

import PublicLayout from '@/components/PublicLayout'
import Link from 'next/link'

export default function DocsPage() {
  const sections = [
    {
      title: 'Premiers pas',
      icon: '🚀',
      items: [
        { title: 'Créer votre compte', description: 'Guide complet pour créer votre compte VTCBuilder', href: '/docs/getting-started' },
        { title: 'Configuration initiale', description: 'Configurez votre premier site en quelques minutes', href: '/docs/initial-setup' },
        { title: 'Première réservation', description: 'Comment accepter et gérer votre première réservation', href: '/docs/first-booking' }
      ]
    },
    {
      title: 'Gestion du site',
      icon: '🎨',
      items: [
        { title: 'Créer des pages', description: 'Créez et personnalisez les pages de votre site', href: '/docs/pages' },
        { title: 'Gérer le contenu', description: 'Ajoutez et modifiez le contenu de votre site', href: '/docs/content' },
        { title: 'Personnaliser le design', description: 'Modifiez les couleurs, polices et mise en page', href: '/docs/design' },
        { title: 'Gérer les médias', description: 'Téléchargez et organisez vos images et fichiers', href: '/docs/media' }
      ]
    },
    {
      title: 'Réservations',
      icon: '📅',
      items: [
        { title: 'Configuration du calendrier', description: 'Configurez vos disponibilités et créneaux', href: '/docs/calendar' },
        { title: 'Gérer les réservations', description: 'Acceptez, modifiez ou annulez les réservations', href: '/docs/bookings' },
        { title: 'Notifications', description: 'Configurez les emails et SMS de confirmation', href: '/docs/notifications' }
      ]
    },
    {
      title: 'Services VTC',
      icon: '🚗',
      items: [
        { title: 'Créer des services', description: 'Définissez vos offres et tarifs', href: '/docs/services' },
        { title: 'Gérer la flotte', description: 'Ajoutez et gérez vos véhicules', href: '/docs/fleet' },
        { title: 'Planification', description: 'Organisez les courses et assignez les véhicules', href: '/docs/planning' }
      ]
    },
    {
      title: 'Facturation',
      icon: '💳',
      items: [
        { title: 'Configuration des paiements', description: 'Configurez Stripe, PayPal ou autres moyens de paiement', href: '/docs/payments' },
        { title: 'Gérer les abonnements', description: 'Choisissez et modifiez votre plan', href: '/docs/subscriptions' },
        { title: 'Factures et reçus', description: 'Générez et téléchargez vos factures', href: '/docs/invoices' }
      ]
    },
    {
      title: 'Équipe',
      icon: '👥',
      items: [
        { title: 'Ajouter des utilisateurs', description: 'Invitez des membres de votre équipe', href: '/docs/users' },
        { title: 'Gérer les rôles', description: 'Définissez les permissions pour chaque membre', href: '/docs/roles' },
        { title: 'Communication', description: 'Utilisez les outils de communication intégrés', href: '/docs/communication' }
      ]
    },
    {
      title: 'Avancé',
      icon: '⚙️',
      items: [
        { title: 'Nom de domaine personnalisé', description: 'Connectez votre propre domaine', href: '/docs/custom-domain' },
        { title: 'API et intégrations', description: 'Intégrez VTCBuilder avec vos outils', href: '/docs/api' },
        { title: 'Personnalisation avancée', description: 'Options de personnalisation avancées', href: '/docs/advanced' }
      ]
    }
  ]

  return (
    <PublicLayout
      title="Documentation"
      description="Tout ce dont vous avez besoin pour utiliser VTCBuilder efficacement"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Quick Start */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 mb-12 text-white">
          <h2 className="text-3xl font-bold mb-4">🚀 Démarrage rapide</h2>
          <p className="text-xl text-white/90 mb-6">
            Nouveau sur VTCBuilder ? Suivez notre guide de démarrage pour créer votre site en 10 minutes.
          </p>
          <Link
            href="/register"
            className="inline-block bg-white dark:bg-gray-800 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Créer mon compte →
          </Link>
        </div>

        {/* Documentation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{section.icon}</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{section.title}</h3>
              </div>
              <ul className="space-y-3">
                {section.items.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href={item.href}
                      className="block p-3 rounded-lg hover:bg-gray-50 dark:bg-gray-900 transition-colors"
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-20 bg-gray-50 dark:bg-gray-900 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Besoin d'aide ?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/faq"
              className="bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow text-center"
            >
              <div className="text-4xl mb-3">❓</div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">FAQ</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Consultez nos questions fréquentes</p>
            </Link>
            <Link
              href="/contact"
              className="bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow text-center"
            >
              <div className="text-4xl mb-3">💬</div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Contact</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Contactez notre support</p>
            </Link>
            <a
              href="mailto:support@vtcbuilder.com"
              className="bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow text-center"
            >
              <div className="text-4xl mb-3">📧</div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Email</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">support@vtcbuilder.com</p>
            </a>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

