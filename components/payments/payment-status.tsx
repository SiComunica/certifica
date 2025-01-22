'use client'

import { useState, useEffect } from 'react'
import { useToast } from "@/components/ui/use-toast"

interface Payment {
  id: string
  status: 'pending' | 'completed' | 'failed'
  amount: number
}

export function PaymentStatus({ paymentId }: { paymentId: string }) {
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Simuliamo il check dello stato
        const mockPayment: Payment = {
          id: paymentId,
          status: 'completed',
          amount: 99.99
        }
        setPayment(mockPayment)
        
        if (mockPayment.status === 'completed') {
          showToast("Pagamento completato con successo!", "success")
        } else if (mockPayment.status === 'failed') {
          showToast("Pagamento fallito", "error")
        }
      } catch (error) {
        showToast("Errore nel controllo dello stato", "error")
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [paymentId])

  if (loading) {
    return <div>Controllo stato pagamento...</div>
  }

  if (!payment) {
    return <div>Pagamento non trovato</div>
  }

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">
        Stato Pagamento
      </h2>
      
      <div className="space-y-2">
        <p>ID: {payment.id}</p>
        <p>Stato: {payment.status}</p>
        <p>Importo: €{payment.amount.toFixed(2)}</p>
      </div>
    </div>
  )
} 
