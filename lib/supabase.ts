import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key:', supabaseKey?.substring(0, 10) + '...')

export const supabase = createClient(supabaseUrl, supabaseKey)

export type SupabaseClient = typeof supabase