import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    // Validazione email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Indirizzo email non valido' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })
    const siteUrl = 'https://certifica-sjmx.vercel.app'

    // Prima verifichiamo se l'utente esiste già
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Utente già registrato' },
        { status: 400 }
      )
    }

    // Creiamo l'utente con una password temporanea
    const tempPassword = Math.random().toString(36).slice(-12)
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password: tempPassword,
      email_confirm: true,
      user_metadata: { role: 'admin' },
      role: 'authenticated'
    })

    if (userError) throw userError

    // Generiamo il link di reset password
    const { error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email.trim(),
      options: {
        redirectTo: `${siteUrl}/auth/commission-signup`
      }
    })

    if (resetError) throw resetError

    return NextResponse.json({ success: true, data: userData })

  } catch (error: any) {
    console.error('Errore invito:', error)
    return NextResponse.json(
      { error: error.message || 'Errore durante l\'invio dell\'invito' },
      { status: 500 }
    )
  }
} 