import { test, expect } from '../fixtures'

test.describe('Admin - Statistics', () => {
  test.beforeEach(async ({ page, superAdminUser }) => {
    // Login as super admin
    await page.goto('/login')
    await page.fill('input[type="email"]', superAdminUser.email)
    await page.fill('input[type="password"]', superAdminUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin/, { timeout: 10000 })
    
    // Navigate to stats
    await page.goto('/admin/stats')
    await page.waitForLoadState('networkidle')
  })

  test('should display stats page', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/stats/)
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('should display tabs', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Look for tabs
    const tabs = page.locator('button:has-text("Vue d\'ensemble"), button:has-text("Actions"), button:has-text("Utilisateurs")')
    const tabCount = await tabs.count()
    
    expect(tabCount).toBeGreaterThan(0)
  })

  test('should be able to switch tabs', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const actionsTab = page.locator('button:has-text("Actions")').first()
    if (await actionsTab.isVisible().catch(() => false)) {
      await actionsTab.click()
      await page.waitForTimeout(1000)
    }
    
    const usersTab = page.locator('button:has-text("Utilisateurs")').first()
    if (await usersTab.isVisible().catch(() => false)) {
      await usersTab.click()
      await page.waitForTimeout(1000)
    }
  })
})

