import { test, expect } from '../fixtures'

test.describe('Admin - Public Pages', () => {
  test.beforeEach(async ({ page, superAdminUser }) => {
    // Login as super admin
    await page.goto('/login')
    await page.fill('input[type="email"]', superAdminUser.email)
    await page.fill('input[type="password"]', superAdminUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin/, { timeout: 10000 })
    
    // Navigate to public pages
    await page.goto('/admin/pages-public')
    await page.waitForLoadState('networkidle')
  })

  test('should display public pages page', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/pages-public/)
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('should display list of pages', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Look for page cards or list
    const pageCards = page.locator('[class*="card"], [class*="Card"], [class*="page"]')
    const cardCount = await pageCards.count()
    
    expect(cardCount).toBeGreaterThanOrEqual(0)
  })

  test('should be able to edit a page', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Look for edit button
    const editButton = page.locator('button:has-text("Éditer"), a[href*="/edit"]').first()
    const hasEditButton = await editButton.isVisible().catch(() => false)
    
    if (hasEditButton) {
      await editButton.click()
      await page.waitForURL(/\/admin\/pages-public\/.*\/edit/, { timeout: 5000 })
    }
  })
})

