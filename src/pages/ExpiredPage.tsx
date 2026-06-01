import { Link } from 'react-router-dom'

export function ExpiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card text-center max-w-md w-full">
        <div className="text-5xl mb-4">⏰</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h1>
        <p className="text-gray-500 mb-6">
          This shortened link has expired and is no longer available.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Create a new link
        </Link>
      </div>
    </div>
  )
}
