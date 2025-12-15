import { useEffect, useRef, useState } from 'react'
import { quickHash } from '@/lib/memory-utils'

interface UseAutoSaveOptions {
  data: any
  onSave: (data: any) => Promise<void>
  debounceMs?: number
  enabled?: boolean
}

/**
 * Hook pour sauvegarde automatique avec détection de modifications réelles
 * Ne sauvegarde que si les données ont vraiment changé
 * Optimisé pour la mémoire : utilise quickHash au lieu de JSON.stringify
 */
export function useAutoSave({ data, onSave, debounceMs = 2000, enabled = true }: UseAutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const lastSavedHashRef = useRef<string | null>(null) // Stocker le hash au lieu de l'objet complet
  const timeoutRef = useRef<number | null>(null)
  const isInitialMount = useRef(true)
  const onSaveRef = useRef(onSave)
  
  // Mettre à jour la ref quand onSave change
  useEffect(() => {
    onSaveRef.current = onSave
  }, [onSave])

  // Fonction pour comparer deux objets (utilise hash au lieu de JSON.stringify)
  const hasDataChanged = (oldHash: string | null, newData: any): boolean => {
    if (oldHash === null || oldHash === undefined) return true
    const newHash = quickHash(newData)
    return oldHash !== newHash
  }

  useEffect(() => {
    // Ignorer le premier rendu (montage initial)
    if (isInitialMount.current) {
      isInitialMount.current = false
      lastSavedHashRef.current = quickHash(data)
      return
    }

    if (!enabled || !data) return

    // Vérifier si les données ont vraiment changé (comparaison par hash)
    if (!hasDataChanged(lastSavedHashRef.current, data)) {
      return // Pas de changement, pas de sauvegarde
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    // Set new timeout (2 secondes par défaut)
    timeoutRef.current = window.setTimeout(async () => {
      // Vérifier une dernière fois si les données ont changé
      const currentHash = quickHash(data)
      if (lastSavedHashRef.current === currentHash) {
        return
      }

      setIsSaving(true)
      
      try {
        // Utiliser la fonction onSave stockée dans une ref pour éviter les problèmes de dépendances
        await onSaveRef.current(data)
        lastSavedHashRef.current = currentHash
        setLastSaved(new Date())
      } catch (error: any) {
        // Ignorer silencieusement les erreurs de requêtes annulées ou les 403 pour /system-settings/
        // Ces erreurs sont gérées par l'intercepteur Axios et ne doivent pas être loggées
        if (error?.__shouldRejectSilently || error?.__isCancelled) {
          // Requête bloquée silencieusement, ignorer
          return
        }
        // Ne logger que les erreurs non silencieuses
        if (!error?.silent && !error?.config?.__shouldRejectSilently) {
          console.error('Error sauvegarde automatique:', error)
        }
      } finally {
        setIsSaving(false)
      }
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [data, enabled, debounceMs]) // onSave retiré des dépendances pour éviter les re-renders infinis

  // Fonction pour mettre à jour manuellement le timestamp après une sauvegarde manuelle
  const updateLastSaved = () => {
    lastSavedHashRef.current = quickHash(data)
    setLastSaved(new Date())
  }

  return { isSaving, lastSaved, updateLastSaved }
}

