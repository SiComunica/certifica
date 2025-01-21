export interface Practice {
  id: string
  practice_number: string
  status: string
  employee_name: string
  assigned_to: string | null
  notes: string[]
  created_at: string
  updated_at: string
  contract_type: string
}

export interface Member {
  id: string
  email: string
  full_name: string
  role: string
}

export interface Comment {
  id: string
  practice_id: string
  user_id: string
  content: string
  created_at: string
  user: {
    full_name: string
  }
} 