'use client'

import PublicLayout from '@/components/PublicLayout'

export default function PrivacyPage() {
  return (
    <PublicLayout
      title="Politique de Confidentialité"
      description="Comment nous collectons, utilisons et protégeons vos données personnelles"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="prose prose-lg max-w-none">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">1. Introduction</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                VTCBuilder ("nous", "notre", "nos") s'engage à protéger la confidentialité de vos données personnelles.
                Cette Politique de Confidentialité explique comment nous collectons, utilisons, stockons et protégeons
                vos informations personnelles conformément au Règlement Général sur la Protection des Données (RGPD).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">2. Données collectées</h2>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">2.1. Données que vous nous fournissez</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>Nom, prénom, adresse email, numéro de téléphone</li>
                <li>Informations de facturation et de paiement</li>
                <li>Contenu que vous créez sur votre site (pages, services, réservations)</li>
                <li>Communications avec notre support client</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">2.2. Données collectées automatiquement</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>Adresse IP, type de navigateur, système d'exploitation</li>
                <li>Données de navigation et d'utilisation de la plateforme</li>
                <li>Cookies et technologies similaires</li>
                <li>Logs d'accès et d'erreurs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">3. Utilisation des données</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Nous utilisons vos données personnelles pour :
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li>Fournir, maintenir et améliorer nos services</li>
                <li>Traiter vos paiements et gérer votre abonnement</li>
                <li>Vous envoyer des notifications importantes concernant votre compte</li>
                <li>Répondre à vos demandes de support</li>
                <li>Envoyer des communications marketing (avec votre consentement)</li>
                <li>Assurer la sécurité de la plateforme et prévenir la fraude</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">4. Base légale du traitement</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Nous traitons vos données personnelles sur les bases légales suivantes :
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li><strong>Exécution du contrat :</strong> Pour fournir nos services conformément à votre abonnement</li>
                <li><strong>Consentement :</strong> Pour les communications marketing et les cookies non essentiels</li>
                <li><strong>Obligation légale :</strong> Pour respecter nos obligations fiscales et comptables</li>
                <li><strong>Intérêt légitime :</strong> Pour assurer la sécurité et améliorer nos services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">5. Partage des données</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos données avec :
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li><strong>Prestataires de services :</strong> Processeurs de paiement (Stripe), services d'hébergement, services d'email</li>
                <li><strong>Autorités légales :</strong> Si requis par la loi ou une décision de justice</li>
                <li><strong>Partenaires de confiance :</strong> Avec votre consentement explicite</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                Tous nos prestataires sont tenus de respecter la confidentialité de vos données et sont conformes au RGPD.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">6. Conservation des données</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Nous conservons vos données personnelles pendant toute la durée de votre abonnement et jusqu'à 3 ans
                après la résiliation de votre compte, sauf obligation légale de conservation plus longue. Après cette
                période, vos données sont supprimées de manière sécurisée.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">7. Vos droits</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li><strong>Droit d'accès :</strong> Vous pouvez demander une copie de vos données personnelles</li>
                <li><strong>Droit de rectification :</strong> Vous pouvez corriger vos données inexactes</li>
                <li><strong>Droit à l'effacement :</strong> Vous pouvez demander la suppression de vos données</li>
                <li><strong>Droit à la limitation :</strong> Vous pouvez demander la limitation du traitement</li>
                <li><strong>Droit à la portabilité :</strong> Vous pouvez récupérer vos données dans un format structuré</li>
                <li><strong>Droit d'opposition :</strong> Vous pouvez vous opposer à certains traitements</li>
                <li><strong>Droit de retirer votre consentement :</strong> À tout moment pour les traitements basés sur le consentement</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                Pour exercer ces droits, contactez-nous à l'adresse : <a href="mailto:privacy@vtcbuilder.com" className="text-blue-600 hover:underline">privacy@vtcbuilder.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">8. Cookies</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Nous utilisons des cookies pour améliorer votre expérience sur notre site. Les cookies essentiels
                sont nécessaires au fonctionnement de la plateforme. Vous pouvez gérer vos préférences de cookies
                dans les paramètres de votre navigateur.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">9. Sécurité</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos
                données personnelles contre tout accès non autorisé, perte, destruction ou altération. Cela inclut
                le cryptage SSL/TLS, les sauvegardes régulières, et la surveillance de la sécurité.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">10. Transferts internationaux</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Vos données sont principalement hébergées dans l'Union Européenne. En cas de transfert vers un pays
                tiers, nous nous assurons que des garanties appropriées sont en place conformément au RGPD.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">11. Modifications</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Nous pouvons modifier cette Politique de Confidentialité à tout moment. Les modifications importantes
                vous seront communiquées par email. Nous vous encourageons à consulter régulièrement cette page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">12. Contact</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Pour toute question concernant cette Politique de Confidentialité ou pour exercer vos droits, contactez :
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Délégué à la Protection des Données (DPO)</strong><br />
                  VTCBuilder<br />
                  Email : privacy@vtcbuilder.com<br />
                  Adresse : 123 Avenue des Exemples, 75000 PARIS, France
                </p>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                Vous avez également le droit de déposer une plainte auprès de la CNIL (Commission Nationale de l'Informatique
                et des Libertés) si vous estimez que vos droits ne sont pas respectés.
              </p>
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

