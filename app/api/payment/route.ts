import { NextResponse } from 'next/server'

async function getEasyCommerceToken() {
  try {
    console.log('Richiesta token...')
    
    const authBody = {
      Username: "[App esterna]",
      Password: "XXXX"
    }
    console.log('Dati autenticazione:', authBody)

    const response = await fetch('https://uniupo.temposrl.it/easycommerce/api/auth/gettoken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authBody)
    })

    console.log('Status risposta auth:', response.status)
    const responseText = await response.text()
    console.log('Risposta auth completa:', responseText)

    if (!response.ok) {
      throw new Error(`Errore auth: ${response.status} ${responseText}`)
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      throw new Error(`Risposta non valida: ${responseText}`)
    }

    if (!data) {
      throw new Error('Nessun token ricevuto')
    }

    console.log('Token ottenuto con successo')
    return data
  } catch (error) {
    console.error('Errore durante autenticazione:', error)
    throw error
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { contractType, totalPrice, employeeName, fiscalCode, email } = body

    console.log('Dati ricevuti:', {
      contractType,
      totalPrice,
      employeeName,
      fiscalCode,
      email
    })

    const url = `https://uniupo.temposrl.it/easycommerce/api/GeneraAvviso/${contractType}/${Math.round(totalPrice * 100)}`
    console.log('URL chiamata:', url)

    const requestBody = {
      nomecognome: employeeName,
      codicefiscale: fiscalCode,
      email: email || '',
      codiceprodotto: contractType,
      prezzo: Math.round(totalPrice * 100)
    }
    console.log('Body della richiesta:', requestBody)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('Status risposta:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Risposta errore:', errorText)
      throw new Error(`Easy Commerce ha risposto con status ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log('Risposta da Easy Commerce:', data)

    if (!data.codiceavviso) {
      console.error('Risposta senza codice avviso:', data)
      throw new Error('Codice avviso non ricevuto da Easy Commerce')
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Errore completo:', error)
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