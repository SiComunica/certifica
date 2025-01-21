import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Per ora restituiamo una risposta semplice
    return NextResponse.json({ 
      success: true, 
      message: 'Documento ricevuto',
      data
    })

  } catch (error) {
    console.error('Errore nella gestione del documento:', error)
    return NextResponse.json(
      { error: 'Errore nella gestione del documento' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: true,
    message: 'API documenti funzionante'
  })
} 