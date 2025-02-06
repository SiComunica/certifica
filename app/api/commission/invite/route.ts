import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    console.log('1. Email ricevuta:', email)
    
    const supabase = createRouteHandlerClient({ cookies })
    const siteUrl = 'https://certifica-sjmx.vercel.app'
    
    // Crea un token personalizzato
    const token = Math.random().toString(36).substring(2)
    console.log('2. Token generato:', token)

    // Salva l'invito con il token
    console.log('3. Salvataggio invito nel database...')
    const { error: dbError } = await supabase
      .from('commission_invites')
      .insert({
        email: email.trim(),
        status: 'pending',
        token: token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })

    if (dbError) {
      console.error('Errore database:', dbError)
      throw dbError
    }
    console.log('4. Invito salvato con successo')

    // Invia magic link con token
    console.log('5. Invio magic link...')
    const { data, error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?commission=true&token=${token}`,
        data: {
          type: 'commission',
          token: token
        }
      }
    })

    if (signInError) {
      console.error('Errore invio magic link:', signInError)
      throw signInError
    }
    console.log('6. Magic link inviato con successo:', data)

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Errore completo:', error)
    return NextResponse.json(
      { error: error.message || 'Errore durante l\'invio dell\'invito' },
      { status: 500 }
    )
  }
} 