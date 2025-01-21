import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Per ora restituiamo una risposta semplificata
    return NextResponse.json({
      success: true,
      message: 'Download route funzionante',
      documentId: id
    })
  } catch (error) {
    console.error('Errore:', error)
    return NextResponse.json(
      { error: 'Errore nel download del documento' },
      { status: 500 }
    )
  }
} 