export function parseDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const ua = userAgent.toLowerCase()
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/.test(ua)) {
    return 'mobile'
  }
  if (/tablet|ipad/.test(ua)) {
    return 'tablet'
  }
  return 'desktop'
}
