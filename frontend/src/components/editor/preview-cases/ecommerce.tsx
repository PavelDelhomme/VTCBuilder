import React from 'react'
import { PreviewCaseProps } from './types'

// Blocs E-commerce : product-gallery, product-details, add-to-cart, buy-now, trust-badges, payment-methods

export function renderProductGallery(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const productImages = block.data?.images || []
  const displayMode = block.data?.display_mode || 'grid'
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      {productImages.length > 0 ? (
        displayMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {productImages.map((img: string, index: number) => (
              <img
                key={index}
                src={img}
                alt={`Produit ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
              />
            ))}
          </div>
        ) : (
          <div className="relative">
            <img
              src={productImages[0]}
              alt="Produit"
              className="w-full h-64 object-cover rounded-lg"
            />
            {block.data?.show_thumbnails && productImages.length > 1 && (
              <div className="mt-4 flex gap-2">
                {productImages.slice(1, 5).map((img: string, index: number) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Miniature ${index + 1}`}
                    className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-75"
                  />
                ))}
              </div>
            )}
          </div>
        )
      ) : (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>Aucune image</div>
      )}
    </div>
  )
}

export function renderProductDetails(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
          {block.data?.name || 'Nom du produit'}
        </h2>
        <div className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'} mb-4`}>
          {block.data?.price || 0} {block.data?.currency || 'EUR'}
        </div>
        {block.data?.description && (
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>{block.data.description}</p>
        )}
        <div className="flex items-center gap-4">
          {block.data?.in_stock ? (
            <span className={`px-3 py-1 ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'} rounded-full text-sm font-medium`}>
              En stock ({block.data?.stock || 0} disponibles)
            </span>
          ) : (
            <span className={`px-3 py-1 ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'} rounded-full text-sm font-medium`}>
              Rupture de stock
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function renderAddToCart(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      <div className="flex items-center gap-4">
        {block.data?.show_quantity && (
          <div className="flex items-center gap-2">
            <button className={`px-3 py-2 border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'} rounded-lg`}>-</button>
            <input
              type="number"
              min="1"
              defaultValue="1"
              className={`w-16 px-2 py-2 text-center border ${isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}`}
            />
            <button className={`px-3 py-2 border ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'} rounded-lg`}>+</button>
          </div>
        )}
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {block.data?.button_text || 'Ajouter au panier'}
        </button>
      </div>
    </div>
  )
}

export function renderBuyNow(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  return (
    <div style={wrapperStyles} className="mb-6">
      <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        {block.data?.button_text || 'Acheter maintenant'}
      </button>
    </div>
  )
}

export function renderTrustBadges(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const trustBadges = block.data?.badges || []
  const layout = block.data?.layout || 'horizontal'
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      {trustBadges.length > 0 ? (
        <div className={`flex ${layout === 'vertical' ? 'flex-col' : layout === 'grid' ? 'flex-wrap' : 'flex-row'} gap-4`}>
          {trustBadges.map((badge: any, index: number) => (
            <div key={index} className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
              <span className="text-xl">{badge.icon || '✅'}</span>
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{badge.text || ''}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>Aucun badge configuré</div>
      )}
    </div>
  )
}

export function renderPaymentMethods(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const methods = block.data?.methods || []
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data?.title && (
        <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
          {block.data.title}
        </h3>
      )}
      {methods.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {methods.map((method: any, index: number) => (
            <div key={index} className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'} rounded-lg`}>
              <span className="text-xl">{method.icon || '💳'}</span>
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{method.name || ''}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>No method configured</div>
      )}
    </div>
  )
}

// Export map
export const ecommerceCases: Record<string, (props: PreviewCaseProps) => React.ReactElement | null> = {
  'product-gallery': renderProductGallery,
  'product-details': renderProductDetails,
  'add-to-cart': renderAddToCart,
  'buy-now': renderBuyNow,
  'trust-badges': renderTrustBadges,
  'payment-methods': renderPaymentMethods,
}

