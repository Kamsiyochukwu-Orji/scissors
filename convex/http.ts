import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'
import { api } from './_generated/api'

const EXPIRED_PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Link Expired — Scissor</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f9fafb; }
    .card { background: white; border-radius: 16px; padding: 48px; text-align: center; max-width: 400px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { color: #111827; font-size: 24px; margin-bottom: 8px; }
    p { color: #6b7280; margin-bottom: 24px; }
    a { background: #4f46e5; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Link Expired</h1>
    <p>This shortened link has expired and is no longer available.</p>
    <a href="/">Create a new link</a>
  </div>
</body>
</html>`

function parseDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/.test(ua)) {
    return 'mobile'
  }
  if (/tablet|ipad/.test(ua)) {
    return 'tablet'
  }
  return 'desktop'
}

const handleRedirect = httpAction(async (ctx, request) => {
  const url = new URL(request.url)
  const slug = url.pathname.slice(1) // remove leading /

  if (!slug || slug === '') {
    return new Response('Not found', { status: 404 })
  }

  const link = await ctx.runQuery(api.links.getLinkBySlug, { slug })

  if (!link) {
    return new Response('Link not found', { status: 404 })
  }

  // Check expiry
  if (link.isExpired || (link.expiresAt && link.expiresAt < Date.now())) {
    return new Response(EXPIRED_PAGE_HTML, {
      status: 410,
      headers: { 'Content-Type': 'text/html' },
    })
  }

  // Extract analytics data from headers
  const userAgent = request.headers.get('user-agent') ?? ''
  const referrer = request.headers.get('referer') ?? undefined
  const country =
    request.headers.get('cf-ipcountry') ??
    request.headers.get('x-vercel-ip-country') ??
    undefined
  const deviceType = parseDeviceType(userAgent)

  // Track click asynchronously (don't await to keep redirect fast)
  ctx.runMutation(api.analytics.trackClick, {
    linkId: link._id,
    referrer,
    country,
    deviceType,
  })

  return new Response(null, {
    status: 302,
    headers: {
      Location: link.originalUrl,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
})

const http = httpRouter()

http.route({
  pathPrefix: '/',
  method: 'GET',
  handler: handleRedirect,
})

export default http
