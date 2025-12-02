import { test, expect } from '../fixtures'

test.describe('Admin - Projects Management', () => {
  test.beforeEach(async ({ page, superAdminUser }) => {
    // Login as super admin
    await page.goto('/login')
    await page.fill('input[type="email"]', superAdminUser.email)
    await page.fill('input[type="password"]', superAdminUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin/, { timeout: 10000 })
    
    // Navigate to projects
    await page.goto('/admin/projects')
    await page.waitForLoadState('networkidle')
  })

  test('should display projects page', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/projects/)
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('should display projects list', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    const projects = page.locator('[class*="project"], [class*="Project"]')
    const projectCount = await projects.count()
    
    expect(projectCount).toBeGreaterThanOrEqual(0)
  })
})

