/**
 * Renderer pour le bloc form (formulaire générique)
 */

import React from 'react'
import { RendererProps } from '../types'
import Captcha from '@/components/shared/Captcha'

export const renderForm = ({ block, wrapperStyles }: RendererProps): React.ReactElement => {
  const formFields = block.data.fields || []
  return (
    <div style={wrapperStyles} className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      {block.data.title && (
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">{block.data.title}</h3>
      )}
      <form className="space-y-4">
        {formFields.length > 0 ? (
          formFields.map((field: any, i: number) => (
            <div key={i}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {field.label || 'Champ'}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder={field.placeholder || ''}
                  disabled
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={field.placeholder || ''}
                  disabled
                />
              )}
            </div>
          ))
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
              <textarea className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" rows={4} disabled />
            </div>
          </>
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
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          disabled
        >
          {block.data.submit_text || 'Envoyer'}
        </button>
      </form>
    </div>
  )
}

