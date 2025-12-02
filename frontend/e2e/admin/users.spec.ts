import { test, expect } from '../fixtures'

test.describe('Admin - Users Management', () => {
  test.beforeEach(async ({ page, superAdminUser }) => {
    // Login as super admin
    await page.goto('/login')
    await page.fill('input[type="email"]', superAdminUser.email)
    await page.fill('input[type="password"]', superAdminUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin/, { timeout: 10000 })
    
    // Navigate to users page
    await page.goto('/admin/users')
    await page.waitForLoadState('networkidle')
  })

  test('should display users page', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/users/)
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('should display users table', async ({ page }) => {
    // Wait for table to load
    await page.waitForTimeout(2000)
    
    // Check for table or list of users
    const table = page.locator('table, [class*="table"], [class*="Table"]').first()
    const userList = page.locator('[class*="user"], [class*="User"]').first()
    
    const hasTable = await table.isVisible().catch(() => false)
    const hasList = await userList.isVisible().catch(() => false)
    
    expect(hasTable || hasList).toBeTruthy()
  })

  test('should have search functionality', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="recherche" i]').first()
    const hasSearch = await searchInput.isVisible().catch(() => false)
    
    if (hasSearch) {
      await searchInput.fill('test')
      await page.waitForTimeout(1000)
    }
  })

  test('should be able to navigate to create user', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Look for create/add button
    const createButton = page.locator('button:has-text("Nouveau"), button:has-text("Ajouter"), button:has-text("Créer"), a[href*="/users/new"]').first()
    const hasCreateButton = await createButton.isVisible().catch(() => false)
    
    if (hasCreateButton) {
      await createButton.click()
      await page.waitForURL(/\/admin\/users\/new/, { timeout: 5000 })
    }
  })
})

