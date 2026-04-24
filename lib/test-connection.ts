import { createClient } from './supabase'

export async function testDatabaseConnection() {
  const supabase = createClient()

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

  const results: Record<string, boolean> = {}

  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table as any)
        .select('id')
        .limit(1)
      results[table] = !error
    } catch {
      results[table] = false
    }
  }

  return results
}
