import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { pagopaApi } from '@/lib/pagopa'

export interface Payment {
  id: string
  user_id: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export const paymentsApi = {
  async create(contractId: string, amount: number) {
    const supabase = createClientComponentClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Utente non autenticato')

    // Crea il pagamento nel database
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        amount,
        user_id: user.id,
        status: 'pending',
        contract_id: contractId
      })
      .select()
      .single()

    if (error) throw error

    // Inizializza il pagamento con PagoPA
    const pagopaPayment = await pagopaApi.createPayment({
      amount,
      description: `Pagamento pratica #${contractId}`,
      email: user.email!,
      fiscalCode: user.user_metadata.fiscal_code,
      orderId: payment.id
    })

    return pagopaPayment
  },

  async verifyStatus(paymentId: string): Promise<Payment> {
    const supabase = createClientComponentClient()

    // Verifica lo stato nel database
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (error) throw error

    // Se il pagamento è ancora in pending, verifica con PagoPA
    if (payment.status === 'pending') {
      const pagopaStatus = await pagopaApi.verifyPayment(paymentId)
      
      // Aggiorna lo stato nel database se necessario
      if (pagopaStatus.status !== payment.status) {
        const { data: updatedPayment, error: updateError } = await supabase
          .from('payments')
          .update({ status: pagopaStatus.status })
          .eq('id', paymentId)
          .select()
          .single()

        if (updateError) throw updateError
        return updatedPayment
      }
    }

    return payment
  },

  async getPaymentsByContract(contractId: string): Promise<Payment[]> {
    const supabase = createClientComponentClient()

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
} 