import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { instanceId, employeeId, signedContent } = await request.json()

    // Per ora restituiamo solo una risposta di successo
    // Invece di salvare nel database
    return NextResponse.json({
      success: true,
      message: 'Documento firmato ricevuto',
      data: {
        instanceId,
        employeeId,
        signedContent,
        createdAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Errore nel salvataggio del documento firmato:', error)
    return NextResponse.json(
      { error: 'Errore nel salvataggio del documento firmato' },
      { status: 500 }
    )
  }
} 