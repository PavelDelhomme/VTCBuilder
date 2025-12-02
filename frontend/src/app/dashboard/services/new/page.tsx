'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import serviceService from '@/services/service.service'
import toast from 'react-hot-toast'
import TenantLayout from '@/components/tenant/TenantLayout'

const serviceSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  description: z.string().optional(),
  icon: z.string().optional(),
  base_price: z.number().optional(),
  price_per_km: z.number().optional(),
  price_per_minute: z.number().optional(),
  min_price: z.number().optional(),
  max_passengers: z.number().min(1).default(4),
  max_luggage: z.number().min(0).default(2),
  is_active: z.boolean().default(true),
  order: z.number().default(0),
})

type ServiceForm = z.infer<typeof serviceSchema>

export default function NewServicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      max_passengers: 4,
      max_luggage: 2,
      is_active: true,
      order: 0,
    },
  })

  const onSubmit = async (data: ServiceForm) => {
    setLoading(true)
    try {
      await serviceService.create(data)
      toast.success('Service créé avec succès !')
      router.push('/dashboard/services')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <TenantLayout 
      title="Nouveau Service VTC" 
      subtitle="Ajouter un nouveau service de transport"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Informations du Service</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom du service *
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Berline, Van, Luxe..."
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Icône (emoji)
              </label>
              <input
                {...register('icon')}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="🚗"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Description du service..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tarification</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prix de base (€)
              </label>
              <input
                {...register('base_price', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prix par km (€)
              </label>
              <input
                {...register('price_per_km', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prix par minute (€)
              </label>
              <input
                {...register('price_per_minute', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prix minimum (€)
              </label>
              <input
                {...register('min_price', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Caractéristiques</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Passagers maximum *
              </label>
              <input
                {...register('max_passengers', { valueAsNumber: true })}
                type="number"
                min="1"
                max="20"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.max_passengers && (
                <p className="mt-1 text-sm text-red-600">{errors.max_passengers.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bagages maximum *
              </label>
              <input
                {...register('max_luggage', { valueAsNumber: true })}
                type="number"
                min="0"
                max="20"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.max_luggage && (
                <p className="mt-1 text-sm text-red-600">{errors.max_luggage.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ordre d'affichage
              </label>
              <input
                {...register('order', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                {...register('is_active')}
                type="checkbox"
                id="is_active"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                Service actif
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard/services')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer le service'}
          </button>
        </div>
      </form>
    </TenantLayout>
  )
}

