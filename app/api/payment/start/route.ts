import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Inizializza il client Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log('Dati ricevuti:', data)

    // Verifica dati necessari
    if (!data.Name || !data.Surname || !data.CF || !data.Email || !data.Amount) {
      throw new Error('Dati mancanti nella richiesta')
    }

    // Prepara la richiesta per EasyCommerce
    const easyCommerceRequest = {
      Acquisto: {
        nomecognome: `${data.Name} ${data.Surname}`,
        codicefiscale: data.CF,
        email: data.Email,
        importo: data.Amount,
        codiceprodotto: "CERT_CONTR",
        causale: `Certificazione contratto di lavoro - ${data.ContractType}`
      }
    }

    console.log('Richiesta a EasyCommerce:', easyCommerceRequest)

    // Chiamata a EasyCommerce
    const easyResponse = await fetch(
      'https://uniupo.temposrl.it/easycommerce/api/GeneraAvviso',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(easyCommerceRequest)
      }
    )

    if (!easyResponse.ok) {
      const errorText = await easyResponse.text()
      console.error('Errore EasyCommerce:', errorText)
      throw new Error(`Errore nella generazione dell'avviso: ${errorText}`)
    }

    const easyData = await easyResponse.json()
    console.log('Risposta EasyCommerce:', easyData)

    if (!easyData.codiceavviso) {
      throw new Error('Codice avviso mancante nella risposta')
    }

    // Aggiorna la pratica con il codice IUV
    const { error: updateError } = await supabase
      .from('practices')
      .update({
        payment_iuv: easyData.codiceavviso,
        payment_status: 'pending',
        payment_started_at: new Date().toISOString(),
        status: 'payment_pending'
      })
      .eq('id', data.PracticeId)

    if (updateError) {
      console.error('Errore aggiornamento pratica:', updateError)
      throw new Error('Errore nel salvataggio del codice IUV')
    }

    // Costruisci l'URL di redirect con returnUrl
    const redirectUrl = `https://uniupo.temposrl.it/easycommerce/Payment/Show/${easyData.codiceavviso}?returnUrl=${encodeURIComponent(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/user/payment-result?practiceId=${data.PracticeId}`
    )}`

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