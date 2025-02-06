import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_COMMISSION_KEY)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    console.log('1. Email da invitare:', email)
    console.log('2. API Key Resend Commission:', process.env.RESEND_COMMISSION_KEY ? 'Presente' : 'Mancante')
    
    const supabase = createRouteHandlerClient({ cookies })

    // Salva l'invito
    console.log('3. Salvataggio invito...')
    const { error: inviteError } = await supabase
      .from('commission_invites')
      .insert({
        email: email.trim(),
        status: 'pending',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })

    if (inviteError) {
      console.error('Errore salvataggio invito:', inviteError)
      throw inviteError
    }
    console.log('4. Invito salvato con successo')

    // Invia email con Resend
    console.log('5. Invio email con Resend...')
    const { data, error: emailError } = await resend.emails.send({
      from: 'Certifica Commissione <onboarding@resend.dev>',
      to: email,
      subject: 'Invito a Certifica - Registrazione Commissione',
      html: `
        <h2>Invito a Certifica</h2>
        <p>Sei stato invitato come membro della commissione.</p>
        <p>Per completare la registrazione, clicca sul link seguente:</p>
        <a href="https://certifica-sjmx.vercel.app/auth/commission-signup">Completa Registrazione</a>
        <p>Se non hai richiesto questo invito, puoi ignorare questa email.</p>
      `
    })

    if (emailError) {
      console.error('Errore invio email:', emailError)
      throw emailError
    }
    console.log('6. Email inviata con successo:', data)

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Errore completo:', error)
    return NextResponse.json(
      { error: error.message || 'Errore durante l\'invio dell\'invito' },
      { status: 500 }
    )
  }
} 