/**
 * Renderer pour le bloc booking-form (formulaire de réservation VTC)
 */

import React from 'react'
import { RendererProps } from '../types'
import Captcha from '@/components/shared/Captcha'

export const renderBookingForm = ({ block, wrapperStyles }: RendererProps): React.ReactElement => {
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data.title && (
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {block.data.title}
        </h2>
      )}
      <form className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 space-y-4">
        {block.data.show_pickup !== false && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Point de prise en charge
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Adresse de départ"
            />
          </div>
        )}
        {block.data.show_dropoff !== false && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Point de destination
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Adresse d'arrivée"
            />
          </div>
        )}
        {block.data.show_date !== false && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date et heure
            </label>
            <input
              type="datetime-local"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
        {block.data.show_passengers && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de passagers
            </label>
            <input
              type="number"
              min="1"
              max="8"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
        {block.data.show_vehicle && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type de véhicule
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Berline</option>
              <option>Van</option>
              <option>Luxe</option>
            </select>
          </div>
        )}
        {block.data.show_phone !== false && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+33 6 12 34 56 78"
            />
          </div>
        )}
        {block.data.show_notes && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes spéciales
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Informations supplémentaires..."
            />
          </div>
        )}
        {block.data.enable_captcha && (
          <div className="mt-4">
            <Captcha
              onVerify={(isValid) => {
                // La validation est gérée par le composant Captcha lui-même
              }}
              theme={block.data.captcha_theme || 'light'}
            />
          </div>
        )}
        <button
          type="submit"
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {block.data.button_text || 'Réserver'}
        </button>
      </form>
    </div>
  )
}

