import { useState, useCallback, useRef } from 'react'
import { compressObject, quickHash } from '@/lib/memory-utils'

interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

// Réduire la taille par défaut de l'historique pour économiser la mémoire
export function useHistory<T>(initialState: T, maxHistorySize: number = 20) {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  })

  const canUndo = state.past.length > 0
  const canRedo = state.future.length > 0

  const set = useCallback((newState: T, addToHistory: boolean = true) => {
    if (addToHistory) {
      setState((current) => {
        // Compresser l'état actuel avant de l'ajouter à l'historique
        const compressedPresent = compressObject(current.present, true, false)
        const newPast = [...current.past, compressedPresent]
        // Limiter la taille de l'historique
        const trimmedPast = newPast.slice(-maxHistorySize)
        
        // Compresser aussi le nouvel état
        const compressedNewState = compressObject(newState, true, false)
        
        return {
          past: trimmedPast,
          present: compressedNewState,
          future: [], // Effacer le futur quand on fait une nouvelle action
        }
      })
    } else {
      // Compresser même les mises à jour sans historique
      const compressedNewState = compressObject(newState, true, false)
      setState((current) => ({
        ...current,
        present: compressedNewState,
      }))
    }
  }, [maxHistorySize])

  const undo = useCallback(() => {
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

