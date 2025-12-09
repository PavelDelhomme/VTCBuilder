/**
 * Utilities for tenant subdomain detection and slug extraction
 */

/**
 * Check if a hostname is an IP address
 */
export function isIPAddress(hostname: string): boolean {
  // IPv4 pattern: xxx.xxx.xxx.xxx (where xxx is 0-255)
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Pattern.test(hostname)) {
    // Verify it's a valid IP (each part between 0-255)
    const parts = hostname.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }
  // IPv6 pattern (simplified check)
  if (hostname.includes(':')) {
    return true; // Likely IPv6
  }
  return false;
}

/**
 * Check if the current domain is a tenant subdomain
 * Returns true if we're on a tenant subdomain (not localhost, IP address, or main domain)
 */
export function isTenantSubdomain(): boolean {
  if (typeof window === 'undefined') return false; // SSR safety
  
  const hostname = window.location.hostname;
  
  // Localhost is always the main platform
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return false;
  }
  
  // IP addresses are always the main platform (not tenant subdomains)
  if (isIPAddress(hostname)) {
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
  
  const hostname = window.location.hostname;
  
  // IP addresses are never tenant subdomains
  if (isIPAddress(hostname)) {
    return null;
  }
  
  // Localhost is never a tenant subdomain
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null;
  }
  
  if (!isTenantSubdomain()) {
    return null;
  }
  
  const parts = hostname.split('.');
  
  // The first part is usually the tenant slug
  // e.g., demo-vtc-company.localhost -> demo-vtc-company
  // e.g., tenant1.vtcbuilder.com -> tenant1
  if (parts.length > 0) {
    const slug = parts[0];
    // Filter out common prefixes that aren't tenant slugs
    // Also filter out numeric-only slugs (likely IP addresses)
    if (slug && slug !== 'www' && slug !== 'api' && slug !== 'admin' && !/^\d+$/.test(slug)) {
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

