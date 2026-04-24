export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          uen_number: string | null
          gst_registered: boolean
          gst_number: string | null
          financial_year_end: string
          default_currency: string
          plan: 'solo' | 'team' | 'business'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          uen_number?: string | null
          gst_registered?: boolean
          gst_number?: string | null
          financial_year_end?: string
          default_currency?: string
          plan?: 'solo' | 'team' | 'business'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          uen_number?: string | null
          gst_registered?: boolean
          gst_number?: string | null
          financial_year_end?: string
          default_currency?: string
          plan?: 'solo' | 'team' | 'business'
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          company_id: string | null
          full_name: string | null
          role: 'owner' | 'accountant' | 'employee' | 'manager'
          employee_id: string | null
          department: string | null
          is_director: boolean
          can_approve: boolean
          spending_limit: number | null
          avatar_url: string | null
          onboarded: boolean
          created_at: string
        }
        Insert: {
          id: string
          company_id?: string | null
          full_name?: string | null
          role?: 'owner' | 'accountant' | 'employee' | 'manager'
          employee_id?: string | null
          department?: string | null
          is_director?: boolean
          can_approve?: boolean
          spending_limit?: number | null
          avatar_url?: string | null
          onboarded?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          full_name?: string | null
          role?: 'owner' | 'accountant' | 'employee' | 'manager'
          employee_id?: string | null
          department?: string | null
          is_director?: boolean
          can_approve?: boolean
          spending_limit?: number | null
          avatar_url?: string | null
          onboarded?: boolean
          created_at?: string
        }
      }
      company_categories: {
        Row: {
          id: string
          company_id: string
          name: string
          is_default: boolean
          gst_applicable: boolean
          spending_limit: number | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          is_default?: boolean
          gst_applicable?: boolean
          spending_limit?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          is_default?: boolean
          gst_applicable?: boolean
          spending_limit?: number | null
          created_at?: string
        }
      }
      claim_batches: {
        Row: {
          id: string
          company_id: string
          submitted_by: string | null
          reviewed_by: string | null
          title: string
          period_start: string | null
          period_end: string | null
          total_amount: number
          status: 'draft' | 'submitted' | 'approved' | 
                  'rejected' | 'paid'
          submitted_at: string | null
          approved_at: string | null
          paid_at: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          submitted_by?: string | null
          reviewed_by?: string | null
          title?: string
          period_start?: string | null
          period_end?: string | null
          total_amount?: number
          status?: 'draft' | 'submitted' | 'approved' | 
                   'rejected' | 'paid'
          submitted_at?: string | null
          approved_at?: string | null
          paid_at?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          submitted_by?: string | null
          reviewed_by?: string | null
          title?: string
          period_start?: string | null
          period_end?: string | null
          total_amount?: number
          status?: 'draft' | 'submitted' | 'approved' | 
                   'rejected' | 'paid'
          submitted_at?: string | null
          approved_at?: string | null
          paid_at?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      receipts: {
        Row: {
          id: string
          company_id: string
          captured_by: string | null
          claim_batch_id: string | null
          approved_by: string | null
          vendor: string
          amount: number
          gst_amount: number | null
          date: string
          category: string
          type: 'company' | 'director_loan' | 'personal'
          status: 'draft' | 'submitted' | 'inbox' | 
                  'confirmed' | 'rejected' | 'paid'
          image_url: string | null
          notes: string | null
          rejection_reason: string | null
          approved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          captured_by?: string | null
          claim_batch_id?: string | null
          approved_by?: string | null
          vendor: string
          amount: number
          gst_amount?: number | null
          date: string
          category?: string
          type: 'company' | 'director_loan' | 'personal'
          status?: 'draft' | 'submitted' | 'inbox' | 
                   'confirmed' | 'rejected' | 'paid'
          image_url?: string | null
          notes?: string | null
          rejection_reason?: string | null
          approved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          captured_by?: string | null
          claim_batch_id?: string | null
          approved_by?: string | null
          vendor?: string
          amount?: number
          gst_amount?: number | null
          date?: string
          category?: string
          type?: 'company' | 'director_loan' | 'personal'
          status?: 'draft' | 'submitted' | 'inbox' | 
                   'confirmed' | 'rejected' | 'paid'
          image_url?: string | null
          notes?: string | null
          rejection_reason?: string | null
          approved_at?: string | null
          created_at?: string
        }
      }
      director_loan_entries: {
        Row: {
          id: string
          receipt_id: string
          company_id: string
          director_id: string | null
          amount: number
          repaid: boolean
          repaid_at: string | null
          repayment_method: 'bank_transfer' | 'cash' | 
                            'payroll' | 'other' | null
          created_at: string
        }
        Insert: {
          id?: string
          receipt_id: string
          company_id: string
          director_id?: string | null
          amount: number
          repaid?: boolean
          repaid_at?: string | null
          repayment_method?: 'bank_transfer' | 'cash' | 
                             'payroll' | 'other' | null
          created_at?: string
        }
        Update: {
          id?: string
          receipt_id?: string
          company_id?: string
          director_id?: string | null
          amount?: number
          repaid?: boolean
          repaid_at?: string | null
          repayment_method?: 'bank_transfer' | 'cash' | 
                             'payroll' | 'other' | null
          created_at?: string
        }
      }
      spending_policies: {
        Row: {
          id: string
          company_id: string
          profile_id: string | null
          category: string | null
          max_amount: number | null
          requires_receipt: boolean
          requires_approval: boolean
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          profile_id?: string | null
          category?: string | null
          max_amount?: number | null
          requires_receipt?: boolean
          requires_approval?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          profile_id?: string | null
          category?: string | null
          max_amount?: number | null
          requires_receipt?: boolean
          requires_approval?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          company_id: string
          type: 'claim_submitted' | 'claim_approved' | 
                'claim_rejected' | 'batch_submitted' | 
                'batch_approved' | 'loan_repaid'
          title: string
          message: string | null
          read: boolean
          related_receipt_id: string | null
          related_batch_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          type: 'claim_submitted' | 'claim_approved' | 
                'claim_rejected' | 'batch_submitted' | 
                'batch_approved' | 'loan_repaid'
          title: string
          message?: string | null
          read?: boolean
          related_receipt_id?: string | null
          related_batch_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          type?: 'claim_submitted' | 'claim_approved' | 
                 'claim_rejected' | 'batch_submitted' | 
                 'batch_approved' | 'loan_repaid'
          title?: string
          message?: string | null
          read?: boolean
          related_receipt_id?: string | null
          related_batch_id?: string | null
          created_at?: string
        }
      }
    }
  }
}
