import { createServerClient, 
  type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/lib/database.types'

export async function GET() {
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

  const { data: { session } } = 
    await supabase.auth.getSession()

  const { data: { user } } = 
    await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ 
      error: 'No user found',
      session: null 
    })
  }

  const { data: profile, error: profileError } = 
    await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

  return NextResponse.json({
    user_id: user.id,
    user_email: user.email,
    session_exists: !!session,
    profile,
    profile_error: profileError?.message,
  })
}
