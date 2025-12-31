/**
 * Gestionnaire de requêtes pour éviter les requêtes en double
 * et sérialiser les requêtes après le login pour éviter le rate limiting WAF
 */

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

interface RequestCache {
  data: any;
  timestamp: number;
  ttl: number; // Time to live en millisecondes
}

class RequestManager {
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private cache: Map<string, RequestCache> = new Map();
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private lastRequestTime = 0;
  private minDelayBetweenRequests = 500; // 500ms entre chaque requête (augmenté pour éviter WAF)
  private cacheTTL = 15000; // 15 secondes de cache par défaut (augmenté)

  /**
   * Exécute une requête avec gestion du cache et des doublons
   */
  async execute<T>(
    key: string,
    requestFn: () => Promise<T>,
    options?: {
      cache?: boolean;
      cacheTTL?: number;
      skipQueue?: boolean;
    }
  ): Promise<T> {
    const {
      cache = true,
      cacheTTL = this.cacheTTL,
      skipQueue = false,
    } = options || {};

    // Vérifier le cache
    if (cache) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data as T;
      }
    }

    // Vérifier si une requête est déjà en cours
    const pending = this.pendingRequests.get(key);
    if (pending) {
      // Si la requête est récente (moins de 1 seconde), réutiliser la promesse
      if (Date.now() - pending.timestamp < 1000) {
        return pending.promise as Promise<T>;
      }
    }

    // Créer la requête
    const requestPromise = (async () => {
      try {
        // Si on ne skip pas la queue, ajouter un délai
        if (!skipQueue) {
          await this.waitForQueue();
        }

        const result = await requestFn();

        // Mettre en cache si activé
        if (cache) {
          this.cache.set(key, {
            data: result,
            timestamp: Date.now(),
            ttl: cacheTTL,
          });
        }

        return result;
      } finally {
        // Retirer de la liste des requêtes en cours
        this.pendingRequests.delete(key);
      }
    })();

    // Ajouter à la liste des requêtes en cours
    this.pendingRequests.set(key, {
      promise: requestPromise,
      timestamp: Date.now(),
    });

    return requestPromise;
  }

  /**
   * Attend que la queue soit disponible et ajoute un délai entre les requêtes
   */
  private async waitForQueue(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minDelayBetweenRequests) {
      const delay = this.minDelayBetweenRequests - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Vide le cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Vide le cache pour une clé spécifique
   */
  clearCacheKey(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Augmente le délai entre les requêtes (utile après le login)
   */
  setMinDelay(delay: number): void {
    this.minDelayBetweenRequests = delay;
  }

  /**
   * Réinitialise le délai à la valeur par défaut
   */
  resetMinDelay(): void {
    this.minDelayBetweenRequests = 500; // Réinitialiser à 500ms (valeur par défaut)
  }
}

// Instance singleton
export const requestManager = new RequestManager();

/**
 * Hook pour exécuter une requête avec gestion automatique
 */
export async function managedRequest<T>(
  key: string,
  requestFn: () => Promise<T>,
  options?: {
    cache?: boolean;
    cacheTTL?: number;
    skipQueue?: boolean;
  }
): Promise<T> {
  return requestManager.execute(key, requestFn, options);
}

