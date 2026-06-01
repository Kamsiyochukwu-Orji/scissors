import { describe, it, expect } from 'vitest'
import { isValidUrl, isBlockedDomain, validateUrl } from '../../src/lib/urlValidation'

describe('isValidUrl', () => {
  it('accepts valid http URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true)
    expect(isValidUrl('http://example.com/path?query=1')).toBe(true)
  })

  it('accepts valid https URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
    expect(isValidUrl('https://sub.example.com/path')).toBe(true)
  })

  it('rejects malformed URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false)
    expect(isValidUrl('example.com')).toBe(false)
    expect(isValidUrl('')).toBe(false)
    expect(isValidUrl('   ')).toBe(false)
  })

  it('rejects non-http protocols', () => {
    expect(isValidUrl('ftp://example.com')).toBe(false)
    expect(isValidUrl('javascript:alert(1)')).toBe(false)
    expect(isValidUrl('file:///etc/passwd')).toBe(false)
  })
})

describe('isBlockedDomain', () => {
  it('returns true for blocked domains', () => {
    expect(isBlockedDomain('https://phishing-site.com/steal')).toBe(true)
    expect(isBlockedDomain('http://malware-download.net')).toBe(true)
  })

  it('returns false for safe domains', () => {
    expect(isBlockedDomain('https://google.com')).toBe(false)
    expect(isBlockedDomain('https://github.com/user/repo')).toBe(false)
  })

  it('strips www prefix when checking', () => {
    expect(isBlockedDomain('https://www.phishing-site.com')).toBe(true)
  })

  it('returns false for malformed URL', () => {
    expect(isBlockedDomain('not-a-url')).toBe(false)
  })
})

describe('validateUrl', () => {
  it('returns valid for a good URL', () => {
    const result = validateUrl('https://example.com')
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('returns error for empty URL', () => {
    const result = validateUrl('')
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/required/i)
  })

  it('returns error for malformed URL', () => {
    const result = validateUrl('not-a-url')
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/valid/i)
  })

  it('returns security error for blocked domain', () => {
    const result = validateUrl('https://phishing-site.com')
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/blocked/i)
  })
})
