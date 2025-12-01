'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import billingService, { PricingPlan } from '@/services/billing.service'
import authService from '@/services/auth.service'
import toast from 'react-hot-toast'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import { isTenantSubdomain } from '@/lib/tenant-utils'
import { useTheme } from '@/contexts/ThemeContext'

const registerSchema = z.object({
  tenant_name: z.string().min(3, 'Le nom de votre entreprise doit contenir au moins 3 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  password_confirm: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  plan_slug: z.string().min(1, 'Veuillez sélectionner un plan'),
  billing_cycle: z.enum(['monthly', 'yearly']).default('monthly'),
}).refine((data) => data.password === data.password_confirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirm'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      billing_cycle: 'monthly',
    },
  })

  // Redirect if on tenant subdomain
  useEffect(() => {
    if (isTenantSubdomain()) {
      router.push('/')
      return
    }
    loadPricingPlans()
  }, [router])

  const loadPricingPlans = async () => {
    try {
      const plans = await billingService.getPricingPlans()
      const activePlans = Array.isArray(plans) 
        ? plans.filter((p: PricingPlan) => p.is_active)
        : []
      setPricingPlans(activePlans.sort((a, b) => (a.order || 0) - (b.order || 0)))
    } catch (error) {
      console.error('Erreur chargement plans:', error)
      toast.error('Erreur lors du chargement des plans tarifaires')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price)
  }

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9495'}/api/auth/register-with-plan/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_name: data.tenant_name,
          email: data.email,
          password: data.password,
          first_name: data.first_name,
          last_name: data.last_name,
          plan_slug: data.plan_slug,
          billing_cycle: data.billing_cycle,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'inscription')
      }

      // Store tokens
      if (result.tokens) {
        localStorage.setItem('token', result.tokens.access)
        localStorage.setItem('refresh_token', result.tokens.refresh)
        localStorage.setItem('user', JSON.stringify(result.user))
      }

      // If setup intent is provided, redirect to card registration
      if (result.setup_intent_client_secret && result.subscription_id) {
        localStorage.setItem('setup_intent_client_secret', result.setup_intent_client_secret)
        localStorage.setItem('subscription_id', result.subscription_id.toString())
        router.push(`/register/complete-payment?client_secret=${result.setup_intent_client_secret}&subscription_id=${result.subscription_id}`)
        return
      }

      toast.success('Inscription réussie ! Un email de confirmation a été envoyé.')
      
      // Redirect to tenant admin
      if (result.admin_url) {
        window.location.href = result.admin_url
      } else {
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  const handlePlanSelect = (plan: PricingPlan) => {
    setSelectedPlan(plan)
    setValue('plan_slug', plan.slug)
  }

  const selectedPlanSlug = watch('plan_slug')

  // Get plan from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const planSlug = params.get('plan')
    if (planSlug && pricingPlans.length > 0) {
      const plan = pricingPlans.find(p => p.slug === planSlug)
      if (plan) {
        handlePlanSelect(plan)
      }
    }
  }, [pricingPlans])

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      resolvedTheme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 to-gray-100'
    }`}>
      <PublicHeader showThemeToggle={true} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
            Créez votre site VTC en quelques minutes
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choisissez votre plan et démarrez votre essai gratuit de 14 jours. Vous devrez enregistrer votre carte bancaire, mais aucun prélèvement ne sera effectué pendant l'essai.
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-8">
          <div className={`rounded-lg p-1 shadow-md inline-flex ${
            resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <button
              type="button"
              onClick={() => {
                setBillingCycle('monthly')
                setValue('billing_cycle', 'monthly')
              }}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : resolvedTheme === 'dark'
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Mensuel
            </button>
            <button
              type="button"
              onClick={() => {
                setBillingCycle('yearly')
                setValue('billing_cycle', 'yearly')
              }}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : resolvedTheme === 'dark'
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Annuel
              <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                resolvedTheme === 'dark'
                  ? 'bg-green-900 text-green-200'
                  : 'bg-green-100 text-green-800'
              }`}>
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Pricing Plans */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Choisissez votre plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pricingPlans.map((plan) => {
                const price = billingCycle === 'yearly' && plan.price_yearly 
                  ? plan.price_yearly / 12 
                  : plan.price_monthly
                const isSelected = selectedPlanSlug === plan.slug
                
                return (
                  <div
                    key={plan.id}
                    onClick={() => handlePlanSelect(plan)}
                    className={`rounded-xl shadow-lg p-6 cursor-pointer transition-all border-2 ${
                      resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
                    } ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                        : plan.is_featured
                        ? resolvedTheme === 'dark' ? 'border-blue-600' : 'border-blue-300'
                        : resolvedTheme === 'dark' ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {plan.is_featured && (
                      <div className="text-center mb-4">
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Populaire
                        </span>
                      </div>
                    )}
                    
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{plan.description}</p>
                    
                    <div className="mb-6">
                      <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">
                        {formatPrice(price)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">/mois</span>
                      {billingCycle === 'yearly' && plan.price_yearly && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Facturé {formatPrice(plan.price_yearly)}/an
                        </div>
                      )}
                    </div>

                    <ul className="space-y-2 mb-6 text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        {plan.max_sites} site{plan.max_sites > 1 ? 's' : ''}
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        {plan.max_users} utilisateur{plan.max_users > 1 ? 's' : ''} max
                      </li>
                      <li className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        {plan.max_storage_gb} GB de stockage
                      </li>
                      {plan.features && plan.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {isSelected && (
                      <div className={`px-3 py-2 rounded-lg text-sm font-medium text-center ${
                        resolvedTheme === 'dark'
                          ? 'bg-blue-900/50 text-blue-200'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        ✓ Plan sélectionné
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {selectedPlan && (
              <div className={`mt-6 rounded-lg p-4 border ${
                resolvedTheme === 'dark'
                  ? 'bg-blue-900/30 border-blue-800'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center">
                  <svg className={`h-5 w-5 mr-2 ${
                    resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className={`text-sm ${
                    resolvedTheme === 'dark' ? 'text-blue-200' : 'text-blue-800'
                  }`}>
                    <strong>Essai gratuit de 14 jours</strong> - Enregistrez votre carte bancaire, mais aucun prélèvement ne sera effectué pendant l'essai. Vous pouvez annuler à tout moment.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Créez votre compte</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom de votre entreprise *
                  </label>
                  <input
                    {...register('tenant_name')}
                    type="text"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      resolvedTheme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    placeholder="Ma Société VTC"
                  />
                  {errors.tenant_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.tenant_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      resolvedTheme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    placeholder="votre@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Prénom
                    </label>
                    <input
                      {...register('first_name')}
                      type="text"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        resolvedTheme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nom
                    </label>
                    <input
                      {...register('last_name')}
                      type="text"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        resolvedTheme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                          : 'border-gray-300 bg-white text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mot de passe *
                  </label>
                  <input
                    {...register('password')}
                    type="password"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      resolvedTheme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirmer le mot de passe *
                  </label>
                  <input
                    {...register('password_confirm')}
                    type="password"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      resolvedTheme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                    placeholder="••••••••"
                  />
                  {errors.password_confirm && (
                    <p className="mt-1 text-sm text-red-600">{errors.password_confirm.message}</p>
                  )}
                </div>

                {errors.plan_slug && (
                  <div className={`border rounded-lg p-3 ${
                    resolvedTheme === 'dark'
                      ? 'bg-red-900/30 border-red-800'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <p className={`text-sm ${
                      resolvedTheme === 'dark' ? 'text-red-300' : 'text-red-600'
                    }`}>{errors.plan_slug.message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !selectedPlan}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {loading ? 'Création en cours...' : '🚀 Démarrer mon essai gratuit'}
                </button>

                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  En vous inscrivant, vous acceptez nos{' '}
                  <Link href="/legal/terms" className="text-blue-600 hover:underline">
                    Conditions d'utilisation
                  </Link>
                  {' '}et notre{' '}
                  <Link href="/legal/privacy" className="text-blue-600 hover:underline">
                    Politique de confidentialité
                  </Link>
                </p>

                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Déjà un compte ?{' '}
                    <Link href="/login" className="text-blue-600 hover:underline font-medium">
                      Se connecter
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}

