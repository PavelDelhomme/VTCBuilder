// Index centralisé pour tous les cases de prévisualisation
import { PreviewCaseProps } from './types'
import React from 'react'

// Import des différents fichiers de cases
import { basicCases } from './basic'
// TODO: Importer les autres fichiers au fur et à mesure
// import { layoutCases } from './layout'
// import { formsCases } from './forms'
// import { vtcCases } from './vtc'
// import { complexCases } from './complex'
// import { interactiveCases } from './interactive'
// import { mediaCases } from './media'
// import { dataCases } from './data'
// import { contentCases } from './content'
// import { ecommerceCases } from './ecommerce'
// import { miscCases } from './misc'

// Fonction principale pour obtenir le renderer d'un bloc
export function getBlockPreviewCase(blockType: string): ((props: PreviewCaseProps) => React.ReactElement | null) | null {
  // Combiner tous les cases
  const allCases: Record<string, (props: PreviewCaseProps) => React.ReactElement | null> = {
    ...basicCases,
    // ...layoutCases,
    // ...formsCases,
    // ...vtcCases,
    // ...complexCases,
    // ...interactiveCases,
    // ...mediaCases,
    // ...dataCases,
    // ...contentCases,
    // ...ecommerceCases,
    // ...miscCases,
  }
  
  return allCases[blockType] || null
}

// Export de tous les cases pour utilisation directe si nécessaire
export { basicCases }
// export { layoutCases }
// export { formsCases }
// export { vtcCases }
// export { complexCases }
// export { interactiveCases }
// export { mediaCases }
// export { dataCases }
// export { contentCases }
// export { ecommerceCases }
// export { miscCases }

