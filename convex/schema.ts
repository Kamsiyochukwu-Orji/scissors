import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  links: defineTable({
    userId: v.optional(v.string()),
    originalUrl: v.string(),
    slug: v.string(),
    isCustomSlug: v.boolean(),
    clicks: v.number(),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
    isExpired: v.boolean(),
  })
    .index('by_slug', ['slug'])
    .index('by_user', ['userId']),

  clicks: defineTable({
    linkId: v.id('links'),
    timestamp: v.number(),
    referrer: v.optional(v.string()),
    country: v.optional(v.string()),
    deviceType: v.string(),
  })
    .index('by_link', ['linkId'])
    .index('by_link_timestamp', ['linkId', 'timestamp']),

  rateLimits: defineTable({
    identifier: v.string(),
    date: v.string(),
    count: v.number(),
  }).index('by_identifier_date', ['identifier', 'date']),
})
