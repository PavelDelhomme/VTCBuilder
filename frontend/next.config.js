/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: true,
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
  },
  // Configuration pour résoudre les imports @/
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    }
    return config
  },
  // Configuration pour le développement
  devIndicators: {
    buildActivity: true,
  },
  // Assurer que les fichiers statiques sont servis correctement
  experimental: {
    outputFileTracingIncludes: {
      '/**': ['./**/*'],
    },
  },
}

module.exports = nextConfig

