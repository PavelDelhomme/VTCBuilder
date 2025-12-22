import React from 'react'
import { RendererCaseProps } from './types'
import { CollapsibleSection } from '../CollapsibleSection'
import ImageSelector from '../ui/ImageSelector'

export function renderPricingTable({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const pricingRows = safeBlock.data.rows || [{ route: '', price: '', duration: '' }]
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre de la section
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Nos tarifs"
        />
      </div>
      <CollapsibleSection title="Lignes de tarifs" count={pricingRows.length} defaultCollapsed={false}>
        <div className="space-y-3">
          {pricingRows.map((row: any, index: number) => (
            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Ligne {index + 1}</span>
                <button
                  onClick={() => {
                    const newRows = pricingRows.filter((_: any, i: number) => i !== index)
                    onUpdate({ data: { ...safeBlock.data, rows: newRows } })
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                  title="Supprimer cette ligne"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Trajet
                </label>
                <input
                  type="text"
                  value={row.route || ''}
                  onChange={(e) => {
                    const newRows = [...pricingRows]
                    newRows[index] = { ...row, route: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, rows: newRows } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Trajet (ex: Aéroport → Centre-ville)"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prix
                  </label>
                  <input
                    type="text"
                    value={row.price || ''}
                    onChange={(e) => {
                      const newRows = [...pricingRows]
                      newRows[index] = { ...row, price: e.target.value }
                      onUpdate({ data: { ...safeBlock.data, rows: newRows } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Prix (ex: 45€)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Durée
                  </label>
                  <input
                    type="text"
                    value={row.duration || ''}
                    onChange={(e) => {
                      const newRows = [...pricingRows]
                      newRows[index] = { ...row, duration: e.target.value }
                      onUpdate({ data: { ...safeBlock.data, rows: newRows } })
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Durée (ex: 30 min)"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newRows = [...pricingRows, { route: '', price: '', duration: '' }]
              onUpdate({ data: { ...safeBlock.data, rows: newRows } })
            }}
            className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
          >
            <span>+</span>
            <span>Ajouter une ligne de tarif</span>
          </button>
        </div>
      </CollapsibleSection>
    </div>
  )
}

export function renderServiceZones({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const zones = safeBlock.data.zones || [{ name: '', description: '', icon: '' }]
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre de la section
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Zones de service"
        />
      </div>
      <CollapsibleSection title="Zones de service" count={zones.length} defaultCollapsed={false}>
        <div className="space-y-3">
          {zones.map((zone: any, index: number) => (
            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Zone {index + 1}</span>
                <button
                  onClick={() => {
                    const newZones = zones.filter((_: any, i: number) => i !== index)
                    onUpdate({ data: { ...safeBlock.data, zones: newZones } })
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                  title="Supprimer cette zone"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom de la zone
                </label>
                <input
                  type="text"
                  value={zone.name || ''}
                  onChange={(e) => {
                    const newZones = [...zones]
                    newZones[index] = { ...zone, name: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, zones: newZones } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Nom de la zone"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={zone.description || ''}
                  onChange={(e) => {
                    const newZones = [...zones]
                    newZones[index] = { ...zone, description: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, zones: newZones } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Description de la zone"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Icône (emoji)
                </label>
                <input
                  type="text"
                  value={zone.icon || ''}
                  onChange={(e) => {
                    const newZones = [...zones]
                    newZones[index] = { ...zone, icon: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, zones: newZones } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Icône emoji (ex: 🚗)"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newZones = [...zones, { name: '', description: '', icon: '' }]
              onUpdate({ data: { ...safeBlock.data, zones: newZones } })
            }}
            className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
          >
            <span>+</span>
            <span>Ajouter une zone</span>
          </button>
        </div>
      </CollapsibleSection>
    </div>
  )
}

export function renderVehicleGallery({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const vehicles = safeBlock.data.vehicles || [{ name: '', image: '', description: '', features: '' }]
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre de la section
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Notre flotte"
        />
      </div>
      <CollapsibleSection title="Véhicules" count={vehicles.length} defaultCollapsed={false}>
        <div className="space-y-3">
          {vehicles.map((vehicle: any, index: number) => (
            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Véhicule {index + 1}</span>
                <button
                  onClick={() => {
                    const newVehicles = vehicles.filter((_: any, i: number) => i !== index)
                    onUpdate({ data: { ...safeBlock.data, vehicles: newVehicles } })
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                  title="Supprimer ce véhicule"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom du véhicule
                </label>
                <input
                  type="text"
                  value={vehicle.name || ''}
                  onChange={(e) => {
                    const newVehicles = [...vehicles]
                    newVehicles[index] = { ...vehicle, name: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, vehicles: newVehicles } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Nom du véhicule"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image du véhicule
                </label>
                <ImageSelector
                  value={vehicle.image || ''}
                  onChange={(url) => {
                    const newVehicles = [...vehicles]
                    newVehicles[index] = { ...vehicle, image: url }
                    onUpdate({ data: { ...safeBlock.data, vehicles: newVehicles } })
                  }}
                  className="text-sm"
                  projectId={1}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={vehicle.description || ''}
                  onChange={(e) => {
                    const newVehicles = [...vehicles]
                    newVehicles[index] = { ...vehicle, description: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, vehicles: newVehicles } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Description du véhicule"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Caractéristiques
                </label>
                <input
                  type="text"
                  value={vehicle.features || ''}
                  onChange={(e) => {
                    const newVehicles = [...vehicles]
                    newVehicles[index] = { ...vehicle, features: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, vehicles: newVehicles } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Caractéristiques (ex: 4 places, WiFi, Climatisation)"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newVehicles = [...vehicles, { name: '', image: '', description: '', features: '' }]
              onUpdate({ data: { ...safeBlock.data, vehicles: newVehicles } })
            }}
            className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
          >
            <span>+</span>
            <span>Ajouter un véhicule</span>
          </button>
        </div>
      </CollapsibleSection>
    </div>
  )
}

export function renderContactButtons({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  const contacts = safeBlock.data.contacts || [{ type: 'phone', label: '', value: '', icon: '' }]
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre de la section
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Contactez-nous"
        />
      </div>
      <CollapsibleSection title="Contacts" count={contacts.length} defaultCollapsed={false}>
        <div className="space-y-3">
          {contacts.map((contact: any, index: number) => (
            <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Contact {index + 1}</span>
                <button
                  onClick={() => {
                    const newContacts = contacts.filter((_: any, i: number) => i !== index)
                    onUpdate({ data: { ...safeBlock.data, contacts: newContacts } })
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
                  title="Supprimer ce contact"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type de contact
                </label>
                <select
                  value={contact.type || 'phone'}
                  onChange={(e) => {
                    const newContacts = [...contacts]
                    newContacts[index] = { ...contact, type: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, contacts: newContacts } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="phone">Téléphone</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={contact.label || ''}
                  onChange={(e) => {
                    const newContacts = [...contacts]
                    newContacts[index] = { ...contact, label: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, contacts: newContacts } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Label (ex: Appelez-nous)"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valeur
                </label>
                <input
                  type="text"
                  value={contact.value || ''}
                  onChange={(e) => {
                    const newContacts = [...contacts]
                    newContacts[index] = { ...contact, value: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, contacts: newContacts } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Valeur (ex: +33 6 12 34 56 78)"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Icône (emoji)
                </label>
                <input
                  type="text"
                  value={contact.icon || ''}
                  onChange={(e) => {
                    const newContacts = [...contacts]
                    newContacts[index] = { ...contact, icon: e.target.value }
                    onUpdate({ data: { ...safeBlock.data, contacts: newContacts } })
                  }}
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Icône emoji (ex: 📞)"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const newContacts = [...contacts, { type: 'phone', label: '', value: '', icon: '' }]
              onUpdate({ data: { ...safeBlock.data, contacts: newContacts } })
            }}
            className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-1"
          >
            <span>+</span>
            <span>Ajouter un contact</span>
          </button>
        </div>
      </CollapsibleSection>
    </div>
  )
}

export function renderMap({ block, onUpdate }: RendererCaseProps) {
  const safeBlock = { ...block, data: block.data || {} }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Titre de la section
        </label>
        <input
          type="text"
          value={safeBlock.data.title || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, title: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Notre zone de service"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Adresse ou coordonnées
        </label>
        <input
          type="text"
          value={safeBlock.data.address || ''}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, address: e.target.value } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Ex: Paris, France ou 48.8566, 2.3522"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Hauteur de la carte (px)
        </label>
        <input
          type="number"
          value={safeBlock.data.height || 400}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, height: parseInt(e.target.value) || 400 } })}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          min={200}
          max={800}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`map-zoom-${block.id}`}
          checked={safeBlock.data.show_controls || false}
          onChange={(e) => onUpdate({ data: { ...safeBlock.data, show_controls: e.target.checked } })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor={`map-zoom-${block.id}`} className="text-xs text-gray-700 dark:text-gray-300">
          Afficher les contrôles (zoom, etc.)
        </label>
      </div>
    </div>
  )
}

export const vtcDisplayCases = {
  'pricing-table': renderPricingTable,
  'service-zones': renderServiceZones,
  'vehicle-gallery': renderVehicleGallery,
  'contact-buttons': renderContactButtons,
  'map': renderMap,
}

