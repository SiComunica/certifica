interface PaymentConfig {
  amount: number
  description: string
  practiceId: string | number
  successUrl: string
  cancelUrl: string
}

export class EasyPayment {
  private config: PaymentConfig

  constructor(config: PaymentConfig) {
    this.config = config
  }

  async createPaymentLink(): Promise<string> {
    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.config),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Errore nella creazione del pagamento')
      }

      return data.paymentUrl
    } catch (error) {
      console.error('Errore EasyPayment:', error)
      throw error
    }
  }
} 