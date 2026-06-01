import { useState, useRef } from 'react'
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'
import { Button } from './ui/Button'

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

interface QRCodeDisplayProps {
  url: string
}

export function QRCodeDisplay({ url }: QRCodeDisplayProps) {
  const [fgColor, setFgColor] = useState('#111827')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [ecLevel, setEcLevel] = useState<ErrorCorrectionLevel>('M')
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined)
  const svgRef = useRef<SVGSVGElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setLogoUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function downloadSvg() {
    const svgEl = svgRef.current
    if (!svgEl) return
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgEl)
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `qr-${url.replace(/[^a-z0-9]/gi, '-')}.svg`
    a.click()
    URL.revokeObjectURL(blobUrl)
  }

  function downloadPng() {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `qr-${url.replace(/[^a-z0-9]/gi, '-')}.png`
    a.click()
  }

  const imageSettings = logoUrl
    ? {
        src: logoUrl,
        height: 40,
        width: 40,
        excavate: true,
      }
    : undefined

  return (
    <div className="space-y-4" data-testid="qr-display">
      <div className="flex justify-center">
        <QRCodeSVG
          ref={svgRef}
          value={url}
          size={200}
          fgColor={fgColor}
          bgColor={bgColor}
          level={ecLevel}
          imageSettings={imageSettings}
          data-testid="qr-svg"
        />
      </div>

      {/* Hidden canvas for PNG export */}
      <div ref={canvasRef} className="hidden">
        <QRCodeCanvas
          value={url}
          size={512}
          fgColor={fgColor}
          bgColor={bgColor}
          level={ecLevel}
          imageSettings={imageSettings}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Foreground</label>
          <input
            type="color"
            value={fgColor}
            onChange={(e) => setFgColor(e.target.value)}
            className="w-full h-9 rounded border border-gray-300 cursor-pointer"
            data-testid="fg-color-input"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Background</label>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-full h-9 rounded border border-gray-300 cursor-pointer"
            data-testid="bg-color-input"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Error Correction</label>
          <select
            value={ecLevel}
            onChange={(e) => setEcLevel(e.target.value as ErrorCorrectionLevel)}
            className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="L">L — Low (7%)</option>
            <option value="M">M — Medium (15%)</option>
            <option value="Q">Q — Quartile (25%)</option>
            <option value="H">H — High (30%)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Logo overlay</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          variant="secondary"
          onClick={downloadSvg}
          className="flex-1"
          data-testid="download-svg"
        >
          Download SVG
        </Button>
        <Button
          variant="secondary"
          onClick={downloadPng}
          className="flex-1"
          data-testid="download-png"
        >
          Download PNG
        </Button>
      </div>
    </div>
  )
}
