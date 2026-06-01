import { test, expect } from '@playwright/test'

test.describe('Link Deletion', () => {
  async function createAndGoToDashboard(page: any) {
    // Create a link first on the home page
    await page.goto('/')
    await page.getByTestId('url-input').fill('https://example.com')
    await page.getByTestId('shorten-button').click()
    await expect(page.getByTestId('result-card')).toBeVisible({ timeout: 10_000 })

    // Go to dashboard (requires auth — skip if redirect to home)
    await page.goto('/dashboard')
  }

  test('signed-in user can delete a single link from dashboard', async ({ page }) => {
    await page.goto('/dashboard')

    // If redirected (not signed in), skip
    if (page.url().includes('/')) {
      test.skip(true, 'Requires authentication')
    }

    // Find first delete button and click
    const deleteBtn = page.locator('[data-testid^="delete-"]').first()
    await deleteBtn.click()

    // Confirm if a dialog appears
    const confirmBtn = page.getByRole('button', { name: /delete/i }).last()
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click()
    }

    // Row should disappear or count should decrease
    await expect(deleteBtn).not.toBeVisible({ timeout: 5_000 })
  })

  test('bulk delete removes selected links', async ({ page }) => {
    await page.goto('/dashboard')

    if (page.url().includes('/') && !page.url().includes('/dashboard')) {
      test.skip(true, 'Requires authentication')
    }

    // Select first checkbox
    const checkboxes = page.locator('table input[type="checkbox"]')
    const count = await checkboxes.count()
    if (count < 2) {
      test.skip(true, 'Need at least one link to bulk delete')
    }

    // Select first data row checkbox (skip header checkbox at index 0)
    await checkboxes.nth(1).click()

    // Bulk delete button should appear
    await expect(page.getByTestId('bulk-delete-button')).toBeVisible()
    await page.getByTestId('bulk-delete-button').click()

    // Confirm dialog
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: /delete/i }).last().click()

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5_000 })
  })

  test('expired page has a link back to home', async ({ page }) => {
    await page.goto('/expired')
    const homeLink = page.getByRole('link', { name: /create/i })
    await expect(homeLink).toBeVisible()
    await homeLink.click()
    await expect(page).toHaveURL('/')
  })
})
