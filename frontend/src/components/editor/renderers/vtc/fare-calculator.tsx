/**
 * Renderer pour le bloc fare-calculator (calculateur de tarif VTC)
 */

import React from 'react'
import { RendererProps } from '../types'

export const renderFareCalculator = ({ block, wrapperStyles }: RendererProps): React.ReactElement => {
  const pricingRules = block.data?.pricing_rules || []
  return (
    <div style={wrapperStyles} className="mb-6">
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
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Distance (km)
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="0"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Durée (min)
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="0"
                readOnly
              />
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              {pricingRules.length > 0 ? (
                pricingRules.map((rule: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{rule.label || 'Tarif'}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {rule.amount || 0} {block.data?.currency || 'EUR'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                  No pricing rule configured
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                0 {block.data?.currency || 'EUR'}
              </span>
            </div>
          </div>
          <button
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            disabled
          >
            Calculer le tarif
          </button>
        </div>
      </div>
    </div>
  )
}

