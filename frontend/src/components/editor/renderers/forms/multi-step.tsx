/**
 * Renderer pour le bloc form-multi-step (formulaire multi-étapes)
 */

import React, { useState } from 'react'
import { RendererProps } from '../types'

export const renderFormMultiStep = ({ block, wrapperStyles }: RendererProps): React.ReactElement => {
  const steps = block.data.steps || []
  const [currentStep, setCurrentStep] = useState(0)
  
  const FormMultiStepPreview = () => {
    return (
      <div style={wrapperStyles} className="mb-6">
        {block.data.title && (
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {block.data.title}
          </h2>
        )}
        {steps.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            {/* Indicateur d'étapes */}
            <div className="flex justify-between mb-6">
              {steps.map((step: any, index: number) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index === currentStep
                      ? 'bg-blue-600 text-white'
                      : index < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-1 mx-2 ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            {/* Contenu de l'étape actuelle */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {steps[currentStep]?.title || `Étape ${currentStep + 1}`}
              </h3>
              <div className="text-gray-600 dark:text-gray-400">
                {steps[currentStep]?.description || 'Contenu de l\'étape...'}
              </div>
            </div>
            {/* Boutons de navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                disabled={currentStep === steps.length - 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded">
            No steps configured
          </div>
        )}
      </div>
    )
  }
  return <FormMultiStepPreview />
}

