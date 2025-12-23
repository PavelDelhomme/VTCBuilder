'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import authService from '@/services/auth.service'
import api from '@/lib/api'

export interface Feature {
  id: string
  name: string
  description?: string
  requires_premium: boolean
  required_plan?: string[]
}

export interface TenantFeatures {
  can_use_premium_blocks: boolean
  can_use_custom_domain: boolean
  can_use_advanced_seo: boolean
  can_use_analytics: boolean
  can_use_multiple_sites: boolean
  can_use_white_label: boolean
  can_use_advanced_styling: boolean // Z-index, position, transform, etc.
  can_use_custom_code: boolean // CSS/JS personnalisé
  can_use_ai_content: boolean // Génération de contenu IA
  can_use_advanced_forms: boolean // Formulaires avancés avec logique conditionnelle
  can_use_ecommerce: boolean // Intégration e-commerce
  can_use_membership: boolean // Système de membres
  can_use_booking_system: boolean // Système de réservation avancé
  can_use_email_marketing: boolean // Marketing email intégré
  can_use_social_integration: boolean // Intégrations réseaux sociaux
  can_use_api_access: boolean // Accès API
  max_pages: number
  max_storage_gb: number
  max_users: number
  available_block_types: string[]
}

interface FeaturesContextType {
  features: TenantFeatures | null
  loading: boolean
  hasFeature: (featureId: keyof TenantFeatures) => boolean
  canUseBlockType: (blockType: string, requiresPremium: boolean) => boolean
  refreshFeatures: () => Promise<void>
}

const FeaturesContext = createContext<FeaturesContextType | undefined>(undefined)

// Flag pour éviter les logs répétés
let hasLoggedBlockedError = false

export function FeaturesProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<TenantFeatures | null>(null)
  const [loading, setLoading] = useState(true)

  const loadFeatures = async () => {
    try {
      // Pour les super admins, toutes les features sont disponibles
      const isSuperAdmin = authService.isSuperAdmin()
      if (isSuperAdmin) {
        setFeatures({
          can_use_premium_blocks: true,
          can_use_custom_domain: true,
          can_use_advanced_seo: true,
          can_use_analytics: true,
          can_use_multiple_sites: true,
          can_use_white_label: true,
          can_use_advanced_styling: true,
          can_use_custom_code: true,
          can_use_ai_content: true,
          can_use_advanced_forms: true,
          can_use_ecommerce: true,
          can_use_membership: true,
          can_use_booking_system: true,
          can_use_email_marketing: true,
          can_use_social_integration: true,
          can_use_api_access: true,
          max_pages: -1, // Illimité
          max_storage_gb: -1, // Illimité
          max_users: -1, // Illimité
          available_block_types: ['*'], // Tous les blocs
        })
        setLoading(false)
        return
      }

      // Pour les tenants, charger depuis l'API
      try {
        // Utiliser le nouvel endpoint qui retourne les features basées sur le plan
        const response = await api.get('/tenants/features/')
        const availableFeatures = response.data || []
        
        // Construire l'objet TenantFeatures basé sur les features disponibles
        // Pour l'instant, on utilise une logique simple basée sur les noms de features
        const featureNames = availableFeatures.map((f: any) => f.name)
        
        setFeatures({
          can_use_premium_blocks: featureNames.includes('advanced-blocks'),
          can_use_custom_domain: featureNames.includes('custom-domain'),
          can_use_advanced_seo: featureNames.includes('seo-tools'),
          can_use_analytics: featureNames.includes('analytics'),
          can_use_multiple_sites: featureNames.includes('multiple-sites'),
          can_use_white_label: featureNames.includes('white-label'),
          can_use_advanced_styling: featureNames.includes('advanced-styling'),
          can_use_custom_code: featureNames.includes('custom-code'),
          can_use_ai_content: featureNames.includes('ai-content'),
          can_use_advanced_forms: featureNames.includes('advanced-forms'),
          can_use_ecommerce: featureNames.includes('ecommerce'),
          can_use_membership: featureNames.includes('membership'),
          can_use_booking_system: true, // Toujours disponible
          can_use_email_marketing: featureNames.includes('email-marketing'),
          can_use_social_integration: featureNames.includes('social-integration'),
          can_use_api_access: featureNames.includes('api-access'),
          max_pages: 10, // Sera déterminé par le plan
          max_storage_gb: 1, // Sera déterminé par le plan
          max_users: 1, // Sera déterminé par le plan
          available_block_types: featureNames.includes('advanced-blocks') ? ['*'] : ['heading', 'text', 'image', 'button', 'video', 'spacer', 'divider'],
        })
      } catch (error: any) {
        // Détecter les erreurs bloquées par le client (bloqueur de pub/adblocker)
        const isBlockedError = 
          error.code === 'ERR_BLOCKED_BY_CLIENT' || 
          error.message?.includes('ERR_BLOCKED_BY_CLIENT') ||
          error.message?.includes('blocked by client') ||
          error.message?.includes('net::ERR_BLOCKED_BY_CLIENT') ||
          (error.response?.status === 0 && error.message?.includes('Failed to fetch')) ||
          (error.request && error.request.status === 0) ||
          // Détecter aussi les erreurs de type "Network request failed" qui peuvent être des bloqueurs
          (error.message?.includes('Network request failed') && !error.response)
        
        const isNetworkError = error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED'
        const isUnauthorized = error.response?.status === 401 || error.response?.status === 403
        
        // Ne RIEN logger pour les erreurs bloquées ou 401/403 - c'est géré silencieusement
        // Les bloqueurs de pub sont courants et les erreurs 401/403 sont normales si non connecté
        if (isBlockedError || isUnauthorized) {
          // Erreur bloquée par un adblocker ou non autorisé - utiliser les valeurs par défaut silencieusement
          // Ne rien logger du tout
        } else if (isNetworkError) {
          // Erreurs réseau normales (backend non démarré, etc.) - logger une seule fois
          if (!hasLoggedBlockedError) {
            console.warn('⚠️ Impossible de charger les fonctionnalités (backend non accessible). Utilisation des valeurs par défaut.')
            hasLoggedBlockedError = true
          }
        } else {
          // Autres erreurs (404, 500, etc.) - logger une seule fois
          if (!hasLoggedBlockedError) {
            console.warn('Features endpoint not available, using defaults')
            hasLoggedBlockedError = true
          }
        }
        setFeatures({
          can_use_premium_blocks: false,
          can_use_custom_domain: false,
          can_use_advanced_seo: false,
          can_use_analytics: false,
          can_use_multiple_sites: false,
          can_use_white_label: false,
          can_use_advanced_styling: false,
          can_use_custom_code: false,
          can_use_ai_content: false,
          can_use_advanced_forms: false,
          can_use_ecommerce: false,
          can_use_membership: false,
          can_use_booking_system: true, // Toujours disponible même en cas d'erreur
          can_use_email_marketing: false,
          can_use_social_integration: false,
          can_use_api_access: false,
          max_pages: 10,
          max_storage_gb: 1,
          max_users: 1,
          available_block_types: ['heading', 'text', 'image', 'button', 'video', 'spacer', 'divider'],
        })
      }
    } catch (error) {
      console.error('Error loading features:', error)
      // Valeurs par défaut en cas d'erreur
      setFeatures({
        can_use_premium_blocks: false,
        can_use_custom_domain: false,
        can_use_advanced_seo: false,
        can_use_analytics: false,
        can_use_multiple_sites: false,
        can_use_white_label: false,
        can_use_advanced_styling: false,
        can_use_custom_code: false,
        can_use_ai_content: false,
        can_use_advanced_forms: false,
        can_use_ecommerce: false,
        can_use_membership: false,
        can_use_booking_system: false,
        can_use_email_marketing: false,
        can_use_social_integration: false,
        can_use_api_access: false,
        max_pages: 0,
        max_storage_gb: 0,
        max_users: 0,
        available_block_types: [],
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFeatures()
  }, [])

  const hasFeature = (featureId: keyof TenantFeatures): boolean => {
    if (!features) return false
    return features[featureId] === true || (typeof features[featureId] === 'number' && features[featureId] > 0)
  }

  const canUseBlockType = (blockType: string, requiresPremium: boolean): boolean => {
    // Les super admins ont toujours accès à tous les blocs
    const isSuperAdmin = authService.isSuperAdmin()
    if (isSuperAdmin) {
      return true
    }
    
    // Si features n'est pas encore chargé, autoriser par défaut (pour éviter de bloquer l'affichage)
    if (!features || loading) {
      console.log('⚠️ Features non chargées, autorisation par défaut pour', blockType)
      return true
    }
    
    // Si le bloc nécessite premium et que l'utilisateur n'a pas accès
    if (requiresPremium && !features.can_use_premium_blocks) {
      return false
    }

    // Vérifier si le type de bloc est dans la liste disponible
    if (features.available_block_types.includes('*')) {
      return true // Tous les blocs sont disponibles
    }

    // Si la liste est vide, autoriser par défaut (pour éviter de bloquer tous les blocs)
    if (features.available_block_types.length === 0) {
      console.warn('⚠️ available_block_types est vide, autorisation par défaut pour', blockType)
      return true
    }

    return features.available_block_types.includes(blockType)
  }

  const refreshFeatures = async () => {
    setLoading(true)
    await loadFeatures()
  }

  return (
    <FeaturesContext.Provider value={{ features, loading, hasFeature, canUseBlockType, refreshFeatures }}>
      {children}
    </FeaturesContext.Provider>
  )
}

export function useFeatures() {
  const context = useContext(FeaturesContext)
  if (context === undefined) {
    throw new Error('useFeatures must be used within a FeaturesProvider')
  }
  return context
}

