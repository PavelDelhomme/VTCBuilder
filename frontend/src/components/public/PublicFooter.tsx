'use client'

import Link from 'next/link'

export default function PublicFooter() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">VTCBuilder</h3>
            <p className="text-gray-600 dark:text-gray-400">
              La plateforme SaaS complète pour créer et gérer votre site VTC professionnel.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-900 dark:text-white">Produit</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li><Link href="/#pricing" className="hover:text-gray-900 dark:hover:text-white transition-colors">Tarifs</Link></li>
              <li><Link href="/features" className="hover:text-gray-900 dark:hover:text-white transition-colors">Fonctionnalités</Link></li>
              <li><Link href="/templates" className="hover:text-gray-900 dark:hover:text-white transition-colors">Templates</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-900 dark:text-white">Support</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li><Link href="/docs" className="hover:text-gray-900 dark:hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-gray-900 dark:hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-gray-900 dark:text-white">Légal</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li><Link href="/legal/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">CGV</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">Confidentialité</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-300 dark:border-gray-800 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2025 VTCBuilder. Tous droits réservés.</p>
          <p className="mt-2 text-sm">vtcbuilder.com - Développé avec ❤️ en France</p>
        </div>
      </div>
    </footer>
  )
}

