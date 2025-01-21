import { NextResponse } from "next/server"

export async function GET() {
  const envVars = {
    DATABASE_URL: process.env.DATABASE_URL ? 'Presente' : 'Mancante',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Presente' : 'Mancante',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Presente' : 'Mancante',
    NODE_ENV: process.env.NODE_ENV
  }

  console.log('Variabili ambiente:', envVars)

  return NextResponse.json(envVars)
} 