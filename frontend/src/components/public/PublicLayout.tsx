'use client'

import PublicHeader from './PublicHeader'
import PublicFooter from './PublicFooter'

interface PublicLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export default function PublicLayout({ children, title, description }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        {title && (
          <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">{title}</h1>
              {description && (
                <p className="text-xl text-white/90 max-w-3xl">{description}</p>
              )}
            </div>
          </div>
        )}
        <div className="bg-white dark:bg-gray-800">
          {children}
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}

