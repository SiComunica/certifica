import { NextResponse } from 'next/server'

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

    const response = await fetch(
      `https://uniupo.temposrl.it/easycommerce/api/GeneraAvviso/${contractType}/${Math.round(totalPrice * 100)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nomecognome: employeeName,
          codicefiscale: fiscalCode,
          email: email || '',
          codiceprodotto: contractType,
          prezzo: Math.round(totalPrice * 100)
        })
      }
    )

    const data = await response.json()
    console.log('Risposta da Easy Commerce:', data)

    if (!data.codiceavviso) {
      throw new Error('Codice avviso non ricevuto da Easy Commerce')
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Errore nella generazione avviso:', error)
    return NextResponse.json(
      { error: error?.message || 'Errore nella generazione dell\'avviso di pagamento' },
      { status: 500 }
    )
  }
} 