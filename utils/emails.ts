import { Resend } from 'resend'
import { 
  emailTemplates, 
  EmailTemplate, 
  BaseTemplateData, 
  InviteTemplateData,
  PracticeTemplateData 
} from './emailTemplates'

const resend = new Resend(process.env.RESEND_API_KEY)

// Mappa dei tipi di dati per ogni template
type EmailDataMap = {
  paymentApproved: BaseTemplateData
  paymentRejected: BaseTemplateData
  paymentReminder: BaseTemplateData
  commissionInvite: InviteTemplateData
  practiceInProgress: PracticeTemplateData
  practiceCompleted: PracticeTemplateData
  practiceRejected: PracticeTemplateData
}

// Soggetti delle email
const emailSubjects: {
  [K in EmailTemplate]: (data: EmailDataMap[K]) => string
} = {
  paymentApproved: (data) => 
    `Pagamento Approvato - Pratica ${data.practiceId}`,
  paymentRejected: (data) => 
    `Pagamento Non Approvato - Pratica ${data.practiceId}`,
  paymentReminder: (data) => 
    `Reminder Pagamento - Pratica ${data.practiceId}`,
  commissionInvite: () => 
    'Invito Commissione Certificazioni',
  practiceInProgress: (data) => 
    `Pratica in Lavorazione - #${data.practiceId}`,
  practiceCompleted: (data) => 
    `Pratica Completata - #${data.practiceId}`,
  practiceRejected: (data) => 
    `Pratica Non Approvata - #${data.practiceId}`
}

export async function sendEmail<T extends EmailTemplate>(options: {
  to: string
  template: T
  data: EmailDataMap[T]
}) {
  try {
    const subject = emailSubjects[options.template](options.data)
    const html = emailTemplates[options.template](options.data as any)

    const { data: responseData, error } = await resend.emails.send({
      from: 'Certificazioni <onboarding@resend.dev>',
      to: options.to,
      subject,
      html
    })

    if (error) {
      console.error('Errore invio email:', error)
      return false
    }

    console.log('Email inviata con successo:', responseData)
    return true

  } catch (error) {
    console.error('Errore:', error)
    return false
  }
} 