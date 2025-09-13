import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function middleware(request: NextRequest) {
  // IMMEDIATELY suppress ALL HEAD requests to eliminate irritating logs
  if (request.method === 'HEAD') {
    return new Response(null, { status: 204 });
  }

  // Only handle admin routes
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    // Check for admin session cookie
    const adminSession = request.cookies.get('admin-session');
    
    if (!adminSession || adminSession.value !== 'true') {
      console.log('🔒 Admin session not found or invalid, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
};