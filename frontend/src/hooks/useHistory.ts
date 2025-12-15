import { useState, useCallback, useRef } from 'react'
import { compressObject, quickHash } from '@/lib/memory-utils'

interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

// Réduire la taille par défaut de l'historique pour économiser la mémoire
export function useHistory<T>(initialState: T, maxHistorySize: number = 20, debounceMs: number = 300) {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  })

  const canUndo = state.past.length > 0
  const canRedo = state.future.length > 0

  // Ref pour stocker le timeout du debounce
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  // Ref pour stocker l'état en attente d'être ajouté à l'historique
  const pendingStateRef = useRef<T | null>(null)

  const set = useCallback((newState: T, addToHistory: boolean = true) => {
    if (addToHistory) {
      // Stocker l'état en attente
      pendingStateRef.current = newState
      
      // Annuler le timeout précédent s'il existe
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      
      // Créer un nouveau timeout pour ajouter à l'historique après le délai
      debounceTimeoutRef.current = setTimeout(() => {
        const stateToAdd = pendingStateRef.current
        if (stateToAdd !== null) {
          setState((current) => {
            // Compresser l'état actuel avant de l'ajouter à l'historique
            const compressedPresent = compressObject(current.present, true, false)
            const newPast = [...current.past, compressedPresent]
            // Limiter la taille de l'historique
            const trimmedPast = newPast.slice(-maxHistorySize)
            
            // Compresser aussi le nouvel état
            const compressedNewState = compressObject(stateToAdd, true, false)
            
            return {
              past: trimmedPast,
              present: compressedNewState,
              future: [], // Effacer le futur quand on fait une nouvelle action
            }
          })
          pendingStateRef.current = null
        }
      }, debounceMs)
      
      // Mettre à jour l'état présent immédiatement (sans historique) pour que l'UI réagisse
      const compressedNewState = compressObject(newState, true, false)
      setState((current) => ({
        ...current,
        present: compressedNewState,
      }))
    } else {
      // Compresser même les mises à jour sans historique
      const compressedNewState = compressObject(newState, true, false)
      setState((current) => ({
        ...current,
        present: compressedNewState,
      }))
    }
  }, [maxHistorySize, debounceMs])

  const undo = useCallback(() => {
    // Annuler le debounce en cours si on fait undo
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
      debounceTimeoutRef.current = null
      pendingStateRef.current = null
    }
    
    setState((current) => {
      if (current.past.length === 0) {
        return current
      }

      const previous = current.past[current.past.length - 1]
      const newPast = current.past.slice(0, -1)

      return {
        past: newPast,
        present: previous,
        future: [current.present, ...current.future],
      }
    })
  }, [])

  const redo = useCallback(() => {
    // Annuler le debounce en cours si on fait redo
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
      debounceTimeoutRef.current = null
      pendingStateRef.current = null
    }
    
    setState((current) => {
      if (current.future.length === 0) {
        return current
      }

      const next = current.future[0]
      const newFuture = current.future.slice(1)

      return {
        past: [...current.past, current.present],
        present: next,
        future: newFuture,
      }
    })
  }, [])

  const reset = useCallback((newState: T) => {
    setState({
      past: [],
      present: newState,
      future: [],
    })
  }, [])

  return {
    state: state.present,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  }
}

