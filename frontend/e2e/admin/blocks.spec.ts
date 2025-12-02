import { test, expect } from '../fixtures'

test.describe('Admin - Blocks Management', () => {
  test.beforeEach(async ({ page, superAdminUser }) => {
    // Login as super admin
    await page.goto('/login')
    await page.fill('input[type="email"]', superAdminUser.email)
    await page.fill('input[type="password"]', superAdminUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin/, { timeout: 10000 })
    
    // Navigate to blocks
    await page.goto('/admin/blocks')
    await page.waitForLoadState('networkidle')
  })

  test('should display blocks page', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/blocks/)
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('should display blocks table', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const table = page.locator('table').first()
    const hasTable = await table.isVisible().catch(() => false)
    
    expect(hasTable).toBeTruthy()
  })
})

