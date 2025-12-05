'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import ReconnectModal from '@/components/shared/ReconnectModal'
import { saveEditorStateBeforeReconnect } from '@/hooks/useEditorStatePersistence'

interface ReconnectContextType {
  showReconnectModal: () => void
  hideReconnectModal: () => void
  isReconnectModalOpen: boolean
  saveEditorState: (state: any) => void
}

const ReconnectContext = createContext<ReconnectContextType | undefined>(undefined)

export function ReconnectProvider({ children }: { children: ReactNode }) {
  const [isReconnectModalOpen, setIsReconnectModalOpen] = useState(false)
  const [editorState, setEditorState] = useState<any>(null)
  const pathname = usePathname()

  const saveEditorState = useCallback((state: any) => {
    setEditorState(state)
  }, [])

  const showReconnectModal = useCallback(() => {
    // Sauvegarder l'état de l'éditeur si on est sur une page d'édition
    if (pathname && (pathname.includes('/edit') || pathname.includes('/edit-visual') || pathname.includes('/pages-public'))) {
      if (editorState) {
        saveEditorStateBeforeReconnect(pathname, editorState)
      }
    }
    
    // Sauvegarder aussi l'état dans sessionStorage pour plus de sécurité
    if (typeof window !== 'undefined' && pathname) {
      try {
        const stateToSave = {
          pathname,
          editorState,
          timestamp: Date.now(),
        }
        sessionStorage.setItem('reconnect_state_backup', JSON.stringify(stateToSave))
      } catch (e) {
        console.warn('Impossible de sauvegarder l\'état dans sessionStorage:', e)
      }
    }
    
    setIsReconnectModalOpen(true)
  }, [pathname, editorState])

  const hideReconnectModal = useCallback(() => {
    setIsReconnectModalOpen(false)
  }, [])

  const handleReconnect = useCallback(() => {
    setIsReconnectModalOpen(false)
    // Ne PAS rafraîchir la page - les requêtes seront relancées automatiquement
    // L'état de l'éditeur sera restauré si nécessaire
    // On déclenche juste un événement personnalisé pour notifier les composants
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('reconnect-success'))
    }
  }, [])

  return (
    <ReconnectContext.Provider
      value={{
        showReconnectModal,
        hideReconnectModal,
        isReconnectModalOpen,
        saveEditorState,
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

