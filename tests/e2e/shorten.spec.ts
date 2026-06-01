import { test, expect } from '@playwright/test'

test.describe('URL Shortening', () => {
  test('paste URL, short link appears, copy button works', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/')

    // Fill in the URL input
    const urlInput = page.getByTestId('url-input')
    await urlInput.fill('https://www.example.com/very/long/url/that/needs/shortening')

    // Submit
    await page.getByTestId('shorten-button').click()

    // Result card should appear
    const resultCard = page.getByTestId('result-card')
    await expect(resultCard).toBeVisible({ timeout: 10_000 })

    // Short URL should be displayed
    const shortUrl = page.getByTestId('short-url')
    await expect(shortUrl).toBeVisible()
    const href = await shortUrl.getAttribute('href')
    expect(href).toMatch(/^http/)
    expect(href).not.toContain('example.com/very/long')

    // Copy button should work
    await page.getByTestId('copy-button').click()
    await expect(page.getByTestId('copy-button')).toHaveText('Copied!')
  })

  test('shows error for invalid URL', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('url-input').fill('not-a-url')
    await page.getByTestId('shorten-button').click()
    await expect(page.getByText(/valid URL/i)).toBeVisible()
  })

  test('shows error for empty URL', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('shorten-button').click()
    await expect(page.getByText(/required/i)).toBeVisible()
  })
})
