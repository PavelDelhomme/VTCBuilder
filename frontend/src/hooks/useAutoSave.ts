import { useEffect, useRef, useState } from 'react'

interface UseAutoSaveOptions {
  data: any
  onSave: (data: any) => Promise<void>
  debounceMs?: number
  enabled?: boolean
}

/**
 * Hook pour sauvegarde automatique avec détection de modifications réelles
 * Ne sauvegarde que si les données ont vraiment changé
 */
export function useAutoSave({ data, onSave, debounceMs = 2000, enabled = true }: UseAutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const lastSavedDataRef = useRef<any>(null)
  const timeoutRef = useRef<number | null>(null)
  const isInitialMount = useRef(true)

  // Fonction pour comparer deux objets (comparaison profonde simplifiée)
  const hasDataChanged = (oldData: any, newData: any): boolean => {
    if (oldData === null || oldData === undefined) return true
    return JSON.stringify(oldData) !== JSON.stringify(newData)
  }

  useEffect(() => {
    // Ignorer le premier rendu (montage initial)
    if (isInitialMount.current) {
      isInitialMount.current = false
      lastSavedDataRef.current = data
      return
    }

    if (!enabled || !data) return

    // Vérifier si les données ont vraiment changé
    if (!hasDataChanged(lastSavedDataRef.current, data)) {
      return // Pas de changement, pas de sauvegarde
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    // Set new timeout (2 secondes par défaut)
    timeoutRef.current = window.setTimeout(async () => {
      // Vérifier une dernière fois si les données ont changé
      if (!hasDataChanged(lastSavedDataRef.current, data)) {
        return
      }

      setIsSaving(true)
      
      try {
        // Utiliser la fonction onSave stockée dans une ref pour éviter les problèmes de dépendances
        await onSaveRef.current(data)
        lastSavedDataRef.current = data
        setLastSaved(new Date())
      } catch (error) {
        console.error('Erreur sauvegarde automatique:', error)
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
    lastSavedDataRef.current = data
    setLastSaved(new Date())
  }

  return { isSaving, lastSaved, updateLastSaved }
}

