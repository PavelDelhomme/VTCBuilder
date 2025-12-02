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
    
    // Wait for form submission and navigation
    await Promise.all([
      page.waitForURL(/\/admin\/dashboard|\/dashboard/, { timeout: 15000 }),
      page.click('button[type="submit"]')
    ])
    
    // Should redirect to admin dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/)
  })

  test('should show error on invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    // Wait a bit for the error to appear
    await page.waitForTimeout(2000)
    
    // Should show error message (toast or form error)
    const errorLocator = page.locator('text=/erreur|invalid|incorrect|connexion|mot de passe/i').first()
    await expect(errorLocator).toBeVisible({ timeout: 10000 })
  })
})

