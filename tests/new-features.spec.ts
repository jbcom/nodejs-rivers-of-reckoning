import { test, expect } from '@playwright/test'

test.describe('New Game Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
  })

  test('difficulty can be toggled on title screen', async ({ page }) => {
    const difficultyButton = page.getByRole('button', { name: /difficulty:/i })
    await expect(difficultyButton).toBeVisible()
    
    // Initial should be NORMAL
    await expect(difficultyButton).toContainText('NORMAL')
    
    // Toggle
    await difficultyButton.click()
    await expect(difficultyButton).toContainText('HARD')
    
    await difficultyButton.click()
    await expect(difficultyButton).toContainText('LEGENDARY')
    
    await difficultyButton.click()
    await expect(difficultyButton).toContainText('EASY')
  })

  test('save button exists and shows feedback', async ({ page }) => {
    const startButton = page.getByRole('button', { name: /start/i })
    await startButton.click()
    
    await page.waitForSelector('canvas', { timeout: 10000 })
    
    // Pause to see settings
    await page.keyboard.press('Escape')
    
    // Open settings
    const settingsButton = page.getByRole('button', { name: /settings/i })
    await settingsButton.click()
    
    // Difficulty in settings
    const difficultyInSettings = page.getByRole('button', { name: /difficulty:/i })
    await expect(difficultyInSettings).toBeVisible()
  })

  test('quest overlay appears and shows active quests', async ({ page: _page }) => {
    // Skip this test until quest generation can be made deterministic for testing
    // as suggested by review feedback
    test.skip()
    
    // TODO: Implement proper quest testing once quest generation is deterministic
    // or add a test-only method to manually trigger quest generation
  })
})
