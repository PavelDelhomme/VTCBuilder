'use client'

import React, { useState, useEffect, useCallback } from 'react'

export interface TutorialStep {
  id: string
  title: string
  content: React.ReactNode
  target?: string // Selector CSS pour cibler un élément
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  highlight?: boolean // Mettre en surbrillance la cible
  action?: () => void // Action à exécuter (ex: ouvrir un menu)
  skipIf?: () => boolean // Condition pour sauter cette étape
}

export interface TutorialConfig {
  id: string
  name: string
  description: string
  steps: TutorialStep[]
  onComplete?: () => void
  onSkip?: () => void
  storageKey?: string // Clé pour sauvegarder la progression
}

interface TutorialSystemProps {
  tutorial: TutorialConfig | null
  onClose?: () => void
  autoStart?: boolean
}

export function TutorialSystem({ tutorial, onClose, autoStart = false }: TutorialSystemProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [overlayPosition, setOverlayPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null)

  // Vérifier si le tutoriel a déjà été complété
  useEffect(() => {
    if (!tutorial) return
    
    const storageKey = tutorial.storageKey || `tutorial_${tutorial.id}_completed`
    const isCompleted = localStorage.getItem(storageKey) === 'true'
    
    if (isCompleted && !autoStart) {
      setIsVisible(false)
      return
    }
    
    if (autoStart || tutorial) {
      setIsVisible(true)
    }
  }, [tutorial, autoStart])

  // Mettre à jour la position de la cible
  const updateTargetPosition = useCallback(() => {
    if (!tutorial || currentStep >= tutorial.steps.length) return
    
    const step = tutorial.steps[currentStep]
    if (!step.target) {
      setTargetElement(null)
      setOverlayPosition(null)
      return
    }

    const element = document.querySelector(step.target) as HTMLElement
    if (element) {
      setTargetElement(element)
      const rect = element.getBoundingClientRect()
      setOverlayPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      })
    } else {
      setTargetElement(null)
      setOverlayPosition(null)
    }
  }, [tutorial, currentStep])

  useEffect(() => {
    updateTargetPosition()
    
    // Mettre à jour la position lors du scroll ou du resize
    const handleUpdate = () => updateTargetPosition()
    window.addEventListener('scroll', handleUpdate, true)
    window.addEventListener('resize', handleUpdate)
    
    return () => {
      window.removeEventListener('scroll', handleUpdate, true)
      window.removeEventListener('resize', handleUpdate)
    }
  }, [updateTargetPosition])

  // Vérifier si l'étape doit être ignorée
  useEffect(() => {
    if (!tutorial || currentStep >= tutorial.steps.length) return
    
    const step = tutorial.steps[currentStep]
    if (step.skipIf && step.skipIf()) {
      handleNext()
    }
  }, [tutorial, currentStep])

  const handleNext = () => {
    if (!tutorial) return
    
    if (currentStep < tutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    if (!tutorial) return
    
    const storageKey = tutorial.storageKey || `tutorial_${tutorial.id}_completed`
    localStorage.setItem(storageKey, 'true')
    
    if (tutorial.onComplete) {
      tutorial.onComplete()
    }
    
    setIsVisible(false)
    if (onClose) {
      onClose()
    }
  }

  const handleSkip = () => {
    if (!tutorial) return
    
    const storageKey = tutorial.storageKey || `tutorial_${tutorial.id}_skipped`
    localStorage.setItem(storageKey, 'true')
    
    if (tutorial.onSkip) {
      tutorial.onSkip()
    }
    
    setIsVisible(false)
    if (onClose) {
      onClose()
    }
  }

  if (!tutorial || !isVisible || currentStep >= tutorial.steps.length) {
    return null
  }

  const step = tutorial.steps[currentStep]
  const position = step.position || 'bottom'

  // Exécuter l'action si définie
  useEffect(() => {
    if (step.action) {
      // Délai pour s'assurer que l'élément est rendu
      setTimeout(() => {
        step.action?.()
      }, 100)
    }
  }, [currentStep, step.action])

  // Calculer la position du tooltip
  const getTooltipPosition = () => {
    if (!overlayPosition) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    }

    const spacing = 20
    const tooltipWidth = 320
    const tooltipHeight = 200

    switch (position) {
      case 'top':
        return {
          top: `${overlayPosition.top - tooltipHeight - spacing}px`,
          left: `${overlayPosition.left + overlayPosition.width / 2}px`,
          transform: 'translateX(-50%)',
        }
      case 'bottom':
        return {
          top: `${overlayPosition.top + overlayPosition.height + spacing}px`,
          left: `${overlayPosition.left + overlayPosition.width / 2}px`,
          transform: 'translateX(-50%)',
        }
      case 'left':
        return {
          top: `${overlayPosition.top + overlayPosition.height / 2}px`,
          left: `${overlayPosition.left - tooltipWidth - spacing}px`,
          transform: 'translateY(-50%)',
        }
      case 'right':
        return {
          top: `${overlayPosition.top + overlayPosition.height / 2}px`,
          left: `${overlayPosition.left + overlayPosition.width + spacing}px`,
          transform: 'translateY(-50%)',
        }
      case 'center':
      default:
        return {
          top: `${overlayPosition.top + overlayPosition.height / 2}px`,
          left: `${overlayPosition.left + overlayPosition.width / 2}px`,
          transform: 'translate(-50%, -50%)',
        }
    }
  }

  return (
    <>
      {/* Overlay sombre */}
      <div
        className="fixed inset-0 bg-black/50 z-[99998] transition-opacity"
        style={{ zIndex: 99998 }}
        onClick={handleNext}
      />

      {/* Highlight de la cible */}
      {overlayPosition && step.highlight && (
        <div
          className="fixed z-[99999] pointer-events-none"
          style={{
            top: `${overlayPosition.top}px`,
            left: `${overlayPosition.left}px`,
            width: `${overlayPosition.width}px`,
            height: `${overlayPosition.height}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 0 4px rgba(59, 130, 246, 0.8)',
            borderRadius: '8px',
            zIndex: 99999,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-[100000] bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm pointer-events-auto"
        style={{
          ...getTooltipPosition(),
          zIndex: 100000,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              {step.title}
            </h3>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Étape {currentStep + 1} sur {tutorial.steps.length}
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="ml-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Ignorer le tutoriel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="text-sm text-gray-700 dark:text-gray-300 mb-6">
          {step.content}
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorial.steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Précédent
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Ignorer
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {currentStep === tutorial.steps.length - 1 ? 'Terminer' : 'Suivant'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// Hook pour gérer les tutoriels
export function useTutorial(tutorialId: string) {
  const [tutorial, setTutorial] = useState<TutorialConfig | null>(null)
  const [isActive, setIsActive] = useState(false)

  const startTutorial = useCallback((config: TutorialConfig) => {
    setTutorial(config)
    setIsActive(true)
  }, [])

  const stopTutorial = useCallback(() => {
    setIsActive(false)
    setTutorial(null)
  }, [])

  const resetTutorial = useCallback((tutorialId: string) => {
    const storageKey = `tutorial_${tutorialId}_completed`
    localStorage.removeItem(storageKey)
    const skipKey = `tutorial_${tutorialId}_skipped`
    localStorage.removeItem(skipKey)
  }, [])

  const isTutorialCompleted = useCallback((tutorialId: string) => {
    const storageKey = `tutorial_${tutorialId}_completed`
    return localStorage.getItem(storageKey) === 'true'
  }, [])

  return {
    tutorial,
    isActive,
    startTutorial,
    stopTutorial,
    resetTutorial,
    isTutorialCompleted,
  }
}

