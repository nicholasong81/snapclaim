import type { Database } from './database.types'

export type Company = 
  Database['public']['Tables']['companies']['Row']
export type Profile = 
  Database['public']['Tables']['profiles']['Row']
export type CompanyCategory = 
  Database['public']['Tables']['company_categories']['Row']
export type ClaimBatch = 
  Database['public']['Tables']['claim_batches']['Row']
export type Receipt = 
  Database['public']['Tables']['receipts']['Row']
export type DirectorLoanEntry = 
  Database['public']['Tables']['director_loan_entries']['Row']
export type SpendingPolicy = 
  Database['public']['Tables']['spending_policies']['Row']
export type Notification = 
  Database['public']['Tables']['notifications']['Row']

export type UserRole = 
  'owner' | 'accountant' | 'employee' | 'manager'
export type ReceiptType = 
  'company' | 'director_loan' | 'personal'
export type ReceiptStatus = 
  'draft' | 'submitted' | 'inbox' | 
  'confirmed' | 'rejected' | 'paid'
export type BatchStatus = 
  'draft' | 'submitted' | 'approved' | 'rejected' | 'paid'
export type CompanyPlan = 
  'solo' | 'team' | 'business'
export type RepaymentMethod = 
  'bank_transfer' | 'cash' | 'payroll' | 'other'
export type NotificationType =
  'claim_submitted' | 'claim_approved' | 'claim_rejected' |
  'batch_submitted' | 'batch_approved' | 'loan_repaid'

export type ReceiptWithProfile = Receipt & {
  profiles: Pick<Profile, 'full_name' | 'role'> | null
}

export type ReceiptWithBatch = Receipt & {
  claim_batches: Pick<ClaimBatch, 'title' | 'status' | 'period_start' | 'period_end'> | null
}

export type BatchWithReceipts = ClaimBatch & {
  receipts: Receipt[]
  profiles: Pick<Profile, 'full_name' | 'role'> | null
}

export type DirectorLoanWithReceipt = DirectorLoanEntry & {
  receipts: Pick<Receipt, 'vendor' | 'date' | 'category' | 'amount'> | null
}

export const DEFAULT_CATEGORIES = [
  'Meals',
  'Transport', 
  'Software',
  'Equipment',
  'Supplies',
  'Marketing',
  'Professional Services',
  'Travel',
  'Home Office',
  'Courses & Learning',
  'Other'
] as const

export type DefaultCategory = typeof DEFAULT_CATEGORIES[number]
