import { NextRequest, NextResponse } from 'next/server'
import { generateCSRFToken, validateCSRFToken } from '@ltoc/utils'

const CSRF_COOKIE_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'

// Methods that require CSRF protection
const PROTECTED_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH']

// Paths to exclude from CSRF protection (e.g., webhooks)
const EXCLUDED_PATHS = [
  '/api/webhooks',
  '/api/health',
]

export async function csrfProtection(request: NextRequest) {
  // Skip CSRF for excluded paths
  const pathname = request.nextUrl.pathname
  if (EXCLUDED_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Skip CSRF for safe methods
  if (!PROTECTED_METHODS.includes(request.method)) {
    return NextResponse.next()
  }

  // Get or generate CSRF token
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
  
  if (!cookieToken) {
    // Generate new token for first visit
    const newToken = generateCSRFToken()
    const response = NextResponse.next()
    response.cookies.set(CSRF_COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    })
    return response
  }

  // Validate CSRF token for protected methods
  const headerToken = request.headers.get(CSRF_HEADER_NAME)
  
  if (!headerToken || !validateCSRFToken(headerToken, cookieToken)) {
    return new NextResponse('Invalid CSRF token', { status: 403 })
  }

  return NextResponse.next()
}

// Helper to get CSRF token for forms
export function getCSRFToken(request: NextRequest): string | null {
  return request.cookies.get(CSRF_COOKIE_NAME)?.value || null
}