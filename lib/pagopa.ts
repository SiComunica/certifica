const PAGOPA_BASE_URL = 'https://solutionpa.intesasanpaolo.com/IntermediarioPaPortalFe'
const DOMAIN_ID = '80213750583'

interface PaymentData {
  amount: number
  description: string
  email: string
  fiscalCode: string
  orderId: string
}

export const pagopaApi = {
  async createPayment(data: PaymentData) {
    // Genera l'URL di pagamento PagoPA
    const paymentUrl = `${PAGOPA_BASE_URL}/pagamenti/access?idDominioPA=${DOMAIN_ID}`
    
    // Qui andrebbero aggiunti i parametri specifici richiesti da PagoPA
    const urlWithParams = new URL(paymentUrl)
    urlWithParams.searchParams.append('importo', data.amount.toString())
    urlWithParams.searchParams.append('causale', data.description)
    urlWithParams.searchParams.append('email', data.email)
    urlWithParams.searchParams.append('cf', data.fiscalCode)
    urlWithParams.searchParams.append('orderid', data.orderId)

    // Salva i dettagli del pagamento nel nostro database
    const response = await fetch('/api/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        paymentUrl: urlWithParams.toString()
      }),
    })

    if (!response.ok) {
      throw new Error('Errore nella creazione del pagamento')
    }

    return response.json()
  },

  async verifyPayment(paymentId: string) {
    // Verifica lo stato del pagamento
    const response = await fetch(`/api/payments/verify/${paymentId}`)

    if (!response.ok) {
      throw new Error('Errore nella verifica del pagamento')
    }

    return response.json()
  },

  getPaymentUrl(paymentId: string) {
    return `${PAGOPA_BASE_URL}/pagamenti/access?idDominioPA=${DOMAIN_ID}&orderid=${paymentId}`
  }
} 