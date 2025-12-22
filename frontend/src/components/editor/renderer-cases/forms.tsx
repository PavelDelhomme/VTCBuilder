import React from 'react'
import { RendererCaseProps } from './types'

export function renderFormNewsletter({ block, onUpdate }: RendererCaseProps) {
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
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Inscrivez-vous à notre newsletter"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={safeBlock.data.description || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, description: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          rows={2}
          placeholder="Recevez nos dernières actualités..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte du bouton
        </label>
        <input
          type="text"
          value={safeBlock.data.button_text || 'S\'inscrire'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_text: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>
    </div>
  )
}

export function renderFormSearch({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Placeholder
        </label>
        <input
          type="text"
          value={safeBlock.data.placeholder || 'Rechercher...'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, placeholder: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte du bouton
        </label>
        <input
          type="text"
          value={safeBlock.data.button_text || 'Rechercher'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_text: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>
    </div>
  )
}

export function renderFormInscription({ block, onUpdate }: RendererCaseProps) {
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
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Créer un compte"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`form-inscription-name-${block.id}`}
            checked={safeBlock.data.show_name !== false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_name: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor={`form-inscription-name-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
            Champ Nom
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`form-inscription-email-${block.id}`}
            checked={safeBlock.data.show_email !== false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_email: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor={`form-inscription-email-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
            Champ Email
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`form-inscription-password-${block.id}`}
            checked={safeBlock.data.show_password !== false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_password: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor={`form-inscription-password-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
            Champ Mot de passe
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`form-inscription-phone-${block.id}`}
            checked={safeBlock.data.show_phone || false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_phone: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor={`form-inscription-phone-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
            Champ Téléphone
          </label>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte du bouton
        </label>
        <input
          type="text"
          value={safeBlock.data.button_text || 'S\'inscrire'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_text: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`form-inscription-captcha-${block.id}`}
          checked={safeBlock.data.enable_captcha || false}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, enable_captcha: e.target.checked } })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor={`form-inscription-captcha-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
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

