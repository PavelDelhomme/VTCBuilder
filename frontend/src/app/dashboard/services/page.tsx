'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TenantLayout from '@/components/tenant/TenantLayout'
import ResponsiveTable from '@/components/shared/ResponsiveTable'
import serviceService, { Service } from '@/services/service.service'
import toast from 'react-hot-toast'

export default function ServicesPage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      setLoading(true)
      const data = await serviceService.getAll()
      setServices(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error chargement services:', error)
      toast.error('Error lors du chargement des services')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (service: Service) => {
    try {
      if (service.is_active) {
        await serviceService.deactivate(service.id)
        toast.success('Service désactivé')
      } else {
        await serviceService.activate(service.id)
        toast.success('Service activé')
      }
      loadServices()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error lors de la modification')
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le service "${name}" ?`)) {
      return
    }

    try {
      await serviceService.delete(id)
      toast.success('Service supprimé')
      loadServices()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error lors de la suppression')
    }
  }

  const filteredServices = services.filter(service =>
    search === '' || 
    service.name.toLowerCase().includes(search.toLowerCase()) ||
    service.description?.toLowerCase().includes(search.toLowerCase())
  )

  const formatPrice = (price?: number) => {
    if (!price) return '-'
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)
  }

  const headerActions = (
    <button
      onClick={() => router.push('/dashboard/services/new')}
      className="btn btn-primary"
    >
      + Nouveau Service
    </button>
  )

  if (loading) {
    return (
      <TenantLayout title="Services VTC" subtitle="Gestion de vos services">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        </div>
      </TenantLayout>
    )
  }

  return (
    <TenantLayout 
      title="Services VTC" 
      subtitle="Gérez vos services de transport"
      headerActions={headerActions}
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <input
            type="text"
            placeholder="Rechercher un service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Services List */}
        {filteredServices.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {search ? 'Aucun service trouvé' : 'Aucun service'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {search ? 'Essayez une autre recherche' : 'Créez votre premier service VTC'}
            </p>
            {!search && (
              <button
                onClick={() => router.push('/dashboard/services/new')}
                className="btn btn-primary"
              >
                + Créer un service
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <ResponsiveTable
              headers={['Service', 'Description', 'Tarifs', 'Passagers', 'Statut', 'Actions']}
              emptyMessage="Aucun service"
            >
              {filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50 dark:bg-gray-900">
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      {service.icon && (
                        <span className="text-2xl mr-3">{service.icon}</span>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{service.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">/{service.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                      {service.description || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      {service.base_price && (
                        <div>Base: {formatPrice(service.base_price)}</div>
                      )}
                      {service.price_per_km && (
                        <div>/km: {formatPrice(service.price_per_km)}</div>
                      )}
                      {!service.base_price && !service.price_per_km && '-'}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      👤 {service.max_passengers}
                      {service.max_luggage > 0 && ` • 🧳 ${service.max_luggage}`}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      service.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 dark:bg-gray-900 text-gray-800'
                    }`}>
                      {service.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => router.push(`/dashboard/services/${service.id}/edit`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Éditer"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleToggleActive(service)}
                        className={`${
                          service.is_active 
                            ? 'text-yellow-600 hover:text-yellow-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                        title={service.is_active ? 'Désactiver' : 'Activer'}
                      >
                        {service.is_active ? '⏸️' : '▶️'}
                      </button>
                      <button
                        onClick={() => handleDelete(service.id, service.name)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </ResponsiveTable>
          </div>
        )}
      </div>
    </TenantLayout>
  )
}

