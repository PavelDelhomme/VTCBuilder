'use client'

import { ThemeProvider } from '@/contexts/ThemeContext'
import { FeaturesProvider } from '@/contexts/FeaturesContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <FeaturesProvider>
        {children}
      </FeaturesProvider>
    </ThemeProvider>
  )
}

