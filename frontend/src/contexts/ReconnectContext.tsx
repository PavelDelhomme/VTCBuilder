'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import ReconnectModal from '@/components/shared/ReconnectModal'

interface ReconnectContextType {
  showReconnectModal: () => void
  hideReconnectModal: () => void
  isReconnectModalOpen: boolean
}

const ReconnectContext = createContext<ReconnectContextType | undefined>(undefined)

export function ReconnectProvider({ children }: { children: ReactNode }) {
  const [isReconnectModalOpen, setIsReconnectModalOpen] = useState(false)
  const pathname = usePathname()

  const showReconnectModal = useCallback(() => {
    setIsReconnectModalOpen(true)
  }, [])

  const hideReconnectModal = useCallback(() => {
    setIsReconnectModalOpen(false)
  }, [])

  const handleReconnect = useCallback(() => {
    setIsReconnectModalOpen(false)
    // Rafraîchir la page pour recharger les données
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }, [])

  return (
    <ReconnectContext.Provider
      value={{
        showReconnectModal,
        hideReconnectModal,
        isReconnectModalOpen,
      }}
    >
      {children}
      <ReconnectModal
        isOpen={isReconnectModalOpen}
        onClose={hideReconnectModal}
        onReconnect={handleReconnect}
        currentPath={pathname}
      />
    </ReconnectContext.Provider>
  )
}

export function useReconnect() {
  const context = useContext(ReconnectContext)
  if (context === undefined) {
    throw new Error('useReconnect must be used within a ReconnectProvider')
  }
  return context
}

