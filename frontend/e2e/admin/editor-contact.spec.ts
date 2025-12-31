import { test, expect } from '../fixtures'

test.describe('Admin - Editor Contact Page', () => {
  test.beforeEach(async ({ page, superAdminUser }) => {
    // Login as super admin
    await page.goto('/login')
    await page.fill('input[type="email"]', superAdminUser.email)
    await page.fill('input[type="password"]', superAdminUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin/, { timeout: 10000 })
  })

  test('should open contact page editor without errors', async ({ page }) => {
    const consoleErrors: string[] = []
    const networkErrors: string[] = []
    
    // Listen for console errors
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

    // Listen for failed network requests
    page.on('response', (response) => {
      if (!response.ok() && response.status() >= 400) {
        const url = response.url()
        networkErrors.push(`${response.status()}: ${url}`)
      }
    })

    // Navigate to contact page editor
    await page.goto('/admin/pages-public/edit/contact')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // Should be on editor page
    await expect(page).toHaveURL(/\/admin\/pages-public\/edit\/contact/)

    // Check for WAF errors
    const wafErrors = consoleErrors.filter(err => 
      err.includes('WAF') || err.includes('blocked by WAF') || err.includes('Request blocked by WAF')
    )
    expect(wafErrors).toHaveLength(0)

    // Check for unexpected 403 errors (should not have many)
    const forbiddenErrors = networkErrors.filter(err => err.includes('403'))
    // Allow some 403 for non-super-admin endpoints, but not many
    expect(forbiddenErrors.length).toBeLessThan(5)
  })

  test('should display editor interface for contact page', async ({ page }) => {
    await page.goto('/admin/pages-public/edit/contact')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // Check for editor elements
    const editor = page.locator('[class*="editor"], [class*="Editor"]').first()
    const hasEditor = await editor.isVisible().catch(() => false)
    
    // Should have editor or at least some content
    expect(hasEditor).toBeTruthy()
  })

  test('should not redirect to login when accessing contact editor', async ({ page }) => {
    // Navigate directly to contact editor
    await page.goto('/admin/pages-public/edit/contact')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // Should not be redirected to login
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page).toHaveURL(/\/admin\/pages-public\/edit\/contact/)
  })

  test('should load contact page data without WAF errors', async ({ page }) => {
    const consoleErrors: string[] = []
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text()
        consoleErrors.push(text)
      }
    })

    await page.goto('/admin/pages-public/edit/contact')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(5000) // Wait for all data to load

    // Check for WAF errors
    const wafErrors = consoleErrors.filter(err => 
      err.includes('WAF') || err.includes('blocked by WAF') || err.includes('Request blocked by WAF')
    )
    expect(wafErrors).toHaveLength(0)
  })

  test('should handle save operation without WAF errors', async ({ page }) => {
    const consoleErrors: string[] = []
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/admin/pages-public/edit/contact')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // Look for save button
    const saveButton = page.locator('button:has-text("Enregistrer"), button:has-text("Sauvegarder")').first()
    const hasSaveButton = await saveButton.isVisible().catch(() => false)

    if (hasSaveButton) {
      await saveButton.click()
      await page.waitForTimeout(2000) // Wait for save operation

      // Check for WAF errors
      const wafErrors = consoleErrors.filter(err => 
        err.includes('WAF') || err.includes('blocked by WAF')
      )
      expect(wafErrors).toHaveLength(0)
    }
  })

  test('should navigate between pages without losing authentication', async ({ page }) => {
    // Start at contact editor
    await page.goto('/admin/pages-public/edit/contact')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Navigate to home editor
    await page.goto('/admin/pages-public/edit/home')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Should still be authenticated
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page).toHaveURL(/\/admin\/pages-public\/edit\/home/)

    // Navigate back to contact
    await page.goto('/admin/pages-public/edit/contact')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Should still be authenticated
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page).toHaveURL(/\/admin\/pages-public\/edit\/contact/)
  })
})

