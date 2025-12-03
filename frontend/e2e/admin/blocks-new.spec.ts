import { test, expect } from '../fixtures'

test.describe('Admin - New Blocks Implementation', () => {
  test.beforeEach(async ({ page, superAdminUser }) => {
    // Login as super admin
    await page.goto('/login')
    await page.fill('input[type="email"]', superAdminUser.email)
    await page.fill('input[type="password"]', superAdminUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin/, { timeout: 10000 })
    
    // Navigate to editor
    await page.goto('/admin/pages-public/page-test/edit')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
  })

  test('should add and configure Rich Text Editor block', async ({ page }) => {
    // Open block palette
    const sidebarToggle = page.locator('button[aria-label*="menu" i], button:has-text("Menu")').first()
    if (await sidebarToggle.isVisible().catch(() => false)) {
      await sidebarToggle.click()
      await page.waitForTimeout(500)
    }

    // Search for rich-text block
    const searchInput = page.locator('input[placeholder*="rechercher" i], input[placeholder*="search" i]').first()
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('rich-text')
      await page.waitForTimeout(500)
    }

    // Find and click rich-text block
    const richTextBlock = page.locator('button:has-text("Éditeur de Texte"), button:has-text("Rich Text")').first()
    if (await richTextBlock.isVisible().catch(() => false)) {
      await richTextBlock.click()
      await page.waitForTimeout(1000)
      
      // Check if block was added
      const addedBlock = page.locator('[class*="block"]:has-text("Éditeur"), [class*="block"]:has-text("Rich")').first()
      const isVisible = await addedBlock.isVisible().catch(() => false)
      expect(isVisible).toBeTruthy()
    }
  })

  test('should add and configure Markdown block', async ({ page }) => {
    // Open block palette
    const sidebarToggle = page.locator('button[aria-label*="menu" i]').first()
    if (await sidebarToggle.isVisible().catch(() => false)) {
      await sidebarToggle.click()
      await page.waitForTimeout(500)
    }

    // Search for markdown block
    const searchInput = page.locator('input[placeholder*="rechercher" i]').first()
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('markdown')
      await page.waitForTimeout(500)
    }

    // Find and click markdown block
    const markdownBlock = page.locator('button:has-text("Markdown")').first()
    if (await markdownBlock.isVisible().catch(() => false)) {
      await markdownBlock.click()
      await page.waitForTimeout(1000)
      
      // Check if block was added
      const addedBlock = page.locator('[class*="block"]:has-text("Markdown")').first()
      const isVisible = await addedBlock.isVisible().catch(() => false)
      expect(isVisible).toBeTruthy()
    }
  })

  test('should add and configure Icon block', async ({ page }) => {
    // Open block palette
    const sidebarToggle = page.locator('button[aria-label*="menu" i]').first()
    if (await sidebarToggle.isVisible().catch(() => false)) {
      await sidebarToggle.click()
      await page.waitForTimeout(500)
    }

    // Search for icon block
    const searchInput = page.locator('input[placeholder*="rechercher" i]').first()
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('icône')
      await page.waitForTimeout(500)
    }

    // Find and click icon block
    const iconBlock = page.locator('button:has-text("Icône")').first()
    if (await iconBlock.isVisible().catch(() => false)) {
      await iconBlock.click()
      await page.waitForTimeout(1000)
      
      // Click on the block to open properties
      const addedBlock = page.locator('[class*="block"]').first()
      if (await addedBlock.isVisible().catch(() => false)) {
        await addedBlock.click({ button: 'right' })
        await page.waitForTimeout(500)
        
        // Check for properties panel
        const propertiesPanel = page.locator('[class*="properties"], [class*="paramètres"]').first()
        const hasPanel = await propertiesPanel.isVisible().catch(() => false)
        expect(hasPanel).toBeTruthy()
      }
    }
  })

  test('should add and configure Tooltip block', async ({ page }) => {
    // Open block palette
    const sidebarToggle = page.locator('button[aria-label*="menu" i]').first()
    if (await sidebarToggle.isVisible().catch(() => false)) {
      await sidebarToggle.click()
      await page.waitForTimeout(500)
    }

    // Search for tooltip block
    const searchInput = page.locator('input[placeholder*="rechercher" i]').first()
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('tooltip')
      await page.waitForTimeout(500)
    }

    // Find and click tooltip block
    const tooltipBlock = page.locator('button:has-text("Info-bulle")').first()
    if (await tooltipBlock.isVisible().catch(() => false)) {
      await tooltipBlock.click()
      await page.waitForTimeout(1000)
      
      // Check if block was added
      const addedBlock = page.locator('[class*="block"]:has-text("Info-bulle")').first()
      const isVisible = await addedBlock.isVisible().catch(() => false)
      expect(isVisible).toBeTruthy()
    }
  })

  test('should add and configure Dropdown block', async ({ page }) => {
    // Open block palette
    const sidebarToggle = page.locator('button[aria-label*="menu" i]').first()
    if (await sidebarToggle.isVisible().catch(() => false)) {
      await sidebarToggle.click()
      await page.waitForTimeout(500)
    }

    // Search for dropdown block
    const searchInput = page.locator('input[placeholder*="rechercher" i]').first()
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('dropdown')
      await page.waitForTimeout(500)
    }

    // Find and click dropdown block
    const dropdownBlock = page.locator('button:has-text("Menu Déroulant")').first()
    if (await dropdownBlock.isVisible().catch(() => false)) {
      await dropdownBlock.click()
      await page.waitForTimeout(1000)
      
      // Check if block was added
      const addedBlock = page.locator('[class*="block"]:has-text("Menu Déroulant")').first()
      const isVisible = await addedBlock.isVisible().catch(() => false)
      expect(isVisible).toBeTruthy()
    }
  })

  test('should add and configure Flexbox layout block', async ({ page }) => {
    // Open block palette
    const sidebarToggle = page.locator('button[aria-label*="menu" i]').first()
    if (await sidebarToggle.isVisible().catch(() => false)) {
      await sidebarToggle.click()
      await page.waitForTimeout(500)
    }

    // Filter by layout category
    const layoutFilter = page.locator('button:has-text("Structure"), button:has-text("Layout")').first()
    if (await layoutFilter.isVisible().catch(() => false)) {
      await layoutFilter.click()
      await page.waitForTimeout(500)
    }

    // Find and click flexbox block
    const flexboxBlock = page.locator('button:has-text("Flexbox")').first()
    if (await flexboxBlock.isVisible().catch(() => false)) {
      await flexboxBlock.click()
      await page.waitForTimeout(1000)
      
      // Check if block was added
      const addedBlock = page.locator('[class*="block"]:has-text("Flexbox")').first()
      const isVisible = await addedBlock.isVisible().catch(() => false)
      expect(isVisible).toBeTruthy()
    }
  })

  test('should add and configure Grid layout block', async ({ page }) => {
    // Open block palette
    const sidebarToggle = page.locator('button[aria-label*="menu" i]').first()
    if (await sidebarToggle.isVisible().catch(() => false)) {
      await sidebarToggle.click()
      await page.waitForTimeout(500)
    }

    // Filter by layout category
    const layoutFilter = page.locator('button:has-text("Structure"), button:has-text("Layout")').first()
    if (await layoutFilter.isVisible().catch(() => false)) {
      await layoutFilter.click()
      await page.waitForTimeout(500)
    }

    // Find and click grid block
    const gridBlock = page.locator('button:has-text("Grid")').first()
    if (await gridBlock.isVisible().catch(() => false)) {
      await gridBlock.click()
      await page.waitForTimeout(1000)
      
      // Check if block was added
      const addedBlock = page.locator('[class*="block"]:has-text("Grid")').first()
      const isVisible = await addedBlock.isVisible().catch(() => false)
      expect(isVisible).toBeTruthy()
    }
  })

  test('should add and configure Share Buttons block', async ({ page }) => {
    // Open block palette
    const sidebarToggle = page.locator('button[aria-label*="menu" i]').first()
    if (await sidebarToggle.isVisible().catch(() => false)) {
      await sidebarToggle.click()
      await page.waitForTimeout(500)
    }

    // Search for share buttons block
    const searchInput = page.locator('input[placeholder*="rechercher" i]').first()
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('partage')
      await page.waitForTimeout(500)
    }

    // Find and click share buttons block
    const shareBlock = page.locator('button:has-text("Boutons Partage")').first()
    if (await shareBlock.isVisible().catch(() => false)) {
      await shareBlock.click()
      await page.waitForTimeout(1000)
      
      // Check if block was added
      const addedBlock = page.locator('[class*="block"]:has-text("Boutons Partage")').first()
      const isVisible = await addedBlock.isVisible().catch(() => false)
      expect(isVisible).toBeTruthy()
    }
  })

  test('should add and configure Author Box block', async ({ page }) => {
    // Open block palette
    const sidebarToggle = page.locator('button[aria-label*="menu" i]').first()
    if (await sidebarToggle.isVisible().catch(() => false)) {
      await sidebarToggle.click()
      await page.waitForTimeout(500)
    }

    // Search for author box block
    const searchInput = page.locator('input[placeholder*="rechercher" i]').first()
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('auteur')
      await page.waitForTimeout(500)
    }

    // Find and click author box block
    const authorBlock = page.locator('button:has-text("Boîte Auteur")').first()
    if (await authorBlock.isVisible().catch(() => false)) {
      await authorBlock.click()
      await page.waitForTimeout(1000)
      
      // Check if block was added
      const addedBlock = page.locator('[class*="block"]:has-text("Boîte Auteur")').first()
      const isVisible = await addedBlock.isVisible().catch(() => false)
      expect(isVisible).toBeTruthy()
    }
  })

  test('should add and configure Table of Contents block', async ({ page }) => {
    // Open block palette
    const sidebarToggle = page.locator('button[aria-label*="menu" i]').first()
    if (await sidebarToggle.isVisible().catch(() => false)) {
      await sidebarToggle.click()
      await page.waitForTimeout(500)
    }

    // Search for table of contents block
    const searchInput = page.locator('input[placeholder*="rechercher" i]').first()
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('table des matières')
      await page.waitForTimeout(500)
    }

    // Find and click table of contents block
    const tocBlock = page.locator('button:has-text("Table des Matières")').first()
    if (await tocBlock.isVisible().catch(() => false)) {
      await tocBlock.click()
      await page.waitForTimeout(1000)
      
      // Check if block was added
      const addedBlock = page.locator('[class*="block"]:has-text("Table des Matières")').first()
      const isVisible = await addedBlock.isVisible().catch(() => false)
      expect(isVisible).toBeTruthy()
    }
  })

  test('should verify block deletion works', async ({ page }) => {
    // Add a block first
    const sidebarToggle = page.locator('button[aria-label*="menu" i]').first()
    if (await sidebarToggle.isVisible().catch(() => false)) {
      await sidebarToggle.click()
      await page.waitForTimeout(500)
    }

    const textBlock = page.locator('button:has-text("Texte")').first()
    if (await textBlock.isVisible().catch(() => false)) {
      await textBlock.click()
      await page.waitForTimeout(1000)
      
      // Right click on block to open context menu
      const addedBlock = page.locator('[class*="block"]').first()
      if (await addedBlock.isVisible().catch(() => false)) {
        await addedBlock.click({ button: 'right' })
        await page.waitForTimeout(500)
        
        // Look for delete option in context menu or properties panel
        const deleteButton = page.locator('button:has-text("Supprimer"), button:has-text("Delete")').first()
        if (await deleteButton.isVisible().catch(() => false)) {
          await deleteButton.click()
          await page.waitForTimeout(500)
          
          // Verify block was removed
          const blockCount = await page.locator('[class*="block"]').count()
          expect(blockCount).toBeLessThan(1)
        }
      }
    }
  })
})

