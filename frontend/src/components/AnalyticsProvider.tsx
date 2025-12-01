'use client'

import { useEffect, ReactNode } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'

interface AnalyticsProviderProps {
  children: ReactNode
}

export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // Initialiser le tracking automatique
  useAnalytics()

  return <>{children}</>
}

