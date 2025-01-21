import { NextRequest, NextResponse } from 'next/server'

// Simuliamo un database in memoria per ora
const documents = new Map()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('id')

    if (!documentId) {
      // Se non c'è ID, restituisci tutti i documenti
      return NextResponse.json(Array.from(documents.values()))
    }

    // Se c'è ID, restituisci il documento specifico
    const document = documents.get(documentId)

    if (!document) {
      return NextResponse.json(
        { error: 'Documento non trovato' },
        { status: 404 }
      )
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Errore nel recupero del documento:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero del documento' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const id = Date.now().toString()
    
    // Salva il documento in memoria
    documents.set(id, { id, ...data })

    return NextResponse.json({ 
      success: true, 
      message: 'Documento salvato',
      document: documents.get(id)
    })
  } catch (error) {
    console.error('Errore nella creazione del documento:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione del documento' },
      { status: 500 }
    )
  }
} 