import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { emailTemplates } from '@/utils/emailTemplates'

const resend = new Resend(process.env.RESEND_API_KEY)
const TEST_EMAIL = 'francescocro76@gmail.com'

export async function GET() {
  try {
    console.log('Inizio test invio email...')

    // Test template approvazione
    const approvalResult = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: TEST_EMAIL,
      subject: 'Test: Pagamento Approvato',
      html: emailTemplates.paymentApproved({
        userName: 'Francesco',
        practiceId: 'TEST-001',
        amount: 150.00,
        verificationDate: new Date().toLocaleDateString()
      })
    })

    // Test template rifiuto
    const rejectionResult = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: TEST_EMAIL,
      subject: 'Test: Pagamento Rifiutato',
      html: emailTemplates.paymentRejected({
        userName: 'Francesco',
        practiceId: 'TEST-001',
        rejectionReason: 'Test di rifiuto pagamento'
      })
    })

    // Test template reminder
    const reminderResult = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: TEST_EMAIL,
      subject: 'Test: Reminder Pagamento',
      html: emailTemplates.paymentReminder({
        userName: 'Francesco',
        practiceId: 'TEST-001',
        amount: 150.00,
        paymentDate: new Date().toLocaleDateString()
      })
    })

    return NextResponse.json({ 
      success: true,
      results: {
        approval: approvalResult.data?.id,
        rejection: rejectionResult.data?.id,
        reminder: reminderResult.data?.id
      },
      sentTo: TEST_EMAIL
    })

  } catch (error: any) {
    console.error('Errore:', error)
    return NextResponse.json({ 
      success: false,
      error: error?.message || 'Errore sconosciuto',
      details: error
    }, { 
      status: error?.statusCode || 500 
    })
  }
} 