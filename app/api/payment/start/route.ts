import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { paymentData, practiceId } = await request.json()

    console.log('Dati ricevuti:', { paymentData, practiceId })

    const paymentRequest = {
      codiceprodotto: "CERT_CONTR",
      prezzo: 10000,
      nomecognome: `${paymentData.Name} ${paymentData.Surname}`,
      codicefiscale: paymentData.CF,
      email: paymentData.Email
    }

    console.log('Richiesta a EasyCommerce:', paymentRequest)

    const response = await fetch('https://uniupo.temposrl.it/easycommerce/api/GeneraAvviso', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(paymentRequest)
    })

    console.log('Status risposta:', response.status)
    const responseText = await response.text()
    console.log('Risposta EasyCommerce:', responseText)

    if (!response.ok) {
      throw new Error(`Errore EasyCommerce: ${responseText}`)
    }

    const data = JSON.parse(responseText)
    
    const redirectUrl = `https://uniupo.temposrl.it/easycommerce/Payment/Show/${data.codiceavviso}?returnUrl=${encodeURIComponent(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/user/nuova-pratica/payment-callback?practiceId=${practiceId}`
    )}`

    console.log('URL di redirect:', redirectUrl)

    return NextResponse.json({ redirectUrl })
  } catch (error: any) {
    console.error('Errore dettagliato:', error)
    return NextResponse.json(
      { 
        error: 'Errore durante l\'avvio del pagamento',
        details: error.message 
      }, 
      { status: 500 }
    )
  }
} 