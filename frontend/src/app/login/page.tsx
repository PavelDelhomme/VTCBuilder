'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import authService from '@/services/auth.service'
import toast from 'react-hot-toast'
import { getTenantSlug, isTenantSubdomain } from '@/lib/tenant-utils'
import tenantService from '@/services/tenant.service'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  // États pour la gestion du domaine personnalisé des tenants
  const [tenantSlug, setTenantSlug] = useState<string | null>(null)
  const [customDomain, setCustomDomain] = useState('')
  const [showDomainConfig, setShowDomainConfig] = useState(false)
  const [configuringDomain, setConfiguringDomain] = useState(false)

  useEffect(() => {
    // Détecter si on est sur un sous-domaine tenant
    if (isTenantSubdomain()) {
      const slug = getTenantSlug()
      setTenantSlug(slug)
      // Ne pas afficher la config de domaine par défaut, seulement si l'utilisateur le demande
    }
  }, [])

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      const response = await authService.login({
        email: data.email || '',
        password: data.password || ''
      })
      
      // Vérifier si l'utilisateur est authentifié
      if (authService.isAuthenticated()) {
        const user = authService.getStoredUser()
        if (user?.roles?.some((role: any) => role === 'super-admin' || role.name === 'super-admin')) {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
        toast.success('Connexion réussie !')
      } else {
        toast.error('Erreur de connexion')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      
      // Gérer les erreurs de réseau spécifiquement
      const isBlockedError = error.code === 'ERR_BLOCKED_BY_CLIENT' || 
                            error.message?.includes('ERR_BLOCKED_BY_CLIENT') ||
                            error.message?.includes('blocked by client')
      
      if (isBlockedError) {
        // Erreur bloquée par un bloqueur de publicité - message discret
        toast.error(
          `Erreur: Requête bloquée par une extension navigateur.\n\n` +
          `💡 Solutions:\n` +
          `1. Mode navigation privée (Ctrl+Shift+N)\n` +
          `2. Désactiver uBlock Origin / AdBlock temporairement\n` +
          `3. Ajouter localhost:9495 aux exceptions`,
          { duration: 8000 }
        )
        // Ne pas logger en console pour éviter le spam
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || error.code === 'ECONNREFUSED') {
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'unknown'
        const apiUrl = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9495') : 'http://localhost:9495'
        
        toast.error(
          `Erreur de connexion au serveur.\n\n` +
          `🔍 Diagnostic:\n` +
          `• Hostname actuel: ${currentHost}\n` +
          `• API URL: ${apiUrl}\n\n` +
          `✅ Solutions:\n` +
          `1. Vérifier que le backend est démarré: docker-compose ps\n` +
          `2. Vérifier CORS dans les logs backend\n` +
          `3. Vérifier la connexion réseau`,
          { duration: 10000 }
        )
        console.error('Network error:', {
          error,
          currentHost,
          apiUrl
        })
      } else if (error.response?.status === 401) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Email ou mot de passe incorrect'
        toast.error(errorMessage)
      } else {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Erreur de connexion'
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleConfigureDomain = async () => {
    if (!tenantSlug || !customDomain.trim()) {
      toast.error('Veuillez entrer un nom de domaine valide')
      return
    }

    // Vérifier que l'utilisateur est connecté pour configurer le domaine
    if (!authService.isAuthenticated()) {
      toast.error('Vous devez être connecté pour configurer un domaine personnalisé')
      return
    }

    setConfiguringDomain(true)
    try {
      // Récupérer le tenant par slug
      const tenants = await tenantService.getAll({ search: tenantSlug })
      const tenant = Array.isArray(tenants) 
        ? tenants.find((t: any) => t.slug === tenantSlug)
        : tenants?.results?.find((t: any) => t.slug === tenantSlug)
      
      if (!tenant) {
        toast.error('Tenant non trouvé. Veuillez vous connecter d\'abord.')
        return
      }

      // Ajouter le domaine via le service
      await tenantService.addDomain(tenant.id, customDomain.trim(), false)
      
      toast.success(`Domaine ${customDomain} ajouté avec succès !`)
      setShowDomainConfig(false)
      setCustomDomain('')
    } catch (error: any) {
      console.error('Erreur configuration domaine:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la configuration du domaine'
      toast.error(errorMessage)
    } finally {
      setConfiguringDomain(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900 dark:text-gray-100">
            {tenantSlug ? `${tenantSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}` : 'VTCBuilder'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {tenantSlug ? 'Connexion à votre espace d\'administration' : 'Le WordPress des Chauffeurs VTC'}
          </p>
          {tenantSlug && typeof window !== 'undefined' && (
            <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-500">
              Sous-domaine: <code className="text-blue-600">{window.location.hostname}</code>
            </p>
          )}
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="input mt-1"
                placeholder="votre@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mot de passe
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="/register" className="font-medium text-primary-600 hover:text-primary-500">
                Créer un compte
              </a>
            </div>
            <div className="text-sm">
              <a href="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                Mot de passe oublié ?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-3 text-lg"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Configuration de domaine personnalisé pour les tenants */}
        {tenantSlug && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            {!showDomainConfig ? (
              <button
                type="button"
                onClick={() => setShowDomainConfig(true)}
                className="w-full text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Configurer un domaine personnalisé
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label htmlFor="customDomain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom de domaine personnalisé
                  </label>
                  <input
                    id="customDomain"
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="exemple.com"
                    className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Configurez votre nom de domaine personnalisé pour votre site public
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleConfigureDomain}
                    disabled={configuringDomain || !customDomain.trim()}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {configuringDomain ? 'Configuration...' : 'Ajouter le domaine'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDomainConfig(false)
                      setCustomDomain('')
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Comptes de test
              </span>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Comptes de test :</p>
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 space-y-1">
              <p><strong>Super Admin:</strong> <code className="text-blue-600">admin@vtcbuilder.com</code> / <code className="text-blue-600">admin123</code></p>
              <p><strong>Tenant Test:</strong> <code className="text-blue-600">test@delhomme.ovh</code> / <code className="text-blue-600">admin123</code></p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Le tenant de test est <strong>ma-societe-vtc</strong> (Ma Société VTC)</p>
          </div>
        </div>
      </div>
    </div>
  )
}

