import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useDebounce } from './useDebounce'

export function useSlugCheck(slug: string) {
  const debouncedSlug = useDebounce(slug, 300)
  const result = useQuery(
    api.links.checkSlugAvailability,
    debouncedSlug.length >= 3 ? { slug: debouncedSlug } : 'skip',
  )

  return {
    isChecking: debouncedSlug !== slug || (debouncedSlug.length >= 3 && result === undefined),
    available: result?.available,
    reason: result?.reason,
  }
}
