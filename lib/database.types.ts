export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      claim_batches: {
        Row: {
          approved_at: string | null
          company_id: string
          created_at: string | null
          id: string
          notes: string | null
          paid_at: string | null
          period_end: string | null
          period_start: string | null
          reviewed_by: string | null
          status: string | null
          submitted_at: string | null
          submitted_by: string | null
          title: string
          total_amount: number | null
        }
        Insert: {
          approved_at?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          period_end?: string | null
          period_start?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          title: string
          total_amount?: number | null
        }
        Update: {
          approved_at?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          period_end?: string | null
          period_start?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          title?: string
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "claim_batches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_batches_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_batches_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string | null
          default_currency: string | null
          financial_year_end: string | null
          gst_number: string | null
          gst_registered: boolean | null
          id: string
          name: string
          plan: string | null
          uen_number: string | null
        }
        Insert: {
          created_at?: string | null
          default_currency?: string | null
          financial_year_end?: string | null
          gst_number?: string | null
          gst_registered?: boolean | null
          id?: string
          name: string
          plan?: string | null
          uen_number?: string | null
        }
        Update: {
          created_at?: string | null
          default_currency?: string | null
          financial_year_end?: string | null
          gst_number?: string | null
          gst_registered?: boolean | null
          id?: string
          name?: string
          plan?: string | null
          uen_number?: string | null
        }
        Relationships: []
      }
      company_categories: {
        Row: {
          company_id: string
          created_at: string | null
          gst_applicable: boolean | null
          id: string
          is_default: boolean | null
          name: string
          spending_limit: number | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          gst_applicable?: boolean | null
          id?: string
          is_default?: boolean | null
          name: string
          spending_limit?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          gst_applicable?: boolean | null
          id?: string
          is_default?: boolean | null
          name?: string
          spending_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "company_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      director_loan_entries: {
        Row: {
          amount: number
          company_id: string
          created_at: string | null
          director_id: string | null
          id: string
          receipt_id: string
          repaid: boolean | null
          repaid_at: string | null
          repayment_method: string | null
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string | null
          director_id?: string | null
          id?: string
          receipt_id: string
          repaid?: boolean | null
          repaid_at?: string | null
          repayment_method?: string | null
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string | null
          director_id?: string | null
          id?: string
          receipt_id?: string
          repaid?: boolean | null
          repaid_at?: string | null
          repayment_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "director_loan_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "director_loan_entries_director_id_fkey"
            columns: ["director_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "director_loan_entries_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          message: string | null
          read: boolean | null
          related_batch_id: string | null
          related_receipt_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          message?: string | null
          read?: boolean | null
          related_batch_id?: string | null
          related_receipt_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          message?: string | null
          read?: boolean | null
          related_batch_id?: string | null
          related_receipt_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_batch_id_fkey"
            columns: ["related_batch_id"]
            isOneToOne: false
            referencedRelation: "claim_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_receipt_id_fkey"
            columns: ["related_receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          can_approve: boolean | null
          company_id: string | null
          created_at: string | null
          department: string | null
          employee_id: string | null
          full_name: string | null
          id: string
          is_director: boolean | null
          onboarded: boolean | null
          role: string | null
          spending_limit: number | null
        }
        Insert: {
          avatar_url?: string | null
          can_approve?: boolean | null
          company_id?: string | null
          created_at?: string | null
          department?: string | null
          employee_id?: string | null
          full_name?: string | null
          id: string
          is_director?: boolean | null
          onboarded?: boolean | null
          role?: string | null
          spending_limit?: number | null
        }
        Update: {
          avatar_url?: string | null
          can_approve?: boolean | null
          company_id?: string | null
          created_at?: string | null
          department?: string | null
          employee_id?: string | null
          full_name?: string | null
          id?: string
          is_director?: boolean | null
          onboarded?: boolean | null
          role?: string | null
          spending_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          captured_by: string | null
          category: string
          claim_batch_id: string | null
          company_id: string
          created_at: string | null
          date: string
          gst_amount: number | null
          id: string
          image_url: string | null
          notes: string | null
          rejection_reason: string | null
          status: string | null
          type: string
          vendor: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          captured_by?: string | null
          category?: string
          claim_batch_id?: string | null
          company_id: string
          created_at?: string | null
          date: string
          gst_amount?: number | null
          id?: string
          image_url?: string | null
          notes?: string | null
          rejection_reason?: string | null
          status?: string | null
          type: string
          vendor: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          captured_by?: string | null
          category?: string
          claim_batch_id?: string | null
          company_id?: string
          created_at?: string | null
          date?: string
          gst_amount?: number | null
          id?: string
          image_url?: string | null
          notes?: string | null
          rejection_reason?: string | null
          status?: string | null
          type?: string
          vendor?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_captured_by_fkey"
            columns: ["captured_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_claim_batch_id_fkey"
            columns: ["claim_batch_id"]
            isOneToOne: false
            referencedRelation: "claim_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      spending_policies: {
        Row: {
          category: string | null
          company_id: string
          created_at: string | null
          id: string
          max_amount: number | null
          profile_id: string | null
          requires_approval: boolean | null
          requires_receipt: boolean | null
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          max_amount?: number | null
          profile_id?: string | null
          requires_approval?: boolean | null
          requires_receipt?: boolean | null
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          max_amount?: number | null
          profile_id?: string | null
          requires_approval?: boolean | null
          requires_receipt?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "spending_policies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spending_policies_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      seed_default_categories: {
        Args: { p_company_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Simple helper types without complex generics
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']
