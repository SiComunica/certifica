import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client per componenti
export function createClientComponentClient() {
  return createClient<Database>(supabaseUrl, supabaseKey)
}

// Client per API e server components
export const supabase = createClient<Database>(supabaseUrl, supabaseKey) 