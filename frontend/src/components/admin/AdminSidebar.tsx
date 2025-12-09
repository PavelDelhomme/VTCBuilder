'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import authService from '@/services/auth.service'
import { useTheme } from '@/contexts/ThemeContext'
import projectService, { Project } from '@/services/project.service'
import { useNavigationLoading } from '@/hooks/useNavigationLoading'

interface MenuItem {
  name: string
  href: string
  icon: React.ReactNode
  isAccordion?: boolean
}

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function AdminSidebar({ isOpen: externalIsOpen, onClose }: AdminSidebarProps = {}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isNavigating, navigate } = useNavigationLoading()
  const [isOpen, setIsOpen] = useState(false) // Sidebar fermé par défaut (sera géré par le parent)
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [projectsExpanded, setProjectsExpanded] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [selectedTenantFilter, setSelectedTenantFilter] = useState<number | null>(null)
  const [contentExpanded, setContentExpanded] = useState(false)
  const [clientsExpanded, setClientsExpanded] = useState(false)
  const { resolvedTheme, toggleTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    setUser(authService.getStoredUser())
  }, [])

  // Load projects when accordion is expanded
  useEffect(() => {
    if (projectsExpanded && projects.length === 0 && !loadingProjects) {
      loadProjects()
    }
  }, [projectsExpanded])

  const loadProjects = async () => {
    try {
      setLoadingProjects(true)
      const data = await projectService.getAll()
      setProjects(data)
    } catch (error) {
      console.error('Erreur chargement projets:', error)
      setProjects([])
    } finally {
      setLoadingProjects(false)
    }
  }

  // Use external control if provided, otherwise use internal state
  const sidebarOpen = externalIsOpen !== undefined ? externalIsOpen : isOpen
  const handleClose = onClose || (() => setIsOpen(false))

  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Statistiques',
      href: '/admin/stats',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: 'Facturation',
      href: '/admin/billing',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'Gestion',
      href: '#',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
        </svg>
      ),
      isAccordion: true,
    },
    {
      name: 'Clients',
      href: '#',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      isAccordion: true,
    },
    {
      name: 'Projets',
      href: '/admin/projects',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      isAccordion: true,
    },
    {
      name: 'Cybersécurité',
      href: '/admin/security',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      name: 'Paramètres',
      href: '/admin/settings',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      name: 'Voir le site',
      href: '/',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      ),
    },
  ]

  const isActive = (href: string) => {
    // Exact match for dashboard
    if (href === '/admin/dashboard') {
      return pathname === '/admin/dashboard'
    }
    // Don't mark "Voir le site" as active when in admin
    if (href === '/') {
      return false
    }
    // For other routes, check if pathname starts with href
    return pathname.startsWith(href)
  }

  const handleItemClick = (href: string) => {
    router.push(href)
    // Fermer le sidebar sur mobile après navigation, garder ouvert sur desktop
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      handleClose()
    }
  }

  return (
    <>
      {/* Overlay - visible seulement sur mobile quand sidebar est ouverte */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col ${
          sidebarOpen 
            ? 'translate-x-0' 
            : '-translate-x-full'
        }`}
        suppressHydrationWarning
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-blue-600">VTCBuilder</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400" suppressHydrationWarning>
              {mounted && authService.isSuperAdmin() ? 'Super Admin' : 'Admin'}
            </p>
          </div>
          {/* Close button - toujours visible pour pouvoir fermer */}
          <button
            onClick={handleClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 transition-colors"
            aria-label="Fermer le menu"
            title="Fermer le menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" suppressHydrationWarning>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 mt-6 overflow-y-auto">
          {menuItems.map((item) => {
            const active = isActive(item.href)
            
            // Handle accordion for "Gestion" (Templates, Blocs, Call-to-Actions)
            if (item.isAccordion && item.name === 'Gestion') {
              const isGestionActive = pathname.startsWith('/admin/templates') || 
                                      pathname.startsWith('/admin/blocks')
              
              const gestionItems = [
                {
                  name: 'Templates',
                  href: '/admin/templates',
                  icon: (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  ),
                },
                {
                  name: 'Blocs',
                  href: '/admin/blocks',
                  icon: (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                    </svg>
                  ),
                },
                {
                  name: 'Call-to-Actions',
                  href: '/admin/blocks/call-to-actions',
                  icon: (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                },
              ]

              return (
                <div key={`accordion-gestion`}>
                  <button
                    onClick={() => setContentExpanded(!contentExpanded)}
                    className={`w-full flex items-center justify-between px-6 py-3 text-sm font-medium transition-colors ${
                      isGestionActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-r-4 border-blue-700 dark:border-blue-400'
                        : 'text-gray-600 dark:text-gray-400 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 hover:text-gray-900 dark:text-gray-100 dark:hover:text-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className={isGestionActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}>
                        {item.icon}
                      </span>
                      <span className="ml-3">{item.name}</span>
                    </div>
                    <svg
                      className={`h-4 w-4 transition-transform duration-200 ${contentExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {contentExpanded && (
                    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800/30 border-t border-gray-200 dark:border-gray-700 shadow-inner">
                      <div className="py-1">
                        {gestionItems.map((gestionItem) => {
                          const isGestionItemActive = pathname.startsWith(gestionItem.href)
                          return (
                            <button
                              key={gestionItem.href}
                              onClick={() => {
                                router.push(gestionItem.href)
                                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                                  handleClose()
                                }
                              }}
                              className={`w-full flex items-center gap-2.5 px-8 py-2.5 text-sm font-medium transition-all duration-200 group ${
                                isGestionItemActive
                                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/70 hover:pl-9 border-l-4 border-transparent'
                              }`}
                            >
                              <span className={isGestionItemActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400'}>
                                {gestionItem.icon}
                              </span>
                              <span>{gestionItem.name}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            // Handle accordion for "Clients" (Tenants, Utilisateurs)
            if (item.isAccordion && item.name === 'Clients') {
              const isClientsActive = pathname.startsWith('/admin/tenants') || 
                                      pathname.startsWith('/admin/users')
              
              const clientsItems = [
                {
                  name: 'Tenants',
                  href: '/admin/tenants',
                  icon: (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ),
                },
                {
                  name: 'Utilisateurs',
                  href: '/admin/users',
                  icon: (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ),
                },
              ]

              return (
                <div key={`accordion-${item.name}`}>
                  <button
                    onClick={() => setClientsExpanded(!clientsExpanded)}
                    className={`w-full flex items-center justify-between px-6 py-3 text-sm font-medium transition-colors ${
                      isClientsActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-r-4 border-blue-700 dark:border-blue-400'
                        : 'text-gray-600 dark:text-gray-400 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 hover:text-gray-900 dark:text-gray-100 dark:hover:text-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className={isClientsActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}>
                        {item.icon}
                      </span>
                      <span className="ml-3">{item.name}</span>
                    </div>
                    <svg
                      className={`h-4 w-4 transition-transform duration-200 ${clientsExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {clientsExpanded && (
                    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800/30 border-t border-gray-200 dark:border-gray-700 shadow-inner">
                      <div className="py-1">
                        {clientsItems.map((clientItem) => {
                          const isClientItemActive = pathname.startsWith(clientItem.href)
                          return (
                            <button
                              key={clientItem.href}
                              onClick={() => {
                                router.push(clientItem.href)
                                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                                  handleClose()
                                }
                              }}
                              className={`w-full flex items-center gap-2.5 px-8 py-2.5 text-sm font-medium transition-all duration-200 group ${
                                isClientItemActive
                                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/70 hover:pl-9 border-l-4 border-transparent'
                              }`}
                            >
                              <span className={isClientItemActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400'}>
                                {clientItem.icon}
                              </span>
                              <span>{clientItem.name}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            }

            // Handle accordion for Projects
            if (item.isAccordion && item.name === 'Projets') {
              const isProjectsActive = pathname.startsWith('/admin/projects') || pathname.startsWith('/admin/pages-public')
              const systemProjects = projects.filter(p => p.is_system_project)
              const tenantProjects = projects.filter(p => !p.is_system_project)
              const filteredTenantProjects = selectedTenantFilter 
                ? tenantProjects.filter(p => p.tenant?.id === selectedTenantFilter)
                : tenantProjects
              
              // Get unique tenants for filter
              const uniqueTenants = Array.from(
                new Map(tenantProjects.map(p => [p.tenant?.id, p.tenant])).entries()
              ).filter(([id]) => id !== null && id !== undefined)

              return (
                <div key={`accordion-projects`}>
                  <button
                    onClick={() => {
                      if (projectsExpanded) {
                        setProjectsExpanded(false)
                      } else {
                        setProjectsExpanded(true)
                        if (projects.length === 0) {
                          loadProjects()
                        }
                      }
                    }}
                    className={`w-full flex items-center justify-between px-6 py-3 text-sm font-medium transition-colors ${
                      isProjectsActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-r-4 border-blue-700 dark:border-blue-400'
                        : 'text-gray-600 dark:text-gray-400 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 hover:text-gray-900 dark:text-gray-100 dark:hover:text-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className={isProjectsActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}>
                        {item.icon}
                      </span>
                      <span className="ml-3">{item.name}</span>
                    </div>
                    <svg
                      className={`h-4 w-4 transition-transform duration-200 ${projectsExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {projects.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400">
                        {projects.length}
                      </span>
                    )}
                  </button>
                  
                  {/* Accordion Content */}
                  {projectsExpanded && (
                    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-800/30 border-t border-gray-200 dark:border-gray-700 shadow-inner">
                      {/* View All Projects Button - En haut */}
                      <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
                        <button
                          onClick={() => {
                            navigate('/admin/projects')
                            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                              handleClose()
                            }
                          }}
                          disabled={isNavigating}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 group disabled:opacity-50 disabled:cursor-wait"
                        >
                          <span className="flex items-center gap-2">
                            {isNavigating ? (
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                              </svg>
                            )}
                            {isNavigating ? 'Chargement...' : 'Voir tous les projets'}
                          </span>
                          {!isNavigating && (
                            <svg className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </button>
                      </div>

                      {/* Filter by Tenant */}
                      {uniqueTenants.length > 0 && (
                        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
                          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                            Filtrer par tenant
                          </label>
                          <select
                            value={selectedTenantFilter || ''}
                            onChange={(e) => setSelectedTenantFilter(e.target.value ? parseInt(e.target.value) : null)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
                          >
                            <option value="">🌐 Tous les tenants</option>
                            {uniqueTenants.map(([id, tenant]) => (
                              <option key={id} value={id}>
                                {tenant?.name || `Tenant ${id}`}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* System Projects (Admin) */}
                      {systemProjects.length > 0 && (
                        <>
                          <div className="px-6 py-3 bg-blue-50/50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2">
                              <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                                Projet Système
                              </span>
                            </div>
                          </div>
                          <div className="py-1">
                            {systemProjects.map((project) => {
                              const isProjectActive = pathname === `/admin/projects/${project.id}` || 
                                (pathname.startsWith('/admin/pages-public') && project.is_system_project)
                              return (
                                <button
                                  key={project.id}
                                  onClick={() => {
                                    router.push(`/admin/projects/${project.id}`)
                                    handleClose()
                                  }}
                                  className={`w-full flex items-center justify-between px-8 py-2.5 text-sm font-medium transition-all duration-200 group ${
                                    isProjectActive
                                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400'
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/70 hover:pl-9 border-l-4 border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                    <svg className={`h-4 w-4 flex-shrink-0 ${isProjectActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                      <div className="truncate font-medium">{project.name}</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                        🔧 Pages publiques VTCBuilder
                                      </div>
                                    </div>
                                  </div>
                                  {project.pages_count !== undefined && project.pages_count > 0 && (
                                    <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${
                                      isProjectActive
                                        ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                    }`}>
                                      {project.pages_count}
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                          {/* Separator */}
                          {filteredTenantProjects.length > 0 && (
                            <div className="px-6 py-3 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent">
                              <div className="flex items-center gap-2">
                                <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                  Projets Tenants
                                </span>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Tenant Projects */}
                      {loadingProjects ? (
                        <div className="px-8 py-6 flex items-center justify-center">
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Chargement des projets...</span>
                          </div>
                        </div>
                      ) : filteredTenantProjects.length > 0 ? (
                        <div className="py-1">
                          {filteredTenantProjects.map((project) => {
                            const isProjectActive = pathname === `/admin/projects/${project.id}`
                            return (
                              <button
                                key={project.id}
                                onClick={() => {
                                  router.push(`/admin/projects/${project.id}`)
                                  handleClose()
                                }}
                                className={`w-full flex items-center justify-between px-8 py-2.5 text-sm font-medium transition-all duration-200 group ${
                                  isProjectActive
                                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/70 hover:pl-9 border-l-4 border-transparent'
                                }`}
                              >
                                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                    <svg className={`h-4 w-4 flex-shrink-0 ${isProjectActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                      <div className="truncate font-medium">{project.name}</div>
                                      {project.tenant ? (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                          👤 {project.tenant.name}
                                        </div>
                                      ) : (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                          Projet sans client
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                {project.pages_count !== undefined && project.pages_count > 0 && (
                                  <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${
                                    isProjectActive
                                      ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                  }`}>
                                    {project.pages_count}
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="px-8 py-6 text-center">
                          <svg className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Aucun projet</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Créez votre premier projet</p>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              )
            }
            
            // Regular menu items
            return (
              <button
                key={item.href}
                onClick={() => handleItemClick(item.href)}
                className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-r-4 border-blue-700 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 hover:text-gray-900 dark:text-gray-100 dark:hover:text-gray-100'
                }`}
              >
                <span className={active ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}>
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
              <div suppressHydrationWarning>
                {mounted && user ? (
                  <>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || ''}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Admin</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">&nbsp;</p>
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  authService.logout()
                  router.push('/login')
                }}
                className="text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
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
