// Tipi per i dati dei template
export interface BaseTemplateData {
  userName?: string
  practiceId?: string
  amount?: number
  paymentDate?: string
  verificationDate?: string
  rejectionReason?: string
}

export interface InviteTemplateData {
  inviteUrl: string
}

export interface PracticeTemplateData {
  practiceId: string
  userName?: string
}

// Unione di tutti i possibili tipi di dati
export type TemplateData = BaseTemplateData | InviteTemplateData | PracticeTemplateData

// Template delle email
export const emailTemplates = {
  // Template pagamenti
  paymentApproved: (data: BaseTemplateData) => `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1>Pagamento Approvato</h1>
      <p>Gentile ${data.userName},</p>
      <p>Il pagamento per la pratica ${data.practiceId} è stato approvato.</p>
      <p>Importo: €${data.amount}</p>
      <p>Data verifica: ${data.verificationDate}</p>
    </div>
  `,

  paymentRejected: (data: BaseTemplateData) => `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1>Pagamento Non Approvato</h1>
      <p>Gentile ${data.userName},</p>
      <p>Il pagamento per la pratica ${data.practiceId} non è stato approvato.</p>
      <p>Motivo: ${data.rejectionReason}</p>
    </div>
  `,

  paymentReminder: (data: BaseTemplateData) => `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1>Reminder Pagamento</h1>
      <p>Gentile ${data.userName},</p>
      <p>Ti ricordiamo di effettuare il pagamento per la pratica ${data.practiceId}.</p>
      <p>Importo: €${data.amount}</p>
      <p>Scadenza: ${data.paymentDate}</p>
    </div>
  `,

  // Template invito commissione
  commissionInvite: (data: InviteTemplateData) => `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1>Invito Commissione Certificazioni</h1>
      <p>Sei stato invitato a far parte della commissione certificazioni.</p>
      <p>Per completare la registrazione, clicca sul link seguente:</p>
      <a href="${data.inviteUrl}" style="display: inline-block; background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Completa Registrazione
      </a>
    </div>
  `,

  // Template pratiche
  practiceInProgress: (data: PracticeTemplateData) => `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1>Pratica in Lavorazione</h1>
      <p>La tua pratica #${data.practiceId} è stata presa in carico dalla commissione.</p>
      <p>Riceverai un aggiornamento quando la verifica sarà completata.</p>
    </div>
  `,

  practiceCompleted: (data: PracticeTemplateData) => `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1>Pratica Completata</h1>
      <p>Gentile ${data.userName},</p>
      <p>La tua pratica #${data.practiceId} è stata approvata dalla commissione.</p>
    </div>
  `,

  practiceRejected: (data: PracticeTemplateData) => `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1>Pratica Non Approvata</h1>
      <p>Gentile ${data.userName},</p>
      <p>La tua pratica #${data.practiceId} non è stata approvata dalla commissione.</p>
      <p>Per maggiori informazioni, accedi alla tua area personale.</p>
    </div>
  `
} as const

export type EmailTemplate = keyof typeof emailTemplates 