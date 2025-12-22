import React from 'react'
import { PreviewCaseProps } from './types'

// Blocs VTC : booking-form, pricing-table, service-zones, vehicle-gallery, contact-buttons, map, 
// route-calculator, fare-calculator, availability-calendar, driver-profile, email-button, sms-button, 
// vehicle-comparison, service-packages

// Les cases suivants utilisent des fonctions depuis './renderers/vtc'
let renderBookingForm: ((props: PreviewCaseProps) => React.ReactElement | null) | null = null
let renderPricingTable: ((props: PreviewCaseProps) => React.ReactElement | null) | null = null
let renderServiceZones: ((props: PreviewCaseProps) => React.ReactElement | null) | null = null
let renderVehicleGallery: ((props: PreviewCaseProps) => React.ReactElement | null) | null = null
let renderContactButtons: ((props: PreviewCaseProps) => React.ReactElement | null) | null = null
let renderMap: ((props: PreviewCaseProps) => React.ReactElement | null) | null = null
let renderFareCalculator: ((props: PreviewCaseProps) => React.ReactElement | null) | null = null
let renderAvailabilityCalendar: ((props: PreviewCaseProps) => React.ReactElement | null) | null = null

try {
  const vtcRenderers = require('./renderers/vtc')
  renderBookingForm = vtcRenderers.renderBookingForm || null
  renderPricingTable = vtcRenderers.renderPricingTable || null
  renderServiceZones = vtcRenderers.renderServiceZones || null
  renderVehicleGallery = vtcRenderers.renderVehicleGallery || null
  renderContactButtons = vtcRenderers.renderContactButtons || null
  renderMap = vtcRenderers.renderMap || null
  renderFareCalculator = vtcRenderers.renderFareCalculator || null
  renderAvailabilityCalendar = vtcRenderers.renderAvailabilityCalendar || null
} catch (e) {
  // Les renderers n'existent pas encore
}

export function renderBookingFormBase(props: PreviewCaseProps): React.ReactElement | null {
  if (renderBookingForm) {
    return renderBookingForm(props)
  }
  return (
    <div style={props.wrapperStyles} className="mb-6 p-6 border-2 border-dashed rounded">
      <p className="text-gray-500">Booking form renderer not available</p>
    </div>
  )
}

export function renderPricingTableBase(props: PreviewCaseProps): React.ReactElement | null {
  if (renderPricingTable) {
    return renderPricingTable(props)
  }
  return (
    <div style={props.wrapperStyles} className="mb-6 p-6 border-2 border-dashed rounded">
      <p className="text-gray-500">Pricing table renderer not available</p>
    </div>
  )
}

export function renderServiceZonesBase(props: PreviewCaseProps): React.ReactElement | null {
  if (renderServiceZones) {
    return renderServiceZones(props)
  }
  return (
    <div style={props.wrapperStyles} className="mb-6 p-6 border-2 border-dashed rounded">
      <p className="text-gray-500">Service zones renderer not available</p>
    </div>
  )
}

export function renderVehicleGalleryBase(props: PreviewCaseProps): React.ReactElement | null {
  if (renderVehicleGallery) {
    return renderVehicleGallery(props)
  }
  return (
    <div style={props.wrapperStyles} className="mb-6 p-6 border-2 border-dashed rounded">
      <p className="text-gray-500">Vehicle gallery renderer not available</p>
    </div>
  )
}

export function renderContactButtonsBase(props: PreviewCaseProps): React.ReactElement | null {
  if (renderContactButtons) {
    return renderContactButtons(props)
  }
  return (
    <div style={props.wrapperStyles} className="mb-6 p-6 border-2 border-dashed rounded">
      <p className="text-gray-500">Contact buttons renderer not available</p>
    </div>
  )
}

export function renderMapBase(props: PreviewCaseProps): React.ReactElement | null {
  if (renderMap) {
    return renderMap(props)
  }
  return (
    <div style={props.wrapperStyles} className="mb-6 p-6 border-2 border-dashed rounded">
      <p className="text-gray-500">Map renderer not available</p>
    </div>
  )
}

export function renderRouteCalculator(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data?.title && (
        <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
          {block.data.title}
        </h2>
      )}
      {block.data?.description && (
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
          {block.data.description}
        </p>
      )}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Point de départ
            </label>
            <input
              type="text"
              className={`w-full px-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-900'} rounded-lg`}
              placeholder="Adresse de départ"
              readOnly
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Point d'arrivée
            </label>
            <input
              type="text"
              className={`w-full px-4 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-900'} rounded-lg`}
              placeholder="Adresse de destination"
              readOnly
            />
          </div>
          <button
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            disabled
          >
            Calculer l'itinéraire
          </button>
          {block.data?.show_map !== false && (
            <div className={`mt-4 h-64 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg flex items-center justify-center`}>
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Carte (nécessite une clé API)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function renderFareCalculatorBase(props: PreviewCaseProps): React.ReactElement | null {
  if (renderFareCalculator) {
    return renderFareCalculator(props)
  }
  return (
    <div style={props.wrapperStyles} className="mb-6 p-6 border-2 border-dashed rounded">
      <p className="text-gray-500">Fare calculator renderer not available</p>
    </div>
  )
}

export function renderAvailabilityCalendarBase(props: PreviewCaseProps): React.ReactElement | null {
  if (renderAvailabilityCalendar) {
    return renderAvailabilityCalendar(props)
  }
  return (
    <div style={props.wrapperStyles} className="mb-6 p-6 border-2 border-dashed rounded">
      <p className="text-gray-500">Availability calendar renderer not available</p>
    </div>
  )
}

export function renderDriverProfile(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-start gap-4">
          {block.data?.photo_url && (
            <img
              src={block.data.photo_url}
              alt={block.data.name || 'Chauffeur'}
              className="w-20 h-20 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <h3 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-1`}>
              {block.data?.name || 'Nom du chauffeur'}
            </h3>
            {block.data?.rating && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-500">⭐</span>
                <span className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{block.data.rating}</span>
                {block.data?.reviews_count && (
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    ({block.data.reviews_count} avis)
                  </span>
                )}
              </div>
            )}
            {block.data?.description && (
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>{block.data.description}</p>
            )}
            {block.data?.experience_years && (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {block.data.experience_years} ans d'expérience
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function renderEmailButton(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  return (
    <div style={wrapperStyles} className="mb-6">
      <a
        href={`mailto:${block.data?.email || ''}${block.data?.subject ? `?subject=${encodeURIComponent(block.data.subject)}` : ''}`}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        {block.data?.button_text || 'Envoyer un email'}
      </a>
    </div>
  )
}

export function renderSMSButton(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  return (
    <div style={wrapperStyles} className="mb-6">
      <a
        href={`sms:${block.data?.phone || ''}${block.data?.default_message ? `?body=${encodeURIComponent(block.data.default_message)}` : ''}`}
        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {block.data?.button_text || 'Envoyer un SMS'}
      </a>
    </div>
  )
}

export function renderVehicleComparison(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const comparisonVehicles = block.data?.vehicles || []
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data?.title && (
        <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
          {block.data.title}
        </h2>
      )}
      <div className="overflow-x-auto">
        <table className={`w-full border-collapse ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md`}>
          <thead>
            <tr className={isDark ? 'bg-gray-700' : 'bg-gray-100'}>
              <th className={`p-3 text-left text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>Caractéristique</th>
              {comparisonVehicles.map((vehicle: any, index: number) => (
                <th key={index} className={`p-3 text-center text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                  {vehicle.name || `Véhicule ${index + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={`p-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>Places</td>
              {comparisonVehicles.map((vehicle: any, index: number) => (
                <td key={index} className={`p-3 text-center text-sm ${isDark ? 'text-gray-100' : 'text-gray-900'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                  {vehicle.seats || 4}
                </td>
              ))}
            </tr>
            <tr>
              <td className={`p-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>Prix</td>
              {comparisonVehicles.map((vehicle: any, index: number) => (
                <td key={index} className={`p-3 text-center text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                  {vehicle.price || 0} €
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function renderServicePackages(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const packages = block.data?.packages || []
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data?.title && (
        <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
          {block.data.title}
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {packages.map((pkg: any, index: number) => (
          <div key={index} className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
              {pkg.name || `Forfait ${index + 1}`}
            </h3>
            <div className={`text-3xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'} mb-4`}>
              {pkg.price || 0} €
            </div>
            {pkg.features && pkg.features.length > 0 && (
              <ul className="space-y-2">
                {pkg.features.map((feature: string, fIndex: number) => (
                  <li key={fIndex} className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Export map
export const vtcCases: Record<string, (props: PreviewCaseProps) => React.ReactElement | null> = {
  'booking-form': renderBookingFormBase,
  'pricing-table': renderPricingTableBase,
  'service-zones': renderServiceZonesBase,
  'vehicle-gallery': renderVehicleGalleryBase,
  'contact-buttons': renderContactButtonsBase,
  'map': renderMapBase,
  'route-calculator': renderRouteCalculator,
  'fare-calculator': renderFareCalculatorBase,
  'availability-calendar': renderAvailabilityCalendarBase,
  'driver-profile': renderDriverProfile,
  'email-button': renderEmailButton,
  'sms-button': renderSMSButton,
  'vehicle-comparison': renderVehicleComparison,
  'service-packages': renderServicePackages,
}

