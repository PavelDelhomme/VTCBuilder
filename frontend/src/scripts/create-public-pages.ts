/**
 * Script pour créer toutes les pages publiques avec leurs blocs
 * Ce script doit être exécuté depuis l'interface admin pour initialiser toutes les pages
 * 
 * Ce script recrée toutes les pages existantes (features, tarification, templates, docs, contact, faq, legal/terms, legal/privacy)
 * avec leurs blocs correspondants pour qu'elles soient gérées via l'éditeur de blocs
 */

import { Block } from '@/components/editor/types'

export interface PageDefinition {
  slug: string
  title: string
  description: string
  blocks: Block[]
  metaTitle?: string
  metaDescription?: string
}

/**
 * Crée les blocs pour la page Features avec toutes les fonctionnalités
 */
function createFeaturesPage(): PageDefinition {
  const now = Date.now()
  
  const features = [
    {
      icon: '🎨',
      title: 'Site Professionnel',
      description: 'Créez un site web moderne et responsive pour votre activité VTC. Personnalisez les couleurs, les polices et la mise en page sans coder.',
    },
    {
      icon: '📅',
      title: 'Réservations en Ligne',
      description: 'Système de réservation complet avec calendrier interactif. Gérez vos créneaux, acceptez ou refusez les réservations en temps réel.',
    },
    {
      icon: '💳',
      title: 'Paiements Intégrés',
      description: 'Acceptez les paiements en ligne de manière sécurisée. Cartes bancaires, virement bancaire, tout est possible.',
    },
    {
      icon: '📱',
      title: 'Mobile First',
      description: 'Votre site s\'adapte automatiquement aux smartphones et tablettes. Vos clients peuvent réserver depuis n\'importe quel appareil.',
    },
    {
      icon: '📊',
      title: 'Analytics & Statistiques',
      description: 'Suivez vos performances en temps réel. Analysez vos réservations, revenus et comportement des clients.',
    },
    {
      icon: '🔒',
      title: 'Sécurité & Sauvegarde',
      description: 'Hébergement sécurisé avec sauvegardes automatiques quotidiennes. SSL inclus et conformité RGPD.',
    },
    {
      icon: '👥',
      title: 'Gestion d\'Équipe',
      description: 'Gérez plusieurs chauffeurs et opérateurs. Définissez les permissions et les rôles de chaque membre.',
    },
    {
      icon: '🚗',
      title: 'Gestion de Flotte',
      description: 'Gérez votre flotte de véhicules. Suivez les disponibilités, les entretiens et les statistiques par véhicule.',
    },
    {
      icon: '📧',
      title: 'Communication',
      description: 'Communiquez avec vos clients via email et SMS. Envoyez des confirmations, rappels et notifications automatiques.',
    },
    {
      icon: '🌐',
      title: 'Nom de Domaine',
      description: 'Utilisez votre propre nom de domaine personnalisé. Achetez et configurez votre domaine directement depuis l\'interface.',
    },
    {
      icon: '🎯',
      title: 'Marketing',
      description: 'Outils marketing intégrés pour promouvoir votre activité. Campagnes email, codes promo et intégrations réseaux sociaux.',
    },
    {
      icon: '⚙️',
      title: 'Personnalisation Avancée',
      description: 'Personnalisez chaque aspect de votre site. Modifiez les templates, ajoutez vos propres images et configurez tous les paramètres.',
    },
  ]
  
  return {
    slug: 'features',
    title: 'Fonctionnalités',
    description: 'Découvrez toutes les fonctionnalités de VTCBuilder',
    metaTitle: 'Fonctionnalités - VTCBuilder',
    metaDescription: 'Découvrez toutes les fonctionnalités de VTCBuilder pour créer et gérer votre site VTC professionnel',
    blocks: [
      {
        id: `block-${now}-1`,
        type: 'hero',
        data: {
          title: 'Toutes les fonctionnalités dont vous avez besoin',
          subtitle: 'Une plateforme complète pour gérer votre activité VTC',
          buttons: [
            { text: 'Commencer gratuitement', url: '/register', style: 'primary' },
            { text: 'Voir les tarifs', url: '/tarification', style: 'secondary' }
          ],
          background_type: 'gradient',
          background_gradient: 'from-blue-500 via-purple-600 to-pink-500',
        },
        styles: {
          background_color: 'transparent',
          color: '#ffffff',
          text_align: 'center',
          padding_top: '5rem',
          padding_bottom: '5rem',
        },
        layout: 12,
        children: []
      },
      {
        id: `block-${now}-2`,
        type: 'features-grid',
        data: {
          title: '',
          features: features,
          columns: 3,
        },
        styles: {
          background_color: '#ffffff',
          padding_top: '4rem',
          padding_bottom: '4rem',
        },
        layout: 12,
        children: []
      },
      {
        id: `block-${now}-3`,
        type: 'cta-section',
        data: {
          title: 'Prêt à utiliser toutes ces fonctionnalités ?',
          subtitle: 'Créez votre compte gratuitement et commencez à utiliser VTCBuilder dès aujourd\'hui.',
          button_text: '🚀 Démarrer gratuitement',
          button_url: '/register',
          button_style: 'primary',
        },
        styles: {
          background_color: 'transparent',
          background_gradient: 'from-blue-600 to-purple-600',
          color: '#ffffff',
          text_align: 'center',
          padding_top: '5rem',
          padding_bottom: '5rem',
        },
        layout: 12,
        children: []
      }
    ]
  }
}

/**
 * Crée les blocs pour la page Tarification
 */
function createTarificationPage(): PageDefinition {
  const now = Date.now()
  
  return {
    slug: 'tarification',
    title: 'Tarification',
    description: 'Choisissez le plan qui vous convient',
    metaTitle: 'Tarification - VTCBuilder',
    metaDescription: 'Découvrez nos plans tarifaires adaptés à votre activité VTC',
    blocks: [
      {
        id: `block-${now}-1`,
        type: 'hero',
        data: {
          title: 'Tarifs Transparents',
          subtitle: 'Choisissez le plan adapté à vos besoins. Pas d\'engagement, changez de plan à tout moment.',
          buttons: [
            { text: 'Essai gratuit 14 jours', url: '/register', style: 'primary' }
          ],
          background_type: 'gradient',
          background_gradient: 'from-blue-500 to-purple-600',
        },
        styles: {
          background_color: 'transparent',
          color: '#ffffff',
          text_align: 'center',
          padding_top: '5rem',
          padding_bottom: '5rem',
        },
        layout: 12,
        children: []
      },
      {
        id: `block-${now}-2`,
        type: 'text',
        data: {
          content: 'Les plans tarifaires sont chargés dynamiquement depuis l\'API. Vous pouvez les gérer depuis l\'interface d\'administration.',
        },
        styles: {
          background_color: '#f9fafb',
          text_align: 'center',
          color: '#6b7280',
          padding_top: '2rem',
          padding_bottom: '2rem',
        },
        layout: 12,
        children: []
      }
    ]
  }
}

/**
 * Crée les blocs pour la page Templates
 */
function createTemplatesPage(): PageDefinition {
  const now = Date.now()
  
  return {
    slug: 'templates',
    title: 'Templates',
    description: 'Choisissez parmi nos templates prêts à l\'emploi',
    metaTitle: 'Templates - VTCBuilder',
    metaDescription: 'Découvrez nos templates de sites VTC professionnels prêts à l\'emploi',
    blocks: [
      {
        id: `block-${now}-1`,
        type: 'hero',
        data: {
          title: 'Templates professionnels',
          subtitle: 'Choisissez parmi nos templates prêts à l\'emploi pour démarrer rapidement',
          buttons: [
            { text: 'Créer mon compte', url: '/register', style: 'primary' }
          ],
          background_type: 'gradient',
          background_gradient: 'from-purple-500 to-pink-500',
        },
        styles: {
          background_color: 'transparent',
          color: '#ffffff',
          text_align: 'center',
          padding_top: '5rem',
          padding_bottom: '5rem',
        },
        layout: 12,
        children: []
      },
      {
        id: `block-${now}-2`,
        type: 'text',
        data: {
          content: 'Les templates sont chargés dynamiquement depuis l\'API. Vous pouvez les gérer depuis l\'interface d\'administration.\n\n**Templates Gratuits**\nParfaits pour démarrer. Tous les templates de base sont disponibles gratuitement avec tous les plans.\n\n**Templates Premium**\nDesigns professionnels avancés avec plus d\'options de personnalisation. Disponibles avec les plans Business et Entreprise.',
        },
        styles: {
          background_color: '#ffffff',
          text_align: 'left',
          color: '#374151',
          padding_top: '4rem',
          padding_bottom: '4rem',
        },
        layout: 12,
        children: []
      }
    ]
  }
}

/**
 * Crée les blocs pour la page Contact
 * Structure: Hero > Container (2 colonnes: Formulaire + Infos contact)
 */
export function createContactPage(): PageDefinition {
  const now = Date.now()
  
  return {
    slug: 'contact',
    title: 'Contact',
    description: 'Contactez notre équipe support',
    metaTitle: 'Contact - VTCBuilder',
    metaDescription: 'Contactez notre équipe support pour toute question ou assistance',
    blocks: [
      {
        id: `block-${now}-1`,
        type: 'hero',
        data: {
          title: 'Contactez-nous',
          subtitle: 'Nous sommes là pour vous aider. Contactez notre équipe support',
          buttons: [],
          background_type: 'solid',
          background_color: '#1f2937',
        },
        styles: {
          background_color: '#1f2937',
          color: '#ffffff',
          text_align: 'center',
          padding_top: '5rem',
          padding_bottom: '5rem',
        },
        layout: 12,
        children: []
      },
      {
        id: `block-${now}-2`,
        type: 'container',
        data: {
          max_width: 'max-w-7xl',
          padding: 'px-4 sm:px-6 lg:px-8',
          margin: 'mx-auto'
        },
        styles: {
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '5rem 1rem',
          background_color: 'transparent'
        },
        layout: 12,
        children: [
          {
            id: `block-${now}-3`,
            type: 'container',
            data: {
              max_width: '',
              padding: 'p-8',
              margin: ''
            },
            styles: {
              background_color: '#ffffff',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '2rem'
            },
            layout: 6,
            children: [
              {
                id: `block-${now}-4`,
                type: 'heading',
                data: {
                  text: 'Envoyez-nous un message',
                  level: 2,
                },
                styles: {
                  text_align: 'left',
                  color: '#111827',
                  margin_bottom: '1.5rem',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                },
                layout: 12,
                children: []
              },
              {
                id: `block-${now}-5`,
                type: 'contact-form',
                data: {
                  title: '',
                  description: '',
                  form_fields: [
                    { name: 'name', label: 'Nom complet *', type: 'text', required: true, placeholder: 'Votre nom complet' },
                    { name: 'email', label: 'Email *', type: 'email', required: true, placeholder: 'votre@email.com' },
                    { name: 'subject', label: 'Sujet *', type: 'select', required: true, placeholder: 'Sélectionnez un sujet', options: ['Support technique', 'Question commerciale', 'Question de facturation', 'Suggestion de fonctionnalité', 'Autre'] },
                    { name: 'message', label: 'Message *', type: 'textarea', required: true, placeholder: 'Votre message...', rows: 6 },
                  ],
                  submit_text: 'Envoyer le message',
                  submit_button_style: 'primary'
                },
                styles: {
                  background_color: 'transparent',
                  padding: '0'
                },
                layout: 12,
                children: []
              }
            ]
          },
          {
            id: `block-${now}-6`,
            type: 'container',
            data: {
              max_width: '',
              padding: 'p-8',
              margin: ''
            },
            styles: {
              background_color: 'transparent',
              padding: '0'
            },
            layout: 6,
            children: [
              {
                id: `block-${now}-7`,
                type: 'container',
                data: {
                  max_width: '',
                  padding: 'p-8',
                  margin: ''
                },
                styles: {
                  background_color: '#ffffff',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '2rem',
                  margin_bottom: '2rem'
                },
                layout: 12,
                children: [
                  {
                    id: `block-${now}-8`,
                    type: 'heading',
                    data: {
                      text: 'Nos coordonnées',
                      level: 2,
                    },
                    styles: {
                      text_align: 'left',
                      color: '#111827',
                      margin_bottom: '1.5rem',
                      fontSize: '1.5rem',
                      fontWeight: 'bold'
                    },
                    layout: 12,
                    children: []
                  },
                  {
                    id: `block-${now}-9`,
                    type: 'text',
                    data: {
                      content: '📧 **Email**\n[support@vtcbuilder.com](mailto:support@vtcbuilder.com)\n\n📞 **Téléphone**\n[+33 1 23 45 67 89](tel:+33123456789)\n\n📍 **Adresse**\n123 Avenue des Exemples\n75000 PARIS\nFrance',
                    },
                    styles: {
                      text_align: 'left',
                      color: '#374151',
                      margin_bottom: '0'
                    },
                    layout: 12,
                    children: []
                  }
                ]
              },
              {
                id: `block-${now}-10`,
                type: 'container',
                data: {
                  max_width: '',
                  padding: 'p-8',
                  margin: ''
                },
                styles: {
                  background_color: '#ffffff',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '2rem',
                  margin_bottom: '2rem'
                },
                layout: 12,
                children: [
                  {
                    id: `block-${now}-11`,
                    type: 'heading',
                    data: {
                      text: 'Horaires de support',
                      level: 3,
                    },
                    styles: {
                      text_align: 'left',
                      color: '#111827',
                      margin_bottom: '1rem',
                      fontSize: '1.25rem',
                      fontWeight: 'bold'
                    },
                    layout: 12,
                    children: []
                  },
                  {
                    id: `block-${now}-12`,
                    type: 'text',
                    data: {
                      content: '**Lundi - Vendredi**\n9h - 18h\n\n**Samedi**\n10h - 16h\n\n**Dimanche**\nFermé',
                    },
                    styles: {
                      text_align: 'left',
                      color: '#374151',
                    },
                    layout: 12,
                    children: []
                  }
                ]
              },
              {
                id: `block-${now}-13`,
                type: 'container',
                data: {
                  max_width: '',
                  padding: 'p-6',
                  margin: ''
                },
                styles: {
                  background_color: '#dbeafe',
                  borderRadius: '0.75rem',
                  padding: '1.5rem'
                },
                layout: 12,
                children: [
                  {
                    id: `block-${now}-14`,
                    type: 'text',
                    data: {
                      content: '💡 **Conseil**\n\nPour une réponse plus rapide, consultez d\'abord notre [FAQ](/faq) ou notre [documentation](/docs).',
                    },
                    styles: {
                      text_align: 'left',
                      color: '#1e40af',
                      fontSize: '0.875rem'
                    },
                    layout: 12,
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}

/**
 * Crée les blocs pour la page Register (inscription)
 */
function createRegisterPage(): PageDefinition {
  const now = Date.now()
  
  return {
    slug: 'register',
    title: 'Inscription',
    description: 'Créez votre compte VTCBuilder et commencez votre essai gratuit',
    metaTitle: 'Inscription - VTCBuilder',
    metaDescription: 'Créez votre compte VTCBuilder et commencez votre essai gratuit de 14 jours. Aucune carte bancaire requise.',
    blocks: [
      {
        id: `block-${now}-1`,
        type: 'container',
        data: {
          max_width: 'max-w-4xl',
          padding: 'px-4 sm:px-6 lg:px-8',
          margin: 'mx-auto'
        },
        styles: {
          maxWidth: '56rem',
          margin: '0 auto',
          padding: '5rem 1rem',
          background_color: 'transparent'
        },
        layout: 12,
        children: [
          {
            id: `block-${now}-2`,
            type: 'container',
            data: {
              max_width: '',
              padding: 'p-8',
              margin: ''
            },
            styles: {
              background_color: '#ffffff',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '2rem'
            },
            layout: 12,
            children: [
              {
                id: `block-${now}-3`,
                type: 'heading',
                data: {
                  text: 'Créer votre compte VTCBuilder',
                  level: 1,
                },
                styles: {
                  text_align: 'center',
                  color: '#111827',
                  margin_bottom: '0.5rem',
                  fontSize: '1.875rem',
                  fontWeight: 'bold'
                },
                layout: 12,
                children: []
              },
              {
                id: `block-${now}-4`,
                type: 'paragraph',
                data: {
                  content: 'Commencez votre essai gratuit de 14 jours. Aucune carte bancaire requise.',
                },
                styles: {
                  text_align: 'center',
                  color: '#6b7280',
                  margin_bottom: '2rem'
                },
                layout: 12,
                children: []
              },
              {
                id: `block-${now}-5`,
                type: 'form',
                data: {
                  title: '',
                  fields: [
                    { type: 'text', label: 'Nom complet', placeholder: 'Votre nom', required: true },
                    { type: 'email', label: 'Email', placeholder: 'votre@email.com', required: true },
                    { type: 'password', label: 'Mot de passe', placeholder: 'Minimum 8 caractères', required: true },
                    { type: 'password', label: 'Confirmer le mot de passe', placeholder: 'Répétez votre mot de passe', required: true },
                  ],
                  submit_text: 'Créer mon compte',
                  enable_captcha: true,
                },
                styles: {
                  background_color: 'transparent',
                  padding: '0'
                },
                layout: 12,
                children: []
              },
              {
                id: `block-${now}-6`,
                type: 'paragraph',
                data: {
                  content: 'En créant un compte, vous acceptez nos [Conditions Générales de Vente](/legal/terms) et notre [Politique de Confidentialité](/legal/privacy).',
                },
                styles: {
                  text_align: 'center',
                  color: '#6b7280',
                  fontSize: '0.875rem',
                  margin_top: '1.5rem'
                },
                layout: 12,
                children: []
              }
            ]
          }
        ]
      }
    ]
  }
}

/**
 * Crée les blocs pour la page FAQ
 */
function createFAQPage(): PageDefinition {
  const now = Date.now()
  
  const faqs = [
    { question: 'Qu\'est-ce que VTCBuilder ?', answer: 'VTCBuilder est une plateforme SaaS complète qui permet aux chauffeurs VTC de créer et gérer leur site web professionnel. Vous pouvez gérer vos réservations, paiements, véhicules et équipe depuis une interface unique et intuitive.' },
    { question: 'Combien coûte VTCBuilder ?', answer: 'Nous proposons plusieurs plans tarifaires adaptés à vos besoins, allant de 19€/mois pour le plan Starter jusqu\'à 79€/mois pour le plan Entreprise. Tous les plans incluent un essai gratuit de 14 jours, sans engagement.' },
    { question: 'Comment créer mon compte ?', answer: 'Cliquez sur "Créer un compte" en haut à droite, remplissez le formulaire avec vos informations, et vous recevrez un email de confirmation. Une fois votre compte créé, vous pourrez configurer votre site en quelques minutes.' },
    { question: 'Puis-je essayer gratuitement ?', answer: 'Oui ! Tous nos plans incluent un essai gratuit de 14 jours. Vous pouvez tester toutes les fonctionnalités sans carte bancaire. À la fin de l\'essai, vous choisissez de continuer avec un plan payant ou d\'annuler sans frais.' },
    { question: 'Puis-je changer de plan plus tard ?', answer: 'Absolument ! Vous pouvez passer à un plan supérieur ou inférieur à tout moment depuis votre tableau de bord. Les changements sont appliqués immédiatement, et nous ajustons la facturation au prorata.' },
    { question: 'Puis-je utiliser mon propre nom de domaine ?', answer: 'Oui, c\'est possible avec les plans Business et Entreprise. Vous pouvez acheter un nom de domaine directement depuis l\'interface ou connecter un domaine existant. Nous incluons le certificat SSL gratuitement.' },
    { question: 'Combien d\'utilisateurs puis-je ajouter ?', answer: 'Le nombre d\'utilisateurs dépend de votre plan : Starter (1 utilisateur), Business (5 utilisateurs), Entreprise (illimité). Chaque plan peut être adapté selon vos besoins spécifiques.' },
    { question: 'Puis-je personnaliser le design de mon site ?', answer: 'Oui ! Vous avez accès à plusieurs templates professionnels que vous pouvez personnaliser complètement : couleurs, polices, images, mise en page. Un éditeur visuel vous permet de modifier votre site sans coder.' },
    { question: 'Quels moyens de paiement acceptez-vous ?', answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard, Amex), PayPal, et les virements bancaires pour les abonnements annuels. Tous les paiements sont sécurisés via Stripe.' },
    { question: 'Quand suis-je facturé ?', answer: 'Vous êtes facturé mensuellement ou annuellement selon le plan choisi. La première facturation a lieu à la fin de votre période d\'essai gratuit. Vous recevrez une facture par email à chaque échéance.' },
    { question: 'Puis-je annuler mon abonnement ?', answer: 'Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. Votre accès reste actif jusqu\'à la fin de la période payée. Aucun frais d\'annulation n\'est appliqué.' },
    { question: 'Mon site sera-t-il optimisé pour mobile ?', answer: 'Oui, tous nos templates sont 100% responsive et optimisés pour mobile. Votre site s\'adaptera automatiquement aux smartphones et tablettes pour offrir la meilleure expérience utilisateur.' },
    { question: 'Qu\'en est-il de la sécurité et de la confidentialité ?', answer: 'Nous prenons la sécurité très au sérieux. Tous les sites sont protégés par SSL/HTTPS, nos serveurs sont sécurisés et régulièrement mis à jour, et nous respectons strictement le RGPD. Vos données sont sauvegardées quotidiennement.' },
    { question: 'Puis-je exporter mes données ?', answer: 'Oui, vous pouvez exporter toutes vos données (réservations, clients, factures) à tout moment depuis votre tableau de bord. Les données sont exportées au format CSV pour faciliter leur utilisation.' },
    { question: 'Quel type de support proposez-vous ?', answer: 'Nous offrons un support par email pour tous les utilisateurs, avec réponse sous 24h. Les plans Business et Entreprise bénéficient d\'un support prioritaire et d\'une assistance téléphonique.' },
    { question: 'Avez-vous une documentation ?', answer: 'Oui, nous avons une documentation complète disponible sur /docs avec des guides pas à pas, des tutoriels vidéo, et des réponses aux questions fréquentes. Nous mettons régulièrement à jour cette documentation.' },
  ]
  
  // Créer un bloc texte avec toutes les FAQ formatées
  const faqContent = faqs.map((faq, index) => 
    `**${index + 1}. ${faq.question}**\n\n${faq.answer}\n\n`
  ).join('\n')
  
  return {
    slug: 'faq',
    title: 'FAQ',
    description: 'Questions fréquemment posées',
    metaTitle: 'FAQ - VTCBuilder',
    metaDescription: 'Trouvez rapidement des réponses à vos questions sur VTCBuilder',
    blocks: [
      {
        id: `block-${now}-1`,
        type: 'hero',
        data: {
          title: 'Questions fréquentes',
          subtitle: 'Trouvez rapidement des réponses à vos questions sur VTCBuilder',
          buttons: [],
          background_type: 'gradient',
          background_gradient: 'from-blue-500 to-indigo-600',
        },
        styles: {
          background_color: 'transparent',
          color: '#ffffff',
          text_align: 'center',
          padding_top: '4rem',
          padding_bottom: '4rem',
        },
        layout: 12,
        children: []
      },
      {
        id: `block-${now}-2`,
        type: 'container',
        data: {},
        styles: {
          background_color: '#ffffff',
          padding_top: '4rem',
          padding_bottom: '4rem',
        },
        layout: 12,
        children: [
          {
            id: `block-${now}-3`,
            type: 'text',
            data: {
              content: faqContent,
            },
            styles: {
              text_align: 'left',
              color: '#374151',
            },
            layout: 12,
            children: []
          }
        ]
      },
      {
        id: `block-${now}-4`,
        type: 'cta-section',
        data: {
          title: 'Vous ne trouvez pas votre réponse ?',
          subtitle: 'Contactez notre équipe support qui se fera un plaisir de vous aider.',
          button_text: 'Nous contacter →',
          button_url: '/contact',
          button_style: 'primary',
        },
        styles: {
          background_color: 'transparent',
          background_gradient: 'from-blue-600 to-purple-600',
          color: '#ffffff',
          text_align: 'center',
          padding_top: '4rem',
          padding_bottom: '4rem',
        },
        layout: 12,
        children: []
      }
    ]
  }
}

/**
 * Crée les blocs pour la page CGV (legal/terms)
 */
function createCGVPage(): PageDefinition {
  const now = Date.now()
  
  const cgvContent = `**1. Objet**

Les présentes Conditions Générales de Vente (CGV) régissent l'utilisation de la plateforme VTCBuilder, un service SaaS (Software as a Service) permettant aux professionnels du secteur VTC de créer et gérer leur site web professionnel, leurs réservations, leur facturation et leur équipe.

En souscrivant à un abonnement VTCBuilder, le Client accepte sans réserve les présentes CGV.

**2. Services proposés**

VTCBuilder propose plusieurs formules d'abonnement :

- Plan Starter : Formule de base avec fonctionnalités essentielles
- Plan Business : Formule complète avec fonctionnalités avancées
- Plan Entreprise : Formule premium avec toutes les fonctionnalités et support prioritaire

Les caractéristiques détaillées de chaque plan sont disponibles sur notre site web à l'adresse vtcbuilder.com/#pricing.

**3. Tarifs et modalités de paiement**

**3.1. Tarifs**

Les tarifs des abonnements sont indiqués en euros TTC. Ils sont modifiables à tout moment, mais les modifications ne s'appliquent qu'aux nouveaux abonnements. Les abonnements en cours restent au tarif souscrit.

**3.2. Période d'essai**

Un essai gratuit de 14 jours est proposé pour tous les nouveaux clients. Aucune carte bancaire n'est requise pour démarrer l'essai. À la fin de la période d'essai, l'abonnement devient payant automatiquement, sauf annulation par le Client.

**3.3. Paiement**

Le paiement s'effectue par carte bancaire, PayPal ou virement bancaire. Le paiement est prélevé mensuellement ou annuellement selon le plan choisi. Le Client garantit à VTCBuilder qu'il dispose des autorisations nécessaires pour utiliser le mode de paiement choisi.

**4. Obligations du Client**

Le Client s'engage à :

- Fournir des informations exactes et à jour lors de l'inscription
- Maintenir la confidentialité de ses identifiants de connexion
- Utiliser la plateforme conformément à sa destination et aux lois en vigueur
- Ne pas tenter de contourner les mesures de sécurité mises en place
- Respecter les droits de propriété intellectuelle de VTCBuilder

**5. Obligations de VTCBuilder**

VTCBuilder s'engage à :

- Assurer la disponibilité et la sécurité de la plateforme dans les meilleures conditions
- Effectuer des sauvegardes régulières des données du Client
- Respecter la confidentialité des données du Client conformément au RGPD
- Maintenir un support client réactif

**6. Résiliation**

Le Client peut résilier son abonnement à tout moment depuis son tableau de bord. La résiliation prend effet à la fin de la période payée. Aucun remboursement n'est effectué pour la période en cours.

VTCBuilder se réserve le droit de suspendre ou résilier l'accès d'un Client en cas de manquement grave aux présentes CGV, notamment en cas d'utilisation frauduleuse ou de non-paiement.

**7. Propriété intellectuelle**

La plateforme VTCBuilder, ses composants, son code source, ses logos et marques sont la propriété exclusive de VTCBuilder. Le Client dispose d'un droit d'utilisation non exclusif et non transférable dans le cadre de son abonnement.

**8. Protection des données**

Le traitement des données personnelles est décrit dans notre Politique de Confidentialité. VTCBuilder s'engage à respecter le Règlement Général sur la Protection des Données (RGPD).

**9. Responsabilité**

VTCBuilder ne pourra être tenu responsable des dommages indirects résultant de l'utilisation ou de l'impossibilité d'utiliser la plateforme. La responsabilité de VTCBuilder est limitée au montant des sommes versées par le Client au titre de l'abonnement en cours.

**10. Droit applicable et juridiction**

Les présentes CGV sont régies par le droit français. En cas de litige, et après tentative de résolution amiable, les tribunaux français seront seuls compétents.

**11. Contact**

Pour toute question concernant les présentes CGV, vous pouvez nous contacter à :

VTCBuilder
Email : legal@vtcbuilder.com
Adresse : 123 Avenue des Exemples, 75000 PARIS, France

Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}`
  
  return {
    slug: 'legal/terms',
    title: 'Conditions Générales de Vente',
    description: 'CGV de VTCBuilder',
    metaTitle: 'Conditions Générales de Vente - VTCBuilder',
    metaDescription: 'Consultez nos conditions générales de vente',
    blocks: [
      {
        id: `block-${now}-1`,
        type: 'hero',
        data: {
          title: 'Conditions Générales de Vente',
          subtitle: 'Consultez nos conditions générales de vente',
          buttons: [],
          background_type: 'solid',
          background_color: '#1f2937',
        },
        styles: {
          background_color: '#1f2937',
          color: '#ffffff',
          text_align: 'center',
          padding_top: '4rem',
          padding_bottom: '4rem',
        },
        layout: 12,
        children: []
      },
      {
        id: `block-${now}-2`,
        type: 'container',
        data: {},
        styles: {
          background_color: '#ffffff',
          padding_top: '4rem',
          padding_bottom: '4rem',
        },
        layout: 12,
        children: [
          {
            id: `block-${now}-3`,
            type: 'text',
            data: {
              content: cgvContent,
            },
            styles: {
              text_align: 'left',
              color: '#374151',
            },
            layout: 12,
            children: []
          }
        ]
      }
    ]
  }
}

/**
 * Crée les blocs pour la page Privacy (legal/privacy)
 */
function createPrivacyPage(): PageDefinition {
  const now = Date.now()
  
  const privacyContent = `**1. Introduction**

VTCBuilder ("nous", "notre", "nos") s'engage à protéger la confidentialité de vos données personnelles. Cette Politique de Confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations personnelles conformément au Règlement Général sur la Protection des Données (RGPD).

**2. Données collectées**

**2.1. Données que vous nous fournissez**

- Nom, prénom, adresse email, numéro de téléphone
- Informations de facturation et de paiement
- Contenu que vous créez sur votre site (pages, services, réservations)
- Communications avec notre support client

**2.2. Données collectées automatiquement**

- Adresse IP, type de navigateur, système d'exploitation
- Données de navigation et d'utilisation de la plateforme
- Cookies et technologies similaires
- Logs d'accès et d'erreurs

**3. Utilisation des données**

Nous utilisons vos données personnelles pour :

- Fournir, maintenir et améliorer nos services
- Traiter vos paiements et gérer votre abonnement
- Vous envoyer des notifications importantes concernant votre compte
- Répondre à vos demandes de support
- Envoyer des communications marketing (avec votre consentement)
- Assurer la sécurité de la plateforme et prévenir la fraude
- Respecter nos obligations légales

**4. Base légale du traitement**

Nous traitons vos données personnelles sur les bases légales suivantes :

- Exécution du contrat : Pour fournir nos services conformément à votre abonnement
- Consentement : Pour les communications marketing et les cookies non essentiels
- Obligation légale : Pour respecter nos obligations fiscales et comptables
- Intérêt légitime : Pour assurer la sécurité et améliorer nos services

**5. Partage des données**

Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos données avec :

- Prestataires de services : Processeurs de paiement (Stripe), services d'hébergement, services d'email
- Autorités légales : Si requis par la loi ou une décision de justice
- Partenaires de confiance : Avec votre consentement explicite

Tous nos prestataires sont tenus de respecter la confidentialité de vos données et sont conformes au RGPD.

**6. Conservation des données**

Nous conservons vos données personnelles pendant toute la durée de votre abonnement et jusqu'à 3 ans après la résiliation de votre compte, sauf obligation légale de conservation plus longue. Après cette période, vos données sont supprimées de manière sécurisée.

**7. Vos droits**

Conformément au RGPD, vous disposez des droits suivants :

- Droit d'accès : Vous pouvez demander une copie de vos données personnelles
- Droit de rectification : Vous pouvez corriger vos données inexactes
- Droit à l'effacement : Vous pouvez demander la suppression de vos données
- Droit à la limitation : Vous pouvez demander la limitation du traitement
- Droit à la portabilité : Vous pouvez récupérer vos données dans un format structuré
- Droit d'opposition : Vous pouvez vous opposer à certains traitements
- Droit de retirer votre consentement : À tout moment pour les traitements basés sur le consentement

Pour exercer ces droits, contactez-nous à l'adresse : privacy@vtcbuilder.com

**8. Cookies**

Nous utilisons des cookies pour améliorer votre expérience sur notre site. Les cookies essentiels sont nécessaires au fonctionnement de la plateforme. Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.

**9. Sécurité**

Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, perte, destruction ou altération. Cela inclut le cryptage SSL/TLS, les sauvegardes régulières, et la surveillance de la sécurité.

**10. Transferts internationaux**

Vos données sont principalement hébergées dans l'Union Européenne. En cas de transfert vers un pays tiers, nous nous assurons que des garanties appropriées sont en place conformément au RGPD.

**11. Modifications**

Nous pouvons modifier cette Politique de Confidentialité à tout moment. Les modifications importantes vous seront communiquées par email. Nous vous encourageons à consulter régulièrement cette page.

**12. Contact**

Pour toute question concernant cette Politique de Confidentialité ou pour exercer vos droits, contactez :

Délégué à la Protection des Données (DPO)
VTCBuilder
Email : privacy@vtcbuilder.com
Adresse : 123 Avenue des Exemples, 75000 PARIS, France

Vous avez également le droit de déposer une plainte auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) si vous estimez que vos droits ne sont pas respectés.

Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}`
  
  return {
    slug: 'legal/privacy',
    title: 'Politique de Confidentialité',
    description: 'Politique de confidentialité de VTCBuilder',
    metaTitle: 'Politique de Confidentialité - VTCBuilder',
    metaDescription: 'Comment nous collectons, utilisons et protégeons vos données personnelles',
    blocks: [
      {
        id: `block-${now}-1`,
        type: 'hero',
        data: {
          title: 'Politique de Confidentialité',
          subtitle: 'Comment nous collectons, utilisons et protégeons vos données personnelles',
          buttons: [],
          background_type: 'solid',
          background_color: '#1f2937',
        },
        styles: {
          background_color: '#1f2937',
          color: '#ffffff',
          text_align: 'center',
          padding_top: '4rem',
          padding_bottom: '4rem',
        },
        layout: 12,
        children: []
      },
      {
        id: `block-${now}-2`,
        type: 'container',
        data: {},
        styles: {
          background_color: '#ffffff',
          padding_top: '4rem',
          padding_bottom: '4rem',
        },
        layout: 12,
        children: [
          {
            id: `block-${now}-3`,
            type: 'text',
            data: {
              content: privacyContent,
            },
            styles: {
              text_align: 'left',
              color: '#374151',
            },
            layout: 12,
            children: []
          }
        ]
      }
    ]
  }
}

/**
 * Crée les blocs pour la page Documentation principale
 */
function createDocsPage(): PageDefinition {
  const now = Date.now()
  
  const docsSections = [
    {
      title: '🚀 Premiers pas',
      items: [
        { title: 'Créer votre compte', description: 'Guide complet pour créer votre compte VTCBuilder', href: '/docs/premiers-pas' },
        { title: 'Configuration initiale', description: 'Configurez votre premier site en quelques minutes', href: '/docs/configuration-initiale' },
        { title: 'Première réservation', description: 'Comment accepter et gérer votre première réservation', href: '/docs/premiere-reservation' }
      ]
    },
    {
      title: '🎨 Gestion du site',
      items: [
        { title: 'Créer des pages', description: 'Créez et personnalisez les pages de votre site', href: '/docs/creer-des-pages' },
        { title: 'Gérer le contenu', description: 'Ajoutez et modifiez le contenu de votre site', href: '/docs/gerer-le-contenu' },
        { title: 'Personnaliser le design', description: 'Modifiez les couleurs, polices et mise en page', href: '/docs/personnaliser-le-design' },
        { title: 'Gérer les médias', description: 'Téléchargez et organisez vos images et fichiers', href: '/docs/gerer-les-medias' }
      ]
    },
    {
      title: '📅 Réservations',
      items: [
        { title: 'Configuration du calendrier', description: 'Configurez vos disponibilités et créneaux', href: '/docs/configuration-calendrier' },
        { title: 'Gérer les réservations', description: 'Acceptez, modifiez ou annulez les réservations', href: '/docs/gerer-les-reservations' },
        { title: 'Notifications', description: 'Configurez les emails et SMS de confirmation', href: '/docs/notifications' }
      ]
    },
    {
      title: '🚗 Services VTC',
      items: [
        { title: 'Créer des services', description: 'Définissez vos offres et tarifs', href: '/docs/creer-des-services' },
        { title: 'Gérer la flotte', description: 'Ajoutez et gérez vos véhicules', href: '/docs/gerer-la-flotte' },
        { title: 'Planification', description: 'Organisez les courses et assignez les véhicules', href: '/docs/planification' }
      ]
    },
    {
      title: '💳 Facturation',
      items: [
        { title: 'Configuration des paiements', description: 'Configurez Stripe, PayPal ou autres moyens de paiement', href: '/docs/configuration-paiements' },
        { title: 'Gérer les abonnements', description: 'Choisissez et modifiez votre plan', href: '/docs/gerer-les-abonnements' },
        { title: 'Factures et reçus', description: 'Générez et téléchargez vos factures', href: '/docs/factures-et-recus' }
      ]
    },
    {
      title: '👥 Équipe',
      items: [
        { title: 'Ajouter des utilisateurs', description: 'Invitez des membres de votre équipe', href: '/docs/ajouter-des-utilisateurs' },
        { title: 'Gérer les rôles', description: 'Définissez les permissions pour chaque membre', href: '/docs/gerer-les-roles' },
        { title: 'Communication', description: 'Utilisez les outils de communication intégrés', href: '/docs/communication' }
      ]
    },
    {
      title: '⚙️ Avancé',
      items: [
        { title: 'Nom de domaine personnalisé', description: 'Connectez votre propre domaine', href: '/docs/nom-de-domaine' },
        { title: 'API et intégrations', description: 'Intégrez VTCBuilder avec vos outils', href: '/docs/api-et-integrations' },
        { title: 'Personnalisation avancée', description: 'Options de personnalisation avancées', href: '/docs/personnalisation-avancee' }
      ]
    }
  ]
  
  // Créer le contenu de la documentation
  const docsContent = docsSections.map(section => {
    const itemsContent = section.items.map(item => 
      `- **[${item.title}](${item.href})**\n  ${item.description}`
    ).join('\n\n')
    return `## ${section.title}\n\n${itemsContent}`
  }).join('\n\n')
  
  return {
    slug: 'docs',
    title: 'Documentation',
    description: 'Documentation et guides',
    metaTitle: 'Documentation - VTCBuilder',
    metaDescription: 'Guide complet pour utiliser VTCBuilder',
    blocks: [
      {
        id: `block-${now}-1`,
        type: 'hero',
        data: {
          title: 'Documentation',
          subtitle: 'Tout ce dont vous avez besoin pour utiliser VTCBuilder efficacement',
          buttons: [
            { text: 'Créer mon compte', url: '/register', style: 'primary' }
          ],
          background_type: 'gradient',
          background_gradient: 'from-indigo-500 to-purple-600',
        },
        styles: {
          background_color: 'transparent',
          color: '#ffffff',
          text_align: 'center',
          padding_top: '5rem',
          padding_bottom: '5rem',
        },
        layout: 12,
        children: []
      },
      {
        id: `block-${now}-2`,
        type: 'container',
        data: {},
        styles: {
          background_color: '#ffffff',
          padding_top: '4rem',
          padding_bottom: '4rem',
        },
        layout: 12,
        children: [
          {
            id: `block-${now}-3`,
            type: 'text',
            data: {
              content: docsContent,
            },
            styles: {
              text_align: 'left',
              color: '#374151',
            },
            layout: 12,
            children: []
          }
        ]
      },
      {
        id: `block-${now}-4`,
        type: 'container',
        data: {},
        styles: {
          background_color: '#f9fafb',
          padding_top: '4rem',
          padding_bottom: '4rem',
        },
        layout: 12,
        children: [
          {
            id: `block-${now}-5`,
            type: 'heading',
            data: {
              text: 'Besoin d\'aide ?',
              level: 2,
            },
            styles: {
              text_align: 'center',
              color: '#111827',
              margin_bottom: '2rem',
            },
            layout: 12,
            children: []
          },
          {
            id: `block-${now}-6`,
            type: 'text',
            data: {
              content: 'Consultez notre [FAQ](/faq) pour des réponses rapides, [contactez notre support](/contact) pour une assistance personnalisée, ou envoyez-nous un email à support@vtcbuilder.com',
            },
            styles: {
              text_align: 'center',
              color: '#6b7280',
            },
            layout: 12,
            children: []
          }
        ]
      }
    ]
  }
}

/**
 * Crée les blocs pour les sous-pages de documentation
 */
function createDocsSubPages(): PageDefinition[] {
  const now = Date.now()
  const subPages = [
    {
      slug: 'docs/premiers-pas',
      title: 'Premiers pas',
      description: 'Guide complet pour créer votre compte VTCBuilder',
      content: `# 🚀 Premiers pas

## Créer votre compte

Guide complet pour créer votre compte VTCBuilder et démarrer avec la plateforme.

### Étapes

1. Rendez-vous sur la page d'inscription
2. Remplissez le formulaire avec vos informations
3. Confirmez votre email
4. Configurez votre premier site

## Configuration initiale

Configurez votre premier site en quelques minutes. Apprenez à personnaliser votre site, ajouter vos informations et configurer vos paramètres de base.

## Première réservation

Comment accepter et gérer votre première réservation. Découvrez comment utiliser le système de réservation et gérer vos clients.`
    },
    {
      slug: 'docs/configuration-initiale',
      title: 'Configuration initiale',
      description: 'Configurez votre premier site en quelques minutes',
      content: `# Configuration initiale

Après avoir créé votre compte, vous devez configurer votre site. Cette section vous guide à travers les étapes essentielles.

## 1. Personnalisation de base

- Ajoutez votre logo
- Configurez vos couleurs
- Définissez votre nom de site

## 2. Paramètres de base

- Informations de contact
- Horaires d'ouverture
- Zone de service`
    },
    {
      slug: 'docs/premiere-reservation',
      title: 'Première réservation',
      description: 'Comment accepter et gérer votre première réservation',
      content: `# Première réservation

Une fois votre site configuré, vous pouvez commencer à recevoir des réservations.

## 1. Recevoir une réservation

- Les clients peuvent réserver via votre site
- Vous recevez une notification
- Consultez les détails de la réservation

## 2. Accepter une réservation

- Cliquez sur "Accepter"
- Confirmez les détails
- Le client est notifié automatiquement`
    },
    {
      slug: 'docs/creer-des-pages',
      title: 'Créer des pages',
      description: 'Créez et personnalisez les pages de votre site',
      content: `# Créer des pages

L'éditeur de pages vous permet de créer et personnaliser toutes les pages de votre site.

## 1. Créer une nouvelle page

- Accédez à "Pages" dans votre dashboard
- Cliquez sur "Nouvelle page"
- Donnez un nom à votre page

## 2. Personnaliser votre page

- Utilisez l'éditeur de blocs
- Ajoutez du contenu
- Personnalisez le design`
    },
    {
      slug: 'docs/gerer-le-contenu',
      title: 'Gérer le contenu',
      description: 'Ajoutez et modifiez le contenu de votre site',
      content: `# Gérer le contenu

Votre site est composé de différents types de contenu que vous pouvez gérer facilement.

## 1. Pages

- Créez des pages statiques
- Organisez votre contenu
- Personnalisez chaque page

## 2. Services

- Définissez vos offres
- Configurez vos tarifs
- Gérez vos disponibilités`
    },
    {
      slug: 'docs/personnaliser-le-design',
      title: 'Personnaliser le design',
      description: 'Modifiez les couleurs, polices et mise en page',
      content: `# Personnaliser le design

Donnez à votre site l'apparence qui vous correspond.

## 1. Couleurs

- Choisissez votre palette de couleurs
- Personnalisez les couleurs principales
- Appliquez vos couleurs de marque

## 2. Polices

- Sélectionnez vos polices
- Configurez les tailles
- Personnalisez les styles`
    },
    {
      slug: 'docs/gerer-les-medias',
      title: 'Gérer les médias',
      description: 'Téléchargez et organisez vos images et fichiers',
      content: `# Gérer les médias

Organisez tous vos fichiers multimédias en un seul endroit.

## 1. Télécharger des fichiers

- Images
- Documents
- Vidéos

## 2. Organiser

- Créez des dossiers
- Renommez vos fichiers
- Supprimez les fichiers inutiles`
    },
    {
      slug: 'docs/configuration-calendrier',
      title: 'Configuration du calendrier',
      description: 'Configurez vos disponibilités et créneaux',
      content: `# Configuration du calendrier

Configurez vos disponibilités pour que les clients puissent réserver aux bons moments.

## 1. Définir vos horaires

- Jours de la semaine
- Heures d'ouverture
- Pauses

## 2. Créneaux

- Durée des créneaux
- Intervalle entre créneaux
- Disponibilités spéciales`
    },
    {
      slug: 'docs/gerer-les-reservations',
      title: 'Gérer les réservations',
      description: 'Acceptez, modifiez ou annulez les réservations',
      content: `# Gérer les réservations

Gérez toutes vos réservations depuis un tableau de bord centralisé.

## 1. Voir les réservations

- Liste de toutes les réservations
- Filtres et recherche
- Statuts des réservations

## 2. Actions

- Accepter
- Modifier
- Annuler
- Confirmer`
    },
    {
      slug: 'docs/notifications',
      title: 'Notifications',
      description: 'Configurez les emails et SMS de confirmation',
      content: `# Notifications

Configurez les notifications pour rester informé de toutes les activités.

## 1. Emails

- Confirmations de réservation
- Rappels
- Notifications importantes

## 2. SMS

- Activer les SMS
- Configurer les templates
- Gérer les numéros`
    },
    {
      slug: 'docs/creer-des-services',
      title: 'Créer des services',
      description: 'Définissez vos offres et tarifs',
      content: `# Créer des services

Définissez vos différents services et leurs tarifs.

## 1. Types de services

- VTC
- Navette aéroport
- Service premium

## 2. Tarification

- Tarifs fixes
- Tarifs variables
- Forfaits`
    },
    {
      slug: 'docs/gerer-la-flotte',
      title: 'Gérer la flotte',
      description: 'Ajoutez et gérez vos véhicules',
      content: `# Gérer la flotte

Gérez tous vos véhicules et leurs caractéristiques.

## 1. Ajouter un véhicule

- Informations du véhicule
- Photos
- Caractéristiques

## 2. Organiser

- Catégoriser
- Assigner aux services
- Gérer les disponibilités`
    },
    {
      slug: 'docs/planification',
      title: 'Planification',
      description: 'Organisez les courses et assignez les véhicules',
      content: `# Planification

Organisez efficacement vos courses et assignez les véhicules.

## 1. Vue d'ensemble

- Calendrier
- Liste des courses
- Statuts

## 2. Assignation

- Assigner un véhicule
- Assigner un chauffeur
- Optimiser les trajets`
    },
    {
      slug: 'docs/configuration-paiements',
      title: 'Configuration des paiements',
      description: 'Configurez Stripe, PayPal ou autres moyens de paiement',
      content: `# Configuration des paiements

Configurez vos moyens de paiement pour accepter les paiements en ligne.

## 1. Stripe

- Connecter votre compte
- Configurer les cartes
- Tester les paiements

## 2. PayPal

- Connecter PayPal
- Configurer les options
- Gérer les remboursements`
    },
    {
      slug: 'docs/gerer-les-abonnements',
      title: 'Gérer les abonnements',
      description: 'Choisissez et modifiez votre plan',
      content: `# Gérer les abonnements

Gérez votre abonnement VTCBuilder.

## 1. Choisir un plan

- Comparer les plans
- Voir les fonctionnalités
- Sélectionner un plan

## 2. Modifier

- Changer de plan
- Mettre à jour
- Annuler`
    },
    {
      slug: 'docs/factures-et-recus',
      title: 'Factures et reçus',
      description: 'Générez et téléchargez vos factures',
      content: `# Factures et reçus

Générez automatiquement vos factures et reçus.

## 1. Factures

- Génération automatique
- Personnalisation
- Envoi aux clients

## 2. Reçus

- Génération
- Téléchargement
- Archivage`
    },
    {
      slug: 'docs/ajouter-des-utilisateurs',
      title: 'Ajouter des utilisateurs',
      description: 'Invitez des membres de votre équipe',
      content: `# Ajouter des utilisateurs

Invitez des membres de votre équipe à rejoindre votre compte.

## 1. Inviter

- Envoyer une invitation
- Définir les rôles
- Gérer les permissions

## 2. Gérer

- Activer/Désactiver
- Modifier les rôles
- Supprimer`
    },
    {
      slug: 'docs/gerer-les-roles',
      title: 'Gérer les rôles',
      description: 'Définissez les permissions pour chaque membre',
      content: `# Gérer les rôles

Définissez les permissions pour chaque membre de votre équipe.

## 1. Rôles disponibles

- Administrateur
- Gestionnaire
- Chauffeur
- Support

## 2. Permissions

- Définir les permissions
- Personnaliser
- Tester`
    },
    {
      slug: 'docs/communication',
      title: 'Communication',
      description: 'Utilisez les outils de communication intégrés',
      content: `# Communication

Communiquez efficacement avec votre équipe et vos clients.

## 1. Messages

- Envoyer des messages
- Recevoir des notifications
- Historique

## 2. Notifications

- Configurer
- Personnaliser
- Gérer`
    },
    {
      slug: 'docs/nom-de-domaine',
      title: 'Nom de domaine personnalisé',
      description: 'Connectez votre propre domaine',
      content: `# Nom de domaine personnalisé

Connectez votre propre nom de domaine à votre site VTCBuilder.

## 1. Configuration DNS

- Enregistrer votre domaine
- Configurer les DNS
- Vérifier la connexion

## 2. SSL

- Activer SSL
- Renouveler
- Gérer les certificats`
    },
    {
      slug: 'docs/api-et-integrations',
      title: 'API et intégrations',
      description: 'Intégrez VTCBuilder avec vos outils',
      content: `# API et intégrations

Intégrez VTCBuilder avec vos outils existants.

## 1. API

- Documentation API
- Clés API
- Exemples

## 2. Intégrations

- Webhooks
- Zapier
- Autres outils`
    },
    {
      slug: 'docs/personnalisation-avancee',
      title: 'Personnalisation avancée',
      description: 'Options de personnalisation avancées',
      content: `# Personnalisation avancée

Options avancées pour personnaliser votre site.

## 1. CSS personnalisé

- Ajouter du CSS
- Personnaliser les styles
- Override les styles par défaut

## 2. JavaScript

- Scripts personnalisés
- Analytics
- Tracking`
    }
  ]
  
  return subPages.map((subPage, index) => {
    const pageNow = now + index * 1000
    return {
      slug: subPage.slug,
      title: subPage.title,
      description: subPage.description,
      metaTitle: `${subPage.title} - Documentation VTCBuilder`,
      metaDescription: subPage.description,
      blocks: [
        {
          id: `block-${pageNow}-1`,
          type: 'hero',
          data: {
            title: subPage.title,
            subtitle: subPage.description,
            buttons: [],
            background_type: 'gradient',
            background_gradient: 'from-indigo-500 to-purple-600',
          },
          styles: {
            background_color: 'transparent',
            color: '#ffffff',
            text_align: 'center',
            padding_top: '4rem',
            padding_bottom: '4rem',
          },
          layout: 12,
          children: []
        },
        {
          id: `block-${pageNow}-2`,
          type: 'container',
          data: {},
          styles: {
            background_color: '#ffffff',
            padding_top: '4rem',
            padding_bottom: '4rem',
          },
          layout: 12,
          children: [
            {
              id: `block-${pageNow}-3`,
              type: 'text',
              data: {
                content: subPage.content,
              },
              styles: {
                text_align: 'left',
                color: '#374151',
              },
              layout: 12,
              children: []
            }
          ]
        }
      ]
    }
  })
}

/**
 * Liste de toutes les pages à créer
 */
export const ALL_PUBLIC_PAGES: PageDefinition[] = [
  createFeaturesPage(),
  createTarificationPage(),
  createTemplatesPage(),
  createRegisterPage(),
  createContactPage(),
  createFAQPage(),
  createCGVPage(),
  createPrivacyPage(),
  createDocsPage(),
  ...createDocsSubPages(),
]

/**
 * Fonction utilitaire pour créer une page dans le système
 */
export async function createPageInSystem(page: PageDefinition, api: any) {
  try {
    const currentSettings = await api.get('/system-settings/')
    const publicPages = currentSettings.data.public_pages || {}
    
    publicPages[page.slug] = {
      title: page.title,
      description: page.description,
      blocks: page.blocks,
      meta_title: page.metaTitle || page.title,
      meta_description: page.metaDescription || page.description,
      is_active: true,
    }
    
    await api.patch('/system-settings/', { public_pages: publicPages })
    return { success: true, slug: page.slug }
  } catch (error: any) {
    console.error(`Error creating page ${page.slug}:`, error)
    return { success: false, slug: page.slug, error: error.message }
  }
}

/**
 * Crée toutes les pages publiques
 */
export async function createAllPublicPages(api: any) {
  const results = []
  for (const page of ALL_PUBLIC_PAGES) {
    const result = await createPageInSystem(page, api)
    results.push(result)
  }
  return results
}
