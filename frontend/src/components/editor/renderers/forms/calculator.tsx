/**
 * Renderer pour le bloc form-calculator (formulaire calculateur)
 */

import React, { useState } from 'react'
import { RendererProps } from '../types'

function FormCalculatorPreviewComponent({ block, wrapperStyles, contentStyles, theme }: RendererProps): React.ReactElement {
  const fields = block.data.fields || []
  const [values, setValues] = useState<Record<string, number>>({})
  const [result, setResult] = useState<number | null>(null)
  
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
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={field.placeholder || '0'}
                    disabled
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No fields configured
              </div>
            )}
            {result !== null && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Résultat</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result}</div>
              </div>
            )}
            <button
              type="button"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              disabled
            >
              {block.data.calculate_text || 'Calculer'}
            </button>
          </form>
        </div>
      </div>
    )
}

export const renderFormCalculator = ({ block, wrapperStyles, contentStyles, theme }: RendererProps): React.ReactElement => {
  return <FormCalculatorPreviewComponent block={block} wrapperStyles={wrapperStyles} contentStyles={contentStyles} theme={theme} />
}

