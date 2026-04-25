import { createClient } from '@/lib/supabase'
import { createServerClient } from '@/lib/supabase-server'
import type { 
  Profile, 
  Company, 
  Receipt,
  ClaimBatch,
  DirectorLoanEntry,
  CompanyCategory
} from '@/lib/types'

// ─── Client-side helpers ───────────────────────

export async function getProfile(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) return null
  return data as Profile
}

export async function getCompany(companyId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single()
  
  if (error) return null
  return data as Company
}

export async function getInboxCount(
  companyId: string
): Promise<number> {
  const supabase = createClient()
  const { count, error } = await supabase
    .from('receipts')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'inbox')
  
  if (error) return 0
  return count ?? 0
}

export async function getReceipts(
  companyId: string,
  status?: string
) {
  const supabase = createClient()
  let query = supabase
    .from('receipts')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
  
  if (status) {
    query = query.eq('status', status)
  }
  
  const { data, error } = await query
  if (error) return [] as Receipt[]
  return (data ?? []) as Receipt[]
}

export async function getDirectorLoans(
  companyId: string
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('director_loan_entries')
    .select(`
      *,
      receipts (
        vendor,
        date,
        category,
        amount
      )
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
  
  if (error) return []
  return data ?? []
}

export async function getCategories(
  companyId: string
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('company_categories')
    .select('*')
    .eq('company_id', companyId)
    .order('name', { ascending: true })
  
  if (error) return [] as CompanyCategory[]
  return (data ?? []) as CompanyCategory[]
}

// ─── Server-side helpers ───────────────────────

export async function getServerProfile(
  userId: string
) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'full_name, role, company_id, onboarded, ' +
      'is_director, can_approve, department, ' +
      'employee_id, avatar_url, spending_limit'
    )
    .eq('id', userId)
    .single()
  
  if (error) return null
  return data as Partial<Profile>
}

export async function getServerCompany(
  companyId: string
) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single()
  
  if (error) return null
  return data as Company
}

export async function getServerInboxCount(
  companyId: string
): Promise<number> {
  const supabase = createServerClient()
  const { count, error } = await supabase
    .from('receipts')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'inbox')
  
  if (error) return 0
  return count ?? 0
}
