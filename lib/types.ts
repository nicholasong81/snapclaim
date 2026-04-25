import type { Database, Tables } from 
  './database.types'

export type Company = 
  Tables<'companies'>
export type Profile = 
  Tables<'profiles'>
export type CompanyCategory = 
  Tables<'company_categories'>
export type ClaimBatch = 
  Tables<'claim_batches'>
export type Receipt = 
  Tables<'receipts'>
export type DirectorLoanEntry = 
  Tables<'director_loan_entries'>
export type SpendingPolicy = 
  Tables<'spending_policies'>
export type Notification = 
  Tables<'notifications'>

export type UserRole = 
  'owner' | 'accountant' | 'employee' | 'manager'
export type ReceiptType = 
  'company' | 'director_loan' | 'personal'
export type ReceiptStatus = 
  'draft' | 'submitted' | 'inbox' | 
  'confirmed' | 'rejected' | 'paid'
export type BatchStatus = 
  'draft' | 'submitted' | 'approved' | 
  'rejected' | 'paid'
export type CompanyPlan = 
  'solo' | 'team' | 'business'
export type RepaymentMethod = 
  'bank_transfer' | 'cash' | 'payroll' | 'other'

export type ReceiptWithProfile = Receipt & {
  profiles: Pick<
    Profile, 'full_name' | 'role'
  > | null
}

export type BatchWithReceipts = ClaimBatch & {
  receipts: Receipt[]
  profiles: Pick<
    Profile, 'full_name' | 'role'
  > | null
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
  'Other',
] as const
