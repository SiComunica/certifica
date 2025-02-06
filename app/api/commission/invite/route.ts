import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    console.log('Email da invitare:', email)
    
    const supabase = createRouteHandlerClient({ cookies })

    const { error: emailError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://certifica-sjmx.vercel.app/auth/callback'
      }
    })

    if (emailError) {
      console.error('Errore invio email:', emailError)
      throw emailError
    }

    console.log('Email inviata con successo')
    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Errore completo:', error)
    return NextResponse.json(
      { error: error.message || 'Errore durante l\'invio dell\'invito' },
      { status: 500 }
    )
  }
} 