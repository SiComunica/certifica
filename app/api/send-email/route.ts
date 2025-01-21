import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { 
  emailTemplates, 
  EmailTemplate, 
  BaseTemplateData, 
  PracticeTemplateData 
} from '@/utils/emailTemplates'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailRequest {
  to: string
  template: EmailTemplate
  data: any // Il tipo specifico viene gestito nel client
}

export async function POST(request: Request) {
  try {
    const { to, template, data }: EmailRequest = await request.json()

    // Durante il periodo di test, reindirizza tutte le email all'indirizzo verificato
    const testEmail = 'francescocro76@gmail.com'
    
    const { data: emailData, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: testEmail,
      subject: getEmailSubject(template, data),
      html: emailTemplates[template](data)
    })

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      success: true,
      emailId: emailData?.id
    })

  } catch (error: any) {
    console.error('Errore invio email:', error)
    return NextResponse.json({ 
      success: false,
      error: error?.message || 'Errore sconosciuto'
    }, { 
      status: error?.statusCode || 500 
    })
  }
}

function getEmailSubject(template: EmailTemplate, data: any): string {
  const subjects: Record<EmailTemplate, string> = {
    paymentApproved: `Pagamento Approvato - Pratica ${(data as BaseTemplateData).practiceId}`,
    paymentRejected: `Pagamento Non Approvato - Pratica ${(data as BaseTemplateData).practiceId}`,
    paymentReminder: `Reminder Pagamento - Pratica ${(data as BaseTemplateData).practiceId}`,
    commissionInvite: 'Invito Commissione Certificazioni',
    practiceInProgress: `Pratica in Lavorazione - #${(data as PracticeTemplateData).practiceId}`,
    practiceCompleted: `Pratica Completata - #${(data as PracticeTemplateData).practiceId}`,
    practiceRejected: `Pratica Non Approvata - #${(data as PracticeTemplateData).practiceId}`
  }
  return subjects[template]
} 