import { test, expect } from '../fixtures'

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page, superAdminUser }) => {
    // Login as super admin
    await page.goto('/login')
    await page.fill('input[type="email"]', superAdminUser.email)
    await page.fill('input[type="password"]', superAdminUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 })
  })

  test('should display dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/dashboard/)
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('should display statistics cards', async ({ page }) => {
    // Wait for stats to load
    await page.waitForTimeout(2000)
    
    // Check for stat cards (they might have different text)
    const statCards = page.locator('[class*="bg-white"], [class*="bg-gray"]').filter({ hasText: /\d+/ })
    await expect(statCards.first()).toBeVisible({ timeout: 5000 })
  })

  test('should have navigation sidebar', async ({ page }) => {
    // Check for sidebar or menu button
    const sidebar = page.locator('aside, [class*="sidebar"], [class*="Sidebar"]').first()
    const menuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="Menu"]').first()
    
    // Either sidebar is visible or menu button exists
    const hasSidebar = await sidebar.isVisible().catch(() => false)
    const hasMenuButton = await menuButton.isVisible().catch(() => false)
    
    expect(hasSidebar || hasMenuButton).toBeTruthy()
  })
})

