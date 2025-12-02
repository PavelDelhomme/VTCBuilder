'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import TenantLayout from '@/components/tenant/TenantLayout'
import bookingService, { Booking } from '@/services/booking.service'
import toast from 'react-hot-toast'

export default function BookingDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<Booking | null>(null)

  useEffect(() => {
    loadBooking()
  }, [bookingId])

  const loadBooking = async () => {
    try {
      setLoading(true)
      const data = await bookingService.getById(parseInt(bookingId))
      setBooking(data)
    } catch (error: any) {
      toast.error('Erreur lors du chargement de la réservation')
      router.push('/dashboard/bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (!booking) return
    try {
      await bookingService.confirm(booking.id)
      toast.success('Réservation confirmée')
      loadBooking()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la confirmation')
    }
  }

  const handleComplete = async () => {
    if (!booking) return
    try {
      await bookingService.complete(booking.id)
      toast.success('Réservation terminée')
      loadBooking()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la finalisation')
    }
  }

  const handleCancel = async () => {
    if (!booking) return
    const reason = prompt('Raison de l\'annulation (optionnel):')
    try {
      await bookingService.cancel(booking.id, reason || undefined)
      toast.success('Réservation annulée')
      loadBooking()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'annulation')
    }
  }

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
      <TenantLayout title="Détails Réservation">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        </div>
      </TenantLayout>
    )
  }

  if (!booking) {
    return (
      <TenantLayout title="Réservation non trouvée">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Réservation introuvable</p>
          <button
            onClick={() => router.push('/dashboard/bookings')}
            className="btn btn-primary"
          >
            Retour aux réservations
          </button>
        </div>
      </TenantLayout>
    )
  }

  return (
    <TenantLayout 
      title="Détails Réservation"
      subtitle={`Réservation #${booking.id}`}
      headerActions={
        <button
          onClick={() => router.push('/dashboard/bookings')}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900"
        >
          ← Retour
        </button>
      }
    >
      <div className="space-y-6">
        {/* Status & Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusBadge(booking.status)}`}>
                {getStatusLabel(booking.status)}
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Créée le {formatDate(booking.created_at)}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {booking.status === 'pending' && (
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Confirmer
                </button>
              )}
              {booking.status === 'confirmed' && (
                <button
                  onClick={handleComplete}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Marquer comme terminée
                </button>
              )}
              {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Annuler
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Informations client</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Nom</label>
              <p className="text-gray-900 dark:text-gray-100">{booking.customer_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
              <p className="text-gray-900 dark:text-gray-100">{booking.customer_email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Téléphone</label>
              <p className="text-gray-900 dark:text-gray-100">{booking.customer_phone}</p>
            </div>
          </div>
        </div>

        {/* Trip Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Détails du trajet</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Point de départ</label>
              <p className="text-gray-900 dark:text-gray-100">📍 {booking.pickup_address}</p>
              {(booking.pickup_lat || booking.pickup_lng) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {booking.pickup_lat}, {booking.pickup_lng}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Destination</label>
              <p className="text-gray-900 dark:text-gray-100">🎯 {booking.dropoff_address}</p>
              {(booking.dropoff_lat || booking.dropoff_lng) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {booking.dropoff_lat}, {booking.dropoff_lng}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date/Heure</label>
                <p className="text-gray-900 dark:text-gray-100">{formatDate(booking.pickup_datetime)}</p>
              </div>
              {booking.estimated_distance && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Distance</label>
                  <p className="text-gray-900 dark:text-gray-100">{booking.estimated_distance} km</p>
                </div>
              )}
              {booking.estimated_duration && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Durée estimée</label>
                  <p className="text-gray-900 dark:text-gray-100">~{booking.estimated_duration} min</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tarification</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Prix estimé</label>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formatPrice(booking.estimated_price, booking.currency)}
              </p>
            </div>
            {booking.final_price && (
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Prix final</label>
                <p className="text-xl font-bold text-green-600">
                  {formatPrice(booking.final_price, booking.currency)}
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Statut paiement</label>
              <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                booking.payment_status === 'paid' 
                  ? 'bg-green-100 text-green-800'
                  : booking.payment_status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {booking.payment_status === 'paid' ? 'Payé' :
                 booking.payment_status === 'failed' ? 'Échec' :
                 booking.payment_status === 'refunded' ? 'Remboursé' : 'En attente'}
              </span>
              {booking.payment_method && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Méthode: {booking.payment_method}</p>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        {booking.notes && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Notes</h2>
            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{booking.notes}</p>
          </div>
        )}

        {/* Cancellation Reason */}
        {booking.cancellation_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Raison d'annulation</h2>
            <p className="text-red-800">{booking.cancellation_reason}</p>
          </div>
        )}
      </div>
    </TenantLayout>
  )
}

