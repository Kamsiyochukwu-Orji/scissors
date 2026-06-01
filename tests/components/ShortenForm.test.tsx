import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock Convex
vi.mock('convex/react', () => ({
  useMutation: () => vi.fn().mockResolvedValue({ slug: 'abc123' }),
  useQuery: () => ({ available: true, reason: null }),
}))

// Mock Convex API
vi.mock('../../convex/_generated/api', () => ({
  api: {
    links: {
      createLink: 'links:createLink',
      checkSlugAvailability: 'links:checkSlugAvailability',
    },
  },
}))

// Mock QRCodeDisplay to avoid SVG complexity in tests
vi.mock('../../src/components/QRCodeDisplay', () => ({
  QRCodeDisplay: () => <div data-testid="qr-display-mock">QR Code</div>,
}))

import { ShortenForm } from '../../src/components/ShortenForm'

describe('ShortenForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('renders the form with a URL input and submit button', () => {
    render(<ShortenForm />)
    expect(screen.getByTestId('url-input')).toBeInTheDocument()
    expect(screen.getByTestId('shorten-button')).toBeInTheDocument()
  })

  it('shows validation error when submitting an invalid URL', async () => {
    render(<ShortenForm />)
    const input = screen.getByTestId('url-input')
    const button = screen.getByTestId('shorten-button')

    await userEvent.type(input, 'not-a-url')
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/valid URL/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for empty URL', async () => {
    render(<ShortenForm />)
    await userEvent.click(screen.getByTestId('shorten-button'))

    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument()
    })
  })

  it('shows custom slug input when checkbox is checked', async () => {
    render(<ShortenForm />)
    const checkbox = screen.getByRole('checkbox')
    await userEvent.click(checkbox)
    expect(screen.getByTestId('slug-input')).toBeInTheDocument()
  })

  it('displays result card after successful submission', async () => {
    render(<ShortenForm />)
    const input = screen.getByTestId('url-input')
    await userEvent.type(input, 'https://example.com')
    await userEvent.click(screen.getByTestId('shorten-button'))

    await waitFor(() => {
      expect(screen.getByTestId('result-card')).toBeInTheDocument()
    })
  })
})
