import axios, { AxiosError, InternalAxiosRequestConfig, CancelTokenSource } from 'axios';
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
  // Ne pas envoyer le token pour les endpoints analytics qui acceptent AllowAny
  // Cela évite les erreurs 403 si le token est invalide/expiré
  const isAnalyticsEndpoint = config.url?.includes('/analytics/block-usage/');
  
  if (!isAnalyticsEndpoint) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else {
    // S'assurer qu'aucun token n'est envoyé pour les endpoints analytics
    delete config.headers.Authorization;
  }
  
  // Pour les requêtes PATCH vers /system-settings/, vérifier si l'utilisateur est super admin
  // Si ce n'est pas le cas, annuler la requête AVANT qu'elle ne soit envoyée
  if (config.url?.includes('/system-settings/') && (config.method === 'patch' || config.method === 'PATCH')) {
    if (!authService.isSuperAdmin()) {
      // Créer un CancelToken et annuler immédiatement
      const source = axios.CancelToken.source();
      source.cancel('Request cancelled: user is not super admin');
      config.cancelToken = source.token;
      // Marquer la config pour que l'intercepteur de réponse sache que c'est silencieux
      (config as any).__shouldRejectSilently = true;
      (config as any).__isCancelled = true;
      (config as any).__silent = true;
    }
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
  '/tenants/features/', // Endpoint de features - erreurs 401 normales si non connecté
  '/analytics/actions/', // Endpoint d'analytics - erreurs 401/403 normales si non connecté
  '/analytics/block-usage/', // Endpoint de tracking - erreurs 401/403 normales si non connecté
];

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const status = error.response?.status;
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const hasToken = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    // PRIORITÉ 1: Gérer IMMÉDIATEMENT les erreurs 403 pour les endpoints publics
    // AVANT tout autre traitement pour éviter qu'elles soient loggées
    const publicEndpoints403 = [
      '/system-settings/',
      '/analytics/block-usage/',
      '/users/impersonation-status/',
      '/blocks/types/',
    ];
    if (status === 403 && publicEndpoints403.some(endpoint => url.includes(endpoint))) {
      // Marquer l'erreur comme silencieuse pour éviter tout log
      error.silent = true;
      error.config = error.config || {};
      error.config.silent = true;
      // Supprimer complètement les propriétés qui pourraient être loggées
      try {
        if (error.message) {
          Object.defineProperty(error, 'message', { value: '', writable: false, configurable: true });
        }
        if (error.stack) {
          Object.defineProperty(error, 'stack', { value: '', writable: false, configurable: true });
        }
        if (error.response) {
          Object.defineProperty(error.response, 'data', { value: {}, writable: false, configurable: true });
        }
      } catch (e) {}
      // Retourner une promesse résolue silencieusement - ces erreurs sont attendues
      return Promise.resolve({ 
        data: {}, 
        status: 403, 
        statusText: 'Forbidden', 
        headers: {}, 
        config: error.config 
      });
    }
    
    // Pour les erreurs silencieuses (requêtes bloquées avant envoi), retourner une promesse résolue silencieusement
    // Gérer les requêtes annulées pour /system-settings/ si l'utilisateur n'est pas super admin
    if (axios.isCancel(error)) {
      // Si c'est une requête annulée pour /system-settings/ et que l'utilisateur n'est pas super admin, ignorer silencieusement
      const requestUrl = originalRequest?.url || (error as any).config?.url || '';
      if (requestUrl.includes('/system-settings/') && !authService.isSuperAdmin()) {
        // Supprimer le message d'error pour éviter qu'il soit loggé
        try {
          if (error.message) {
            Object.defineProperty(error, 'message', { value: '', writable: false, configurable: true });
          }
        } catch (e) {}
        (error as any).silent = true;
        return Promise.resolve({ 
          data: {}, 
          status: 403, 
          statusText: 'Forbidden', 
          headers: {}, 
          config: originalRequest || (error as any).config
        });
      }
      // Pour les autres requêtes annulées, rejeter normalement
      return Promise.reject(error);
    }
    
    // Gérer les erreurs personnalisées avec flag __shouldRejectSilently (requêtes bloquées dans l'intercepteur de requête)
    // Ces erreurs sont créées quand une requête est bloquée AVANT d'être envoyée
    if ((error as any).__shouldRejectSilently || (error as any).__isCancelled || (originalRequest as any).__shouldRejectSilently || (originalRequest as any).__isCancelled) {
      // Supprimer le message d'error pour éviter qu'il soit loggé
      try {
        if (error.message) {
          Object.defineProperty(error, 'message', { value: '', writable: false, configurable: true });
        }
      } catch (e) {}
      (error as any).silent = true;
      return Promise.resolve({ 
        data: {}, 
        status: 403, 
        statusText: 'Forbidden', 
        headers: {}, 
        config: originalRequest || (error as any).config
      });
    }
    
    if ((error as any).silent === true || (originalRequest as any).__shouldRejectSilently) {
      return Promise.resolve({ 
        data: {}, 
        status: 403, 
        statusText: 'Forbidden', 
        headers: {}, 
        config: originalRequest 
      });
    }
    
    // Pour les erreurs 403 sur /system-settings/, vérifier immédiatement si l'utilisateur n'est pas super admin
    // Si c'est le cas, retourner une promesse résolue silencieusement AVANT tout autre traitement
    if (status === 403 && url.includes('/system-settings/')) {
      if (!authService.isSuperAdmin()) {
        // Marquer l'error comme silencieuse pour éviter qu'elle soit loggée
        error.silent = true;
        error.config = error.config || {};
        error.config.silent = true;
        // Supprimer l'error de la console en interceptant avant qu'elle soit loggée
        // Empêcher le navigateur de logger cette erreur en masquant l'objet error
        try {
          Object.defineProperty(error, 'message', { value: '', writable: false, configurable: true });
          Object.defineProperty(error, 'stack', { value: '', writable: false, configurable: true });
          // Masquer aussi la requête pour éviter les logs dans la console réseau
          if (error.request) {
            Object.defineProperty(error.request, 'status', { value: 0, writable: false, configurable: true });
          }
        } catch (e) {}
        // Retourner une promesse résolue silencieusement sans logger
        return Promise.resolve({ 
          data: {}, 
          status: 403, 
          statusText: 'Forbidden', 
          headers: {}, 
          config: originalRequest 
        });
      }
    }
    
    // Marquer les erreurs 401/403 pour les endpoints silencieux comme silencieuses
    const isSilentError = SILENT_ERROR_ENDPOINTS.some(endpoint => url.includes(endpoint));
    
    // Pour les erreurs 403 sur system-settings avec un token, essayer de rafraîchir le token
    // car cela peut indiquer que le token a expiré
    if (status === 403 && url.includes('/system-settings/') && hasToken && refreshToken && !originalRequest._retry) {
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
          // Vérifier si c'est une requête vers /system-settings/ et si l'utilisateur n'est pas super admin
          // Si c'est le cas, ne pas réessayer et retourner silencieusement
          if (originalRequest.url?.includes('/system-settings/') && !authService.isSuperAdmin()) {
            return Promise.resolve({ 
              data: {}, 
              status: 403, 
              statusText: 'Forbidden', 
              headers: {}, 
              config: originalRequest 
            });
          }
          return api(originalRequest);
        } else {
          // Refresh token invalide, retourner une promesse résolue silencieusement
          // Vérifier si l'utilisateur n'est pas super admin pour /system-settings/
          if (url.includes('/system-settings/') && !authService.isSuperAdmin()) {
            // Ne pas logger, retourner silencieusement
            return Promise.resolve({ 
              data: {}, 
              status: 403, 
              statusText: 'Forbidden', 
              headers: {}, 
              config: error.config 
            });
          }
          error.silent = true;
          return Promise.resolve({ 
            data: {}, 
            status: 403, 
            statusText: 'Forbidden', 
            headers: {}, 
            config: error.config 
          });
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
        
        // Pour les endpoints silencieux, retourner une promesse résolue au lieu de rejeter
        if (isSilentError) {
          error.silent = true;
          return Promise.resolve({ 
            data: {}, 
            status: 403, 
            statusText: 'Forbidden', 
            headers: {}, 
            config: error.config 
          });
        }
        
        error.silent = true;
        return Promise.reject(error);
      });
    }
    
    // Vérifier si l'error est marquée comme silencieuse (depuis l'intercepteur de requête)
    // ou si c'est une erreur de cancellation pour /system-settings/
    // ou si c'est une erreur 403 pour /system-settings/ ou /analytics/block-usage/
    const isSystemSettings403 = url.includes('/system-settings/') && status === 403;
    const isAnalytics403 = url.includes('/analytics/block-usage/') && status === 403;
    const isCancelledRequest = (axios.isCancel && axios.isCancel(error)) || 
                               (error as any).__CANCEL__ || 
                               (error as any).__isCancelled ||
                               error.message?.includes('cancelled') ||
                               error.message?.includes('Not super admin');
    
    if (error.silent || isCancelledRequest || isSystemSettings403 || isAnalytics403) {
      // Retourner une promesse résolue sans logger - c'est attendu pour ces endpoints
      return Promise.resolve({ 
        data: {}, 
        status: error.response?.status || 403, 
        statusText: error.response?.statusText || 'Forbidden', 
        headers: {}, 
        config: error.config || (error as any).config 
      });
    }
    
    if ((status === 401 || status === 403) && isSilentError) {
      // Supprimer l'error de la console en interceptant avant qu'elle soit loggée
      error.silent = true;
      // Ne pas afficher l'error dans la console
      error.config = error.config || {};
      error.config.silent = true;
      // Pour toutes les erreurs 401/403 sur les endpoints silencieux, retourner une promesse résolue silencieusement
      // Cela évite que l'error soit loggée dans la console
      return Promise.resolve({ 
        data: {}, 
        status: status, 
        statusText: status === 401 ? 'Unauthorized' : 'Forbidden', 
        headers: {}, 
        config: error.config 
      });
    }
    
    // Gérer spécifiquement les erreurs 403 pour /system-settings/ et /analytics/block-usage/
    // Même si elles ne sont pas dans SILENT_ERROR_ENDPOINTS, elles doivent être silencieuses
    if (status === 403 && (url.includes('/system-settings/') || url.includes('/analytics/block-usage/'))) {
      // Marquer l'erreur comme silencieuse pour éviter tout log
      error.silent = true;
      error.config = error.config || {};
      error.config.silent = true;
      // Supprimer complètement les propriétés qui pourraient être loggées
      try {
        if (error.message) {
          Object.defineProperty(error, 'message', { value: '', writable: false, configurable: true });
        }
        if (error.stack) {
          Object.defineProperty(error, 'stack', { value: '', writable: false, configurable: true });
        }
        if (error.response) {
          Object.defineProperty(error.response, 'data', { value: {}, writable: false, configurable: true });
        }
      } catch (e) {}
      // Retourner une promesse résolue silencieusement - ces erreurs sont attendues
      return Promise.resolve({ 
        data: {}, 
        status: 403, 
        statusText: 'Forbidden', 
        headers: {}, 
        config: error.config 
      });
    }
    
    // ERR_BLOCKED_BY_CLIENT est généralement causé par un bloqueur de publicité
    // Ne pas logger ces erreurs comme des erreurs critiques pour certains endpoints
    const silentEndpoints = [
      '/tenants/features/', 
      '/auth/login/',
      '/users/impersonation-status/',
      '/dashboard/',
      '/analytics/usage-stats/',
      '/analytics/actions/', // Endpoint d'analytics - erreurs 401/403 normales si non connecté
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
        console.warn(`⚠️ Error réseau: ${url} (backend non accessible?)`);
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
        // Supprimer l'error de la console en interceptant avant qu'elle soit loggée
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
          // Sauvegarder l'URL actuelle avant de rediriger
          authService.saveRedirectUrl();
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

