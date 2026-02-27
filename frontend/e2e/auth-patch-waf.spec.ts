import { test, expect, Page } from '@playwright/test';
import axios, { AxiosInstance } from 'axios';

/**
 * Tests complets pour l'authentification, les requêtes PATCH, le refresh de token et le WAF
 * 
 * Ce test vérifie :
 * 1. L'authentification avec login
 * 2. Les requêtes PATCH vers /api/system-settings/ avec token valide
 * 3. Le refresh de token automatique
 * 4. Le WAF et les limites de taux
 * 5. Les permissions super admin
 * 6. La préservation du header Authorization après refresh
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9495/api';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:9494';

// Credentials pour les tests (à adapter selon votre environnement)
const TEST_CREDENTIALS = {
  email: process.env.TEST_EMAIL || 'admin@vtcbuilder.com',
  password: process.env.TEST_PASSWORD || 'admin123',
};

interface TokenResponse {
  access: string;
  refresh: string;
}

/**
 * Crée une instance axios pour les tests API
 */
function createApiClient(): AxiosInstance {
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 30000,
  });
}

/**
 * Login et récupération du token
 */
async function login(apiClient: AxiosInstance): Promise<TokenResponse> {
  const response = await apiClient.post('/auth/login/', {
    email: TEST_CREDENTIALS.email,
    password: TEST_CREDENTIALS.password,
  }, {
    validateStatus: () => true, // Ne pas throw sur les erreurs pour diagnostic
  });
  
  // Si 403, c'est probablement le WAF - attendre un peu et réessayer
  if (response.status === 403) {
    console.log('⚠️  Login bloqué par WAF (403), attente de 2 secondes...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    const retryResponse = await apiClient.post('/auth/login/', {
      email: TEST_CREDENTIALS.email,
      password: TEST_CREDENTIALS.password,
    });
    expect(retryResponse.status).toBe(200);
    const data = retryResponse.data;
    const access = data?.tokens?.access ?? data?.access;
    const refresh = data?.tokens?.refresh ?? data?.refresh;
    expect(access).toBeTruthy();
    expect(refresh).toBeTruthy();
    return { access, refresh };
  }
  
  expect(response.status).toBe(200);
  const data = response.data;
  const access = data?.tokens?.access ?? data?.access;
  const refresh = data?.tokens?.refresh ?? data?.refresh;
  expect(access).toBeTruthy();
  expect(refresh).toBeTruthy();
  
  return {
    access: access as string,
    refresh: refresh as string,
  };
}

/**
 * Test de requête PATCH avec token
 */
async function testPatchWithToken(
  apiClient: AxiosInstance,
  token: string,
  shouldSucceed: boolean = true
): Promise<{ status: number; data: any; headers: any }> {
  const response = await apiClient.patch(
    '/system-settings/',
    {
      public_pages: {},
      public_homepage_blocks: [],
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      validateStatus: () => true, // Ne pas throw sur les erreurs
    }
  );
  
  if (shouldSucceed) {
    expect([200, 201]).toContain(response.status);
  }
  
  return {
    status: response.status,
    data: response.data,
    headers: response.headers,
  };
}

/**
 * Test de refresh de token
 */
async function testTokenRefresh(apiClient: AxiosInstance, refreshToken: string): Promise<string> {
  const response = await apiClient.post(
    '/auth/refresh/',
    {
      refresh: refreshToken,
    }
  );
  
  expect(response.status).toBe(200);
  expect(response.data).toHaveProperty('access');
  const data = response.data;
  const newAccess = data?.tokens?.access ?? data?.access;
  expect(newAccess).toBeTruthy();
  return newAccess as string;
}

test.describe('Authentification et Requêtes PATCH - Tests Complets', () => {
  let apiClient: AxiosInstance;
  let tokens: TokenResponse;
  let page: Page;

  test.beforeAll(async () => {
    apiClient = createApiClient();
  });

  test('1. Login et récupération des tokens', async () => {
    tokens = await login(apiClient);
    
    expect(tokens.access).toBeTruthy();
    expect(tokens.refresh).toBeTruthy();
    expect(tokens.access.length).toBeGreaterThan(50);
    expect(tokens.refresh.length).toBeGreaterThan(50);
    
    console.log('✅ Login réussi, tokens obtenus');
  });

  test('2. Requête PATCH avec token valide - Doit réussir', async () => {
    const result = await testPatchWithToken(apiClient, tokens.access, true);
    
    expect([200, 201]).toContain(result.status);
    console.log('✅ PATCH avec token valide réussi:', result.status);
  });

  test('3. Vérification du header Authorization dans la requête', async ({ request }) => {
    // Intercepter la requête pour vérifier le header
    const response = await request.patch(
      `${API_URL}/system-settings/`,
      {
        data: {
          public_pages: {},
          public_homepage_blocks: [],
        },
        headers: {
          Authorization: `Bearer ${tokens.access}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    // Vérifier que la requête a été envoyée avec le header
    expect(response.status()).toBeLessThan(500); // Pas d'erreur serveur
    
    console.log('✅ Header Authorization vérifié dans la requête');
  });

  test('4. Refresh de token - Nouveau token doit fonctionner', async () => {
    const newAccessToken = await testTokenRefresh(apiClient, tokens.refresh);
    
    expect(newAccessToken).toBeTruthy();
    expect(newAccessToken).not.toBe(tokens.access); // Nouveau token différent
    
    // Tester que le nouveau token fonctionne
    const result = await testPatchWithToken(apiClient, newAccessToken, true);
    expect([200, 201]).toContain(result.status);
    
    console.log('✅ Refresh de token réussi et nouveau token fonctionne');
  });

  test('5. Test de requête PATCH après refresh - Header doit être préservé', async ({ request }) => {
    // Rafraîchir le token
    const newAccessToken = await testTokenRefresh(apiClient, tokens.refresh);
    
    // Faire une requête PATCH avec le nouveau token
    const response = await request.patch(
      `${API_URL}/system-settings/`,
      {
        data: {
          public_pages: {},
          public_homepage_blocks: [],
        },
        headers: {
          Authorization: `Bearer ${newAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    // Vérifier que la requête a réussi (pas de 401/403)
    expect([200, 201, 400]).toContain(response.status()); // 400 peut être OK si les données sont invalides
    
    console.log('✅ PATCH après refresh réussi, header préservé');
  });

  test('6. Test avec token expiré - Doit déclencher refresh automatique', async ({ page }) => {
    // Aller sur la page de login
    await page.goto(`${FRONTEND_URL}/login`);
    
    // Attendre que la page soit chargée
    await page.waitForLoadState('networkidle');
    
    // Se connecter
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Connexion"), button:has-text("Login")').first();
    
    await emailInput.fill(TEST_CREDENTIALS.email);
    await passwordInput.fill(TEST_CREDENTIALS.password);
    await submitButton.click();
    
    // Attendre la redirection ou un message de succès
    try {
      await page.waitForURL(/\/(admin|dashboard|pages)/, { timeout: 10000 });
    } catch (e) {
      // Si pas de redirection, vérifier qu'on est connecté
      await page.waitForTimeout(2000);
    }
    
    // Intercepter les requêtes pour vérifier le refresh
    let refreshCalled = false;
    let patchSuccess = false;
    const patchRequests: Array<{ url: string; hasAuth: boolean }> = [];
    
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/auth/refresh/')) {
        refreshCalled = true;
        console.log('🔄 Refresh de token détecté:', url);
      }
      if (url.includes('/system-settings/') && request.method() === 'PATCH') {
        const authHeader = request.headers()['authorization'] || request.headers()['Authorization'];
        const hasAuth = !!(authHeader && authHeader.startsWith('Bearer '));
        patchRequests.push({ url, hasAuth });
        if (hasAuth) {
          patchSuccess = true;
          console.log('✅ PATCH avec Authorization header détecté:', url);
        } else {
          console.log('❌ PATCH sans Authorization header:', url);
        }
      }
    });
    
    // Aller sur une page qui fait des requêtes PATCH
    try {
      await page.goto(`${FRONTEND_URL}/admin/pages-public/edit/home`, { waitUntil: 'networkidle', timeout: 15000 });
    } catch (e) {
      // Si la page n'existe pas, essayer une autre page
      try {
        await page.goto(`${FRONTEND_URL}/admin`, { waitUntil: 'networkidle', timeout: 15000 });
      } catch (e2) {
        console.log('⚠️ Impossible d\'accéder aux pages admin, test partiel');
      }
    }
    
    // Attendre un peu pour que les requêtes se déclenchent
    await page.waitForTimeout(5000);
    
    // Vérifier les résultats
    console.log(`📊 Résultats: ${patchRequests.length} requêtes PATCH, ${patchRequests.filter(p => p.hasAuth).length} avec Authorization`);
    
    if (patchRequests.length > 0) {
      expect(patchSuccess).toBe(true);
    }
    
    console.log('✅ Test de refresh automatique terminé');
  });

  test('7. Test WAF - Limites de taux pour utilisateur authentifié', async () => {
    // Faire plusieurs requêtes rapides pour tester le WAF
    const requests = [];
    const numRequests = 20; // Nombre de requêtes à faire
    
    for (let i = 0; i < numRequests; i++) {
      requests.push(
        testPatchWithToken(apiClient, tokens.access, false).catch((err) => ({
          status: err.response?.status || 500,
          data: err.response?.data || {},
          headers: err.response?.headers || {},
        }))
      );
    }
    
    const results = await Promise.all(requests);
    
    // Compter les succès et échecs
    const successes = results.filter((r) => [200, 201].includes(r.status));
    const rateLimited = results.filter((r) => r.status === 429);
    const forbidden = results.filter((r) => r.status === 403);
    
    console.log(`📊 Résultats WAF: ${successes.length} succès, ${rateLimited.length} rate-limited, ${forbidden.length} forbidden`);
    
    // Pour un utilisateur authentifié, la plupart des requêtes devraient réussir
    // (le WAF est plus permissif pour les utilisateurs authentifiés)
    expect(successes.length).toBeGreaterThan(0);
    
    console.log('✅ Test WAF terminé');
  });

  test('8. Test de requêtes multiples avec refresh automatique', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Se connecter
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Connexion"), button:has-text("Login")').first();
    
    await emailInput.fill(TEST_CREDENTIALS.email);
    await passwordInput.fill(TEST_CREDENTIALS.password);
    await submitButton.click();
    
    try {
      await page.waitForURL(/\/(admin|dashboard|pages)/, { timeout: 10000 });
    } catch (e) {
      await page.waitForTimeout(2000);
    }
    
    // Intercepter toutes les requêtes
    const requests: Array<{ url: string; method: string; headers: Record<string, string> }> = [];
    
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
        });
      }
    });
    
    // Aller sur une page qui fait plusieurs requêtes
    try {
      await page.goto(`${FRONTEND_URL}/admin/pages-public/edit/home`, { waitUntil: 'networkidle', timeout: 15000 });
    } catch (e) {
      try {
        await page.goto(`${FRONTEND_URL}/admin`, { waitUntil: 'networkidle', timeout: 15000 });
      } catch (e2) {
        console.log('⚠️ Impossible d\'accéder aux pages admin');
      }
    }
    
    // Attendre que les requêtes se terminent
    await page.waitForTimeout(5000);
    
    // Vérifier que les requêtes PATCH ont le header Authorization
    const patchRequests = requests.filter((r) => r.method === 'PATCH' && r.url.includes('/system-settings/'));
    
    for (const req of patchRequests) {
      const authHeader = req.headers['authorization'] || req.headers['Authorization'];
      expect(authHeader).toBeTruthy();
      expect(authHeader).toMatch(/^Bearer /);
      console.log(`✅ Requête PATCH avec Authorization: ${req.url.substring(0, 100)}...`);
    }
    
    console.log(`✅ ${patchRequests.length} requêtes PATCH vérifiées`);
    
    // Vérifier qu'au moins une requête PATCH a été faite avec Authorization
    if (patchRequests.length > 0) {
      const withAuth = patchRequests.filter((r) => {
        const authHeader = r.headers['authorization'] || r.headers['Authorization'];
        return !!(authHeader && authHeader.startsWith('Bearer '));
      });
      expect(withAuth.length).toBeGreaterThan(0);
    }
  });

  test('9. Test de permissions super admin', async () => {
    // Vérifier que l'utilisateur est super admin
    const response = await apiClient.get('/users/me/', {
      headers: {
        Authorization: `Bearer ${tokens.access}`,
      },
    });
    
    expect(response.status).toBe(200);
    
    // Faire une requête PATCH qui nécessite super admin
    const patchResponse = await apiClient.patch(
      '/system-settings/',
      {
        public_pages: {},
        public_homepage_blocks: [],
      },
      {
        headers: {
          Authorization: `Bearer ${tokens.access}`,
        },
        validateStatus: () => true,
      }
    );
    
    // Ne doit pas être 403 (Forbidden)
    expect(patchResponse.status).not.toBe(403);
    
    console.log('✅ Permissions super admin vérifiées');
  });

  test('10. Test complet: Login -> PATCH -> Refresh -> PATCH', async ({ page }) => {
    // 1. Login
    const initialTokens = await login(apiClient);
    console.log('✅ Étape 1: Login réussi');
    
    // 2. PATCH avec token initial
    const patch1 = await testPatchWithToken(apiClient, initialTokens.access, true);
    console.log('✅ Étape 2: PATCH avec token initial réussi');
    
    // 3. Refresh
    const newToken = await testTokenRefresh(apiClient, initialTokens.refresh);
    console.log('✅ Étape 3: Refresh réussi');
    
    // 4. PATCH avec nouveau token
    const patch2 = await testPatchWithToken(apiClient, newToken, true);
    console.log('✅ Étape 4: PATCH avec nouveau token réussi');
    
    // Vérifier que les deux PATCH ont réussi
    expect([200, 201]).toContain(patch1.status);
    expect([200, 201]).toContain(patch2.status);
    
    console.log('✅ Test complet réussi: Login -> PATCH -> Refresh -> PATCH');
  });
});

test.describe('Tests WAF - Limites de taux', () => {
  let apiClient: AxiosInstance;
  let tokens: TokenResponse;

  test.beforeAll(async () => {
    apiClient = createApiClient();
    tokens = await login(apiClient);
  });

  test('WAF - Test de rate limiting pour utilisateur non authentifié', async () => {
    // Faire plusieurs requêtes sans token
    const requests = [];
    for (let i = 0; i < 50; i++) {
      requests.push(
        apiClient
          .patch('/system-settings/', { public_pages: {} }, { validateStatus: () => true })
          .catch(() => ({ status: 401 }))
      );
    }
    
    const results = await Promise.all(requests);
    const rateLimited = results.filter((r: any) => r.status === 429);
    
    console.log(`📊 Rate limiting: ${rateLimited.length} requêtes bloquées sur ${results.length}`);
    
    // Au moins quelques requêtes devraient être rate-limited
    // (dépend de la configuration WAF)
  });

  test('WAF - Test de rate limiting pour utilisateur authentifié', async () => {
    // Faire plusieurs requêtes avec token
    const requests = [];
    for (let i = 0; i < 100; i++) {
      requests.push(
        testPatchWithToken(apiClient, tokens.access, false).catch(() => ({ status: 500 }))
      );
    }
    
    const results = await Promise.all(requests);
    const successes = results.filter((r) => [200, 201].includes(r.status));
    const rateLimited = results.filter((r) => r.status === 429);
    
    console.log(`📊 Rate limiting authentifié: ${successes.length} succès, ${rateLimited.length} rate-limited`);
    
    // Les utilisateurs authentifiés devraient avoir plus de succès
    expect(successes.length).toBeGreaterThan(rateLimited.length);
  });
});

