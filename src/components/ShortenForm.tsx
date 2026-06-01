import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { validateUrl } from '../lib/urlValidation'
import { validateSlugFormat, formatShortUrl } from '../lib/slugUtils'
import { useSlugCheck } from '../hooks/useSlugCheck'
import { QRCodeDisplay } from './QRCodeDisplay'

interface ResultCard {
  slug: string
  originalUrl: string
}

export function ShortenForm() {
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState('')
  const [useCustomSlug, setUseCustomSlug] = useState(false)
  const [customSlug, setCustomSlug] = useState('')
  const [slugError, setSlugError] = useState('')
  const [expiryDays, setExpiryDays] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResultCard | null>(null)
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [apiError, setApiError] = useState('')

  const createLink = useMutation(api.links.createLink)
  const { isChecking, available, reason } = useSlugCheck(useCustomSlug ? customSlug : '')

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUrl(e.target.value)
    setUrlError('')
    setApiError('')
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCustomSlug(e.target.value)
    setSlugError('')
    const val = e.target.value
    if (val) {
      const { valid, error } = validateSlugFormat(val)
      if (!valid) setSlugError(error ?? '')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setApiError('')

    const urlValidation = validateUrl(url)
    if (!urlValidation.valid) {
      setUrlError(urlValidation.error ?? 'Invalid URL')
      return
    }

    if (useCustomSlug) {
      const slugValidation = validateSlugFormat(customSlug)
      if (!slugValidation.valid) {
        setSlugError(slugValidation.error ?? 'Invalid slug')
        return
      }
      if (available === false) {
        setSlugError(
          reason === 'taken' ? 'This slug is already taken' :
          reason === 'reserved' ? 'This slug is reserved' :
          'Invalid slug',
        )
        return
      }
    }

    setLoading(true)
    try {
      const expiresAt = expiryDays
        ? Date.now() + parseInt(expiryDays) * 24 * 60 * 60 * 1000
        : undefined

      const { slug } = await createLink({
        originalUrl: url,
        customSlug: useCustomSlug ? customSlug : undefined,
        expiresAt,
      })

      setResult({ slug, originalUrl: url })
      setUrl('')
      setCustomSlug('')
      setExpiryDays('')
      setUseCustomSlug(false)
    } catch (err: any) {
      const msg = err.message ?? ''
      if (msg.includes('RATE_LIMIT_EXCEEDED')) {
        setApiError('You\'ve reached the 5 links/day limit for anonymous users. Sign in for unlimited links.')
      } else if (msg.includes('SLUG_TAKEN')) {
        setSlugError('This slug is already taken')
      } else if (msg.includes('INVALID_URL')) {
        setUrlError('Please enter a valid URL')
      } else {
        setApiError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!result) return
    await navigator.clipboard.writeText(formatShortUrl(result.slug))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function getSlugStatus() {
    if (!useCustomSlug || !customSlug || customSlug.length < 3) return null
    if (slugError) return null
    if (isChecking) return <span className="text-xs text-gray-400">Checking...</span>
    if (available === true) return <span className="text-xs text-green-600 font-medium">Available</span>
    if (available === false) return (
      <span className="text-xs text-red-600 font-medium">
        {reason === 'reserved' ? 'Reserved' : 'Taken'}
      </span>
    )
    return null
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="card space-y-4" data-testid="shorten-form" noValidate>
        <Input
          label="Long URL"
          type="text"
          placeholder="https://example.com/very/long/url..."
          value={url}
          onChange={handleUrlChange}
          error={urlError}
          data-testid="url-input"
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="use-custom-slug"
            checked={useCustomSlug}
            onChange={(e) => setUseCustomSlug(e.target.checked)}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="use-custom-slug" className="text-sm font-medium text-gray-700">
            Use custom slug
          </label>
        </div>

        {useCustomSlug && (
          <div>
            <Input
              label="Custom slug"
              placeholder="my-brand"
              value={customSlug}
              onChange={handleSlugChange}
              error={slugError}
              prefix={`${window.location.origin}/`}
              hint="3–50 characters, letters, numbers, and hyphens only"
              data-testid="slug-input"
            />
            <div className="mt-1 h-4">{getSlugStatus()}</div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry (optional)
          </label>
          <select
            value={expiryDays}
            onChange={(e) => setExpiryDays(e.target.value)}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Never expires</option>
            <option value="1">1 day</option>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
          </select>
        </div>

        {apiError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {apiError}
          </div>
        )}

        <Button type="submit" loading={loading} size="lg" className="w-full" data-testid="shorten-button">
          Shorten URL
        </Button>
      </form>

      {result && (
        <div className="card mt-4 space-y-4" data-testid="result-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Your short link</p>
              <a
                href={formatShortUrl(result.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-indigo-600 hover:text-indigo-800"
                data-testid="short-url"
              >
                {formatShortUrl(result.slug)}
              </a>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleCopy}
                data-testid="copy-button"
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowQR(!showQR)}
              >
                QR
              </Button>
            </div>
          </div>

          <p className="text-xs text-gray-400 truncate">{result.originalUrl}</p>

          {showQR && (
            <div className="border-t pt-4">
              <QRCodeDisplay url={formatShortUrl(result.slug)} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
