import { createMiddlewareClient } 
  from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  try {
    const supabase = createMiddlewareClient({ req, res })
    const { data: { session } } = 
      await supabase.auth.getSession()

    const isAuthPage =
      req.nextUrl.pathname.startsWith('/login') ||
      req.nextUrl.pathname.startsWith('/signup') ||
      req.nextUrl.pathname.startsWith('/forgot-password') ||
      req.nextUrl.pathname.startsWith('/reset-password')

    const isPublicPage = req.nextUrl.pathname === '/'
    const isApiRoute = 
      req.nextUrl.pathname.startsWith('/api')

    if (
      !session && 
      !isAuthPage && 
      !isPublicPage && 
      !isApiRoute
    ) {
      return NextResponse.redirect(
        new URL('/login', req.url)
      )
    }

    if (session && isAuthPage) {
      return NextResponse.redirect(
        new URL('/dashboard', req.url)
      )
    }
  } catch (error) {
    console.error('Middleware error:', error)
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}
