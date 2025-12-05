'use client'

import React from 'react'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'green' | 'purple' | 'gray'
}

export default function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
  color = 'blue',
}: ToggleSwitchProps) {
  const sizeClasses = {
    sm: {
      track: 'w-9 h-5',
      thumb: 'w-4 h-4',
      translate: 'translate-x-4',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5',
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7',
    },
  }

  const colorClasses = {
    blue: {
      checked: 'bg-blue-600',
      unchecked: 'bg-gray-300 dark:bg-gray-600',
      thumb: 'bg-white',
    },
    green: {
      checked: 'bg-green-600',
      unchecked: 'bg-gray-300 dark:bg-gray-600',
      thumb: 'bg-white',
    },
    purple: {
      checked: 'bg-purple-600',
      unchecked: 'bg-gray-300 dark:bg-gray-600',
      thumb: 'bg-white',
    },
    gray: {
      checked: 'bg-gray-400',
      unchecked: 'bg-gray-300 dark:bg-gray-600',
      thumb: 'bg-white',
    },
  }

  const currentSize = sizeClasses[size]
  const currentColor = colorClasses[color]

  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`
            ${currentSize.track}
            ${checked ? currentColor.checked : currentColor.unchecked}
            relative inline-flex items-center rounded-full transition-all duration-300 ease-in-out
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${!disabled && 'group-hover:shadow-lg'}
            ${checked ? 'shadow-md' : ''}
          `}
          onClick={() => !disabled && onChange(!checked)}
        >
          <span
            className={`
              ${currentSize.thumb}
              ${currentColor.thumb}
              inline-block rounded-full transform transition-all duration-300 ease-in-out
              ${checked ? currentSize.translate : 'translate-x-0.5'}
              shadow-lg
              ${!disabled && checked ? 'scale-110' : ''}
            `}
          />
        </div>
      </div>
      {label && (
        <span className={`text-sm font-medium ${disabled ? 'opacity-50' : ''} ${
          checked 
            ? 'text-gray-900 dark:text-gray-100' 
            : 'text-gray-600 dark:text-gray-400'
        }`}>
          {label}
        </span>
      )}
    </label>
  )
}

