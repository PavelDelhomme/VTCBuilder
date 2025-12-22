// Index centralisé pour tous les cases de prévisualisation
import { PreviewCaseProps } from './types'
import React from 'react'

// Import des différents fichiers de cases
import { basicCases } from './basic'
import { layoutCases } from './layout'
import { formsCases } from './forms'
import { dataCases } from './data'
import { contentCases } from './content'
import { miscCases } from './misc'
import { interactiveCases } from './interactive'
import { mediaCases } from './media'
import { complexCases } from './complex'
import { vtcCases } from './vtc'
import { ecommerceCases } from './ecommerce'

// Fonction principale pour obtenir le renderer d'un bloc
export function getBlockPreviewCase(blockType: string): ((props: PreviewCaseProps) => React.ReactElement | null) | null {
  // Combiner tous les cases
  const allCases: Record<string, (props: PreviewCaseProps) => React.ReactElement | null> = {
    ...basicCases,
    ...layoutCases,
    ...formsCases,
    ...dataCases,
    ...contentCases,
    ...miscCases,
    ...interactiveCases,
    ...mediaCases,
    ...complexCases,
    ...vtcCases,
    ...ecommerceCases,
  }
  
  return allCases[blockType] || null
}

// Export de tous les cases pour utilisation directe si nécessaire
export { basicCases }
export { layoutCases }
export { formsCases }
export { dataCases }
export { contentCases }
export { miscCases }
export { interactiveCases }
export { mediaCases }
export { complexCases }
export { vtcCases }
export { ecommerceCases }

