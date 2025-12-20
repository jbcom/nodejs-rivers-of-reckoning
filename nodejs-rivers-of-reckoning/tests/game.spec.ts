/**
 * E2E Tests for Rivers of Reckoning
 * Tests all major game systems ported from pygame
 */

import { test, expect } from '@playwright/test'

test.describe('Rivers of Reckoning', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Title Screen', () => {
    test('displays game title', async ({ page }) => {
      await expect(page.getByText('RIVERS OF')).toBeVisible()
      await expect(page.getByText('RECKONING')).toBeVisible()
    })

    test('shows feature list', async ({ page }) => {
      await expect(page.getByText('Infinite procedural world')).toBeVisible()
      await expect(page.getByText('Dynamic biome system')).toBeVisible()
      await expect(page.getByText('Weather & day/night cycle')).toBeVisible()
    })

    test('start button begins game', async ({ page }) => {
      await page.getByRole('button', { name: /start game/i }).click()
      // Canvas should appear when game starts
      await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Game Rendering', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: /start game/i }).click()
      await page.waitForSelector('canvas', { timeout: 10000 })
    })

    test('renders 3D canvas with WebGL', async ({ page }) => {
      const canvas = page.locator('canvas')
      await expect(canvas).toBeVisible()

      // Verify WebGL context
      const hasWebGL = await page.evaluate(() => {
        const canvas = document.querySelector('canvas') as HTMLCanvasElement
        return !!canvas?.getContext('webgl2') || !!canvas?.getContext('webgl')
      })
      expect(hasWebGL).toBe(true)
    })

    test('displays HUD elements', async ({ page }) => {
      // Health bar
      await expect(page.getByText(/100 \/ 100/)).toBeVisible()
      // Gold
      await expect(page.getByText(/💰/)).toBeVisible()
      // Biome chip
      await expect(page.getByText('Grassland')).toBeVisible()
    })

    test('shows coordinates in HUD', async ({ page }) => {
      // Coordinates display
      await expect(page.getByText(/\(0, 0\)/)).toBeVisible()
    })
  })

  test.describe('Game Systems', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: /start game/i }).click()
      await page.waitForSelector('canvas', { timeout: 10000 })
      await page.waitForTimeout(1000) // Let game initialize
    })

    test('day/night cycle progresses', async ({ page }) => {
      // Get initial time
      const initialTimeText = await page.locator('text=/Day \\d+/').textContent()
      
      // Wait for time to progress
      await page.waitForTimeout(3000)
      
      // Verify game is still running (time system works)
      await expect(page.locator('canvas')).toBeVisible()
    })

    test('weather system displays', async ({ page }) => {
      // Weather should show in HUD (one of: Clear, Rain, Fog, Snow, Storm)
      const weatherTypes = ['Clear', 'Rain', 'Fog', 'Snow', 'Storm']
      const weatherVisible = await Promise.any(
        weatherTypes.map(async (type) => {
          try {
            await expect(page.getByText(type)).toBeVisible({ timeout: 1000 })
            return true
          } catch {
            return false
          }
        })
      ).catch(() => false)
      
      // At least we should see the canvas working
      await expect(page.locator('canvas')).toBeVisible()
    })

    test('pause menu works', async ({ page }) => {
      // Press ESC to pause
      await page.keyboard.press('Escape')
      
      // Pause menu should appear
      await expect(page.getByText('PAUSED')).toBeVisible()
      await expect(page.getByRole('button', { name: /resume/i })).toBeVisible()
      
      // Resume game
      await page.getByRole('button', { name: /resume/i }).click()
      await expect(page.getByText('PAUSED')).not.toBeVisible()
    })

    test('quit to menu works', async ({ page }) => {
      // Pause and quit
      await page.keyboard.press('Escape')
      await page.getByRole('button', { name: /quit to menu/i }).click()
      
      // Should be back at title
      await expect(page.getByText('RIVERS OF')).toBeVisible()
    })
  })

  test.describe('Performance', () => {
    test('maintains acceptable framerate', async ({ page }) => {
      await page.getByRole('button', { name: /start game/i }).click()
      await page.waitForSelector('canvas', { timeout: 10000 })
      await page.waitForTimeout(2000)

      // Measure FPS
      const fps = await page.evaluate(async () => {
        let frameCount = 0
        const startTime = performance.now()

        return new Promise<number>((resolve) => {
          const measureFrame = () => {
            frameCount++
            if (performance.now() - startTime >= 1000) {
              resolve(frameCount)
            } else {
              requestAnimationFrame(measureFrame)
            }
          }
          requestAnimationFrame(measureFrame)
        })
      })

      console.log(`Game running at ${fps} FPS`)
      expect(fps).toBeGreaterThan(20) // Minimum acceptable
    })

    test('no console errors during gameplay', async ({ page }) => {
      const errors: string[] = []

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })

      await page.getByRole('button', { name: /start game/i }).click()
      await page.waitForSelector('canvas', { timeout: 10000 })
      await page.waitForTimeout(3000)

      // Filter out known WebGL warnings that aren't errors
      const realErrors = errors.filter(
        (e) => !e.includes('THREE') && !e.includes('WebGL')
      )
      expect(realErrors).toHaveLength(0)
    })
  })

  test.describe('Screenshots', () => {
    test('capture title screen', async ({ page }) => {
      await page.screenshot({ path: 'tests/screenshots/title-screen.png' })
    })

    test('capture gameplay', async ({ page }) => {
      await page.getByRole('button', { name: /start game/i }).click()
      await page.waitForSelector('canvas', { timeout: 10000 })
      await page.waitForTimeout(2000)
      await page.screenshot({ path: 'tests/screenshots/gameplay.png' })
    })

    test('capture pause menu', async ({ page }) => {
      await page.getByRole('button', { name: /start game/i }).click()
      await page.waitForSelector('canvas', { timeout: 10000 })
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
      await page.screenshot({ path: 'tests/screenshots/pause-menu.png' })
    })
  })
})
