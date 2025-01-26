import { Database } from './supabase'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Company = Database['public']['Tables']['companies']['Row']
export type Employee = Database['public']['Tables']['employees']['Row']
export type CertificationRequest = Database['public']['Tables']['certification_requests']['Row']
export type Document = Database['public']['Tables']['documents']['Row']

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type CompanyInsert = Database['public']['Tables']['companies']['Insert']
export type EmployeeInsert = Database['public']['Tables']['employees']['Insert']
export type CertificationRequestInsert = Database['public']['Tables']['certification_requests']['Insert']
export type DocumentInsert = Database['public']['Tables']['documents']['Insert'] 