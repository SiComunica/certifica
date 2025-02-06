import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    console.log('Email da invitare:', email)
    
    const supabase = createRouteHandlerClient({ cookies })

    // 1. Solo salvataggio in commission_invites
    const { error: inviteError } = await supabase
      .from('commission_invites')
      .insert({
        email: email.trim(),
        status: 'pending',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })

    if (inviteError) throw inviteError

    // 2. Solo invio email con link diretto alla pagina di registrazione
    const { error: emailError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://certifica-sjmx.vercel.app/auth/commission-signup',
        data: {
          isCommissionInvite: true
        }
      }
    })

    if (emailError) throw emailError

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Errore:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 