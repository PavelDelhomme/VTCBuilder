import React from 'react'
import { RendererCaseProps } from '../types'
import { CollapsibleSection } from '../../CollapsibleSection'

export function renderContactButtons({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const contacts = safeBlock.data.contacts || [{ type: 'phone', label: '', value: '', icon: '' }]
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre de la section
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Contactez-nous"
        />
      </div>
      <CollapsibleSection title="Contacts" count={contacts.length} defaultCollapsed={false}>
        <div className="space-y-3">
          {contacts.map((contact: any, index: number) => (
            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Contact {index + 1}</span>
                <button
                  onClick={() => {
                    const newContacts = contacts.filter((_: any, i: number) => i !== index)
                    onUpdate({ data: { ...safeBlock.data, contacts: newContacts } })
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                  title="Supprimer ce contact"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type de contact
                </label>
                <select
                  value={contact.type || 'phone'}
                  onChange={(e) => {
                    const newContacts = [...contacts]
                    newContacts[index] = { ...contact, type: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, contacts: newContacts } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="phone">Téléphone</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={contact.label || ''}
                  onChange={(e) => {
                    const newContacts = [...contacts]
                    newContacts[index] = { ...contact, label: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, contacts: newContacts } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Label (ex: Appelez-nous)"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valeur
                </label>
                <input
                  type="text"
                  value={contact.value || ''}
                  onChange={(e) => {
                    const newContacts = [...contacts]
                    newContacts[index] = { ...contact, value: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, contacts: newContacts } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Valeur (ex: +33 6 12 34 56 78)"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Icône (emoji)
                </label>
                <input
                  type="text"
                  value={contact.icon || ''}
                  onChange={(e) => {
                    const newContacts = [...contacts]
                    newContacts[index] = { ...contact, icon: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, contacts: newContacts } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Icône emoji (ex: 📞)"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newContacts = [...contacts, { type: 'phone', label: '', value: '', icon: '' }]
              onUpdate({ data: { ...safeBlock.data, contacts: newContacts } })
            }}
            className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
          >
            <span>+</span>
            <span>Ajouter un contact</span>
          </button>
        </div>
      </CollapsibleSection>
    </div>
  )
}

