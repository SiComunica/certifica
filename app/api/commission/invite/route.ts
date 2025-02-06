import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    console.log('Email da invitare:', email)
    
    const supabase = createRouteHandlerClient({ cookies })

    // Prima creiamo l'utente con email già verificata
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,  // Email già verificata
      user_metadata: {
        role: 'admin'
      }
    })

    if (userError) {
      console.error('Errore creazione utente:', userError)
      throw userError
    }

    // Poi inviamo l'email di reset password
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://certifica-sjmx.vercel.app/auth/commission-signup'
    })

    if (resetError) {
      console.error('Errore invio reset password:', resetError)
      throw resetError
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