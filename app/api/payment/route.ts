import { NextResponse } from 'next/server'

async function getEasyCommerceToken() {
  try {
    console.log('=== INIZIO AUTENTICAZIONE ===')
    
    const authBody = {
      Username: "[App esterna]",
      Password: "XXXX"
    }
    console.log('Invio richiesta token con:', JSON.stringify(authBody, null, 2))

    const authResponse = await fetch('https://uniupo.temposrl.it/easycommerce/api/auth/gettoken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(authBody)
    })

    const authText = await authResponse.text()
    console.log('Status auth:', authResponse.status)
    console.log('Headers auth:', JSON.stringify(Object.fromEntries(authResponse.headers.entries()), null, 2))
    console.log('Risposta auth:', authText)

    if (!authResponse.ok) {
      throw new Error(`Autenticazione fallita: ${authResponse.status} ${authText}`)
    }

    try {
      const authData = JSON.parse(authText)
      console.log('Token ottenuto:', authData)
      return authData.token || authData
    } catch (e) {
      console.error('Errore parsing risposta auth:', e)
      throw new Error(`Risposta auth non valida: ${authText}`)
    }
  } catch (error) {
    console.error('=== ERRORE AUTENTICAZIONE ===', error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    console.log('=== INIZIO RICHIESTA PAGAMENTO ===')
    const body = await request.json()
    console.log('Dati ricevuti:', JSON.stringify(body, null, 2))

    // Otteniamo il token
    const token = await getEasyCommerceToken()
    console.log('Token ottenuto con successo')

    const url = `https://uniupo.temposrl.it/easycommerce/api/GeneraAvviso/${body.contractType}/${Math.round(body.totalPrice * 100)}`
    console.log('URL chiamata:', url)

    const requestBody = {
      nomecognome: body.employeeName,
      codicefiscale: body.fiscalCode,
      email: body.email || '',
      codiceprodotto: body.contractType,
      prezzo: Math.round(body.totalPrice * 100)
    }
    console.log('Body richiesta:', JSON.stringify(requestBody, null, 2))

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    })

    const responseText = await response.text()
    console.log('Status risposta:', response.status)
    console.log('Headers risposta:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2))
    console.log('Risposta:', responseText)

    if (!response.ok) {
      throw new Error(`Easy Commerce ha risposto con status ${response.status}: ${responseText}`)
    }

    const data = JSON.parse(responseText)
    console.log('Dati risposta:', JSON.stringify(data, null, 2))

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('=== ERRORE GENERALE ===', error)
    return NextResponse.json(
      { 
        error: error?.message || 'Errore nella generazione dell\'avviso di pagamento',
        details: error?.toString(),
        stack: error?.stack
      },
      { status: 500 }
    )
  }
} 