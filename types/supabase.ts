export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string
          role: string
          updated_at: string
        }
        Insert: {
          user_id: string
          username: string
          role: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          user_id: string
          company_name: string
          vat_number: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          company_name: string
          vat_number: string
        }
      }
      employees: {
        Row: {
          id: string
          company_id: string
          first_name: string
          last_name: string
          fiscal_code: string
          created_at: string
        }
        Insert: {
          company_id: string
          first_name: string
          last_name: string
          fiscal_code: string
        }
      }
      certification_requests: {
        Row: {
          id: string
          company_id: string
          employee_id: string
          request_number: string
          status: string
          created_at: string
          updated_at: string
          payment_status: string
          payment_id: string | null
        }
        Insert: {
          company_id: string
          employee_id: string
          request_number: string
          status?: string
          payment_status?: string
          payment_id?: string
        }
      }
      documents: {
        Row: {
          id: string
          certification_request_id: string
          file_name: string
          file_path: string
          created_at: string
        }
        Insert: {
          certification_request_id: string
          file_name: string
          file_path: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 