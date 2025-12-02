import { useState, useCallback, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

/**
 * Hook pour gérer le chargement lors de la navigation
 * Affiche immédiatement un loader au clic et navigue vers la page
 */
export function useNavigationLoading() {
  const router = useRouter()
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)

  // Réinitialiser isNavigating quand la route change
  useEffect(() => {
    if (isNavigating && navigatingTo && pathname === navigatingTo) {
      // La navigation est terminée
      setIsNavigating(false)
      setNavigatingTo(null)
    }
  }, [pathname, isNavigating, navigatingTo])

  const navigate = useCallback((path: string) => {
    // Mettre à jour l'état immédiatement pour afficher le loader
    setIsNavigating(true)
    setNavigatingTo(path)
    
    // Naviguer immédiatement (le loader sera affiché pendant la navigation)
    router.push(path)
  }, [router])

  return {
    isNavigating,
    navigatingTo,
    navigate,
  }
}

