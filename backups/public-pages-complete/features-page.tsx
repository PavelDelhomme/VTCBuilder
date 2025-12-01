'use client'

import PublicLayout from '@/components/PublicLayout'

export default function FeaturesPage() {
  return (
    <PublicLayout
      title="Fonctionnalités"
      description="Tout ce dont vous avez besoin pour créer et gérer votre site VTC professionnel"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: '🎨',
              title: 'Site Professionnel',
              description: 'Créez un site web moderne et responsive pour votre activité VTC. Personnalisez les couleurs, les polices et la mise en page sans coder.',
              features: ['Templates pré-conçus', 'Éditeur visuel', 'Responsive design', 'SEO intégré']
            },
            {
              icon: '📅',
              title: 'Réservations en Ligne',
              description: 'Système de réservation complet avec calendrier interactif. Gérez vos créneaux, acceptez ou refusez les réservations en temps réel.',
              features: ['Calendrier interactif', 'Notifications email', 'Gestion des disponibilités', 'Historique des réservations']
            },
            {
              icon: '💳',
              title: 'Paiements Intégrés',
              description: 'Acceptez les paiements en ligne de manière sécurisée. Cartes bancaires, virement bancaire, tout est possible.',
              features: ['Stripe/PayPal intégré', 'Factures automatiques', 'Historique des paiements', 'Paiement récurrent']
            },
            {
              icon: '📱',
              title: 'Mobile First',
              description: 'Votre site s\'adapte automatiquement aux smartphones et tablettes. Vos clients peuvent réserver depuis n\'importe quel appareil.',
              features: ['Design responsive', 'Application mobile', 'Notifications push', 'Interface tactile']
            },
            {
              icon: '📊',
              title: 'Analytics & Statistiques',
              description: 'Suivez vos performances en temps réel. Analysez vos réservations, revenus et comportement des clients.',
              features: ['Tableau de bord', 'Rapports détaillés', 'Export des données', 'Graphiques interactifs']
            },
            {
              icon: '🔒',
              title: 'Sécurité & Sauvegarde',
              description: 'Hébergement sécurisé avec sauvegardes automatiques quotidiennes. SSL inclus et conformité RGPD.',
              features: ['Sauvegardes automatiques', 'SSL/HTTPS', 'Conformité RGPD', 'Sécurité des données']
            },
            {
              icon: '👥',
              title: 'Gestion d\'Équipe',
              description: 'Gérez plusieurs chauffeurs et opérateurs. Définissez les permissions et les rôles de chaque membre.',
              features: ['Gestion multi-utilisateurs', 'Rôles et permissions', 'Planification d\'équipe', 'Communication interne']
            },
            {
              icon: '🚗',
              title: 'Gestion de Flotte',
              description: 'Gérez votre flotte de véhicules. Suivez les disponibilités, les entretiens et les statistiques par véhicule.',
              features: ['Inventaire des véhicules', 'Planning d\'entretien', 'Statistiques par véhicule', 'Géolocalisation']
            },
            {
              icon: '📧',
              title: 'Communication',
              description: 'Communiquez avec vos clients via email et SMS. Envoyez des confirmations, rappels et notifications automatiques.',
              features: ['Emails automatiques', 'SMS de confirmation', 'Templates de messages', 'Historique des communications']
            },
            {
              icon: '🌐',
              title: 'Nom de Domaine',
              description: 'Utilisez votre propre nom de domaine personnalisé. Achetez et configurez votre domaine directement depuis l\'interface.',
              features: ['Achat de domaine', 'Configuration DNS', 'Certificat SSL', 'Sous-domaines']
            },
            {
              icon: '🎯',
              title: 'Marketing',
              description: 'Outils marketing intégrés pour promouvoir votre activité. Campagnes email, codes promo et intégrations réseaux sociaux.',
              features: ['Campagnes email', 'Codes promo', 'Intégration réseaux sociaux', 'Analytics marketing']
            },
            {
              icon: '⚙️',
              title: 'Personnalisation Avancée',
              description: 'Personnalisez chaque aspect de votre site. Modifiez les templates, ajoutez vos propres images et configurez tous les paramètres.',
              features: ['Éditeur avancé', 'Bibliothèque de médias', 'Thèmes personnalisables', 'Widgets et modules']
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.features.map((item, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-green-500 mr-2">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à utiliser toutes ces fonctionnalités ?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Créez votre compte gratuitement et commencez à utiliser VTCBuilder dès aujourd'hui.
          </p>
          <a
            href="/register"
            className="inline-block bg-white dark:bg-gray-800 text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors shadow-xl"
          >
            🚀 Démarrer gratuitement
          </a>
        </div>
      </div>
    </PublicLayout>
  )
}

