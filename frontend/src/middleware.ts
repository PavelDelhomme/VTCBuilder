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
  
  // Ignorer les routes API et statiques
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/static/') ||
    url.pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }
  
  // Extraire le sous-domaine
  const hostnameParts = hostname.split(':')
  const domain = hostnameParts[0]
  const parts = domain.split('.')
  
  // Vérifier si c'est un sous-domaine tenant (pas localhost ni www)
  if (
    domain !== 'localhost' &&
    domain !== '127.0.0.1' &&
    parts.length > 1 &&
    parts[0] !== 'www' &&
    parts[0] !== 'api' &&
    parts[0] !== 'admin'
  ) {
    const tenantSlug = parts[0]
    
    // Vérifier/créer le tenant via l'API backend
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
      })
      
      if (!checkResponse.ok) {
        console.warn(`[Middleware] Erreur vérification tenant ${tenantSlug}:`, checkResponse.status)
      }
    } catch (error) {
      // Ne pas bloquer la requête si l'API n'est pas disponible
      console.warn(`[Middleware] Impossible de vérifier/créer le tenant ${tenantSlug}:`, error)
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

