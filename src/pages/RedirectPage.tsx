import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { parseDeviceType } from '../lib/deviceParser'

export function RedirectPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const link = useQuery(api.links.getLinkBySlug, slug ? { slug } : 'skip')
  const trackClick = useMutation(api.analytics.trackClick)
  const tracked = useRef(false)

  useEffect(() => {
    if (link === undefined) return // still loading
    if (tracked.current) return   // already fired

    if (link === null) {
      navigate('/', { replace: true })
      return
    }

    if (link.isExpired || (link.expiresAt && link.expiresAt < Date.now())) {
      navigate('/expired', { replace: true })
      return
    }

    tracked.current = true

    trackClick({
      linkId: link._id,
      referrer: document.referrer || undefined,
      deviceType: parseDeviceType(navigator.userAgent),
    }).finally(() => {
      window.location.replace(link.originalUrl)
    })
  }, [link, navigate, trackClick])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-gray-500">Redirecting...</p>
      </div>
    </div>
  )
}
