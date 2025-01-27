import { NextResponse } from 'next/server'

const EASY_API = process.env.EASY_API_URL
const EASY_TOKEN = process.env.EASY_API_TOKEN

export async function POST(request: Request) {
  try {
    const { iuv, codiceFiscale } = await request.json()
    
    // Chiamiamo l'API di EasyCommerce per verificare il pagamento
    const response = await fetch(`${EASY_API}/api/ep/${iuv}/${codiceFiscale}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${EASY_TOKEN}`
      }
    })

    if (!response.ok) {
      throw new Error('Errore nella verifica del pagamento')
    }

    const data = await response.json()
    return NextResponse.json({ esito: data[0] }) // 0 = successo, 1 = fallimento

  } catch (error) {
    console.error('Errore verifica pagamento:', error)
    return NextResponse.json(
      { message: 'Errore nella verifica del pagamento' },
      { status: 500 }
    )
  }
} 