'use client'

import LoadingSpinner from './LoadingSpinner'

interface PageLoaderProps {
  text?: string
}

export default function PageLoader({ text = 'Chargement...' }: PageLoaderProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

