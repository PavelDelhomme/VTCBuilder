'use client'

import LoadingSpinner from './LoadingSpinner'

interface ActionButtonProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  className?: string
  title?: string
  children: React.ReactNode
  variant?: 'icon' | 'text'
}

export default function ActionButton({
  onClick,
  disabled = false,
  loading = false,
  className = '',
  title,
  children,
  variant = 'icon'
}: ActionButtonProps) {
  const isDisabled = disabled || loading

  const baseClasses = variant === 'icon' 
    ? 'text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
    : 'px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${className}`}
      title={title}
    >
      {loading ? <LoadingSpinner size="sm" /> : children}
    </button>
  )
}

