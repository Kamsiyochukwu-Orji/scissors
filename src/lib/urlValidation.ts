import { BLOCKED_DOMAINS } from './blocklist'

export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function isBlockedDomain(url: string): boolean {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '')
    return BLOCKED_DOMAINS.has(hostname)
  } catch {
    return false
  }
}

export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (!url.trim()) return { valid: false, error: 'URL is required' }
  if (!isValidUrl(url)) return { valid: false, error: 'Please enter a valid URL (must start with http:// or https://)' }
  if (isBlockedDomain(url)) return { valid: false, error: 'This domain has been blocked for security reasons' }
  return { valid: true }
}
