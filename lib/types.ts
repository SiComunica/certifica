export interface Company {
  id: string
  user_id: string
  company_name: string
  vat_number: string
  fiscal_code: string
  created_at: string
}

export interface Employee {
  id: string
  company_id: string
  first_name: string
  last_name: string
  email: string
}

export interface CertificationRequest {
  id: string
  company_id: string
  employee_id: string
  request_number: string
  status: 'pending' | 'approved' | 'rejected'
  payment_status: 'pending' | 'paid'
  payment_amount: number
  is_urgent: boolean
  is_complex: boolean
  created_at: string
}

export interface Document {
  id: string
  certification_request_id: string
  file_name: string
  file_path: string
  created_at: string
} 