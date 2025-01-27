import { NextResponse } from 'next/server'

const EASY_PAYMENT_API = process.env.EASY_PAYMENT_API
const EASY_PAYMENT_KEY = process.env.EASY_PAYMENT_KEY

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${EASY_PAYMENT_API}/create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EASY_PAYMENT_KEY}`
      },
      body: JSON.stringify({
        amount: body.amount,
        description: body.description,
        metadata: {
          practiceId: body.practiceId
        },
        success_url: body.successUrl,
        cancel_url: body.cancelUrl
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Errore API EasyPayment')
    }

    return NextResponse.json({ paymentUrl: data.url })
  } catch (error) {
    console.error('Errore creazione pagamento:', error)
    return NextResponse.json(
      { message: 'Errore nella creazione del pagamento' },
      { status: 500 }
    )
  }
} 