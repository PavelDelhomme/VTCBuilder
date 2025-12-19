/**
 * Index file pour les renderers complexes
 * Réexporte les fonctions depuis ComplexRenderers.tsx et preview.tsx
 */

// Réexporter depuis ComplexRenderers.tsx (pour l'éditeur)
export * from './ComplexRenderers'
export { renderFAQ } from './ComplexRenderers'

// Réexporter les fonctions de preview depuis preview.tsx (pour BlockPreview)
export { renderHero, renderFeaturesGrid } from './preview'
export { renderCTASection } from './cta-section'
export { renderContactForm } from './contact-form'

