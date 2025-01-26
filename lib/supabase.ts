import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

export const supabase = createClientComponentClient<Database>({
  supabaseUrl: 'https://tviiynqkosrflhffouwj.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2aWl5bnFrb3NyZmxoZmZvdXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5MTM5NTIsImV4cCI6MjA1MzQ4OTk1Mn0.EFt0AP3TV2wxpe0yBEL2SyvrODsNa48YiCF4gkqeyx8'
})

export type SupabaseClient = typeof supabase