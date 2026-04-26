import { createServerClient,
  type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } 
  from '@/lib/database.types'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const cookieStore = cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string,
          options: CookieOptions) {
          try {
            cookieStore.set({
              name, value, ...options
            })
          } catch {}
        },
        remove(name: string,
          options: CookieOptions) {
          try {
            cookieStore.set({
              name, value: '', ...options
            })
          } catch {}
        },
      },
    }
  )

  if (code) {
    const { error } = 
      await supabase.auth.exchangeCodeForSession(
        code
      )
    
    if (error) {
      return NextResponse.redirect(
        new URL('/login?error=callback', request.url)
      )
    }
  }

  return NextResponse.redirect(
    new URL('/onboarding/company', request.url)
  )
}
