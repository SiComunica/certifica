import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = createRouteHandlerClient({ cookies })

    // Verifica il token di autenticazione
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${process.env.PAYMENT_WEBHOOK_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Aggiorna lo stato della pratica
    const { error } = await supabase
      .from('practices')
      .update({
        payment_status: 'completed',
        payment_date: new Date().toISOString(),
        status: 'pending_submission' // pronta per essere inviata alla commissione
      })
      .eq('id', body.practiceId)

    if (error) throw error

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('Errore nella callback di pagamento:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 