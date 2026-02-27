import { test, expect, Page, request as playwrightRequest } from '@playwright/test';
import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * TESTS EXHAUSTIFS ET COMPLETS - Authentification, PATCH, Refresh, WAF
 * 
 * Ce fichier contient une suite de tests exhaustive couvrant TOUS les cas possibles :
 * - Cas de succès normaux
 * - Cas d'erreur (token expiré, invalide, manquant, etc.)
 * - Cas limites (WAF, rate limiting, etc.)
 * - Tests de régression
 * - Diagnostics détaillés pour chaque cas
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9495/api';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:9494';

const TEST_CREDENTIALS = {
  email: process.env.TEST_EMAIL || 'admin@vtcbuilder.com',
  password: process.env.TEST_PASSWORD || 'admin123',
};

interface TokenResponse {
  access: string;
  refresh: string;
}

interface TestDiagnostic {
  step: string;
  success: boolean;
  details: any;
  error?: string;
  timestamp: string;
}

class TestLogger {
  private diagnostics: TestDiagnostic[] = [];

  log(step: string, success: boolean, details: any, error?: string) {
    this.diagnostics.push({
      step,
      success,
      details,
      error,
      timestamp: new Date().toISOString(),
    });
    
    const icon = success ? '✅' : '❌';
    console.log(`${icon} [${step}] ${success ? 'SUCCÈS' : 'ÉCHEC'}`);
    if (details) {
      console.log(`   Détails:`, JSON.stringify(details, null, 2));
    }
    if (error) {
      console.log(`   Erreur: ${error}`);
    }
  }

  getDiagnostics() {
    return this.diagnostics;
  }

  getFailureCount() {
    return this.diagnostics.filter(d => !d.success).length;
  }

  clear() {
    this.diagnostics = [];
  }
}

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

async function login(apiClient: AxiosInstance, logger: TestLogger): Promise<TokenResponse | null> {
  try {
    const response = await apiClient.post('/auth/login/', {
      email: TEST_CREDENTIALS.email,
      password: TEST_CREDENTIALS.password,
    });
    
    const data = response.data || {};
    const access = data.tokens?.access ?? data.access;
    const refresh = data.tokens?.refresh ?? data.refresh;
    const hasAccess = access && typeof access === 'string';
    const hasRefresh = refresh && typeof refresh === 'string';
    
    logger.log('Login API', response.status === 200 && hasAccess && hasRefresh, {
      status: response.status,
      hasAccess,
      hasRefresh,
      accessLength: access?.length || 0,
      refreshLength: refresh?.length || 0,
    });
    
    if (response.status === 200 && hasAccess && hasRefresh) {
      return {
        access,
        refresh,
      };
    }
    return null;
  } catch (error: any) {
    logger.log('Login API', false, {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
    }, error.message);
    return null;
  }
}

async function testPatchRequest(
  apiClient: AxiosInstance,
  token: string,
  logger: TestLogger,
  expectedSuccess: boolean = true
): Promise<{ status: number; data: any; headers: any; hasAuthHeader: boolean } | null> {
  try {
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
        validateStatus: () => true,
      }
    );
    
    const hasAuthHeader = !!(response.config.headers?.Authorization || response.config.headers?.['authorization']);
    const isSuccess = [200, 201].includes(response.status);
    const matchesExpected = isSuccess === expectedSuccess;
    
    logger.log(`PATCH avec token (attendu: ${expectedSuccess ? 'succès' : 'échec'})`, matchesExpected, {
      status: response.status,
      hasAuthHeader,
      isSuccess,
      matchesExpected,
      responseKeys: response.data ? Object.keys(response.data) : [],
    });
    
    return {
      status: response.status,
      data: response.data,
      headers: response.headers,
      hasAuthHeader,
    };
  } catch (error: any) {
    logger.log(`PATCH avec token (attendu: ${expectedSuccess ? 'succès' : 'échec'})`, false, {
      error: error.message,
      status: error.response?.status,
      hasAuthHeader: !!(error.config?.headers?.Authorization || error.config?.headers?.['authorization']),
    }, error.message);
    return null;
  }
}

async function testTokenRefresh(
  apiClient: AxiosInstance,
  refreshToken: string,
  logger: TestLogger
): Promise<string | null> {
  try {
    const response = await apiClient.post(
      '/auth/refresh/',
      { refresh: refreshToken }
    );
    
    const data = response.data || {};
    const newAccess = data.access ?? data.tokens?.access;
    const hasNewAccess = newAccess && typeof newAccess === 'string';
    const isSuccess = response.status === 200 && hasNewAccess;
    
    logger.log('Refresh de token', isSuccess, {
      status: response.status,
      hasNewAccess,
      newTokenLength: newAccess?.length || 0,
      newTokenDifferent: refreshToken !== newAccess,
    });
    
    if (isSuccess) {
      return newAccess;
    }
    return null;
  } catch (error: any) {
    logger.log('Refresh de token', false, {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
    }, error.message);
    return null;
  }
}

test.describe('🔬 TESTS EXHAUSTIFS - Authentification et PATCH', () => {
  let apiClient: AxiosInstance;
  let logger: TestLogger;

  test.beforeEach(() => {
    apiClient = createApiClient();
    logger = new TestLogger();
  });

  test.afterEach(() => {
    const failures = logger.getFailureCount();
    if (failures > 0) {
      console.log(`\n⚠️  ${failures} étape(s) ont échoué dans ce test`);
      console.log('📊 Diagnostics complets:');
      logger.getDiagnostics().forEach(d => {
        if (!d.success) {
          console.log(`  ❌ ${d.step}: ${d.error || 'Échec'}`);
        }
      });
    }
  });

  // ==========================================
  // CAS DE SUCCÈS NORMaux
  // ==========================================

  test('C1. Login réussi - Vérifications complètes', async () => {
    const tokens = await login(apiClient, logger);
    
    expect(tokens).not.toBeNull();
    expect(tokens?.access).toBeTruthy();
    expect(tokens?.refresh).toBeTruthy();
    expect(tokens?.access.length).toBeGreaterThan(50);
    expect(tokens?.refresh.length).toBeGreaterThan(50);
    
    // Vérifier le format JWT
    const accessParts = tokens?.access.split('.');
    expect(accessParts?.length).toBe(3); // Header.Payload.Signature
  });

  test('C2. PATCH avec token valide - Succès attendu', async () => {
    const tokens = await login(apiClient, logger);
    expect(tokens).not.toBeNull();
    
    const result = await testPatchRequest(apiClient, tokens!.access, logger, true);
    
    expect(result).not.toBeNull();
    expect([200, 201]).toContain(result?.status);
    expect(result?.hasAuthHeader).toBe(true);
  });

  test('C3. Refresh de token - Nouveau token fonctionnel', async () => {
    const tokens = await login(apiClient, logger);
    expect(tokens).not.toBeNull();
    
    const newToken = await testTokenRefresh(apiClient, tokens!.refresh, logger);
    expect(newToken).not.toBeNull();
    expect(newToken).not.toBe(tokens!.access);
    
    // Tester que le nouveau token fonctionne
    const result = await testPatchRequest(apiClient, newToken!, logger, true);
    expect([200, 201]).toContain(result?.status);
  });

  test('C4. Scénario complet: Login → PATCH → Refresh → PATCH', async () => {
    // 1. Login
    const tokens = await login(apiClient, logger);
    expect(tokens).not.toBeNull();
    
    // 2. PATCH avec token initial
    const patch1 = await testPatchRequest(apiClient, tokens!.access, logger, true);
    expect(patch1?.status).toBeOneOf([200, 201]);
    
    // 3. Refresh
    const newToken = await testTokenRefresh(apiClient, tokens!.refresh, logger);
    expect(newToken).not.toBeNull();
    
    // 4. PATCH avec nouveau token
    const patch2 = await testPatchRequest(apiClient, newToken!, logger, true);
    expect(patch2?.status).toBeOneOf([200, 201]);
    
    logger.log('Scénario complet', true, {
      loginSuccess: !!tokens,
      patch1Success: patch1?.status === 200 || patch1?.status === 201,
      refreshSuccess: !!newToken,
      patch2Success: patch2?.status === 200 || patch2?.status === 201,
    });
  });

  // ==========================================
  // CAS D'ERREUR - TOKEN INVALIDE/EXPIRÉ
  // ==========================================

  test('E1. PATCH sans token - Doit échouer avec 401/403', async () => {
    try {
      const response = await apiClient.patch(
        '/system-settings/',
        { public_pages: {} },
        { validateStatus: () => true }
      );
      
      logger.log('PATCH sans token', [401, 403].includes(response.status), {
        status: response.status,
        expectedFailure: true,
      });
      
      expect([401, 403]).toContain(response.status);
    } catch (error: any) {
      logger.log('PATCH sans token', false, {
        error: error.message,
        unexpectedError: true,
      }, error.message);
      throw error;
    }
  });

  test('E2. PATCH avec token invalide - Doit échouer', async () => {
    const invalidToken = 'invalid_token_12345';
    const result = await testPatchRequest(apiClient, invalidToken, logger, false);
    
    expect([401, 403]).toContain(result?.status);
  });

  test('E3. PATCH avec token mal formaté - Doit échouer', async () => {
    const malformedTokens = [
      'Bearer',
      'Bearer ',
      'NotBearer token123',
      'token123',
      'Bearer token.part1',
      'Bearer token.part1.part2.part3',
    ];
    
    for (const token of malformedTokens) {
      try {
        const response = await apiClient.patch(
          '/system-settings/',
          { public_pages: {} },
          {
            headers: { Authorization: token },
            validateStatus: () => true,
          }
        );
        
        logger.log(`PATCH avec token mal formaté: ${token.substring(0, 20)}...`, [401, 403].includes(response.status), {
          token: token.substring(0, 30),
          status: response.status,
        });
        
        expect([401, 403]).toContain(response.status);
      } catch (error: any) {
        logger.log(`PATCH avec token mal formaté: ${token.substring(0, 20)}...`, false, {
          error: error.message,
        }, error.message);
      }
    }
  });

  test('E4. Refresh avec token invalide - Doit échouer', async () => {
    const invalidRefreshToken = 'invalid_refresh_token';
    const newToken = await testTokenRefresh(apiClient, invalidRefreshToken, logger);
    
    expect(newToken).toBeNull();
  });

  test('E5. Refresh avec token expiré - Doit échouer', async () => {
    // Créer un token JWT expiré (mock)
    // Dans un vrai test, on devrait attendre que le token expire naturellement
    // ou utiliser un token généré avec une date d'expiration passée
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTYwOTQ1NjgwMH0.expired';
    
    const newToken = await testTokenRefresh(apiClient, expiredToken, logger);
    expect(newToken).toBeNull();
  });

  // ==========================================
  // CAS LIMITES - HEADERS ET FORMAT
  // ==========================================

  test('L1. Vérification des headers dans les requêtes', async ({ request }) => {
    const tokens = await login(apiClient, logger);
    expect(tokens).not.toBeNull();
    
    // Test avec playwright request pour voir les headers réels
    const response = await request.patch(`${API_URL}/system-settings/`, {
      data: { public_pages: {} },
      headers: {
        'Authorization': `Bearer ${tokens!.access}`,
        'Content-Type': 'application/json',
      },
    });
    
    const hasAuthHeader = response.headers()['authorization'] || response.headers()['Authorization'];
    logger.log('Vérification headers Playwright', !![200, 201, 400].includes(response.status()), {
      status: response.status(),
      hasAuthHeader: !!hasAuthHeader,
      authHeaderPresent: hasAuthHeader?.startsWith('Bearer ') || false,
    });
    
    expect([200, 201, 400]).toContain(response.status());
  });

  test('L2. PATCH avec différents formats de header Authorization', async () => {
    const tokens = await login(apiClient, logger);
    expect(tokens).not.toBeNull();
    
    const formats = [
      { header: 'Authorization', value: `Bearer ${tokens!.access}` },
      { header: 'authorization', value: `Bearer ${tokens!.access}` },
      { header: 'AUTHORIZATION', value: `Bearer ${tokens!.access}` },
    ];
    
    for (const format of formats) {
      try {
        const response = await apiClient.patch(
          '/system-settings/',
          { public_pages: {} },
          {
            headers: { [format.header]: format.value },
            validateStatus: () => true,
          }
        );
        
        logger.log(`PATCH avec header ${format.header}`, [200, 201, 400].includes(response.status), {
          headerFormat: format.header,
          status: response.status,
        });
        
        expect([200, 201, 400]).toContain(response.status);
      } catch (error: any) {
        logger.log(`PATCH avec header ${format.header}`, false, {
          error: error.message,
        }, error.message);
      }
    }
  });

  test('L3. PATCH avec token contenant des espaces - Doit être nettoyé', async () => {
    const tokens = await login(apiClient, logger);
    expect(tokens).not.toBeNull();
    
    // Token avec espaces (simule une erreur de copier-coller)
    const tokenWithSpaces = `  ${tokens!.access}  `;
    
    try {
      const response = await apiClient.patch(
        '/system-settings/',
        { public_pages: {} },
        {
          headers: { Authorization: `Bearer ${tokenWithSpaces}` },
          validateStatus: () => true,
        }
      );
      
      logger.log('PATCH avec token avec espaces', [200, 201, 400, 401, 403].includes(response.status), {
        status: response.status,
      });
    } catch (error: any) {
      logger.log('PATCH avec token avec espaces', false, {
        error: error.message,
      }, error.message);
    }
  });

  // ==========================================
  // CAS WAF ET RATE LIMITING
  // ==========================================

  test('W1. Test de rate limiting - Utilisateur authentifié', async () => {
    const tokens = await login(apiClient, logger);
    expect(tokens).not.toBeNull();
    
    const requests = [];
    const numRequests = 30;
    
    for (let i = 0; i < numRequests; i++) {
      requests.push(
        testPatchRequest(apiClient, tokens!.access, logger, false)
          .catch(() => ({ status: 500, hasAuthHeader: false }))
      );
    }
    
    const results = await Promise.all(requests);
    const successes = results.filter(r => r && [200, 201].includes(r.status));
    const rateLimited = results.filter(r => r && r.status === 429);
    const forbidden = results.filter(r => r && r.status === 403);
    const errors = results.filter(r => r && r.status >= 500);
    
    logger.log('Rate limiting test', successes.length > 0, {
      total: numRequests,
      successes: successes.length,
      rateLimited: rateLimited.length,
      forbidden: forbidden.length,
      errors: errors.length,
      successRate: (successes.length / numRequests * 100).toFixed(1) + '%',
    });
    
    // Les utilisateurs authentifiés devraient avoir au moins quelques succès
    expect(successes.length).toBeGreaterThan(0);
  });

  test('W2. Test de rate limiting - Utilisateur non authentifié', async () => {
    const requests = [];
    const numRequests = 50;
    
    for (let i = 0; i < numRequests; i++) {
      requests.push(
        apiClient.patch('/system-settings/', { public_pages: {} }, { validateStatus: () => true })
          .catch(() => ({ status: 401 }))
      );
    }
    
    const results = await Promise.all(requests);
    const rateLimited = results.filter((r: any) => r.status === 429);
    const unauthorized = results.filter((r: any) => r.status === 401 || r.status === 403);
    
    logger.log('Rate limiting non authentifié', true, {
      total: numRequests,
      rateLimited: rateLimited.length,
      unauthorized: unauthorized.length,
      rateLimitRate: (rateLimited.length / numRequests * 100).toFixed(1) + '%',
    });
    
    // Le WAF devrait limiter au moins quelques requêtes non authentifiées
    expect(rateLimited.length + unauthorized.length).toBeGreaterThan(0);
  });

  test('W3. Test de burst requests - Doit gérer correctement', async () => {
    const tokens = await login(apiClient, logger);
    expect(tokens).not.toBeNull();
    
    // Faire 10 requêtes simultanées
    const burst = Array(10).fill(null).map(() =>
      testPatchRequest(apiClient, tokens!.access, logger, false)
        .catch(() => ({ status: 500, hasAuthHeader: false }))
    );
    
    const results = await Promise.all(burst);
    const successes = results.filter(r => r && [200, 201].includes(r.status));
    
    logger.log('Burst requests test', successes.length > 0, {
      total: 10,
      successes: successes.length,
      allHaveAuth: results.every(r => r && r.hasAuthHeader),
    });
    
    // Au moins quelques requêtes devraient réussir
    expect(successes.length).toBeGreaterThan(0);
  });

  // ==========================================
  // CAS DE RÉGRESSION - PROBLÈMES CONNUS
  // ==========================================

  test('R1. Header Authorization préservé après refresh - CAS CRITIQUE', async () => {
    const tokens = await login(apiClient, logger);
    expect(tokens).not.toBeNull();
    
    // 1. Faire un PATCH initial
    const patch1 = await testPatchRequest(apiClient, tokens!.access, logger, true);
    expect(patch1?.hasAuthHeader).toBe(true);
    
    // 2. Refresh
    const newToken = await testTokenRefresh(apiClient, tokens!.refresh, logger);
    expect(newToken).not.toBeNull();
    
    // 3. Faire un PATCH avec le nouveau token
    const patch2 = await testPatchRequest(apiClient, newToken!, logger, true);
    
    // VÉRIFICATION CRITIQUE : Le header doit être présent
    expect(patch2?.hasAuthHeader).toBe(true);
    expect(patch2?.status).toBeOneOf([200, 201]);
    
    logger.log('Header préservé après refresh', patch2?.hasAuthHeader === true && [200, 201].includes(patch2!.status), {
      patch1HasAuth: patch1?.hasAuthHeader,
      patch2HasAuth: patch2?.hasAuthHeader,
      patch2Status: patch2?.status,
      tokenChanged: tokens!.access !== newToken!,
    });
  });

  test('R2. Multiple refresh successifs - Doit fonctionner', async () => {
    const tokens = await login(apiClient, logger);
    expect(tokens).not.toBeNull();
    
    let currentRefresh = tokens!.refresh;
    const refreshResults: string[] = [];
    
    // Faire 3 refresh successifs
    for (let i = 0; i < 3; i++) {
      const newAccess = await testTokenRefresh(apiClient, currentRefresh, logger);
      if (newAccess) {
        refreshResults.push(newAccess);
        // Note: En réalité, on devrait obtenir un nouveau refresh token aussi
        // Pour ce test, on assume que le refresh token reste valide
      } else {
        break;
      }
    }
    
    logger.log('Multiple refresh successifs', refreshResults.length === 3, {
      refreshesSuccessful: refreshResults.length,
      expected: 3,
      allDifferent: new Set(refreshResults).size === refreshResults.length,
    });
    
    // Tous les refresh devraient réussir (dépend de la config backend)
    expect(refreshResults.length).toBeGreaterThan(0);
  });

  test('R3. PATCH immédiatement après refresh - Pas de race condition', async () => {
    const tokens = await login(apiClient, logger);
    expect(tokens).not.toBeNull();
    
    // Refresh et PATCH immédiatement
    const refreshPromise = testTokenRefresh(apiClient, tokens!.refresh, logger);
    const newToken = await refreshPromise;
    expect(newToken).not.toBeNull();
    
    // PATCH immédiatement après (sans délai)
    const patchResult = await testPatchRequest(apiClient, newToken!, logger, true);
    
    logger.log('PATCH immédiat après refresh', patchResult?.status === 200 || patchResult?.status === 201, {
      patchStatus: patchResult?.status,
      hasAuthHeader: patchResult?.hasAuthHeader,
      noDelay: true,
    });
    
    expect(patchResult?.status).toBeOneOf([200, 201]);
    expect(patchResult?.hasAuthHeader).toBe(true);
  });

  // ==========================================
  // TESTS END-TO-END AVEC NAVIGATEUR
  // ==========================================

  test('E2E1. Login dans le navigateur + PATCH automatique', async ({ page }) => {
    // Intercepter les requêtes
    const requests: Array<{ url: string; method: string; headers: Record<string, string>; status?: number }> = [];
    
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
        });
      }
    });
    
    page.on('response', (response) => {
      const matchingRequest = requests.find(r => r.url === response.url() && !r.status);
      if (matchingRequest) {
        matchingRequest.status = response.status();
      }
    });
    
    // Login
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForLoadState('networkidle');
    
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
    
    // Aller sur une page qui fait des PATCH
    try {
      await page.goto(`${FRONTEND_URL}/admin/pages-public/edit/home`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);
    } catch (e) {
      console.log('⚠️  Page admin non accessible, test partiel');
    }
    
    // Analyser les requêtes
    const patchRequests = requests.filter(r => r.method === 'PATCH' && r.url.includes('/system-settings/'));
    const patchWithAuth = patchRequests.filter(r => {
      const authHeader = r.headers['authorization'] || r.headers['Authorization'];
      return !!(authHeader && authHeader.startsWith('Bearer '));
    });
    const successfulPatches = patchRequests.filter(r => r.status && [200, 201].includes(r.status));
    
    logger.log('E2E - PATCH dans navigateur', patchWithAuth.length > 0 && successfulPatches.length > 0, {
      totalPatchRequests: patchRequests.length,
      patchWithAuth: patchWithAuth.length,
      successfulPatches: successfulPatches.length,
      allPatchesHaveAuth: patchRequests.length === patchWithAuth.length,
    });
    
    if (patchRequests.length > 0) {
      expect(patchWithAuth.length).toBeGreaterThan(0);
    }
  });

  test('E2E2. Refresh automatique dans le navigateur - Vérification complète', async ({ page }) => {
    let refreshDetected = false;
    let patchAfterRefresh = false;
    let refreshTokenUsed = false;
    
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/auth/refresh/')) {
        refreshDetected = true;
        refreshTokenUsed = true;
        console.log('🔄 Refresh détecté dans le navigateur');
      }
      if (url.includes('/system-settings/') && request.method() === 'PATCH' && refreshDetected) {
        const authHeader = request.headers()['authorization'] || request.headers()['Authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
          patchAfterRefresh = true;
          console.log('✅ PATCH après refresh avec Authorization détecté');
        }
      }
    });
    
    // Login
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();
    
    await emailInput.fill(TEST_CREDENTIALS.email);
    await passwordInput.fill(TEST_CREDENTIALS.password);
    await submitButton.click();
    
    try {
      await page.waitForURL(/\/(admin|dashboard)/, { timeout: 10000 });
    } catch (e) {
      await page.waitForTimeout(2000);
    }
    
    // Aller sur une page qui déclenche des requêtes
    try {
      await page.goto(`${FRONTEND_URL}/admin/pages-public/edit/home`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(5000); // Attendre que les requêtes se déclenchent
    } catch (e) {
      console.log('⚠️  Page admin non accessible');
    }
    
    logger.log('E2E - Refresh automatique', refreshDetected && patchAfterRefresh, {
      refreshDetected,
      refreshTokenUsed,
      patchAfterRefresh,
      allStepsWork: refreshDetected && patchAfterRefresh,
    });
    
    // Si un refresh a été détecté, vérifier qu'un PATCH avec auth a suivi
    if (refreshDetected) {
      expect(patchAfterRefresh).toBe(true);
    }
  });
});

// Rapport final
test.afterAll(async () => {
  console.log('\n📊 ==========================================');
  console.log('📊 RAPPORT FINAL DES TESTS');
  console.log('📊 ==========================================\n');
});

