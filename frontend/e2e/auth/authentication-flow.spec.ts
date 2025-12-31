import { test, expect } from '../fixtures'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await page.context().clearCookies()
  })

  test('should complete full authentication flow', async ({ page, superAdminUser }) => {
    const consoleErrors: string[] = []
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text()
        consoleErrors.push(text)
        // Fail on WAF errors
        if (text.includes('WAF') || text.includes('blocked by WAF')) {
          throw new Error(`WAF Error: ${text}`)
        }
      }
    })

    // Step 1: Navigate to login
    await page.goto('/login')
    await expect(page).toHaveURL(/\/login/)

    // Step 2: Fill login form
    await page.fill('input[type="email"]', superAdminUser.email)
    await page.fill('input[type="password"]', superAdminUser.password)

    // Step 3: Submit form
    await Promise.all([
      page.waitForURL(/\/admin\/dashboard|\/dashboard/, { timeout: 15000 }),
      page.click('button[type="submit"]')
    ])

    // Step 4: Verify redirect to admin dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/)

    // Step 5: Verify token is stored
    const token = await page.evaluate(() => localStorage.getItem('token'))
    expect(token).toBeTruthy()
    expect(token?.length).toBeGreaterThan(0)

    // Step 6: Verify user is stored
    const user = await page.evaluate(() => localStorage.getItem('user'))
    expect(user).toBeTruthy()

    // Step 7: Verify login timestamp is stored
    const loginTimestamp = await page.evaluate(() => localStorage.getItem('login_timestamp'))
    expect(loginTimestamp).toBeTruthy()

    // Step 8: Check for WAF errors
    const wafErrors = consoleErrors.filter(err => 
      err.includes('WAF') || err.includes('blocked by WAF')
    )
    expect(wafErrors).toHaveLength(0)
  })

  test('should handle authentication errors gracefully', async ({ page }) => {
    const consoleErrors: string[] = []
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/login')

    // Try invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Wait for error message
    await page.waitForTimeout(2000)

    // Should show error but not WAF error
    const wafErrors = consoleErrors.filter(err => 
      err.includes('WAF') || err.includes('blocked by WAF')
    )
    expect(wafErrors).toHaveLength(0)

    // Should still be on login page
    await expect(page).toHaveURL(/\/login/)
  })

  test('should persist authentication across page navigations', async ({ page, superAdminUser }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[type="email"]', superAdminUser.email)
    await page.fill('input[type="password"]', superAdminUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin/, { timeout: 10000 })

    // Navigate to different pages
    const pages = [
      '/admin/dashboard',
      '/admin/pages-public',
      '/admin/pages-public/edit/contact',
      '/admin/projects',
      '/admin/dashboard'
    ]

    for (const pagePath of pages) {
      await page.goto(pagePath)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Should not be redirected to login
      await expect(page).not.toHaveURL(/\/login/)
    }
  })

  test('should handle token refresh without WAF errors', async ({ page, superAdminUser }) => {
    const consoleErrors: string[] = []
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Login
    await page.goto('/login')
    await page.fill('input[type="email"]', superAdminUser.email)
    await page.fill('input[type="password"]', superAdminUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin/, { timeout: 10000 })

    // Navigate to editor and wait for potential token refresh
    await page.goto('/admin/pages-public/edit/contact')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(5000)

    // Check for WAF errors
    const wafErrors = consoleErrors.filter(err => 
      err.includes('WAF') || err.includes('blocked by WAF')
    )
    expect(wafErrors).toHaveLength(0)
  })
})

