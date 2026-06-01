import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { LinkTable } from './LinkTable'

export function LinkDashboard() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'expired'>('all')

  const links = useQuery(api.links.getUserLinks, { status, search: search || undefined }) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Links</h1>
        <p className="text-sm text-gray-500">{links.length} link{links.length !== 1 ? 's' : ''}</p>
      </div>

      <LinkTable
        links={links}
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
      />
    </div>
  )
}
