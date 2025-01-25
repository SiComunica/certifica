import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { paymentData, practiceId } = await request.json()

    // Usa l'API GeneraAvviso come specificato nella documentazione
    const response = await fetch('https://uniupo.temposrl.it/easycommerce/api/GeneraAvviso', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        codiceprodotto: "CERT_CONTR", // Codice del prodotto per la certificazione contratto
        prezzo: 10000, // 100 euro in centesimi
        nomecognome: `${paymentData.Name} ${paymentData.Surname}`,
        codicefiscale: paymentData.CF,
        email: paymentData.Email
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Errore EasyCommerce: ${error}`)
    }

    const data = await response.json()
    
    // Costruisci l'URL di redirect usando il codice avviso ricevuto
    const redirectUrl = `https://uniupo.temposrl.it/easycommerce/Payment/Show/${data.codiceavviso}?returnUrl=${encodeURIComponent(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/user/nuova-pratica/payment-callback?practiceId=${practiceId}`
    )}`

    return NextResponse.json({ redirectUrl })
  } catch (error) {
    console.error('Errore avvio pagamento:', error)
    return NextResponse.json({ error: 'Errore durante l\'avvio del pagamento' }, { status: 500 })
  }
} 