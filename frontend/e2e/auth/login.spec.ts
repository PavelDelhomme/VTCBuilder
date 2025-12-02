import { test, expect } from '../fixtures'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/VTCBuilder|Login/)
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should login as super admin', async ({ page, superAdminUser }) => {
    await page.fill('input[type="email"]', superAdminUser.email)
    await page.fill('input[type="password"]', superAdminUser.password)
    await page.click('button[type="submit"]')
    
    // Should redirect to admin dashboard
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/admin\/dashboard/)
  })

  test('should show error on invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    // Should show error message
    await expect(page.locator('text=/erreur|invalid|incorrect/i')).toBeVisible({ timeout: 5000 })
  })
})

