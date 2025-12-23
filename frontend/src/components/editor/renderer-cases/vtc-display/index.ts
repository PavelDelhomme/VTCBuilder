import { renderPricingTable } from './pricing-table'
import { renderServiceZones } from './service-zones'
import { renderVehicleGallery } from './vehicle-gallery'
import { renderContactButtons } from './contact-buttons'
import { renderMap } from './map'

export { renderPricingTable, renderServiceZones, renderVehicleGallery, renderContactButtons, renderMap }

export const vtcDisplayCases = {
  'pricing-table': renderPricingTable,
  'service-zones': renderServiceZones,
  'vehicle-gallery': renderVehicleGallery,
  'contact-buttons': renderContactButtons,
  'map': renderMap,
}

