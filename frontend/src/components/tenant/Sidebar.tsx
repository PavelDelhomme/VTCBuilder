'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import authService from '@/services/auth.service'
import tenantService from '@/services/tenant.service'
import { isFeatureEnabled } from '@/lib/tenant-features'
import { useTheme } from '@/contexts/ThemeContext'

interface MenuItem {
  name: string
  href: string
  icon: React.ReactNode
  featureId?: string // Feature ID required to show/hide this menu item
}

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen: externalIsOpen, onClose }: SidebarProps = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const user = authService.getStoredUser()
  const [isOpen, setIsOpen] = useState(false)
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([])
  const { resolvedTheme, toggleTheme } = useTheme()

  // Use external control if provided, otherwise use internal state
  const sidebarOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen
  const handleClose = onClose || (() => setIsOpen(false))

  // Load enabled features for the tenant
  useEffect(() => {
    const loadEnabledFeatures = async () => {
      try {
        if (user?.tenant_id) {
          const tenant = await tenantService.getById(user.tenant_id)
          const features = tenant?.settings?.enabled_features || []
          // If no features configured, enable all by default (backward compatibility)
          setEnabledFeatures(features.length > 0 ? features : ['pages', 'media', 'services', 'bookings', 'users', 'templates', 'billing'])
        } else {
          // No tenant, enable all features (for super admin viewing tenant interface)
          setEnabledFeatures(['pages', 'media', 'services', 'bookings', 'users', 'templates', 'billing'])
        }
      } catch (error) {
        console.error('Error loading enabled features:', error)
        // On error, enable all features by default
        setEnabledFeatures(['pages', 'media', 'services', 'bookings', 'users', 'templates', 'billing'])
      }
    }

    if (user && user.tenant_id) {
      loadEnabledFeatures()
    } else if (user) {
      // User without tenant_id, enable all features by default
      setEnabledFeatures(['pages', 'media', 'services', 'bookings', 'users', 'templates', 'billing'])
    }
  }, [user?.tenant_id]) // Only depend on tenant_id to avoid infinite loops

  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      // Dashboard is always visible
    },
    {
      name: 'Projets',
      href: '/dashboard/projects',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      // Projects is always visible - tenants need to manage their projects
    },
    {
      name: 'Pages',
      href: '/dashboard/pages',
      featureId: 'pages',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Services VTC',
      href: '/dashboard/services',
      featureId: 'services',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      name: 'Réservations',
      href: '/dashboard/bookings',
      featureId: 'bookings',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Médias',
      href: '/dashboard/media',
      featureId: 'media',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Templates',
      href: '/dashboard/templates',
      featureId: 'templates',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
    {
      name: 'Utilisateurs',
      href: '/dashboard/users',
      featureId: 'users',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      name: 'Facturation',
      href: '/dashboard/billing',
      // Billing is always visible (payments feature controls payment methods)
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      name: 'Paramètres',
      href: '/dashboard/settings',
      // Settings is always visible
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ]

  // Filter menu items based on enabled features
  const visibleMenuItems = menuItems.filter(item => {
    // Always show items without featureId (Dashboard, Settings, Billing)
    if (!item.featureId) {
      return true
    }
    // Show item only if feature is enabled
    return isFeatureEnabled(item.featureId, enabledFeatures)
  })

  const handleItemClick = (href: string) => {
    router.push(href)
    handleClose() // Close sidebar on mobile after navigation
  }

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">VTCBuilder</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Le WordPress des VTC</p>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={handleClose}
            className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200"
            aria-label="Fermer le menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 mt-6 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            
            return (
              <button
                key={item.href}
                onClick={() => handleItemClick(item.href)}
                className={clsx(
                  'w-full flex items-center px-6 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-r-4 border-blue-700 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 hover:text-gray-900 dark:text-gray-100 dark:hover:text-gray-100'
                )}
              >
                <span className={clsx(isActive ? 'text-blue-700' : 'text-gray-400')}>
                  {item.icon}
                </span>
                <span className="ml-3">{item.name}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-900 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={resolvedTheme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300">
                {resolvedTheme === 'dark' ? '🌙 Mode sombre' : '☀️ Mode clair'}
              </span>
              <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {resolvedTheme === 'dark' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                )}
              </svg>
            </button>
            
            {/* User Info & Logout */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100" suppressHydrationWarning>
                  {user?.name || 'Utilisateur'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]" suppressHydrationWarning>
                  {user?.email || ''}
                </p>
              </div>
              <button
                onClick={() => {
                  authService.logout()
                  router.push('/login')
                }}
                className="text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                title="Déconnexion"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

