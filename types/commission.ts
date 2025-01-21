// Tipi per i membri della commissione
export interface CommissionMember {
  id: string
  email: string
  full_name: string
  role: 'commission_member'
  invited_at: string
  joined_at?: string
  status: 'active' | 'pending' | 'inactive'
}

// Tipi per i documenti
export interface Document {
  id: string
  practice_id: string
  file_name: string
  file_url: string
  file_type: string
  uploaded_at: string
  status: 'pending' | 'verified' | 'rejected'
}

// Tipi per le note
export interface Note {
  id: string
  practice_id: string
  member_id: string
  content: string
  created_at: string
  updated_at: string
  visibility: 'internal' | 'public' // internal = solo commissione, public = visibile all'utente
}

// Tipi per le pratiche
export interface Practice {
  id: string
  status: 'submitted' | 'in_progress' | 'completed' | 'rejected'
  assigned_to?: string  // ID del membro commissione
  submitted_at: string
  started_at?: string
  completed_at?: string
  user_data: {
    name: string
    email: string
  }
  documents: Document[]
  notes: Note[]
  payment_status: 'pending' | 'paid' | 'rejected'
  payment_amount: number
  payment_date?: string
}

// Tipi per i filtri
export interface PracticeFilters {
  status?: Practice['status'][]
  assignedTo?: string
  dateRange?: {
    start: string
    end: string
  }
  searchTerm?: string
  paymentStatus?: Practice['payment_status']
} 