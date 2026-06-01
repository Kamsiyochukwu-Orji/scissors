import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock qrcode.react
vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value, fgColor, bgColor }: any) => (
    <svg data-testid="qr-svg" data-value={value} data-fg={fgColor} data-bg={bgColor} />
  ),
  QRCodeCanvas: () => <canvas data-testid="qr-canvas" />,
}))

import { QRCodeDisplay } from '../../src/components/QRCodeDisplay'

describe('QRCodeDisplay', () => {
  it('renders the QR code SVG', () => {
    render(<QRCodeDisplay url="https://sc.is/abc123" />)
    expect(screen.getByTestId('qr-svg')).toBeInTheDocument()
  })

  it('encodes the short URL in the QR code', () => {
    render(<QRCodeDisplay url="https://sc.is/abc123" />)
    const svg = screen.getByTestId('qr-svg')
    expect(svg).toHaveAttribute('data-value', 'https://sc.is/abc123')
  })

  it('renders SVG and PNG download buttons', () => {
    render(<QRCodeDisplay url="https://sc.is/abc123" />)
    expect(screen.getByTestId('download-svg')).toBeInTheDocument()
    expect(screen.getByTestId('download-png')).toBeInTheDocument()
  })

  it('renders foreground and background color inputs', () => {
    render(<QRCodeDisplay url="https://sc.is/abc123" />)
    expect(screen.getByTestId('fg-color-input')).toBeInTheDocument()
    expect(screen.getByTestId('bg-color-input')).toBeInTheDocument()
  })

  it('applies foreground color to QR code', async () => {
    const { container } = render(<QRCodeDisplay url="https://sc.is/abc123" />)
    const fgInput = screen.getByTestId('fg-color-input') as HTMLInputElement
    expect(fgInput.value).toBe('#111827')
    // QR svg should reflect default fg color
    const svg = screen.getByTestId('qr-svg')
    expect(svg).toHaveAttribute('data-fg', '#111827')
  })
})
