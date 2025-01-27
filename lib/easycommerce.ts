interface EasyCommerceConfig {
  amount: number // in centesimi
  description: string
  userInfo?: {
    name?: string
    fiscalCode?: string
    email?: string
  }
  productCode: string
}

export class EasyCommerce {
  private baseUrl: string
  private token: string

  constructor() {
    this.baseUrl = process.env.EASY_COMMERCE_API || ''
    this.token = process.env.EASY_COMMERCE_TOKEN || ''
  }

  async generateAvviso(config: EasyCommerceConfig) {
    try {
      const response = await fetch(`${this.baseUrl}/api/GeneraAvviso/${config.productCode}/${config.amount}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nomecognome: config.userInfo?.name || '',
          codicefiscale: config.userInfo?.fiscalCode || '',
          email: config.userInfo?.email || '',
          codiceprodotto: config.productCode,
          prezzo: config.amount
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      const data = await response.json()
      return {
        iuv: data.iuv,
        codiceavviso: data.codiceavviso,
        email: data.email,
        prezzo: data.prezzo
      }
    } catch (error) {
      console.error('Errore generazione avviso:', error)
      throw error
    }
  }

  async notificaPagamento(iuv: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/NotificaPagamento`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          numeroAvviso: iuv,
          iuv: iuv,
          idTerminale: process.env.EASY_COMMERCE_TERMINAL_ID,
          prezzo: 0, // verrà settato dal backend
          idTransazione: Date.now().toString(),
          dataTransazione: Date.now(),
          esito: "OK"
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      return await response.json()
    } catch (error) {
      console.error('Errore notifica pagamento:', error)
      throw error
    }
  }
} 