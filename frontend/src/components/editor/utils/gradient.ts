/**
 * Utilitaires pour la conversion de gradients Tailwind en CSS
 */

/**
 * Convertit un gradient Tailwind (ex: "from-blue-500 via-purple-600 to-pink-500") en CSS linear-gradient
 * @param gradient - La chaîne de gradient Tailwind
 * @returns La chaîne CSS linear-gradient correspondante
 */
export function getGradientFromTailwind(gradient: string): string {
  if (!gradient) return 'linear-gradient(to right, #2563eb, #9333ea)'
  
  const fromMatch = gradient.match(/from-(\w+)-(\d+)/)
  const viaMatch = gradient.match(/via-(\w+)-(\d+)/)
  const toMatch = gradient.match(/to-(\w+)-(\d+)/)
  
  const colorMap: Record<string, Record<string, string>> = {
    blue: { '600': '#2563eb', '500': '#3b82f6' },
    purple: { '600': '#9333ea', '500': '#a855f7' },
    pink: { '500': '#ec4899', '600': '#db2777' },
  }
  
  const fromColor = fromMatch ? (colorMap[fromMatch[1]]?.[fromMatch[2]] || '#2563eb') : '#2563eb'
  const viaColor = viaMatch ? (colorMap[viaMatch[1]]?.[viaMatch[2]] || '#9333ea') : null
  const toColor = toMatch ? (colorMap[toMatch[1]]?.[toMatch[2]] || '#9333ea') : '#9333ea'
  
  if (viaColor) {
    return `linear-gradient(to right, ${fromColor} 0%, ${viaColor} 50%, ${toColor} 100%)`
  }
  return `linear-gradient(to right, ${fromColor} 0%, ${toColor} 100%)`
}

/**
 * Alias pour compatibilité avec l'ancien code
 * @deprecated Utilisez getGradientFromTailwind à la place
 */
export const getGradientFromTailwindCTA = getGradientFromTailwind

