/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: true,
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
    
    // Optimisation: Réduire la taille des bundles en production
    if (!dev && !isServer) {
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
  // Configuration pour le développement
  devIndicators: {
    buildActivity: false,  // Désactiver pour économiser les ressources
  },
  // Assurer que les fichiers statiques sont servis correctement
  experimental: {
    outputFileTracingIncludes: {
      '/**': ['./**/*'],
    },
  },
  // Optimisation: Réduire la taille des pages
  swcMinify: true,
}

module.exports = nextConfig

