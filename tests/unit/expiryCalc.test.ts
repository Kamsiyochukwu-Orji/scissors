import { describe, it, expect } from 'vitest'
import { isLinkExpired, calculateExpiryDate } from '../../src/lib/slugUtils'

describe('expiry date calculation', () => {
  it('a link with no expiresAt is not expired', () => {
    expect(isLinkExpired(undefined)).toBe(false)
  })

  it('a link with past expiresAt is expired', () => {
    const yesterday = Date.now() - 24 * 60 * 60 * 1000
    expect(isLinkExpired(yesterday)).toBe(true)
  })

  it('a link with future expiresAt is not expired', () => {
    const tomorrow = Date.now() + 24 * 60 * 60 * 1000
    expect(isLinkExpired(tomorrow)).toBe(false)
  })

  it('a link expiring exactly now is expired', () => {
    // expiresAt slightly in past due to execution time
    expect(isLinkExpired(Date.now() - 1)).toBe(true)
  })

  it('calculateExpiryDate 1 day = ~86400000ms from now', () => {
    const before = Date.now()
    const expiry = calculateExpiryDate(1)
    const after = Date.now()
    expect(expiry).toBeGreaterThanOrEqual(before + 86_400_000)
    expect(expiry).toBeLessThanOrEqual(after + 86_400_000)
  })

  it('calculateExpiryDate 30 days adds 30 days', () => {
    const expiry = calculateExpiryDate(30)
    const approxExpected = Date.now() + 30 * 24 * 60 * 60 * 1000
    expect(Math.abs(expiry - approxExpected)).toBeLessThan(500)
  })
})
