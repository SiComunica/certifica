import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    const supabase = createRouteHandlerClient({ cookies })

    // Genera un codice casuale
    const code = randomBytes(4).toString('hex').toUpperCase()

    // Salva il codice nel database
    const { error: saveError } = await supabase
      .from('commission_invite_codes')
      .insert({
        code,
        email,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 giorni
      })

    if (saveError) throw saveError

    return NextResponse.json({ success: true, code })

  } catch (error: any) {
    console.error('Errore:', error)
    return NextResponse.json(
      { error: error.message || 'Errore nella generazione del codice' },
      { status: 500 }
    )
  }
} 