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
      // Utiliser axios directement pour éviter l'intercepteur qui pourrait ajouter le token
      // Import dynamique désactivé - utiliser l'import statique
      const axios = require('axios')
      const API_URL = typeof window !== 'undefined' && window.location.hostname.includes('192.168.1.134')
        ? 'http://192.168.1.134:9495'
        : window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
        ? 'http://localhost:9495'
        : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9495'
      
      await axios.post(`${API_URL}/api/analytics/block-usage/`, {
        usages: dataToSend,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // Ne pas envoyer de token pour cet endpoint
        withCredentials: false,
        // Supprimer complètement l'Authorization header si présent
        transformRequest: [(data, headers) => {
          delete headers['Authorization']
          return JSON.stringify(data)
        }],
      })
    } catch (error: any) {
      // Ne jamais logger les erreurs 403 pour cet endpoint - c'est attendu et normal
      // Les erreurs 403 sont silencieuses et ne doivent pas apparaître dans la console
      if (error?.response?.status === 403) {
        // Erreur 403 silencieuse - ne rien faire, ne pas logger, ne pas remettre en queue
        return
      }
      // Pour les autres erreurs, logger discrètement et remettre en queue
      if (error?.response?.status !== 403) {
        // Logger seulement en mode développement et seulement une fois
        if (process.env.NODE_ENV === 'development' && !(window as any).__hasLoggedBlockTrackingError) {
          console.warn('Error enregistrement usage blocs (non-403):', error)
          ;(window as any).__hasLoggedBlockTrackingError = true
        }
        // Remettre dans la queue pour réessayer plus tard
        trackingQueue.current = [...dataToSend, ...trackingQueue.current]
      }
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

