import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Check 1: Are environment variables loaded?
  const envCheck = {
    url_exists: !!url,
    url_value: url 
      ? url.substring(0, 40) + '...' 
      : 'MISSING',
    anon_key_exists: !!anonKey,
    anon_key_preview: anonKey 
      ? anonKey.substring(0, 20) + '...' 
      : 'MISSING',
    service_key_exists: !!serviceKey,
    service_key_preview: serviceKey 
      ? serviceKey.substring(0, 20) + '...' 
      : 'MISSING',
  }

  // Check 2: Can we create a client?
  if (!url || !serviceKey) {
    return NextResponse.json({
      error: 'Missing environment variables',
      env: envCheck
    })
  }

  // Check 3: Try direct connection with service role
  const supabase = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const tables = [
    'companies',
    'profiles',
    'company_categories',
    'claim_batches',
    'receipts',
    'director_loan_entries',
    'spending_policies',
    'notifications'
  ]

  const results: Record<string, any> = {}

  // Check 4: Test each table individually
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      results[table] = {
        accessible: !error,
        error: error?.message || null,
        count: count || 0,
        error_code: error ? error.code : null
      }
    } catch (err) {
      results[table] = {
        accessible: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        count: 0,
        error_code: 'CATCH_ERROR'
      }
    }
  }

  // Check 5: Try a simple raw query
  let rawQueryResult = null
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('count')
      .limit(1)
    
    rawQueryResult = {
      success: !error,
      error: error?.message || null,
      data: data
    }
  } catch (err) {
    rawQueryResult = {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      data: null
    }
  }

  return NextResponse.json({
    environment: envCheck,
    tables: results,
    raw_query_test: rawQueryResult,
    summary: {
      total_tables: tables.length,
      accessible_tables: Object.values(results).filter(r => r.accessible).length,
      connection_status: Object.values(results).filter(r => r.accessible).length === tables.length 
        ? 'FULL_SUCCESS' 
        : 'PARTIAL_FAILURE'
    }
  })
}
