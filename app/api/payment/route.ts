import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

async function getEasyCommerceToken() {
  try {
    console.log('=== INIZIO AUTENTICAZIONE ===')
    
    const authBody = {
      Username: "UniRoma2test",
      Password: process.env.PAYMENT_API_KEY || '' // Usa la password dalle variabili d'ambiente
    }
    
    const authResponse = await fetch(
      'https://easy-webreport.ccd.uniroma2.it/easyCommerce/test/api/auth/gettoken',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(authBody)
      }
    )

    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      throw new Error(`Autenticazione fallita: ${authResponse.status} ${errorText}`)
    }

    const authData = await authResponse.json()
    return authData.token
  } catch (error) {
    console.error('=== ERRORE AUTENTICAZIONE ===', error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    console.log('Starting payment process...')
    
    // Ottieni il token di autenticazione
    const token = await getEasyCommerceToken()
    console.log('Token ottenuto con successo')

    const supabase = createRouteHandlerClient({ cookies })
    console.log('Supabase client created')
    
    // Verifica autenticazione
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Auth check:', { user: !!user, error: authError })
    
    if (authError || !user) {
      console.log('Auth failed:', authError)
      return NextResponse.json(
        { message: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Recupera i dati dal body
    const paymentData = await request.json()
    console.log('Payment Data received:', paymentData)

    // Validazione dei dati
    if (!paymentData.totalPrice || !paymentData.productId) {
      console.log('Invalid payment data:', paymentData)
      return NextResponse.json(
        { message: 'Dati di pagamento non validi' },
        { status: 400 }
      )
    }

    // Effettua la richiesta di pagamento con il token ottenuto
    const paymentResponse = await fetch(
      'https://easy-webreport.ccd.uniroma2.it/easyCommerce/test/api/payment/create',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: paymentData.totalPrice,
          productId: paymentData.productId,
          userId: user.id,
          // altri dati necessari...
        })
      }
    )

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text()
      throw new Error(`Errore nella risposta del server di pagamento: ${errorText}`)
    }

    const paymentResult = await paymentResponse.json()
    console.log('Payment process completed:', paymentResult)

    return NextResponse.json(
      { 
        message: 'Pagamento iniziato con successo',
        data: paymentResult
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Payment error details:', error)
    return NextResponse.json(
      { 
        message: "Errore durante l'elaborazione del pagamento",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 