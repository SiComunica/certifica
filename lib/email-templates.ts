export const paymentTemplates = {
  paymentReceived: ({ contractId, amount }: { contractId: string; amount: number }) => {
    return `
      Gentile utente,

      Il suo pagamento di €${amount} per il contratto ${contractId} è stato ricevuto con successo.

      Grazie per aver utilizzato i nostri servizi.

      Cordiali saluti,
      Il team di Certifica
    `
  },

  documentSigned: ({ documentId, date }: { documentId: string; date: string }) => {
    return `
      Gentile utente,

      Il documento ${documentId} è stato firmato correttamente in data ${date}.

      Cordiali saluti,
      Il team di Certifica
    `
  }
} 