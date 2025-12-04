'use client'

import { useState, useCallback } from 'react'
import ConfirmModal from '@/components/shared/ConfirmModal'

interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  icon?: React.ReactNode
}

export function useConfirm() {
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    options: ConfirmOptions | null
    resolve: ((value: boolean) => void) | null
  }>({
    isOpen: false,
    options: null,
    resolve: null,
  })

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        resolve,
      })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(true)
    }
    setConfirmState({
      isOpen: false,
      options: null,
      resolve: null,
    })
  }, [confirmState])

  const handleCancel = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(false)
    }
    setConfirmState({
      isOpen: false,
      options: null,
      resolve: null,
    })
  }, [confirmState])

  const ConfirmDialog = () => (
    <ConfirmModal
      isOpen={confirmState.isOpen}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={confirmState.options?.title}
      message={confirmState.options?.message || ''}
      confirmText={confirmState.options?.confirmText}
      cancelText={confirmState.options?.cancelText}
      variant={confirmState.options?.variant}
      icon={confirmState.options?.icon}
    />
  )

  return { confirm, ConfirmDialog }
}

