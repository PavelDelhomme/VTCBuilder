/**
 * Utilitaires pour optimiser la mémoire
 */

/**
 * Comparaison légère de deux objets (sans JSON.stringify)
 * Beaucoup plus rapide et moins gourmand en mémoire
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true
  if (obj1 == null || obj2 == null) return false
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2
  
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  
  if (keys1.length !== keys2.length) return false
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false
    if (obj1[key] !== obj2[key]) {
      // Comparaison récursive pour les objets imbriqués (limité à 2 niveaux)
      if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object' && obj1[key] !== null && obj2[key] !== null) {
        if (!shallowEqual(obj1[key], obj2[key])) return false
      } else {
        return false
      }
    }
  }
  
  return true
}

/**
 * Comparaison profonde optimisée (limite la profondeur pour éviter les stack overflows)
 */
export function deepEqual(obj1: any, obj2: any, maxDepth: number = 5, currentDepth: number = 0): boolean {
  if (currentDepth > maxDepth) return obj1 === obj2 // Limite de profondeur atteinte
  
  if (obj1 === obj2) return true
  if (obj1 == null || obj2 == null) return false
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2
  
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  
  if (keys1.length !== keys2.length) return false
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false
    
    const val1 = obj1[key]
    const val2 = obj2[key]
    
    if (typeof val1 === 'object' && typeof val2 === 'object' && val1 !== null && val2 !== null) {
      if (!deepEqual(val1, val2, maxDepth, currentDepth + 1)) return false
    } else if (val1 !== val2) {
      return false
    }
  }
  
  return true
}

/**
 * Hash simple pour comparer rapidement de gros objets
 * Utilise une fonction de hash rapide au lieu de JSON.stringify
 */
export function quickHash(obj: any): string {
  if (obj === null || obj === undefined) return 'null'
  if (typeof obj !== 'object') return String(obj)
  
  // Pour les tableaux et objets, créer un hash basé sur les clés et valeurs
  const keys = Object.keys(obj).sort()
  const hashParts: string[] = []
  
  for (const key of keys) {
    const value = obj[key]
    if (value === null || value === undefined) {
      hashParts.push(`${key}:null`)
    } else if (typeof value === 'object') {
      // Limiter la profondeur pour éviter les problèmes de mémoire
      hashParts.push(`${key}:${quickHash(value)}`)
    } else {
      hashParts.push(`${key}:${String(value)}`)
    }
  }
  
  return hashParts.join('|')
}

/**
 * Compression simple d'un objet (supprime les valeurs undefined/null optionnellement)
 */
export function compressObject<T>(obj: T, removeUndefined: boolean = true, removeNull: boolean = false): T {
  if (typeof obj !== 'object' || obj === null) return obj
  
  if (Array.isArray(obj)) {
    return obj.map(item => compressObject(item, removeUndefined, removeNull)) as T
  }
  
  const compressed: any = {}
  for (const [key, value] of Object.entries(obj)) {
    if (removeUndefined && value === undefined) continue
    if (removeNull && value === null) continue
    
    if (typeof value === 'object' && value !== null) {
      compressed[key] = compressObject(value, removeUndefined, removeNull)
    } else {
      compressed[key] = value
    }
  }
  
  return compressed as T
}

/**
 * Estime la taille en mémoire d'un objet (approximatif)
 */
export function estimateMemorySize(obj: any): number {
  if (obj === null || obj === undefined) return 0
  if (typeof obj === 'string') return obj.length * 2 // 2 bytes par caractère UTF-16
  if (typeof obj === 'number') return 8 // 8 bytes pour un nombre
  if (typeof obj === 'boolean') return 4 // 4 bytes pour un booléen
  
  if (Array.isArray(obj)) {
    return obj.reduce((size, item) => size + estimateMemorySize(item), 0) + (obj.length * 8) // Overhead du tableau
  }
  
  if (typeof obj === 'object') {
    let size = 0
    for (const [key, value] of Object.entries(obj)) {
      size += key.length * 2 // Taille de la clé
      size += estimateMemorySize(value)
    }
    return size + (Object.keys(obj).length * 8) // Overhead de l'objet
  }
  
  return 0
}


