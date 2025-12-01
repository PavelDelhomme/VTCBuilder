'use client'

import { useState } from 'react'
import PublicLayout from '@/components/PublicLayout'

interface FAQItem {
  question: string
  answer: string
  category: string
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const faqs: FAQItem[] = [
    {
      category: 'general',
      question: 'Qu\'est-ce que VTCBuilder ?',
      answer: 'VTCBuilder est une plateforme SaaS complète qui permet aux chauffeurs VTC de créer et gérer leur site web professionnel. Vous pouvez gérer vos réservations, paiements, véhicules et équipe depuis une interface unique et intuitive.'
    },
    {
      category: 'general',
      question: 'Combien coûte VTCBuilder ?',
      answer: 'Nous proposons plusieurs plans tarifaires adaptés à vos besoins, allant de 19€/mois pour le plan Starter jusqu\'à 79€/mois pour le plan Entreprise. Tous les plans incluent un essai gratuit de 14 jours, sans engagement.'
    },
    {
      category: 'account',
      question: 'Comment créer mon compte ?',
      answer: 'Cliquez sur "Créer un compte" en haut à droite, remplissez le formulaire avec vos informations, et vous recevrez un email de confirmation. Une fois votre compte créé, vous pourrez configurer votre site en quelques minutes.'
    },
    {
      category: 'account',
      question: 'Puis-je essayer gratuitement ?',
      answer: 'Oui ! Tous nos plans incluent un essai gratuit de 14 jours. Vous pouvez tester toutes les fonctionnalités sans carte bancaire. À la fin de l\'essai, vous choisissez de continuer avec un plan payant ou d\'annuler sans frais.'
    },
    {
      category: 'account',
      question: 'Puis-je changer de plan plus tard ?',
      answer: 'Absolument ! Vous pouvez passer à un plan supérieur ou inférieur à tout moment depuis votre tableau de bord. Les changements sont appliqués immédiatement, et nous ajustons la facturation au prorata.'
    },
    {
      category: 'features',
      question: 'Puis-je utiliser mon propre nom de domaine ?',
      answer: 'Oui, c\'est possible avec les plans Business et Entreprise. Vous pouvez acheter un nom de domaine directement depuis l\'interface ou connecter un domaine existant. Nous incluons le certificat SSL gratuitement.'
    },
    {
      category: 'features',
      question: 'Combien d\'utilisateurs puis-je ajouter ?',
      answer: 'Le nombre d\'utilisateurs dépend de votre plan : Starter (1 utilisateur), Business (5 utilisateurs), Entreprise (illimité). Chaque plan peut être adapté selon vos besoins spécifiques.'
    },
    {
      category: 'features',
      question: 'Puis-je personnaliser le design de mon site ?',
      answer: 'Oui ! Vous avez accès à plusieurs templates professionnels que vous pouvez personnaliser complètement : couleurs, polices, images, mise en page. Un éditeur visuel vous permet de modifier votre site sans coder.'
    },
    {
      category: 'billing',
      question: 'Quels moyens de paiement acceptez-vous ?',
      answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard, Amex), PayPal, et les virements bancaires pour les abonnements annuels. Tous les paiements sont sécurisés via Stripe.'
    },
    {
      category: 'billing',
      question: 'Quand suis-je facturé ?',
      answer: 'Vous êtes facturé mensuellement ou annuellement selon le plan choisi. La première facturation a lieu à la fin de votre période d\'essai gratuit. Vous recevrez une facture par email à chaque échéance.'
    },
    {
      category: 'billing',
      question: 'Puis-je annuler mon abonnement ?',
      answer: 'Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. Votre accès reste actif jusqu\'à la fin de la période payée. Aucun frais d\'annulation n\'est appliqué.'
    },
    {
      category: 'technical',
      question: 'Mon site sera-t-il optimisé pour mobile ?',
      answer: 'Oui, tous nos templates sont 100% responsive et optimisés pour mobile. Votre site s\'adaptera automatiquement aux smartphones et tablettes pour offrir la meilleure expérience utilisateur.'
    },
    {
      category: 'technical',
      question: 'Qu\'en est-il de la sécurité et de la confidentialité ?',
      answer: 'Nous prenons la sécurité très au sérieux. Tous les sites sont protégés par SSL/HTTPS, nos serveurs sont sécurisés et régulièrement mis à jour, et nous respectons strictement le RGPD. Vos données sont sauvegardées quotidiennement.'
    },
    {
      category: 'technical',
      question: 'Puis-je exporter mes données ?',
      answer: 'Oui, vous pouvez exporter toutes vos données (réservations, clients, factures) à tout moment depuis votre tableau de bord. Les données sont exportées au format CSV pour faciliter leur utilisation.'
    },
    {
      category: 'support',
      question: 'Quel type de support proposez-vous ?',
      answer: 'Nous offrons un support par email pour tous les utilisateurs, avec réponse sous 24h. Les plans Business et Entreprise bénéficient d\'un support prioritaire et d\'une assistance téléphonique.'
    },
    {
      category: 'support',
      question: 'Avez-vous une documentation ?',
      answer: 'Oui, nous avons une documentation complète disponible sur /docs avec des guides pas à pas, des tutoriels vidéo, et des réponses aux questions fréquentes. Nous mettons régulièrement à jour cette documentation.'
    }
  ]

  const categories = [
    { id: 'all', label: 'Toutes les questions' },
    { id: 'general', label: 'Général' },
    { id: 'account', label: 'Compte' },
    { id: 'features', label: 'Fonctionnalités' },
    { id: 'billing', label: 'Facturation' },
    { id: 'technical', label: 'Technique' },
    { id: 'support', label: 'Support' }
  ]

  const filteredFaqs = filter === 'all' ? faqs : faqs.filter(faq => faq.category === filter)

  return (
    <PublicLayout
      title="Questions fréquentes"
      description="Trouvez rapidement des réponses à vos questions sur VTCBuilder"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setFilter(category.id)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:bg-gray-900 transition-colors"
              >
                <span className="font-semibold text-gray-900 dark:text-gray-100 pr-8">{faq.question}</span>
                <span className="text-blue-600 text-xl flex-shrink-0">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 text-gray-600 dark:text-gray-400 border-t border-gray-100">
                  <p className="pt-4">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Vous ne trouvez pas votre réponse ?</h3>
          <p className="text-xl text-white/90 mb-6">
            Contactez notre équipe support qui se fera un plaisir de vous aider.
          </p>
          <a
            href="/contact"
            className="inline-block bg-white dark:bg-gray-800 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Nous contacter →
          </a>
        </div>
      </div>
    </PublicLayout>
  )
}

