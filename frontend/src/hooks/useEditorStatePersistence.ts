import { useEffect, useCallback, useRef } from 'react'

interface EditorState {
  blocks?: any[]
  title?: string
  metaTitle?: string
  metaDescription?: string
  status?: string
  content?: string
  [key: string]: any
}

const EDITOR_STATE_KEY = 'vtcbuilder_editor_state'
const EDITOR_PATH_KEY = 'vtcbuilder_editor_path'

/**
 * Hook pour sauvegarder et restaurer l'état de l'éditeur
 * Utile pour préserver les modifications non sauvegardées lors d'une reconnexion
 */
export function useEditorStatePersistence(
  currentPath: string | null,
  state: EditorState,
  onRestore?: (state: EditorState) => void
) {
  const isEditorPage = useRef(
    currentPath?.includes('/edit') || 
    currentPath?.includes('/edit-visual') ||
    currentPath?.includes('/pages-public')
  )

  // Sauvegarder l'état dans localStorage
  const saveState = useCallback((editorState: EditorState) => {
    if (!isEditorPage.current || typeof window === 'undefined') return
    
    try {
      localStorage.setItem(EDITOR_STATE_KEY, JSON.stringify(editorState))
      if (currentPath) {
        localStorage.setItem(EDITOR_PATH_KEY, currentPath)
      }
    } catch (error) {
      console.warn('Error sauvegarde état éditeur:', error)
    }
  }, [currentPath])

  // Restaurer l'état depuis localStorage
  const restoreState = useCallback((): EditorState | null => {
    if (!isEditorPage.current || typeof window === 'undefined') return null
    
    try {
      const savedPath = localStorage.getItem(EDITOR_PATH_KEY)
      const savedState = localStorage.getItem(EDITOR_STATE_KEY)
      
      // Ne restaurer que si on est sur la même page
      if (savedPath === currentPath && savedState) {
        const state = JSON.parse(savedState)
        // Nettoyer après restauration
        localStorage.removeItem(EDITOR_STATE_KEY)
        localStorage.removeItem(EDITOR_PATH_KEY)
        return state
      }
    } catch (error) {
      console.warn('Error restauration état éditeur:', error)
    }
    
    return null
  }, [currentPath])

  // Sauvegarder l'état à chaque changement
  useEffect(() => {
    if (isEditorPage.current && state) {
      saveState(state)
    }
  }, [state, saveState])

  // Restaurer l'état au montage si disponible
  useEffect(() => {
    if (isEditorPage.current && onRestore) {
      const restored = restoreState()
      if (restored) {
        onRestore(restored)
      }
    }
  }, []) // Seulement au montage

  // Nettoyer lors du démontage si on quitte la page
  useEffect(() => {
    return () => {
      // Ne pas nettoyer ici, on veut garder l'état pour la reconnexion
      // Il sera nettoyé après restauration réussie
    }
  }, [])

  return { saveState, restoreState }
}

/**
 * Fonction utilitaire pour sauvegarder l'état avant de montrer le modal de reconnexion
 */
export function saveEditorStateBeforeReconnect(path: string, state: EditorState) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(EDITOR_STATE_KEY, JSON.stringify(state))
    localStorage.setItem(EDITOR_PATH_KEY, path)
  } catch (error) {
    console.warn('Error sauvegarde état éditeur:', error)
  }
}

/**
 * Fonction utilitaire pour restaurer l'état après reconnexion
 */
export function restoreEditorStateAfterReconnect(path: string): EditorState | null {
  if (typeof window === 'undefined') return null
  
  try {
    const savedPath = localStorage.getItem(EDITOR_PATH_KEY)
    const savedState = localStorage.getItem(EDITOR_STATE_KEY)
    
    if (savedPath === path && savedState) {
      const state = JSON.parse(savedState)
      // Nettoyer après restauration
      localStorage.removeItem(EDITOR_STATE_KEY)
      localStorage.removeItem(EDITOR_PATH_KEY)
      return state
    }
  } catch (error) {
    console.warn('Error restauration état éditeur:', error)
  }
  
  return null
}

