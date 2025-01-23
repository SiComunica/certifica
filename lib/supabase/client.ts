import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Esportiamo sia il client che la funzione per crearlo
export const supabase = createClientComponentClient()
export const createClient = () => {
  return createClientComponentClient()
} 