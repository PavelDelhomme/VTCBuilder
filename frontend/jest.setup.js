// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Réduire le bruit console en CI ou quand JEST_SILENT=1 (ex: make test-editor)
if (process.env.JEST_SILENT === '1' || process.env.CI === 'true') {
  const noop = () => {}
  global.console.log = noop
  global.console.warn = noop
  global.console.info = noop
  global.console.debug = noop
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

