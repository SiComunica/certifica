import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    console.log('Email ricevuta:', email)
    
    const supabase = createRouteHandlerClient({ cookies })
    const siteUrl = 'https://certifica-sjmx.vercel.app'

    // Verifica che chi fa la richiesta sia un admin
    const { data: { user } } = await supabase.auth.getUser()
    console.log('User:', user)

    // Crea l'invito nel database
    const { data: invite, error: inviteError } = await supabase
      .from('commission_invites')
      .insert({
        email,
        invited_by: user?.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 giorni
        status: 'pending'
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Errore creazione invito:', inviteError)
      throw inviteError
    }
    console.log('Invito creato:', invite)

    // Invia l'email
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/commission-signup`,
        data: {
          role: 'admin',
          invite_id: invite.id
        }
      }
    })

    if (error) {
      console.error('Errore invio OTP:', error)
      throw error
    }
    console.log('OTP inviato con successo:', data)

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Errore completo:', error)
    return NextResponse.json(
      { error: 'Errore durante l\'invio dell\'invito' },
      { status: 500 }
    )
  }
} 