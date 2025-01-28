import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { contractType, totalPrice, employeeName, fiscalCode, email } = body

    // Chiamata a Easy Commerce dal backend
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
    return NextResponse.json(data)
  } catch (error) {
    console.error('Errore nella generazione avviso:', error)
    return NextResponse.json(
      { error: 'Errore nella generazione dell\'avviso di pagamento' },
      { status: 500 }
    )
  }
} 