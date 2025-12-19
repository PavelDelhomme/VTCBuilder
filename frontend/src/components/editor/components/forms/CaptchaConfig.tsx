'use client'

import React from 'react'
import { Block } from '../../types'

export function CaptchaConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Thème
        </label>
        <select
          value={safeBlock.data.theme || 'light'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, theme: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="light">Clair</option>
          <option value="dark">Sombre</option>
        </select>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        💡 Le captcha affiche une opération mathématique simple que l'utilisateur doit résoudre pour vérifier qu'il n'est pas un robot.
      </div>
    </div>
  )
}
