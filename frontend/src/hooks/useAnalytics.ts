'use client'

import { useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import analyticsService from '@/services/analytics.service'
import authService from '@/services/auth.service'
import { isTenantSubdomain, getTenantSlug } from '@/lib/tenant-utils'

interface TrackActionParams {
  action_type: string
  action_name: string
  resource_type?: string
  resource_id?: number | string
  metadata?: Record<string, any>
}

export function useAnalytics() {
  const pathname = usePathname()

  // Vérifier si on est dans l'interface d'administration
  const isAdminInterface = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard')

  const trackAction = useCallback(async (params: TrackActionParams) => {
    // Ne pas tracker dans l'interface d'administration
    if (isAdminInterface) {
      return
    }

    try {
      // Récupérer l'utilisateur actuel si connecté
      let userId: number | undefined
      let tenantId: number | undefined

      try {
        const currentUser = authService.getCurrentUser()
        if (currentUser) {
          userId = currentUser.id
          tenantId = currentUser.tenant_id
        }
      } catch {
        // Utilisateur non connecté, continuer sans user/tenant
      }

      // Si on est sur un sous-domaine tenant, essayer de récupérer le tenant
      if (!tenantId && isTenantSubdomain()) {
        const tenantSlug = getTenantSlug()
        // Le tenant sera récupéré côté backend via le domaine
      }

      await analyticsService.trackAction({
        ...params,
        metadata: {
          ...params.metadata,
          pathname: pathname || window.location.pathname,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (error) {
      // Silently fail - analytics should not break the app
    }
  }, [pathname, isAdminInterface])

  const trackButtonClick = useCallback((buttonText: string, buttonId?: string, buttonUrl?: string) => {
    trackAction({
      action_type: 'button_click',
      action_name: buttonText || 'Bouton sans texte',
      resource_type: 'button',
      metadata: {
        button_id: buttonId,
        button_text: buttonText,
        button_url: buttonUrl,
        clicked_at: new Date().toISOString(),
      },
    })
  }, [trackAction])

  const trackPageView = useCallback((pageTitle?: string, pageId?: number | string) => {
    if (isAdminInterface) {
      return
    }

    trackAction({
      action_type: 'page_view',
      action_name: pageTitle || pathname || 'Page',
      resource_type: 'page',
      resource_id: pageId,
      metadata: {
        page_title: pageTitle,
        referrer: document.referrer,
      },
    })
  }, [pathname, isAdminInterface, trackAction])

  const trackFormSubmit = useCallback((formName: string, formId?: string) => {
    trackAction({
      action_type: 'form_submit',
      action_name: formName,
      resource_type: 'form',
      metadata: {
        form_id: formId,
        form_name: formName,
      },
    })
  }, [trackAction])

  const trackLinkClick = useCallback((linkText: string, linkUrl: string) => {
    trackAction({
      action_type: 'link_click',
      action_name: linkText || linkUrl,
      resource_type: 'link',
      metadata: {
        link_text: linkText,
        link_url: linkUrl,
      },
    })
  }, [trackAction])

  // Tracking automatique des vues de page
  useEffect(() => {
    if (isAdminInterface) {
      return
    }

    // Attendre un peu pour éviter les doubles comptages
    const timer = setTimeout(() => {
      const pageTitle = document.title || pathname || 'Page'
      trackPageView(pageTitle)
    }, 1000)

    return () => clearTimeout(timer)
  }, [pathname, isAdminInterface, trackPageView])

  // Tracking automatique des clics sur les boutons et liens
  useEffect(() => {
    if (isAdminInterface) {
      return
    }

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // Trouver le bouton ou lien le plus proche
      const button = target.closest('button, a[href], [role="button"]')
      if (!button) return

      // Ignorer les éléments dans l'admin
      if (button.closest('[data-admin]')) return

      const buttonText = button.textContent?.trim() || ''
      const buttonId = button.id || button.getAttribute('data-button-id') || undefined
      const buttonUrl = button.getAttribute('href') || button.getAttribute('data-url') || undefined

      // Tracker les boutons
      if (button.tagName === 'BUTTON' || button.getAttribute('role') === 'button') {
        trackButtonClick(buttonText, buttonId, buttonUrl)
      }
      // Tracker les liens
      else if (button.tagName === 'A' && buttonUrl) {
        trackLinkClick(buttonText, buttonUrl)
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [isAdminInterface, trackButtonClick, trackLinkClick])

  return {
    trackAction,
    trackButtonClick,
    trackPageView,
    trackFormSubmit,
    trackLinkClick,
  }
}

