import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting map
const rateLimitMap = new Map()

// Simple rate limiting function
function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const requests = rateLimitMap.get(ip) || []

  // Filter out requests older than 1 minute
  const recentRequests = requests.filter((time: number) => now - time < 60000)

  // Allow max 30 requests per minute
  if (recentRequests.length >= 30) {
    return true
  }

  // Update the map with recent requests plus current request
  rateLimitMap.set(ip, [...recentRequests, now])
  return false
}

// Helper to get client IP
function getClientIP(request: NextRequest): string {
  // Try various headers that might contain the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfIP = request.headers.get('cf-connecting-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  if (cfIP) {
    return cfIP
  }

  // Fallback to a default IP for development
  return request.ip || '127.0.0.1'
}

// Security headers middleware
export function middleware(request: NextRequest) {
  // Get client IP for rate limiting
  const clientIP = getClientIP(request)

  // Apply rate limiting to API routes and chat endpoints
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (isRateLimited(clientIP)) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: 60 
        }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': '60'
          } 
        }
      )
    }
  }

  // Create response with security headers
  const response = NextResponse.next()

  // Security headers for all routes
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')

  // Content Security Policy - relaxed for development
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.adsterra.com https://*.monetag.com https://*.highrevenuegate.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: http: https://*.postimg.cc https://*.githubusercontent.com",
    "media-src 'self' data: https: http:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://*.googleapis.com https://*.adsterra.com https://*.monetag.com",
    "frame-src 'self' https://*.adsterra.com https://*.monetag.com"
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};