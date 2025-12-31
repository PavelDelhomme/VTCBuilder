import { test, expect } from '../fixtures'

test.describe('WAF Errors Prevention', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and cookies before each test
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await page.context().clearCookies()
  })

  test('should login without WAF errors', async ({ page, superAdminUser }) => {
    // Listen for console errors
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text()
        consoleErrors.push(text)
        // Fail if we see WAF errors
        if (text.includes('WAF') || text.includes('blocked by WAF') || text.includes('Request blocked by WAF')) {
          throw new Error(`WAF Error detected in console: ${text}`)
        }
      }
    })

    // Listen for network errors
    page.on('response', (response) => {
      const status = response.status()
      const url = response.url()
      
      // Check for WAF errors in response
      if (status === 403 && url.includes('/auth/login/')) {
        response.text().then((text) => {
          if (text.includes('WAF') || text.includes('blocked by WAF')) {
            throw new Error(`WAF Error in response: ${url} - ${text}`)
          }
        }).catch(() => {
          // Ignore errors in reading response
        })
      }
    })

    // Navigate to login
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Fill login form
    await page.fill('input[type="email"]', superAdminUser.email)
    await page.fill('input[type="password"]', superAdminUser.password)
    
    // Submit form and wait for navigation
    await Promise.all([
      page.waitForURL(/\/admin\/dashboard|\/dashboard/, { timeout: 15000 }),
      page.click('button[type="submit"]')
    ])

    // Verify we're logged in
    await expect(page).toHaveURL(/\/admin\/dashboard/)
    
    // Verify no WAF errors in console
    const wafErrors = consoleErrors.filter(err => 
      err.includes('WAF') || err.includes('blocked by WAF') || err.includes('Request blocked by WAF')
    )
    expect(wafErrors).toHaveLength(0)
  })

  test('should handle 403 errors gracefully without WAF detection', async ({ page, superAdminUser }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', superAdminUser.email)
    await page.fill('input[type="password"]', superAdminUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin/, { timeout: 10000 })

    // Navigate to a page that might return 403
    await page.goto('/admin/pages-public/edit/contact')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Check for WAF errors - should not have any
    const wafErrors = consoleErrors.filter(err => 
      err.includes('WAF') || err.includes('blocked by WAF') || err.includes('Request blocked by WAF')
    )
    expect(wafErrors).toHaveLength(0)
  })

  test('should not redirect to login after successful authentication', async ({ page, superAdminUser }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[type="email"]', superAdminUser.email)
    await page.fill('input[type="password"]', superAdminUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin/, { timeout: 10000 })

    // Verify token is stored
    const token = await page.evaluate(() => localStorage.getItem('token'))
    expect(token).toBeTruthy()

    // Navigate to editor
    await page.goto('/admin/pages-public/edit/contact')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // Should not be redirected to login
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page).toHaveURL(/\/admin\/pages-public\/edit\/contact/)
  })

  test('should maintain authentication after page reload', async ({ page, superAdminUser }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[type="email"]', superAdminUser.email)
    await page.fill('input[type="password"]', superAdminUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin/, { timeout: 10000 })

    // Navigate to editor
    await page.goto('/admin/pages-public/edit/contact')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Should still be on editor, not redirected to login
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page).toHaveURL(/\/admin\/pages-public\/edit\/contact/)
  })

  test('should handle multiple login attempts without WAF errors', async ({ page, superAdminUser }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text()
        consoleErrors.push(text)
      }
    })

    // Try to login multiple times
    for (let i = 0; i < 3; i++) {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')
      
      await page.fill('input[type="email"]', superAdminUser.email)
      await page.fill('input[type="password"]', superAdminUser.password)
      await page.click('button[type="submit"]')
      
      // Wait for navigation or error
      try {
        await page.waitForURL(/\/admin\/dashboard|\/dashboard|\/login/, { timeout: 10000 })
      } catch (e) {
        // Continue if timeout
      }
      
      await page.waitForTimeout(1000)
    }

    // Check for WAF errors
    const wafErrors = consoleErrors.filter(err => 
      err.includes('WAF') || err.includes('blocked by WAF') || err.includes('Request blocked by WAF')
    )
    expect(wafErrors).toHaveLength(0)
  })
})

