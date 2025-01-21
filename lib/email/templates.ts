interface EmailTemplate {
  subject: string
  html: string
}

export const paymentTemplates = {
  paymentReceived({ contractId, amount }: { contractId: string; amount: number }): EmailTemplate {
    return {
      subject: `Pagamento ricevuto per la pratica #${contractId}`,
      html: `
        <h1>Pagamento ricevuto</h1>
        <p>Abbiamo ricevuto il tuo pagamento di €${amount.toFixed(2)} per la pratica #${contractId}.</p>
        <p>La tua pratica è ora in fase di revisione.</p>
      `
    }
  },

  paymentFailed({ contractId, error }: { contractId: string; error: string }): EmailTemplate {
    return {
      subject: `Pagamento fallito per la pratica #${contractId}`,
      html: `
        <h1>Pagamento fallito</h1>
        <p>Il pagamento per la pratica #${contractId} non è andato a buon fine.</p>
        <p>Motivo: ${error}</p>
        <p>Per favore riprova il pagamento dalla tua dashboard.</p>
      `
    }
  },

  paymentExpired({ contractId }: { contractId: string }): EmailTemplate {
    return {
      subject: `Pagamento scaduto per la pratica #${contractId}`,
      html: `
        <h1>Pagamento scaduto</h1>
        <p>Il tempo per completare il pagamento della pratica #${contractId} è scaduto.</p>
        <p>Per favore effettua un nuovo tentativo di pagamento dalla tua dashboard.</p>
      `
    }
  }
} 