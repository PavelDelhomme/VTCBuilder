import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware pour gérer les sous-domaines tenant
 * - Détecte si on est sur un sous-domaine tenant
 * - Vérifie si le tenant existe, sinon le crée automatiquement
 */
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()
  
  // Ignorer les routes API, statiques, et admin
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/static/') ||
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname.startsWith('/admin/') ||
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/dashboard')
  ) {
    return NextResponse.next()
  }
  
  // Extraire le sous-domaine
  const hostnameParts = hostname.split(':')
  const domain = hostnameParts[0]
  const parts = domain.split('.')
  
  // Fonction pour vérifier si c'est une adresse IP
  const isIPAddress = (host: string): boolean => {
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Pattern.test(host)) {
      const parts = host.split('.');
      return parts.every(part => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
      });
    }
    return host.includes(':'); // IPv6
  };
  
  // Vérifier si c'est un sous-domaine tenant (pas localhost, IP, ni www)
  // Exclure aussi les tenants système
  const systemTenants = ['vtcbuilder-public-website', 'public', 'reference-tenant']
  
  if (
    domain !== 'localhost' &&
    domain !== '127.0.0.1' &&
    !isIPAddress(domain) && // Exclure les adresses IP
    parts.length > 1 &&
    parts[0] !== 'www' &&
    parts[0] !== 'api' &&
    parts[0] !== 'admin' &&
    !systemTenants.includes(parts[0]) // Exclure les tenants système
  ) {
    const tenantSlug = parts[0]
    
    // Vérifier/créer le tenant via l'API backend
    // Utiliser un timeout pour éviter les blocages
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 secondes timeout
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9495'
      const checkResponse = await fetch(`${apiUrl}/api/tenants/check-or-create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: tenantSlug,
          domain: domain,
        }),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (!checkResponse.ok) {
        // Ne logger que si ce n'est pas une erreur 404 (tenant n'existe pas, normal)
        if (checkResponse.status !== 404) {
          console.warn(`[Middleware] Error vérification tenant ${tenantSlug}:`, checkResponse.status)
        }
      }
    } catch (error: any) {
      clearTimeout(timeoutId)
      // Ne pas bloquer la requête si l'API n'est pas disponible ou timeout
      // Ne logger que les erreurs non-AbortError et seulement en mode développement
      if (error.name !== 'AbortError' && process.env.NODE_ENV === 'development') {
        // Ne logger que si ce n'est pas une erreur réseau normale (backend non démarré)
        if (!error.message?.includes('fetch failed') && !error.message?.includes('ECONNREFUSED')) {
          console.warn(`[Middleware] Impossible de vérifier/créer le tenant ${tenantSlug}:`, error.message)
        }
      }
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - admin (admin routes)
     * - login (login page)
     * - dashboard (dashboard routes)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|admin|login|dashboard).*)',
  ],
}

