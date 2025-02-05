import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })
    
    // Usa esplicitamente l'URL di produzione
    const siteUrl = 'https://certifica-sjmx.vercel.app'

    // Verifica che chi fa la richiesta sia un admin
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user?.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

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

    if (inviteError) throw inviteError

    // Invia l'email di invito usando Supabase Auth
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/auth/commission-signup`,
      data: {
        role: 'admin',
        invite_id: invite.id
      }
    })

    if (error) throw error

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Errore invito:', error)
    return NextResponse.json(
      { error: 'Errore durante l\'invio dell\'invito' },
      { status: 500 }
    )
  }
} 