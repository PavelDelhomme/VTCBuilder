/**
 * Renderer pour le bloc form-conditional (formulaire conditionnel)
 */

import React, { useState } from 'react'
import { RendererProps } from '../types'

export const renderFormConditional = ({ block, wrapperStyles }: RendererProps): React.ReactElement => {
  const fields = block.data.fields || []
  const [formData, setFormData] = useState<Record<string, any>>({})
  
  const FormConditionalPreview = () => {
    return (
      <div style={wrapperStyles} className="mb-6">
        {block.data.title && (
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {block.data.title}
          </h2>
        )}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <form className="space-y-4">
            {fields.length > 0 ? (
              fields.map((field: any, index: number) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {field.label || 'Champ'}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      rows={4}
                      disabled
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      disabled
                    />
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No fields configured
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
      </div>
    )
  }
  return <FormConditionalPreview />
}

