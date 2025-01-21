import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { status, userEmail, contractId, amount } = await request.json()

    if (status === 'completed') {
      // Email template inline per ora
      const emailContent = `
        Gentile utente,

        Il suo pagamento di €${amount} per il contratto ${contractId} è stato ricevuto con successo.

        Grazie per aver utilizzato i nostri servizi.

        Cordiali saluti,
        Il team di Certifica
      `

      await emailService.sendEmail(
        userEmail,
        'Pagamento Ricevuto',
        emailContent
      )

      return NextResponse.json({
        success: true,
        message: 'Pagamento completato e email inviata'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Callback ricevuta'
    })

  } catch (error) {
    console.error('Errore nella callback del pagamento:', error)
    return NextResponse.json(
      { error: 'Errore nella gestione del pagamento' },
      { status: 500 }
    )
  }
} 