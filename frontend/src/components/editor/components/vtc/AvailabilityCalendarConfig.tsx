'use client'

import React from 'react'
import { Block } from '../../types'

export function AvailabilityCalendarConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Disponibilités"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={safeBlock.data.description || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, description: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          rows={2}
          placeholder="Consultez nos disponibilités..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Mode d'affichage
        </label>
        <select
          value={safeBlock.data.view_mode || 'month'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, view_mode: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="month">Mois</option>
          <option value="week">Semaine</option>
          <option value="day">Jour</option>
        </select>
      </div>
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={safeBlock.data.show_time_slots === true}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_time_slots: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">Afficher les créneaux horaires</span>
        </label>
      </div>
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={safeBlock.data.allow_booking === true}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, allow_booking: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">Permettre la réservation directe</span>
        </label>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Jours de la semaine disponibles
        </label>
        <div className="space-y-1">
          {['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'].map((day) => (
            <label key={day} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={(safeBlock.data.available_days || []).includes(day)}
                onChange={(e) => {
                  const currentDays = safeBlock.data.available_days || []
                  const newDays = e.target.checked
                    ? [...currentDays, day]
                    : currentDays.filter((d: string) => d !== day)
                  onUpdate({ data: { ...safeBlock.data, available_days: newDays } })
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-xs text-gray-700 dark:text-gray-300 capitalize">{day}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Heures d'ouverture (début)
        </label>
        <input
          type="time"
          value={safeBlock.data.start_time || '08:00'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, start_time: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Heures de fermeture (fin)
        </label>
        <input
          type="time"
          value={safeBlock.data.end_time || '22:00'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, end_time: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
    </div>
  )
}
