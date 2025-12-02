'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/services/auth.service'
import AdminSidebar from '@/components/admin/AdminSidebar'
import tenantService, { Tenant } from '@/services/tenant.service'

export default function NewTenantPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    plan: 'business' as Tenant['plan'],
    status: 'active' as Tenant['status'],
  })

  useEffect(() => {
    if (!authService.isSuperAdmin()) {
      router.push('/dashboard')
      return
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await tenantService.create(formData)
      router.push('/admin/tenants')
    } catch (error) {
      console.error('Erreur création tenant:', error)
      alert('Erreur lors de la création du tenant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      <AdminSidebar />

      <div className="flex-1 ml-64">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Nouveau Tenant</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Créer un nouveau client</p>
            </div>
            <button
              onClick={() => router.push('/admin/tenants')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100"
            >
              Annuler
            </button>
          </div>
        </header>

        <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nom du tenant
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="plan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Plan
                </label>
                <select
                  id="plan"
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value as Tenant['plan'] })}
                  className="mt-1 block w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="starter">Starter</option>
                  <option value="business">Business</option>
                  <option value="enterprise">Entreprise</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Statut
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Tenant['status'] })}
                  className="mt-1 block w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="trial">Trial</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/admin/tenants')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Création...' : 'Créer le tenant'}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}

