import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock Recharts to avoid canvas/SVG rendering issues in jsdom
vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  Legend: () => null,
}))

// Mock Convex
vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
}))
vi.mock('../../convex/_generated/api', () => ({
  api: {
    analytics: {
      getClicksOverTime: 'analytics:getClicksOverTime',
      getTopReferrers: 'analytics:getTopReferrers',
      getDeviceBreakdown: 'analytics:getDeviceBreakdown',
    },
  },
}))

vi.mock('convex/values', () => ({}))

import { useQuery } from 'convex/react'
import { AnalyticsDashboard } from '../../src/components/AnalyticsDashboard'

const mockLinkId = 'j57abc123' as any

describe('AnalyticsDashboard', () => {
  it('renders the dashboard container', () => {
    vi.mocked(useQuery).mockReturnValue(undefined)
    render(<AnalyticsDashboard linkId={mockLinkId} />)
    expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument()
  })

  it('shows "no click data" when clicks are empty', () => {
    vi.mocked(useQuery).mockImplementation((query: any) => {
      if (query === 'analytics:getClicksOverTime') return []
      if (query === 'analytics:getTopReferrers') return []
      if (query === 'analytics:getDeviceBreakdown') return []
      return undefined
    })
    render(<AnalyticsDashboard linkId={mockLinkId} />)
    expect(screen.getByTestId('no-clicks-data')).toBeInTheDocument()
  })

  it('renders charts when data is available', () => {
    const clickData = Array.from({ length: 30 }, (_, i) => ({
      date: `2026-05-${String(i + 1).padStart(2, '0')}`,
      clicks: i + 1,
    }))
    vi.mocked(useQuery).mockImplementation((query: any) => {
      if (query === 'analytics:getClicksOverTime') return clickData
      if (query === 'analytics:getTopReferrers') return [{ referrer: 'google.com', count: 10 }]
      if (query === 'analytics:getDeviceBreakdown') return [{ device: 'desktop', count: 20 }]
      return undefined
    })
    render(<AnalyticsDashboard linkId={mockLinkId} />)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('shows total click count', () => {
    const clickData = [
      { date: '2026-05-30', clicks: 5 },
      { date: '2026-05-31', clicks: 10 },
    ]
    vi.mocked(useQuery).mockImplementation((query: any) => {
      if (query === 'analytics:getClicksOverTime') return clickData
      return []
    })
    render(<AnalyticsDashboard linkId={mockLinkId} />)
    expect(screen.getByText('15')).toBeInTheDocument()
  })
})
