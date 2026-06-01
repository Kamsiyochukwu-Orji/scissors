import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'
import { BulkDeleteDialog } from './BulkDeleteDialog'
import { QRCodeDisplay } from './QRCodeDisplay'
import { AnalyticsDashboard } from './AnalyticsDashboard'
import { formatShortUrl } from '../lib/slugUtils'

interface Link {
  _id: Id<'links'>
  slug: string
  originalUrl: string
  clicks: number
  createdAt: number
  expiresAt?: number
  isExpired: boolean
}

interface LinkTableProps {
  links: Link[]
  onSearchChange: (s: string) => void
  onStatusChange: (s: 'all' | 'active' | 'expired') => void
  search: string
  status: 'all' | 'active' | 'expired'
}

export function LinkTable({
  links,
  onSearchChange,
  onStatusChange,
  search,
  status,
}: LinkTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false)
  const [qrLink, setQrLink] = useState<Link | null>(null)
  const [analyticsLink, setAnalyticsLink] = useState<Link | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const deleteLink = useMutation(api.links.deleteLink)
  const bulkDelete = useMutation(api.links.bulkDeleteLinks)

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === links.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(links.map((l) => l._id)))
    }
  }

  async function handleDelete(id: Id<'links'>) {
    setDeletingId(id)
    try {
      await deleteLink({ linkId: id })
    } finally {
      setDeletingId(null)
    }
  }

  async function handleBulkDelete() {
    setBulkDeleteLoading(true)
    try {
      await bulkDelete({ linkIds: Array.from(selected) as Id<'links'>[] })
      setSelected(new Set())
      setBulkDeleteOpen(false)
    } finally {
      setBulkDeleteLoading(false)
    }
  }

  async function handleCopy(slug: string) {
    await navigator.clipboard.writeText(formatShortUrl(slug))
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3 flex-1">
          <input
            type="search"
            placeholder="Search by slug or URL..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 max-w-xs"
          />
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as any)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        {selected.size > 0 && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setBulkDeleteOpen(true)}
            data-testid="bulk-delete-button"
          >
            Delete ({selected.size})
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selected.size === links.length && links.length > 0}
                  onChange={toggleAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Short URL</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Original URL</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Clicks</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Created</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Expires</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {links.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  No links found
                </td>
              </tr>
            )}
            {links.map((link) => (
              <tr key={link._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(link._id)}
                    onChange={() => toggleSelect(link._id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-3">
                  <a
                    href={formatShortUrl(link.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    /{link.slug}
                  </a>
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <span className="block truncate text-gray-600" title={link.originalUrl}>
                    {link.originalUrl}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">{link.clicks.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(link.createdAt)}</td>
                <td className="px-4 py-3 text-gray-500">
                  {link.expiresAt ? formatDate(link.expiresAt) : '—'}
                </td>
                <td className="px-4 py-3">
                  {link.isExpired ? (
                    <span className="badge-expired">Expired</span>
                  ) : (
                    <span className="badge-active">Active</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(link.slug)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 rounded transition-colors"
                      title="Copy"
                      data-testid={`copy-${link.slug}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setAnalyticsLink(link)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 rounded transition-colors"
                      title="Analytics"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setQrLink(link)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 rounded transition-colors"
                      title="QR Code"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(link._id)}
                      disabled={deletingId === link._id}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors disabled:opacity-50"
                      title="Delete"
                      data-testid={`delete-${link.slug}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* QR Modal */}
      <Modal
        open={!!qrLink}
        onClose={() => setQrLink(null)}
        title={`QR Code — /${qrLink?.slug}`}
      >
        {qrLink && <QRCodeDisplay url={formatShortUrl(qrLink.slug)} />}
      </Modal>

      {/* Analytics Modal */}
      <Modal
        open={!!analyticsLink}
        onClose={() => setAnalyticsLink(null)}
        title={`Analytics — /${analyticsLink?.slug}`}
        maxWidth="xl"
      >
        {analyticsLink && <AnalyticsDashboard linkId={analyticsLink._id} />}
      </Modal>

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        open={bulkDeleteOpen}
        count={selected.size}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
        loading={bulkDeleteLoading}
      />
    </div>
  )
}
