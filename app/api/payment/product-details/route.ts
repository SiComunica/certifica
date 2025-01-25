import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://uniupo.temposrl.it/easycommerce/api/stores/16/37', {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Errore nel caricamento del prodotto')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Errore API prodotto:', error)
    return NextResponse.json({ error: 'Errore nel caricamento del prodotto' }, { status: 500 })
  }
} 