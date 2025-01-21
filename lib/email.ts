import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"

export async function sendNotificationEmail(
  recipientEmail: string, 
  subject: string, 
  content: string
) {
  const supabase = createClientComponentClient()
  
  try {
    // Salva la notifica nel database
    const { error: dbError } = await supabase
      .from('notifications')
      .insert({
        recipient_email: recipientEmail,
        subject,
        content,
        read: false
      })

    if (dbError) throw dbError

    // Invia email tramite Edge Function di Supabase
    const { error: functionError } = await supabase
      .functions.invoke('send-email', {
        body: { 
          to: recipientEmail,
          subject,
          content
        }
      })

    if (functionError) throw functionError

    return { success: true }
  } catch (error) {
    console.error('Errore invio email:', error)
    toast.error("Errore nell'invio della notifica")
    return { success: false, error }
  }
}

export const emailService = {
  sendEmail: async (to: string, subject: string, content: string) => {
    // Implementazione del servizio email
    console.log('Email service mock:', { to, subject, content })
  }
} 