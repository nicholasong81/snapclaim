'use server'

import { createServerClient,
  type CookieOptions } from '@supabase/ssr'
import { createClient as createAdminClient }
  from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } 
  from '@/lib/database.types'

interface ReceiptInput {
  vendor: string
  amount: number
  date: string
  gst_amount: number | null
  category: string
  notes: string
  image: string
}

interface ActionResult {
  success: boolean
  error?: string
  receiptId?: string
}

function getServerSupabase() {
  const cookieStore = cookies()
  return createServerClient<Database>(
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
}

function getAdminClient() {
  return createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

async function uploadReceiptImage(
  imageData: string,
  userId: string,
  receiptId: string
): Promise<string | null> {
  try {
    const adminClient = getAdminClient()

    // Convert base64 to buffer
    const base64Data = imageData.includes('base64,')
      ? imageData.split('base64,')[1]
      : imageData

    const buffer = Buffer.from(base64Data, 'base64')
    const fileName = 
      `${userId}/${receiptId}.jpg` 

    const { error } = await adminClient
      .storage
      .from('receipts')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (error) {
      console.warn('Image upload failed:', 
        error.message)
      return null
    }

    const { data: urlData } = adminClient
      .storage
      .from('receipts')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  } catch (e) {
    console.warn('Image upload error:', e)
    return null
  }
}

export async function createCompanyExpenseAction(
  receipt: ReceiptInput,
  type: 'company' | 'director_loan'
): Promise<ActionResult> {
  try {
    const supabase = getServerSupabase()
    const adminClient = getAdminClient()

    // Verify user session
    const { data: { user }, error: userError } =
      await supabase.auth.getUser()

    if (userError || !user) {
      return { 
        success: false, 
        error: 'Not authenticated' 
      }
    }

    // Get user profile with company
    const { data: profile } = await adminClient
      .from('profiles')
      .select('company_id, role, is_director')
      .eq('id', user.id)
      .single()

    if (!profile?.company_id) {
      return {
        success: false,
        error: 'No company found. Please ' +
          'complete onboarding first.',
      }
    }

    const receiptId = crypto.randomUUID()

    // Upload image to Supabase Storage
    const imageUrl = await uploadReceiptImage(
      receipt.image,
      user.id,
      receiptId
    )

    // Insert receipt record
    const { data: savedReceipt, error: re } =
      await adminClient
        .from('receipts')
        .insert({
          id: receiptId,
          company_id: profile.company_id,
          captured_by: user.id,
          vendor: receipt.vendor,
          amount: receipt.amount,
          gst_amount: receipt.gst_amount,
          date: receipt.date,
          category: receipt.category,
          type,
          status: 'inbox',
          image_url: imageUrl,
          notes: receipt.notes || null,
        })
        .select('id')
        .single()

    if (re || !savedReceipt) {
      return {
        success: false,
        error: re?.message ?? 
          'Failed to save receipt',
      }
    }

    return { 
      success: true, 
      receiptId: savedReceipt.id 
    }
  } catch (e: unknown) {
    const msg = e instanceof Error
      ? e.message
      : 'Unknown error'
    return { success: false, error: msg }
  }
}

export async function createDirectorLoanAction(
  receipt: ReceiptInput
): Promise<ActionResult> {
  try {
    // First create the receipt as director_loan type
    const receiptResult = 
      await createCompanyExpenseAction(
        receipt,
        'director_loan'
      )

    if (!receiptResult.success || 
        !receiptResult.receiptId) {
      return receiptResult
    }

    const supabase = getServerSupabase()
    const adminClient = getAdminClient()

    // Get user for director loan entry
    const { data: { user } } = 
      await supabase.auth.getUser()

    if (!user) {
      return { 
        success: false, 
        error: 'Not authenticated' 
      }
    }

    const { data: profile } = await adminClient
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!profile?.company_id) {
      return { 
        success: false, 
        error: 'No company found' 
      }
    }

    // Create director loan entry
    const { error: de } = await adminClient
      .from('director_loan_entries')
      .insert({
        receipt_id: receiptResult.receiptId,
        company_id: profile.company_id,
        director_id: user.id,
        amount: receipt.amount,
        repaid: false,
      })

    if (de) {
      console.warn('Director loan entry failed:',
        de.message)
      // Non-fatal — receipt is saved
      // loan entry can be recreated
    }

    return { 
      success: true, 
      receiptId: receiptResult.receiptId 
    }
  } catch (e: unknown) {
    const msg = e instanceof Error
      ? e.message
      : 'Unknown error'
    return { success: false, error: msg }
  }
}
