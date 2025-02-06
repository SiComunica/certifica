import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    console.log('Email da invitare:', email)
    
    const supabase = createRouteHandlerClient({ cookies })

    // 1. Crea un token semplice
    const token = createHash('sha256')
      .update(email + Date.now().toString())
      .digest('hex')

    // 2. Salva l'invito con il token
    const { error: inviteError } = await supabase
      .from('commission_invites')
      .insert({
        email: email.trim(),
        token: token,
        status: 'pending',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })

    if (inviteError) {
      console.error('Errore salvataggio invito:', inviteError)
      throw inviteError
    }

    // 3. Invia email passando prima per il callback
    const { error: emailError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `https://certifica-sjmx.vercel.app/auth/callback?next=/auth/commission-signup&token=${token}`
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