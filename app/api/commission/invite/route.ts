import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })
    const siteUrl = 'https://certifica-sjmx.vercel.app'

    // Genera una password temporanea casuale
    const tempPassword = Math.random().toString(36).slice(-12)

    // Crea l'utente
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: false,
      user_metadata: { role: 'admin' }
    })

    if (userError) throw userError

    // Forza l'invio dell'email di verifica
    const { error: emailError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      password: tempPassword,
      options: {
        redirectTo: `${siteUrl}/auth/commission-signup`
      }
    })

    if (emailError) throw emailError

    // Salva l'invito
    const { error: inviteError } = await supabase
      .from('commission_invites')
      .insert({
        email: email.trim(),
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
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