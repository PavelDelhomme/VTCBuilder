import React from 'react'
import { RendererCaseProps } from './types'

export function renderBookingForm({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre du formulaire
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Réservez votre course"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`booking-pickup-${block.id}`}
            checked={safeBlock.data.show_pickup !== false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_pickup: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor={`booking-pickup-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
            Point de prise en charge
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`booking-dropoff-${block.id}`}
            checked={safeBlock.data.show_dropoff !== false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_dropoff: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor={`booking-dropoff-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
            Point de destination
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`booking-date-${block.id}`}
            checked={safeBlock.data.show_date !== false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_date: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor={`booking-date-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
            Date et heure
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`booking-passengers-${block.id}`}
            checked={safeBlock.data.show_passengers || false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_passengers: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor={`booking-passengers-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
            Nombre de passagers
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`booking-vehicle-${block.id}`}
            checked={safeBlock.data.show_vehicle || false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_vehicle: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor={`booking-vehicle-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
            Type de véhicule
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`booking-phone-${block.id}`}
            checked={safeBlock.data.show_phone !== false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_phone: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor={`booking-phone-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
            Téléphone
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`booking-notes-${block.id}`}
            checked={safeBlock.data.show_notes || false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_notes: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor={`booking-notes-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
            Notes spéciales
          </label>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte du bouton
        </label>
        <input
          type="text"
          value={safeBlock.data.button_text || 'Réserver'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_text: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`booking-captcha-${block.id}`}
          checked={safeBlock.data.enable_captcha || false}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, enable_captcha: e.target.checked } })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor={`booking-captcha-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
          Activer le captcha
        </label>
      </div>
      {safeBlock.data.enable_captcha && (
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Thème du captcha
          </label>
          <select
            value={safeBlock.data.captcha_theme || 'light'}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, captcha_theme: e.target.value } })}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="light">Clair</option>
            <option value="dark">Sombre</option>
          </select>
        </div>
      )}
    </div>
  )
}

export const vtcFormsCases = {
  'booking-form': renderBookingForm,
}

