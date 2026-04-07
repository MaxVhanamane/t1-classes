// lib/supabase/supabase-proxy.ts

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Route configuration
// ---------------------------------------------------------------------------

// These routes are accessible without any authentication
const PUBLIC_ROUTES = ['/', '/explore', '/login', '/auth', '/api']

// After login, each role lands on this route
const ROLE_HOME: Record<string, string> = {
    admin: '/admin',
    teacher: '/admin',
    student: '/student/dashboard',
}

// Route prefixes that are locked to specific roles.
// If a user hits a prefix they don't have access to, they get sent to their
// own home instead of a generic error.
const PROTECTED_PREFIXES = [
    { prefix: '/admin', roles: ['admin', 'teacher'] },
    { prefix: '/student', roles: ['student'] },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    )
}

function getRoleHome(role: string): string {
    return ROLE_HOME[role] ?? '/login'
}

function redirect(request: NextRequest, pathname: string, supabaseResponse: NextResponse): NextResponse {
    // Preserve supabase cookies when redirecting so the session is not lost
    const url = request.nextUrl.clone()
    url.pathname = pathname
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    return redirectResponse
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    // DO NOT remove this block - required for session refresh to work
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // DO NOT put any code between createServerClient and getClaims().
    // getClaims() is local-only (reads JWT) so it does not make a network
    // request unless the session is expired and needs a refresh.
    const { data } = await supabase.auth.getClaims()
    const user = data?.claims
    const pathname = request.nextUrl.pathname

    // Rule 1 - Public routes
    // These are always accessible regardless of auth state, EXCEPT /login which
    // redirects authenticated users away to avoid confusion.
    if (isPublicRoute(pathname)) {
        if (user) {
            // Authenticated users should not be able to access / or /login
            // Send them to their own dashboard
            if (pathname === '/' || pathname === '/login') {
                return redirect(request, getRoleHome(user.app_role as string), supabaseResponse)
            }
        }
        return supabaseResponse
    }
    // Rule 2 - Not authenticated hitting a protected route
    // Send them to login. After they log in, they'll be redirected by the login
    // page to their dashboard.
    if (!user) {
        return redirect(request, '/login', supabaseResponse)
    }

    // From this point the user is authenticated
    const role = user.app_role as string
    const home = getRoleHome(role)

    // Rule 3 - Role-locked prefix check
    // Check if the route the user is trying to access is locked to a role they
    // don't have. Example: a student hitting /admin/* gets sent to their own home.
    const matchedPrefix = PROTECTED_PREFIXES.find(p =>
        pathname.startsWith(p.prefix)
    )
    if (matchedPrefix && !matchedPrefix.roles.includes(role)) {
        return redirect(request, home, supabaseResponse)
    }

    // Rule 4 - Authenticated, correct role, route is fine
    // Just pass through and let the page render.
    return supabaseResponse
}





// IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
// creating a new response object with NextResponse.next() make sure to:
// 1. Pass the request in it, like so:
//    const myNewResponse = NextResponse.next({ request })
// 2. Copy over the cookies, like so:
//    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
// 3. Change the myNewResponse object to fit your needs, but avoid changing
//    the cookies!
// 4. Finally:
//    return myNewResponse
// If this is not done, you may be causing the browser and server to go out
// of sync and terminate the user's session prematurely!
