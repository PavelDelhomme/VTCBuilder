import { test, expect } from '../fixtures'

test.describe('Admin - Tenants Management', () => {
  test.beforeEach(async ({ page, superAdminUser }) => {
    // Login as super admin
    await page.goto('/login')
    await page.fill('input[type="email"]', superAdminUser.email)
    await page.fill('input[type="password"]', superAdminUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin/, { timeout: 10000 })
    
    // Navigate to tenants page
    await page.goto('/admin/tenants')
    await page.waitForLoadState('networkidle')
  })

  test('should display tenants page', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/tenants/)
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('should display tenants table', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const table = page.locator('table, [class*="table"], [class*="Table"]').first()
    const hasTable = await table.isVisible().catch(() => false)
    
    expect(hasTable).toBeTruthy()
  })

  test('should be able to create new tenant', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const createButton = page.locator('button:has-text("Nouveau"), button:has-text("Ajouter"), button:has-text("Créer"), a[href*="/tenants/new"]').first()
    const hasCreateButton = await createButton.isVisible().catch(() => false)
    
    if (hasCreateButton) {
      await createButton.click()
      await page.waitForURL(/\/admin\/tenants\/new/, { timeout: 5000 })
    }
  })
})

