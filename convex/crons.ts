import { cronJobs } from 'convex/server'
import { internalMutation } from './_generated/server'
import { internal } from './_generated/api'

export const expireLinks = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const links = await ctx.db.query('links').collect()
    const toExpire = links.filter(
      (l: any) => !l.isExpired && l.expiresAt && l.expiresAt < now,
    )
    await Promise.all(
      toExpire.map((l: any) => ctx.db.patch(l._id, { isExpired: true })),
    )
  },
})

const crons = cronJobs()

crons.daily(
  'expire old links',
  { hourUTC: 0, minuteUTC: 0 },
  internal.crons.expireLinks,
)

export default crons
