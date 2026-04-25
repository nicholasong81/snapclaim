import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } 
  from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return NextResponse.json({
      error: 'Missing environment variables',
      url_exists: !!url,
      key_exists: !!key,
    })
  }

  const supabase = createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const tableNames = [
    'companies',
    'profiles',
    'company_categories',
    'claim_batches',
    'receipts',
    'director_loan_entries',
    'spending_policies',
    'notifications',
  ] as const

  type TableName = typeof tableNames[number]

  const results: Record<string, boolean> = {}

  for (const table of tableNames) {
    const { error } = await supabase
      .from(table as TableName)
      .select('id')
      .limit(1)
    results[table] = !error
  }

  const allReady = 
    Object.values(results).every(Boolean)

  return NextResponse.json({
    status: allReady
      ? 'all tables ready'
      : 'some tables missing',
    tables: results,
  })
}
