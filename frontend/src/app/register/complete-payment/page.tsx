'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import authService from '@/services/auth.service'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import PublicHeader from '@/components/public/PublicHeader'
import PublicFooter from '@/components/public/PublicFooter'
import { useTheme } from '@/contexts/ThemeContext'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '')

function CardRegistrationForm({ 
  clientSecret, 
  subscriptionId,
  onSuccess 
}: { 
  clientSecret: string
  subscriptionId: number
  onSuccess: () => void 
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setProcessing(false)
      return
    }

    try {
      // Confirm setup intent
      const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      })

      if (error) {
        toast.error(error.message || 'Error lors de l\'enregistrement de la carte')
        setProcessing(false)
        return
      }

      if (setupIntent && setupIntent.status === 'succeeded' && setupIntent.payment_method) {
        // Complete card registration on backend
        try {
          await api.post('/billing/complete-card-registration/', {
            subscription_id: subscriptionId,
            payment_method_id: setupIntent.payment_method,
          })
          
          toast.success('Carte bancaire enregistrée avec succès !')
          onSuccess()
        } catch (error: any) {
          console.error('Error completing card registration:', error)
          toast.error(error.response?.data?.error || 'Error lors de l\'enregistrement de la carte')
          setProcessing(false)
        }
      }
    } catch (error: any) {
      console.error('Error confirming setup intent:', error)
      toast.error('Error lors de l\'enregistrement de la carte')
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-semibold mb-1">🔒 Aucun prélèvement pendant l'essai gratuit</p>
            <p>Votre carte bancaire sera enregistrée pour la facturation automatique après votre période d'essai de 14 jours. Aucun montant ne sera prélevé avant la fin de l'essai.</p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
      >
        {processing ? 'Enregistrement en cours...' : 'Enregistrer ma carte bancaire'}
      </button>
      
      <button
        type="button"
        onClick={() => router.push('/dashboard')}
        className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-6 rounded-lg transition-colors"
      >
        Passer cette étape pour l'instant
      </button>
    </form>
  )
}

export default function CompletePaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resolvedTheme } = useTheme()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Get client secret and subscription ID from URL params or localStorage
    const secret = searchParams.get('client_secret') || localStorage.getItem('setup_intent_client_secret')
    const subId = searchParams.get('subscription_id') || localStorage.getItem('subscription_id')
    
    if (secret && subId) {
      setClientSecret(secret)
      setSubscriptionId(parseInt(subId))
      setLoading(false)
    } else {
      // If no setup intent, redirect to dashboard
      toast.error('Aucune information de paiement trouvée')
      router.push('/dashboard')
    }
  }, [searchParams, router])

  const handleSuccess = () => {
    // Clear stored data
    localStorage.removeItem('setup_intent_client_secret')
    localStorage.removeItem('subscription_id')
    
    // Redirect to dashboard
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  }

  if (!mounted || loading || !clientSecret || !subscriptionId) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        resolvedTheme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-gray-50 to-gray-100'
      }`}>
        <PublicHeader showThemeToggle={true} />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        </div>
        <PublicFooter />
      </div>
    )
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: resolvedTheme === 'dark' ? 'night' : 'stripe',
    },
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      resolvedTheme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 to-gray-100'
    }`}>
      <PublicHeader showThemeToggle={true} />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Enregistrez votre carte bancaire
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Pour activer votre essai gratuit de 14 jours
            </p>
          </div>

          <Elements stripe={stripePromise} options={options}>
            <CardRegistrationForm 
              clientSecret={clientSecret} 
              subscriptionId={subscriptionId}
              onSuccess={handleSuccess}
            />
          </Elements>
        </div>
      </div>

      <PublicFooter />
    </div>
  )
}

