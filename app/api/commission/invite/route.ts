import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    console.log('Email da invitare:', email)
    
    const supabase = createRouteHandlerClient({ cookies })

    // Crea un link di registrazione diretto
    const { data, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      password: Math.random().toString(36).slice(-12),
      options: {
        redirectTo: 'https://certifica-sjmx.vercel.app/auth/commission-signup'
      }
    })

    if (linkError) {
      console.error('Errore generazione link:', linkError)
      throw linkError
    }

    // Salva l'invito
    const { error: inviteError } = await supabase
      .from('commission_invites')
      .insert({
        email: email.trim(),
        status: 'pending',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })

    if (inviteError) {
      console.error('Errore salvataggio invito:', inviteError)
      throw inviteError
    }

    // Invia solo l'email con magic link
    const { error: emailError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://certifica-sjmx.vercel.app/auth/commission-signup',
        data: {
          isCommissionInvite: true
        }
      }
    })

    if (emailError) {
      console.error('Errore invio email:', emailError)
      throw emailError
    }

    console.log('Invito inviato con successo')
    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Errore completo:', error)
    return NextResponse.json(
      { error: error.message || 'Errore durante l\'invio dell\'invito' },
      { status: 500 }
    )
  }
} 