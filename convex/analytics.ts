import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const trackClick = mutation({
  args: {
    linkId: v.id('links'),
    referrer: v.optional(v.string()),
    country: v.optional(v.string()),
    deviceType: v.string(),
  },
  handler: async (ctx, args) => {
    const link = await ctx.db.get(args.linkId)
    if (!link) return

    await ctx.db.insert('clicks', {
      linkId: args.linkId,
      timestamp: Date.now(),
      referrer: args.referrer,
      country: args.country,
      deviceType: args.deviceType,
    })

    await ctx.db.patch(args.linkId, { clicks: link.clicks + 1 })
  },
})

export const getClicksOverTime = query({
  args: { linkId: v.id('links') },
  handler: async (ctx, args) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const clicks = await ctx.db
      .query('clicks')
      .withIndex('by_link_timestamp', (q: any) =>
        q.eq('linkId', args.linkId).gte('timestamp', thirtyDaysAgo),
      )
      .collect()

    // Group by day
    const byDay: Record<string, number> = {}
    for (const click of clicks) {
      const day = new Date(click.timestamp).toISOString().split('T')[0]
      byDay[day] = (byDay[day] ?? 0) + 1
    }

    // Fill in all 30 days
    const result: { date: string; clicks: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const day = d.toISOString().split('T')[0]
      result.push({ date: day, clicks: byDay[day] ?? 0 })
    }

    return result
  },
})

export const getTopReferrers = query({
  args: { linkId: v.id('links') },
  handler: async (ctx, args) => {
    const clicks = await ctx.db
      .query('clicks')
      .withIndex('by_link', (q: any) => q.eq('linkId', args.linkId))
      .collect()

    const counts: Record<string, number> = {}
    for (const click of clicks) {
      const ref = click.referrer ?? 'Direct'
      counts[ref] = (counts[ref] ?? 0) + 1
    }

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([referrer, count]) => ({ referrer, count }))
  },
})

export const getDeviceBreakdown = query({
  args: { linkId: v.id('links') },
  handler: async (ctx, args) => {
    const clicks = await ctx.db
      .query('clicks')
      .withIndex('by_link', (q: any) => q.eq('linkId', args.linkId))
      .collect()

    const counts: Record<string, number> = {}
    for (const click of clicks) {
      counts[click.deviceType] = (counts[click.deviceType] ?? 0) + 1
    }

    return Object.entries(counts).map(([device, count]) => ({ device, count }))
  },
})
