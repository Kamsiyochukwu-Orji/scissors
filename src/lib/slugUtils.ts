import { customAlphabet } from 'nanoid'

const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const SLUG_REGEX = /^[a-zA-Z0-9-]+$/

export const generateSlug = customAlphabet(ALPHABET, 6)

export function validateSlugFormat(slug: string): { valid: boolean; error?: string } {
  const s = slug.trim()
  if (s.length < 3) return { valid: false, error: 'Slug must be at least 3 characters' }
  if (s.length > 50) return { valid: false, error: 'Slug must be 50 characters or fewer' }
  if (!SLUG_REGEX.test(s)) return { valid: false, error: 'Slug can only contain letters, numbers, and hyphens' }
  return { valid: true }
}

export function isLinkExpired(expiresAt: number | undefined): boolean {
  if (!expiresAt) return false
  return expiresAt < Date.now()
}

export function calculateExpiryDate(days: number): number {
  return Date.now() + days * 24 * 60 * 60 * 1000
}

export function formatShortUrl(slug: string, baseUrl = window.location.origin): string {
  return `${baseUrl}/${slug}`
}
