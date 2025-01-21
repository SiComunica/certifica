import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

export interface Contract {
  id: string
  created_at: string
  user_id: string
  status: 'pending' | 'approved' | 'rejected' | 'integration_required'
  type: string
  employee_name: string
  documents: string[]
  notes?: string
  is_urgent: boolean
}

export const contractsApi = {
  async create(contract: Omit<Contract, 'id' | 'created_at' | 'user_id'>) {
    const { data, error } = await supabase
      .from('contracts')
      .insert([contract])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('contracts')
      .select('*, certifications(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Contract>) {
    const { data, error } = await supabase
      .from('contracts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getStats() {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')

    if (error) throw error
    return { data }
  }
} 