import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })

    // Invia solo l'email con il link diretto
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: { 
          role: 'admin'
        }
      }
    })

    if (signInError) throw signInError

    // Salva l'invito
    const { error: inviteError } = await supabase
      .from('commission_invites')
      .insert({
        email: email.trim(),
        status: 'pending',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })

    if (inviteError) throw inviteError

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Errore invito:', error)
    return NextResponse.json(
      { error: error.message || 'Errore durante l\'invio dell\'invito' },
      { status: 500 }
    )
  }
} 