import { useUser, UserButton } from '@clerk/clerk-react'
import { Link, Navigate } from 'react-router-dom'
import { LinkDashboard } from '../components/LinkDashboard'
import { ShortenForm } from '../components/ShortenForm'
import { useState } from 'react'

export function DashboardPage() {
  const { isSignedIn, isLoaded } = useUser()
  const [showForm, setShowForm] = useState(false)

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-gray-900 text-lg">
            <span className="text-indigo-600">✂</span>
            Scissor
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              + New Link
            </button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {showForm && (
          <div className="mb-8">
            <ShortenForm />
          </div>
        )}
        <LinkDashboard />
      </main>
    </div>
  )
}
