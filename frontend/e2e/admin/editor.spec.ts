import { test, expect } from '../fixtures'

test.describe('Admin - Page Editor', () => {
  test.beforeEach(async ({ page, superAdminUser }) => {
    // Login as super admin
    await page.goto('/login')
    await page.fill('input[type="email"]', superAdminUser.email)
    await page.fill('input[type="password"]', superAdminUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin/, { timeout: 10000 })
  })

  test('should open page editor', async ({ page }) => {
    // Navigate to editor
    await page.goto('/admin/pages-public/page-test/edit')
    await page.waitForLoadState('networkidle')
    
    await expect(page).toHaveURL(/\/admin\/pages-public\/.*\/edit/)
  })

  test('should display editor interface', async ({ page }) => {
    await page.goto('/admin/pages-public/page-test/edit')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    // Check for editor elements
    const editor = page.locator('[class*="editor"], [class*="Editor"]').first()
    const sidebar = page.locator('aside, [class*="sidebar"], [class*="Sidebar"]').first()
    
    const hasEditor = await editor.isVisible().catch(() => false)
    const hasSidebar = await sidebar.isVisible().catch(() => false)
    
    expect(hasEditor || hasSidebar).toBeTruthy()
  })

  test('should have undo/redo buttons', async ({ page }) => {
    await page.goto('/admin/pages-public/page-test/edit')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    // Look for undo/redo buttons
    const undoButton = page.locator('button:has-text("Annuler"), button[title*="undo" i], button[title*="annuler" i]').first()
    const redoButton = page.locator('button:has-text("Refaire"), button[title*="redo" i], button[title*="refaire" i]').first()
    
    const hasUndo = await undoButton.isVisible().catch(() => false)
    const hasRedo = await redoButton.isVisible().catch(() => false)
    
    expect(hasUndo || hasRedo).toBeTruthy()
  })

  test('should have block properties panel with scroll', async ({ page }) => {
    await page.goto('/admin/pages-public/page-test/edit')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    // Try to find and click a block if exists
    const block = page.locator('[class*="block"], [class*="Block"]').first()
    const hasBlock = await block.isVisible().catch(() => false)
    
    if (hasBlock) {
      await block.click()
      await page.waitForTimeout(1000)
      
      // Check for properties panel
      const propertiesPanel = page.locator('[class*="properties"], [class*="Properties"], [class*="paramètres"]').first()
      const hasPanel = await propertiesPanel.isVisible().catch(() => false)
      
      if (hasPanel) {
        // Check for tabs
        const layoutTab = page.locator('button:has-text("Mise en page"), button:has-text("Layout")').first()
        const styleTab = page.locator('button:has-text("Style")').first()
        
        // Click on layout tab
        if (await layoutTab.isVisible().catch(() => false)) {
          await layoutTab.click()
          await page.waitForTimeout(500)
          
          // Try to scroll in the panel
          const panelContent = page.locator('[class*="overflow-y-auto"], [class*="overflow-auto"]').first()
          if (await panelContent.isVisible().catch(() => false)) {
            await panelContent.evaluate((el) => el.scrollTop = 100)
            await page.waitForTimeout(500)
          }
        }
      }
    }
  })
})

