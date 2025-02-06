import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })
    const siteUrl = 'https://certifica-sjmx.vercel.app'

    // Prima creiamo l'utente con una password temporanea
    const tempPassword = Math.random().toString(36).slice(-12)
    
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Confermiamo subito l'email
      user_metadata: { 
        role: 'admin',
        needsPasswordChange: true
      }
    })

    if (userError) throw userError

    // Inviamo subito il reset password
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/commission-signup`
    })

    if (resetError) throw resetError

    // Salviamo l'invito
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
    console.error('Errore completo:', error)
    return NextResponse.json(
      { error: error.message || 'Errore durante l\'invio dell\'invito' },
      { status: 500 }
    )
  }
} 