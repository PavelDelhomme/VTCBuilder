import { useEffect, useRef } from 'react'
import api from '@/lib/api'

interface BlockUsage {
  block_type: string
  action: 'add' | 'update' | 'delete' | 'view'
  timestamp: string
  tenant_id?: number
}

/**
 * Hook pour tracker l'utilisation des blocs
 * Enregistre en base de données les actions sur les blocs pour analytics
 */
export function useBlockTracking() {
  const trackingQueue = useRef<BlockUsage[]>([])
  const flushTimeout = useRef<number | null>(null)

  // Fonction pour ajouter un événement au queue
  const trackBlockAction = (blockType: string, action: 'add' | 'update' | 'delete' | 'view') => {
    const usage: BlockUsage = {
      block_type: blockType,
      action,
      timestamp: new Date().toISOString(),
    }

    trackingQueue.current.push(usage)

    // Flush après 5 secondes ou si la queue atteint 10 éléments
    if (trackingQueue.current.length >= 10) {
      flushTracking()
    } else {
      // Annuler le timeout précédent
      if (flushTimeout.current) {
        window.clearTimeout(flushTimeout.current)
      }
      // Programmer un nouveau flush
      flushTimeout.current = window.setTimeout(() => {
        flushTracking()
      }, 5000)
    }
  }

  // Fonction pour envoyer les données au serveur
  const flushTracking = async () => {
    if (trackingQueue.current.length === 0) return

    const dataToSend = [...trackingQueue.current]
    trackingQueue.current = []

    if (flushTimeout.current) {
      window.clearTimeout(flushTimeout.current)
      flushTimeout.current = null
    }

    try {
      await api.post('/analytics/block-usage/', {
        usages: dataToSend,
      })
    } catch (error) {
      console.warn('Error enregistrement usage blocs:', error)
      // En cas d'erreur, remettre dans la queue pour réessayer plus tard
      trackingQueue.current = [...dataToSend, ...trackingQueue.current]
    }
  }

  // Flush au démontage du composant
  useEffect(() => {
    return () => {
      if (trackingQueue.current.length > 0) {
        flushTracking()
      }
      if (flushTimeout.current) {
        window.clearTimeout(flushTimeout.current)
      }
    }
  }, [])

  return { trackBlockAction }
}

