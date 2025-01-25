import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { paymentData, practiceId } = await request.json()

    console.log('Dati ricevuti:', { paymentData, practiceId })

    // Costruisci l'oggetto Acquisto come specificato nell'XSD
    const acquisto = {
      Acquisto: {
        nomecognome: `${paymentData.Name} ${paymentData.Surname}`.trim(),
        codicefiscale: paymentData.CF,
        email: paymentData.Email,
        codiceprodotto: "CERT_CONTR",
        prezzo: 10000 // 100 euro in centesimi
      }
    }

    console.log('Richiesta a EasyCommerce:', acquisto)

    const response = await fetch('https://uniupo.temposrl.it/easycommerce/api/GeneraAvviso', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(acquisto)
    })

    console.log('Status risposta:', response.status)
    const responseText = await response.text()
    console.log('Risposta EasyCommerce:', responseText)

    if (!response.ok) {
      throw new Error(`Errore EasyCommerce: ${responseText}`)
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('Errore parsing JSON:', e)
      throw new Error('Risposta non valida da EasyCommerce')
    }

    if (!data.codiceavviso) {
      throw new Error('Codice avviso mancante nella risposta')
    }
    
    const redirectUrl = `https://uniupo.temposrl.it/easycommerce/Payment?numeroAvviso=${data.codiceavviso}&returnUrl=${encodeURIComponent(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/user/nuova-pratica/payment-callback?practiceId=${practiceId}`
    )}`

    console.log('URL di redirect:', redirectUrl)

    return NextResponse.json({ redirectUrl })
  } catch (error: any) {
    console.error('Errore dettagliato:', error)
    return NextResponse.json(
      { 
        error: 'Errore durante l\'avvio del pagamento',
        details: error.message,
        stack: error.stack
      }, 
      { status: 500 }
    )
  }
} 