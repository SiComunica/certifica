import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    const supabase = createRouteHandlerClient({ cookies })
    const siteUrl = 'https://certifica-sjmx.vercel.app'

    // Usa inviteUserByEmail che ha un template dedicato
    const { data, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/auth/commission-signup`,
      data: { 
        role: 'admin'
      }
    })

    if (inviteError) throw inviteError

    // Salva l'invito
    const { error: dbError } = await supabase
      .from('commission_invites')
      .insert({
        email: email.trim(),
        status: 'pending',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })

    if (dbError) throw dbError

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Errore invito:', error)
    return NextResponse.json(
      { error: error.message || 'Errore durante l\'invio dell\'invito' },
      { status: 500 }
    )
  }
} 