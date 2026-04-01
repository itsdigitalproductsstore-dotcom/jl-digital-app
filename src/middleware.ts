import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes and their access requirements
const protectedRoutes: Record<string, { requireAuth: boolean; roles?: string[] }> = {
  '/admin': { requireAuth: true, roles: ['owner', 'admin'] },
  '/dashboard/admin': { requireAuth: true, roles: ['owner', 'admin'] },
  '/dashboard/staff': { requireAuth: true, roles: ['staff', 'owner', 'admin'] },
  '/dashboard/client': { requireAuth: true, roles: ['client', 'owner', 'admin'] },
  '/dashboard': { requireAuth: true, roles: ['owner', 'admin', 'staff', 'client'] },
  // Academy learn/community/live pages require auth — enrollment is verified by RLS + API
  '/academy': { requireAuth: true },
}

// These academy sub-paths require auth
const academyAuthRequired = ['/learn/', '/community', '/live']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const userRole = (user?.user_metadata?.role as string | undefined) ?? 'client'
  const path = request.nextUrl.pathname

  // ── Academy sub-page auth guard ──
  // e.g. /academy/[id]/learn/[lessonId] requires login
  if (path.startsWith('/academy/')) {
    const needsAuth = academyAuthRequired.some((sub) => path.includes(sub))
    if (needsAuth && !user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(loginUrl)
    }
  }

  // ── Admin / Dashboard route guards ──
  for (const [route, config] of Object.entries(protectedRoutes)) {
    // Skip the academy catch-all here, handled above
    if (route === '/academy') continue

    if (path.startsWith(route)) {
      if (config.requireAuth && !user) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', path)
        return NextResponse.redirect(loginUrl)
      }

      if (user && config.roles && !config.roles.includes(userRole)) {
        // Redirect to the correct home for their role
        if (userRole === 'staff') return NextResponse.redirect(new URL('/dashboard/staff', request.url))
        if (userRole === 'client') return NextResponse.redirect(new URL('/dashboard/client', request.url))
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  // Extra guard: /admin base path check (handles exact match)
  if (path === '/admin' && user && !['owner', 'admin'].includes(userRole)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/academy/:path*/learn/:path*',
    '/academy/:path*/community',
    '/academy/:path*/live',
  ],
}
