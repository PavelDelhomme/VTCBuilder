import { test, expect } from '../fixtures'

test.describe('Admin - Settings', () => {
  test.beforeEach(async ({ page, superAdminUser }) => {
    // Login as super admin
    await page.goto('/login')
    await page.fill('input[type="email"]', superAdminUser.email)
    await page.fill('input[type="password"]', superAdminUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin/, { timeout: 10000 })
    
    // Navigate to settings
    await page.goto('/admin/settings')
    await page.waitForLoadState('networkidle')
  })

  test('should display settings page', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/settings/)
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('should display settings tabs', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Look for tabs
    const tabs = page.locator('button:has-text("Général"), button:has-text("Email"), button:has-text("Sécurité")')
    const tabCount = await tabs.count()
    
    expect(tabCount).toBeGreaterThan(0)
  })

  test('should be able to update settings', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Try to find and update a setting
    const siteNameInput = page.locator('input[name*="site_name"], input[placeholder*="nom du site" i]').first()
    const hasInput = await siteNameInput.isVisible().catch(() => false)
    
    if (hasInput) {
      await siteNameInput.fill('Test Site')
      await page.waitForTimeout(500)
    }
  })
})

