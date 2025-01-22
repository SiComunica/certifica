'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { CartItem, cartApi } from '@/lib/supabase/cart'
import { paymentsApi } from '@/lib/supabase/payments'

export function CartPayment() {
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      const cartItems = await cartApi.getCartItems()
      setItems(cartItems)
      setTotal(await cartApi.getTotalAmount())
    } catch (error) {
      showToast("Errore nel caricamento del carrello", "error")
    }
  }

  const handlePayment = async () => {
    if (items.length === 0) {
      showToast("Carrello vuoto", "error")
      return
    }

    setLoading(true)
    try {
      // Crea il pagamento per il totale
      const payment = await paymentsApi.create('CART', total)
      
      // Associa gli elementi del carrello al pagamento
      await cartApi.processPayment(payment.id)

      // Reindirizza al checkout di PagoPA
      window.location.href = payment.paymentUrl
    } catch (error) {
      showToast("Errore durante il pagamento", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">
        Riepilogo Ordine
      </h2>
      
      <div className="space-y-4">
        <div className="rounded-lg bg-muted p-4">
          <h3 className="text-lg font-semibold mb-2">Pratiche nel carrello</h3>
          {items.length === 0 ? (
            <p>Nessuna pratica nel carrello</p>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.contract_id} className="flex justify-between">
                  <span>{item.worker_name}</span>
                  <span>€ {item.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg bg-muted p-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Totale</span>
            <span>€ {total.toFixed(2)}</span>
          </div>
        </div>

        <Button 
          onClick={handlePayment} 
          className="w-full" 
          disabled={loading || items.length === 0}
        >
          {loading ? 'Elaborazione...' : 'Procedi al Pagamento'}
        </Button>
      </div>
    </div>
  )
} 