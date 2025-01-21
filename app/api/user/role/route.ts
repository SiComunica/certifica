import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID richiesto' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
    }

    // Determina il ruolo in base all'email
    const isAdmin = user.email === 'francescocro76@gmail.com'

    return NextResponse.json({ 
      role: isAdmin ? 'ADMIN' : 'USER'
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
} 