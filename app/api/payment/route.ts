import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

async function getEasyCommerceToken() {
  try {
    console.log('=== INIZIO AUTENTICAZIONE ===')
    
    const authBody = {
      Username: "UniRoma2test",
      Password: "XXXX" // Da sostituire con la password ricevuta via email
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
    
    // Verifica configurazione
    if (!process.env.PAYMENT_API_KEY || process.env.PAYMENT_API_KEY === 'xxxx') {
      console.log('Payment credentials not configured')
      return NextResponse.json(
        { message: 'Sistema di pagamento non ancora configurato. Contattare il supporto.' },
        { status: 503 }  // Service Unavailable
      )
    }

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

    // 1. Otteniamo il token
    const token = await getEasyCommerceToken()

    // 2. Chiamiamo l'API5 per l'acquisto diretto
    const shopUrl = `https://easy-webreport.ccd.uniroma2.it/easyCommerce/test/api/authshop/${paymentData.contractType}/${paymentData.productId}/${paymentData.quantity}/${Math.round(paymentData.totalPrice * 100)}`
    
    const response = await fetch(shopUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        email: paymentData.email,
        codiceFiscale: paymentData.fiscalCode,
        nome: paymentData.employeeName.split(' ')[0],
        cognome: paymentData.employeeName.split(' ')[1] || '',
        // Dati fatturazione
        ragioneSociale: paymentData.companyName,
        partitaIva: paymentData.vatNumber,
        codiceFiscaleAzienda: paymentData.companyFiscalCode,
        indirizzo: paymentData.address,
        citta: paymentData.city,
        cap: paymentData.postalCode,
        paese: paymentData.country
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Errore nell'acquisto: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log('Payment process completed successfully')
    return NextResponse.json(data)
  } catch (error: any) {
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