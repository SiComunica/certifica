import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Versione semplificata per il test
    return NextResponse.json({
      success: true,
      message: 'Test endpoint funzionante',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Errore nel test:', error)
    return NextResponse.json(
      { error: 'Errore durante il test' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    // Versione semplificata per il test
    return NextResponse.json({
      success: true,
      message: 'Test POST endpoint funzionante',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Errore nel test POST:', error)
    return NextResponse.json(
      { error: 'Errore durante il test POST' },
      { status: 500 }
    )
  }
} 