import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

function unauthorizedResponse() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Memorial Items Admin"',
    },
  })
}

function forbiddenResponse() {
  return new NextResponse('Forbidden', { status: 403 })
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  return forwardedFor?.split(',')[0]?.trim() ?? ''
}

function isIpAllowed(ip: string, allowedIps: string[]) {
  if (allowedIps.length === 0) return true
  return allowedIps.includes(ip)
}

function basicAuthValid(authHeader: string | null, username: string, password: string) {
  if (!username || !password || !authHeader?.startsWith('Basic ')) return false
  const encoded = authHeader.slice(6)
  try {
    const decoded = atob(encoded)
    return decoded === `${username}:${password}`
  } catch {
    return false
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const allowedIps = (process.env.ADMIN_ALLOWED_IPS ?? '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean)
  const clientIp = getClientIp(request)
  if (!isIpAllowed(clientIp, allowedIps)) {
    return forbiddenResponse()
  }

  const username = process.env.ADMIN_BASIC_AUTH_USERNAME?.trim() ?? ''
  const password = process.env.ADMIN_BASIC_AUTH_PASSWORD?.trim() ?? ''

  if (!username || !password) {
    return NextResponse.next()
  }

  if (!basicAuthValid(request.headers.get('authorization'), username, password)) {
    return unauthorizedResponse()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
