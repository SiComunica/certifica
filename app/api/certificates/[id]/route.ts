import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Qui la tua logica per generare/recuperare il certificato
    const certificateData = {
      id,
      // altri dati del certificato...
    }

    return NextResponse.json(certificateData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Errore nel recupero del certificato' },
      { status: 500 }
    )
  }
} 