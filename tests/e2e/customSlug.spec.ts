import { test, expect } from '@playwright/test'

test.describe('Custom Slug', () => {
  test('entering a valid available slug creates link with that slug', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('url-input').fill('https://example.com')

    // Enable custom slug
    await page.getByRole('checkbox').click()
    const slugInput = page.getByTestId('slug-input')
    await expect(slugInput).toBeVisible()

    // Type a slug that should be available (random to avoid collision)
    const slug = `test-${Date.now()}`
    await slugInput.fill(slug)

    // Wait for availability check
    await expect(page.getByText('Available')).toBeVisible({ timeout: 5_000 })

    // Submit
    await page.getByTestId('shorten-button').click()

    // Result should contain our custom slug
    const shortUrl = page.getByTestId('short-url')
    await expect(shortUrl).toBeVisible({ timeout: 10_000 })
    await expect(shortUrl).toContainText(slug)
  })

  test('reserved slug shows error', async ({ page }) => {
    await page.goto('/')

    await page.getByTestId('url-input').fill('https://example.com')
    await page.getByRole('checkbox').click()
    await page.getByTestId('slug-input').fill('admin')

    await expect(page.getByText('Reserved')).toBeVisible({ timeout: 5_000 })

    await page.getByTestId('shorten-button').click()
    // Should not proceed — stay on form
    await expect(page.getByTestId('result-card')).not.toBeVisible()
  })

  test('slug shorter than 3 chars shows format error', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('checkbox').click()
    await page.getByTestId('slug-input').fill('ab')

    await expect(page.getByText(/3 characters/i)).toBeVisible()
  })
})
