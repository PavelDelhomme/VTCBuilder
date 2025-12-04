/**
 * Composants de configuration pour les blocs VTC et E-commerce
 */

import React from 'react'
import { Block } from './types'

// Driver Profile (Profil Chauffeur)
export function DriverProfileConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nom du chauffeur
        </label>
        <input
          type="text"
          value={safeBlock.data.name || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, name: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Jean Dupont"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Photo (URL)
        </label>
        <input
          type="text"
          value={safeBlock.data.photo_url || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, photo_url: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Note (0-5)
        </label>
        <input
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={safeBlock.data.rating || 5}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, rating: parseFloat(e.target.value) } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre d'avis
        </label>
        <input
          type="number"
          min="0"
          value={safeBlock.data.reviews_count || 0}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, reviews_count: parseInt(e.target.value) } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={safeBlock.data.description || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, description: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          rows={3}
          placeholder="Description du chauffeur..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Années d'expérience
        </label>
        <input
          type="number"
          min="0"
          value={safeBlock.data.experience_years || 0}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, experience_years: parseInt(e.target.value) } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
    </div>
  )
}

// Email Button (Bouton Email)
export function EmailButtonConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Adresse email
        </label>
        <input
          type="email"
          value={safeBlock.data.email || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, email: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="contact@example.com"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte du bouton
        </label>
        <input
          type="text"
          value={safeBlock.data.button_text || 'Envoyer un email'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_text: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Sujet par défaut
        </label>
        <input
          type="text"
          value={safeBlock.data.subject || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, subject: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Demande de contact"
        />
      </div>
    </div>
  )
}

// SMS Button (Bouton SMS)
export function SMSButtonConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Numéro de téléphone
        </label>
        <input
          type="tel"
          value={safeBlock.data.phone || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, phone: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="+33612345678"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte du bouton
        </label>
        <input
          type="text"
          value={safeBlock.data.button_text || 'Envoyer un SMS'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_text: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Message par défaut
        </label>
        <textarea
          value={safeBlock.data.default_message || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, default_message: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          rows={2}
          placeholder="Bonjour, je souhaite..."
        />
      </div>
    </div>
  )
}

// Product Gallery (Galerie Produit)
export function ProductGalleryConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const images = safeBlock.data.images || []
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Images (URLs, une par ligne)
        </label>
        <textarea
          value={images.join('\n')}
          onChange={(e) => {
            const imageUrls = e.target.value.split('\n').filter(url => url.trim())
            onUpdate({ data: { ...safeBlock.data, images: imageUrls } })
          }}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
          rows={5}
          placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Mode d'affichage
        </label>
        <select
          value={safeBlock.data.display_mode || 'grid'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, display_mode: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="grid">Grille</option>
          <option value="slider">Slider</option>
          <option value="lightbox">Lightbox</option>
        </select>
      </div>
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={safeBlock.data.show_thumbnails !== false}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_thumbnails: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">Afficher les miniatures</span>
        </label>
      </div>
    </div>
  )
}

// Product Details (Détails Produit)
export function ProductDetailsConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nom du produit
        </label>
        <input
          type="text"
          value={safeBlock.data.name || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, name: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Nom du produit"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Prix
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={safeBlock.data.price || 0}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, price: parseFloat(e.target.value) } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Devise
        </label>
        <input
          type="text"
          value={safeBlock.data.currency || 'EUR'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, currency: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="EUR"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={safeBlock.data.description || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, description: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          rows={4}
          placeholder="Description du produit..."
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Stock disponible
        </label>
        <input
          type="number"
          min="0"
          value={safeBlock.data.stock || 0}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, stock: parseInt(e.target.value) } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={safeBlock.data.in_stock === true}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, in_stock: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">En stock</span>
        </label>
      </div>
    </div>
  )
}

// Add to Cart (Ajouter au Panier)
export function AddToCartConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte du bouton
        </label>
        <input
          type="text"
          value={safeBlock.data.button_text || 'Ajouter au panier'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_text: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          ID Produit
        </label>
        <input
          type="text"
          value={safeBlock.data.product_id || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, product_id: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="product-123"
        />
      </div>
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={safeBlock.data.show_quantity === true}
            onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_quantity: e.target.checked } })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700 dark:text-gray-300">Afficher sélecteur de quantité</span>
        </label>
      </div>
    </div>
  )
}

// Buy Now (Acheter Maintenant)
export function BuyNowConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Texte du bouton
        </label>
        <input
          type="text"
          value={safeBlock.data.button_text || 'Acheter maintenant'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, button_text: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          ID Produit
        </label>
        <input
          type="text"
          value={safeBlock.data.product_id || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, product_id: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="product-123"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL de redirection
        </label>
        <input
          type="text"
          value={safeBlock.data.checkout_url || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, checkout_url: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="/checkout"
        />
      </div>
    </div>
  )
}

// Vehicle Comparison (Comparaison Véhicules)
export function VehicleComparisonConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const vehicles = safeBlock.data.vehicles || []
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Comparaison des véhicules"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre de véhicules à comparer
        </label>
        <input
          type="number"
          min="2"
          max="5"
          value={vehicles.length || 2}
          onChange={(e) => {
            const count = parseInt(e.target.value) || 2
            const newVehicles = Array(count).fill(null).map((_, i) => vehicles[i] || {
              name: `Véhicule ${i + 1}`,
              seats: 4,
              price: 0,
              features: []
            })
            onUpdate({ data: { ...safeBlock.data, vehicles: newVehicles } })
          }}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        💡 Configurez les détails de chaque véhicule dans l'aperçu
      </div>
    </div>
  )
}

// Service Packages (Forfaits Service)
export function ServicePackagesConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const packages = safeBlock.data.packages || []
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          placeholder="Nos forfaits"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre de forfaits
        </label>
        <input
          type="number"
          min="1"
          max="6"
          value={packages.length || 3}
          onChange={(e) => {
            const count = parseInt(e.target.value) || 3
            const newPackages = Array(count).fill(null).map((_, i) => packages[i] || {
              name: `Forfait ${i + 1}`,
              price: 0,
              features: []
            })
            onUpdate({ data: { ...safeBlock.data, packages: newPackages } })
          }}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        💡 Configurez les détails de chaque forfait dans l'aperçu
      </div>
    </div>
  )
}

// Trust Badges (Badges de Confiance)
export function TrustBadgesConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const badges = safeBlock.data.badges || []
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Badges (un par ligne: texte|icône)
        </label>
        <textarea
          value={badges.map((b: any) => `${b.text || ''}|${b.icon || '✅'}`).join('\n')}
          onChange={(e) => {
            const lines = e.target.value.split('\n').filter(line => line.trim())
            const newBadges = lines.map(line => {
              const [text, icon] = line.split('|')
              return { text: text?.trim() || '', icon: icon?.trim() || '✅' }
            })
            onUpdate({ data: { ...safeBlock.data, badges: newBadges } })
          }}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
          rows={5}
          placeholder="Paiement sécurisé|🔒&#10;Livraison rapide|🚚&#10;Garantie qualité|⭐"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Disposition
        </label>
        <select
          value={safeBlock.data.layout || 'horizontal'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, layout: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        >
          <option value="horizontal">Horizontal</option>
          <option value="vertical">Vertical</option>
          <option value="grid">Grille</option>
        </select>
      </div>
    </div>
  )
}

// Payment Methods (Méthodes de Paiement)
export function PaymentMethodsConfig({ block, onUpdate }: { block: Block; onUpdate: (updates: Partial<Block>) => void }) {
  const safeBlock = { ...block, data: block.data || {} }
  const methods = safeBlock.data.methods || []
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Méthodes acceptées (une par ligne: nom|icône)
        </label>
        <textarea
          value={methods.map((m: any) => `${m.name || ''}|${m.icon || '💳'}`).join('\n')}
          onChange={(e) => {
            const lines = e.target.value.split('\n').filter(line => line.trim())
            const newMethods = lines.map(line => {
              const [name, icon] = line.split('|')
              return { name: name?.trim() || '', icon: icon?.trim() || '💳' }
            })
            onUpdate({ data: { ...safeBlock.data, methods: newMethods } })
          }}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-mono"
          rows={5}
          placeholder="Carte bancaire|💳&#10;PayPal|💼&#10;Espèces|💵"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre
        </label>
        <input
          type="text"
          value={safeBlock.data.title || 'Méthodes de paiement acceptées'}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        />
      </div>
    </div>
  )
}

