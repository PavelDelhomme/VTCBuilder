/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: true,
  // Désactiver ESLint pendant le build pour éviter que les warnings bloquent
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Désactiver TypeScript pendant le build (les erreurs sont déjà vérifiées par le linter)
  typescript: {
    ignoreBuildErrors: false, // Garder les erreurs TypeScript réelles
  },
  // Optimisation: Compression et optimisation des bundles
  compress: true,
  poweredByHeader: false,  // Masquer le header X-Powered-By pour la sécurité
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9495',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.1.134',
        port: '',
        pathname: '/**',
      },
    ],
    // Optimisation: Limiter la taille des images
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // Configuration pour résoudre les imports @/
  webpack: (config, { dev, isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    }
    
    // Désactiver la création de vendor-chunks en développement pour éviter les erreurs MODULE_NOT_FOUND
    if (dev) {
      // En développement, utiliser la configuration par défaut de Next.js
      return config
    }
    
    // Optimisation: Réduire la taille des bundles en production
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'async',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      }
    }
    
    return config
  },
  // Optimisation: Réduire la consommation mémoire en développement
  onDemandEntries: {
    // Garder les pages en mémoire pendant 25 secondes (au lieu de 60 par défaut)
    maxInactiveAge: 25 * 1000,
    // Nombre de pages à garder simultanément
    pagesBufferLength: 2,
  },
  // Assurer que les fichiers statiques sont servis correctement
  outputFileTracingIncludes: {
    '/**': ['./**/*'],
  },
}

module.exports = nextConfig

