'use client'

import { useEffect } from 'react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  icon?: React.ReactNode
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'info',
  icon,
}: ConfirmModalProps) {
  // Fermer avec Escape
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const variantStyles = {
    danger: {
      iconBg: 'bg-red-100 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      confirmBg: 'bg-red-600 hover:bg-red-700',
      border: 'border-red-200 dark:border-red-800',
    },
    warning: {
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
      border: 'border-yellow-200 dark:border-yellow-800',
    },
    info: {
      iconBg: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      confirmBg: 'bg-blue-600 hover:bg-blue-700',
      border: 'border-blue-200 dark:border-blue-800',
    },
  }

  const styles = variantStyles[variant]

  const defaultIcon = variant === 'danger' ? (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ) : variant === 'warning' ? (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ) : (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 z-10 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center ${styles.iconColor}`}>
              {icon || defaultIcon}
            </div>
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {title}
                </h3>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${styles.confirmBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

