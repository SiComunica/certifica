import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tviiynqkosrflhffouwj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2aWl5bnFrb3NyZmxoZmZvdXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NTgwODMsImV4cCI6MjA1MTEzNDA4M30.OG_mRLnEWYu9OgeCso3HujljhNlnKDio-v6vKuW17qY'

// Client per componenti
export function createClientComponentClient() {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Client per API e server components
export const supabase = createClient(supabaseUrl, supabaseAnonKey) 