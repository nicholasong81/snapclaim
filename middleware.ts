import { createServerClient, 
  type CookieOptions } from '@supabase/ssr'
import { NextResponse, 
  type NextRequest } from 'next/server'
import type { Database } from '@/lib/database.types'

export async function middleware(
  request: NextRequest
) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string,
          options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string,
          options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isAuthPage =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup') ||
    request.nextUrl.pathname.startsWith(
      '/forgot-password'
    ) ||
    request.nextUrl.pathname.startsWith(
      '/reset-password'
    ) ||
    request.nextUrl.pathname.startsWith(
      '/auth/callback'
    )

  const isPublicPage = 
    request.nextUrl.pathname === '/'
  const isApiRoute = 
    request.nextUrl.pathname.startsWith('/api')

  if (
    !session &&
    !isAuthPage &&
    !isPublicPage &&
    !isApiRoute
  ) {
    return NextResponse.redirect(
      new URL('/login', request.url)
    )
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(
      new URL('/dashboard', request.url)
    )
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
