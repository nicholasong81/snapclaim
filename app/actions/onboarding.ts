'use server'

import { createServerClient,
  type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

const DEFAULT_CATEGORIES = [
  'Meals', 'Transport', 'Software',
  'Equipment', 'Supplies', 'Marketing',
  'Professional Services', 'Travel',
  'Home Office', 'Courses & Learning', 'Other',
]

export async function createCompanyAction(
  companyName: string,
  gstRegistered: boolean
): Promise<{ 
  success: boolean
  error?: string 
  companyId?: string
}> {
  try {
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

    // Verify session server-side
    const { data: { user }, error: userError } =
      await supabase.auth.getUser()

    if (userError || !user) {
      return { 
        success: false, 
        error: 'Not authenticated. Please log in again.' 
      }
    }

    // Check if profile already has a company
    const { data: existingProfile } = 
      await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()

    if (existingProfile?.company_id) {
      return { 
        success: true, 
        companyId: existingProfile.company_id 
      }
    }

    // Create company using admin client to 
    // bypass any RLS timing issues
    const { createClient } = 
      await import('@supabase/supabase-js')
    
    const adminClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Insert company
    const { data: company, error: ce } =
      await adminClient
        .from('companies')
        .insert({
          name: companyName.trim(),
          gst_registered: gstRegistered,
          default_currency: 'SGD',
          plan: 'solo',
        })
        .select('id')
        .single()

    if (ce || !company) {
      return { 
        success: false, 
        error: ce?.message ?? 'Failed to create company' 
      }
    }

    const companyId = company.id

    // Link profile to company
    const { error: pe } = await adminClient
      .from('profiles')
      .update({ 
        company_id: companyId,
        role: 'owner',
        is_director: true,
        can_approve: true,
        onboarded: false,
      })
      .eq('id', user.id)

    if (pe) {
      return { 
        success: false, 
        error: pe.message 
      }
    }

    // Insert default categories
    const categories = DEFAULT_CATEGORIES.map(
      (name) => ({
        company_id: companyId,
        name,
        is_default: true,
        gst_applicable: true,
      })
    )

    await adminClient
      .from('company_categories')
      .insert(categories)

    return { success: true, companyId }

  } catch (e: unknown) {
    const msg = e instanceof Error 
      ? e.message 
      : 'Unknown error'
    return { success: false, error: msg }
  }
}

export async function markOnboardedAction(): 
  Promise<{ success: boolean; error?: string }> {
  try {
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

    const { data: { user } } = 
      await supabase.auth.getUser()

    if (!user) {
      return { 
        success: false, 
        error: 'Not authenticated' 
      }
    }

    const { createClient } = 
      await import('@supabase/supabase-js')
    
    const adminClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const { error } = await adminClient
      .from('profiles')
      .update({ onboarded: true })
      .eq('id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (e: unknown) {
    const msg = e instanceof Error 
      ? e.message 
      : 'Unknown error'
    return { success: false, error: msg }
  }
}
