'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TenantLayout from '@/components/tenant/TenantLayout'
import ResponsiveTable from '@/components/shared/ResponsiveTable'
import bookingService, { Booking } from '@/services/booking.service'
import toast from 'react-hot-toast'

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadBookings()
  }, [filter])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (filter !== 'all') {
        params.status = filter
      }
      const data = await bookingService.getAll(params)
      setBookings(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error chargement réservations:', error)
      toast.error('Error lors du chargement des réservations')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (id: number) => {
    try {
      await bookingService.confirm(id)
      toast.success('Réservation confirmée')
      loadBookings()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error lors de la confirmation')
    }
  }

  const handleComplete = async (id: number) => {
    try {
      await bookingService.complete(id)
      toast.success('Réservation terminée')
      loadBookings()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error lors de la finalisation')
    }
  }

  const handleCancel = async (id: number) => {
    const reason = prompt('Raison de l\'annulation (optionnel):')
    try {
      await bookingService.cancel(id, reason || undefined)
      toast.success('Réservation annulée')
      loadBookings()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error lors de l\'annulation')
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (search && !booking.customer_name.toLowerCase().includes(search.toLowerCase()) &&
        !booking.customer_email.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    return true
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(price)
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return badges[status] || 'bg-gray-100 dark:bg-gray-900 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      in_progress: 'En cours',
      completed: 'Terminée',
      cancelled: 'Annulée',
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <TenantLayout title="Réservations" subtitle="Gestion de vos réservations">
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
      title="Réservations" 
      subtitle="Gérez toutes vos réservations VTC"
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'Toutes' : getStatusLabel(f)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{bookings.length}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">En attente</div>
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === 'pending').length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">En cours</div>
            <div className="text-2xl font-bold text-purple-600">
              {bookings.filter(b => b.status === 'in_progress').length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">Terminées</div>
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'completed').length}
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {search || filter !== 'all' ? 'Aucune réservation trouvée' : 'Aucune réservation'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {search || filter !== 'all' ? 'Essayez de modifier vos filtres' : 'Les réservations apparaîtront ici'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <ResponsiveTable
              headers={['Client', 'Trajet', 'Date/Heure', 'Prix', 'Statut', 'Actions']}
              emptyMessage="Aucune réservation"
            >
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 dark:bg-gray-900">
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{booking.customer_name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{booking.customer_email}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{booking.customer_phone}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      <div className="text-gray-900 dark:text-gray-100">📍 {booking.pickup_address}</div>
                      <div className="text-gray-500 dark:text-gray-400 mt-1">→ {booking.dropoff_address}</div>
                      {booking.estimated_distance && (
                        <div className="text-xs text-gray-400 mt-1">
                          {booking.estimated_distance} km
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(booking.pickup_datetime)}
                    </div>
                    {booking.estimated_duration && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ~{booking.estimated_duration} min
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatPrice(booking.estimated_price, booking.currency)}
                    </div>
                    {booking.final_price && booking.final_price !== booking.estimated_price && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Final: {formatPrice(booking.final_price, booking.currency)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                    {booking.payment_status && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        💳 {booking.payment_status === 'paid' ? 'Payé' : 'Non payé'}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleConfirm(booking.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Confirmer"
                        >
                          ✓
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleComplete(booking.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Terminer"
                        >
                          ✓✓
                        </button>
                      )}
                      {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Annuler"
                        >
                          ✕
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100"
                        title="Voir détails"
                      >
                        👁️
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

