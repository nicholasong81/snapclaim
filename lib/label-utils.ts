// =============================================
// RECEIPT TYPE LABELS
// Database stores: company, director_loan, personal
// Owner sees: friendly English labels
// Accountant reports: proper accounting terms
// =============================================

export type ReceiptType = 
  'company' | 'director_loan' | 'personal'

export type ReceiptStatus =
  'draft' | 'submitted' | 'inbox' | 
  'confirmed' | 'rejected' | 'paid'

// Labels shown to the business owner in UI
export const OWNER_TYPE_LABELS: 
  Record<ReceiptType, string> = {
  company: 'Company expense',
  director_loan: 'Claim',
  personal: 'Personal',
}

// Subtitles shown in the confirm screen
export const OWNER_TYPE_SUBTITLES: 
  Record<ReceiptType, string> = {
  company: 'Paid by company card or account',
  director_loan: 
    'I paid — claim back from company',
  personal: 'Not a business expense',
}

// Labels shown in accountant reports and exports
// Uses correct accounting terminology
export const ACCOUNTANT_TYPE_LABELS: 
  Record<ReceiptType, string> = {
  company: 'Company Expense',
  director_loan: 'Director Loan',
  personal: 'Personal (excluded)',
}

// Badge colors for each type
export const TYPE_BADGE_STYLES: Record<
  ReceiptType,
  { bg: string; text: string }
> = {
  company: {
    bg: 'bg-teal-100',
    text: 'text-teal-700',
  },
  director_loan: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
  },
  personal: {
    bg: 'bg-gray-100',
    text: 'text-gray-500',
  },
}

// Status labels shown to owner
export const STATUS_LABELS: 
  Record<ReceiptStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  inbox: 'Pending review',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
  paid: 'Paid',
}

// Status badge colors
export const STATUS_BADGE_STYLES: Record<
  ReceiptStatus,
  { bg: string; text: string }
> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-500' },
  submitted: { 
    bg: 'bg-blue-100', text: 'text-blue-700' 
  },
  inbox: { 
    bg: 'bg-amber-100', text: 'text-amber-700' 
  },
  confirmed: { 
    bg: 'bg-teal-100', text: 'text-teal-700' 
  },
  rejected: { 
    bg: 'bg-red-100', text: 'text-red-600' 
  },
  paid: { 
    bg: 'bg-green-100', text: 'text-green-700' 
  },
}

// Helper functions
export function getOwnerTypeLabel(
  type: string
): string {
  return OWNER_TYPE_LABELS[
    type as ReceiptType
  ] ?? type
}

export function getAccountantTypeLabel(
  type: string
): string {
  return ACCOUNTANT_TYPE_LABELS[
    type as ReceiptType
  ] ?? type
}

export function getStatusLabel(
  status: string
): string {
  return STATUS_LABELS[
    status as ReceiptStatus
  ] ?? status
}

export function getTypeBadgeStyle(
  type: string
): { bg: string; text: string } {
  return TYPE_BADGE_STYLES[
    type as ReceiptType
  ] ?? TYPE_BADGE_STYLES.company
}

export function getStatusBadgeStyle(
  status: string
): { bg: string; text: string } {
  return STATUS_BADGE_STYLES[
    status as ReceiptStatus
  ] ?? STATUS_BADGE_STYLES.inbox
}

// Dashboard navigation labels
export const DASHBOARD_NAV_LABELS = {
  director_loan_section: 'My Claims',
  director_loan_page_title: 'My Claims Ledger',
  director_loan_total_label: 'Total to claim back',
  director_loan_repaid_label: 'Mark as repaid',
}
