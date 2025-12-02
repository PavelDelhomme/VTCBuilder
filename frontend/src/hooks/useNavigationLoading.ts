import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Hook pour gérer le chargement lors de la navigation
 * Affiche immédiatement un loader au clic et navigue vers la page
 */
export function useNavigationLoading() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)

  const navigate = useCallback((path: string) => {
    setIsNavigating(true)
    setNavigatingTo(path)
    // Utiliser setTimeout pour permettre au render de s'exécuter avant la navigation
    setTimeout(() => {
      router.push(path)
    }, 0)
  }, [router])

  return {
    isNavigating,
    navigatingTo,
    navigate,
  }
}

