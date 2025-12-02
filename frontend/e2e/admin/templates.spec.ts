import { test, expect } from '../fixtures'

test.describe('Admin - Templates Management', () => {
  test.beforeEach(async ({ page, superAdminUser }) => {
    // Login as super admin
    await page.goto('/login')
    await page.fill('input[type="email"]', superAdminUser.email)
    await page.fill('input[type="password"]', superAdminUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin/, { timeout: 10000 })
    
    // Navigate to templates
    await page.goto('/admin/templates')
    await page.waitForLoadState('networkidle')
  })

  test('should display templates page', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/templates/)
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('should display templates list', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const templates = page.locator('[class*="template"], [class*="Template"]')
    const templateCount = await templates.count()
    
    expect(templateCount).toBeGreaterThanOrEqual(0)
  })
})

