import React from 'react'
import { RendererCaseProps } from './types'
import { CollapsibleSection } from '../CollapsibleSection'

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

export function renderForm({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const formFields = safeBlock.data.fields || [
    { type: 'text', label: 'Nom', placeholder: 'Votre nom', required: true },
    { type: 'email', label: 'Email', placeholder: 'votre@email.com', required: true },
    { type: 'textarea', label: 'Message', placeholder: 'Votre message', required: true }
  ]
  
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
          placeholder="Formulaire de contact"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte du bouton
        </label>
        <input
          type="text"
          value={safeBlock.data.submit_text || 'Envoyer'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, submit_text: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>
      <CollapsibleSection title="Champs du formulaire" count={formFields.length} defaultCollapsed={false}>
        <div className="space-y-3">
          {formFields.map((field: any, index: number) => (
            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Champ {index + 1}</span>
                <button
                  onClick={() => {
                    const newFields = formFields.filter((_: any, i: number) => i !== index)
                    onUpdate({ data: { ...safeBlock.data, fields: newFields } })
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                  title="Supprimer ce champ"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type de champ
                </label>
                <select
                  value={field.type || 'text'}
                  onChange={(e) => {
                    const newFields = [...formFields]
                    newFields[index] = { ...field, type: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, fields: newFields } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="text">Texte</option>
                  <option value="email">Email</option>
                  <option value="tel">Téléphone</option>
                  <option value="textarea">Zone de texte</option>
                  <option value="number">Nombre</option>
                  <option value="url">URL</option>
                  <option value="date">Date</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Label du champ
                </label>
                <input
                  type="text"
                  value={field.label || ''}
                  onChange={(e) => {
                    const newFields = [...formFields]
                    newFields[index] = { ...field, label: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, fields: newFields } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Label du champ"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Placeholder
                </label>
                <input
                  type="text"
                  value={field.placeholder || ''}
                  onChange={(e) => {
                    const newFields = [...formFields]
                    newFields[index] = { ...field, placeholder: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, fields: newFields } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Placeholder"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`field-required-${block.id}-${index}`}
                  checked={field.required || false}
                  onChange={(e) => {
                    const newFields = [...formFields]
                    newFields[index] = { ...field, required: e.target.checked }
                    onUpdate({ data: { ...safeBlock.data, fields: newFields } })
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={`field-required-${block.id}-${index}`} className="text-xs text-gray-700 dark:text-gray-300">
                  Champ requis
                </label>
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newFields = [...formFields, { type: 'text', label: '', placeholder: '', required: false }]
              onUpdate({ data: { ...safeBlock.data, fields: newFields } })
            }}
            className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
          >
            <span>+</span>
            <span>Ajouter un champ</span>
          </button>
        </div>
      </CollapsibleSection>
      <div className="flex items-center gap-2 mt-3">
        <input
          type="checkbox"
          id={`form-captcha-${block.id}`}
          checked={safeBlock.data.enable_captcha || false}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, enable_captcha: e.target.checked } })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor={`form-captcha-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
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

