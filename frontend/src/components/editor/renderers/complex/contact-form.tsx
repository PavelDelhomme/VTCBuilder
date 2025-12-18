/**
 * Renderer pour le bloc contact-form (formulaire de contact)
 */

import React from 'react'
import { RendererProps } from '../types'

export const renderContactForm = ({ block, blockType, blockTypes, theme, wrapperStyles, contentStyles }: RendererProps): React.ReactElement => {
  const fields = block.data?.fields || []
  const submitText = block.data?.submit_text || 'Envoyer'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        {block.data?.title && (
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {block.data.title}
          </h2>
        )}
        {block.data?.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {block.data.description}
          </p>
        )}
        <form className="space-y-4">
          {fields.length > 0 ? (
            fields.map((field: any, index: number) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label || 'Champ'}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={4}
                    placeholder={field.placeholder || ''}
                    disabled
                  />
                ) : field.type === 'select' ? (
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    disabled
                  >
                    <option>{field.placeholder || 'Sélectionner...'}</option>
                  </select>
                ) : (
                  <input
                    type={field.type || 'text'}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={field.placeholder || ''}
                    disabled
                  />
                )}
              </div>
            ))
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={4}
                  disabled
                />
              </div>
            </div>
          )}
          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            disabled
          >
            {submitText}
          </button>
        </form>
      </div>
    </div>
  )
}

