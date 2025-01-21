import { User } from '@supabase/supabase-js'

declare global {
  type RequestStatus = 'pending' | 'approved' | 'rejected'
  type PaymentStatus = 'pending' | 'paid' | 'failed'

  interface CertificationRequest {
    id: string
    request_number: string
    status: RequestStatus
    payment_status: PaymentStatus
    created_at: string
    reviewed_at?: string
    review_notes?: string
    company_id: string
    employee_id: string
    urgent: boolean
    company: {
      company_name: string
    }
    employee: {
      first_name: string
      last_name: string
    }
  }

  interface Company {
    id: string
    company_name: string
    vat_number: string
    address: string
    email: string
    phone: string
  }

  interface Employee {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
    company_id: string
  }
}

export {} 