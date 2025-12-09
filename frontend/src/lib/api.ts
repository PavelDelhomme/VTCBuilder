import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import authService from '@/services/auth.service';

// Déclaration pour les flags globaux
declare global {
  interface Window {
    __hasLoggedBlockedError?: boolean;
    __hasLoggedNetworkError?: boolean;
    __showReconnectModal?: () => void;
    __isRefreshingToken?: boolean;
    __failedQueue?: Array<{
      resolve: (value?: any) => void;
      reject: (error?: any) => void;
      config: InternalAxiosRequestConfig;
    }>;
  }
}

/**
 * Détermine dynamiquement l'URL de l'API selon l'environnement
 * - En production : utilise l'URL configurée
 * - En développement : détecte automatiquement selon le hostname
 *   - Sur localhost : http://localhost:9495
 *   - Sur sous-domaine tenant : http://localhost:9495 (même backend)
 */
function getApiUrl(): string {
  // En développement, détecter l'IP/hostname et utiliser le backend correspondant
  // Cette détection est prioritaire sur la variable d'environnement pour permettre l'accès depuis le réseau local
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Si on est sur 192.168.1.134, utiliser le backend sur la même IP
    if (hostname === '192.168.1.134' || hostname.includes('192.168.1.134')) {
      return `http://192.168.1.134:9495`;
    }
    
    // Si on est sur localhost ou 127.0.0.1, utiliser localhost:9495
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      return `http://localhost:9495`;
    }
  }
  
  // Si l'URL est définie via env et qu'on n'a pas détecté d'IP spécifique, l'utiliser
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Fallback par défaut
  return 'http://localhost:9495';
}

const API_URL = getApiUrl();

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 secondes timeout
});

// Intercepteur pour ajouter le token et gérer FormData
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Si on envoie un FormData, supprimer le Content-Type pour que le navigateur
  // définisse automatiquement le bon Content-Type avec le boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

// Liste des endpoints où les erreurs 404/401/500 sont attendues (ne pas les logger)
// Note: Les endpoints de création/modification (POST, PATCH, DELETE) ne doivent PAS être silencieux
// car ils indiquent un problème d'authentification qui doit être traité
const SILENT_ERROR_ENDPOINTS = [
  '/payment-methods/',
  '/system-settings/',
  '/billing/unpaid-items/',
  '/templates/',
  '/pricing-plans/', // Peut être en erreur temporaire
  '/users/impersonation-status/', // Endpoint optionnel (401 normal si non connecté)
  '/dashboard/', // Peut être en erreur temporaire (401 normal si non connecté)
  '/blocks/types/', // Peut être en erreur temporaire (401 normal si non connecté)
];

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const status = error.response?.status;
    
    // Marquer les erreurs 401 pour les endpoints silencieux comme silencieuses
    const isSilentError = SILENT_ERROR_ENDPOINTS.some(endpoint => url.includes(endpoint));
    if (status === 401 && isSilentError && !localStorage.getItem('token')) {
      // Supprimer l'erreur de la console en interceptant avant qu'elle soit loggée
      error.silent = true;
      // Ne pas afficher l'erreur dans la console
      error.config = error.config || {};
      error.config.silent = true;
    }
    
    // ERR_BLOCKED_BY_CLIENT est généralement causé par un bloqueur de publicité
    // Ne pas logger ces erreurs comme des erreurs critiques pour certains endpoints
    const silentEndpoints = [
      '/tenants/features/', 
      '/auth/login/',
      '/users/impersonation-status/',
      '/dashboard/',
      '/analytics/usage-stats/',
    ]
    const isSilentEndpoint = silentEndpoints.some(endpoint => url.includes(endpoint))
    
    // Gérer les erreurs bloquées par le client (bloqueur de pub)
    const isBlockedError = error.code === 'ERR_BLOCKED_BY_CLIENT' || 
                          error.message?.includes('ERR_BLOCKED_BY_CLIENT') ||
                          error.message?.includes('blocked by client');
    
    if (isBlockedError) {
      // Pour les endpoints silencieux, ne rien logger (géré dans FeaturesContext/authService)
      // Pour les autres endpoints critiques, logger une seule fois de manière discrète
      if (!isSilentEndpoint && !window.__hasLoggedBlockedError) {
        // Logger de manière discrète pour les endpoints critiques
        console.warn(`⚠️ Requête bloquée (bloqueur de publicité): ${url}`);
        console.warn('💡 Solution: Désactivez temporairement votre bloqueur de publicité pour localhost:9495');
        window.__hasLoggedBlockedError = true;
      }
      // Pour les endpoints silencieux, ne rien logger du tout
    } else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      // Erreurs réseau normales (backend non démarré, etc.)
      if (!isSilentEndpoint && !window.__hasLoggedNetworkError) {
        console.warn(`⚠️ Erreur réseau: ${url} (backend non accessible?)`);
        window.__hasLoggedNetworkError = true;
      }
    }
    
    // Liste des routes publiques où on ne doit PAS rediriger vers /login
    const publicRoutes = ['/', '/templates', '/pricing', '/about', '/contact'];
    const isPublicRoute = typeof window !== 'undefined' && publicRoutes.some(route => 
      window.location.pathname === route || window.location.pathname.startsWith(route + '/')
    );
    
    if (status === 401) {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      const hasToken = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      // Pour les endpoints silencieux avec 401, ne pas logger (c'est normal si non connecté)
      // Ces erreurs sont attendues et gérées gracieusement dans les composants
      // Utiliser isSilentError défini plus haut (ligne 100)
      if (isSilentError && !hasToken) {
        // Ne rien logger, c'est attendu - rejeter silencieusement
        // Supprimer l'erreur de la console en interceptant avant qu'elle soit loggée
        error.silent = true;
        return Promise.reject(error);
      }
      
      // Si on a un token et un refresh token, essayer de rafraîchir automatiquement
      // Ne pas rafraîchir pour l'endpoint de refresh lui-même pour éviter les boucles infinies
      if (hasToken && refreshToken && !originalRequest._retry && !url.includes('/auth/refresh/')) {
        originalRequest._retry = true;
        
        // Si on est déjà en train de rafraîchir, mettre en queue
        if (window.__isRefreshingToken) {
          return new Promise((resolve, reject) => {
            if (!window.__failedQueue) {
              window.__failedQueue = [];
            }
            window.__failedQueue.push({ resolve, reject, config: originalRequest });
          }).then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          }).catch((err) => {
            return Promise.reject(err);
          });
        }
        
        window.__isRefreshingToken = true;
        
        return authService.refreshToken().then((success) => {
          window.__isRefreshingToken = false;
          
          if (success) {
            // Traiter la queue des requêtes en attente
            if (window.__failedQueue) {
              window.__failedQueue.forEach(({ resolve }) => {
                const newToken = localStorage.getItem('token');
                resolve(newToken);
              });
              window.__failedQueue = [];
            }
            
            // Réessayer la requête originale avec le nouveau token
            const newToken = localStorage.getItem('token');
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return api(originalRequest);
          } else {
            // Refresh token invalide, sauvegarder l'état de l'éditeur et afficher le modal
            // L'état sera sauvegardé automatiquement par le contexte avant d'afficher le modal
            if (window.__showReconnectModal) {
              window.__showReconnectModal();
            }
            return Promise.reject(error);
          }
        }).catch((refreshError) => {
          window.__isRefreshingToken = false;
          
          // Traiter la queue des requêtes en attente avec erreur
          if (window.__failedQueue) {
            window.__failedQueue.forEach(({ reject }) => {
              reject(refreshError);
            });
            window.__failedQueue = [];
          }
          
          // Afficher le modal de reconnexion
          if (window.__showReconnectModal) {
            window.__showReconnectModal();
          }
          return Promise.reject(refreshError);
        });
      }
      
      // Si pas de token ou refresh token invalide, gérer selon le contexte
      const isModificationRequest = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(error.config?.method?.toUpperCase() || '');
      
      // Pour les endpoints silencieux, ne pas logger ni rediriger
      if (isSilentError) {
        return Promise.reject(error);
      }
      
      // Pour les requêtes de modification ou pages non publiques avec token, afficher le modal
      if ((isModificationRequest && hasToken) || (hasToken && !isPublicRoute)) {
        // Afficher le modal de reconnexion au lieu de rediriger
        if (window.__showReconnectModal) {
          window.__showReconnectModal();
        } else {
          // Fallback : rediriger si le modal n'est pas disponible
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
      
      // Ne pas logger les erreurs 401 - elles sont gérées gracieusement
    } else if (!isSilentError && status) {
      // Ne logger que les erreurs non attendues
      // (Les erreurs attendues sont gérées gracieusement dans les composants)
    }
    
    return Promise.reject(error);
  }
);

export default api;

