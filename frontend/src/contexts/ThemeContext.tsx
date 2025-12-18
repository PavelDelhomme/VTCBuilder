'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark') // Mode sombre par défaut
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setThemeState(savedTheme)
    }
    setMounted(true)
  }, [])

  // Detect system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light')
      } else {
        setResolvedTheme(theme)
      }
    }

    updateResolvedTheme()

    // Listen for system theme changes
    mediaQuery.addEventListener('change', updateResolvedTheme)

    return () => {
      mediaQuery.removeEventListener('change', updateResolvedTheme)
    }
  }, [theme])

  // Apply theme to document - appliquer le mode sombre immédiatement même avant le mount
  useEffect(() => {
    const root = document.documentElement
    // Si pas encore monté, forcer le mode sombre par défaut
    if (!mounted) {
      root.classList.remove('light')
      root.classList.add('dark')
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#1f2937')
      }
      return
    }

    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#1f2937' : '#ffffff')
    }
  }, [resolvedTheme, mounted])
  
  // Appliquer le mode sombre immédiatement au chargement de la page
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light')
    root.classList.add('dark')
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#1f2937')
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

