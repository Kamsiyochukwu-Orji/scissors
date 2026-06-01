import { describe, it, expect } from 'vitest'
import { generateSlug, validateSlugFormat, isLinkExpired, calculateExpiryDate } from '../../src/lib/slugUtils'

describe('generateSlug', () => {
  it('returns a 6-character string', () => {
    const slug = generateSlug()
    expect(slug).toHaveLength(6)
  })

  it('only contains alphanumeric characters', () => {
    for (let i = 0; i < 20; i++) {
      const slug = generateSlug()
      expect(slug).toMatch(/^[a-zA-Z0-9]+$/)
    }
  })

  it('generates unique slugs', () => {
    const slugs = new Set(Array.from({ length: 100 }, () => generateSlug()))
    expect(slugs.size).toBeGreaterThan(95) // allow a tiny collision probability
  })
})

describe('validateSlugFormat', () => {
  it('accepts valid slugs', () => {
    expect(validateSlugFormat('abc').valid).toBe(true)
    expect(validateSlugFormat('my-brand').valid).toBe(true)
    expect(validateSlugFormat('HELLO123').valid).toBe(true)
    expect(validateSlugFormat('a-b-c-1').valid).toBe(true)
  })

  it('rejects slugs shorter than 3 characters', () => {
    const result = validateSlugFormat('ab')
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/3/)
  })

  it('rejects slugs longer than 50 characters', () => {
    const result = validateSlugFormat('a'.repeat(51))
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/50/)
  })

  it('rejects slugs with invalid characters', () => {
    expect(validateSlugFormat('hello world').valid).toBe(false)
    expect(validateSlugFormat('hello@world').valid).toBe(false)
    expect(validateSlugFormat('hello/world').valid).toBe(false)
    expect(validateSlugFormat('hello.world').valid).toBe(false)
  })

  it('accepts slugs with hyphens', () => {
    expect(validateSlugFormat('hello-world').valid).toBe(true)
  })
})

describe('isLinkExpired', () => {
  it('returns false when expiresAt is undefined', () => {
    expect(isLinkExpired(undefined)).toBe(false)
  })

  it('returns true when expiresAt is in the past', () => {
    expect(isLinkExpired(Date.now() - 1000)).toBe(true)
  })

  it('returns false when expiresAt is in the future', () => {
    expect(isLinkExpired(Date.now() + 60_000)).toBe(false)
  })
})

describe('calculateExpiryDate', () => {
  it('returns a timestamp roughly N days from now', () => {
    const days = 7
    const expiry = calculateExpiryDate(days)
    const expected = Date.now() + days * 24 * 60 * 60 * 1000
    expect(expiry).toBeGreaterThanOrEqual(expected - 100)
    expect(expiry).toBeLessThanOrEqual(expected + 100)
  })
})
