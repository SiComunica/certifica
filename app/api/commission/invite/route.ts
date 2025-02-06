import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    console.log('Email da invitare:', email)
    
    const supabase = createRouteHandlerClient({ cookies })

    // 1. Salva in commission_invites
    const { error: inviteError } = await supabase
      .from('commission_invites')
      .insert({
        email: email.trim(),
        status: 'pending',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })

    if (inviteError) throw inviteError

    // 2. Crea un link di signup diretto con password temporanea
    const tempPassword = Math.random().toString(36).slice(-12)
    const { data, error: signupError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      password: tempPassword,  // Password temporanea richiesta
      options: {
        redirectTo: 'https://certifica-sjmx.vercel.app/auth/commission-signup',
        data: {
          role: 'admin'
        }
      }
    })

    if (signupError) throw signupError

    // 3. Usa il link generato nel template
    const { error: emailError } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: data.properties.action_link
    })

    if (emailError) throw emailError

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Errore:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 