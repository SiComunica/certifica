import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    
    // Qui andrebbe implementata l'integrazione effettiva con PagoPA
    // Questo è solo un esempio
    const payment = {
      id: crypto.randomUUID(),
      amount: body.amount,
      status: 'pending',
      redirectUrl: `https://checkout.pagopa.it/payment/${crypto.randomUUID()}`
    }

    // Salva il pagamento nel database
    const { error } = await supabase
      .from('payments')
      .insert({
        id: payment.id,
        user_id: session.user.id,
        amount: body.amount,
        status: payment.status
      })

    if (error) throw error

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Errore nella creazione del pagamento:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 