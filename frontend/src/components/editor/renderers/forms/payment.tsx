/**
 * Renderer pour le bloc form-payment (formulaire de paiement)
 */

import React from 'react'
import { RendererProps } from '../types'

export const renderFormPayment = ({ block, wrapperStyles }: RendererProps): React.ReactElement => {
  const paymentMethods = block.data.payment_methods || ['stripe']
  const amount = block.data.amount || 0
  const currency = block.data.currency || 'EUR'
  
  const formatAmount = (amt: number, curr: string) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: curr }).format(amt)
  }
  
  return (
    <div style={wrapperStyles} className="mb-6">
      <form className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {block.data.title && (
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{block.data.title}</h3>
        )}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">Montant à payer:</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatAmount(amount, currency)}
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom sur la carte
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Jean Dupont"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Numéro de carte
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="1234 5678 9012 3456"
              disabled
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date d'expiration
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="MM/AA"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CVV
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="123"
                disabled
              />
            </div>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Méthodes de paiement:</p>
          <div className="flex gap-4">
            {paymentMethods.includes('stripe') && (
              <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">💳 Stripe</span>
              </div>
            )}
            {paymentMethods.includes('paypal') && (
              <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">🅿️ PayPal</span>
              </div>
            )}
          </div>
        </div>
        <button
          type="submit"
          className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          disabled
        >
          Payer {formatAmount(amount, currency)}
        </button>
      </form>
    </div>
  )
}

