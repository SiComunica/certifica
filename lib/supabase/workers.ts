import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface Worker {
  id: string
  employer_id: string
  first_name: string
  last_name: string
  contract_type: 'indeterminato' | 'determinato' | 'apprendistato' | 'altro'
  address: string
  city: string
  created_at: string
}

export const workersApi = {
  async create(worker: Omit<Worker, 'id' | 'employer_id' | 'created_at'>) {
    const supabase = createClientComponentClient()
    
    const { data, error } = await supabase
      .from('workers')
      .insert(worker)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getAll() {
    const supabase = createClientComponentClient()
    
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Worker>) {
    const supabase = createClientComponentClient()
    
    const { data, error } = await supabase
      .from('workers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string) {
    const supabase = createClientComponentClient()
    
    const { error } = await supabase
      .from('workers')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
} 