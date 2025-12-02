import { useState, useCallback, startTransition } from 'react'
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
    // Mettre à jour l'état immédiatement pour afficher le loader
    setIsNavigating(true)
    setNavigatingTo(path)
    
    // Utiliser startTransition pour permettre au render de s'exécuter avant la navigation
    startTransition(() => {
      router.push(path)
    })
  }, [router])

  return {
    isNavigating,
    navigatingTo,
    navigate,
  }
}

