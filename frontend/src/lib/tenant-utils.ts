/**
 * Utilities for tenant subdomain detection and slug extraction
 */

/**
 * Check if the current domain is a tenant subdomain
 * Returns true if we're on a tenant subdomain (not localhost or main domain)
 */
export function isTenantSubdomain(): boolean {
  if (typeof window === 'undefined') return false; // SSR safety
  
  const hostname = window.location.hostname;
  
  // Localhost is always the main platform
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return false;
  }
  
  // Check if it's a subdomain (e.g., tenant1.localhost, demo-vtc-company.localhost)
  // In development, subdomains might be like: tenant1.localhost:9494
  // In production, subdomains would be like: tenant1.vtcbuilder.com
  const parts = hostname.split('.');
  
  // If we have more than 2 parts (e.g., tenant1.localhost or tenant1.vtcbuilder.com)
  // and it's not www, then it's likely a tenant subdomain
  if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'api') {
    return true;
  }
  
  // For localhost with port, check if there's a subdomain prefix
  // This handles cases like tenant1.localhost:9494
  if (hostname.includes('.localhost') && parts.length > 1) {
    return parts[0] !== 'www' && parts[0] !== 'api';
  }
  
  return false;
}

/**
 * Extract the tenant slug from the current domain
 * Returns the tenant slug or null if not on a tenant subdomain
 */
export function getTenantSlug(): string | null {
  if (typeof window === 'undefined') return null; // SSR safety
  
  if (!isTenantSubdomain()) {
    return null;
  }
  
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // The first part is usually the tenant slug
  // e.g., demo-vtc-company.localhost -> demo-vtc-company
  // e.g., tenant1.vtcbuilder.com -> tenant1
  if (parts.length > 0) {
    const slug = parts[0];
    // Filter out common prefixes that aren't tenant slugs
    if (slug && slug !== 'www' && slug !== 'api' && slug !== 'admin') {
      return slug;
    }
  }
  
  return null;
}

/**
 * Get the full tenant domain
 */
export function getTenantDomain(): string | null {
  if (typeof window === 'undefined') return null; // SSR safety
  
  if (!isTenantSubdomain()) {
    return null;
  }
  
  return window.location.hostname;
}

