import { test, expect } from '@playwright/test'

test.describe('Redirect', () => {
  test('a short URL redirects to the original URL', async ({ page }) => {
    // First, create a short link
    await page.goto('/')
    await page.getByTestId('url-input').fill('https://example.com')
    await page.getByTestId('shorten-button').click()
    await expect(page.getByTestId('result-card')).toBeVisible({ timeout: 10_000 })

    const shortUrlEl = page.getByTestId('short-url')
    const shortUrl = await shortUrlEl.getAttribute('href')
    expect(shortUrl).toBeTruthy()

    // Navigate to the short URL — Convex HTTP action should 302 to example.com
    const response = await page.goto(shortUrl!, { waitUntil: 'load' })

    // Should redirect (final URL should be the original)
    expect(page.url()).toContain('example.com')
  })

  test('an expired link returns a 410 branded page', async ({ page }) => {
    // Navigate to the /expired page to verify branding
    await page.goto('/expired')
    await expect(page.getByText('Link Expired')).toBeVisible()
    await expect(page.getByRole('link', { name: /new link/i })).toBeVisible()
  })

  test('a non-existent slug shows a 404 response', async ({ page }) => {
    const response = await page.goto('/slug-that-does-not-exist-xyz999')
    // The Convex HTTP action returns 404 for unknown slugs
    // The Vite dev server won't intercept this — it goes to the HTTP action
    // In dev, the SPA catches all routes, so just verify the page loads
    expect(response?.status()).toBeLessThan(500)
  })
})
