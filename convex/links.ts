import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet(
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  6,
)

const RESERVED_SLUGS = [
  'api',
  'dashboard',
  'admin',
  'login',
  'signup',
  'logout',
  'settings',
  'help',
  'about',
  'pricing',
  'terms',
  'privacy',
]

const SLUG_REGEX = /^[a-zA-Z0-9-]+$/

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

async function checkRateLimit(
  ctx: any,
  identifier: string,
  isAuthenticated: boolean,
) {
  if (isAuthenticated) return // authenticated users have no rate limit
  const today = new Date().toISOString().split('T')[0]
  const existing = await ctx.db
    .query('rateLimits')
    .withIndex('by_identifier_date', (q: any) =>
      q.eq('identifier', identifier).eq('date', today),
    )
    .first()
  if (!existing) {
    await ctx.db.insert('rateLimits', { identifier, date: today, count: 1 })
  } else if (existing.count >= 5) {
    throw new Error('RATE_LIMIT_EXCEEDED')
  } else {
    await ctx.db.patch(existing._id, { count: existing.count + 1 })
  }
}

export const createLink = mutation({
  args: {
    originalUrl: v.string(),
    customSlug: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    ipHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    const userId = identity?.subject

    if (!isValidUrl(args.originalUrl)) {
      throw new Error('INVALID_URL')
    }

    await checkRateLimit(
      ctx,
      userId ?? args.ipHash ?? 'anonymous',
      !!identity,
    )

    let slug: string

    if (args.customSlug) {
      const s = args.customSlug.trim().toLowerCase()
      if (s.length < 3 || s.length > 50) throw new Error('SLUG_LENGTH')
      if (!SLUG_REGEX.test(s)) throw new Error('SLUG_INVALID_CHARS')
      if (RESERVED_SLUGS.includes(s)) throw new Error('SLUG_RESERVED')
      const existing = await ctx.db
        .query('links')
        .withIndex('by_slug', (q: any) => q.eq('slug', s))
        .first()
      if (existing) throw new Error('SLUG_TAKEN')
      slug = s
    } else {
      let attempts = 0
      while (attempts < 5) {
        const candidate = nanoid()
        const existing = await ctx.db
          .query('links')
          .withIndex('by_slug', (q: any) => q.eq('slug', candidate))
          .first()
        if (!existing) {
          slug = candidate
          break
        }
        attempts++
      }
      if (!slug!) throw new Error('SLUG_COLLISION')
    }

    const linkId = await ctx.db.insert('links', {
      userId,
      originalUrl: args.originalUrl,
      slug,
      isCustomSlug: !!args.customSlug,
      clicks: 0,
      createdAt: Date.now(),
      expiresAt: args.expiresAt,
      isExpired: false,
    })

    return { linkId, slug }
  },
})

export const checkSlugAvailability = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const s = args.slug.trim().toLowerCase()
    if (s.length < 3 || s.length > 50) return { available: false, reason: 'length' }
    if (!SLUG_REGEX.test(s)) return { available: false, reason: 'chars' }
    if (RESERVED_SLUGS.includes(s)) return { available: false, reason: 'reserved' }
    const existing = await ctx.db
      .query('links')
      .withIndex('by_slug', (q: any) => q.eq('slug', s))
      .first()
    return { available: !existing, reason: existing ? 'taken' : null }
  },
})

export const getLinkBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('links')
      .withIndex('by_slug', (q: any) => q.eq('slug', args.slug))
      .first()
  },
})

export const getUserLinks = query({
  args: {
    status: v.optional(v.union(v.literal('active'), v.literal('expired'), v.literal('all'))),
    search: v.optional(v.string()),
    dateFrom: v.optional(v.number()),
    dateTo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []
    const userId = identity.subject

    let links = await ctx.db
      .query('links')
      .withIndex('by_user', (q: any) => q.eq('userId', userId))
      .collect()

    if (args.status && args.status !== 'all') {
      links = links.filter((l: any) =>
        args.status === 'expired' ? l.isExpired : !l.isExpired,
      )
    }
    if (args.search) {
      const term = args.search.toLowerCase()
      links = links.filter(
        (l: any) =>
          l.slug.toLowerCase().includes(term) ||
          l.originalUrl.toLowerCase().includes(term),
      )
    }
    if (args.dateFrom) links = links.filter((l: any) => l.createdAt >= args.dateFrom!)
    if (args.dateTo) links = links.filter((l: any) => l.createdAt <= args.dateTo!)

    return links.sort((a: any, b: any) => b.createdAt - a.createdAt)
  },
})

export const deleteLink = mutation({
  args: { linkId: v.id('links') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    const link = await ctx.db.get(args.linkId)
    if (!link) throw new Error('NOT_FOUND')
    if (link.userId && link.userId !== identity?.subject) throw new Error('UNAUTHORIZED')

    // Delete all clicks for this link
    const clicks = await ctx.db
      .query('clicks')
      .withIndex('by_link', (q: any) => q.eq('linkId', args.linkId))
      .collect()
    await Promise.all(clicks.map((c: any) => ctx.db.delete(c._id)))
    await ctx.db.delete(args.linkId)
  },
})

export const bulkDeleteLinks = mutation({
  args: { linkIds: v.array(v.id('links')) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    for (const linkId of args.linkIds) {
      const link = await ctx.db.get(linkId)
      if (!link) continue
      if (link.userId && link.userId !== identity?.subject) continue
      const clicks = await ctx.db
        .query('clicks')
        .withIndex('by_link', (q: any) => q.eq('linkId', linkId))
        .collect()
      await Promise.all(clicks.map((c: any) => ctx.db.delete(c._id)))
      await ctx.db.delete(linkId)
    }
  },
})
