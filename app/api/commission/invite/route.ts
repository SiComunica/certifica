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
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { role: 'admin' },
      role: 'authenticated'
    })

    if (userError) throw userError

    // Forziamo immediatamente un reset password
    const { error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${siteUrl}/auth/commission-signup`
      }
    })

    if (resetError) throw resetError

    return NextResponse.json({ success: true, data: userData })

  } catch (error) {
    console.error('Errore invito:', error)
    return NextResponse.json(
      { error: 'Errore durante l\'invio dell\'invito' },
      { status: 500 }
    )
  }
} 