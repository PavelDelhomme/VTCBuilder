'use client'

import PublicLayout from '@/components/PublicLayout'

export default function TermsPage() {
  return (
    <PublicLayout
      title="Conditions Générales de Vente"
      description="Consultez nos conditions générales de vente"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="prose prose-lg max-w-none">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">1. Objet</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Les présentes Conditions Générales de Vente (CGV) régissent l'utilisation de la plateforme VTCBuilder,
                un service SaaS (Software as a Service) permettant aux professionnels du secteur VTC de créer et gérer
                leur site web professionnel, leurs réservations, leur facturation et leur équipe.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                En souscrivant à un abonnement VTCBuilder, le Client accepte sans réserve les présentes CGV.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">2. Services proposés</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                VTCBuilder propose plusieurs formules d'abonnement :
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li><strong>Plan Starter :</strong> Formule de base avec fonctionnalités essentielles</li>
                <li><strong>Plan Business :</strong> Formule complète avec fonctionnalités avancées</li>
                <li><strong>Plan Entreprise :</strong> Formule premium avec toutes les fonctionnalités et support prioritaire</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                Les caractéristiques détaillées de chaque plan sont disponibles sur notre site web à l'adresse{' '}
                <a href="/#pricing" className="text-blue-600 hover:underline">vtcbuilder.com/#pricing</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">3. Tarifs et modalités de paiement</h2>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">3.1. Tarifs</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Les tarifs des abonnements sont indiqués en euros TTC. Ils sont modifiables à tout moment, mais
                les modifications ne s'appliquent qu'aux nouveaux abonnements. Les abonnements en cours restent
                au tarif souscrit.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">3.2. Période d'essai</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Un essai gratuit de 14 jours est proposé pour tous les nouveaux clients. Aucune carte bancaire
                n'est requise pour démarrer l'essai. À la fin de la période d'essai, l'abonnement devient payant
                automatiquement, sauf annulation par le Client.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">3.3. Paiement</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Le paiement s'effectue par carte bancaire, PayPal ou virement bancaire. Le paiement est prélevé
                mensuellement ou annuellement selon le plan choisi. Le Client garantit à VTCBuilder qu'il dispose
                des autorisations nécessaires pour utiliser le mode de paiement choisi.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">4. Obligations du Client</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Le Client s'engage à :
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>Fournir des informations exactes et à jour lors de l'inscription</li>
                <li>Maintenir la confidentialité de ses identifiants de connexion</li>
                <li>Utiliser la plateforme conformément à sa destination et aux lois en vigueur</li>
                <li>Ne pas tenter de contourner les mesures de sécurité mises en place</li>
                <li>Respecter les droits de propriété intellectuelle de VTCBuilder</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">5. Obligations de VTCBuilder</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                VTCBuilder s'engage à :
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>Assurer la disponibilité et la sécurité de la plateforme dans les meilleures conditions</li>
                <li>Effectuer des sauvegardes régulières des données du Client</li>
                <li>Respecter la confidentialité des données du Client conformément au RGPD</li>
                <li>Maintenir un support client réactif</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">6. Résiliation</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Le Client peut résilier son abonnement à tout moment depuis son tableau de bord. La résiliation
                prend effet à la fin de la période payée. Aucun remboursement n'est effectué pour la période en cours.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                VTCBuilder se réserve le droit de suspendre ou résilier l'accès d'un Client en cas de manquement
                grave aux présentes CGV, notamment en cas d'utilisation frauduleuse ou de non-paiement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">7. Propriété intellectuelle</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                La plateforme VTCBuilder, ses composants, son code source, ses logos et marques sont la propriété
                exclusive de VTCBuilder. Le Client dispose d'un droit d'utilisation non exclusif et non transférable
                dans le cadre de son abonnement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">8. Protection des données</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Le traitement des données personnelles est décrit dans notre{' '}
                <a href="/legal/privacy" className="text-blue-600 hover:underline">Politique de Confidentialité</a>.
                VTCBuilder s'engage à respecter le Règlement Général sur la Protection des Données (RGPD).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">9. Responsabilité</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                VTCBuilder ne pourra être tenu responsable des dommages indirects résultant de l'utilisation ou
                de l'impossibilité d'utiliser la plateforme. La responsabilité de VTCBuilder est limitée au montant
                des sommes versées par le Client au titre de l'abonnement en cours.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">10. Droit applicable et juridiction</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Les présentes CGV sont régies par le droit français. En cas de litige, et après tentative de
                résolution amiable, les tribunaux français seront seuls compétents.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">11. Contact</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Pour toute question concernant les présentes CGV, vous pouvez nous contacter à :
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mt-4">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>VTCBuilder</strong><br />
                  Email : legal@vtcbuilder.com<br />
                  Adresse : 123 Avenue des Exemples, 75000 PARIS, France
                </p>
              </div>
            </section>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

