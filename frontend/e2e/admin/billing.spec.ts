import { test, expect } from '../fixtures'

test.describe('Admin - Billing', () => {
  test.beforeEach(async ({ page, superAdminUser }) => {
    // Login as super admin
    await page.goto('/login')
    await page.fill('input[type="email"]', superAdminUser.email)
    await page.fill('input[type="password"]', superAdminUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin/, { timeout: 10000 })
    
    // Navigate to billing page
    await page.goto('/admin/billing')
    await page.waitForLoadState('networkidle')
  })

  test('should display billing page', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/billing/)
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('should display tabs', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Look for tabs
    const tabs = page.locator('button:has-text("Abonnements"), button:has-text("Factures"), button:has-text("Paiements")')
    const tabCount = await tabs.count()
    
    expect(tabCount).toBeGreaterThan(0)
  })

  test('should display subscriptions table', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Click on subscriptions tab if exists
    const subscriptionsTab = page.locator('button:has-text("Abonnements")').first()
    if (await subscriptionsTab.isVisible().catch(() => false)) {
      await subscriptionsTab.click()
      await page.waitForTimeout(1000)
    }
    
    const table = page.locator('table').first()
    const hasTable = await table.isVisible().catch(() => false)
    
    expect(hasTable).toBeTruthy()
  })
})

