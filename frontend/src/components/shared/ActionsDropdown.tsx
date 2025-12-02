'use client'

import { useState } from 'react'

export interface ActionItem {
  label: string
  icon: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'danger' | 'warning' | 'success'
  disabled?: boolean
  divider?: boolean
}

interface ActionsDropdownProps {
  actions: ActionItem[]
  isLoading?: boolean
  buttonClassName?: string
}

export default function ActionsDropdown({ actions, isLoading = false, buttonClassName = '' }: ActionsDropdownProps) {
  const [showMenu, setShowMenu] = useState(false)

  const getVariantClass = (variant: string = 'default') => {
    switch (variant) {
      case 'danger':
        return 'text-red-600 dark:text-red-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'success':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowMenu(!showMenu)
        }}
        disabled={isLoading}
        className={`p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
        title="Actions"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1">
              {actions.map((action, index) => (
                <div key={index}>
                  {action.divider && index > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!action.disabled) {
                        action.onClick()
                        setShowMenu(false)
                      }
                    }}
                    disabled={action.disabled || isLoading}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${getVariantClass(action.variant)}`}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

