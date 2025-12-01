'use client'

import { ThemeProvider } from '@/contexts/ThemeContext'
import { FeaturesProvider } from '@/contexts/FeaturesContext'
import AnalyticsProvider from '@/components/AnalyticsProvider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <FeaturesProvider>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </FeaturesProvider>
    </ThemeProvider>
  )
}

