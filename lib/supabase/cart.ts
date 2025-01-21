import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface CartItem {
  contract_id: string
  amount: number
  worker_name: string
  created_at: string
}

const PRACTICE_COST = 250 // Costo fisso per pratica in euro

export const cartApi = {
  async addToCart(contractId: string, workerName: string) {
    const supabase = createClientComponentClient()
    
    const { error } = await supabase
      .from('cart_items')
      .insert({
        contract_id: contractId,
        amount: PRACTICE_COST,
        worker_name: workerName,
        status: 'pending'
      })

    if (error) throw error
  },

  async getCartItems() {
    const supabase = createClientComponentClient()
    
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) throw error
    return data as CartItem[]
  },

  async getTotalAmount() {
    const items = await this.getCartItems()
    return items.reduce((total, item) => total + item.amount, 0)
  },

  async processPayment(paymentId: string) {
    const supabase = createClientComponentClient()
    
    // Aggiorna tutti gli elementi nel carrello con il paymentId
    const { data: items } = await supabase
      .from('cart_items')
      .update({ 
        payment_id: paymentId,
        status: 'processing'
      })
      .eq('status', 'pending')
      .select()

    return items
  },

  async completeCartItems(paymentId: string) {
    const supabase = createClientComponentClient()
    
    // Aggiorna lo stato di tutti gli elementi associati al pagamento
    const { data: items } = await supabase
      .from('cart_items')
      .update({ 
        status: 'completed'
      })
      .eq('payment_id', paymentId)
      .select()

    // Aggiorna lo stato dei contratti
    if (items) {
      for (const item of items) {
        await supabase
          .from('contracts')
          .update({ 
            status: 'pending_review',
            payment_status: 'paid',
            payment_date: new Date().toISOString()
          })
          .eq('id', item.contract_id)
      }
    }

    return items
  }
} 