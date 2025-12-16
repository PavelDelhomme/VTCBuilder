/**
 * Renderer pour le bloc contact-buttons (boutons de contact VTC)
 */

import React from 'react'
import { RendererProps } from '../types'

export const renderContactButtons = ({ block, wrapperStyles }: RendererProps): React.ReactElement => {
  const contacts = block.data.contacts || []
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data.title && (
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-6">
          {block.data.title}
        </h2>
      )}
      <div className="flex flex-wrap justify-center gap-4">
        {contacts.length > 0 ? (
          contacts.map((contact: any, index: number) => {
            const getHref = () => {
              switch (contact.type) {
                case 'phone': {
                  return `tel:${contact.value}`
                }
                case 'whatsapp': {
                  return `https://wa.me/${contact.value.replace(/[^0-9]/g, '')}`
                }
                case 'email': {
                  return `mailto:${contact.value}`
                }
                case 'sms': {
                  return `sms:${contact.value}`
                }
                default:
                  return '#'
              }
            }
            return (
              <a
                key={index}
                href={getHref()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {contact.icon && <span className="text-xl">{contact.icon}</span>}
                <span>{contact.label || contact.type}</span>
              </a>
            )
          })
        ) : (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded w-full">
            No contact configured
          </div>
        )}
      </div>
    </div>
  )
}

