'use client'

import { useState } from 'react'
import PublicLayout from '@/components/PublicLayout'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // TODO: Implémenter l'envoi du formulaire via API
    // Pour l'instant, on simule un envoi
    setTimeout(() => {
      toast.success('Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setLoading(false)
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <PublicLayout
      title="Contactez-nous"
      description="Nous sommes là pour vous aider. Contactez notre équipe support"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Envoyez-nous un message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sujet *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="support">Support technique</option>
                  <option value="sales">Question commerciale</option>
                  <option value="billing">Question de facturation</option>
                  <option value="feature">Suggestion de fonctionnalité</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Nos coordonnées</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                    <span className="text-2xl">📧</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Email</h3>
                    <a href="mailto:support@vtcbuilder.com" className="text-blue-600 hover:underline">
                      support@vtcbuilder.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                    <span className="text-2xl">📞</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Téléphone</h3>
                    <a href="tel:+33123456789" className="text-blue-600 hover:underline">
                      +33 1 23 45 67 89
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Adresse</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      123 Avenue des Exemples<br />
                      75000 PARIS<br />
                      France
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Horaires de support</h2>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Lundi - Vendredi</span>
                  <span className="font-semibold">9h - 18h</span>
                </div>
                <div className="flex justify-between">
                  <span>Samedi</span>
                  <span className="font-semibold">10h - 16h</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimanche</span>
                  <span className="font-semibold">Fermé</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">💡 Conseil</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Pour une réponse plus rapide, consultez d'abord notre <a href="/faq" className="text-blue-600 hover:underline">FAQ</a> ou notre <a href="/docs" className="text-blue-600 hover:underline">documentation</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

